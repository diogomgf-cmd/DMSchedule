const GymManager = {
  data: [],

  init(onUpdate) {
    this.unsubscribe = FirestoreService.subscribeToGym(AppState.currentUser, (data) => {
      this.data = data.sort((a, b) => (a.order || 0) - (b.order || 0));
      onUpdate();
    });
  },

  cleanup() {
    if (this.unsubscribe) this.unsubscribe();
  },

  reinitialize(onUpdate) {
    this.cleanup();
    this.init(onUpdate);
  },

  getData() {
    return this.data;
  },

  async addWorkout(name) {
    const order = this.data.length;
    return FirestoreService.addWorkout(AppState.currentUser, name, order);
  },

  async updateWorkout(id, data) {
    return FirestoreService.updateWorkout(AppState.currentUser, id, data);
  },

  async deleteWorkout(id) {
    return FirestoreService.deleteWorkout(AppState.currentUser, id);
  },

  async clear() {
    return FirestoreService.clearGym(AppState.currentUser);
  },

  async addExercise(workoutId, exercise) {
    const workout = this.data.find(w => w.id === workoutId);
    if (!workout) return;

    const exercises = [...(workout.exercises || []), { ...exercise, id: crypto.randomUUID() }];
    return this.updateWorkout(workoutId, { exercises });
  },

  async updateExercise(workoutId, exerciseId, exerciseData) {
    const workout = this.data.find(w => w.id === workoutId);
    if (!workout) return;

    const exercises = (workout.exercises || []).map(ex =>
      ex.id === exerciseId ? { ...ex, ...exerciseData } : ex
    );
    return this.updateWorkout(workoutId, { exercises });
  },

  async deleteExercise(workoutId, exerciseId) {
    const workout = this.data.find(w => w.id === workoutId);
    if (!workout) return;

    const exercises = (workout.exercises || []).filter(ex => ex.id !== exerciseId);
    return this.updateWorkout(workoutId, { exercises });
  },

  async reorderExercises(workoutId, exerciseIds) {
    const workout = this.data.find(w => w.id === workoutId);
    if (!workout) return;

    const exerciseMap = new Map((workout.exercises || []).map(ex => [ex.id, ex]));
    const exercises = exerciseIds.map(id => exerciseMap.get(id)).filter(Boolean);
    return this.updateWorkout(workoutId, { exercises });
  }
};
