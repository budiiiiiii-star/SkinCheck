/**
 * HeatmapService (Mock)
 * Mensimulasikan pembuatan gambar overlay heatmap.
 * Nanti akan diganti dengan implementasi OpenCV/Python/Canvas sejati.
 */
class HeatmapService {
    static async generateHeatmap(imagePath, coverageData) {
        // Simulasi delay pembuatan heatmap
        await new Promise(resolve => setTimeout(resolve, 500));

        // Dalam implementasi nyata, kita akan mengembalikan path ke file gambar heatmap yang telah di-generate.
        // Karena ini mock, kita akan mengembalikan string penanda 'mock_heatmap' 
        // sehingga frontend tahu untuk menggunakan CSS filter/overlay untuk mensimulasikan heatmap.
        return 'mock_heatmap'; 
    }
}

module.exports = HeatmapService;
