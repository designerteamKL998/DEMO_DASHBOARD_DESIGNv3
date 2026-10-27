
document.addEventListener("DOMContentLoaded", () => {

    /* ===========  ELEMENTS  ============ */

    const autoMatchBtn = document.getElementById("autoMatchBtn");
    const pkFriendBtn = document.getElementById("pkFriendBtn");
    const leaderboardBtn = document.getElementById("leaderboardBtn");
    const historyBtn = document.getElementById("historyBtn");

    const autoMatchModal = document.getElementById("autoMatchModal");
    const friendModal = document.getElementById("friendModal");
    const leaderboardModal = document.getElementById("leaderboardModal");
    const historyModal = document.getElementById("historyModal");

    const cancelMatchBtn = document.getElementById("cancelMatchBtn");
    const matchStatus = document.getElementById("matchStatus");

    // Elements untuk design Auto Match baru
    const matchSubtitle = document.getElementById("matchSubtitle");
    const matchCountdown = document.getElementById("matchCountdown");
    const matchSpinner = document.getElementById("matchSpinner");


    /* ============  OPEN MODAL  ============= */

    function openModal(modal) {
        if (!modal) return;

        modal.classList.add("active");
        document.body.style.overflow = "hidden";
    }


    /* ===========  CLOSE MODAL  ============ */

    function closeModal(modal) {
        if (!modal) return;

        modal.classList.remove("active");

        // Restore scroll only if no other modal is open
        const anotherModalOpen =
            document.querySelector(".pk-modal.active");

        if (!anotherModalOpen) {
            document.body.style.overflow = "";
        }
    }


    /* ============  AUTO MATCH TIMER  ============ */

    let matchTimer = null;
    let matchCountdownTimer = null;
    let matchSecondsLeft = 74;
    let matchState = "idle";

    function stopMatchTimers() {
        clearTimeout(matchTimer);
        clearInterval(matchCountdownTimer);

        matchTimer = null;
        matchCountdownTimer = null;
    }


    /* ===========  FORMAT COUNTDOWN  ============= */

    function formatMatchTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;

        return (
            "00:" +
            String(minutes).padStart(2, "0") +
            ":" +
            String(secs).padStart(2, "0")
        );
    }


    /* ===========  RESET AUTO MATCH  ============ */

    function resetAutoMatch() {
        stopMatchTimers();

        matchSecondsLeft = 74;
        matchState = "waiting";

        if (matchCountdown) {
            matchCountdown.textContent = "00:01:14";
        }

        if (matchSubtitle) {
            matchSubtitle.textContent =
                "Opponent found! Preparing match...";
        }

        if (matchStatus) {
            matchStatus.innerHTML =
                'Your opponent is ' +
                '<strong>testnickmy**</strong>, ' +
                'waiting for your opponent accept/refuse...';
        }

        if (matchSpinner) {
            matchSpinner.style.display = "block";
        }

        if (cancelMatchBtn) {
            cancelMatchBtn.disabled = false;
            cancelMatchBtn.textContent = "CANCEL";
        }
    }


    /* ============  START COUNTDOWN  ============= */

    function startMatchCountdown() {
        clearInterval(matchCountdownTimer);

        matchCountdownTimer = setInterval(() => {

            if (matchState !== "waiting") {
                stopMatchTimers();
                return;
            }

            matchSecondsLeft--;

            if (matchCountdown) {
                matchCountdown.textContent =
                    formatMatchTime(
                        Math.max(matchSecondsLeft, 0)
                    );
            }

            if (matchSecondsLeft <= 0) {
                stopMatchTimers();

                matchState = "expired";

                if (matchSubtitle) {
                    matchSubtitle.textContent =
                        "Match request expired";
                }

                if (matchStatus) {
                    matchStatus.textContent =
                        "Time is up. Please try matching again.";
                }

                if (matchSpinner) {
                    matchSpinner.style.display = "none";
                }

                if (cancelMatchBtn) {
                    cancelMatchBtn.disabled = false;
                    cancelMatchBtn.textContent = "CLOSE";
                }
            }

        }, 1000);
    }


    /* =============  AUTO MATCH BUTTON  ============ */

    if (autoMatchBtn && autoMatchModal) {

        autoMatchBtn.addEventListener("click", () => {

            resetAutoMatch();
            openModal(autoMatchModal);

            // Demo status update
            matchTimer = setTimeout(() => {

                if (matchState !== "waiting") return;

                if (matchSubtitle) {
                    matchSubtitle.textContent =
                        "Waiting for opponent confirmation...";
                }

            }, 2500);

            startMatchCountdown();

        });

    }


    /* ===========  CANCEL MATCH  =========== */

    if (cancelMatchBtn && autoMatchModal) {

        cancelMatchBtn.addEventListener("click", () => {

            stopMatchTimers();

            matchState = "cancelled";

            closeModal(autoMatchModal);

        });

    }


    /* ============  PK FRIEND  =========== */

    if (pkFriendBtn && friendModal) {

        pkFriendBtn.addEventListener("click", () => {
            openModal(friendModal);
        });

    }


    /* ============  LEADERBOARD  ============= */

    if (leaderboardBtn && leaderboardModal) {

        leaderboardBtn.addEventListener("click", () => {
            openModal(leaderboardModal);
        });

    }


    /* ==========  HISTORY  =========== */

    if (historyBtn && historyModal) {

        historyBtn.addEventListener("click", () => {
            openModal(historyModal);
        });

    }


    /* ============  CLOSE BUTTONS  ============ */

    document.querySelectorAll("[data-close]")
        .forEach(button => {

            button.addEventListener("click", () => {

                const modal = button.closest(".pk-modal");

                if (!modal) return;

                if (modal === autoMatchModal) {
                    stopMatchTimers();
                    matchState = "closed";
                }

                closeModal(modal);

            });

        });


    /* ==========  CLOSE WHEN CLICK OUTSIDE  ============ */

    document.querySelectorAll(".pk-modal")
        .forEach(modal => {

            modal.addEventListener("click", event => {

                if (event.target !== modal) return;

                if (modal === autoMatchModal) {
                    stopMatchTimers();
                    matchState = "closed";
                }

                closeModal(modal);

            });

        });


    /* ===========  ESCAPE KEY  =========== */

    document.addEventListener("keydown", event => {

        if (event.key !== "Escape") return;

        document.querySelectorAll(".pk-modal.active")
            .forEach(modal => {

                if (modal === autoMatchModal) {
                    stopMatchTimers();
                    matchState = "closed";
                }

                closeModal(modal);

            });

    });


    /* ===========  FRIEND CHALLENGE  ============ */

    document.querySelectorAll(".pk-friend-item")
        .forEach(friend => {

            friend.addEventListener("click", () => {

                const player =
                    friend.querySelector("span:nth-child(2)");

                const playerName = player
                    ? player.textContent.trim()
                    : "Player";

                alert(
                    `Challenge request sent to ${playerName}.`
                );

                closeModal(friendModal);

            });

        });

});
