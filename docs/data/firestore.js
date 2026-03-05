const FirestoreService = {
  async getAuthDoc() {
    try {
      const doc = await db.collection('settings').doc('auth').get();
      return doc.exists ? doc.data() : null;
    } catch (e) {
      console.error('Failed to get auth doc:', e);
      throw e;
    }
  },

  async setAuthDoc(passwordHash, email) {
    try {
      await db.collection('settings').doc('auth').set({
        passwordHash,
        email,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      });
    } catch (e) {
      console.error('Failed to set auth doc:', e);
      throw e;
    }
  },

  getScheduleCollection(user) {
    return db.collection(`schedule_${user}`);
  },

  getBudgetCollection(user) {
    return db.collection(`budget_${user}`);
  },

  getEventsCollection() {
    return db.collection('events');
  },

  getGroceriesCollection() {
    return db.collection('groceries');
  },

  getGymCollection(user) {
    return db.collection(`gym_${user}`);
  },

  subscribeToSchedule(user, callback) {
    return this.getScheduleCollection(user).onSnapshot(snapshot => {
      const data = {};
      snapshot.docs.forEach(doc => {
        const docData = doc.data();
        const key = `${docData.day}-${docData.time}`;
        data[key] = { id: doc.id, title: docData.title, user };
      });
      callback(data);
    });
  },

  subscribeToEvents(callback) {
    return this.getEventsCollection().onSnapshot(snapshot => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      callback(data);
    });
  },

  subscribeToBudget(user, callback) {
    return this.getBudgetCollection(user).onSnapshot(snapshot => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      callback(data);
    });
  },

  subscribeToGroceries(callback) {
    return this.getGroceriesCollection().onSnapshot(snapshot => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      callback(data);
    });
  },

  subscribeToGym(user, callback) {
    return this.getGymCollection(user).onSnapshot(snapshot => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      callback(data);
    });
  },

  addWorkout(user, name, order = 0) {
    return this.getGymCollection(user).add({ name, order, exercises: [] });
  },

  updateWorkout(user, id, data) {
    return this.getGymCollection(user).doc(id).update(data);
  },

  deleteWorkout(user, id) {
    return this.getGymCollection(user).doc(id).delete();
  },

  clearGym(user) {
    return this.getGymCollection(user).get().then(snapshot => {
      const batch = db.batch();
      snapshot.docs.forEach(doc => batch.delete(doc.ref));
      return batch.commit();
    });
  },

  async addScheduleItem(user, day, time, title) {
    return this.getScheduleCollection(user).add({ day, time, title, user });
  },

  async updateScheduleItem(user, id, title) {
    return this.getScheduleCollection(user).doc(id).update({ title });
  },

  async deleteScheduleItem(user, id) {
    return this.getScheduleCollection(user).doc(id).delete();
  },

  async addEvent(title, date, time, user) {
    return this.getEventsCollection().add({ title, date, time, user });
  },

  async updateEvent(id, data) {
    return this.getEventsCollection().doc(id).update(data);
  },

  async deleteEvent(id) {
    return this.getEventsCollection().doc(id).delete();
  },

  async addBudgetItem(user, item, cost) {
    return this.getBudgetCollection(user).add({ item, cost });
  },

  async updateBudgetItem(user, id, data) {
    return this.getBudgetCollection(user).doc(id).update(data);
  },

  async deleteBudgetItem(user, id) {
    return this.getBudgetCollection(user).doc(id).delete();
  },

  async clearBudget(user) {
    const snapshot = await this.getBudgetCollection(user).get();
    const batch = db.batch();
    snapshot.docs.forEach(doc => batch.delete(doc.ref));
    return batch.commit();
  },

  async addGroceryItem(name, quantity) {
    return this.getGroceriesCollection().add({ name, quantity, completed: false });
  },

  async toggleGrocery(id, currentState) {
    return this.getGroceriesCollection().doc(id).update({ completed: !currentState });
  },

  async deleteGrocery(id) {
    return this.getGroceriesCollection().doc(id).delete();
  },

  async clearGroceries() {
    const snapshot = await this.getGroceriesCollection().get();
    const batch = db.batch();
    snapshot.docs.forEach(doc => batch.delete(doc.ref));
    return batch.commit();
  },

  async batchDeleteScheduleItems(items) {
    const batch = db.batch();
    items.forEach(({ user, id }) => {
      if (id) {
        batch.delete(this.getScheduleCollection(user).doc(id));
      }
    });
    return batch.commit();
  },

  async batchAddScheduleItems(items) {
    const batch = db.batch();
    items.forEach(({ user, day, time, title }) => {
      const docRef = this.getScheduleCollection(user).doc();
      batch.set(docRef, { day, time, title, user });
    });
    return batch.commit();
  }
};
