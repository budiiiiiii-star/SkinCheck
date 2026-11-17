/**
 * AuthController.js
 * Menghubungkan View dan Model untuk autentikasi.
 */
class AuthController {
    constructor(model, view) {
        this.model = model;
        this.view = view;

        // Bind handler ke view
        this.view.bindLogin(this.handleLogin.bind(this));
        this.view.bindRegister(this.handleRegister.bind(this));
        
        this.checkSession();
    }

    // Jika sudah login, redirect ke dashboard
    checkSession() {
        const session = localStorage.getItem('skincheck_session');
        if (session) {
            // Untuk tahap 1 mock, kita hanya tampilkan alert
            // Pada tahap dashboard, ini akan di-redirect window.location.href = 'dashboard.html'
            document.querySelector('main').innerHTML = `
                <div class="text-center bg-white p-5 rounded-4 shadow-sm">
                    <h2 class="fw-bold">Selamat Datang kembali!</h2>
                    <p class="lead">Sesi Anda aktif.</p>
                    <button id="logout-btn" class="btn btn-outline-danger mt-3">Logout</button>
                </div>
            `;
            
            document.getElementById('logout-btn').addEventListener('click', () => {
                this.model.logout();
                window.location.reload();
            });
        }
    }

    handleLogin(email, password) {
        try {
            const user = this.model.login(email, password);
            console.log('Login berhasil:', user);
            window.location.reload(); // Reload untuk memicu checkSession
        } catch (error) {
            this.view.showLoginError(error.message);
        }
    }

    handleRegister(name, email, password) {
        try {
            this.model.register(name, email, password);
            this.view.showRegisterSuccess();
        } catch (error) {
            this.view.showRegisterError(error.message);
        }
    }
}
