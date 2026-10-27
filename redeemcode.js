document.addEventListener("DOMContentLoaded", function () {
    const rdmForm = document.getElementById("rdmCodeForm");
    const rdmCodeInput = document.getElementById("rdmCodeInput");
    const rdmError = document.getElementById("rdmError");
    const rdmSummarySection = document.getElementById("rdmSummarySection");
    const rdmSaveBtn = document.getElementById("rdmSaveBtn");

    const getText = (id) => {
        const element = document.getElementById(id);
        return element ? element.textContent.trim() : "";
    };

    if (!rdmForm || !rdmCodeInput || !rdmSummarySection || !rdmSaveBtn) {
        return;
    }

    // Step 1: Redeem Code -> Summary
    rdmForm.addEventListener("submit", function (event) {
        event.preventDefault();

        const redeemCode = rdmCodeInput.value.trim();

        if (!redeemCode) {
            if (rdmError) rdmError.hidden = false;
            rdmCodeInput.focus();
            return;
        }

        if (rdmError) rdmError.hidden = true;

        /*
         * DEMO DATA ONLY:
         * Replace this object with the reward returned by your backend/API.
         * This front-end demo currently accepts any non-empty code.
         */
        const rdmReward = {
            giftCardName: "Stephen Money Gift Card",
            amount: "MYR 100.00",
            rollover: "X1"
        };

        const giftCardName = document.getElementById("rdmGiftCardName");
        const amount = document.getElementById("rdmAmount");
        const rollover = document.getElementById("rdmRollover");

        if (giftCardName) giftCardName.textContent = rdmReward.giftCardName;
        if (amount) amount.textContent = rdmReward.amount;
        if (rollover) rollover.textContent = rdmReward.rollover;

        document.getElementById("rdmMainStep1")?.classList.remove("rdm-active");
        document.getElementById("rdmMainStep1")?.classList.add("rdm-completed");
        document.getElementById("rdmMainStep2")?.classList.add("rdm-active");

        rdmSummarySection.hidden = false;
        rdmSummarySection.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    });

    rdmCodeInput.addEventListener("input", function () {
        if (rdmCodeInput.value.trim() && rdmError) {
            rdmError.hidden = true;
        }
    });

    // Save Summary as a Cash History record, then open Cash History.
    rdmSaveBtn.addEventListener("click", function () {
        const giftCardName = getText("rdmGiftCardName");
        const amountText = getText("rdmAmount");
        const rollover = getText("rdmRollover");

        if (!giftCardName || !amountText || !rollover) {
            window.alert("Redeem summary details are incomplete.");
            return;
        }

        // Convert e.g. "MYR 100.00" to 100.00 for the Bonus column.
        const bonusValue = Number(amountText.replace(/[^0-9.-]/g, ""));
        if (!Number.isFinite(bonusValue)) {
            window.alert("The reward amount is invalid.");
            return;
        }

        const now = new Date();
        const pad = (value) => String(value).padStart(2, "0");
        const date = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
        const dateTime = `${now.getFullYear()}.${pad(now.getMonth() + 1)}.${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

        const record = {
            date,
            dateTime,
            transactionNo: "RDM" + now.getTime(),
            description: `${giftCardName} (Rollover ${rollover})`,
            type: "Redemption",
            status: "Approved",
            amount: "0.00",
            bonus: bonusValue.toFixed(2),
            giftCardName,
            rewardAmount: amountText,
            rollover
        };

        let records = [];
        try {
            records = JSON.parse(localStorage.getItem("cashHistoryRedeems") || "[]");
            if (!Array.isArray(records)) records = [];
        } catch (error) {
            records = [];
        }

        records.push(record);

        try {
            localStorage.setItem("cashHistoryRedeems", JSON.stringify(records));
        } catch (error) {
            window.alert("Unable to save this record in your browser.");
            return;
        }

        window.location.href = "transaction.html#cashHistoryPage";
    });
});
