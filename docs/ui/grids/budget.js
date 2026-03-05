const BudgetGrid = {
  init() {},

  render() {
    const budgetDContainer = document.getElementById('budgetDContainer');
    const budgetMContainer = document.getElementById('budgetMContainer');

    if (budgetDContainer && budgetMContainer) {
      budgetDContainer.classList.toggle('opacity-50', AppState.currentUser !== 'D');
      budgetDContainer.classList.toggle('pointer-events-none', AppState.currentUser !== 'D');
      budgetMContainer.classList.toggle('opacity-50', AppState.currentUser !== 'M');
      budgetMContainer.classList.toggle('pointer-events-none', AppState.currentUser !== 'M');
    }

    this.renderUserList('D', BudgetManager.dataD);
    this.renderUserList('M', BudgetManager.dataM);
  },

  renderUserList(user, items) {
    const list = document.getElementById(`budget${user}List`);
    const totalEl = document.getElementById(`budget${user}Total`);

    let html = '';
    let total = 0;

    items.forEach(item => {
      total += item.cost || 0;
      html += `
        <div class="budget-item">
          <input type="text" class="item-name" value="${item.item}" data-id="${item.id}" data-field="item" data-user="${user}">
          <input type="number" class="item-cost" value="${item.cost.toFixed(2)}" data-id="${item.id}" data-field="cost" data-user="${user}" step="0.01" min="0">
          <span class="delete-btn" data-id="${item.id}" data-user="${user}">
            <i data-lucide="x" class="w-4 h-4"></i>
          </span>
        </div>
      `;
    });

    list.innerHTML = html;
    totalEl.textContent = `${total.toFixed(2)}€`;
    lucide.createIcons();

    list.querySelectorAll('input').forEach(input => {
      input.addEventListener('blur', this.handleInputChange);
    });

    list.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', () => BudgetManager.deleteItem(btn.dataset.user, btn.dataset.id));
    });
  },

  handleInputChange(e) {
    const id = e.target.dataset.id;
    const field = e.target.dataset.field;
    const user = e.target.dataset.user;
    const value = field === 'cost' ? parseFloat(e.target.value) : e.target.value;

    BudgetManager.updateItem(user, id, { [field]: value });
  }
};
