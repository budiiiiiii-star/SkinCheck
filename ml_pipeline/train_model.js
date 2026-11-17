const tf = require('@tensorflow/tfjs');
const fs = require('fs');
const path = require('path');
const jpeg = require('jpeg-js');

const PROCESSED_DIR = path.join(__dirname, '..', 'storage', 'datasets', 'processed');
const MODEL_DIR = path.join(__dirname, '..', 'storage', 'models');

function decodeImage(imgBuffer) {
    const rawImageData = jpeg.decode(imgBuffer, {useTArray: true});
    const { width, height, data } = rawImageData;
    // data is an array of RGBA. We need to extract RGB and resize to 224x224.
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
        .div(tf.scalar(255.0));
}

async function loadData() {
    const labels = ['acne', 'dull_skin', 'enlarged_pores', 'aging'];
    const images = [];
    const targets = [];

    console.log("Loading images...");
    for (let i = 0; i < labels.length; i++) {
        const labelDir = path.join(PROCESSED_DIR, labels[i]);
        if (!fs.existsSync(labelDir)) continue;

        const files = fs.readdirSync(labelDir);
        for (const file of files) {
            if (file.endsWith('.jpg') || file.endsWith('.jpeg')) {
                const imgPath = path.join(labelDir, file);
                const imgBuffer = fs.readFileSync(imgPath);
                
                try {
                    const tensor = decodeImage(imgBuffer);
                    images.push(tensor);
                    targets.push(i); // Label index
                } catch (err) {
                    console.log(`Skipping invalid JPEG: ${file}`);
                }
            }
        }
    }

    if (images.length === 0) {
        throw new Error("No images found in processed directory.");
    }

    // Stack tensors
    const xTrain = tf.stack(images);
    const yTrain = tf.tensor1d(targets, 'int32');
    
    // Convert targets to one-hot encoding
    const yTrainOneHot = tf.oneHot(yTrain, labels.length);

    console.log(`Loaded ${images.length} images.`);
    return { xTrain, yTrain: yTrainOneHot, labels };
}

async function buildAndTrainModel(xTrain, yTrain, numClasses) {
    console.log("Building model...");
    
    // Create a simple CNN since MobileNet transfer learning via TFJS node can be complex
    const model = tf.sequential();
    
    model.add(tf.layers.conv2d({
        inputShape: [224, 224, 3],
        filters: 16,
        kernelSize: 3,
        activation: 'relu'
    }));
    model.add(tf.layers.maxPooling2d({ poolSize: 2, strides: 2 }));
    
    model.add(tf.layers.conv2d({
        filters: 32,
        kernelSize: 3,
        activation: 'relu'
    }));
    model.add(tf.layers.maxPooling2d({ poolSize: 2, strides: 2 }));
    
    model.add(tf.layers.flatten());
    model.add(tf.layers.dense({ units: 64, activation: 'relu' }));
    model.add(tf.layers.dense({ units: numClasses, activation: 'softmax' }));

    model.compile({
        optimizer: 'adam',
        loss: 'categoricalCrossentropy',
        metrics: ['accuracy']
    });

    console.log("Training model...");
    await model.fit(xTrain, yTrain, {
        epochs: 10,
        batchSize: 8,
        shuffle: true,
        callbacks: {
            onEpochEnd: (epoch, logs) => {
                console.log(`Epoch ${epoch + 1}: loss = ${logs.loss.toFixed(4)}, accuracy = ${logs.acc.toFixed(4)}`);
            }
        }
    });

    return model;
}

async function run() {
    try {
        const { xTrain, yTrain, labels } = await loadData();
        const model = await buildAndTrainModel(xTrain, yTrain, labels.length);

        // Save the model
        if (!fs.existsSync(MODEL_DIR)) {
            fs.mkdirSync(MODEL_DIR, { recursive: true });
        }
        await model.save(`file://${MODEL_DIR}/skin_model`);
        
        // Save labels
        fs.writeFileSync(path.join(MODEL_DIR, 'classes.txt'), labels.join(','));
        
        console.log(`Model successfully trained and saved to ${MODEL_DIR}`);
    } catch (err) {
        console.error("Training failed:", err);
    }
}

run();
