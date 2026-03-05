const ModalManager = {
  currentType: '',
  editingData: null,

  init() {
    document.getElementById('modalCancel').addEventListener('click', this.close.bind(this));
    document.getElementById('modal').addEventListener('click', (e) => {
      if (e.target.id === 'modal') this.close();
    });
  },

  open(type, data = null) {
    this.currentType = type;
    this.editingData = data;
    const config = ModalConfig.get(type, data);
    
    document.getElementById('modalTitle').textContent = config.title;
    document.getElementById('modalContent').innerHTML = config.content;
    
    if (config.onOpen) config.onOpen();
    
    document.getElementById('modal').classList.remove('hidden');
    document.getElementById('modalSave').onclick = () => this.save();
  },

  close() {
    document.getElementById('modal').classList.add('hidden');
    this.currentType = '';
    this.editingData = null;
  },

  async save() {
    const handlers = {
      schedule: () => this.handleSchedule(),
      scheduleEdit: () => this.handleSchedule(),
      scheduleAdd: () => this.handleScheduleAdd(),
      scheduleMulti: () => this.handleScheduleMulti(),
      calendar: () => this.handleCalendar(),
      calendarEdit: () => this.handleCalendarEdit(),
      budgetD: () => this.handleBudget('D'),
      budgetM: () => this.handleBudget('M'),
      grocery: () => this.handleGrocery(),
      gym: () => this.handleGym()
    };

    const handler = handlers[this.currentType];
    if (handler) await handler();
    this.close();
  },

  async handleSchedule() {
    const title = document.getElementById('scheduleTitle').value;
    if (title && this.editingData) {
      const user = this.editingData.user || AppState.currentUser;
      await ScheduleManager.updateItem(user, this.editingData.id, title);
    }
  },

  async handleScheduleAdd() {
    const title = document.getElementById('scheduleTitle').value;
    if (title && this.editingData) {
      const user = this.editingData.user || AppState.currentUser;
      await ScheduleManager.addItem(user, this.editingData.day, this.editingData.time, title);
    }
  },

  async handleScheduleMulti() {
    const title = document.getElementById('scheduleTitle').value;
    if (title && AppState.selectedCells.size > 0) {
      const items = [];
      AppState.selectedCells.forEach(key => {
        const [user, day, time] = key.split('-');
        items.push({ user, day, time, title });
      });
      await ScheduleManager.batchAdd(items);
    }
    AppState.selectedCells.clear();
    document.getElementById('applyMultiBtn').classList.add('hidden');
  },

  async handleCalendar() {
    const title = document.getElementById('eventTitle').value;
    const time = document.getElementById('eventTime').value;
    if (title && this.editingData) {
      await CalendarManager.addEvent(title, this.editingData.date, time);
    }
  },

  async handleCalendarEdit() {
    const title = document.getElementById('eventTitle').value;
    const time = document.getElementById('eventTime').value;
    if (title && this.editingData?.id) {
      await CalendarManager.updateEvent(this.editingData.id, { title, time });
    }
  },

  async handleBudget(user) {
    const item = document.getElementById('budgetItem').value;
    const cost = parseFloat(document.getElementById('budgetCost').value);
    if (item && !isNaN(cost)) {
      await BudgetManager.addItem(user, item, cost);
    }
  },

  async handleGrocery() {
    const name = document.getElementById('groceryName').value;
    const quantity = parseInt(document.getElementById('groceryQuantity').value) || 1;
    if (name) {
      await GroceryManager.addItem(name, quantity);
    }
  },

  async handleGym() {
    const name = document.getElementById('gymWorkoutName').value;
    if (name) {
      await GymManager.addWorkout(name);
    }
  },

  async handleMultiDelete() {
    if (AppState.selectedCells.size > 0) {
      const items = [];
      AppState.selectedCells.forEach(key => {
        const [user, day, time] = key.split('-');
        const scheduleData = user === 'D' ? ScheduleManager.dataD : ScheduleManager.dataM;
        const cellKey = `${day}-${time}`;
        if (scheduleData[cellKey]?.id) {
          items.push({ user, id: scheduleData[cellKey].id });
        }
      });
      await ScheduleManager.batchDelete(items);
      AppState.selectedCells.clear();
      this.close();
    }
  }
};

