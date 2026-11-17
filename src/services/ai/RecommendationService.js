const ProductModel = require('../../models/productModel');

class RecommendationService {
    static async getProductRecommendations(query) {
        try {
            const activeProducts = await ProductModel.findAllActive();
            if (!activeProducts || activeProducts.length === 0) return "";

            let recommendations = "[SUGGESTIONS]: Produk yang dapat dipertimbangkan berdasarkan katalog kami:\n";
            let found = false;

            // Simple keyword matching against product categories or concerns for demo
            const lowerQuery = query.toLowerCase();
            
            for (const product of activeProducts) {
                let match = false;
                const concerns = (product.skin_concern || []).map(c => c.toLowerCase());
                
                if (concerns.some(c => lowerQuery.includes(c)) || lowerQuery.includes(product.category.toLowerCase())) {
                    match = true;
                }

                // If query is generic like "saran" or "rekomendasi", just show a few
                if (lowerQuery.includes('saran') || lowerQuery.includes('rekomendasi')) {
                    match = true;
                }

                if (match) {
                    recommendations += `- **${product.brand} ${product.name}** (${product.category}): ${product.description}\n`;
                    found = true;
                }
            }

            if (!found) {
                // If no specific match, just list a generic one from active
                const p = activeProducts[0];
                recommendations += `- **${p.brand} ${p.name}** (${p.category}): ${p.description}\n`;
            }

            return recommendations;
        } catch (err) {
            console.error("Error fetching recommendations for AI", err);
            return "";
        }
    }
}

module.exports = RecommendationService;
