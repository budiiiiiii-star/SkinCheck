const ScanModel = require('../models/scanModel');
const FaceDetectionService = require('../services/FaceDetectionService');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const scan_page_get = (req, res) => {
    res.render('pages/scan', { user: req.user });
};

const scan_upload_post = async (req, res) => {
    try {
        const { imageBase64 } = req.body;
        
        if (!imageBase64) {
            return res.status(400).json({ success: false, message: 'Tidak ada gambar yang dikirim.' });
        }

        // Hapus header base64 (misal: "data:image/jpeg;base64,")
        const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");
        const imageBuffer = Buffer.from(base64Data, 'base64');

        // Analisis gambar menggunakan Mock Service
        const analysis = await FaceDetectionService.analyzeImage(imageBuffer);

        if (!analysis.isValid) {
            return res.status(400).json({ 
                success: false, 
                message: analysis.message,
                details: analysis.details 
            });
        }

        // Tentukan path penyimpanan yang aman di luar folder static
        const storageDir = path.join(__dirname, '../../storage/scans');
        
        // Buat nama file yang unik dan sulit ditebak (UUID/hash)
        const filename = `${req.user.id}_${crypto.randomUUID()}.jpg`;
        const filepath = path.join(storageDir, filename);

        // Simpan file
        fs.writeFileSync(filepath, imageBuffer);

        // Simpan metadata ke database
        // Hanya simpan nama file, bukan full path absolut
        const scan = await ScanModel.create(req.user.id, filename, 'COMPLETED', analysis.score);

        res.json({ 
            success: true, 
            message: 'Scan berhasil disimpan.',
            scanId: scan.id
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Terjadi kesalahan pada server.' });
    }
};

const scan_image_get = async (req, res) => {
    try {
        const scanId = req.params.id;
        const scan = await ScanModel.findById(scanId);

        if (!scan) {
            return res.status(404).send('Gambar tidak ditemukan.');
        }

        // Otorisasi: Pastikan user hanya bisa mengakses gambar miliknya sendiri
        // Admin mungkin bisa melihat semua, jika diperlukan
        if (scan.user_id !== req.user.id && req.user.role !== 'ADMIN') {
            return res.status(403).send('Akses ditolak.');
        }

        const filepath = path.join(__dirname, '../../storage/scans', scan.image_path);
        
        if (fs.existsSync(filepath)) {
            res.sendFile(filepath);
        } else {
            res.status(404).send('File fisik tidak ditemukan.');
        }

    } catch (err) {
        console.error(err);
        res.status(500).send('Terjadi kesalahan pada server.');
    }
};

module.exports = {
    scan_page_get,
    scan_upload_post,
    scan_image_get
};
