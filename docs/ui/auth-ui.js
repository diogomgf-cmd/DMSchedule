const AuthUI = {
  init() {
    AuthService.initEmailJS();
    this.bindEvents();
  },

  bindEvents() {
    const els = this.getElements();
    if (!els) return;

    els.submit.addEventListener('click', () => this.validate());
    els.passwordInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.validate();
    });

    els.forgotBtn.addEventListener('click', () => this.showEmailStep());
    els.backToLoginBtn.addEventListener('click', () => this.showLoginStep());
    els.sendCodeBtn.addEventListener('click', () => this.sendCode());
    els.resendCodeBtn.addEventListener('click', () => this.resendCode());
    els.resetPasswordBtn.addEventListener('click', () => this.resetPassword());

    els.codeInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') els.resetPasswordBtn.click();
    });
    els.newPasswordInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') els.resetPasswordBtn.click();
    });
  },

  getElements() {
    return {
      overlay: document.getElementById('passwordOverlay'),
      passwordInput: document.getElementById('passwordInput'),
      loginEmailInput: document.getElementById('loginEmailInput'),
      emailInput: document.getElementById('emailInput'),
      codeInput: document.getElementById('codeInput'),
      newPasswordInput: document.getElementById('newPasswordInput'),
      submit: document.getElementById('passwordSubmit'),
      sendCodeBtn: document.getElementById('sendCodeBtn'),
      resetPasswordBtn: document.getElementById('resetPasswordBtn'),
      resendCodeBtn: document.getElementById('resendCodeBtn'),
      backToLoginBtn: document.getElementById('backToLoginBtn'),
      error: document.getElementById('passwordError'),
      prompt: document.getElementById('passwordPrompt'),
      forgotBtn: document.getElementById('forgotPasswordBtn'),
      loginStep: document.getElementById('loginStep'),
      resetStep1: document.getElementById('resetStep1'),
      resetStep2: document.getElementById('resetStep2'),
      codeSentTo: document.getElementById('codeSentTo')
    };
  },

  showStep(step) {
    const els = this.getElements();
    els.loginStep.classList.add('hidden');
    els.resetStep1.classList.add('hidden');
    els.resetStep2.classList.add('hidden');
    els.error.classList.add('hidden');

    if (step === 'login') {
      els.loginStep.classList.remove('hidden');
      els.prompt.textContent = 'Enter password to continue';
    } else if (step === 'email') {
      els.resetStep1.classList.remove('hidden');
      els.prompt.textContent = 'Reset your password';
    } else if (step === 'code') {
      els.resetStep2.classList.remove('hidden');
      els.prompt.textContent = 'Enter the code sent to your email';
    }
  },

  showLoginStep() {
    this.showStep('login');
  },

  showEmailStep() {
    const els = this.getElements();
    if (!AppState.authDoc || !AppState.authDoc.passwordHash) {
      this.showStep('login');
      return;
    }

    if (!AppState.authDoc.email) {
      els.prompt.textContent = 'Add email for password recovery';
      els.emailInput.value = '';
      els.emailInput.placeholder = 'Enter your email address';
    } else {
      els.prompt.textContent = 'Reset your password';
      els.emailInput.value = AppState.authDoc.email;
      els.emailInput.placeholder = AppState.authDoc.email;
    }

    this.showStep('email');
    els.error.classList.add('hidden');
    els.forgotBtn.classList.add('hidden');
  },

  showError(message) {
    const els = this.getElements();
    els.error.textContent = message;
    els.error.classList.remove('hidden');
  },

  hideError() {
    const els = this.getElements();
    els.error.classList.add('hidden');
  },

  setSubmitState(loading, text = 'Continue') {
    const els = this.getElements();
    els.submit.disabled = loading;
    els.submit.textContent = text;
  },

  async validate() {
    const els = this.getElements();
    const pwd = els.passwordInput.value.trim();
    const email = els.loginEmailInput.value.trim();

    if (!pwd) return;

    this.setSubmitState(true, 'Verifying...');

    try {
      if (AppState.authDoc && AppState.authDoc.passwordHash) {
        const inputHash = await hashPassword(pwd);
        if (inputHash === AppState.authDoc.passwordHash) {
          this.authenticate();
        } else {
          this.showError('Incorrect password');
          els.passwordInput.value = '';
        }
      } else {
        const pwdError = validatePassword(pwd);
        if (pwdError) {
          this.showError(pwdError);
          return;
        }
        if (!email || !validateEmail(email)) {
          this.showError('Please enter a valid email address');
          return;
        }

        const passwordHash = await hashPassword(pwd);
        await FirestoreService.setAuthDoc(passwordHash, email);
        AppState.authDoc = { passwordHash, email };
        this.authenticate();
      }
    } catch (e) {
      this.showError('Connection error. Please try again.');
    } finally {
      this.setSubmitState(false);
    }
  },

  async sendCode() {
    const els = this.getElements();
    const email = els.emailInput.value.trim();

    if (!email || !validateEmail(email)) {
      this.showError('Please enter a valid email address');
      return;
    }

    if (!AppState.authDoc || !AppState.authDoc.passwordHash) {
      this.showStep('login');
      return;
    }

    if (AppState.authDoc.email && email !== AppState.authDoc.email) {
      this.showError('Email does not match our records');
      return;
    }

    els.sendCodeBtn.disabled = true;
    els.sendCodeBtn.textContent = 'Sending...';

    try {
      await AuthService.sendResetCode(email);
      const isFirstTimeSetup = !AppState.authDoc.email;
      els.codeSentTo.textContent = `Code sent to ${email}`;
      this.showStep('code');
      els.codeInput.value = '';
      els.newPasswordInput.value = '';
      els.codeInput.focus();
    } catch (err) {
      console.error('Failed to send email:', err);
      this.showError('Failed to send email. Please try again.');
    } finally {
      els.sendCodeBtn.disabled = false;
      els.sendCodeBtn.textContent = 'Send Code';
    }
  },

  async resendCode() {
    const els = this.getElements();
    const email = els.emailInput.value.trim();

    els.resendCodeBtn.disabled = true;
    els.resendCodeBtn.textContent = 'Sending...';

    try {
      await AuthService.sendResetCode(email);
      els.codeSentTo.textContent = `Code sent to ${email}`;
      els.codeInput.value = '';
      els.codeInput.focus();
    } catch (err) {
      console.error('Failed to resend email:', err);
      this.showError('Failed to resend email. Please try again.');
    } finally {
      els.resendCodeBtn.disabled = false;
      els.resendCodeBtn.textContent = 'Resend Code';
    }
  },

  async resetPassword() {
    const els = this.getElements();
    const code = els.codeInput.value.trim();
    const newPwd = els.newPasswordInput.value.trim();

    if (!newPwd) {
      this.showError('Please enter a new password');
      return;
    }

    const newPwdError = validatePassword(newPwd);
    if (newPwdError) {
      this.showError(newPwdError);
      return;
    }

    els.resetPasswordBtn.disabled = true;
    els.resetPasswordBtn.textContent = 'Saving...';

    try {
      await AuthService.resetPassword(newPwd, code);
      const isFirstTimeSetup = (!AppState.authDoc || !AppState.authDoc.email) && els.emailInput.value.trim();

      if (isFirstTimeSetup) {
        els.error.classList.remove('hidden');
        els.error.classList.remove('text-red-400');
        els.error.classList.add('text-emerald-400');
        els.error.textContent = 'Email added! You can now use it for password recovery.';

        setTimeout(() => {
          els.error.classList.add('hidden');
          els.error.classList.remove('text-emerald-400');
          els.error.classList.add('text-red-400');
          this.authenticate();
        }, 2000);
      } else {
        this.authenticate();
      }
    } catch (e) {
      this.showError(e.message || 'Connection error. Please try again.');
    } finally {
      els.resetPasswordBtn.disabled = false;
      els.resetPasswordBtn.textContent = 'Reset Password';
    }
  },

  authenticate() {
    const els = this.getElements();
    sessionStorage.setItem(STORAGE_KEYS.AUTH, 'true');
    AppState.isAuthenticated = true;
    els.overlay.classList.add('hidden');
    App.initApp();
  },

  configureForFirstTime() {
    const els = this.getElements();
    els.prompt.textContent = 'Set a password (shared between D & M)';
    els.passwordInput.placeholder = 'Create password';
    els.loginEmailInput.classList.remove('hidden');
    els.loginEmailInput.placeholder = 'Your email (for recovery)';
    els.forgotBtn.classList.add('hidden');
  },

  configureForReturning() {
    const els = this.getElements();
    els.forgotBtn.classList.remove('hidden');
  },

  showConnectionError() {
    const els = this.getElements();
    els.prompt.textContent = 'Connection required';
    els.error.textContent = 'Unable to connect. Please check your internet connection.';
    els.error.classList.remove('hidden');
    els.forgotBtn.classList.add('hidden');
    els.loginStep.classList.add('hidden');
  }
};
