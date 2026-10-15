document.addEventListener("DOMContentLoaded", () => {

    const dciDays = document.getElementById("dciDays");
    // Support both the mobile and desktop Check-in buttons/status labels.
    const dciCheckinButtons = document.querySelectorAll("#dciCheckinButton");
    const dciStatuses = document.querySelectorAll("#dciStatus");

    function setCheckinDisabled(disabled) {
        dciCheckinButtons.forEach(button => {
            button.disabled = disabled;
        });
    }

    function setStatus(message) {
        dciStatuses.forEach(status => {
            status.textContent = message;
        });
    }
    const dciProgressText = document.getElementById("dciProgressText");
    const dciProgressBar = document.getElementById("dciProgressBar");

    const rewards = {
        7:  { amount: "$5.00",  date: "2026-09-29 12:00" },
        14: { amount: "$5.00",  date: "2026-10-06 12:00" },
        21: { amount: "$5.00",  date: "2026-10-13 12:00" },
        28: { amount: "$15.00", date: "2026-10-20 12:00" }
    };

    const icons = [
    "imgs/checkin/coinch.png",
    "imgs/checkin/diamondch.png",
    "imgs/checkin/ticketch.png",
    "imgs/checkin/heartcs.png",
    "imgs/checkin/coinchs.png",
    "imgs/checkin/diamondchs.png",
    "imgs/checkin/giftch.png"
];

    let selectedDay = null;

    // New storage key = starts fresh from Day 1
    let checkedDays = new Set(
        JSON.parse(localStorage.getItem("dciCheckedDays_v3") || "[]")
    );

    // Store the exact check-in time of each day.
    let checkinTimes = JSON.parse(
        localStorage.getItem("dciCheckinTimes_v3") || "{}"
    );

    /* =========================
       TIME
    ========================= */

    function getNextDay() {
        let day = 1;

        while (checkedDays.has(day) && day <= 28) {
            day++;
        }

        return day;
    }

    // Day 1 = available immediately.
    // Day 2+ = available at 12:00 PM on the calendar day
    // AFTER the previous day was checked in.
    function getUnlockTime(day) {
        if (day === 1) {
            return 0;
        }

        const previousCheckin = checkinTimes[day - 1];

        if (!previousCheckin) {
            return Infinity;
        }

        const previous = new Date(previousCheckin);

        // Get the next calendar day in Malaysia time.
        const malaysiaDate = new Intl.DateTimeFormat("en-CA", {
            timeZone: "Asia/Kuala_Lumpur",
            year: "numeric",
            month: "2-digit",
            day: "2-digit"
        }).format(previous);

        const [year, month, dayNumber] = malaysiaDate.split("-").map(Number);

        // Normalize the next date safely, including month/year boundaries.
        const nextDate = new Date(Date.UTC(year, month - 1, dayNumber + 1));
        const nextYear = nextDate.getUTCFullYear();
        const nextMonth = String(nextDate.getUTCMonth() + 1).padStart(2, "0");
        const nextDay = String(nextDate.getUTCDate()).padStart(2, "0");

        // 12:00 PM Malaysia time (GMT+08:00) on the next calendar day.
        return new Date(
            `${nextYear}-${nextMonth}-${nextDay}T12:00:00+08:00`
        ).getTime();
    }

    function canCheck(day) {
        if (day !== getNextDay() || day > 28) {
            return false;
        }

        return Date.now() >= getUnlockTime(day);
    }

    function getTimeText(timestamp) {
        return new Date(timestamp).toLocaleTimeString("en-MY", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
            timeZone: "Asia/Kuala_Lumpur"
        });
    }

    function getDateText(timestamp) {
        return new Date(timestamp).toLocaleDateString("en-MY", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            timeZone: "Asia/Kuala_Lumpur"
        });
    }

    /* =========================
       RENDER DAYS
    ========================= */

    function renderDays() {
        dciDays.innerHTML = "";

        for (let day = 1; day <= 28; day++) {

            const button = document.createElement("button");

            button.type = "button";
            button.className = "dci-day";
            button.dataset.day = day;

            if (rewards[day]) {
                button.classList.add("dci-reward");
            }

            if (checkedDays.has(day)) {
                button.classList.add("dci-checked");
            } else if (!canCheck(day)) {
                button.classList.add("dci-locked");
            }

            button.innerHTML = `
    <span class="dci-day-label">DAY</span>

    <strong class="dci-day-number">
        ${day}
    </strong>

    <span class="dci-day-symbol">
        <img
            src="${rewards[day]
                ? "imgs/checkin/giftch.png"
                : icons[(day - 1) % icons.length]}"
            alt=""
        >
    </span>
`;
            button.addEventListener("click", () => selectDay(day));

            dciDays.appendChild(button);
        }

        updateProgress();
    }

    /* =========================
       SELECT DAY
    ========================= */

    function selectDay(day) {
        selectedDay = day;

        document.querySelectorAll(".dci-day").forEach(button => {
            button.classList.toggle(
                "dci-selected",
                Number(button.dataset.day) === day
            );
        });

        if (checkedDays.has(day)) {
            setCheckinDisabled(true);
            setStatus(`Day ${day} already checked in.`);
            return;
        }

        if (!canCheck(day)) {
            setCheckinDisabled(true);

            if (day !== getNextDay()) {
                setStatus(
                    `Please complete Day ${getNextDay()} first.`
                );
                return;
            }

            const unlock = getUnlockTime(day);

            if (unlock === Infinity) {
                setStatus(
                    `Day ${day} will unlock after Day ${day - 1} is checked in.`
                );
            } else {
                setStatus(
                    `Day ${day} unlocks on ${getDateText(unlock)} at ${getTimeText(unlock)} (GMT+08:00).`
                );
            }

            return;
        }

        setCheckinDisabled(false);
        setStatus(
            `Day ${day} selected. Click Check-in.`
        );
    }

    /* =========================
       CHECK-IN
    ========================= */

    function handleCheckin() {

        if (!selectedDay || !canCheck(selectedDay)) {
            return;
        }

        const completedDay = selectedDay;
        const now = Date.now();

        checkedDays.add(completedDay);
        checkinTimes[completedDay] = new Date(now).toISOString();

        localStorage.setItem(
            "dciCheckedDays_v3",
            JSON.stringify([...checkedDays])
        );

        localStorage.setItem(
            "dciCheckinTimes_v3",
            JSON.stringify(checkinTimes)
        );

        renderDays();
        selectDay(completedDay);

        setCheckinDisabled(true);

        const nextDay = completedDay + 1;

        if (nextDay <= 28) {
            const unlock = getUnlockTime(nextDay);

            setStatus(
                `Day ${completedDay} checked in. Day ${nextDay} unlocks on ${getDateText(unlock)} at ${getTimeText(unlock)} (GMT+08:00).`
            );
        } else {
            setStatus("All 28 days completed!");
        }
    }

    dciCheckinButtons.forEach(button => {
        button.addEventListener("click", handleCheckin);
    });

    /* =========================
       PROGRESS
    ========================= */

    function updateProgress() {
        const completed = checkedDays.size;

        dciProgressText.textContent =
            `${completed} / 28 DAYS`;

        dciProgressBar.style.width =
            `${Math.min((completed / 28) * 100, 100)}%`;
    }

    /* =========================
       AUTO UPDATE
    ========================= */

    renderDays();

    setInterval(() => {
        renderDays();

        if (selectedDay) {
            selectDay(selectedDay);
        }
    }, 30000);

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
