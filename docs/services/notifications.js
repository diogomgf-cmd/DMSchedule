const NotificationService = {
  isSupported() {
    return 'Notification' in window;
  },

  async requestPermission() {
    if (!this.isSupported()) {
      return 'denied';
    }
    return await Notification.requestPermission();
  },

  async enable() {
    const permission = await this.requestPermission();
    return permission === 'granted';
  },

  isEnabled() {
    return this.isSupported() && Notification.permission === 'granted';
  }
};
