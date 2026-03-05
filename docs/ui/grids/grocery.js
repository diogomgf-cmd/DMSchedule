const GroceryGrid = {
  init() {},

  render() {
    const list = document.getElementById('groceriesList');

    let html = '';
    GroceryManager.items.forEach(item => {
      const completedClass = item.completed ? 'completed' : '';
      const iconClass = item.completed ? 'check-circle' : 'circle';
      const textClass = item.completed ? 'completed' : '';
      const quantity = item.quantity || 1;

      html += `
        <div class="grocery-item ${completedClass}">
          <i data-lucide="${iconClass}" class="toggle-btn ${textClass} w-5 h-5" data-id="${item.id}"></i>
          <span class="grocery-name">${quantity > 1 ? quantity + 'x ' : ''}${item.name}</span>
          <i data-lucide="x" class="delete-btn w-4 h-4" data-id="${item.id}"></i>
        </div>
      `;
    });

    list.innerHTML = html;
    lucide.createIcons();

    list.querySelectorAll('.toggle-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const item = GroceryManager.items.find(i => i.id === btn.dataset.id);
        if (item) {
          GroceryManager.toggleItem(item.id, item.completed);
        }
      });
    });

    list.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', () => GroceryManager.deleteItem(btn.dataset.id));
    });
  }
};
