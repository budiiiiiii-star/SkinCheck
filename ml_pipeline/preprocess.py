import os
import shutil
import cv2
import numpy as np

def preprocess_dataset(raw_dir, processed_dir):
    print(f"Preprocessing dataset from '{raw_dir}' to '{processed_dir}'...")
    
    # Example structure handling based on "skin-issues-dataset"
    # The dataset usually contains folders like: 'Acne', 'Dark Spots', 'Wrinkles', etc.
    # We will map "Dark Spots" or "Uneven Tone" to "Dull Skin" (kulit kusam).
    
    label_mapping = {
        'Acne': 'acne',
        'Dark Spots': 'dull_skin', # Proxy for kulit kusam
        'Pores': 'enlarged_pores',
        'Wrinkles': 'aging'
    }
    
    os.makedirs(processed_dir, exist_ok=True)
    
    total_images = 0
    for original_label, target_label in label_mapping.items():
        src_path = os.path.join(raw_dir, original_label)
        target_path = os.path.join(processed_dir, target_label)
        
        if not os.path.exists(src_path):
            print(f"Warning: Directory '{src_path}' not found. Skipping.")
            continue
            
        os.makedirs(target_path, exist_ok=True)
        
        for filename in os.listdir(src_path):
            if filename.lower().endswith(('.png', '.jpg', '.jpeg')):
                img_path = os.path.join(src_path, filename)
                
                # Resize and normalize images (224x224 for MobileNet)
                img = cv2.imread(img_path)
                if img is not None:
                    img_resized = cv2.resize(img, (224, 224))
                    # Save processed image
                    out_path = os.path.join(target_path, filename)
                    cv2.imwrite(out_path, img_resized)
                    total_images += 1
                    
    print(f"Preprocessing complete. Processed {total_images} images.")

if __name__ == "__main__":
    BASE_DIR = os.path.dirname(__file__)
    RAW_DIR = os.path.join(BASE_DIR, "..", "storage", "datasets", "raw")
    PROCESSED_DIR = os.path.join(BASE_DIR, "..", "storage", "datasets", "processed")
    
    # Ensure OpenCV is installed
    try:
        import cv2
    except ImportError:
        import subprocess
        import sys
        print("Installing opencv-python...")
        subprocess.check_call([sys.executable, "-m", "pip", "install", "opencv-python"])
        import cv2

    preprocess_dataset(RAW_DIR, PROCESSED_DIR)
