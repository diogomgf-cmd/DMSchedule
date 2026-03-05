const AppState = {
  currentUser: 'D',
  currentTab: 'schedule',
  currentMonth: new Date().getMonth(),
  isAuthenticated: false,
  authDoc: null,
  unsubscribes: {},
  multiSelectMode: false,
  selectedCells: new Set(),

  reset() {
    this.currentUser = 'D';
    this.currentTab = 'schedule';
    this.currentMonth = new Date().getMonth();
    this.isAuthenticated = false;
    this.authDoc = null;
    this.multiSelectMode = false;
    this.selectedCells.clear();
  },

  toggleUser() {
    this.currentUser = this.currentUser === 'D' ? 'M' : 'D';
    return this.currentUser;
  },

  setTab(tab) {
    this.currentTab = tab;
  },

  setMonth(month) {
    this.currentMonth = month;
  },

  isCurrentUser(user) {
    return this.currentUser === user;
  }
};
