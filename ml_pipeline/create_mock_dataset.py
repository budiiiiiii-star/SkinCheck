import os
import cv2
import numpy as np

def create_mock_dataset(raw_dir):
    print(f"Creating mock dataset in '{raw_dir}'...")
    
    # We will mock the structure of 'shrutipandit20/skin-issues-dataset'
    labels = ['Acne', 'Dark Spots', 'Pores', 'Wrinkles']
    
    os.makedirs(raw_dir, exist_ok=True)
    
    for label in labels:
        label_dir = os.path.join(raw_dir, label)
        os.makedirs(label_dir, exist_ok=True)
        
        # Generate 10 mock images per category
        for i in range(10):
            # Create a random color image representing skin
            # Base skin color (BGR)
            color = np.array([120, 150, 210]) 
            img = np.zeros((224, 224, 3), dtype=np.uint8)
            img[:] = color
            
            # Add some random noise
            noise = np.random.normal(0, 15, img.shape).astype(np.int16)
            img = np.clip(img.astype(np.int16) + noise, 0, 255).astype(np.uint8)
            
            # Add specific features based on label
            if label == 'Acne':
                # Add red dots
                for _ in range(5):
                    x, y = np.random.randint(20, 200, 2)
                    cv2.circle(img, (x, y), np.random.randint(2, 6), (50, 50, 200), -1)
            elif label == 'Dark Spots':
                # Add dark brown dots
                for _ in range(5):
                    x, y = np.random.randint(20, 200, 2)
                    cv2.circle(img, (x, y), np.random.randint(5, 15), (70, 90, 120), -1)
            elif label == 'Wrinkles':
                # Add dark lines
                for _ in range(3):
                    x1, y1 = np.random.randint(20, 150, 2)
                    cv2.line(img, (x1, y1), (x1+50, y1+20), (100, 130, 180), 2)
                    
            img_path = os.path.join(label_dir, f"{label.lower().replace(' ', '_')}_{i}.jpg")
            cv2.imwrite(img_path, img)
            
    print("Mock dataset created successfully.")

if __name__ == "__main__":
    BASE_DIR = os.path.dirname(__file__)
    RAW_DIR = os.path.join(BASE_DIR, "..", "storage", "datasets", "raw")
    create_mock_dataset(RAW_DIR)
