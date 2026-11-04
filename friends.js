document.addEventListener("DOMContentLoaded", () => {

    /* Reward T&C: hover on desktop, tap-to-toggle on touch devices */
    const tncWrap = document.querySelector(".fr-tnc-wrap");
    const tncTrigger = tncWrap?.querySelector(".fr-tnc-trigger");
    if (tncWrap && tncTrigger) {
        const closeTnc = () => {
            tncWrap.classList.remove("is-open");
            tncTrigger.setAttribute("aria-expanded", "false");
        };
        tncTrigger.setAttribute("aria-expanded", "false");
        tncTrigger.setAttribute("aria-haspopup", "dialog");

        // Desktop: anchor the fixed T&C panel directly below the info icon.
        const positionDesktopTnc = () => {
            if (!window.matchMedia("(hover:hover) and (pointer:fine)").matches) return;
            const panel = tncWrap.querySelector(".fr-tnc-tooltip");
            if (!panel) return;
            const rect = tncTrigger.getBoundingClientRect();
            const panelWidth = Math.min(panel.getBoundingClientRect().width || 520, window.innerWidth - 32);
            // Align the popup's right edge with the information icon, then clamp it to the viewport.
            const left = Math.max(16, Math.min(rect.right - panelWidth, window.innerWidth - panelWidth - 16));
            panel.style.top = `${Math.max(8, rect.bottom + 10)}px`;
            panel.style.left = `${left}px`;
            panel.style.right = "auto";
            panel.style.bottom = "auto";
            panel.style.transform = "none";
        };
        tncTrigger.addEventListener("mouseenter", positionDesktopTnc);
        tncWrap.addEventListener("mouseenter", positionDesktopTnc);
        tncTrigger.addEventListener("focus", positionDesktopTnc);
        window.addEventListener("resize", positionDesktopTnc);
        window.addEventListener("scroll", positionDesktopTnc, true);
        const tncClose = tncWrap.querySelector(".fr-tnc-close");
        tncClose?.addEventListener("click", event => {
            event.preventDefault();
            event.stopPropagation();
            closeTnc();
        });
        tncTrigger.addEventListener("click", event => {
            event.preventDefault();
            event.stopPropagation();
            // Desktop uses hover; touch devices use tap to open/close.
            if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
            const opening = !tncWrap.classList.contains("is-open");
            tncWrap.classList.toggle("is-open", opening);
            tncTrigger.setAttribute("aria-expanded", String(opening));
        });
        document.addEventListener("click", event => {
            if (!tncWrap.contains(event.target)) closeTnc();
        });
        document.addEventListener("keydown", event => {
            if (event.key === "Escape") closeTnc();
        });
    }


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


    /* Reward exchange confirmation is wired after the shared popup is initialized. */


    /* =========================
       GENERIC POPUP
    ========================= */

    const popup = document.getElementById("fr-popup-overlay");
    const title = document.getElementById("fr-popup-title");
    const body = document.getElementById("fr-popup-body");

    const closePopup = () => {
        popup?.classList.remove("fr-show");
    };


    /* =========================
       REWARD CARD EXCHANGE
    ========================= */
    let pendingRewardExchange = null;
    const rewardConfig = {
        "3 Cards": { required: 3, amount: "88" },
        "4 Cards": { required: 4, amount: "888" },
        "5 Cards": { required: 5, amount: "8,888" }
    };

    const getAvailableDistinctCards = () => Array.from(document.querySelectorAll(".fr-card[data-card-id]"))
        .filter(card => (parseInt(card.querySelector(".fr-card-symbol")?.textContent, 10) || 0) > 0);

    document.querySelectorAll(".fr-claim").forEach(button => {
        button.addEventListener("click", () => {
            const rewardName = button.dataset.reward || button.closest(".fr-reward-item")?.querySelector(".fr-reward-info strong")?.textContent?.trim();
            const config = rewardConfig[rewardName];
            if (!config || button.disabled) return;

            const availableCards = getAvailableDistinctCards();
            const eligible = availableCards.length >= config.required;
            pendingRewardExchange = eligible ? { button, rewardName, config } : null;

            title.textContent = "Exchange Reward";
            body.innerHTML = `
                <div class="fr-exchange-confirm-content">
                    <div class="fr-exchange-confirm-reward">
                        <span class="fr-exchange-confirm-label">FREE REWARD</span>
                        <strong>${config.amount}</strong>
                    </div>
                    <div class="fr-exchange-confirm-message">
                        ${eligible
                            ? `Are you ready to exchange <strong>${config.required} different cards</strong> for this reward?`
                            : `You need <strong>${config.required} different cards</strong> to exchange this reward. You currently have <strong>${availableCards.length}</strong> different card${availableCards.length === 1 ? "" : "s"} available.`}
                    </div>
                    <div class="fr-exchange-card-preview">
                        ${availableCards.slice(0, config.required).map(card => `<span><img src="${card.querySelector("img")?.getAttribute("src") || ""}" alt="Available card"></span>`).join("")}
                    </div>
                    <div class="fr-exchange-confirm-actions">
                        <button type="button" class="fr-exchange-submit" id="fr-exchange-submit" ${eligible ? "" : "disabled"}><i class="fa-solid fa-gift"></i><span>CONFIRM EXCHANGE</span></button>
                    </div>
                </div>`;
            popup?.classList.add("fr-show");
        });
    });

    body?.addEventListener("click", event => {
        if (!event.target.closest("#fr-exchange-submit")) return;
        if (!pendingRewardExchange) return;

        const { button, config } = pendingRewardExchange;
        const cardsToExchange = getAvailableDistinctCards().slice(0, config.required);
        if (cardsToExchange.length < config.required) {
            pendingRewardExchange = null;
            closePopup();
            return;
        }

        // Demo behaviour: consume one of each required distinct card.
        cardsToExchange.forEach(card => {
            const quantity = card.querySelector(".fr-card-symbol");
            if (quantity) quantity.textContent = Math.max(0, (parseInt(quantity.textContent, 10) || 0) - 1);
        });
        const collectionCount = document.getElementById("frCollectionCount");
        if (collectionCount) {
            const total = Array.from(document.querySelectorAll(".fr-card[data-card-id] .fr-card-symbol"))
                .reduce((sum, item) => sum + Math.max(0, parseInt(item.textContent, 10) || 0), 0);
            collectionCount.textContent = total;
        }
        button.textContent = "CLAIMED";
        button.disabled = true;
        title.textContent = "Exchange Successful";
        body.innerHTML = `<div class="fr-exchange-success"><i class="fa-solid fa-circle-check"></i><strong>Reward exchanged successfully!</strong><span>${config.amount} reward has been claimed.</span></div>`;
        pendingRewardExchange = null;
        window.setTimeout(closePopup, 1400);
    });


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



    /* =========================================
       FRIEND LIST ACTIONS
    ========================================= */
    const refreshFriendsCount = () => {
        const count = document.querySelectorAll("#frFriendsList .fr-friend-row").length;
        const countLabel = document.getElementById("frFriendsCount");
        const tabCount = document.getElementById("frAllFriendsTabCount");
        const emptyState = document.getElementById("frFriendsEmpty");
        if (countLabel) countLabel.textContent = count;
        if (tabCount) tabCount.textContent = `(${count})`;
        if (emptyState) emptyState.classList.toggle("fr-hidden", count !== 0);
    };

    const getCollectionTotal = () => {
        let total = 0;
        document.querySelectorAll(".fr-card[data-card-id] .fr-card-symbol").forEach(el => {
            total += Math.max(0, parseInt(el.textContent, 10) || 0);
        });
        return total;
    };

    const refreshCollectionCount = () => {
        const countEl = document.getElementById("frCollectionCount");
        if (countEl) countEl.textContent = getCollectionTotal();
    };

    const escapeHtml = value => String(value).replace(/[&<>"']/g, char => ({
        "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    }[char]));

    document.addEventListener("click", e => {
        const giftBtn = e.target.closest(".fr-friend-gift");
        if (giftBtn) {
            const row = giftBtn.closest(".fr-friend-row");
            const friendName = row?.querySelector(".fr-friend-name strong")?.textContent || "friend";
            const cards = Array.from(document.querySelectorAll(".fr-card[data-card-id]"));
            const availableCards = cards.filter(card => (parseInt(card.querySelector(".fr-card-symbol")?.textContent, 10) || 0) > 0);

            title.textContent = "Send Gift Card";
            body.innerHTML = `
                <div class="fr-gift-inventory-head">
                    <strong>Available Cards</strong>
                    <span><b id="frGiftAvailableCount">${getCollectionTotal()}</b> available</span>
                </div>
                <div class="fr-gift-card-grid" id="frGiftCardGrid">
                    ${availableCards.length ? availableCards.map((card, index) => {
                        const image = card.querySelector("img");
                        const cardId = card.dataset.cardId;
                        const quantity = parseInt(card.querySelector(".fr-card-symbol")?.textContent, 10) || 0;
                        return `<label class="fr-gift-card-option">
                            <input type="radio" name="frGiftCard" value="${escapeHtml(cardId)}" ${index === 0 ? "checked" : ""}>
                            <span class="fr-gift-card-visual"><img src="${escapeHtml(image?.getAttribute("src") || "")}" alt="Gift card"><span class="fr-gift-card-qty">x${quantity}</span><span class="fr-gift-card-selected"><i class="fa-solid fa-check"></i></span></span>
                        </label>`;
                    }).join("") : `<div class="fr-gift-no-cards"><i class="fa-regular fa-face-frown"></i><strong>No cards available</strong><span>Your collection is empty. Collect more cards before sending a gift.</span></div>`}
                </div>
                <div class="fr-gift-footer">
                    <button type="button" class="fr-gift-confirm" id="fr-gift-confirm" ${availableCards.length ? "" : "disabled"}><i class="fa-solid fa-paper-plane"></i><span>SEND</span></button>
                </div>`;
            popup?.classList.add("fr-show");
            return;
        }

        const removeBtn = e.target.closest(".fr-friend-remove");
        if (removeBtn) {
            const row = removeBtn.closest(".fr-friend-row");
            const friendName = row?.querySelector(".fr-friend-name strong")?.textContent || "this friend";
            if (row && window.confirm(`Remove ${friendName} from your friends list?`)) {
                row.remove();
                refreshFriendsCount();
            }
            return;
        }

        if (e.target.closest("#fr-gift-confirm")) {
            const selected = document.querySelector('input[name="frGiftCard"]:checked');
            if (!selected) return;
            const card = document.querySelector(`.fr-card[data-card-id="${CSS.escape(selected.value)}"]`);
            const quantityEl = card?.querySelector(".fr-card-symbol");
            const quantity = parseInt(quantityEl?.textContent, 10) || 0;
            if (!card || quantity < 1) return;

            // Frontend demo: reserve one card from the collection after a successful send action.
            quantityEl.textContent = quantity - 1;
            refreshCollectionCount();
            closePopup();
        }
    });

    refreshCollectionCount();

});