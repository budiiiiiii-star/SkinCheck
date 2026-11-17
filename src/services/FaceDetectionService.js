/**
 * FaceDetectionService (Mock/Demo Implementation)
 * Ini adalah interface mock untuk pengembangan tahap awal.
 * Nanti akan diganti dengan model Computer Vision sebenarnya.
 */
class FaceDetectionService {
    /**
     * Menganalisis gambar untuk validasi wajah.
     * @param {Buffer} imageBuffer - Buffer gambar (opsional dalam mock ini).
     * @returns {Object} Hasil analisis
     */
    static async analyzeImage(imageBuffer) {
        // Simulasi delay proses AI
        await new Promise(resolve => setTimeout(resolve, 800));

        // Dalam implementasi nyata, kita akan menggunakan OpenCV atau TensorFlow.js 
        // untuk mendeteksi: wajah, blur, dan pencahayaan.
        
        // MOCK LOGIC: Kita akan menganggap valid 90% of the time secara random,
        // tapi untuk tujuan testing kita asumsikan selalu valid kecuali ada metadata tertentu (tidak di-handle di mock ini).
        
        const isFaceDetected = true;
        const isLightingGood = true;
        const isNotBlurry = true;

        const qualityScore = isFaceDetected && isLightingGood && isNotBlurry ? 95 : 40;
        
        const isValid = qualityScore > 70;

        return {
            isValid,
            score: qualityScore,
            details: {
                faceDetected: isFaceDetected,
                lighting: isLightingGood ? 'Good' : 'Too Dark',
                blur: isNotBlurry ? 'Clear' : 'Blurry'
            },
            message: isValid ? 'Validasi berhasil.' : 'Foto tidak memenuhi syarat.'
        };
    }
}

module.exports = FaceDetectionService;
