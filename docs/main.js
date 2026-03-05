const App = {
  async init() {
    lucide.createIcons();
    await this.checkAuth();
  },

  async checkAuth() {
    const overlay = document.getElementById('passwordOverlay');

    if (AuthService.isAuthenticated()) {
      AppState.isAuthenticated = true;
      overlay.classList.add('hidden');
      this.initApp();
      return;
    }

    try {
      AppState.authDoc = await FirestoreService.getAuthDoc();
    } catch (e) {
      AuthUI.showConnectionError();
      return;
    }

    AuthUI.init();

    if (!AppState.authDoc || !AppState.authDoc.passwordHash) {
      AuthUI.configureForFirstTime();
    } else {
      AuthUI.configureForReturning();
    }
  },

  initApp() {
    lucide.createIcons();
    TabManager.init();
    ModalManager.init();

    this.setupUserToggle();
    this.setupButtons();
    this.initManagers();
    this.renderAll();

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('sw.js');
    }
  },

  initManagers() {
    ScheduleManager.init(() => ScheduleGrid.render());
    CalendarGrid.init();
    CalendarManager.init(() => CalendarGrid.render());
    BudgetManager.init(() => BudgetGrid.render());
    GroceryManager.init(() => GroceryGrid.render());
    GymGrid.init();
    GymManager.init(() => GymGrid.render());
    ScheduleGrid.init();
  },

  setupUserToggle() {
    const toggle = document.getElementById('userToggle');
    const sidebarToggle = document.getElementById('userToggleSidebar');

    const updateUserUI = () => {
      const user = AppState.currentUser;
      const colorClass = user === 'D' ? 'bg-blue-600 hover:bg-blue-500' : 'bg-pink-600 hover:bg-pink-500';
      
      if (toggle) {
        toggle.textContent = `User: ${user}`;
        toggle.className = `px-3 py-1.5 rounded-lg text-sm font-medium transition ${colorClass}`;
      }
      if (sidebarToggle) {
        sidebarToggle.className = `mt-3 w-full flex items-center justify-between px-4 py-2 rounded-lg text-sm font-medium transition ${colorClass} text-white`;
        sidebarToggle.querySelector('span').textContent = `User: ${user}`;
      }
    };

    const handleToggle = () => {
      AppState.toggleUser();
      updateUserUI();
      GymManager.reinitialize(() => GymGrid.render());
      this.renderAll();
    };

    if (toggle) toggle.addEventListener('click', handleToggle);
    if (sidebarToggle) sidebarToggle.addEventListener('click', handleToggle);

    updateUserUI();
  },

  setupButtons() {
    const buttons = [
      { id: 'addBudgetDBtn', action: () => ModalManager.open('budgetD') },
      { id: 'addBudgetMBtn', action: () => ModalManager.open('budgetM') },
      { id: 'clearBudgetDBtn', action: () => BudgetManager.clear('D') },
      { id: 'clearBudgetMBtn', action: () => BudgetManager.clear('M') },
      { id: 'addGroceryBtn', action: () => ModalManager.open('grocery') },
      { id: 'addGymWorkoutBtn', action: () => ModalManager.open('gym') }
    ];

    buttons.forEach(({ id, action }) => {
      document.getElementById(id)?.addEventListener('click', action);
    });

    document.getElementById('clearGroceriesBtn')?.addEventListener('click', () => GroceryManager.clearAll());
    document.getElementById('clearGymBtn')?.addEventListener('click', () => {
      if (confirm('Delete all workouts?')) GymManager.clear();
    });

    this.setupAlarmButtons();
  },

  setupAlarmButtons() {
    const handleAlarmToggle = async () => {
      const enabled = await NotificationService.enable();
      const alarmBtn = document.getElementById('alarmBtn');
      const alarmBtnSidebar = document.getElementById('alarmBtnSidebar');
      
      if (enabled) {
        alarmBtn?.classList.replace('bg-gray-700', 'bg-emerald-600');
        if (alarmBtnSidebar) {
          alarmBtnSidebar.classList.remove('bg-gray-700', 'text-gray-400', 'hover:bg-gray-600', 'hover:text-gray-100');
          alarmBtnSidebar.classList.add('bg-emerald-600', 'text-white');
          alarmBtnSidebar.querySelector('span').textContent = 'Alarms Enabled';
        }
      }
    };

    document.getElementById('alarmBtn')?.addEventListener('click', handleAlarmToggle);
    document.getElementById('alarmBtnSidebar')?.addEventListener('click', handleAlarmToggle);
  },

  renderAll() {
    ScheduleGrid.render();
    CalendarGrid.render();
    BudgetGrid.render();
    GroceryGrid.render();
    GymGrid.render();
  }
};

document.addEventListener('DOMContentLoaded', () => App.init());
