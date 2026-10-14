/* Inbox interactions
   This script works with rows already rendered in the HTML/backend.
   It does not replace the table contents with an empty JavaScript array.
*/
(() => {
  const messageList = document.getElementById('messageList');
  const selectAll = document.getElementById('selectAll');
  const markReadBtn = document.getElementById('markReadBtn');
  const deleteBtn = document.getElementById('deleteBtn');

  if (!messageList || !selectAll || !markReadBtn || !deleteBtn) return;

  const getRows = () => Array.from(messageList.querySelectorAll('tr'))
    .filter(row => !row.classList.contains('empty-row'));

  const getCheckboxes = () => getRows()
    .map(row => row.querySelector('.row-check'))
    .filter(Boolean);

  function showEmptyMessageIfNeeded() {
    if (getRows().length === 0) {
      messageList.innerHTML = '<tr class="empty-row"><td colspan="3">No Message</td></tr>';
    }
  }

  function updateSelectionUI() {
    const checkboxes = getCheckboxes();
    const selectedCount = checkboxes.filter(checkbox => checkbox.checked).length;

    selectAll.checked = checkboxes.length > 0 && selectedCount === checkboxes.length;
    selectAll.indeterminate = selectedCount > 0 && selectedCount < checkboxes.length;
    selectAll.disabled = checkboxes.length === 0;
    markReadBtn.disabled = selectedCount === 0;
    deleteBtn.disabled = selectedCount === 0;

    getRows().forEach(row => {
      const checkbox = row.querySelector('.row-check');
      row.classList.toggle('is-selected', Boolean(checkbox && checkbox.checked));
    });
  }

  // Delegate checkbox changes so it also works with rows loaded later by the backend.
  messageList.addEventListener('change', event => {
    if (!event.target.matches('.row-check')) return;
    updateSelectionUI();
  });

  selectAll.addEventListener('change', () => {
    getCheckboxes().forEach(checkbox => {
      checkbox.checked = selectAll.checked;
    });
    updateSelectionUI();
  });

  markReadBtn.addEventListener('click', () => {
    getRows().forEach(row => {
      const checkbox = row.querySelector('.row-check');
      if (checkbox && checkbox.checked) {
        row.classList.remove('unread');
        row.classList.add('read');
        checkbox.checked = false;
      }
    });
    updateSelectionUI();
  });

  deleteBtn.addEventListener('click', () => {
    getRows().forEach(row => {
      const checkbox = row.querySelector('.row-check');
      if (checkbox && checkbox.checked) row.remove();
    });
    showEmptyMessageIfNeeded();
    updateSelectionUI();
  });

  // Initialise controls without clearing any existing table rows.
  showEmptyMessageIfNeeded();
  updateSelectionUI();
})();
