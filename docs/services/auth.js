const AuthService = {
  async login(password) {
    const authDoc = await FirestoreService.getAuthDoc();
    if (!authDoc || !authDoc.passwordHash) {
      throw new Error('No auth configured');
    }
    const inputHash = await hashPassword(password);
    if (inputHash !== authDoc.passwordHash) {
      throw new Error('Incorrect password');
    }
    sessionStorage.setItem(STORAGE_KEYS.AUTH, 'true');
    AppState.isAuthenticated = true;
    AppState.authDoc = authDoc;
    return true;
  },

  async setup(password, email) {
    const passwordHash = await hashPassword(password);
    await FirestoreService.setAuthDoc(passwordHash, email);
    AppState.authDoc = { passwordHash, email };
    sessionStorage.setItem(STORAGE_KEYS.AUTH, 'true');
    AppState.isAuthenticated = true;
    return true;
  },

  async resetPassword(newPassword, code) {
    const savedCode = localStorage.getItem(STORAGE_KEYS.RESET_CODE);
    const codeExp = parseInt(localStorage.getItem(STORAGE_KEYS.RESET_CODE_EXP) || '0');

    if (Date.now() > codeExp) {
      throw new Error('Code expired');
    }

    if (code && code !== savedCode) {
      throw new Error('Invalid code');
    }

    const newHash = await hashPassword(newPassword);
    const email = AppState.authDoc?.email;
    await FirestoreService.setAuthDoc(newHash, email);
    AppState.authDoc = { passwordHash: newHash, email };

    localStorage.removeItem(STORAGE_KEYS.RESET_CODE);
    localStorage.removeItem(STORAGE_KEYS.RESET_CODE_EXP);
    sessionStorage.setItem(STORAGE_KEYS.AUTH, 'true');
    AppState.isAuthenticated = true;
    return true;
  },

  isAuthenticated() {
    return sessionStorage.getItem(STORAGE_KEYS.AUTH) === 'true';
  },

  logout() {
    sessionStorage.removeItem(STORAGE_KEYS.AUTH);
    AppState.isAuthenticated = false;
    AppState.authDoc = null;
  },

  initEmailJS() {
    if (typeof emailjs !== 'undefined' && EMAILJS_CONFIG) {
      emailjs.init(EMAILJS_CONFIG.PUBLIC_KEY);
    }
  },

  async sendResetCode(email) {
    const code = generateResetCode();
    localStorage.setItem(STORAGE_KEYS.RESET_CODE, code);
    localStorage.setItem(STORAGE_KEYS.RESET_CODE_EXP, Date.now() + RESET_CODE_EXPIRY_MS);

    if (typeof emailjs !== 'undefined' && EMAILJS_CONFIG) {
      await emailjs.send(EMAILJS_CONFIG.SERVICE_ID, EMAILJS_CONFIG.TEMPLATE_ID, {
        to_email: email,
        code: code
      });
    }
    return code;
  }
};
