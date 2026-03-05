const BudgetManager = {
  dataD: [],
  dataM: [],

  init(onUpdate) {
    this.unsubscribeD = FirestoreService.subscribeToBudget('D', (data) => {
      this.dataD = data;
      onUpdate();
    });
    this.unsubscribeM = FirestoreService.subscribeToBudget('M', (data) => {
      this.dataM = data;
      onUpdate();
    });
  },

  cleanup() {
    if (this.unsubscribeD) this.unsubscribeD();
    if (this.unsubscribeM) this.unsubscribeM();
  },

  getData(user) {
    return user === 'D' ? this.dataD : this.dataM;
  },

  getTotal(user) {
    const data = this.getData(user);
    return data.reduce((sum, item) => sum + (item.cost || 0), 0);
  },

  async addItem(user, item, cost) {
    return FirestoreService.addBudgetItem(user, item, cost);
  },

  async updateItem(user, id, data) {
    return FirestoreService.updateBudgetItem(user, id, data);
  },

  async deleteItem(user, id) {
    return FirestoreService.deleteBudgetItem(user, id);
  },

  async clear(user) {
    return FirestoreService.clearBudget(user);
  }
};
