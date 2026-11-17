/**
 * SkinAnalysisService (Mock/Demo Implementation)
 * Ini adalah service mock yang mensimulasikan hasil deteksi kondisi kulit.
 * Tidak ada diagnosis medis yang diberikan. Hasil murni bersifat indikatif/visual.
 */
class SkinAnalysisService {
    static async analyze(imagePath) {
        // Simulasi waktu proses model (2 detik)
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Generate random scores between 1 and 100
        const randomScore = () => Math.floor(Math.random() * 40) + 60; // 60 - 100 range mock
        
        const acne = randomScore();
        const redness = randomScore();
        const texture = randomScore();
        const hyperpigmentation = randomScore();
        
        // Overall is average
        const overall = Math.round((acne + redness + texture + hyperpigmentation) / 4);

        const getDescriptiveText = (score, type) => {
            if (score > 85) return `Indikasi ${type} terlihat sangat minim.`;
            if (score > 70) return `Indikasi ${type} terlihat cukup terkontrol.`;
            return `Terdapat indikasi ${type} yang terlihat secara visual.`;
        };

        const aiResponse = {
            acne_description: getDescriptiveText(acne, 'acne-like blemish'),
            redness_description: getDescriptiveText(redness, 'kemerahan'),
            texture_description: getDescriptiveText(texture, 'tekstur kulit tidak merata'),
            hyperpigmentation_description: getDescriptiveText(hyperpigmentation, 'hiperpigmentasi/noda gelap'),
            summary: "Berdasarkan analisis visual, profil kulit Anda menunjukkan variasi normal. Ingat, analisis ini tidak bersifat medis."
        };

        return {
            acne_score: acne,
            redness_score: redness,
            texture_score: texture,
            hyperpigmentation_score: hyperpigmentation,
            overall_score: overall,
            ai_response: aiResponse
        };
    }
}

module.exports = SkinAnalysisService;
