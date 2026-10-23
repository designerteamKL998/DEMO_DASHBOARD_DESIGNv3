document.addEventListener("DOMContentLoaded", () => {
    const dciDays = document.getElementById("dciDays");
    const dciStatus = document.getElementById("dciStatus");
    const dciProgressText = document.getElementById("dciProgressText");
    const dciProgressBar = document.getElementById("dciProgressBar");
    const dciMonthLabel = document.getElementById("dciMonthLabel");
    const dciPrevMonth = document.getElementById("dciPrevMonth");
    const dciNextMonth = document.getElementById("dciNextMonth");
const STORAGE_KEY = "dciCheckedDates_v1";
    const checkedDates = new Set(
        JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]")
    );

    // AUTO-MARK all past dates in the current year as checked.
    // This is stored in this browser's localStorage.
    function autoMarkPastDates() {
        const todayKey = malaysiaTodayKey();
        const currentYear = Number(todayKey.slice(0, 4));
        const today = new Date(
            currentYear,
            Number(todayKey.slice(5, 7)) - 1,
            Number(todayKey.slice(8, 10))
        );

        for (let date = new Date(currentYear, 0, 1); date < today; date.setDate(date.getDate() + 1)) {
            checkedDates.add(dateKey(date.getFullYear(), date.getMonth(), date.getDate()));
        }

        localStorage.setItem(STORAGE_KEY, JSON.stringify([...checkedDates].sort()));
    }

    autoMarkPastDates();

    const icons = [
        "imgs/checkin/coinch.png",
        "imgs/checkin/diamondch.png",
        "imgs/checkin/ticketch.png",
        "imgs/checkin/heartcs.png",
        "imgs/checkin/coinchs.png",
        "imgs/checkin/diamondchs.png",
        "imgs/checkin/giftch.png"
    ];

    const rewardDays = new Set([7, 14, 21, 28]);
    const now = new Date();
    let viewYear = now.getFullYear();
    let viewMonth = now.getMonth(); // 0-based
    let selectedDateKey = null;

    function malaysiaTodayKey() {
        const parts = new Intl.DateTimeFormat("en-CA", {
            timeZone: "Asia/Kuala_Lumpur",
            year: "numeric",
            month: "2-digit",
            day: "2-digit"
        }).formatToParts(new Date());

        const values = {};
        parts.forEach(part => {
            if (part.type !== "literal") values[part.type] = part.value;
        });
        return `${values.year}-${values.month}-${values.day}`;
    }

    function dateKey(year, month, day) {
        return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    }

    function parseKey(key) {
        const [year, month, day] = key.split("-").map(Number);
        return new Date(year, month - 1, day);
    }

function setStatus(message) {
    if (dciStatus) {
        dciStatus.textContent = message;
    }
}

    function showPointsPopup(dayElement, points) {
        if (!dayElement) return;

        if (!document.getElementById("dci-points-popup-style")) {
            const style = document.createElement("style");
            style.id = "dci-points-popup-style";
            style.textContent = `
                .dci-points-popup {
                    position: fixed;
                    z-index: 999999;
                    pointer-events: none;
                    color: #FFD700;
                    font-size: 24px;
                    font-weight: 900;
                    white-space: nowrap;
                    text-shadow: 0 2px 4px rgba(0,0,0,.8), 0 0 14px rgba(255,215,0,.45);
                    transform-origin: center;
                    animation: dci-points-float 1.2s ease-out forwards;
                }
                @keyframes dci-points-float {
                    0% { opacity: 0; transform: translate(-50%, 10px) scale(.4); }
                    20% { opacity: 1; transform: translate(-50%, 0) scale(1.25); }
                    35% { opacity: 1; transform: translate(-50%, -5px) scale(1); }
                    100% { opacity: 0; transform: translate(-50%, -75px) scale(.85); }
                }
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
        const year = new Date().getFullYear();
        const daysInYear = ((year % 4 === 0 && year % 100 !== 0) || year % 400 === 0) ? 366 : 365;
        const completedThisYear = [...checkedDates].filter(key => key.startsWith(`${year}-`)).length;

        if (dciProgressText) {
            dciProgressText.textContent = `${completedThisYear} / ${daysInYear} DAYS`;
        }
        if (dciProgressBar) {
            dciProgressBar.style.width = `${Math.min((completedThisYear / daysInYear) * 100, 100)}%`;
        }
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

    function renderCalendar() {
        dciDays.innerHTML = "";
        dciMonthLabel.textContent = new Date(viewYear, viewMonth, 1).toLocaleDateString("en-MY", {
            month: "long",
            year: "numeric"
        });

        const firstWeekday = new Date(viewYear, viewMonth, 1).getDay();
        const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
        const todayKey = malaysiaTodayKey();

        // Sunday-first calendar spacing.
        for (let i = 0; i < firstWeekday; i++) {
            const empty = document.createElement("div");
            empty.className = "dci-calendar-empty";
            empty.setAttribute("aria-hidden", "true");
            dciDays.appendChild(empty);
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const key = dateKey(viewYear, viewMonth, day);
            const button = document.createElement("button");
            const isChecked = checkedDates.has(key);
            const isPast = key < todayKey;
            const isToday = key === todayKey;
            const isFuture = key > todayKey;
            const isRewardDay = rewardDays.has(day);

            button.type = "button";
            button.className = "dci-day";
            button.dataset.date = key;
            button.setAttribute("aria-label", new Date(viewYear, viewMonth, day).toLocaleDateString("en-MY", {
                day: "numeric", month: "long", year: "numeric"
            }));

            // Past dates are always grey, including reward dates.
            // Only today's checked-in date receives the turquoise checked style.
            if (isRewardDay && !isPast) button.classList.add("dci-reward");
            if (isPast) button.classList.add("dci-past");
            if (isChecked && isToday) button.classList.add("dci-checked");
            if (isFuture) button.classList.add("dci-locked");
            if (isToday) button.classList.add("dci-today");
            if (selectedDateKey === key) button.classList.add("dci-selected");

            button.innerHTML = `
                <span class="dci-day-top">
                    <span class="dci-day-label">${new Date(viewYear, viewMonth, day).toLocaleDateString("en-MY", { weekday: "short" })}</span>
                    <span class="dci-day-date">${day}${getOrdinalSuffix(day)}</span>
                </span>
                <strong class="dci-day-number">+${day}</strong>
                <span class="dci-day-symbol">
                    ${isChecked
                        ? '<span class="dci-check-mark">✓</span>'
                        : '<span class="dci-empty-circle" aria-hidden="true"></span>'}
                </span>
            `;

            button.addEventListener("click", () => handleDateClick(key, button));
            dciDays.appendChild(button);
        }

        // Past and future months can be browsed; past dates stay grey and cannot be claimed.
        dciPrevMonth.disabled = false;

        updateProgress();
    }

    function handleDateClick(key, button) {
        selectedDateKey = key;
        document.querySelectorAll(".dci-day").forEach(dayButton => {
            dayButton.classList.toggle("dci-selected", dayButton.dataset.date === key);
        });

        const todayKey = malaysiaTodayKey();

        if (checkedDates.has(key)) {
            setStatus(`You have already checked in on ${key}.`);
            return;
        }

        if (key < todayKey) {
            setStatus("Past dates are automatically marked as completed.");
            return;
        }

        if (key > todayKey) {
            setStatus("This date is not available yet. Please check in on the actual date.");
            return;
        }

        // Check in only for today's date.
        checkedDates.add(key);
        localStorage.setItem(STORAGE_KEY, JSON.stringify([...checkedDates].sort()));
        showPointsPopup(button, 1);
        renderCalendar();
        setStatus(`Check-in successful for ${key}! +1 POINT`);
    }

    dciPrevMonth.addEventListener("click", () => {
        if (dciPrevMonth.disabled) return;
        viewMonth--;
        if (viewMonth < 0) {
            viewMonth = 11;
            viewYear--;
        }
        selectedDateKey = null;
        renderCalendar();
        setStatus("Click today's date to check in.");
    });

    dciNextMonth.addEventListener("click", () => {
        viewMonth++;
        if (viewMonth > 11) {
            viewMonth = 0;
            viewYear++;
        }
        selectedDateKey = null;
        renderCalendar();
        setStatus("Future dates unlock on the actual date.");
    });

    renderCalendar();
    setStatus("Click today's date to check in.");

    // Refresh the calendar automatically if the date changes while the page is open.
    window.setInterval(() => {
        const current = new Date();
        if (current.getFullYear() !== now.getFullYear() || current.getMonth() !== now.getMonth()) {
            now.setTime(current.getTime());
            viewYear = current.getFullYear();
            viewMonth = current.getMonth();
        }
        renderCalendar();
    }, 60000);
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
