/**
 * CoverageEstimationService (Mock)
 * Mensimulasikan estimasi coverage sunscreen berdasarkan gambar.
 */
class CoverageEstimationService {
    static async estimateCoverage(imagePath) {
        // Simulasi delay
        await new Promise(resolve => setTimeout(resolve, 500));

        // Random mock logic
        const coverageScore = Math.floor(Math.random() * 40) + 50; // 50 to 90
        
        let status = 'Rendah';
        if (coverageScore > 85) status = 'Sangat Baik';
        else if (coverageScore > 70) status = 'Cukup';

        // Mock low coverage areas
        const possibleAreas = ['Dahi', 'Hidung', 'Pipi Kiri', 'Pipi Kanan', 'Dagu'];
        const numAreas = Math.floor(Math.random() * 3) + 1; // 1 to 3 areas
        const lowCoverageAreas = [];
        for (let i = 0; i < numAreas; i++) {
            const area = possibleAreas[Math.floor(Math.random() * possibleAreas.length)];
            if (!lowCoverageAreas.includes(area)) lowCoverageAreas.push(area);
        }

        return {
            score: coverageScore,
            status: status,
            lowCoverageAreas: coverageScore > 85 ? [] : lowCoverageAreas
        };
    }
}

module.exports = CoverageEstimationService;
