document.addEventListener("DOMContentLoaded", () => {
    const dciDays = document.getElementById("dciDays");
    const dciStatus = document.getElementById("dciStatus");
    const dciProgressText = document.getElementById("dciProgressText");
    const dciProgressBar = document.getElementById("dciProgressBar");
    const dciMonthLabel = document.getElementById("dciMonthLabel");
    const dciPrevMonth = document.getElementById("dciPrevMonth");
    const dciNextMonth = document.getElementById("dciNextMonth");
    const STORAGE_KEY = "dciCheckedDates_v1";

    // 28-day campaign cycle: Day 1 = 6 Oct 2026, Day 21 = 26 Oct 2026.
    // Change this date if the campaign start date changes.
    const CYCLE_START = new Date(2026, 9, 6);
    const CYCLE_LENGTH = 28;
    const rewardDays = new Set([7, 14, 21, 28]);
    const checkedDates = new Set(JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"));

    // One-time cleanup: the previous version incorrectly auto-marked every past date.
    // Those marks cannot be trusted as real check-ins, so clear this cycle once.
    const MIGRATION_KEY = "dci_28day_cycle_migrated_v1";
    if (!localStorage.getItem(MIGRATION_KEY)) {
        for (let i = 0; i < CYCLE_LENGTH; i++) {
            checkedDates.delete(dateKey(addDays(CYCLE_START, i)));
        }
        localStorage.setItem(MIGRATION_KEY, "1");
        localStorage.setItem(STORAGE_KEY, JSON.stringify([...checkedDates].sort()));
    }

    function malaysiaTodayKey() {
        const parts = new Intl.DateTimeFormat("en-CA", {
            timeZone: "Asia/Kuala_Lumpur", year: "numeric", month: "2-digit", day: "2-digit"
        }).formatToParts(new Date());
        const values = {};
        parts.forEach(part => { if (part.type !== "literal") values[part.type] = part.value; });
        return `${values.year}-${values.month}-${values.day}`;
    }

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

    function setStatus(message) {
        if (dciStatus) dciStatus.textContent = message;
    }

    // DEMO SCENARIO: Day 23 is today; Day 18 was missed.
    // Past checked days show a tick but are grayscale. Day 18 is red with no tick.
    // Day 23 stays unchecked on refresh so today's check-in is still pending.
    // Cycle starts 6 Oct 2026; Day 18 = 23 Oct; Day 23 = 28 Oct.
    const DEMO_MISSED_DAY = 18;
    const DEMO_TODAY_DAY = 23;
    const DEMO_TODAY_KEY = dateKey(addDays(CYCLE_START, DEMO_TODAY_DAY - 1));

    // Seed demo history: every past day is checked except missed Day 18.
    // Today's check-in remains empty every time the page refreshes.
    for (let day = 1; day < DEMO_TODAY_DAY; day++) {
        const key = dateKey(addDays(CYCLE_START, day - 1));
        if (day === DEMO_MISSED_DAY) {
            checkedDates.delete(key);
        } else {
            checkedDates.add(key);
        }
    }
    checkedDates.delete(DEMO_TODAY_KEY);
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...checkedDates].sort()));

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
        const cycleDates = Array.from({ length: CYCLE_LENGTH }, (_, i) => dateKey(addDays(CYCLE_START, i)));
        const completed = cycleDates.filter(key => checkedDates.has(key)).length;
        if (dciProgressText) dciProgressText.textContent = `${completed} / ${CYCLE_LENGTH} DAYS`;
        if (dciProgressBar) dciProgressBar.style.width = `${Math.min(completed / CYCLE_LENGTH * 100, 100)}%`;
    }

    function getOrdinalSuffix(day) {
        if (day % 100 >= 11 && day % 100 <= 13) return "th";
        switch (day % 10) { case 1: return "st"; case 2: return "nd"; case 3: return "rd"; default: return "th"; }
    }

    function renderCalendar() {
        dciDays.innerHTML = "";
        const cycleEnd = addDays(CYCLE_START, CYCLE_LENGTH - 1);
        if (dciMonthLabel) {
            dciMonthLabel.textContent = `${CYCLE_START.toLocaleDateString("en-MY", { day: "numeric", month: "short" })} – ${cycleEnd.toLocaleDateString("en-MY", { day: "numeric", month: "short", year: "numeric" })}`;
        }

        // Fixed demo date: Day 23 is shown as today, regardless of the computer date.
        const todayKey = DEMO_TODAY_KEY;

        for (let day = 1; day <= CYCLE_LENGTH; day++) {
            // Display the ordinal based on the campaign day (Day 1 = 1st, Day 2 = 2nd, etc.).
            const date = addDays(CYCLE_START, day - 1);
            const key = dateKey(date);
            const isChecked = checkedDates.has(key);
            const isPast = key < todayKey;
            const isToday = key === todayKey;
            const isFuture = key > todayKey;
            const isMissed = isPast && !isChecked;
            const isRewardDay = rewardDays.has(day);
            const button = document.createElement("button");

            button.type = "button";
            button.className = "dci-day";
            button.dataset.date = key;
            button.dataset.day = String(day);
            button.setAttribute("aria-label", `Day ${day}, ${date.toLocaleDateString("en-MY", { day: "numeric", month: "long", year: "numeric" })}`);

            if (isRewardDay && !isPast) button.classList.add("dci-reward");
            if (isPast) button.classList.add("dci-past");
            if (isMissed) button.classList.add("dci-missed");
            if (isChecked) button.classList.add("dci-checked");
            if (isFuture) button.classList.add("dci-locked");
            if (isToday) button.classList.add("dci-today");

            button.innerHTML = `
                <span class="dci-day-top">
                    <span class="dci-day-label">Day ${day}</span>
                    <span class="dci-day-date">${day}${getOrdinalSuffix(day)}</span>
                </span>
                <strong class="dci-day-number">+${day}</strong>
                <span class="dci-day-symbol">
                    ${isChecked ? '<span class="dci-check-mark">✓</span>' : '<span class="dci-empty-circle" aria-hidden="true"></span>'}
                </span>`;

            button.addEventListener("click", () => handleDateClick(key, day, button));
            dciDays.appendChild(button);
        }

        if (dciPrevMonth) dciPrevMonth.disabled = true;
        if (dciNextMonth) dciNextMonth.disabled = true;
        updateProgress();
    }

    function handleDateClick(key, day, button) {
        const todayKey = DEMO_TODAY_KEY;
        if (key < todayKey) {
            setStatus(checkedDates.has(key) ? `Day ${day} was already checked in.` : `Day ${day} was missed. Missed days stay red and cannot be checked in.`);
            return;
        }
        if (key > todayKey) {
            setStatus(`Day ${day} is not available yet. Please check in on the actual date.`);
            return;
        }
        if (checkedDates.has(key)) {
            setStatus(`You have already checked in for Day ${day}.`);
            return;
        }

        checkedDates.add(key);
        localStorage.setItem(STORAGE_KEY, JSON.stringify([...checkedDates].sort()));
        showPointsPopup(button, 1);
        renderCalendar();
        setStatus(`Check-in successful for Day ${day}! +1 POINT`);
    }

    renderCalendar();
    setStatus("Day 23 is today. Past checked days are grayscale; missed Day 18 stays red. Today's check-in resets on refresh (demo mode).");

    // Refresh the display at midnight without changing the 28-day campaign cycle.
    window.setInterval(renderCalendar, 60000);
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
