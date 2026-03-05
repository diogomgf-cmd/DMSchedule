async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePassword(pwd) {
  if (pwd.length < 5) return 'Password must be at least 5 characters';
  if (!/[a-zA-Z]/.test(pwd)) return 'Password must include letters';
  if (!/[0-9]/.test(pwd)) return 'Password must include numbers';
  return null;
}

function generateResetCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function generateDateKey(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function formatScheduleKey(day, time) {
  return `${day}-${time}`;
}

function parseScheduleKey(key) {
  const [day, time] = key.split('-');
  return { day, time };
}

function getCalendarStartDay(year, month) {
  const firstDay = new Date(year, month, 1).getDay();
  return firstDay === 0 ? 6 : firstDay - 1;
}

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function getPrevMonthDays(year, month) {
  return new Date(year, month, 0).getDate();
}

function isCurrentMonth(today, year, month) {
  return today.getMonth() === month && today.getFullYear() === year;
}
