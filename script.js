
/* =========================================================
   ALERT REMINDERS
   Daily Check-In + Angpow Rain + Notification
========================================================= */
(() => {
    "use strict";

    const REMINDER_INTERVAL = 24 * 60 * 60 * 1000;

    // Same storage key as dailycheckin.js
    const DCI_STORAGE_KEY = "dci_10sec_streak_with_tick_v4";

    const DAILY_SELECTOR =
        'a.profile-feature-item.daily-checkin-menu-item, a.profile-feature-item[href="dailycheckin.html"]';

    // Check Daily Check-In status
    function isDailyCheckinDone() {
        try {
            const state = JSON.parse(
                localStorage.getItem(DCI_STORAGE_KEY) || "null"
            );

            if (
                !state ||
                !Array.isArray(state.checkedDays) ||
                !Number.isInteger(state.activeDay)
            ) {
                return false;
            }

            const isChecked = state.checkedDays.includes(state.activeDay);

            if (!isChecked) return false;

            // Hide alert while waiting for the next day to unlock
            if (state.phase === "waiting" && state.nextUnlockAt) {
                return Date.now() < state.nextUnlockAt;
            }

            // Hide alert permanently after Day 28 completion
            if (state.activeDay >= 28) {
                return true;
            }

            return true;

        } catch (error) {
            return false;
        }
    }

    // Refresh Daily Check-In alert
    function refreshDailyCheckinAlert() {

        const checkedIn = isDailyCheckinDone();

        document.querySelectorAll(DAILY_SELECTOR).forEach(element => {

            element.classList.toggle(
                "alert-reminder-target",
                !checkedIn
            );

        });
    }

    function initAlertReminders() {

        // Run immediately
        refreshDailyCheckinAlert();

        // Recheck status automatically
        window.setInterval(refreshDailyCheckinAlert, 250);

        window.addEventListener("storage", refreshDailyCheckinAlert);

        // Angpow Rain + Notification (existing behaviour)
        const reminders = [
            {
                selector: 'a.profile-feature-item[href*="index__halloween.html"]',
                key: "alertReminder_angpowRain_lastClick"
            },
            {
                selector: ".notification-btn > a, .notification-btn a",
                key: "alertReminder_notification_lastClick"
            }
        ];

        reminders.forEach(({ selector, key }) => {

            const elements = document.querySelectorAll(selector);

            if (!elements.length) return;

            const lastClick = Number(localStorage.getItem(key) || 0);

            const shouldShow =
                !lastClick ||
                (Date.now() - lastClick >= REMINDER_INTERVAL);

            elements.forEach(element => {

                element.classList.toggle(
                    "alert-reminder-target",
                    shouldShow
                );

                element.addEventListener("click", () => {

                    localStorage.setItem(key, String(Date.now()));

                    element.classList.remove("alert-reminder-target");

                }, { capture: true });

            });

        });
    }

    if (document.readyState === "loading") {

        document.addEventListener(
            "DOMContentLoaded",
            initAlertReminders,
            { once: true }
        );

    } else {

        initAlertReminders();

    }

})();
