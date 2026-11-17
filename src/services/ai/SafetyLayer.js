class SafetyLayer {
    // Daftar kata kunci medis berbahaya yang di-intercept
    static medicalKeywords = [
        'luka', 'berdarah', 'nanah', 'infeksi', 'alergi berat', 
        'bengkak', 'diagnosis', 'resep', 'obat dokter', 'penyakit',
        'kanker', 'melanoma', 'berhenti obat', 'dosis'
    ];

    static isMedicalEmergencyOrDiagnosis(message) {
        const lowerMsg = message.toLowerCase();
        return this.medicalKeywords.some(keyword => lowerMsg.includes(keyword));
    }

    static getEscalationMessage() {
        return "⚠️ **Peringatan Keamanan**: Berdasarkan pertanyaan Anda, sepertinya Anda mengalami kondisi yang membutuhkan perhatian medis. Saya adalah asisten AI kosmetik dan **tidak dapat mendiagnosis penyakit, memberikan resep, atau memberikan saran pengobatan medis**. Mohon segera berkonsultasi dengan Dokter Spesialis Kulit (Dermatologist) atau kunjungi fasilitas kesehatan terdekat.";
    }
}

module.exports = SafetyLayer;
