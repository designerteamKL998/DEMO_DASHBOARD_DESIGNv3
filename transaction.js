(() => {
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const today = new Date();
  const dateInputValue = (date) => {
    const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    return local.toISOString().slice(0, 10);
  };
  const formatActivityDate = (value) => {
    const date = new Date(`${value}T12:00:00`);
    return `${value.replaceAll('-', '/')}, ${date.toLocaleDateString('en-US', { weekday: 'long' })}`;
  };
  const start = $('#startDate');
  const end = $('#endDate');
  const detailStart = $('#detailStartDate');
  const detailEnd = $('#detailEndDate');
  const todayValue = dateInputValue(today);
  [start, end, detailStart, detailEnd].forEach(input => {
    if (input) input.value = todayValue;
  });

  let toastTimer;
  function showToast(message) {
    const toast = $('#toast');
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 2500);
  }
  function validDateRange(from, to) {
    if (!from || !to) {
      showToast('Please select both dates.');
      return false;
    }
    if (from > to) {
      showToast('Start date cannot be later than end date.');
      return false;
    }
    return true;
  }

  $('#filterForm').addEventListener('submit', event => {
    event.preventDefault();
    if (!validDateRange(start.value, end.value)) return;
    $('#activityDate').textContent = formatActivityDate(end.value);
    showToast(`Statement updated: ${start.value} to ${end.value}`);
  });

  $('#categoryToggle').addEventListener('click', () => {
    const panel = $('.category-panel');
    const collapsed = panel.classList.toggle('collapsed');
    $('#categoryToggle').setAttribute('aria-expanded', String(!collapsed));
    $('#categoryToggle').setAttribute('aria-label', collapsed ? 'Expand amount by category' : 'Collapse amount by category');
    $('#categoryToggle .chevron-up').style.transform = collapsed ? 'rotate(225deg) translateY(3px)' : '';
  });

  const dashboardPage = $('#dashboardPage');
  const detailsPage = $('#detailsPage');
  function openDetails() {
    detailsPage.classList.remove('hidden');
    dashboardPage.classList.add('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (detailStart && start) detailStart.value = start.value;
    if (detailEnd && end) detailEnd.value = end.value;
  }
  function backToDashboard() {
    dashboardPage.classList.remove('hidden');
    detailsPage.classList.add('hidden');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  $('#viewDetailsBtn').addEventListener('click', openDetails);
  // Transactions button is handled by the Cash History section below.
  // Total Outstanding card/arrow opens the same destination as the MyBets tab.
  const outstandingCard = $('#outstandingCard');
  if (outstandingCard) {
    const openMyBets = () => { window.location.href = 'mybets.html'; };
    outstandingCard.addEventListener('click', openMyBets);
    outstandingCard.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        openMyBets();
      }
    });
  }
  const backBtn = $('#backBtn');
  if (backBtn) backBtn.addEventListener('click', backToDashboard);
  const detailFilterForm = $('#detailFilterForm');
  if (detailFilterForm) {
    detailFilterForm.addEventListener('submit', event => {
      event.preventDefault();
      const activeCategory = $('#betCategoryFilters .filter-pill.active');
      showToast(`${activeCategory ? activeCategory.dataset.category : 'All'} bet details selected`);
    });
  }

  $$('#betCategoryFilters .filter-pill').forEach(button => {
    button.addEventListener('click', () => {
      $$('#betCategoryFilters .filter-pill').forEach(pill => pill.classList.remove('active'));
      button.classList.add('active');
      // The visual filter is ready; connect this to your bet data/API when available.
      showToast(`${button.dataset.category} category selected`);
    });
  });
})();



/* =========================
   CASH HISTORY FUNCTIONS
========================= */

const cashHistoryPage = document.getElementById("cashHistoryPage");
const transactionsBtn = document.getElementById("transactionsBtn");
const cashHistoryForm = document.getElementById("cashHistoryForm");
const cashFrom = document.getElementById("cashFrom");
const cashTo = document.getElementById("cashTo");
const cashHistoryBody = document.getElementById("cashHistoryBody");

function getCashHistoryRedeemRecords() {
  try {
    const records = JSON.parse(localStorage.getItem("cashHistoryRedeems") || "[]");
    return Array.isArray(records) ? records : [];
  } catch (error) {
    return [];
  }
}

function renderRedeemRecords() {
  if (!cashHistoryBody) return;

  const fromDate = cashFrom?.value || "";
  const toDate = cashTo?.value || "";
  const records = getCashHistoryRedeemRecords().filter(record =>
    (!fromDate || record.date >= fromDate) &&
    (!toDate || record.date <= toDate)
  );

  cashHistoryBody.replaceChildren();

  if (records.length === 0) {
    const row = cashHistoryBody.insertRow();
    const cell = row.insertCell();
    cell.colSpan = 7;
    cell.className = "no-record";
    cell.textContent = "No Record.";
    return;
  }

  records.slice().reverse().forEach(record => {
    const row = cashHistoryBody.insertRow();
    const values = [
      record.dateTime || record.date || "-",
      record.transactionNo || "-",
      record.description || record.giftCardName || "-",
      record.type || "Redemption",
      record.status || "Pending",
      record.amount ?? "0.00",
      record.bonus ?? "-"
    ];

    values.forEach(value => {
      const cell = row.insertCell();
      cell.textContent = String(value);
    });
  });
}

function setCashHistoryDatesToToday() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const todayDate = `${year}-${month}-${day}`;

  if (cashFrom) cashFrom.value = todayDate;
  if (cashTo) cashTo.value = todayDate;
}

function openCashHistory() {
  document.getElementById("dashboardPage")?.classList.add("hidden");
  document.getElementById("detailsPage")?.classList.add("hidden");
  cashHistoryPage?.classList.remove("hidden");

  if (cashFrom && !cashFrom.value) setCashHistoryDatesToToday();
  if (cashTo && !cashTo.value) setCashHistoryDatesToToday();

  renderRedeemRecords();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// Transactions button -> Cash History
if (transactionsBtn) {
  transactionsBtn.addEventListener("click", function () {
    setCashHistoryDatesToToday();
    openCashHistory();
  });
}

// Filter records when Go is clicked
if (cashHistoryForm) {
  cashHistoryForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const fromDate = cashFrom?.value || "";
    const toDate = cashTo?.value || "";

    if (!fromDate || !toDate) {
      window.alert("Please select both dates.");
      return;
    }

    if (fromDate > toDate) {
      window.alert("From date cannot be later than To date.");
      return;
    }

    renderRedeemRecords();
  });
}

// Back button
document.getElementById("cashBackBtn")?.addEventListener("click", function () {
  cashHistoryPage?.classList.add("hidden");
  document.getElementById("dashboardPage")?.classList.remove("hidden");
  window.scrollTo({ top: 0, behavior: "smooth" });
});

// Direct link from Redeem Save: transaction.html#cashHistoryPage
if (window.location.hash === "#cashHistoryPage") {
  openCashHistory();
}
