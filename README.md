# SkinCheck — AI-Powered Skin Health Monitoring & Skincare Assistant

> **Proyek Tugas Ujian Akhir Semester (UAS) Rekayasa Perangkat Lunak (RPL)**  
> Repositori Resmi: [https://github.com/budiiiiiii-star/SkinCheck](https://github.com/budiiiiiii-star/SkinCheck)

---

## 1. Identitas Anggota Kelompok

| No | Nama Lengkap | NIM | Peran / Kontribusi Utama |
|---|---|---|---|
| 1 | **Robi Muhamad Wahyudi** | `41257156` | Frontend Developer & UI/UX |
| 2 | **Wichal Aditiya Purnama** | `41257167` | Backend Developer & Integrasi API |
| 3 | **Ubai Datul Hamida** | `41257165` | Database Engineer & Quality Assurance |
| 4 | **Pria Budi Santoso** | `41257149` | AI/ML Engineer & System Architect |
| 5 | **Satria Fibi Saputra** | `41257159` | Full-stack Developer & Technical Writer |

* **Nomor Kelompok**: `[Kelompok - Isi Nomor Kelompok Anda]`
* **Program Studi / Fakultas**: Teknik Informatika / Ilmu Komputer `[Sesuaikan jika perlu]`
* **Mata Kuliah**: Rekayasa Perangkat Lunak (RPL)
* **Dosen Pengampu**: `[Nama Dosen Pengampu]`

---

## 2. Tema dan Topik Proyek

* **Tema Proyek**: Rekayasa Perangkat Lunak Berbasis Sistem Cerdas (Artificial Intelligence & Healthcare Technology).
* **Judul Proyek**: *SkinCheck: Sistem Pemantauan Kesehatan Kulit Wajah, Evaluasi Cakupan Sunscreen, dan Asisten Edukasi Skincare Terpersonalisasi Berbasis Multi-LLM & Computer Vision*.

---

## 3. Deskripsi Aplikasi

### 3.1 Penjelasan Aplikasi
**SkinCheck** adalah platform web cerdas yang dirancang untuk memantau kesehatan kulit wajah, mengevaluasi efektivitas penggunaan tabir surya (sunscreen), serta memberikan rekomendasi perawatan kulit (skincare) yang aman, objektif, dan terpersonalisasi. Aplikasi ini menggabungkan teknologi pemrosesan citra digital (*Computer Vision*) dan model bahasa besar (*Large Language Models*) dengan arsitektur multi-provider yang andal.

### 3.2 Latar Belakang & Permasalahan yang Diselesaikan
1. **Kurangnya Pemantauan Objektif Kondisi Kulit**: Sebagian besar masyarakat menilai efektivitas produk perawatan kulit secara subjektif dan sulit memantau perubahan kondisi kulit wajah dari waktu ke waktu (*baseline vs current condition*).
2. **Penggunaan Sunscreen yang Tidak Merata**: Banyak individu memakai tabir surya namun melewatkan area penting wajah (seperti kelopak mata, cuping hidung, atau garis rahang), sehingga perlindungan terhadap radiasi UV menjadi tidak optimal.
3. **Misinformasi dan Bahaya Self-Diagnosis**: Banyaknya informasi perawatan kulit di internet yang tidak berbasis bukti sering kali memicu kesalahan pemilihan bahan aktif produk kosmetik atau penanganan masalah kulit yang membahayakan.
4. **Keterbatasan Akses Edukasi Skincare**: Tidak semua orang memiliki akses cepat atau biaya untuk konsultasi rutin awal mengenai pemilihan kosmetik harian yang aman (*Over-The-Counter* / OTC).

### 3.3 Tujuan Pembuatan Aplikasi
1. Menyediakan sarana pemindaian dan pelacakan kondisi visual kulit wajah secara berkala dengan skor metrik yang mudah dipahami (jerawat, kemerahan, tekstur, hiperpigmentasi).
2. Menghadirkan alat estimasi visual cakupan sunscreen (*Sunscreen Coverage Heatmap*) untuk mengedukasi pengguna cara aplikasi tabir surya yang merata.
3. Menyediakan asisten virtual interaktif berbasis kecerdasan buatan dengan pagar pengaman etis (*Safety Layer*) yang memberikan edukasi kosmetik OTC tanpa melakukan diagnosis medis klinis ilegal.
4. Membantu pengguna menemukan rekomendasi produk yang relevan berdasarkan profil jenis kulit, tujuan perawatan, dan riwayat analisis.

---

## 4. Fitur Utama Aplikasi

### A. Fitur Pengguna (Customer)
1. **Autentikasi & Onboarding Terpandu**:
   - Registrasi dan login aman menggunakan enkripsi password (Bcrypt) dan JSON Web Token (JWT).
   - Kuesioner *onboarding* interaktif untuk mendata tipe kulit, tujuan perawatan, preferensi produk, serta persetujuan privasi (*consent*) data wajah.
2. **Skin Health Scan & Monitoring**:
   - Pemindaian wajah interaktif melalui tangkapan webcam atau unggah foto.
   - Analisis otomatis 4 parameter visual: *Acne/Blemish*, *Redness* (Kemerahan), *Texture* (Kerataan Tekstur), dan *Hyperpigmentation* (Noda Gelap).
   - Kalkulasi skor kesehatan keseluruhan (*Overall Health Score*) dan grafik tren perubahan (*baseline vs current*).
3. **Sunscreen Coverage Visualizer & Heatmap**:
   - Pemindaian visual cakupan tabir surya pada wajah menggunakan kamera RGB.
   - Peta panas visual (*Heatmap overlay*) yang menyoroti area yang terproteksi dengan baik versus area yang kurang terlindungi (*low coverage areas*).
4. **AI Skincare Assistant & Chatbot**:
   - Fitur tanya jawab seputar bahan aktif kosmetik, rutinitas pagi/malam, dan tips kecantikan dengan respons *streaming*.
   - Dukungan unggah gambar untuk konsultasi visual.
   - Widget *chatbot* mengambang (*floating widget*) yang dapat diakses langsung dari beranda maupun dashboard.
5. **Personalized Product Recommendation**:
   - Rekomendasi produk kosmetik OTC yang disesuaikan secara dinamis dengan tipe kulit dan permasalahan pengguna.
6. **WhatsApp Verification & OTP (Fonnte Integration)**:
   - Validasi format dan keaktifan nomor WhatsApp Indonesia menggunakan integrasi Fonnte API.
   - Pengiriman dan verifikasi kode One-Time Password (OTP) langsung ke nomor WhatsApp pengguna.

### B. Fitur Administrator (Admin Panel)
1. **Dashboard Statistik & Metrik**:
   - Visualisasi jumlah pengguna aktif, total pemindaian wajah, total pemindaian sunscreen, dan status sistem.
2. **Manajemen Pengguna (User Management)**:
   - Pemantauan daftar customer dan pengalihan status akun (*Active / Suspended*).
3. **Manajemen Produk (Product Catalog)**:
   - Tambah, tinjau, dan ubah status ketersediaan produk skincare beserta bahan aktif dan peruntukan jenis kulit.
4. **Manajemen & Audit Log Pemindaian**:
   - Riwayat seluruh sesi pemindaian kulit dan tabir surya yang dilakukan oleh pengguna.
5. **Pusat Pengaturan Sistem & Uji Coba API**:
   - Pengujian konektivitas real-time provider AI (NVIDIA, Gemini, OpenAI, Claude, Groq, Ollama).
   - Pengujian konektivitas perangkat Fonnte WhatsApp API.
   - Sistem notifikasi internal administrator.

---

## 5. Fitur Kecerdasan Buatan (Artificial Intelligence)

### 5.1 Deskripsi & Fungsi AI
Sistem SkinCheck mengintegrasikan dua pilar AI utama:
1. **Computer Vision (CV) & Image Processing**: Menganalisis kondisi visual kulit wajah serta memperkirakan ketebalan dan sebaran tabir surya.
2. **Generative Large Language Models (LLM)**: Menjadi asisten percakapan cerdas yang mengedukasi pengguna dan membantu administrator mengevaluasi data sistem.

### 5.2 Arsitektur & Model AI yang Digunakan
* **Arsitektur Multi-Provider LLM (`LLMProviderFactory`)**:
  Aplikasi dibangun menggunakan pola desain *Factory & Strategy*, sehingga pengembang dapat mengganti penyedia AI cukup dengan mengubah konfigurasi environment variable `AI_PROVIDER`:
  - **NVIDIA NIM API**: Menjalankan model penglihatan multimodal `meta/llama-3.2-11b-vision-instruct`, `meta/llama-3.2-90b-vision-instruct`, dan `nvidia/nemotron-3.5-lightning-30b-a3b`.
  - **Google Gemini API**: Menggunakan model `gemini-2.0-flash` yang cepat dan responsif.
  - **OpenAI API**: Menggunakan model `gpt-4o`.
  - **Anthropic Claude API**: Menggunakan model `claude-haiku-4-5`.
  - **Groq Cloud API**: Inferensi berkecepatan tinggi dengan `llama-3.3-70b-versatile`.
  - **Ollama**: Menjalankan model lokal mandiri (misal `llama3.2`) tanpa memerlukan API key eksternal.
* **Computer Vision Pipeline**:
  - Pustaka **TensorFlow.js** (`@tensorflow/tfjs`) dan manipulasi buffer citra (`jpeg-js`).
  - Layanan pendeteksi landmark wajah (`FaceDetectionService`).
  - Estimasi cakupan sunscreen (`CoverageEstimationService`) dan pembuatan heatmap berbasis intensitas warna (`HeatmapService`).

### 5.3 Cara Kerja & Alur Integrasi AI
```
[User Input / Foto Wajah] 
          │
          ▼
   [Safety Layer] ────────► (Jika indikasi darurat medis) ──► [Eskalasi ke Dokter Spesialis Kulit]
          │ (Aman)
          ▼
   [Image Analysis] ─────► (Model CV: Deteksi Wajah, Metrik Kulit, Heatmap Coverage)
          │
          ▼
   [Context Builder] ────► (Mengambil data profil, skin type, dan riwayat scan pengguna)
          │
          ▼
    [RAG Service] ───────► (Mengambil basis pengetahuan kosmetik & database produk OTC)
          │
          ▼
[LLM Provider Factory] ──► (NVIDIA NIM / Gemini / OpenAI / Groq / Claude / Ollama)
          │
          ▼
   [Streaming Response] ──► [Tampilan Antarmuka Chatbot / Hasil Analisis Pengguna]
```

1. **Penyaringan Keamanan (*Safety Layer*)**:
   Setiap pertanyaan pengguna diperiksa terlebih dahulu. Jika terdeteksi pertanyaan mengenai kondisi medis darurat, kanker kulit, atau permintaan resep obat keras, sistem langsung memberikan respons peringatan medis dan mengarahkan pengguna ke dokter spesialis kulit (*dermatologist*).
2. **Penyusunan Konteks (*Context Builder & RAG*)**:
   Sistem menyusun riwayat scan pengguna, profil tipe kulit, dan mengombinasikannya dengan basis data produk skincare yang cocok (*Retrieval-Augmented Generation*).
3. **Dual Persona AI**:
   - **Mode Customer**: Bertindak sebagai asisten ramah yang mengedukasi seputar rutinitas skincare harian dan pemilihan kosmetik OTC.
   - **Mode Admin**: Bertindak sebagai asisten teknis yang memiliki wawasan sistem untuk membantu administrator menanyakan data pengguna, rekap scan, maupun ketersediaan produk secara langsung.

---

## 6. Video Demonstrasi Aplikasi

Tonton video demonstrasi lengkap penggunaan aplikasi SkinCheck pada tautan berikut:

* **Link Video YouTube**: `[https://www.youtube.com/watch?v=XXXXXXXXXXX - Link Video Demonstrasi Menyusul]`

*(Catatan: Tautan video di atas dapat diperbarui setelah proses perekaman presentasi dan demonstrasi selesai diunggah).*

---

## 7. Panduan Instalasi dan Menjalankan Aplikasi

Ikuti langkah-langkah di bawah ini untuk menginstal dan menjalankan proyek di lingkungan lokal:

### 7.1 Persyaratan Perangkat & Perangkat Lunak
* **Sistem Operasi**: Windows 10/11, macOS, atau Linux.
* **Node.js**: Versi `18.x` atau yang lebih baru (disertai `npm`).
* **PostgreSQL**: Versi `14.x` atau yang lebih baru.
* **Git**: Versi terbaru untuk kloning repositori.
* **Web Browser**: Google Chrome, Mozilla Firefox, atau Microsoft Edge (dengan izin akses kamera/webcam).

---

### 7.2 Langkah-Langkah Instalasi

#### 1. Kloning Repositori
Buka terminal / Command Prompt / Git Bash, lalu jalankan:
```bash
git clone https://github.com/budiiiiiii-star/SkinCheck.git
cd SkinCheck
```

#### 2. Instalasi Dependencies
Pasang seluruh paket pustaka yang dibutuhkan menggunakan npm:
```bash
npm install
```

#### 3. Konfigurasi Database (PostgreSQL)
1. Pastikan layanan PostgreSQL Anda telah berjalan (misalnya melalui pgAdmin atau service PostgreSQL).
2. Buat database baru bernama `skincheck_db`:
   ```sql
   CREATE DATABASE skincheck_db;
   ```
3. Inisialisasi tabel-tabel utama dengan menjalankan skrip inisialisasi:
   ```bash
   node src/config/init_db.js
   ```
4. *(Opsional)* Jalankan migrasi tabel pencatatan WhatsApp jika ingin menggunakan fitur riwayat validasi nomor:
   ```bash
   # Jalankan perintah psql atau eksekusi query file berikut di pgAdmin:
   psql -U postgres -d skincheck_db -f src/config/whatsapp_migration.sql
   ```

#### 4. Konfigurasi Environment Variables (`.env`)
Salin file `.env.example` menjadi file `.env`:
```bash
# Pada Windows PowerShell:
Copy-Item .env.example .env

# Pada Linux / macOS / Git Bash:
cp .env.example .env
```

Buka file `.env` dan sesuaikan nilainya:
```env
# Konfigurasi Server
PORT=3000
NODE_ENV=development

# Konfigurasi Database PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=password_database_anda
DB_NAME=skincheck_db

# Kunci Rahasia JWT & Sesi
SESSION_SECRET=kunci_rahasia_sesi_anda
JWT_SECRET=kunci_rahasia_jwt_anda

# Konfigurasi AI Provider (Pilih: nvidia | gemini | openai | anthropic | groq | ollama)
AI_PROVIDER=gemini

# Kunci API Provider AI (isi sesuai provider yang digunakan)
GEMINI_API_KEY=masukkan_api_key_gemini_anda
GEMINI_MODEL=gemini-2.0-flash

NVIDIA_API_KEY=masukkan_api_key_nvidia_anda
NVIDIA_API_BASE_URL=https://integrate.api.nvidia.com/v1
NVIDIA_MODEL=meta/llama-3.2-11b-vision-instruct

# Konfigurasi Fonnte WhatsApp API (Opsional)
FONNTE_API_KEY=masukkan_token_fonnte_anda
FONNTE_API_URL=https://api.fonnte.com
```

> **Catatan Keamanan**: Jangan pernah membagikan atau mengunggah file `.env` yang berisi kredensial asli ke repositori publik!

---

### 7.3 Menjalankan Aplikasi

#### Mode Pengembangan (*Development* dengan auto-reload):
```bash
npm run dev
```

#### Mode Produksi:
```bash
npm start
```

Jika server berhasil berjalan, terminal akan menampilkan pesan:
```text
[+] Server SkinCheck berjalan di http://localhost:3000
```

---

### 7.4 Mengakses Aplikasi
Buka peramban (*web browser*) dan arahkan ke alamat:
```
http://localhost:3000
```

* **Registrasi Akun Baru**: Klik tombol **Daftar**, isi nama, email, dan password. Anda akan diarahkan ke halaman *Onboarding* untuk melengkapi profil jenis kulit.
* **Akses Administrator**: Untuk menguji fitur admin, ubah kolom `role` pengguna menjadi `'ADMIN'` pada tabel `users` di database PostgreSQL Anda, kemudian masuk ke rute `http://localhost:3000/admin/dashboard`.

---

## 8. Struktur Direktori Proyek

```plaintext
SkinCheck/
├── assets/                     # Berkas statis (CSS, JS client, gambar, ikon)
│   ├── css/
│   ├── js/
│   └── docs/
├── ml_pipeline/                # Skrip dataset & pelatihan model computer vision
│   ├── fetch_dataset.py
│   ├── preprocess.py
│   └── train_model.js
├── src/                        # Kode sumber utama backend & frontend EJS
│   ├── config/                 # Konfigurasi database & migrasi
│   ├── controllers/            # Controller penanganan rute & logika bisnis
│   ├── middleware/             # Middleware autentikasi JWT, role, & proteksi
│   ├── models/                 # Model abstraksi query database PostgreSQL
│   ├── routes/                 # Definisi routing aplikasi web & API
│   ├── services/               # Layanan bisnis (Sunscreen, Heatmap, WhatsApp)
│   │   └── ai/                 # Orchestrator AI, Provider Factory, RAG, Safety
│   └── views/                  # Tampilan antarmuka EJS (halaman & layout)
│       ├── pages/
│       └── partials/
├── storage/                    # Tempat penyimpanan sementara (diabaikan oleh git)
├── .env.example                # Templat konfigurasi variabel lingkungan
├── .gitignore                  # Berkas pengecualian Git
├── package.json                # Daftar pustaka & dependensi Node.js
├── README.md                   # Dokumentasi resmi proyek (berkas ini)
└── server.js                   # Berkas entri utama aplikasi Express
```

---

## 9. Lisensi dan Hak Cipta

Proyek ini dikembangkan untuk tujuan akademis dalam rangka pemenuhan Ujian Akhir Semester (UAS) mata kuliah Rekayasa Perangkat Lunak (RPL).  
Hak cipta © 2026 Tim Pengembang SkinCheck. Seluruh hak cipta dilindungi undang-undang.
