const CoverageEstimationService = require('./CoverageEstimationService');
const HeatmapService = require('./HeatmapService');

/**
 * SunscreenAnalysisService
 * Orchestrator service to handle the flow of sunscreen analysis.
 */
class SunscreenAnalysisService {
    static async analyze(imagePath) {
        // 1. Estimasi coverage
        const coverageData = await CoverageEstimationService.estimateCoverage(imagePath);
        
        // 2. Generate Heatmap
        const heatmapPath = await HeatmapService.generateHeatmap(imagePath, coverageData);

        return {
            coverage_score: coverageData.score,
            coverage_status: coverageData.status,
            heatmap_path: heatmapPath,
            low_coverage_areas: coverageData.lowCoverageAreas,
            analysis_method: 'VISUAL_ESTIMATION',
            hardware_type: 'RGB_CAMERA'
        };
    }
}

module.exports = SunscreenAnalysisService;
