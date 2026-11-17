const ScanModel = require('../models/scanModel');
const SunscreenResultModel = require('../models/sunscreenResultModel');
const SunscreenAnalysisService = require('../services/SunscreenAnalysisService');
const FaceDetectionService = require('../services/FaceDetectionService');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const scan_page_get = (req, res) => {
    res.render('pages/sunscreen_scan', { user: req.user });
};

const scan_upload_post = async (req, res) => {
    try {
        const { imageBase64 } = req.body;
        if (!imageBase64) {
            return res.status(400).json({ success: false, message: 'Tidak ada gambar.' });
        }

        const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");
        const imageBuffer = Buffer.from(base64Data, 'base64');

        // Validasi Kualitas (Pastikan ada wajah, cahaya cukup)
        const analysis = await FaceDetectionService.analyzeImage(imageBuffer);
        if (!analysis.isValid) {
            return res.status(400).json({ success: false, message: analysis.message, details: analysis.details });
        }

        const storageDir = path.join(__dirname, '../../storage/scans');
        const filename = `sunscreen_${req.user.id}_${crypto.randomUUID()}.jpg`;
        const filepath = path.join(storageDir, filename);

        fs.writeFileSync(filepath, imageBuffer);
        const scan = await ScanModel.create(req.user.id, filename, 'COMPLETED', analysis.score);

        res.json({ success: true, scanId: scan.id });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Terjadi kesalahan server.' });
    }
};

const result_get = async (req, res) => {
    try {
        const scanId = req.params.scanId;
        
        const scan = await ScanModel.findById(scanId);
        if (!scan) return res.status(404).send('Scan tidak ditemukan.');

        if (scan.user_id !== req.user.id && req.user.role !== 'ADMIN') {
            return res.status(403).send('Akses ditolak.');
        }

        let result = await SunscreenResultModel.findByScanId(scanId);
        
        if (!result) {
            const analysisData = await SunscreenAnalysisService.analyze(scan.image_path);
            
            result = await SunscreenResultModel.create(
                scanId,
                analysisData.coverage_score,
                analysisData.coverage_status,
                analysisData.heatmap_path,
                analysisData.low_coverage_areas,
                analysisData.analysis_method,
                analysisData.hardware_type
            );
        }

        res.render('pages/sunscreen_result', { user: req.user, scan, result });

    } catch (err) {
        console.error(err);
        res.status(500).send('Terjadi kesalahan saat memproses hasil sunscreen.');
    }
};

module.exports = {
    scan_page_get,
    scan_upload_post,
    result_get
};
