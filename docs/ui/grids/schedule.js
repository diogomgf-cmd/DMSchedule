const ScheduleGrid = {
  touchEnded: false,

  init() {
    this.setupDragSelection();
  },

  setupDragSelection() {
    const applyBtn = document.getElementById('applyMultiBtn');
    const grid = document.getElementById('scheduleGrid');
    let isDragging = false;
    let dragStartCell = null;
    let hasDragged = false;

    function handleStart(cell) {
      if (!cell || cell.classList.contains('blocked')) return;
      isDragging = true;
      hasDragged = false;
      dragStartCell = cell;
      grid.classList.add('no-animation');
    }

    function handleMove(cell) {
      if (!isDragging || !dragStartCell) return;
      if (!cell || cell.classList.contains('blocked')) return;

      hasDragged = true;

      const startRow = parseInt(dragStartCell.dataset.timeIndex);
      const startCol = parseInt(dragStartCell.dataset.colIndex);
      const endRow = parseInt(cell.dataset.timeIndex);
      const endCol = parseInt(cell.dataset.colIndex);

      AppState.selectedCells.clear();

      const minRow = Math.min(startRow, endRow);
      const maxRow = Math.max(startRow, endRow);
      const minCol = Math.min(startCol, endCol);
      const maxCol = Math.max(startCol, endCol);

      document.querySelectorAll('.schedule-cell').forEach(c => {
        const r = parseInt(c.dataset.timeIndex);
        const col = parseInt(c.dataset.colIndex);
        if (r >= minRow && r <= maxRow && col >= minCol && col <= maxCol && !c.classList.contains('blocked')) {
          AppState.selectedCells.add(c.dataset.key);
        }
      });

      ScheduleGrid.render();
    }

    function handleEnd(cell) {
      if (!isDragging) return;

      grid.classList.remove('no-animation');
      ScheduleGrid.touchEnded = true;
      setTimeout(() => ScheduleGrid.touchEnded = false, 300);

      if (hasDragged && AppState.selectedCells.size > 0) {
        ModalManager.open('scheduleMulti');
      } else if (cell && !hasDragged) {
        ScheduleGrid.handleCellClick(cell);
      }

      isDragging = false;
      dragStartCell = null;
      hasDragged = false;
    }

    grid.addEventListener('mousedown', (e) => {
      handleStart(e.target.closest('.schedule-cell'));
    });

    grid.addEventListener('mousemove', (e) => {
      handleMove(e.target.closest('.schedule-cell'));
    });

    grid.addEventListener('mouseup', (e) => {
      handleEnd(e.target.closest('.schedule-cell'));
    });

    grid.addEventListener('mouseleave', () => {
      if (isDragging) {
        grid.classList.remove('no-animation');
        isDragging = false;
        dragStartCell = null;
        hasDragged = false;
      }
    });

    let touchStartCell = null;

    grid.addEventListener('touchstart', (e) => {
      const touch = e.touches[0];
      const cell = document.elementFromPoint(touch.clientX, touch.clientY)?.closest('.schedule-cell');
      touchStartCell = cell;
      handleStart(cell);
    }, { passive: true });

    grid.addEventListener('touchmove', (e) => {
      const touch = e.touches[0];
      const cell = document.elementFromPoint(touch.clientX, touch.clientY)?.closest('.schedule-cell');
      handleMove(cell);
    }, { passive: true });

    grid.addEventListener('touchend', (e) => {
      handleEnd(touchStartCell);
    }, { passive: true });

    applyBtn.addEventListener('click', () => {
      if (AppState.selectedCells.size > 0) {
        ModalManager.open('scheduleMulti');
      }
    });
  },

  render() {
    const grid = document.getElementById('scheduleGrid');
    const isBlocked = AppState.currentUser === 'D';

    let html = '<div class="schedule-header"></div>';

    DAYS.forEach(day => {
      html += `<div class="schedule-header d-user">${day.slice(0, 3)} (D)</div>`;
    });

    DAYS.forEach(day => {
      html += `<div class="schedule-header m-user">${day.slice(0, 3)} (M)</div>`;
    });

    TIMES.forEach((time, timeIndex) => {
      html += `<div class="schedule-row-label">${time}</div>`;

      DAYS.forEach((day, dayIndex) => {
        const keyD = `D-${day}-${time}`;
        const itemD = ScheduleManager.dataD[`${day}-${time}`];
        const filledD = itemD ? 'filled-d' : '';
        const blockedClass = !isBlocked ? 'blocked' : '';
        const titleD = itemD ? itemD.title : '';
        const selectedClass = AppState.selectedCells.has(keyD) ? 'selected' : '';

        html += `
          <div class="schedule-cell ${filledD} ${blockedClass} ${selectedClass}" data-user="D" data-day="${day}" data-time="${time}" data-key="${keyD}" data-time-index="${timeIndex}" data-col-index="${dayIndex + 1}">
            ${titleD ? `<span class="event-title">${titleD}</span>` : ''}
          </div>
        `;
      });

      DAYS.forEach((day, dayIndex) => {
        const keyM = `M-${day}-${time}`;
        const itemM = ScheduleManager.dataM[`${day}-${time}`];
        const filledM = itemM ? 'filled-m' : '';
        const blockedClass = isBlocked ? 'blocked' : '';
        const titleM = itemM ? itemM.title : '';
        const selectedClass = AppState.selectedCells.has(keyM) ? 'selected' : '';

        html += `
          <div class="schedule-cell ${filledM} ${blockedClass} ${selectedClass}" data-user="M" data-day="${day}" data-time="${time}" data-key="${keyM}" data-time-index="${timeIndex}" data-col-index="${dayIndex + 8}">
            ${titleM ? `<span class="event-title">${titleM}</span>` : ''}
          </div>
        `;
      });
    });

    grid.innerHTML = html;
    lucide.createIcons();

    const selectedCountEl = document.getElementById('selectedCount');
    if (selectedCountEl) selectedCountEl.textContent = AppState.selectedCells.size;

    if (AppState.selectedCells.size > 0) {
      document.getElementById('applyMultiBtn').classList.remove('hidden');
    } else {
      document.getElementById('applyMultiBtn').classList.add('hidden');
    }

    document.querySelectorAll('.schedule-cell:not(.blocked)').forEach(cell => {
      cell.addEventListener('click', (e) => {
        if (this.touchEnded) return;
        this.handleCellClick(cell);
      });
    });
  },

  handleCellClick(cell) {
    const user = cell.dataset.user;
    const day = cell.dataset.day;
    const time = cell.dataset.time;
    const key = `${day}-${time}`;

    if (user !== AppState.currentUser) return;

    const scheduleData = user === 'D' ? ScheduleManager.dataD : ScheduleManager.dataM;

    if (scheduleData[key]) {
      ModalManager.open('scheduleEdit', {
        id: scheduleData[key].id,
        user,
        day,
        time,
        title: scheduleData[key].title,
        key
      });
    } else {
      ModalManager.open('scheduleAdd', { user, day, time, key });
    }
  }
};
