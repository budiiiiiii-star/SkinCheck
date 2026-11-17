/**
 * UserModel.js
 * Menangani logika data user.
 */
class UserModel {
    constructor() {
        // Mock data untuk tahap 1
        this.users = JSON.parse(localStorage.getItem('skincheck_users')) || [];
    }

    // Mendapatkan user berdasarkan email
    getUserByEmail(email) {
        return this.users.find(user => user.email === email);
    }

    // Mendaftarkan user baru
    register(name, email, password) {
        if (this.getUserByEmail(email)) {
            throw new Error('Email sudah terdaftar.');
        }
        
        const newUser = {
            id: Date.now().toString(),
            name,
            email,
            password, // Dalam sistem nyata, ini harus di-hash (bcrypt)
            role: 'customer',
            created_at: new Date().toISOString()
        };
        
        this.users.push(newUser);
        this.saveData();
        return newUser;
    }

    // Autentikasi user
    login(email, password) {
        const user = this.getUserByEmail(email);
        if (!user || user.password !== password) {
            throw new Error('Email atau password salah.');
        }
        
        // Simpan sesi login
        localStorage.setItem('skincheck_session', JSON.stringify(user));
        return user;
    }

    // Keluar
    logout() {
        localStorage.removeItem('skincheck_session');
    }

    // Menyimpan mock data ke localStorage
    saveData() {
        localStorage.setItem('skincheck_users', JSON.stringify(this.users));
    }
}
