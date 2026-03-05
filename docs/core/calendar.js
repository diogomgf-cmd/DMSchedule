const CalendarManager = {
  events: [],
  year: 2026,

  init(onUpdate) {
    this.unsubscribe = FirestoreService.subscribeToEvents((data) => {
      this.events = data;
      onUpdate();
    });
  },

  cleanup() {
    if (this.unsubscribe) this.unsubscribe();
  },

  getEventsForDate(date) {
    return this.events.filter(e => e.date === date);
  },

  async addEvent(title, date, time) {
    return FirestoreService.addEvent(title, date, time, AppState.currentUser);
  },

  async updateEvent(id, data) {
    return FirestoreService.updateEvent(id, data);
  },

  async deleteEvent(id) {
    return FirestoreService.deleteEvent(id);
  }
};
