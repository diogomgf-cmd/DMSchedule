const GroceryManager = {
  items: [],

  init(onUpdate) {
    this.unsubscribe = FirestoreService.subscribeToGroceries((data) => {
      this.items = data;
      onUpdate();
    });
  },

  cleanup() {
    if (this.unsubscribe) this.unsubscribe();
  },

  async addItem(name, quantity) {
    return FirestoreService.addGroceryItem(name, quantity);
  },

  async toggleItem(id, currentState) {
    return FirestoreService.toggleGrocery(id, currentState);
  },

  async deleteItem(id) {
    return FirestoreService.deleteGrocery(id);
  },

  async clearAll() {
    return FirestoreService.clearGroceries();
  }
};
