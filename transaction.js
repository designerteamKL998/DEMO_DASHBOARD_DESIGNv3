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

// Buka Cash History apabila klik Transactions
transactionsBtn.addEventListener("click", function () {

  // Sorok paparan Statement
  document.getElementById("dashboardPage")
    .classList.add("hidden");

  // Sorok paparan details jika ada
  const detailsPage = document.getElementById("detailsPage");

  if (detailsPage) {
    detailsPage.classList.add("hidden");
  }

  // Paparkan Cash History
  cashHistoryPage.classList.remove("hidden");

  // Set tarikh hari ini
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  const todayDate = `${year}-${month}-${day}`;

  cashFrom.value = todayDate;
  cashTo.value = todayDate;

});

// Button Go
cashHistoryForm.addEventListener("submit", function (event) {

  event.preventDefault();

  const fromDate = cashFrom.value;
  const toDate = cashTo.value;

  if (!fromDate || !toDate) {
    alert("Please select both dates.");
    return;
  }

  if (fromDate > toDate) {
    alert("From date cannot be later than To date.");
    return;
  }

  // Paparan kosong sementara tiada data transaksi
  cashHistoryBody.innerHTML = `
    <tr>
      <td colspan="7" class="no-record">
        No Record.
      </td>
    </tr>
  `;

});



document.getElementById("cashBackBtn").addEventListener("click", function () {

  // Tutup Cash History
  document.getElementById("cashHistoryPage")
    .classList.add("hidden");

  // Kembali ke Statement
  document.getElementById("dashboardPage")
    .classList.remove("hidden");

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });

});


