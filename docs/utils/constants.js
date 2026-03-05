const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const TIMES = [];
for (let h = 8; h <= 24; h++) {
  TIMES.push(`${h.toString().padStart(2, '0')}:00`);
  if (h < 24) TIMES.push(`${h.toString().padStart(2, '0')}:30`);
}

const USERS = {
  D: 'D',
  M: 'M'
};

const COLLECTIONS = {
  SCHEDULE_D: 'schedule_D',
  SCHEDULE_M: 'schedule_M',
  EVENTS: 'events',
  BUDGET_D: 'budget_D',
  BUDGET_M: 'budget_M',
  GROCERIES: 'groceries',
  SETTINGS_AUTH: 'settings/auth'
};

const STORAGE_KEYS = {
  AUTH: 'dm_auth',
  RESET_CODE: 'dm_reset_code',
  RESET_CODE_EXP: 'dm_reset_code_exp'
};

const PASSWORD_MIN_LENGTH = 5;
const RESET_CODE_EXPIRY_MS = 10 * 60 * 1000;
