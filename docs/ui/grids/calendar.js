const CalendarGrid = {
  init() {
    this.renderMonthTabs();
  },

  renderMonthTabs() {
    const container = document.getElementById('monthTabs');
    let html = '';

    MONTH_NAMES.forEach((month, index) => {
      const activeClass = index === AppState.currentMonth ? 'active' : '';
      html += `<button type="button" class="month-tab ${activeClass}" data-month="${index}">${month.slice(0, 3)}</button>`;
    });

    container.innerHTML = html;

    container.querySelectorAll('.month-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        AppState.setMonth(parseInt(tab.dataset.month));
        this.renderMonthTabs();
        this.render();
      });
    });
  },

  render() {
    const grid = document.getElementById('calendarGrid');
    const year = CalendarManager.year;

    let html = '';
    DAY_NAMES.forEach(day => {
      html += `<div class="calendar-header">${day}</div>`;
    });

    const firstDay = new Date(year, AppState.currentMonth, 1).getDay();
    const daysInMonth = getDaysInMonth(year, AppState.currentMonth);
    const prevMonthDays = getPrevMonthDays(year, AppState.currentMonth);

    const today = new Date();
    const isInCurrentMonth = isCurrentMonth(today, year, AppState.currentMonth);
    const todayDate = today.getDate();

    const startDay = firstDay === 0 ? 6 : firstDay - 1;

    for (let i = startDay - 1; i >= 0; i--) {
      const day = prevMonthDays - i;
      html += `<div class="calendar-day other-month"><div class="calendar-day-number">${day}</div></div>`;
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = generateDateKey(year, AppState.currentMonth, day);
      const isToday = isInCurrentMonth && day === todayDate ? 'today' : '';
      const dayEvents = CalendarManager.getEventsForDate(dateStr);

      let eventsHtml = '';
      dayEvents.slice(0, 3).forEach(event => {
        const userClass = event.user === 'D' ? 'user-d' : 'user-m';
        eventsHtml += `<div class="calendar-event ${userClass}" data-event-id="${event.id}">${event.time ? event.time + ' ' : ''}${event.title}</div>`;
      });
      if (dayEvents.length > 3) {
        eventsHtml += `<div class="calendar-event" style="background:#6b7280;color:white">+${dayEvents.length - 3}</div>`;
      }

      html += `
        <div class="calendar-day ${isToday}" data-date="${dateStr}">
          <div class="calendar-day-number">${day}</div>
          <div class="calendar-events">${eventsHtml}</div>
        </div>
      `;
    }

    const totalCells = startDay + daysInMonth;
    const remainingCells = 42 - totalCells;
    for (let i = 1; i <= remainingCells; i++) {
      html += `<div class="calendar-day other-month"><div class="calendar-day-number">${i}</div></div>`;
    }

    grid.innerHTML = html;

    grid.querySelectorAll('.calendar-event[data-event-id]').forEach(eventEl => {
      eventEl.addEventListener('click', (e) => {
        e.stopPropagation();
        const eventId = eventEl.dataset.eventId;
        const event = CalendarManager.events.find(ev => ev.id === eventId);
        if (event) {
          ModalManager.open('calendarEdit', event);
        }
      });
    });

    grid.querySelectorAll('.calendar-day:not(.other-month)').forEach(dayEl => {
      dayEl.addEventListener('click', () => {
        ModalManager.open('calendar', { date: dayEl.dataset.date });
      });
    });
  }
};
