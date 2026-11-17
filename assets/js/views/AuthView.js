/**
 * AuthView.js
 * Menangani interaksi DOM untuk autentikasi.
 */
class AuthView {
    constructor() {
        // Elements
        this.loginView = document.getElementById('login-view');
        this.registerView = document.getElementById('register-view');
        
        this.loginForm = document.getElementById('login-form');
        this.registerForm = document.getElementById('register-form');
        
        this.showRegisterBtn = document.getElementById('show-register');
        this.showLoginBtn = document.getElementById('show-login');
        
        this.loginError = document.getElementById('login-error');
        this.registerError = document.getElementById('register-error');
        this.registerSuccess = document.getElementById('register-success');
        
        this.bindEvents();
    }

    // Toggle antara Login dan Register
    bindEvents() {
        this.showRegisterBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.loginView.classList.remove('active-view');
            this.registerView.classList.add('active-view');
            this.resetForms();
        });

        this.showLoginBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.registerView.classList.remove('active-view');
            this.loginView.classList.add('active-view');
            this.resetForms();
        });
    }

    // Bind event submit login ke Controller
    bindLogin(handler) {
        this.loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = document.getElementById('login-email').value;
            const password = document.getElementById('login-password').value;
            handler(email, password);
        });
    }

    // Bind event submit register ke Controller
    bindRegister(handler) {
        this.registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('register-name').value;
            const email = document.getElementById('register-email').value;
            const password = document.getElementById('register-password').value;
            handler(name, email, password);
        });
    }

    showLoginError(message) {
        this.loginError.textContent = message;
        this.loginError.classList.remove('d-none');
    }

    showRegisterError(message) {
        this.registerError.textContent = message;
        this.registerError.classList.remove('d-none');
        this.registerSuccess.classList.add('d-none');
    }

    showRegisterSuccess() {
        this.registerSuccess.classList.remove('d-none');
        this.registerError.classList.add('d-none');
        this.registerForm.reset();
        
        // Auto kembali ke login setelah 2 detik
        setTimeout(() => {
            this.showLoginBtn.click();
        }, 2000);
    }

    resetForms() {
        this.loginForm.reset();
        this.registerForm.reset();
        this.loginError.classList.add('d-none');
        this.registerError.classList.add('d-none');
        this.registerSuccess.classList.add('d-none');
    }
}
