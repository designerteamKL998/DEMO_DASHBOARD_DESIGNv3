document.addEventListener("DOMContentLoaded", () => {
    const dciDays = document.getElementById("dciDays");
    const dciStatus = document.getElementById("dciStatus");
    const dciMonthLabel = document.getElementById("dciMonthLabel");
    const dciPrevMonth = document.getElementById("dciPrevMonth");
    const dciNextMonth = document.getElementById("dciNextMonth");
    const treasureWrap = document.querySelector(".dci-treasure-wrap");

    // Test tools are enabled only when the URL includes ?dciTest=1.
    // Normal visitors always use the real local calendar.
    const TEST_MODE = new URLSearchParams(window.location.search).get("dciTest") === "1";
    const STORAGE_KEY = TEST_MODE ? "dci_daily_streak_treasure_test_v2" : "dci_daily_streak_treasure_v4";
    const TEST_DATE_KEY = "dci_daily_streak_test_date_v2";
    const CYCLE_LENGTH = 28;
    const CHECKPOINTS = [7, 14, 21, 28];
    const CHECKPOINT_REWARDS = { 7: 20, 14: 60, 21: 70, 28: 100 };

    // Missed-day appearance: replace the grayscale look with a red missed state.
    const missedStyle = document.createElement("style");
    missedStyle.textContent = `
        .dci-day.dci-missed {
            filter: none !important;
            -webkit-filter: none !important;
            opacity: 1 !important;
            border: 2px solid #ff3b45 !important;
            background: linear-gradient(145deg, rgba(255, 59, 69, .24), rgba(120, 12, 22, .28)) !important;
            box-shadow: inset 0 0 0 1px rgba(255, 59, 69, .28), 0 0 10px rgba(255, 59, 69, .22) !important;
        }
        .dci-day.dci-missed .dci-missed-cross {
            color: #ff3b45 !important;
            opacity: 1 !important;
            filter: none !important;
            -webkit-filter: none !important;
        }
        .dci-day.dci-missed .dci-day-label,
        .dci-day.dci-missed .dci-day-number,
        .dci-day.dci-missed * {
            color: #ff3b45 !important;
            opacity: 1 !important;
            filter: none !important;
            -webkit-filter: none !important;
        }
        .dci-day.dci-missed .dci-missed-cross {
            color: #ff3b45 !important;
            font-weight: 900 !important;
            font-size: 30px !important;
            opacity: 1 !important;
            filter: none !important;
        }
    `;
    document.head.appendChild(missedStyle);

    function dateKey(date) {
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    }

    function parseKey(key) {
        const [year, month, day] = key.split("-").map(Number);
        return new Date(year, month - 1, day);
    }

    function addDays(date, amount) {
        const result = new Date(date);
        result.setDate(result.getDate() + amount);
        return result;
    }

    function dayDifference(from, to) {
        const a = new Date(from.getFullYear(), from.getMonth(), from.getDate());
        const b = new Date(to.getFullYear(), to.getMonth(), to.getDate());
        return Math.round((b - a) / 86400000);
    }

    function todayDate() {
        if (TEST_MODE) {
            const savedTestDate = localStorage.getItem(TEST_DATE_KEY);
            if (savedTestDate) return parseKey(savedTestDate);
        }

        const now = new Date();
        return new Date(now.getFullYear(), now.getMonth(), now.getDate());
    }

    function setStatus(message) {
        if (dciStatus) dciStatus.textContent = message;
    }

    function advanceTestDate({ missed = false } = {}) {
        if (!TEST_MODE) return;
        const currentDate = todayDate();
        const currentKey = dateKey(currentDate);
        const nextDate = addDays(currentDate, 1);

        if (missed && !state.checkedDates.includes(currentKey)) {
            // Simulate a missed day without removing earned check-ins or treasure progress.
            // The missed calendar tile stays visible with a red X and red highlight.
            const missedDay = currentCycleDay();
            if (!state.missedDates.includes(currentKey)) state.missedDates.push(currentKey);
            localStorage.setItem(TEST_DATE_KEY, dateKey(nextDate));
            saveState();
            renderCalendar();
            setStatus(`Test result: Day ${missedDay} was missed. Your ${state.checkedDates.length} successful check-ins and treasure progress are preserved. Continue with Day ${missedDay + 1}.`);
            return;
        }

        if (!state.checkedDates.includes(currentKey)) {
            setStatus("This day has not been checked in. Use ‘Simulate missed check-in’ to test the streak reset, or check in first to advance.");
            return;
        }
        localStorage.setItem(TEST_DATE_KEY, dateKey(nextDate));
        renderCalendar();
        setStatus("Test day advanced. You can now check in for the next day.");
    }

    function resetTestDemo() {
        if (!TEST_MODE) return;
        const start = new Date();
        const today = new Date(start.getFullYear(), start.getMonth(), start.getDate());
        localStorage.setItem(TEST_DATE_KEY, dateKey(today));
        state = freshState(today);
        saveState();
        renderCalendar();
        setStatus("Demo reset. You are back at Day 1.");
    }

    function buildTestPanel() {
        if (!TEST_MODE || document.getElementById("dciTestPanel")) return;
        const panel = document.createElement("div");
        panel.id = "dciTestPanel";
        panel.className = "dci-test-panel";
        panel.innerHTML = `
            <div class="dci-test-panel-heading"><strong>Boss Testing Tools</strong><span>Visible only with ?dciTest=1</span></div>
            <div class="dci-test-panel-actions">
                <button type="button" data-test-action="advance">Advance to next day</button>
                <button type="button" data-test-action="miss">Simulate missed check-in</button>
                <button type="button" data-test-action="reset">Reset demo</button>
            </div>
        `;
        const status = dciStatus?.closest(".dci-status") || dciStatus?.parentElement;
        const anchor = status?.closest(".dci-calendar-footer") || dciDays?.parentElement;
        if (anchor?.parentElement) anchor.insertAdjacentElement("afterend", panel);
        panel.addEventListener("click", event => {
            const action = event.target.closest("button")?.dataset.testAction;
            if (action === "advance") advanceTestDate();
            if (action === "miss") advanceTestDate({ missed: true });
            if (action === "reset") resetTestDemo();
        });
    }

    function freshState(startDate = todayDate()) {
        return {
            cycleStart: dateKey(startDate),
            checkedDates: [],
            missedDates: [],
            streak: 0,
            streakStart: null,
            completedMilestones: [],
            failedMilestones: []
        };
    }

    function loadState() {
        try {
            const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
            if (saved && saved.cycleStart && Array.isArray(saved.checkedDates)) {
                saved.missedDates = Array.isArray(saved.missedDates) ? saved.missedDates : [];
                saved.completedMilestones = Array.isArray(saved.completedMilestones) ? saved.completedMilestones : [];
                saved.failedMilestones = Array.isArray(saved.failedMilestones) ? saved.failedMilestones : [];
                saved.streak = Number(saved.streak) || 0;
                saved.streakStart = saved.streakStart || null;
                return saved;
            }
        } catch (error) {}
        return freshState();
    }

    let state = loadState();

    function saveState() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }

    function cycleStartDate() {
        return parseKey(state.cycleStart);
    }

    function currentCycleDay() {
        return dayDifference(cycleStartDate(), todayDate()) + 1;
    }

    // Missed days do not reduce earned check-ins or treasure progress.
    // Progress is based on the total number of successful check-ins in this cycle.
    function syncMissedDays() {
        const today = todayDate();
        let cycleDay = dayDifference(cycleStartDate(), today) + 1;

        if (cycleDay > CYCLE_LENGTH) {
            const nextStart = addDays(cycleStartDate(), CYCLE_LENGTH);
            state = freshState(nextStart);
            cycleDay = 1;
        }

        if (cycleDay < 1) {
            state = freshState(today);
            cycleDay = 1;
        }

        for (let i = 1; i < cycleDay; i++) {
            const key = dateKey(addDays(cycleStartDate(), i - 1));
            if (!state.checkedDates.includes(key) && !state.missedDates.includes(key)) {
                state.missedDates.push(key);
            }
        }

        saveState();
        return cycleDay;
    }

    function buildTreasureBar() {
        if (!treasureWrap) return;
        treasureWrap.innerHTML = `
            <div class="dci-checkin-notice" role="status" aria-live="polite">
                <span class="dci-checkin-notice-icon" aria-hidden="true"><i class="fa-solid fa-check"></i></span>
                <div class="dci-checkin-notice-copy">
                    <span class="dci-checkin-notice-title">Check-in Successful!</span>
                    <span class="dci-checkin-notice-message">Your check-in has been recorded. Keep going to unlock your next reward.</span>
                </div>
            </div>
            <div class="dci-treasure-track">
                <div class="dci-treasure-line">
                    <span class="dci-treasure-fill"></span>
                </div>
                ${CHECKPOINTS.map((day, index) => `
                    <div class="dci-treasure-stop treasure-stop-${day} chest-${index + 1}"
                         data-checkpoint="${day}"
                         style="--treasure-point:${8 + (index + 1) * 21}%">
                        <div class="dci-treasure-chest chest-${index + 1}" aria-hidden="true">
                            <img
                                class="dci-treasure-chest-img"
                                src="${[
                                    'imgs/checkin/7.png',
                                    'imgs/checkin/14.png',
                                    'imgs/checkin/21.png',
                                    'imgs/checkin/28.png'
                                ][index]}"
                                alt=""
                                draggable="false"
                                style="display:block;width:100%;height:100%;object-fit:contain;"
                            />
                        </div>
                        <span class="dci-treasure-checkpoint">${day}</span>
                        <span class="dci-treasure-reward">MYR${CHECKPOINT_REWARDS[day]}</span>
                        <span class="dci-treasure-state" aria-hidden="true"></span>
                    </div>
                `).join("")}
            </div>`;
    }

    function showCheckinNotice(reachedCheckpoint = null) {
        if (!treasureWrap) return;
        const notice = treasureWrap.querySelector(".dci-checkin-notice");
        if (!notice) return;

        const message = notice.querySelector(".dci-checkin-notice-message");
        const rewardMessages = {
            7: "Congratulations! You've reached Day 7 and unlocked a MYR 20 reward.",
            14: "Congratulations! You've reached Day 14 and unlocked a MYR 60 reward.",
            21: "Congratulations! You've reached Day 21 and unlocked a MYR 70 reward.",
            28: "Congratulations! You've reached Day 28 and unlocked the grand reward of MYR 100."
        };

        if (message) {
            message.textContent = rewardMessages[reachedCheckpoint]
                || "Great job! Your check-in has been recorded. Keep going to unlock your next reward.";
        }

        notice.classList.add("is-visible");
        if (notice._hideTimer) window.clearTimeout(notice._hideTimer);
        notice._hideTimer = window.setTimeout(() => {
            notice.classList.remove("is-visible");
        }, 5000);
    }

    function updateTreasureBar() {
        if (!treasureWrap) return;
        const fill = treasureWrap.querySelector(".dci-treasure-fill");
        const totalCheckIns = state.checkedDates.length;
        const progress = Math.min(totalCheckIns / CYCLE_LENGTH, 1) * 100;
        if (fill) fill.style.width = `${progress}%`;

        treasureWrap.querySelectorAll(".dci-treasure-stop").forEach(stop => {
            const checkpoint = Number(stop.dataset.checkpoint);
            const done = state.completedMilestones.includes(checkpoint);
            const failed = state.failedMilestones.includes(checkpoint);
            stop.classList.toggle("is-complete", done);
            // A missed day never fails a reward checkpoint; progress remains earned.
            stop.classList.toggle("is-failed", false);
            stop.classList.toggle("is-next", !done && totalCheckIns > 0);
            const icon = stop.querySelector(".dci-treasure-state");
            if (icon) icon.textContent = done ? "✓" : (!done && failed ? "×" : "");
            stop.setAttribute("aria-label", `Day ${checkpoint}: ${done ? "reward unlocked" : "not yet reached"}`);
        });
    }

    function showPointsPopup(dayElement) {
        if (!dayElement) return;
        const rect = dayElement.getBoundingClientRect();
        const popup = document.createElement("div");
        popup.className = "dci-points-popup";
        popup.textContent = "+1";
        popup.style.left = `${rect.left + rect.width / 2}px`;
        popup.style.top = `${rect.top + rect.height / 2}px`;
        document.body.appendChild(popup);
        popup.addEventListener("animationend", () => popup.remove(), { once: true });
        window.setTimeout(() => popup.remove(), 1500);
    }

    function updateStatus(cycleDay) {
        const todayKey = dateKey(todayDate());
        if (state.checkedDates.includes(todayKey)) {
            setStatus(`Day ${cycleDay} checked in successfully. Total check-ins: ${state.checkedDates.length}.`);
        } else if (state.missedDates.length) {
            setStatus(`Day ${cycleDay} is available. Your progress is saved (${state.checkedDates.length} check-ins). Check in to continue earning rewards.`);
        } else {
            setStatus(`Day ${cycleDay} is available for check-in. Check in once today to earn +1.`);
        }
    }

    function renderCalendar() {
        if (!dciDays) return;
        const cycleDay = syncMissedDays();
        dciDays.innerHTML = "";

        const start = cycleStartDate();
        const end = addDays(start, CYCLE_LENGTH - 1);

        if (dciMonthLabel) {
            dciMonthLabel.textContent = `${start.toLocaleDateString("en-MY", { day: "numeric", month: "short" })} – ${end.toLocaleDateString("en-MY", { day: "numeric", month: "short", year: "numeric" })}`;
        }

        for (let index = 0; index < CYCLE_LENGTH; index++) {
            const day = index + 1;
            const date = addDays(start, index);
            const key = dateKey(date);
            const isChecked = state.checkedDates.includes(key);
            const isMissed = state.missedDates.includes(key);
            const isToday = key === dateKey(todayDate());
            const isFuture = day > cycleDay;

            const button = document.createElement("button");
            button.type = "button";
            button.className = "dci-day";
            button.dataset.date = key;
            button.dataset.day = String(day);
            button.setAttribute("aria-label", `Day ${day}${isChecked ? ", checked in" : isMissed ? ", missed" : ""}`);

            if (isChecked) button.classList.add("dci-checked");
            if (isMissed) button.classList.add("dci-missed");
            if (isToday) button.classList.add("dci-today");
            if (isFuture) button.classList.add("dci-locked");

            button.innerHTML = `
                <span class="dci-day-top"><span class="dci-day-label">Day</span></span>
${isChecked ? '<img class="dci-checked-tick" src="imgs/checkin/RIGHTCLICK.png" alt="" aria-hidden="true" />' : ""}
${isMissed ? '<img class="dci-missed-cross" src="imgs/checkin/MISSEDCLICK.png" alt="" aria-hidden="true" />' : ""}
                <strong class="dci-day-number">${day}</strong>`;

            if (isToday && !isChecked) {
                button.addEventListener("click", () => handleCheckIn(button, cycleDay));
            } else {
                button.addEventListener("click", () => {
                    if (isChecked) setStatus(`Day ${day} has already been checked in.`);
                    else if (isMissed) setStatus(`Day ${day} was missed. Continue your new streak from today.`);
                    else setStatus("Future check-in days are locked.");
                });
            }

            dciDays.appendChild(button);
        }

        if (dciPrevMonth) dciPrevMonth.disabled = true;
        if (dciNextMonth) dciNextMonth.disabled = true;

        updateTreasureBar();
        updateStatus(cycleDay);
    }

    function getNextRewardText() {
        const nextCheckpoint = CHECKPOINTS.find(point => point > state.checkedDates.length);
        if (!nextCheckpoint) return "all rewards unlocked";
        return `MYR${CHECKPOINT_REWARDS[nextCheckpoint]} at ${nextCheckpoint} check-ins`;
    }

    function handleCheckIn(button, cycleDay) {
        const todayKey = dateKey(todayDate());
        if (state.checkedDates.includes(todayKey)) {
            setStatus("You have already checked in today.");
            return;
        }

        // Count every successful check-in, even if one or more days were missed.
        state.streak = state.checkedDates.length + 1;
        if (!state.streakStart) state.streakStart = todayKey;
        state.checkedDates.push(todayKey);

        CHECKPOINTS.forEach(point => {
            if (state.streak >= point) {
                if (!state.completedMilestones.includes(point)) state.completedMilestones.push(point);
                state.failedMilestones = state.failedMilestones.filter(item => item !== point);
            }
        });

        state.completedMilestones.sort((a, b) => a - b);
        state.failedMilestones.sort((a, b) => a - b);
        saveState();

        const reached = CHECKPOINTS.find(point => point === state.checkedDates.length);

        showPointsPopup(button);
        showCheckinNotice(reached);
        renderCalendar();

        if (reached) {
            const reward = CHECKPOINT_REWARDS[reached];
            setStatus(`Check-in successful! ${reached} successful check-ins reached — MYR${reward} reward unlocked!`);
        } else {
            setStatus(`Check-in successful! +1. Total check-ins: ${state.checkedDates.length}. Next reward: ${getNextRewardText()}.`);
        }
    }

    buildTreasureBar();
    buildTestPanel();
    renderCalendar();

    // Refresh at the next local date and when the tab becomes active.
    window.setInterval(renderCalendar, 60000);
    document.addEventListener("visibilitychange", () => {
        if (!document.hidden) renderCalendar();
    });
    window.addEventListener("focus", renderCalendar);
});


