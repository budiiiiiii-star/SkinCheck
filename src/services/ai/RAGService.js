class RAGService {
    static async retrieveKnowledge(query) {
        // Mock implementation of Vector Search against Knowledge Base
        const lowerQuery = query.toLowerCase();
        let retrievedContext = "";

        if (lowerQuery.includes('niacinamide')) {
            retrievedContext += "[RAG]: Niacinamide (Vitamin B3) berfungsi mencerahkan kulit, mengontrol sebum, dan memperbaiki skin barrier.\n";
        }
        if (lowerQuery.includes('salicylic acid') || lowerQuery.includes('bha')) {
            retrievedContext += "[RAG]: Salicylic Acid (BHA) efektif untuk membersihkan pori-pori tersumbat dan mengatasi jerawat.\n";
        }
        if (lowerQuery.includes('sunscreen') || lowerQuery.includes('spf')) {
            retrievedContext += "[RAG]: Sunscreen harus diaplikasikan 15-30 menit sebelum keluar rumah. Gunakan sebanyak 2 ruas jari untuk wajah dan leher.\n";
        }
        if (lowerQuery.includes('urutan')) {
            retrievedContext += "[RAG]: Urutan skincare dasar: 1) Cleanser, 2) Toner (opsional), 3) Serum, 4) Moisturizer, 5) Sunscreen (AM saja).\n";
        }

        return retrievedContext;
    }
}

module.exports = RAGService;
