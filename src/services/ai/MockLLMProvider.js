class MockLLMProvider {
    static async generateResponse(prompt) {
        // Simulasi delay jaringan
        await new Promise(resolve => setTimeout(resolve, 1500));

        const lowerPrompt = prompt.toLowerCase();

        // 1. Basic greeting / who are you
        if (lowerPrompt.includes('halo') || lowerPrompt.includes('siapa')) {
            return "Halo! Saya adalah SkinCheck AI Assistant. Saya siap membantu menjawab pertanyaan seputar skincare, memberikan edukasi, dan membantu Anda menganalisis hasil scan visual Anda. Ada yang bisa saya bantu hari ini?";
        }

        // 2. Explaining RAG knowledge
        if (lowerPrompt.includes('[rag]')) {
            // Ekstrak info RAG secara kasar untuk mock
            return "Berdasarkan database pengetahuan kosmetik kami: " + prompt.split('[RAG]:')[1].split('\n')[0] + " Apakah Anda memiliki pertanyaan lanjutan tentang hal ini?";
        }

        // 3. Explaining User Context
        if (lowerPrompt.includes('scan saya') || lowerPrompt.includes('hasil scan')) {
            if (prompt.includes('Latest Face Scan')) {
                return "Melihat data terbaru Anda, hasil scan visual menunjukkan adanya beberapa indikator. Ini bukan diagnosis medis ya. Untuk meningkatkan kondisi kulit, Anda mungkin bisa fokus pada rutinitas yang menargetkan area yang butuh perhatian sesuai hasil scan tersebut.";
            } else {
                return "Maaf, sepertinya Anda belum melakukan Face Scan. Silakan lakukan scan terlebih dahulu di menu Dashboard agar saya bisa memberikan saran yang lebih kontekstual.";
            }
        }

        // 4. Recommendation
        if (lowerPrompt.includes('[recommendation]')) {
             return "Tentu! " + prompt.split('[RECOMMENDATION]:')[1].split('\n')[0] + " Pastikan produk OTC tersebut cocok dengan jenis kulit Anda ya.";
        }

        // 5. Fallback
        return "Terima kasih atas pertanyaannya. Sebagai AI edukasi skincare, saya menyarankan Anda untuk rutin menjaga kebersihan kulit dan menggunakan sunscreen. Jika ada kondisi yang mengkhawatirkan, sebaiknya periksakan ke dokter spesialis kulit.";
    }
}

module.exports = MockLLMProvider;
