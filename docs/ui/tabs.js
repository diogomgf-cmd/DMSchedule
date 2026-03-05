const TabManager = {
  init() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();

        const tab = btn.dataset.tab;
        AppState.setTab(tab);

        tabBtns.forEach(b => {
          b.classList.remove('active', 'text-emerald-400');
          b.classList.add('text-gray-400');
        });
        btn.classList.add('active', 'text-emerald-400');
        btn.classList.remove('text-gray-400');

        tabContents.forEach(content => content.classList.add('hidden'));
        document.getElementById(`${tab}Tab`).classList.remove('hidden');
      });
    });

    document.querySelector('.tab-btn[data-tab="schedule"]').click();
  }
};
