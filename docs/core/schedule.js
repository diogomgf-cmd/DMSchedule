const ScheduleManager = {
  dataD: {},
  dataM: {},

  init(onUpdate) {
    this.unsubscribeD = FirestoreService.subscribeToSchedule('D', (data) => {
      this.dataD = data;
      onUpdate();
    });
    this.unsubscribeM = FirestoreService.subscribeToSchedule('M', (data) => {
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

  getItem(user, day, time) {
    const key = formatScheduleKey(day, time);
    const data = this.getData(user);
    return data[key];
  },

  async addItem(user, day, time, title) {
    return FirestoreService.addScheduleItem(user, day, time, title);
  },

  async updateItem(user, id, title) {
    return FirestoreService.updateScheduleItem(user, id, title);
  },

  async deleteItem(user, id) {
    return FirestoreService.deleteScheduleItem(user, id);
  },

  async batchDelete(items) {
    return FirestoreService.batchDeleteScheduleItems(items);
  },

  async batchAdd(items) {
    return FirestoreService.batchAddScheduleItems(items);
  }
};
