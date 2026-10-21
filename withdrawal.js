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

    const bankName = document.getElementById("wdrBankName");
    const bankAccount = document.getElementById("wdrBankAccount");
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
       BANK SELECTION
    ===================================================== */

    function bindBankRow(row) {
        row.addEventListener("click", () => {
            bankList.querySelectorAll(".wdr-bank-row").forEach(item => {
                item.classList.toggle("is-selected", item === row);
            });

            bankName.textContent = row.dataset.bank;
            bankAccount.textContent = row.dataset.account;
            localStorage.setItem("wdrSelectedBankAccount_v1", JSON.stringify({
                bank: row.dataset.bank,
                account: row.dataset.account
            }));
        });
    }

    function bankKey(bank, account) {
        return `${bank}::${account}`;
    }

    function appendBankRow(row) {
        const wrapper = document.createElement("div");
        wrapper.className = "wdr-bank-item";
        wrapper.appendChild(row);

        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.className = "wdr-bank-delete";
        deleteButton.setAttribute("aria-label", `Delete ${row.dataset.bank} account`);
        deleteButton.title = "Delete bank account";
        deleteButton.innerHTML = '<i class="fa-solid fa-trash-can" aria-hidden="true"></i>';
        deleteButton.addEventListener("click", event => {
            event.preventDefault();
            event.stopPropagation();

            const bank = row.dataset.bank;
            const account = row.dataset.account;
            const key = bankKey(bank, account);

            if (row.dataset.added === "true") {
                const savedBanks = JSON.parse(localStorage.getItem(bankStorageKey) || "[]");
                localStorage.setItem(bankStorageKey, JSON.stringify(savedBanks.filter(item => bankKey(item.bank, item.account) !== key)));
            } else {
                const hiddenBanks = JSON.parse(localStorage.getItem(hiddenBankStorageKey) || "[]");
                if (!hiddenBanks.includes(key)) hiddenBanks.push(key);
                localStorage.setItem(hiddenBankStorageKey, JSON.stringify(hiddenBanks));
            }

            const wasSelected = row.classList.contains("is-selected");
            wrapper.remove();

            if (wasSelected) {
                localStorage.removeItem("wdrSelectedBankAccount_v1");
                const nextRow = bankList.querySelector(".wdr-bank-row");
                if (nextRow) nextRow.click();
                else {
                    bankName.textContent = "No bank selected";
                    bankAccount.textContent = "";
                }
            }
            showToast("Bank account deleted successfully.");
        });
        wrapper.appendChild(deleteButton);
        bankList.appendChild(wrapper);
        return wrapper;
    }

    function createBankRow({ bank, account, location = "" }) {
        const row = document.createElement("button");
        row.type = "button";
        row.className = "wdr-bank-row";

        const bankLogos = {
            "Maybank": "imgs/assets/banks/maybank-transparent.svg",
            "Hong Leong Bank": "imgs/assets/banks/hong-leong.png",
            "CIMB Bank": "imgs/assets/banks/cimb-light.svg"
        };
        const logoSrc = bankLogos[bank];
        const bankMark = bank.split(/\s+/).map(part => part[0]).join("").slice(0, 3);

        row.dataset.bank = bank;
        row.dataset.account = account;
        row.dataset.location = location;
        row.dataset.added = "true";
        row.innerHTML = `
            <span class="wdr-bank-logo ${logoSrc ? "" : "wdr-bank-logo-fallback"}">
                ${logoSrc
                    ? `<img src="${logoSrc}" alt="${escapeHtml(bank)} logo">`
                    : `<span aria-label="${escapeHtml(bank)}">${escapeHtml(bankMark)}</span>`}
            </span>
            <span class="wdr-bank-data">
                <p>${escapeHtml(bank)}</p>
                <span>${escapeHtml(account)}</span>
            </span>
            <span class="wdr-radio"></span>
        `;
        bindBankRow(row);
        return row;
    }

    // Wrap the built-in bank rows so their delete controls can sit beside (not inside) each row button.
    try {
        const hiddenBanks = JSON.parse(localStorage.getItem(hiddenBankStorageKey) || "[]");
        [...bankList.querySelectorAll(".wdr-bank-row")].forEach(row => {
            if (hiddenBanks.includes(bankKey(row.dataset.bank, row.dataset.account))) {
                row.remove();
                return;
            }
            bindBankRow(row);
            appendBankRow(row);
        });

        // Restore bank accounts added previously in this browser.
        const savedBanks = JSON.parse(localStorage.getItem(bankStorageKey) || "[]");
        savedBanks.forEach(item => appendBankRow(createBankRow(item)));
        const selectedBank = JSON.parse(localStorage.getItem("wdrSelectedBankAccount_v1") || "null");
        if (selectedBank) {
            const selectedRow = [...bankList.querySelectorAll(".wdr-bank-row")].find(row =>
                row.dataset.bank === selectedBank.bank && row.dataset.account === selectedBank.account
            );
            if (selectedRow) selectedRow.click();
        }
    } catch (error) {
        console.warn("Could not restore saved bank accounts.", error);
    }


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
       ADD BANK MODAL
    ===================================================== */

    addBank.addEventListener("click", () => {
        modal.classList.add("is-open");
    });

    closeBank.addEventListener("click", () => {
        modal.classList.remove("is-open");
    });

    modal.addEventListener("click", event => {
        if (event.target === modal) {
            modal.classList.remove("is-open");
        }
    });


    /* =====================================================
       ADD BANK
    ===================================================== */

    bankForm.addEventListener("submit", event => {
        event.preventDefault();

        const bank = document.getElementById("wdrNewBank").value;
        const account = document.getElementById("wdrNewAccount").value.trim();
        const location = document.getElementById("wdrNewLocation").value.trim();

        if (!bank || !account || !location) {
            showToast("Please complete all bank details.", "error");
            return;
        }

        const rowData = { bank, account, location };
        const row = createBankRow(rowData);
        appendBankRow(row);

        try {
            const savedBanks = JSON.parse(localStorage.getItem(bankStorageKey) || "[]");
            savedBanks.push(rowData);
            localStorage.setItem(bankStorageKey, JSON.stringify(savedBanks));
        } catch (error) {
            showToast("Bank added for this session, but browser storage is unavailable.", "error");
        }

        row.click();

        bankForm.reset();
        modal.classList.remove("is-open");

        showToast("Bank account added successfully.");
    });


    /* =====================================================
       WALLET ADDRESS
    ===================================================== */

    document.getElementById("wdrSetWallet").addEventListener("click", () => {
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
