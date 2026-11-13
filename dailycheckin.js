document.addEventListener("DOMContentLoaded", () => {
    const dciDays = document.getElementById("dciDays");
    const dciStatuses = document.querySelectorAll("#dciStatus");
    const dciProgressText = document.getElementById("dciProgressText");
    const dciProgressBar = document.getElementById("dciProgressBar");
    const dciMonthLabel = document.getElementById("dciMonthLabel");
    const dciPrevMonth = document.getElementById("dciPrevMonth");
    const dciNextMonth = document.getElementById("dciNextMonth");

    const STORAGE_KEY = "dci_10sec_streak_with_tick_v4";
    const CYCLE_START = new Date(2026, 9, 6); // Demo calendar: Day 1 = 6 Oct 2026
    const CYCLE_LENGTH = 28;
    const rewardDays = new Set([7, 14, 21, 28]);

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
    function getCycleDates() {
        return Array.from({ length: CYCLE_LENGTH }, (_, i) => dateKey(addDays(CYCLE_START, i)));
    }
    function setStatus(message) {
        dciStatuses.forEach(element => { element.textContent = message; });
    }
    function loadState() {
        try {
            const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
            if (parsed && Array.isArray(parsed.checkedDays) && Number.isInteger(parsed.activeDay)) return parsed;
        } catch (error) {}
        // Start a fresh 10-second demo cycle from Day 1.
        return { checkedDays: [], claimedRewards: [], activeDay: 1, phase: "ready", nextUnlockAt: null, deadlineAt: null, missedDay: null, pendingRestart: false, showResetNotice: false };
    }
    let state = loadState();
    state.phase = state.phase || "ready";
    state.nextUnlockAt = state.nextUnlockAt || null;
    state.deadlineAt = state.deadlineAt || null;
    state.missedDay = Number.isInteger(state.missedDay) ? state.missedDay : null;
    state.pendingRestart = state.pendingRestart === true;
    state.showResetNotice = false;
    state.highlightDayOne = state.highlightDayOne === true || (state.activeDay === 1 && state.checkedDays.length === 0 && Number.isInteger(state.missedDay));
    state.claimedRewards = Array.isArray(state.claimedRewards)
        ? state.claimedRewards
        : state.checkedDays.filter(day => rewardDays.has(day));
    function saveState() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }

    // Prominent status panel: shows the active check-in deadline and the last missed day.
    let resetNotice = document.getElementById("dci-reset-warning");
    if (!resetNotice && dciDays) {
        resetNotice = document.createElement("div");
        resetNotice.id = "dci-reset-warning";
        resetNotice.className = "dci-reset-warning";
        resetNotice.setAttribute("role", "status");
        resetNotice.setAttribute("aria-live", "polite");
        dciDays.insertAdjacentElement("beforebegin", resetNotice);
    }

    function updateResetNotice() {
        if (!resetNotice) return;
        resetNotice.classList.remove("is-visible", "is-countdown", "is-missed");

        if (state.phase === "open" && state.deadlineAt) {
            resetNotice.classList.add("is-visible", "is-countdown");
            resetNotice.innerHTML = `
                <i class="fa-solid fa-triangle-exclamation" aria-hidden="true"></i>
                <div class="dci-reset-warning-copy">
                    <strong>CHECK IN NOW — DAY ${state.activeDay}</strong>
                    <p>You must complete this check-in before the timer reaches zero. Otherwise, your streak will automatically reset to Day 1.</p>
                    <span class="dci-reset-countdown">AUTO RESET IN <b>${formatRemaining(state.deadlineAt - Date.now())}</b></span>
                </div>`;
        } else if (state.missedDay) {
            resetNotice.classList.add("is-visible", "is-missed");
            resetNotice.innerHTML = `
                <i class="fa-solid fa-circle-xmark" aria-hidden="true"></i>
                <div class="dci-reset-warning-copy">
                    <strong>YOU MISSED DAY ${state.missedDay}!</strong>
                    <p>Your cycle has automatically reset. Your previous check-in marks will remain until you press RESET.</p>
                    <button type="button" class="dci-reset-action" id="dci-reset-action">RESET</button>
                </div>`;
            const resetButton = resetNotice.querySelector("#dci-reset-action");
            if (resetButton) resetButton.addEventListener("click", handleResetButtonClick);
        }
    }

    function handleResetButtonClick() {
        if (!state.pendingRestart) return;
        // The reset button acknowledges the reset and clears the previous cycle's marks.
        // Day 1 becomes available only after this explicit action; it is not checked in yet.
        state.checkedDays = [];
        state.claimedRewards = [];
        state.activeDay = 1;
        state.phase = "ready";
        state.nextUnlockAt = null;
        state.deadlineAt = null;
        state.missedDay = null;
        state.pendingRestart = false;
        state.highlightDayOne = true;
        saveState();
        renderCalendar();
        setStatus("Your new cycle is ready. Click Day 1 to check in.");
    }

    function resetToDayOne(missedDay) {
        // Reset the cycle immediately, but preserve the previous cycle's visual history
        // until the player presses the RESET button.
        state = {
            ...state,
            activeDay: 1,
            phase: "ready",
            nextUnlockAt: null,
            deadlineAt: null,
            missedDay: Number.isInteger(missedDay) ? missedDay : state.missedDay,
            pendingRestart: true,
            highlightDayOne: true
        };
        saveState();
        renderCalendar();
        setStatus(state.missedDay
            ? `You missed Day ${state.missedDay}. Your cycle has reset automatically. Press RESET to clear the previous marks.`
            : "Your cycle has reset automatically. Press RESET to begin again.");
    }
    function formatRemaining(ms) {
        const seconds = Math.max(0, Math.ceil(ms / 1000));
        const minutes = Math.floor(seconds / 60);
        return `${String(minutes).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
    }
    function syncTimerState() {
        const now = Date.now();
        if (state.phase === "waiting" && state.nextUnlockAt && now >= state.nextUnlockAt) {
            const unlockAt = state.nextUnlockAt;
            state.activeDay = Math.min(state.activeDay + 1, CYCLE_LENGTH);
            state.phase = "open";
            state.nextUnlockAt = null;
            state.deadlineAt = unlockAt + 10 * 1000;
            saveState();
        }
        if (state.phase === "open" && state.deadlineAt && now >= state.deadlineAt) {
            resetToDayOne(state.activeDay);
        }
    }

    function showPointsPopup(dayElement, points) {
        if (!dayElement) return;
        const rect = dayElement.getBoundingClientRect();
        const popup = document.createElement("div");
        popup.className = "dci-points-popup";
        popup.textContent = `+${points}`;
        popup.style.left = `${rect.left + rect.width / 2}px`;
        popup.style.top = `${rect.top + rect.height / 2}px`;
        document.body.appendChild(popup);
        popup.addEventListener("animationend", () => popup.remove(), { once: true });
        window.setTimeout(() => popup.remove(), 1800);
    }
    function updateProgress() {
        const completed = state.checkedDays.length;
        if (dciProgressText) dciProgressText.textContent = `${completed} / ${CYCLE_LENGTH} DAYS`;
        if (dciProgressBar) dciProgressBar.style.width = `${Math.min(completed / CYCLE_LENGTH * 100, 100)}%`;
    }
    function updateRewardClaims() {
        document.querySelectorAll(".dci-reward-item[data-reward-day]").forEach(item => {
            const rewardDay = Number(item.dataset.rewardDay);
            const claimButton = item.querySelector(".dci-reward-claim");
            if (!claimButton) return;

            const isClaimed = (state.claimedRewards || []).includes(rewardDay);
            claimButton.hidden = !isClaimed;
            claimButton.disabled = true;
            claimButton.textContent = isClaimed ? "CLAIMED" : "";
            item.classList.toggle("is-claimed", isClaimed);
        });
    }

    function renderCalendar() {
        if (!dciDays) return;
        syncTimerState();
        dciDays.innerHTML = "";
        const cycleDates = getCycleDates();
        const cycleEnd = addDays(CYCLE_START, CYCLE_LENGTH - 1);
        if (dciMonthLabel) {
            dciMonthLabel.textContent = `${CYCLE_START.toLocaleDateString("en-MY", { day: "numeric", month: "short" })} – ${cycleEnd.toLocaleDateString("en-MY", { day: "numeric", month: "short", year: "numeric" })}`;
        }
        cycleDates.forEach((key, index) => {
            const day = index + 1;
            const date = parseKey(key);
            const isChecked = state.checkedDays.includes(day);
            const isActive = day === state.activeDay;
            const isPast = day < state.activeDay && !isChecked && day !== state.missedDay;
            const isMissed = day === state.missedDay && !isChecked;
            const isFuture = day > state.activeDay;
            const isRewardDay = rewardDays.has(day);
            const button = document.createElement("button");
            button.type = "button";
            button.className = "dci-day";
            button.dataset.date = key;
            button.dataset.day = String(day);
            button.dataset.checkpoint = String(day);
            button.setAttribute("aria-label", isMissed ? `Day ${day}, missed check-in` : (isChecked ? `Day ${day}, completed check-in` : `Day ${day}, available check-in`));
            button.dataset.status = isMissed ? "missed" : (isChecked ? "completed" : (isPast ? "missed" : (isFuture ? "locked" : "available")));
            if (isRewardDay) button.classList.add("dci-reward");
            if (isPast) button.classList.add("dci-past");
            if (isMissed) button.classList.add("dci-missed");
            if (isChecked) button.classList.add("dci-checked");
            if (isFuture) button.classList.add("dci-locked");
            if (isActive) button.classList.add("dci-today");
            if (isActive && !isChecked && state.phase !== "waiting" && !state.pendingRestart) {
                button.classList.add("dci-checkin-open");
            }
            if (state.pendingRestart) button.disabled = true;
            // Keep the previous calendar history visible until RESET is pressed.
            if (day === 1 && state.highlightDayOne === true && !state.pendingRestart) {
                button.classList.add("dci-reset-day-one");
                button.setAttribute("aria-label", "Day 1, available for a new check-in.");
            }
            button.innerHTML = `
                <span class="dci-day-top"><span class="dci-day-label">Day</span></span>
                ${isChecked ? '<img class="dci-checked-tick" src="imgs/checkin/RIGHTCLICK.png" alt="Completed" aria-hidden="true" />' : (isMissed ? '<img class="dci-missed-tick" src="imgs/checkin/MISSEDCLICK.png" alt="Missed" aria-hidden="true" />' : '')}
                <strong class="dci-day-number">${day}</strong>`;
            button.addEventListener("click", () => handleDateClick(day, button));
            dciDays.appendChild(button);
        });
        if (dciPrevMonth) dciPrevMonth.disabled = true;
        if (dciNextMonth) dciNextMonth.disabled = true;
        updateProgress();
        updateRewardClaims();
        updateTimerStatus();
        updateResetNotice();
    }
    function updateTimerStatus() {
        if (state.checkedDays.length >= CYCLE_LENGTH) {
            setStatus("Congratulations! You completed all 28 check-ins.");
        } else if (state.phase === "waiting" && state.nextUnlockAt) {
            setStatus(`Check-in saved for Day ${state.activeDay}. Next day unlocks in ${formatRemaining(state.nextUnlockAt - Date.now())}.`);
        } else if (state.phase === "open" && state.deadlineAt) {
            setStatus(`Day ${state.activeDay} is available. Check in within ${formatRemaining(state.deadlineAt - Date.now())} or your streak automatically resets to Day 1.`);
        } else if (state.pendingRestart) {
            setStatus(`Previous cycle retained: ${state.missedDay ? `Day ${state.missedDay} was missed. ` : ""}Press RESET to clear the previous marks.`);
        } else if (state.missedDay) {
            setStatus(`Previous cycle: Day ${state.missedDay} was missed. Day ${state.activeDay} is available now.`);
        } else {
            setStatus(`Day ${state.activeDay} is available for check-in.`);
        }
    }
    function handleDateClick(day, button) {
        syncTimerState();
        // Players must press RESET before any calendar day becomes clickable again.
        if (state.pendingRestart) {
            setStatus("Please press RESET to clear the previous cycle before checking in again.");
            return;
        }
        if (day !== state.activeDay) {
            if (state.checkedDays.includes(day)) setStatus(`Day ${day} has already been checked in.`);
            else setStatus(`Only Day ${state.activeDay} is available right now.`);
            return;
        }
        if (state.phase === "waiting" && state.nextUnlockAt) {
            setStatus(`Please wait ${formatRemaining(state.nextUnlockAt - Date.now())} for Day ${Math.min(state.activeDay + 1, CYCLE_LENGTH)} to unlock.`);
            return;
        }
        if (state.checkedDays.includes(day)) {
            setStatus(`Day ${day} has already been checked in.`);
            return;
        }
        const checkpoint = day;
        // Once the player starts the new cycle, the previous missed-day notice is archived/cleared.
        state.missedDay = null;
        if (day === 1) state.highlightDayOne = false;
        state.checkedDays.push(day);
        state.checkedDays = [...new Set(state.checkedDays)].sort((a, b) => a - b);
        if (rewardDays.has(day)) {
            state.claimedRewards = [...new Set([...(state.claimedRewards || []), day])].sort((a, b) => a - b);
        }
        if (day < CYCLE_LENGTH) {
            state.phase = "waiting";
            state.nextUnlockAt = Date.now() + 10 * 1000;
            state.deadlineAt = null;
        } else {
            state.phase = "ready";
            state.nextUnlockAt = null;
            state.deadlineAt = null;
        }
        saveState();
        showPointsPopup(button, checkpoint);
        renderCalendar();
        if (day < CYCLE_LENGTH) setStatus(`Check-in successful! +${checkpoint}. Day ${day + 1} unlocks in 00:10.`);
        else setStatus("Congratulations! You completed all 28 check-ins.");
    }

    // Initialize and keep the 10-second unlock / check-in timer running.
    saveState();
    renderCalendar();
    window.setInterval(renderCalendar, 1000);
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