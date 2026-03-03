let currentUser = 'D';
let currentTab = 'schedule';
let unsubscribes = {};
let alarmInterval = null;
let notifiedEvents = new Set();

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

document.addEventListener('DOMContentLoaded', () => {
  lucide.createIcons();
  initApp();
});

function initApp() {
  setupTabNavigation();
  setupUserToggle();
  setupAlarmButton();
  setupFirestoreListeners();
  setupAddButtons();
  setupModal();
  checkCurrentMonth();
  startAlarmChecker();
  
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js');
  }
}

function setupTabNavigation() {
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');
  
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.dataset.tab;
      currentTab = tab;
      
      tabBtns.forEach(b => {
        b.classList.remove('active', 'text-emerald-400');
        b.classList.add('text-gray-400');
      });
      btn.classList.add('active', 'text-emerald-400');
      btn.classList.remove('text-gray-400');
      
      tabContents.forEach(content => content.classList.add('hidden'));
      document.getElementById(`${tab}Tab`).classList.remove('hidden');
      document.getElementById(`${tab}Tab`).classList    });
  });
.add('active');
  
  document.querySelector('[data-tab="schedule"]').click();
}

function setupUserToggle() {
  const toggle = document.getElementById('userToggle');
  toggle.addEventListener('click', () => {
    currentUser = currentUser === 'D' ? 'M' : 'D';
    toggle.textContent = `User: ${currentUser}`;
  });
}

function setupAlarmButton() {
  const btn = document.getElementById('alarmBtn');
  btn.addEventListener('click', async () => {
    if (!('Notification' in window)) {
      alert('Notifications not supported');
      return;
    }
    
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      btn.classList.remove('bg-gray-700');
      btn.classList.add('bg-emerald-600');
    }
  });
}

function startAlarmChecker() {
  alarmInterval = setInterval(() => {
    checkAlarms();
  }, 30000);
  
  checkAlarms();
}

function checkAlarms() {
  if (Notification.permission !== 'granted') return;
  
  const now = new Date();
  const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  const today = now.getDay();
  const dayName = days[(today + 6) % 7];
  
  const scheduleItems = document.querySelectorAll('.schedule-item');
  scheduleItems.forEach(item => {
    const time = item.dataset.time;
    const day = item.dataset.day;
    const title = item.dataset.title;
    const key = `${day}-${time}-${title}`;
    
    if (time === currentTime && day === dayName && !notifiedEvents.has(key)) {
      notifiedEvents.add(key);
      new Notification('Schedule Alarm', {
        body: `${title} at ${time}`,
        icon: 'manifest.json',
        tag: key
      });
      playAlarmSound();
    }
  });
  
  const eventItems = document.querySelectorAll('.event-item');
  eventItems.forEach(item => {
    const dateTime = item.dataset.datetime;
    const title = item.dataset.title;
    const key = `event-${dateTime}-${title}`;
    
    if (!notifiedEvents.has(key)) {
      const eventDate = new Date(dateTime);
      if (eventDate.getTime() - now.getTime() <= 60000 && eventDate.getTime() - now.getTime() > 0) {
        notifiedEvents.add(key);
        new Notification('Event Alarm', {
          body: title,
          icon: 'manifest.json',
          tag: key
        });
        playAlarmSound();
      }
    }
  });
}

function playAlarmSound() {
  const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdH2Onp6Xj4J1aGFneIqhm5mPfoB2aWdieIqhm5iNfoB2aWdieIqgmpmMfoB2aGdieIqgmpmKfoB2Z2dieIqgmpqKfoB2aGdieIqgmpqJfoB2Z2dieIqgmpqJfoB2Z2dieIqgmpqKfoB2aGdieIqgmpmKfoB2Z2dieIqgmpmKfoB2aGdieIqgmpmJfoB2Z2dieIqgmpqJfoB2aGdieIqgmpqJfoB2Z2dieIqgmpqKfoB2aGdieIqgmpqK');
  audio.volume = 0.5;
  audio.play().catch(() => {});
}

function setupFirestoreListeners() {
  const collections = ['schedule', 'events', 'budget', 'groceries'];
  
  collections.forEach(col => {
    unsubscribes[col] = db.collection(col).onSnapshot(snapshot => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      renderData(col, data);
    });
  });
}

function renderData(collection, data) {
  switch(collection) {
    case 'schedule':
      renderSchedule(data);
      break;
    case 'events':
      renderEvents(data);
      break;
    case 'budget':
      renderBudget(data);
      break;
    case 'groceries':
      renderGroceries(data);
      break;
  }
}

