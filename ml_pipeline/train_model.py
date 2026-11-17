import os
import sys
import subprocess

def ensure_dependencies():
    try:
        import tensorflow as tf
    except ImportError:
        print("Installing tensorflow...")
        subprocess.check_call([sys.executable, "-m", "pip", "install", "tensorflow"])
        import tensorflow as tf
    return tf

def train(processed_dir, model_export_dir):
    tf = ensure_dependencies()
    print(f"Starting model training on data in '{processed_dir}'...")
    
    # 1. Load Data
    batch_size = 32
    img_height = 224
    img_width = 224
    
    train_ds = tf.keras.utils.image_dataset_from_directory(
        processed_dir,
        validation_split=0.2,
        subset="training",
        seed=123,
        image_size=(img_height, img_width),
        batch_size=batch_size
    )

    val_ds = tf.keras.utils.image_dataset_from_directory(
        processed_dir,
        validation_split=0.2,
        subset="validation",
        seed=123,
        image_size=(img_height, img_width),
        batch_size=batch_size
    )

    class_names = train_ds.class_names
    print(f"Classes found: {class_names}")

    # 2. Build Model (Transfer Learning with MobileNetV2)
    normalization_layer = tf.keras.layers.Rescaling(1./255)
    
    base_model = tf.keras.applications.MobileNetV2(
        input_shape=(img_height, img_width, 3),
        include_top=False,
        weights='imagenet'
    )
    base_model.trainable = False # Freeze base model initially

    model = tf.keras.Sequential([
        normalization_layer,
        base_model,
        tf.keras.layers.GlobalAveragePooling2D(),
        tf.keras.layers.Dense(128, activation='relu'),
        tf.keras.layers.Dropout(0.2),
        tf.keras.layers.Dense(len(class_names), activation='softmax')
    ])

    model.compile(
        optimizer='adam',
        loss=tf.keras.losses.SparseCategoricalCrossentropy(from_logits=False),
        metrics=['accuracy']
    )

    # 3. Train Model
    epochs = 5
    print("Training model...")
    history = model.fit(
        train_ds,
        validation_data=val_ds,
        epochs=epochs
    )

    # 4. Save Model
    os.makedirs(model_export_dir, exist_ok=True)
    export_path = os.path.join(model_export_dir, 'skin_model.h5')
    model.save(export_path)
    print(f"Model saved to {export_path}")
    
    # Save class names for JS integration
    with open(os.path.join(model_export_dir, 'classes.txt'), 'w') as f:
        f.write(",".join(class_names))

if __name__ == "__main__":
    BASE_DIR = os.path.dirname(__file__)
    PROCESSED_DIR = os.path.join(BASE_DIR, "..", "storage", "datasets", "processed")
    MODEL_DIR = os.path.join(BASE_DIR, "..", "storage", "models")
    
    if not os.path.exists(PROCESSED_DIR):
        print(f"Error: Processed data directory '{PROCESSED_DIR}' not found. Run preprocess.py first.")
        sys.exit(1)
        
    train(PROCESSED_DIR, MODEL_DIR)
