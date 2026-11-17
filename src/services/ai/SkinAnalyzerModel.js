const tf = require('@tensorflow/tfjs');
const path = require('path');
const fs = require('fs');
const jpeg = require('jpeg-js');

function decodeImage(imgBuffer) {
    const rawImageData = jpeg.decode(imgBuffer, {useTArray: true});
    const { width, height, data } = rawImageData;
    const numChannels = 3;
    const numPixels = width * height;
    const values = new Int32Array(numPixels * numChannels);

    for (let i = 0; i < numPixels; i++) {
        for (let channel = 0; channel < numChannels; channel++) {
            values[i * numChannels + channel] = data[i * 4 + channel];
        }
    }
    
    return tf.tensor3d(values, [height, width, numChannels], 'int32')
        .resizeBilinear([224, 224])
        .toFloat()
        .div(tf.scalar(255.0))
        .expandDims(0); // Add batch dimension
}

class SkinAnalyzerModel {
    constructor() {
        this.model = null;
        this.classes = [];
        this.modelPath = path.join(__dirname, '..', '..', '..', 'storage', 'models', 'skin_model', 'model.json');
        this.classesPath = path.join(__dirname, '..', '..', '..', 'storage', 'models', 'classes.txt');
    }

    async loadModel() {
        if (!this.model) {
            try {
                if (fs.existsSync(this.modelPath)) {
                    this.model = await tf.loadLayersModel(`file://${this.modelPath}`);
                    const classesStr = fs.readFileSync(this.classesPath, 'utf8');
                    this.classes = classesStr.split(',');
                    console.log("Skin Analyzer Model loaded successfully.");
                } else {
                    console.log("Skin Analyzer Model not found. Returning mock analysis.");
                }
            } catch (err) {
                console.error("Error loading model:", err);
            }
        }
    }

    async analyzeImage(imageBuffer) {
        await this.loadModel();

        if (!this.model) {
            // Fallback mock if model is not trained yet
            return {
                detected_conditions: ['dull_skin', 'enlarged_pores'],
                confidence: 0.85
            };
        }

        try {
            // Decode and preprocess image
            const tensor = decodeImage(imageBuffer);

            const prediction = this.model.predict(tensor);
            const probabilities = await prediction.data();
            
            // Find highest probability class
            let maxProb = 0;
            let maxIndex = 0;
            for (let i = 0; i < probabilities.length; i++) {
                if (probabilities[i] > maxProb) {
                    maxProb = probabilities[i];
                    maxIndex = i;
                }
            }

            // Cleanup tensors
            tf.dispose([tensor, prediction]);

            const condition = this.classes[maxIndex];
            
            return {
                detected_conditions: [condition],
                confidence: maxProb
            };
        } catch (err) {
            console.error("Error analyzing image:", err);
            return null;
        }
    }
}

module.exports = new SkinAnalyzerModel();