function renderSchedule(items) {
  const list = document.getElementById('scheduleList');
  list.innerHTML = '';
  
  const sorted = [...items].sort((a, b) => {
    const dayA = days.indexOf(a.day);
    const dayB = days.indexOf(b.day);
    return dayA - dayB || a.time.localeCompare(b.time);
  });
  
  sorted.forEach(item => {
    const div = document.createElement('div');
    div.className = 'schedule-item bg-gray-800 rounded-lg p-4 flex justify-between items-center';
    div.dataset.time = item.time;
    div.dataset.day = item.day;
    div.dataset.title = item.title;
    div.innerHTML = `
      <div>
        <div class="font-medium">${item.title}</div>
        <div class="text-sm text-gray-400">${item.day} at ${item.time}</div>
      </div>
      <button class="delete-btn p-2 text-gray-400 hover:text-red-400" data-id="${item.id}" data-col="schedule">
        <i data-lucide="trash-2" class="w-4 h-4"></i>
      </button>
    `;
    list.appendChild(div);
  });
  lucide.createIcons();
}

function renderEvents(items) {
  const list = document.getElementById('eventsList');
  list.innerHTML = '';
  
  const sorted = [...items].sort((a, b) => new Date(a.date) - new Date(b.date));
  
  sorted.forEach(item => {
    const date = new Date(item.date);
    const dateStr = date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    const timeStr = item.time || '';
    
    const div = document.createElement('div');
    div.className = 'event-item bg-gray-800 rounded-lg p-4 flex justify-between items-center';
    div.dataset.datetime = item.date + (item.time ? 'T' + item.time : '');
    div.dataset.title = item.title;
    div.innerHTML = `
      <div>
        <div class="font-medium">${item.title}</div>
        <div class="text-sm text-gray-400">${dateStr} ${timeStr}</div>
      </div>
      <button class="delete-btn p-2 text-gray-400 hover:text-red-400" data-id="${item.id}" data-col="events">
        <i data-lucide="trash-2" class="w-4 h-4"></i>
      </button>
    `;
    list.appendChild(div);
  });
  lucide.createIcons();
}

function renderBudget(items) {
  const list = document.getElementById('budgetList');
  list.innerHTML = '';
  
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  
  const monthlyItems = items.filter(item => {
    const itemDate = new Date(item.date);
    return itemDate.getMonth() === currentMonth && itemDate.getFullYear() === currentYear;
  });
  
  monthlyItems.forEach(item => {
    const tr = document.createElement('tr');
    tr.className = 'budget-row border-b border-gray-700';
    tr.innerHTML = `
      <td class="px-4 py-3">${item.item}</td>
      <td class="px-4 py-3 text-right budget-cost">$${item.cost.toFixed(2)}</td>
      <td class="px-4 py-3 text-center">
        <span class="px-2 py-1 rounded text-xs font-medium ${item.user === 'D' ? 'bg-blue-600' : 'bg-pink-600'}">${item.user}</span>
      </td>
      <td class="px-2 py-3">
        <button class="delete-btn p-1 text-gray-400 hover:text-red-400" data-id="${item.id}" data-col="budget">
          <i data-lucide="x" class="w-4 h-4"></i>
        </button>
      </td>
    `;
    list.appendChild(tr);
  });
  
  const total = monthlyItems.reduce((sum, item) => sum + (parseFloat(item.cost) || 0), 0);
  document.getElementById('budgetTotal').textContent = `$${total.toFixed(2)}`;
  lucide.createIcons();
}

function renderGroceries(items) {
  const list = document.getElementById('groceriesList');
  list.innerHTML = '';
  
  items.forEach(item => {
    const div = document.createElement('div');
    div.className = `grocery-item bg-gray-800 rounded-lg p-4 flex justify-between items-center ${item.completed ? 'completed' : ''}`;
    div.innerHTML = `
      <div class="flex items-center gap-3">
        <button class="toggle-grocery p-1 ${item.completed ? 'text-emerald-400' : 'text-gray-500'}" data-id="${item.id}">
          <i data-lucide="${item.completed ? 'check-circle' : 'circle'}" class="w-5 h-5"></i>
        </button>
        <span class="grocery-text">${item.name}</span>
      </div>
      <button class="delete-btn p-2 text-gray-400 hover:text-red-400" data-id="${item.id}" data-col="groceries">
        <i data-lucide="trash-2" class="w-4 h-4"></i>
      </button>
    `;
    list.appendChild(div);
  });
  lucide.createIcons();
}