document.addEventListener("DOMContentLoaded", () => {

    const langButtons = document.querySelectorAll(".dci-lang");
    const langContents = document.querySelectorAll(".dci-lang-content");

    langButtons.forEach(button => {

        button.addEventListener("click", () => {

            const selectedLang = button.dataset.lang;

            /* Remove active from buttons */
            langButtons.forEach(btn => {
                btn.classList.remove("active");
            });

            /* Activate selected button */
            button.classList.add("active");


            /* Hide all content */
            langContents.forEach(content => {
                content.classList.remove("active");
            });


            /* Show selected language */
            const selectedContent =
                document.querySelector(
                    `.dci-lang-content[data-content="${selectedLang}"]`
                );

            if (selectedContent) {
                selectedContent.classList.add("active");
            }

        });

    });

});

// Daily Check-in Terms & Conditions popup
document.addEventListener("DOMContentLoaded", () => {
    const openButton = document.getElementById("dciTncOpen");
    const closeButton = document.getElementById("dciTncClose");
    const overlay = document.getElementById("dciTncOverlay");
    if (!openButton || !closeButton || !overlay) return;

    const openTnc = () => {
        overlay.classList.add("is-open");
        overlay.setAttribute("aria-hidden", "false");
        document.body.classList.add("dci-tnc-open");
        closeButton.focus();
    };
    const closeTnc = () => {
        overlay.classList.remove("is-open");
        overlay.setAttribute("aria-hidden", "true");
        document.body.classList.remove("dci-tnc-open");
        openButton.focus();
    };

    openButton.addEventListener("click", openTnc);
    closeButton.addEventListener("click", closeTnc);
    overlay.addEventListener("click", event => {
        if (event.target === overlay) closeTnc();
    });
    document.addEventListener("keydown", event => {
        if (event.key === "Escape" && overlay.classList.contains("is-open")) closeTnc();
    });
});