const ModalConfig = {
  get(type, data) {
    const configs = {
      schedule: {
        title: data ? 'Edit Schedule Item' : 'Add Schedule Item',
        content: `
          <div class="space-y-3">
            <input type="text" id="scheduleTitle" placeholder="Event title" value="${data?.title || ''}">
            <p class="text-sm text-gray-400">${data?.day || ''} at ${data?.time || ''}</p>
          </div>`
      },
      scheduleEdit: {
        title: 'Edit / Delete Event',
        content: `
          <div class="space-y-3">
            <input type="text" id="scheduleTitle" placeholder="Event title" value="${data?.title || ''}">
            <p class="text-sm text-gray-400 mb-4">${data?.day || ''} at ${data?.time || ''}</p>
            <div class="flex gap-2">
              <button id="deleteScheduleBtn" class="flex-1 py-2 rounded-lg bg-red-600 hover:bg-red-500 transition">Delete</button>
            </div>
          </div>`,
        onOpen: () => {
          document.getElementById('deleteScheduleBtn')?.addEventListener('click', async () => {
            if (data?.id && data?.user) {
              await ScheduleManager.deleteItem(data.user, data.id);
              ModalManager.close();
            }
          });
        }
      },
      scheduleAdd: {
        title: 'Add Schedule Item',
        content: `
          <div class="space-y-3">
            <input type="text" id="scheduleTitle" placeholder="Event title">
            <p class="text-sm text-gray-400">${data?.day || ''} at ${data?.time || ''}</p>
          </div>`
      },
      scheduleMulti: {
        title: `Add Event to ${AppState.selectedCells.size} Cells`,
        content: `
          <div class="space-y-3">
            <input type="text" id="scheduleTitle" placeholder="Event title">
            <p class="text-sm text-gray-400">${AppState.selectedCells.size} time slots selected</p>
            <div class="flex gap-2">
              <button id="deleteMultiBtn" class="flex-1 py-2 rounded-lg bg-red-600 hover:bg-red-500 transition">Delete All</button>
            </div>
          </div>`,
        onOpen: () => {
          document.getElementById('deleteMultiBtn')?.addEventListener('click', () => ModalManager.handleMultiDelete());
        }
      },
      calendar: {
        title: 'Add Event',
        content: `
          <div class="space-y-3">
            <input type="text" id="eventTitle" placeholder="Event title">
            <input type="time" id="eventTime" value="12:00">
          </div>`
      },
      calendarEdit: {
        title: 'Edit / Delete Event',
        content: `
          <div class="space-y-3">
            <input type="text" id="eventTitle" placeholder="Event title" value="${data?.title || ''}">
            <input type="time" id="eventTime" value="${data?.time || '12:00'}">
            <p class="text-sm text-gray-400 mb-4">${data?.date || ''}</p>
            <div class="flex gap-2">
              <button id="deleteCalendarEventBtn" class="flex-1 py-2 rounded-lg bg-red-600 hover:bg-red-500 transition">Delete</button>
            </div>
          </div>`,
        onOpen: () => {
          document.getElementById('deleteCalendarEventBtn')?.addEventListener('click', async () => {
            if (data?.id) {
              await CalendarManager.deleteEvent(data.id);
              ModalManager.close();
            }
          });
        }
      },
      budgetD: {
        title: 'Add Budget Item (D)',
        content: `
          <div class="space-y-3">
            <input type="text" id="budgetItem" placeholder="Item name">
            <input type="number" id="budgetCost" placeholder="Cost (€)" step="0.01" min="0">
          </div>`
      },
      budgetM: {
        title: 'Add Budget Item (M)',
        content: `
          <div class="space-y-3">
            <input type="text" id="budgetItem" placeholder="Item name">
            <input type="number" id="budgetCost" placeholder="Cost (€)" step="0.01" min="0">
          </div>`
      },
      grocery: {
        title: 'Add Grocery Item',
        content: `
          <div class="space-y-3">
            <input type="text" id="groceryName" placeholder="Item name">
            <input type="number" id="groceryQuantity" placeholder="Quantity" value="1" min="1" class="w-20">
          </div>`
      },
      gym: {
        title: 'Add Workout',
        content: `
          <div class="space-y-3">
            <input type="text" id="gymWorkoutName" placeholder="Workout name (e.g., Push Day)">
          </div>`
      }
    };

    return configs[type] || { title: '', content: '' };
  }
};