function setupAddButtons() {
  document.getElementById('addScheduleBtn').addEventListener('click', () => openModal('schedule'));
  document.getElementById('addEventBtn').addEventListener('click', () => openModal('event'));
  document.getElementById('addBudgetBtn').addEventListener('click', () => openModal('budget'));
  document.getElementById('addGroceryBtn').addEventListener('click', () => openModal('grocery'));
  document.getElementById('clearGroceriesBtn').addEventListener('click', clearAllGroceries);
}

function setupModal() {
  document.getElementById('modalCancel').addEventListener('click', closeModal);
  document.getElementById('modal').addEventListener('click', (e) => {
    if (e.target.id === 'modal') closeModal();
  });
}

let currentModalType = '';

function openModal(type) {
  currentModalType = type;
  const modal = document.getElementById('modal');
  const title = document.getElementById('modalTitle');
  const content = document.getElementById('modalContent');
  
  switch(type) {
    case 'schedule':
      title.textContent = 'Add Schedule Item';
      content.innerHTML = `
        <div class="space-y-3">
          <input type="text" id="scheduleTitle" placeholder="Title">
          <select id="scheduleDay">
            ${days.map(d => `<option value="${d}">${d}</option>`).join('')}
          </select>
          <input type="time" id="scheduleTime" value="09:00">
        </div>
      `;
      break;
    case 'event':
      title.textContent = 'Add Event';
      content.innerHTML = `
        <div class="space-y-3">
          <input type="text" id="eventTitle" placeholder="Event Title">
          <input type="date" id="eventDate">
          <input type="time" id="eventTime">
        </div>
      `;
      break;
    case 'budget':
      title.textContent = 'Add Budget Item';
      content.innerHTML = `
        <div class="space-y-3">
          <input type="text" id="budgetItem" placeholder="Item name">
          <input type="number" id="budgetCost" placeholder="Cost" step="0.01" min="0">
        </div>
      `;
      break;
    case 'grocery':
      title.textContent = 'Add Grocery Item';
      content.innerHTML = `
        <input type="text" id="groceryName" placeholder="Item name">
      `;
      break;
  }
  
  modal.classList.remove('hidden');
  
  document.getElementById('modalSave').onclick = () => saveModal();
}

function closeModal() {
  document.getElementById('modal').classList.add('hidden');
  currentModalType = '';
}

async function saveModal() {
  switch(currentModalType) {
    case 'schedule':
      const scheduleTitle = document.getElementById('scheduleTitle').value;
      const scheduleDay = document.getElementById('scheduleDay').value;
      const scheduleTime = document.getElementById('scheduleTime').value;
      
      if (scheduleTitle && scheduleDay && scheduleTime) {
        await db.collection('schedule').add({
          title: scheduleTitle,
          day: scheduleDay,
          time: scheduleTime,
          user: currentUser
        });
      }
      break;
      
    case 'event':
      const eventTitle = document.getElementById('eventTitle').value;
      const eventDate = document.getElementById('eventDate').value;
      const eventTime = document.getElementById('eventTime').value;
      
      if (eventTitle && eventDate) {
        await db.collection('events').add({
          title: eventTitle,
          date: eventDate,
          time: eventTime,
          user: currentUser
        });
      }
      break;
      
    case 'budget':
      const budgetItem = document.getElementById('budgetItem').value;
      const budgetCost = parseFloat(document.getElementById('budgetCost').value);
      
      if (budgetItem && !isNaN(budgetCost)) {
        await db.collection('budget').add({
          item: budgetItem,
          cost: budgetCost,
          date: new Date().toISOString(),
          user: currentUser
        });
      }
      break;
      
    case 'grocery':
      const groceryName = document.getElementById('groceryName').value;
      
      if (groceryName) {
        await db.collection('groceries').add({
          name: groceryName,
          completed: false
        });
      }
      break;
  }
  
  closeModal();
}

document.addEventListener('click', async (e) => {
  if (e.target.closest('.delete-btn')) {
    const btn = e.target.closest('.delete-btn');
    const id = btn.dataset.id;
    const col = btn.dataset.col;
    
    await db.collection(col).doc(id).delete();
  }
  
  if (e.target.closest('.toggle-grocery')) {
    const btn = e.target.closest('.toggle-grocery');
    const id = btn.dataset.id;
    const doc = await db.collection('groceries').doc(id).get();
    const current = doc.data().completed;
    
    await db.collection('groceries').doc(id).update({ completed: !current });
  }
});

async function clearAllGroceries() {
  const snapshot = await db.collection('groceries').get();
  const batch = db.batch();
  
  snapshot.docs.forEach(doc => {
    batch.delete(doc.ref);
  });
  
  await batch.commit();
}

function checkCurrentMonth() {
  const now = new Date();
  document.getElementById('currentMonth').textContent = `(${monthNames[now.getMonth()]} ${now.getFullYear()})`;
}
