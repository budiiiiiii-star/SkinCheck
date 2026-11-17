const ScanModel = require('../models/scanModel');
const AnalysisResultModel = require('../models/analysisResultModel');
const SkinAnalysisService = require('../services/SkinAnalysisService');

const analyze_get = async (req, res) => {
    try {
        const scanId = req.params.scanId;
        
        // Ambil data scan
        const scan = await ScanModel.findById(scanId);
        if (!scan) {
            return res.status(404).send('Scan tidak ditemukan.');
        }

        // Pastikan otorisasi
        if (scan.user_id !== req.user.id && req.user.role !== 'ADMIN') {
            return res.status(403).send('Akses ditolak.');
        }

        // Cek apakah sudah dianalisis sebelumnya
        let analysis = await AnalysisResultModel.findByScanId(scanId);
        
        // Jika belum, jalankan proses analisis
        if (!analysis) {
            const result = await SkinAnalysisService.analyze(scan.image_path);
            
            analysis = await AnalysisResultModel.create(
                scanId,
                result.acne_score,
                result.redness_score,
                result.texture_score,
                result.hyperpigmentation_score,
                result.overall_score,
                result.ai_response
            );
        }

        // Render halaman hasil
        res.render('pages/analysis_result', { user: req.user, scan, analysis });

    } catch (err) {
        console.error(err);
        res.status(500).send('Terjadi kesalahan pada server saat memproses analisis.');
    }
};

module.exports = {
    analyze_get
};
