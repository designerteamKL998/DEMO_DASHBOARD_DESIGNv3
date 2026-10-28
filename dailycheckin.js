document.addEventListener("DOMContentLoaded", () => {
    const dciDays = document.getElementById("dciDays");
    const dciStatus = document.getElementById("dciStatus");
    const dciProgressText = document.getElementById("dciProgressText");
    const dciProgressBar = document.getElementById("dciProgressBar");
    const dciMonthLabel = document.getElementById("dciMonthLabel");
    const dciPrevMonth = document.getElementById("dciPrevMonth");
    const dciNextMonth = document.getElementById("dciNextMonth");

    const STORAGE_KEY = "dci_demo_1min_streak_v1";
    const CYCLE_START = new Date(2026, 9, 6); // Demo calendar: Day 1 = 6 Oct 2026
    const CYCLE_LENGTH = 28;
    const DEMO_INTERVAL_MS = 1 * 60 * 1000; // 1 minute per simulated day
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
        if (dciStatus) dciStatus.textContent = message;
    }
    function getOrdinalSuffix(day) {
        if (day % 100 >= 11 && day % 100 <= 13) return "th";
        switch (day % 10) {
            case 1: return "st";
            case 2: return "nd";
            case 3: return "rd";
            default: return "th";
        }
    }
    function loadState() {
        try {
            const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
            if (parsed && Array.isArray(parsed.checkedDays) && Number.isInteger(parsed.activeDay)) return parsed;
        } catch (error) {}
        // Demo begins with Day 1–4 checked and Day 5 ready to test.
        return { checkedDays: [1, 2, 3, 4], activeDay: 5, phase: "ready", nextUnlockAt: null, deadlineAt: null };
    }
    let state = loadState();
    function saveState() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }
    function resetToDayOne() {
        state = { checkedDays: [], activeDay: 1, phase: "ready", nextUnlockAt: null, deadlineAt: null };
        saveState();
        setStatus("You missed the 1-minute check-in window. Streak reset to Day 1 (+1).");
        renderCalendar();
    }
    function formatRemaining(ms) {
        const seconds = Math.max(0, Math.ceil(ms / 1000));
        const minutes = Math.floor(seconds / 60);
        return `${String(minutes).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
    }
    function syncTimerState() {
        const now = Date.now();

        // When the unlock time passes, open the next day and start its 1-minute
        // check-in window from the scheduled unlock time (not from the next render).
        // This prevents background-tab throttling from extending the deadline.
        if (state.phase === "waiting" && state.nextUnlockAt && now >= state.nextUnlockAt) {
            const unlockAt = state.nextUnlockAt;
            state.activeDay = Math.min(state.activeDay + 1, CYCLE_LENGTH);
            state.phase = "open";
            state.nextUnlockAt = null;
            state.deadlineAt = unlockAt + DEMO_INTERVAL_MS;
            saveState();
        }

        // Check the deadline independently, so if the browser was inactive for
        // longer than the allowed window, it resets immediately on the next render.
        if (state.phase === "open" && state.deadlineAt && now >= state.deadlineAt) {
            resetToDayOne();
        }
    }
    function showPointsPopup(dayElement, points) {
        if (!dayElement) return;
        if (!document.getElementById("dci-points-popup-style")) {
            const style = document.createElement("style");
            style.id = "dci-points-popup-style";
            style.textContent = `
                .dci-points-popup { position:fixed; z-index:999999; pointer-events:none; color:#FFD700; font-size:24px; font-weight:900; white-space:nowrap; text-shadow:0 2px 4px rgba(0,0,0,.8),0 0 14px rgba(255,215,0,.45); transform-origin:center; animation:dci-points-float 1.2s ease-out forwards; }
                @keyframes dci-points-float { 0%{opacity:0;transform:translate(-50%,10px) scale(.4)} 20%{opacity:1;transform:translate(-50%,0) scale(1.25)} 35%{opacity:1;transform:translate(-50%,-5px) scale(1)} 100%{opacity:0;transform:translate(-50%,-75px) scale(.85)} }
            `;
            document.head.appendChild(style);
        }
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
            const isPast = day < state.activeDay && !isChecked;
            const isFuture = day > state.activeDay;
            const isRewardDay = rewardDays.has(day);
            const button = document.createElement("button");
            button.type = "button";
            button.className = "dci-day";
            button.dataset.date = key;
            button.dataset.day = String(day);
            button.dataset.checkpoint = String(day);
            button.setAttribute("aria-label", `Day ${day}, checkpoint +${day}`);
            if (isRewardDay) button.classList.add("dci-reward");
            if (isPast) button.classList.add("dci-past");
            if (isChecked) button.classList.add("dci-checked");
            if (isFuture) button.classList.add("dci-locked");
            if (isActive) button.classList.add("dci-today");
            if (isActive && state.phase === "waiting") button.classList.add("dci-waiting");
            button.innerHTML = `
                <span class="dci-day-top"><span class="dci-day-label">Day ${day}</span><span class="dci-day-date">${day}${getOrdinalSuffix(day)}</span></span>
                <strong class="dci-day-number">+${day}</strong>
                <span class="dci-day-symbol">${isChecked ? '<span class="dci-check-mark">✓</span>' : '<span class="dci-empty-circle" aria-hidden="true"></span>'}</span>`;
            button.addEventListener("click", () => handleDateClick(day, button));
            dciDays.appendChild(button);
        });
        if (dciPrevMonth) dciPrevMonth.disabled = true;
        if (dciNextMonth) dciNextMonth.disabled = true;
        updateProgress();
        updateTimerStatus();
    }
    function updateTimerStatus() {
        if (state.phase === "waiting" && state.nextUnlockAt) {
            setStatus(`Check-in saved for Day ${state.activeDay}. Next day unlocks in ${formatRemaining(state.nextUnlockAt - Date.now())}.`);
        } else if (state.phase === "open" && state.deadlineAt) {
            setStatus(`Day ${state.activeDay} is available. Time left to check in: ${formatRemaining(state.deadlineAt - Date.now())}. If time runs out, streak resets to Day 1 (+1).`);
        } else if (state.activeDay === 5 && state.checkedDays.length === 4) {
            setStatus("Demo ready: Day 5 is available now. After check-in, the next day unlocks in 1 minute.");
        } else {
            setStatus(`Day ${state.activeDay} is available for check-in.`);
        }
    }
    function handleDateClick(day, button) {
        syncTimerState();
        if (day !== state.activeDay) {
            if (state.checkedDays.includes(day)) setStatus(`Day ${day} has already been checked in.`);
            else setStatus(`Only Day ${state.activeDay} is available right now.`);
            return;
        }
        if (state.phase === "waiting") {
            setStatus(`Please wait ${formatRemaining(state.nextUnlockAt - Date.now())} for Day ${Math.min(state.activeDay + 1, CYCLE_LENGTH)} to unlock.`);
            return;
        }
        if (state.checkedDays.includes(day)) {
            setStatus(`Day ${day} has already been checked in.`);
            return;
        }
        const checkpoint = day;
        state.checkedDays.push(day);
        state.checkedDays = [...new Set(state.checkedDays)].sort((a, b) => a - b);
        if (day >= CYCLE_LENGTH) {
            state.phase = "ready";
            state.nextUnlockAt = null;
            state.deadlineAt = null;
        } else {
            state.phase = "waiting";
            state.nextUnlockAt = Date.now() + DEMO_INTERVAL_MS;
            state.deadlineAt = null;
        }
        saveState();
        showPointsPopup(button, checkpoint);
        renderCalendar();
        if (day < CYCLE_LENGTH) setStatus(`Check-in successful! Popup +${checkpoint}. Day ${day + 1} unlocks in 01:00.`);
        else setStatus("Congratulations! You completed all 28 demo check-ins.");
    }

    // Initialize demo timer state. Existing test data is retained; remove the key below to restart Day 5.
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
