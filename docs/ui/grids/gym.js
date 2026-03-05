const GymGrid = {
  expandedWorkouts: new Set(),
  draggedExercise: null,
  draggedWorkoutId: null,

  init() {
    this.setupDocumentListeners();
  },

  setupDocumentListeners() {
    document.addEventListener('click', (e) => {
      const expandBtn = e.target.closest('.gym-workout-header');
      if (expandBtn) {
        const workoutId = expandBtn.dataset.workoutId;
        this.toggleWorkout(workoutId);
      }

      const deleteWorkoutBtn = e.target.closest('.gym-delete-workout');
      if (deleteWorkoutBtn) {
        const workoutId = deleteWorkoutBtn.dataset.workoutId;
        GymManager.deleteWorkout(workoutId);
      }

      const addExerciseBtn = e.target.closest('.gym-add-exercise');
      if (addExerciseBtn) {
        const workoutId = addExerciseBtn.dataset.workoutId;
        this.addNewExercise(workoutId);
      }

      const deleteExerciseBtn = e.target.closest('.gym-delete-exercise');
      if (deleteExerciseBtn) {
        const workoutId = deleteExerciseBtn.dataset.workoutId;
        const exerciseId = deleteExerciseBtn.dataset.exerciseId;
        GymManager.deleteExercise(workoutId, exerciseId);
      }
    });

    document.addEventListener('input', (e) => {
      const input = e.target;
      if (input.classList.contains('gym-field-input')) {
        this.handleFieldChange(input);
      }
    });
  },

  toggleWorkout(workoutId) {
    if (this.expandedWorkouts.has(workoutId)) {
      this.expandedWorkouts.delete(workoutId);
    } else {
      this.expandedWorkouts.add(workoutId);
    }
    this.render();
  },

  addNewExercise(workoutId) {
    const newExercise = {
      id: crypto.randomUUID(),
      name: '',
      duration: { minutes: 0, seconds: 0 },
      repetitions: { reps: 0, increment: null },
      weight: { starting: 0, increment: null }
    };
    GymManager.addExercise(workoutId, newExercise).then(() => {
      this.expandedWorkouts.add(workoutId);
      this.render();
      setTimeout(() => {
        const input = document.querySelector(`[data-workout-id="${workoutId}"][data-field="name"]`);
        if (input) input.focus();
      }, 50);
    });
  },

  handleFieldChange(input) {
    const workoutId = input.dataset.workoutId;
    const exerciseId = input.dataset.exerciseId;
    const field = input.dataset.field;
    const subfield = input.dataset.subfield;

    let value = input.value;
    if (input.type === 'number') {
      value = value === '' ? null : parseFloat(value);
    }

    const workout = GymManager.getData().find(w => w.id === workoutId);
    const exercise = workout?.exercises?.find(ex => ex.id === exerciseId);
    if (!exercise) return;

    let updateData = {};
    if (subfield) {
      updateData[field] = { ...exercise[field], [subfield]: value };
    } else {
      updateData[field] = value;
    }

    GymManager.updateExercise(workoutId, exerciseId, updateData);
  },

  render() {
    const container = document.getElementById('gymList');
    if (!container) return;

    const workouts = GymManager.getData();
    const user = AppState.currentUser;
    const userColor = user === 'D' ? 'blue' : 'pink';
    const bgClass = user === 'D' ? 'bg-blue-600' : 'bg-pink-600';

    container.innerHTML = workouts.map(workout => {
      const isExpanded = this.expandedWorkouts.has(workout.id);
      const exercises = workout.exercises || [];

      return `
        <div class="gym-workout" data-workout-id="${workout.id}">
          <div class="gym-workout-header ${isExpanded ? 'expanded' : ''}" data-workout-id="${workout.id}">
            <div class="gym-workout-toggle">
              <i data-lucide="${isExpanded ? 'chevron-down' : 'chevron-right'}" class="w-4 h-4"></i>
            </div>
            <span class="gym-workout-name">${workout.name || 'Unnamed Workout'}</span>
            <div class="gym-workout-actions">
              <button class="gym-delete-workout p-1 rounded hover:bg-red-600" data-workout-id="${workout.id}" title="Delete">
                <i data-lucide="trash-2" class="w-4 h-4"></i>
              </button>
            </div>
          </div>
          ${isExpanded ? `
            <div class="gym-workout-content">
              <div class="gym-exercises" data-workout-id="${workout.id}">
                ${exercises.length > 0 ? exercises.map((exercise, idx) => this.renderExercise(exercise, workout.id, userColor)).join('') : '<p class="text-gray-500 text-sm p-2">No exercises yet</p>'}
              </div>
              <button class="gym-add-exercise w-full py-2 mt-2 rounded bg-gray-700 hover:bg-gray-600 text-sm" data-workout-id="${workout.id}">
                <i data-lucide="plus" class="w-4 h-4 inline mr-1"></i> Add Exercise
              </button>
            </div>
          ` : ''}
        </div>
      `;
    }).join('');

    lucide.createIcons();
    this.setupDragAndDrop();
  },

  renderExercise(exercise, workoutId, userColor) {
    const user = AppState.currentUser;
    const themeClass = user === 'D' ? 'blue' : 'pink';

    return `
      <div class="gym-exercise" draggable="true" data-exercise-id="${exercise.id}" data-workout-id="${workoutId}">
        <div class="gym-exercise-drag">
          <i data-lucide="grip-vertical" class="w-4 h-4"></i>
        </div>
        <div class="gym-exercise-fields">
          <div class="gym-field-group">
            <div class="gym-field">
              <label>Exercise</label>
              <input type="text" class="gym-field-input" data-workout-id="${workoutId}" data-exercise-id="${exercise.id}" data-field="name" value="${exercise.name || ''}" placeholder="Exercise name">
            </div>
          </div>
          <div class="gym-field-group">
            <div class="gym-field-row">
              <div class="gym-field gym-field-half">
                <label>Min</label>
                <input type="number" class="gym-field-input" data-workout-id="${workoutId}" data-exercise-id="${exercise.id}" data-field="duration" data-subfield="minutes" value="${exercise.duration?.minutes || 0}" min="0">
              </div>
              <div class="gym-field gym-field-half">
                <label>Sec</label>
                <input type="number" class="gym-field-input" data-workout-id="${workoutId}" data-exercise-id="${exercise.id}" data-field="duration" data-subfield="seconds" value="${exercise.duration?.seconds || 0}" min="0" max="59">
              </div>
            </div>
          </div>
          <div class="gym-field-group">
            <div class="gym-field-row">
              <div class="gym-field gym-field-half">
                <label>Reps</label>
                <input type="number" class="gym-field-input" data-workout-id="${workoutId}" data-exercise-id="${exercise.id}" data-field="repetitions" data-subfield="reps" value="${exercise.repetitions?.reps || ''}" placeholder="0" min="0">
              </div>
              <div class="gym-field gym-field-half">
                <label>+Inc</label>
                <input type="number" class="gym-field-input" data-workout-id="${workoutId}" data-exercise-id="${exercise.id}" data-field="repetitions" data-subfield="increment" value="${exercise.repetitions?.increment || ''}" placeholder="+0" min="0">
              </div>
            </div>
          </div>
          <div class="gym-field-group">
            <div class="gym-field-row">
              <div class="gym-field gym-field-half">
                <label>Weight</label>
                <input type="number" class="gym-field-input" data-workout-id="${workoutId}" data-exercise-id="${exercise.id}" data-field="weight" data-subfield="starting" value="${exercise.weight?.starting || ''}" placeholder="0" min="0" step="0.5">
              </div>
              <div class="gym-field gym-field-half">
                <label>+Inc</label>
                <input type="number" class="gym-field-input" data-workout-id="${workoutId}" data-exercise-id="${exercise.id}" data-field="weight" data-subfield="increment" value="${exercise.weight?.increment || ''}" placeholder="+0" min="0" step="0.5">
              </div>
            </div>
          </div>
        </div>
        <button class="gym-delete-exercise p-1 rounded hover:bg-red-600" data-workout-id="${workoutId}" data-exercise-id="${exercise.id}" title="Delete">
          <i data-lucide="x" class="w-4 h-4"></i>
        </button>
      </div>
    `;
  },

  setupDragAndDrop() {
    const exercises = document.querySelectorAll('.gym-exercise');
    const containers = document.querySelectorAll('.gym-exercises');

    exercises.forEach(exercise => {
      exercise.addEventListener('dragstart', (e) => {
        this.draggedExercise = exercise.dataset.exerciseId;
        this.draggedWorkoutId = exercise.dataset.workoutId;
        exercise.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
      });

      exercise.addEventListener('dragend', () => {
        exercise.classList.remove('dragging');
        this.draggedExercise = null;
        this.draggedWorkoutId = null;
      });
    });

    containers.forEach(container => {
      container.addEventListener('dragover', (e) => {
        e.preventDefault();
        const afterElement = this.getDragAfterElement(container, e.clientY);
        const dragging = document.querySelector('.gym-exercise.dragging');
        if (dragging) {
          if (afterElement) {
            container.insertBefore(dragging, afterElement);
          } else {
            container.appendChild(dragging);
          }
        }
      });

      container.addEventListener('drop', (e) => {
        e.preventDefault();
        const workoutId = container.dataset.workoutId;
        const exerciseIds = Array.from(container.querySelectorAll('.gym-exercise'))
          .map(el => el.dataset.exerciseId);
        GymManager.reorderExercises(workoutId, exerciseIds);
      });
    });
  },

  getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll('.gym-exercise:not(.dragging)')];

    return draggableElements.reduce((closest, child) => {
      const box = child.getBoundingClientRect();
      const offset = y - box.top - box.height / 2;
      if (offset < 0 && offset > closest.offset) {
        return { offset: offset, element: child };
      } else {
        return closest;
      }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
  }
};
