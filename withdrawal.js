document.addEventListener("DOMContentLoaded", () => {

   /* =====================================================
       ELEMENTS
    ===================================================== */

    const methods = document.querySelectorAll(".wdr-method");
    const views = document.querySelectorAll(".wdr-view");

    const bankList = document.getElementById("wdrBankList");
    const bankStorageKey = "wdrAddedBankAccounts_v1";
    const hiddenBankStorageKey = "wdrHiddenBankAccounts_v1";
    const bankAmount = document.querySelector(".wdr-bank-amount");
    const bankQuick = document.querySelectorAll("[data-bank-amount]");

    const bankTotal = document.getElementById("wdrBankTotal");
    const bankReceive = document.getElementById("wdrBankReceive");

    const ewalletAmount = document.querySelector(".wdr-ewallet-amount");
    const ewalletQuick = document.querySelectorAll("[data-ewallet-amount]");
    const ewalletTotal = document.getElementById("wdrEwalletTotal");
    const ewalletReceive = document.getElementById("wdrEwalletReceive");

    const modal = document.getElementById("wdrBankModal");
    const addBank = document.getElementById("wdrAddBank");
    const closeBank = document.getElementById("wdrCloseBank");
    const bankForm = document.getElementById("wdrBankForm");
    const toast = document.getElementById("wdrToast");


    /* =====================================================
       HELPERS
    ===================================================== */

    function money(value) {
        const number = Number(value) || 0;
        return number.toLocaleString("en-MY", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    }

    let toastTimer;

    function showToast(message, type = "success") {
        clearTimeout(toastTimer);

        toast.textContent = message;
        toast.className = "wdr-toast is-show " +
            (type === "error" ? "is-error" : "is-success");

        toastTimer = setTimeout(() => {
            toast.classList.remove("is-show");
        }, 2800);
    }


    /* =====================================================
       METHOD SWITCH
       IMPORTANT:
       Only one view exists visually at a time.
    ===================================================== */

    methods.forEach(method => {
        method.addEventListener("click", () => {

            const target = method.dataset.method;

            methods.forEach(item => {
                item.classList.toggle(
                    "is-active",
                    item === method
                );
            });

            views.forEach(view => {
                view.classList.toggle(
                    "is-visible",
                    view.dataset.view === target
                );
            });

        });
    });


    /* =====================================================
       BANK DETAILS: SELECT / EDIT / DELETE
    ===================================================== */
    const bankLogo = document.getElementById("wdrBankLogo");
    const bankAccountDisplay = document.getElementById("wdrBankAccount");
    const bankEditKey = document.getElementById("wdrBankEditKey");
    const bankModalTitle = document.getElementById("wdrBankModalTitle");
    const bankModalText = document.getElementById("wdrBankModalText");
    const bankSaveButton = document.getElementById("wdrBankSaveButton");
    const bankSelect = document.getElementById("wdrNewBank");
    const bankAccountInput = document.getElementById("wdrNewAccount");
    const bankLocationInput = document.getElementById("wdrNewLocation");
    const bankEmptyState = document.getElementById("wdrBankEmptyState");
    const bankWithdrawPanel = document.querySelector('[data-view="bank"] .wdr-withdraw-panel');


/* NEW EDIT ALL BANK ACCOUNTS MODAL */

const bankManagerModal = document.getElementById("wdrBankManagerModal");
const managerRows = document.getElementById("wdrBankManagerRows");
const managerForm = document.getElementById("wdrBankManagerForm");

const addBankRowButton = document.getElementById("wdrAddBankRow");
const closeManagerButton = document.getElementById("wdrCloseBankManager");
const cancelManagerButton = document.getElementById("wdrCancelBankManager");


    const bankLogos = {
        "maybank": "imgs/assets/banks/maybank-transparent.svg",
        "hong leong bank": "imgs/assets/banks/hong-leong.png",
        "cimb bank": "imgs/assets/banks/cimb-light.svg",
        "public bank": "imgs/assets/banks/public.png",
        "rhb": "imgs/assets/banks/rhb-wordmark.png",
        "rhb bank": "imgs/assets/banks/rhb-wordmark.png"
    };

    function getBankLogo(bank) {
        return bankLogos[String(bank || "").trim().toLowerCase()] || "";
    }

    function bankKey(bank, account) {
        return `${bank}::${account}`;
    }

    function getSavedBanks() {
        try { return JSON.parse(localStorage.getItem(bankStorageKey) || "[]"); }
        catch (_) { return []; }
    }

    function setSavedBanks(items) {
        try { localStorage.setItem(bankStorageKey, JSON.stringify(items)); }
        catch (_) { showToast("Could not save bank details in this browser.", "error"); }
    }

    function syncBankState() {
        const rows = bankList ? [...bankList.querySelectorAll(".wdr-bank-row")] : [];
        const hasBank = rows.length > 0;
        if (bankEmptyState) bankEmptyState.hidden = hasBank;
        if (bankWithdrawPanel) bankWithdrawPanel.classList.toggle("is-locked", !hasBank);
        if (addBank) {
            addBank.disabled = rows.length >= 3;
            addBank.title = rows.length >= 3 ? "Maximum 3 bank accounts" : "Add Bank Account";
        }
        const emptyCount = bankEmptyState ? bankEmptyState.querySelector("small") : null;
        if (emptyCount) emptyCount.textContent = `${rows.length} / 3 Accounts`;
    }

    function selectBankRow(row) {
        if (!row) return;
        bankList.querySelectorAll(".wdr-bank-row").forEach(item => {
            item.classList.toggle("is-selected", item === row);
        });
        const bank = row.dataset.bank || "";
        const account = row.dataset.account || "";
        if (bankAccountDisplay) bankAccountDisplay.textContent = account;
        if (bankLogo) {
            const src = getBankLogo(bank);
            if (src) {
                bankLogo.src = src;
                bankLogo.alt = `${bank} logo`;
                bankLogo.hidden = false;
            } else {
                bankLogo.hidden = true;
                bankLogo.alt = `${bank} logo unavailable`;
            }
        }
        try { localStorage.setItem("wdrSelectedBankAccount_v1", JSON.stringify({ bank, account })); } catch (_) {}
    }

    function bindBankRow(row) {
        row.addEventListener("click", () => selectBankRow(row));
    }

    function openBankModalForEdit(row) {
        if (!row || !modal) return;
        bankEditKey.value = bankKey(row.dataset.bank, row.dataset.account);
        bankSelect.value = row.dataset.bank;
        bankAccountInput.value = row.dataset.account;
        bankLocationInput.value = row.dataset.location || "";
        bankModalTitle.textContent = "Edit Bank Account";
        bankModalText.textContent = "Update your bank account details.";
        bankSaveButton.textContent = "Save Changes";
        modal.classList.add("is-open");
    }

    function appendBankRow(row) {
        const wrapper = document.createElement("div");
        wrapper.className = "wdr-bank-item";
        wrapper.appendChild(row);

        const actions = document.createElement("div");
        actions.className = "wdr-bank-actions";

        const editButton = document.createElement("button");
        editButton.type = "button";
        editButton.className = "wdr-bank-action edit";
        editButton.title = "Edit bank account";
        editButton.setAttribute("aria-label", `Edit ${row.dataset.bank} account`);
        editButton.innerHTML = '<i class="fa-solid fa-pen" aria-hidden="true"></i>';
        editButton.addEventListener("click", event => {
            event.preventDefault();
            event.stopPropagation();

            openBankManager();
        });

        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.className = "wdr-bank-action delete";
        deleteButton.title = "Delete bank account";
        deleteButton.setAttribute("aria-label", `Delete ${row.dataset.bank} account`);
        deleteButton.innerHTML = '<i class="fa-solid fa-trash-can" aria-hidden="true"></i>';
        deleteButton.addEventListener("click", event => {
            event.preventDefault();
            event.stopPropagation();
            const oldKey = bankKey(row.dataset.bank, row.dataset.account);
            if (row.dataset.added === "true") {
                setSavedBanks(getSavedBanks().filter(item => bankKey(item.bank, item.account) !== oldKey));
            } else {
                let hidden = [];
                try { hidden = JSON.parse(localStorage.getItem(hiddenBankStorageKey) || "[]"); } catch (_) {}
                if (!hidden.includes(oldKey)) hidden.push(oldKey);
                try { localStorage.setItem(hiddenBankStorageKey, JSON.stringify(hidden)); } catch (_) {}
            }
            const wasSelected = row.classList.contains("is-selected");
            wrapper.remove();
            syncBankState();
            if (wasSelected) {
                try { localStorage.removeItem("wdrSelectedBankAccount_v1"); } catch (_) {}
                const nextRow = bankList.querySelector(".wdr-bank-row");
                if (nextRow) selectBankRow(nextRow);
                else {
                    if (bankAccountDisplay) bankAccountDisplay.textContent = "";
                    if (bankLogo) bankLogo.hidden = true;
                }
            }
            showToast("Bank account deleted successfully.");
        });

        actions.append(editButton, deleteButton);
        wrapper.appendChild(actions);
        bankList.appendChild(wrapper);
        return wrapper;
    }


/* ==========================================
   EDIT ALL BANK ACCOUNTS MANAGER
========================================== */

const bankOptions = [
    "Maybank",
    "Hong Leong Bank",
    "CIMB Bank",
    "Public Bank",
    "RHB Bank"
];

function getCurrentBankAccounts() {

    return [...bankList.querySelectorAll(".wdr-bank-row")].map(row => ({
        bank: row.dataset.bank || "",
        account: row.dataset.account || "",
        location: row.dataset.location || "",
        added: row.dataset.added === "true"
    }));

}


/* RENDER BANK TABLE */


function renderManagerRows(accounts) {

    managerRows.innerHTML = "";

    accounts.forEach((item, index) => {

        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td>${index + 1}</td>

            <td>
                <div class="wdr-bank-select">

                    <input type="hidden"
                        class="manager-bank"
                        value="${escapeHtml(item.bank)}">

                    <button type="button"
                        class="manager-bank-trigger">

                        <span class="manager-bank-selected"></span>

                        <i class="fa-solid fa-chevron-down"></i>

                    </button>

                    <div class="manager-bank-menu" hidden></div>

                </div>
            </td>

            <td>
                <input type="text"
                    class="wdr-manager-input manager-account"
                    value="${escapeHtml(item.account)}"
                    placeholder="Account Number"
                    required>
            </td>

            <td>
                <input type="text"
                    class="wdr-manager-input manager-location"
                    value="${escapeHtml(item.location)}"
                    placeholder="Location"
                    required>
            </td>

            <td>
                <button type="button"
                    class="wdr-manager-delete"
                    title="Delete account">
                    <i class="fa-solid fa-trash-can"></i>
                </button>
            </td>
        `;

        const hiddenInput = tr.querySelector(".manager-bank");
        const trigger = tr.querySelector(".manager-bank-trigger");
        const selectedDisplay = tr.querySelector(".manager-bank-selected");
        const menu = tr.querySelector(".manager-bank-menu");

        function updateSelectedBank(bank) {

            hiddenInput.value = bank;

            const logo = getBankLogo(bank);

            selectedDisplay.innerHTML = `
                ${logo ? `<img src="${logo}" alt="">` : ""}
                <span>${escapeHtml(bank)}</span>
            `;

        }

        // CREATE BANK OPTIONS

        bankOptions.forEach(bank => {

            const logo = getBankLogo(bank);

            const option = document.createElement("button");

            option.type = "button";
            option.className = "manager-bank-option";

            option.innerHTML = `
                ${logo ? `<img src="${logo}" alt="">` : ""}
                <span>${escapeHtml(bank)}</span>
            `;

            option.addEventListener("click", () => {

                updateSelectedBank(bank);

                menu.hidden = true;

            });

            menu.appendChild(option);

        });

        // OPEN / CLOSE DROPDOWN

        trigger.addEventListener("click", event => {

            event.stopPropagation();

            document.querySelectorAll(".manager-bank-menu").forEach(other => {
                if (other !== menu) other.hidden = true;
            });

            menu.hidden = !menu.hidden;

        });

        menu.addEventListener("click", event => {
            event.stopPropagation();
        });

if (item.bank) {

    updateSelectedBank(item.bank);

} else {

    selectedDisplay.innerHTML = `
        <span class="manager-bank-placeholder">
            Select Bank
        </span>
    `;

}

        // DELETE ROW

        tr.querySelector(".wdr-manager-delete")
            .addEventListener("click", () => {

                tr.remove();
                updateManagerNumbers();

            });

        managerRows.appendChild(tr);

    });

    updateManagerNumbers();

}


// CLOSE DROPDOWN WHEN CLICK OUTSIDE
document.addEventListener("click", () => {

    document.querySelectorAll(".manager-bank-menu").forEach(menu => {
        menu.hidden = true;
    });

});


/* UPDATE ROW NUMBER */

function updateManagerNumbers() {

    const rows = [...managerRows.querySelectorAll("tr")];

    rows.forEach((row, index) => {
        row.cells[0].textContent = index + 1;
    });

    if (addBankRowButton) {

        addBankRowButton.disabled = rows.length >= 3;

    }

}



/* ==========================================
   OPEN MANAGER POPUP
========================================== */

function openBankManager() {

    if (!bankManagerModal || !managerRows) {
        console.error("Bank Manager Modal not found.");
        return;
    }

    const accounts = getCurrentBankAccounts();

    renderManagerRows(accounts);

    bankManagerModal.classList.add("is-open");
    bankManagerModal.setAttribute("aria-hidden", "false");

}


/* ==========================================
   MOBILE HEADER EDIT BUTTON
========================================== */

const editBankHeaderButton = document.getElementById("wdrEditBank");

if (editBankHeaderButton) {
    editBankHeaderButton.addEventListener("click", function(event) {
        event.preventDefault();
        event.stopPropagation();

        openBankManager();
    });
}


/* ADD ROW */

if (addBankRowButton) {

    addBankRowButton.addEventListener("click", () => {

        const currentRows = [...managerRows.querySelectorAll("tr")];

        if (currentRows.length >= 3) {

            showToast("Maximum 3 bank accounts.", "error");
            return;

        }

        const accounts = currentRows.map(row => ({
            bank: row.querySelector(".manager-bank").value,
            account: row.querySelector(".manager-account").value,
            location: row.querySelector(".manager-location").value
        }));

        accounts.push({
            bank: "",
            account: "",
            location: ""
        });

        renderManagerRows(accounts);

    });

}


/* CLOSE MANAGER POPUP */

function closeBankManager() {

    bankManagerModal.classList.remove("is-open");

}

if (closeManagerButton) {

    closeManagerButton.addEventListener("click", closeBankManager);

}

if (cancelManagerButton) {

    cancelManagerButton.addEventListener("click", closeBankManager);

}

if (bankManagerModal) {

    bankManagerModal.addEventListener("click", event => {

        if (event.target === bankManagerModal) {
            closeBankManager();
        }

    });

}


/* SAVE ALL BANK ACCOUNTS */

if (managerForm) {

    managerForm.addEventListener("submit", event => {

        event.preventDefault();

        const rows = [...managerRows.querySelectorAll("tr")];

        const accounts = rows.map(row => ({
            bank: row.querySelector(".manager-bank").value.trim(),
            account: row.querySelector(".manager-account").value.trim(),
            location: row.querySelector(".manager-location").value.trim()
        }));


        // VALIDATE EMPTY FIELDS

        if (accounts.some(item =>
            !item.bank || !item.account || !item.location
        )) {

            showToast("Please complete all bank details.", "error");
            return;

        }


        // VALIDATE MAXIMUM 3

        if (accounts.length > 3) {

            showToast("Maximum 3 bank accounts.", "error");
            return;

        }


        // CHECK DUPLICATES

        const accountKeys = accounts.map(item =>
            bankKey(item.bank.toLowerCase(), item.account)
        );

        if (new Set(accountKeys).size !== accountKeys.length) {

            showToast("Duplicate bank accounts are not allowed.", "error");
            return;

        }


        // GET ORIGINAL BANKS

        const originalBanks = getCurrentBankAccounts();

        let hiddenBanks = [];

        try {

            hiddenBanks = JSON.parse(
                localStorage.getItem(hiddenBankStorageKey) || "[]"
            );

        } catch (_) {}


        // HIDE ORIGINAL BUILT-IN BANKS

        originalBanks.forEach(item => {

            if (!item.added) {

                const key = bankKey(item.bank, item.account);

                if (!hiddenBanks.includes(key)) {
                    hiddenBanks.push(key);
                }

            }

        });

        try {

            localStorage.setItem(
                hiddenBankStorageKey,
                JSON.stringify(hiddenBanks)
            );

        } catch (_) {}


        // KEEP SELECTED BANK IF STILL AVAILABLE

        let selectedBank = null;

        try {

            selectedBank = JSON.parse(
                localStorage.getItem("wdrSelectedBankAccount_v1") || "null"
            );

        } catch (_) {}


        // SAVE ALL ACCOUNTS

        setSavedBanks(accounts);


        // REBUILD BANK CARDS

        bankList.innerHTML = "";

        accounts.forEach(item => {

            const row = createBankRow({
                bank: item.bank,
                account: item.account,
                location: item.location,
                added: true
            });

            appendBankRow(row);

        });


        // RESTORE SELECTED BANK

        let selectedRow = null;

        if (selectedBank) {

            selectedRow = [...bankList.querySelectorAll(".wdr-bank-row")]
                .find(row =>
                    row.dataset.bank === selectedBank.bank &&
                    row.dataset.account === selectedBank.account
                );

        }

        if (!selectedRow) {

            selectedRow = bankList.querySelector(".wdr-bank-row");

        }

        if (selectedRow) {

            selectBankRow(selectedRow);

        } else {

            try {
                localStorage.removeItem("wdrSelectedBankAccount_v1");
            } catch (_) {}

            if (bankAccountDisplay) {
                bankAccountDisplay.textContent = "";
            }

            if (bankLogo) {
                bankLogo.hidden = true;
            }

        }


        // UPDATE BANK STATE

        syncBankState();


        // CLOSE POPUP

        closeBankManager();

        showToast("Bank accounts updated successfully.");

    });

}


    function createBankRow({ bank, account, location = "", added = true }) {
        const row = document.createElement("button");
        row.type = "button";
        row.className = "wdr-bank-row";
        const logoSrc = getBankLogo(bank);
        const bankMark = String(bank || "").split(/\s+/).map(part => part[0] || "").join("").slice(0, 3);
        row.dataset.bank = bank;
        row.dataset.account = account;
        row.dataset.location = location;
        row.dataset.added = added ? "true" : "false";
        row.innerHTML = `
            <span class="wdr-bank-logo ${logoSrc ? "" : "wdr-bank-logo-fallback"}">
                ${logoSrc ? `<img src="${logoSrc}" alt="${escapeHtml(bank)} logo">` : `<span aria-label="${escapeHtml(bank)}">${escapeHtml(bankMark)}</span>`}
            </span>
            <span class="wdr-bank-data"><p>${escapeHtml(bank)}</p><span>${escapeHtml(account)}</span></span>
            <span class="wdr-radio"></span>`;
        bindBankRow(row);
        return row;
    }

    // Restore saved accounts and wrap any bank rows already present in the HTML.
    try {
        const hiddenBanks = JSON.parse(localStorage.getItem(hiddenBankStorageKey) || "[]");
        [...bankList.querySelectorAll(".wdr-bank-row")].forEach(row => {
            if (hiddenBanks.includes(bankKey(row.dataset.bank, row.dataset.account))) { row.remove(); return; }
            if (!row.dataset.location) row.dataset.location = "";
            bindBankRow(row);
            const parent = row.parentElement;
            if (parent === bankList) appendBankRow(row);
            else if (!parent.classList.contains("wdr-bank-item")) {
                const wrap = document.createElement("div"); wrap.className = "wdr-bank-item";
                parent.insertBefore(wrap, row); wrap.appendChild(row);
            }
        });
        getSavedBanks().forEach(item => appendBankRow(createBankRow(item)));
        const selectedBank = JSON.parse(localStorage.getItem("wdrSelectedBankAccount_v1") || "null");
        if (selectedBank) {
            const selectedRow = [...bankList.querySelectorAll(".wdr-bank-row")].find(row =>
                row.dataset.bank === selectedBank.bank && row.dataset.account === selectedBank.account);
            if (selectedRow) selectBankRow(selectedRow);
            else if (bankLogo) bankLogo.hidden = true;
        } else {
            const firstRow = bankList.querySelector(".wdr-bank-row");
            if (firstRow) selectBankRow(firstRow);
            else {
                if (bankLogo) bankLogo.hidden = true;
                if (bankAccountDisplay) bankAccountDisplay.textContent = "";
            }
        }
    } catch (error) { console.warn("Could not restore saved bank accounts.", error); }
    syncBankState();

    /* =====================================================
       BANK AMOUNT
    ===================================================== */

    function updateBankAmount() {
        const value = Number(bankAmount.value) || 0;

        bankTotal.textContent = `MYR ${money(value)}`;
        bankReceive.textContent = `MYR ${money(value)}`;

        bankQuick.forEach(button => {
            button.classList.toggle(
                "is-active",
                Number(button.dataset.bankAmount) === value
            );
        });
    }

    bankAmount.addEventListener("input", updateBankAmount);

    bankQuick.forEach(button => {
        button.addEventListener("click", () => {
            bankAmount.value = button.dataset.bankAmount;
            updateBankAmount();
        });
    });


    /* =====================================================
       FIRST-TIME ACCOUNT SETUP STATES
    ===================================================== */

/* =====================================================
   FIRST-TIME ACCOUNT SETUP STATES
===================================================== */

const ewalletIdInput = document.getElementById("wdrSklpayId");
const saveEwalletButton = document.getElementById("wdrSaveEwalletDetails");
const ewalletWithdrawPanel = document.querySelector('[data-view="ewallet"] .wdr-withdraw-panel');

const ewalletStorageKey = "wdrSklpayAccount_v1";

function syncEwalletState() {
    let saved = "";

    try {
        saved = localStorage.getItem(ewalletStorageKey) || "";
    } catch (error) {}

    const ready = !!saved;

    if (ewalletIdInput) {
        if (ready) {
            ewalletIdInput.value = saved;
            ewalletIdInput.readOnly = true;
        } else {
            ewalletIdInput.readOnly = false;
        }
    }

    // Hide Save button after account is saved
    if (saveEwalletButton) {
        saveEwalletButton.hidden = ready;
    }

    // Unlock withdrawal panel after account is saved
    if (ewalletWithdrawPanel) {
        ewalletWithdrawPanel.classList.toggle("is-locked", !ready);
    }
}

// Save account details - first time only
if (saveEwalletButton) {
    saveEwalletButton.addEventListener("click", () => {

        const value = ewalletIdInput
            ? ewalletIdInput.value.trim()
            : "";

        if (!value) {
            showToast("Please enter your SKLPay ID / Mobile Number.", "error");
            return;
        }

        try {
            localStorage.setItem(ewalletStorageKey, value);
        } catch (error) {}

        syncEwalletState();

        showToast("SKLPay account details saved successfully.");
    });
}

// Restore saved account on page load
syncEwalletState();



function setupSavedId(inputId, formId, storageKey, methodName) {
    const input = document.getElementById(inputId);
    const form = document.getElementById(formId);

    if (!input || !form) return;

    const controls = [
        ...form.querySelectorAll(
            ".wdr-withdraw-top, .wdr-amount-note, .wdr-quick, .wdr-submit"
        )
    ];

    let saved = "";

    try {
        saved = localStorage.getItem(storageKey) || "";
    } catch (_) {}

    if (saved) input.value = saved;

    const save = document.createElement("button");
    save.type = "button";
    save.className = "wdr-outline-btn wdr-setup-save";
    save.textContent = "Save Account Details";

    input.insertAdjacentElement("afterend", save);

    const toggle = ready => {
        controls.forEach(el => {
            el.hidden = !ready;
        });

        input.readOnly = ready;
        save.hidden = ready;
    };

    toggle(!!saved);

    save.addEventListener("click", () => {
        const value = input.value.trim();

        if (!value) {
            showToast(`Please enter your ${methodName}.`, "error");
            return;
        }

        try {
            localStorage.setItem(storageKey, value);
        } catch (_) {}

        toggle(true);
        showToast(`${methodName} saved successfully.`);
    });
}

    setupSavedId("wdrA9Username", "wdrA9Form", "wdrA9Username_v2", "A9wallet / G2point username");
    setupSavedId("wdrTngId", "wdrTngForm", "wdrTngId_v2", "Touch'N Go ID");

    /* =====================================================
       EWALLET AMOUNT
    ===================================================== */

    function updateEwalletAmount() {
        const value = Number(ewalletAmount.value) || 0;

        ewalletTotal.textContent = `MYR ${money(value)}`;
        ewalletReceive.textContent = `MYR ${money(value)}`;

        ewalletQuick.forEach(button => {
            button.classList.toggle(
                "is-active",
                Number(button.dataset.ewalletAmount) === value
            );
        });
    }

    ewalletAmount.addEventListener("input", updateEwalletAmount);

    ewalletQuick.forEach(button => {
        button.addEventListener("click", () => {
            ewalletAmount.value = button.dataset.ewalletAmount;
            updateEwalletAmount();
        });
    });



    /* =====================================================
       CRYPTO OPTIONS + WALLET ADDRESS SETUP
    ===================================================== */
    const cryptoRows = document.querySelectorAll(".wdr-crypto-row");
    const cryptoAddressLabel = document.getElementById("wdrCryptoAddressLabel");
    const cryptoAddressValue = document.getElementById("wdrCryptoAddressValue");
    const cryptoAddressSymbol = document.getElementById("wdrCryptoAddressSymbol");
    const cryptoSelected = document.getElementById("wdrCryptoSelected");
    const cryptoAmount = document.querySelector(".wdr-crypto-amount");
    const cryptoTotal = document.getElementById("wdrCryptoTotal");
    const cryptoReceive = document.getElementById("wdrCryptoReceive");
    const cryptoQuick = document.querySelectorAll("[data-crypto-amount]");
    const cryptoWalletModal = document.getElementById("wdrCryptoWalletModal");
    const setCryptoWallet = document.getElementById("wdrSetCryptoWallet");
    const closeCryptoWallet = document.getElementById("wdrCloseCryptoWallet");
    const cryptoWalletForm = document.getElementById("wdrCryptoWalletForm");
    const cryptoWalletInput = document.getElementById("wdrCryptoWalletInput");
    const cryptoWalletModalTitle = document.getElementById("wdrCryptoWalletModalTitle");
    const cryptoWalletModalDescription = document.getElementById("wdrCryptoWalletModalDescription");
    const cryptoWalletStorageKey = "wdrCryptoWalletAddresses";
    let cryptoWallets = {};

    try {
        cryptoWallets = JSON.parse(localStorage.getItem(cryptoWalletStorageKey) || "{}") || {};
    } catch (error) {
        cryptoWallets = {};
    }

    function getSelectedCryptoRow() {
        return document.querySelector(".wdr-crypto-row.is-selected") || cryptoRows[0] || null;
    }

    function getSelectedCryptoKey() {
        const row = getSelectedCryptoRow();
        return row ? row.dataset.crypto : "";
    }

    const initialCryptoWithdrawPanel = document.querySelector('[data-view="crypto"] .wdr-crypto-withdraw');
    if (initialCryptoWithdrawPanel) initialCryptoWithdrawPanel.classList.add("is-locked");

    function renderCryptoWallet() {
        const row = getSelectedCryptoRow();
        if (!row) return;
        const cryptoName = row.dataset.crypto;
        const address = cryptoWallets[cryptoName] || "";
        if (cryptoAddressLabel) cryptoAddressLabel.textContent = row.dataset.addressLabel;
        if (cryptoSelected) cryptoSelected.textContent = cryptoName;
        if (cryptoAddressValue) cryptoAddressValue.textContent = address || "Please set up your wallet address";
        if (cryptoAddressSymbol) {
    const rowSymbol = row.querySelector(".wdr-crypto-symbol");

    cryptoAddressSymbol.className =
        "wdr-crypto-symbol wdr-crypto-address-symbol";

    cryptoAddressSymbol.innerHTML = rowSymbol
        ? rowSymbol.innerHTML
        : "";

    if (rowSymbol) {
        rowSymbol.classList.forEach(className => {
            if (className !== "wdr-crypto-symbol") {
                cryptoAddressSymbol.classList.add(className);
            }
        });
    }
}
        if (setCryptoWallet) setCryptoWallet.innerHTML = address ? "<span>✎</span> Edit Wallet Address" : "<span>+</span> Set Wallet Address";
        const cryptoWithdrawPanel = document.querySelector('[data-view="crypto"] .wdr-crypto-withdraw');
        if (cryptoWithdrawPanel) cryptoWithdrawPanel.classList.toggle("is-locked", !address);
    }

    cryptoRows.forEach(row => {
        row.addEventListener("click", () => {
            cryptoRows.forEach(item => item.classList.toggle("is-selected", item === row));
            renderCryptoWallet();
        });
    });

    function updateCryptoAmount() {
        if (!cryptoAmount) return;
        const value = Number(cryptoAmount.value) || 0;
        if (cryptoTotal) cryptoTotal.textContent = `MYR ${money(value)}`;
        if (cryptoReceive) cryptoReceive.textContent = `MYR ${money(value)}`;
        cryptoQuick.forEach(button => button.classList.toggle("is-active", Number(button.dataset.cryptoAmount) === value));
    }
    if (cryptoAmount) cryptoAmount.addEventListener("input", updateCryptoAmount);
    cryptoQuick.forEach(button => button.addEventListener("click", () => {
        if (!cryptoAmount) return;
        cryptoAmount.value = button.dataset.cryptoAmount;
        updateCryptoAmount();
    }));

    function openCryptoWalletModal() {
        const row = getSelectedCryptoRow();
        if (!row || !cryptoWalletModal) return;
        const cryptoName = row.dataset.crypto;
        const address = cryptoWallets[cryptoName] || "";
        if (cryptoWalletModalTitle) cryptoWalletModalTitle.textContent = address ? "Edit Wallet Address" : "Set Wallet Address";
        if (cryptoWalletModalDescription) cryptoWalletModalDescription.textContent = `Enter the wallet address for ${cryptoName}. Make sure it matches the selected network.`;
        if (cryptoWalletInput) cryptoWalletInput.value = address;
        cryptoWalletModal.classList.add("is-open");
        cryptoWalletModal.setAttribute("aria-hidden", "false");
        window.setTimeout(() => cryptoWalletInput && cryptoWalletInput.focus(), 50);
    }

    function closeCryptoWalletModal() {
        if (!cryptoWalletModal) return;
        cryptoWalletModal.classList.remove("is-open");
        cryptoWalletModal.setAttribute("aria-hidden", "true");
    }

    if (setCryptoWallet) setCryptoWallet.addEventListener("click", openCryptoWalletModal);
    if (closeCryptoWallet) closeCryptoWallet.addEventListener("click", closeCryptoWalletModal);
    if (cryptoWalletModal) cryptoWalletModal.addEventListener("click", event => {
        if (event.target === cryptoWalletModal) closeCryptoWalletModal();
    });

    if (cryptoWalletForm) cryptoWalletForm.addEventListener("submit", event => {
        event.preventDefault();
        const cryptoName = getSelectedCryptoKey();
        const address = cryptoWalletInput ? cryptoWalletInput.value.trim() : "";
        if (!cryptoName || !address) {
            showToast("Please enter your wallet address.", "error");
            return;
        }
        cryptoWallets[cryptoName] = address;
        try {
            localStorage.setItem(cryptoWalletStorageKey, JSON.stringify(cryptoWallets));
        } catch (error) {
            // Keep the saved address in this page session if browser storage is unavailable.
        }
        renderCryptoWallet();
        closeCryptoWalletModal();
        showToast("Wallet address saved successfully.");
    });

    /* =====================================================
       ADD / EDIT BANK MODAL
    ===================================================== */
    if (addBank) addBank.addEventListener("click", () => {
        if (addBank.disabled) return;
        bankForm.reset();
        bankEditKey.value = "";
        bankModalTitle.textContent = "Add Bank Account";
        bankModalText.textContent = "Add your bank account details.";
        bankSaveButton.textContent = "Add Bank Account";
        modal.classList.add("is-open");
    });
    if (closeBank) closeBank.addEventListener("click", () => modal.classList.remove("is-open"));
    if (modal) modal.addEventListener("click", event => {
        if (event.target === modal) modal.classList.remove("is-open");
    });

    /* =====================================================
       SAVE BANK (ADD OR EDIT)
    ===================================================== */
    bankForm.addEventListener("submit", event => {
        event.preventDefault();
        const bank = bankSelect.value;
        const account = bankAccountInput.value.trim();
        const location = bankLocationInput.value.trim();
        const editKey = bankEditKey.value;
        if (!bank || !account || !location) {
            showToast("Please complete all bank details.", "error");
            return;
        }

        const currentRows = [...bankList.querySelectorAll(".wdr-bank-row")];
        if (!editKey && currentRows.length >= 3) {
            showToast("You can add a maximum of 3 bank accounts.", "error");
            return;
        }
        const duplicate = currentRows.find(row =>
            row !== currentRows.find(item => bankKey(item.dataset.bank, item.dataset.account) === editKey) &&
            row.dataset.bank.toLowerCase() === bank.toLowerCase() && row.dataset.account === account);
        if (duplicate) {
            showToast("This bank account already exists.", "error");
            return;
        }

        if (editKey) {
            const oldRow = currentRows.find(row => bankKey(row.dataset.bank, row.dataset.account) === editKey);
            if (!oldRow) { showToast("Bank account could not be found. Please refresh and try again.", "error"); return; }
            const oldKey = bankKey(oldRow.dataset.bank, oldRow.dataset.account);
            const wasSelected = oldRow.classList.contains("is-selected");
            const oldWasAdded = oldRow.dataset.added === "true";
            const newRow = createBankRow({ bank, account, location, added: true });
            const oldWrapper = oldRow.closest(".wdr-bank-item");
            const newWrapper = appendBankRow(newRow);
            oldWrapper.replaceWith(newWrapper);
            // If the edited account was a built-in row, hide its original entry.
            if (!oldWasAdded) {
                let hidden = [];
                try { hidden = JSON.parse(localStorage.getItem(hiddenBankStorageKey) || "[]"); } catch (_) {}
                if (!hidden.includes(oldKey)) hidden.push(oldKey);
                try { localStorage.setItem(hiddenBankStorageKey, JSON.stringify(hidden)); } catch (_) {}
            }
            const saved = getSavedBanks().filter(item => bankKey(item.bank, item.account) !== oldKey);
            saved.push({ bank, account, location });
            setSavedBanks(saved);
            const selectedRow = [...bankList.querySelectorAll(".wdr-bank-row")].find(row =>
                row.dataset.bank === bank && row.dataset.account === account);
            if (wasSelected && selectedRow) selectBankRow(selectedRow);
            showToast("Bank account updated successfully.");
        } else {
            const rowData = { bank, account, location };
            const row = createBankRow(rowData);
            appendBankRow(row);
            const saved = getSavedBanks(); saved.push(rowData); setSavedBanks(saved);
            selectBankRow(row);
            showToast("Bank account added successfully.");
        }
        syncBankState();
        bankForm.reset();
        bankEditKey.value = "";
        modal.classList.remove("is-open");
    });

    /* =====================================================
       WALLET ADDRESS
    ===================================================== */

    const setWalletButton = document.getElementById("wdrSetWallet");
    if (setWalletButton) setWalletButton.addEventListener("click", () => {
        showToast("SKLPay wallet setup is not connected in this front-end demo.", "error");
    });


    /* =====================================================
       SUBMIT
    ===================================================== */

    document.querySelectorAll("[data-submit]").forEach(button => {

        button.addEventListener("click", () => {

            const type = button.dataset.submit;
            const input = type === "bank" ? bankAmount : type === "crypto" ? cryptoAmount : ewalletAmount;
            if (!input) return;
            const value = Number(input.value) || 0;

            if (value < 50) {
                showToast("Minimum withdrawal amount is MYR 50.", "error");
                input.focus();
                return;
            }

            if (type === "ewallet") {
                showToast("Please make sure your SKLPay wallet is verified.");
                return;
            }
            if (type === "crypto") {
                const selectedCrypto = getSelectedCryptoKey();
                if (!cryptoWallets[selectedCrypto]) {
                    showToast("Please set up your wallet address first.", "error");
                    if (setCryptoWallet) setCryptoWallet.focus();
                    return;
                }
                showToast("Demo only: wallet address is saved, but withdrawal processing needs backend integration.");
                return;
            }

            showToast(`Withdrawal request submitted: MYR ${money(value)}`);
        });

    });


    /* =====================================================
       SAFE TEXT
    ===================================================== */

    function escapeHtml(value) {
        return value.replace(/[&<>"']/g, char => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;"
        }[char]));
    }


    updateBankAmount();
    updateEwalletAmount();
    renderCryptoWallet();
    updateCryptoAmount();

});


/* =====================================================
   COMPACT REJECTED WITHDRAWAL NOTICE
===================================================== */
const rejectedNotice = document.getElementById("wdrResubmitCard");
const resubmitTrigger = document.getElementById("wdrResubmitButton");
const resubmitModal = document.getElementById("wdrResubmitModal");
const confirmResubmit = document.getElementById("wdrConfirmResubmit");
const closeResubmitModal = document.getElementById("wdrCloseResubmit");

if (resubmitTrigger && resubmitModal) {
    resubmitTrigger.addEventListener("click", () => {
        resubmitModal.classList.add("is-open");
        resubmitModal.setAttribute("aria-hidden", "false");
    });
}

if (closeResubmitModal && resubmitModal) {
    closeResubmitModal.addEventListener("click", () => {
        resubmitModal.classList.remove("is-open");
        resubmitModal.setAttribute("aria-hidden", "true");
    });
}

if (confirmResubmit && resubmitModal) {
    confirmResubmit.addEventListener("click", () => {
        resubmitModal.classList.remove("is-open");
        resubmitModal.setAttribute("aria-hidden", "true");
        if (rejectedNotice) rejectedNotice.setAttribute("hidden", "");
        if (typeof showToast === "function") {
            showToast("Demo only: resubmission requires backend integration.");
        }
    });
}
