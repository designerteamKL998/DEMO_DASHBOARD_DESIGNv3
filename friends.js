document.addEventListener("DOMContentLoaded", () => {

    /* =========================
       TABS
    ========================= */

    document.querySelectorAll(".fr-tab").forEach(tab => {

        tab.addEventListener("click", () => {

            document.querySelectorAll(".fr-tab")
                .forEach(t => t.classList.remove("active"));

            document.querySelectorAll(".fr-tab-content")
                .forEach(c => c.classList.add("fr-hidden"));

            tab.classList.add("active");

            document
                .getElementById(`${tab.dataset.tab}-content`)
                ?.classList.remove("fr-hidden");

        });

    });

/* =========================================
   FRIEND REQUEST COUNTER
========================================= */

const updateFriendRequestCount = () => {

    const incomingCount =
        document.querySelectorAll(
            "#request-content .fr-request-row"
        ).length;

    const sentCount =
        document.querySelectorAll(
            "#sent-content .fr-request-row"
        ).length;


    /* =========================
       TAB BADGES
    ========================= */

    const requestBadge =
        document.getElementById("friendRequestBadge");

    const sentBadge =
        document.getElementById("sentRequestBadge");


    if (requestBadge) {

        requestBadge.textContent = incomingCount;

        requestBadge.classList.toggle(
            "is-hidden",
            incomingCount === 0
        );
    }


    if (sentBadge) {

        sentBadge.textContent = sentCount;

        sentBadge.classList.toggle(
            "is-hidden",
            sentCount === 0
        );
    }


    /* =========================
       PENDING ALERT
    ========================= */

    const alertBox =
        document.getElementById("frPendingAlert");

    const alertTitle =
        document.getElementById("frPendingTitle");

    const alertMessage =
        document.getElementById("frPendingMessage");


    if (!alertBox) return;


    if (incomingCount > 0) {

        alertBox.style.display = "flex";

        alertTitle.textContent =
            "Pending Friend Requests";

        alertMessage.textContent =
            `You have ${incomingCount} friend request${incomingCount > 1 ? "s" : ""} waiting for your approval.`;

    } else if (sentCount > 0) {

        alertBox.style.display = "flex";

        alertTitle.textContent =
            "Pending Sent Requests";

        alertMessage.textContent =
            `You have ${sentCount} sent request${sentCount > 1 ? "s" : ""} waiting for a response.`;

    } else {

        alertBox.style.display = "none";
    }
};


/* RUN ON PAGE LOAD */

updateFriendRequestCount();


document
    .getElementById("frViewRequests")
    ?.addEventListener("click", () => {

        const requestTab =
            document.querySelector(
                '.fr-tab[data-tab="request"]'
            );

        requestTab?.click();

    });

/* =========================================
   ACCEPT FRIEND REQUEST
========================================= */

document.addEventListener("click", e => {

    const acceptBtn =
        e.target.closest(".fr-btn-accept");

    if (!acceptBtn) return;

    const row =
        acceptBtn.closest(".fr-request-row");

    if (!row) return;

    row.remove();

    updateFriendRequestCount();

});


/* =========================================
   DECLINE FRIEND REQUEST
========================================= */

document.addEventListener("click", e => {

    const declineBtn =
        e.target.closest(".fr-btn-decline");

    if (!declineBtn) return;

    const row =
        declineBtn.closest(".fr-request-row");

    if (!row) return;

    row.remove();

    updateFriendRequestCount();

});

/* =========================================
   CANCEL SENT REQUEST
========================================= */

document.addEventListener("click", e => {

    const cancelBtn =
        e.target.closest(".fr-btn-cancel");

    if (!cancelBtn) return;

    const row =
        cancelBtn.closest(".fr-request-row");

    if (!row) return;

    row.remove();

    updateFriendRequestCount();

});


    /* =========================
       CLAIM REWARD
    ========================= */

    document.querySelectorAll(".fr-claim").forEach(btn => {

        btn.onclick = () => {

            btn.textContent = "CLAIMED";
            btn.disabled = true;

        };

    });


    /* =========================
       RECORD MODAL
    ========================= */

    const recordModal = document.getElementById("fr-record-modal");

    document.getElementById("fr-add-record")?.addEventListener("click", () => {
        recordModal?.classList.add("fr-show");
    });

    document.getElementById("fr-close-record")?.addEventListener("click", () => {
        recordModal?.classList.remove("fr-show");
    });

    document.getElementById("fr-cancel-record")?.addEventListener("click", () => {
        recordModal?.classList.remove("fr-show");
    });


    /* =========================
       GENERIC POPUP
    ========================= */

    const popup = document.getElementById("fr-popup-overlay");
    const title = document.getElementById("fr-popup-title");
    const body = document.getElementById("fr-popup-body");

    const closePopup = () => {
        popup?.classList.remove("fr-show");
    };


    document.getElementById("fr-popup-close")?.addEventListener("click", closePopup);

    popup?.addEventListener("click", e => {
        if (e.target === popup) closePopup();
    });


    /* =========================
       HISTORY
    ========================= */

    document.getElementById("fr-history-btn")?.addEventListener("click", () => {

        title.textContent = "Claim History";

        body.innerHTML = `
            <table class="fr-popup-table">
                <thead>
                    <tr>
                        <th>No.</th>
                        <th>Prizes</th>
                        <th>Cash</th>
                        <th>Claim Date</th>
                        <th>Cards</th>
                    </tr>
                </thead>

                <tbody>
                    <tr class="fr-popup-empty">
                        <td colspan="5">No Record.</td>
                    </tr>
                </tbody>
            </table>
        `;

        popup.classList.add("fr-show");

    });


    /* =========================
       TRANSFER
    ========================= */

    document.getElementById("fr-transfer-btn")?.addEventListener("click", () => {

        title.textContent = "Transfer History";

        body.innerHTML = `
            <table class="fr-popup-table">
                <thead>
                    <tr>
                        <th>No.</th>
                        <th>From</th>
                        <th>To</th>
                        <th>Transfer Date</th>
                        <th>Cards</th>
                    </tr>
                </thead>

                <tbody>
                    <tr class="fr-popup-empty">
                        <td colspan="5">No Record.</td>
                    </tr>
                </tbody>
            </table>
        `;

        popup.classList.add("fr-show");

    });


    /* =========================
       ADD FRIEND
    ========================= */

    document.getElementById("fr-add-friend-btn")?.addEventListener("click", () => {

        title.textContent = "Add Friend";

        body.innerHTML = `
            <div class="fr-add-details">

                <div class="fr-add-title">
                    Add a friend
                </div>

                <div class="fr-add-description">
                    Enter your friend's username and send them a friend request.
                </div>

            </div>

            <div class="fr-add-form">

                <div class="fr-add-field">

                    <label>Username</label>

                    <input
                        type="text"
                        id="fr-friend-username"
                        placeholder="Enter username">

                </div>

                <div class="fr-add-field">

                    <label>Message</label>

                    <textarea
                        id="fr-friend-message"
                        placeholder="Write a message..."
                        rows="3"></textarea>

                </div>

                <button
                    type="button"
                    class="fr-add-send"
                    id="fr-add-send">

                    Send

                </button>

            </div>
        `;

        popup.classList.add("fr-show");

    });

/* =========================
   SETTINGS
========================= */

document.getElementById("fr-settings-btn")?.addEventListener("click", () => {

    title.textContent = "Settings";

    body.innerHTML = `
        <div class="fr-settings-content">

            <label class="fr-setting-option">
                <input type="checkbox" checked>
                <span>Show Online Status</span>
            </label>

            <label class="fr-setting-option">
                <input type="checkbox" checked>
                <span>Show Member Level Info</span>
            </label>

            <button type="button" class="fr-settings-save">
                Save
            </button>

        </div>
    `;

    popup.classList.add("fr-show");

});


/* SAVE */

document.addEventListener("click", e => {

    if (e.target.closest(".fr-settings-save")) {
        popup.classList.remove("fr-show");
    }

});

    /* =========================
       ESC
    ========================= */

    document.addEventListener("keydown", e => {

        if (e.key === "Escape") {
            closePopup();
        }

    });

});