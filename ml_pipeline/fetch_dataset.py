import os
import sys
import subprocess

def fetch_dataset(dataset_name, download_path):
    print(f"Downloading dataset '{dataset_name}' to '{download_path}'...")
    
    # Ensure kaggle is installed
    try:
        import kaggle
    except ImportError:
        print("Kaggle module not found. Installing...")
        subprocess.check_call([sys.executable, "-m", "pip", "install", "kaggle"])
    
    # Check for credentials
    if 'KAGGLE_API_TOKEN' not in os.environ and ('KAGGLE_USERNAME' not in os.environ or 'KAGGLE_KEY' not in os.environ):
        print("Error: KAGGLE_API_TOKEN or both KAGGLE_USERNAME and KAGGLE_KEY environment variables must be set.")
        sys.exit(1)

    # Use Kaggle CLI to download
    os.makedirs(download_path, exist_ok=True)
    command = [
        sys.executable, "-m", "kaggle", "datasets", "download", "-d", dataset_name,
        "-p", download_path, "--unzip"
    ]
    
    try:
        subprocess.check_call(command)
        print("Download and unzip completed successfully.")
    except subprocess.CalledProcessError as e:
        print(f"Failed to download dataset: {e}")
        sys.exit(1)

if __name__ == "__main__":
    # We will use the 'sankha1998/facial-skin-analysis-and-type-classification' dataset 
    # as it has labels for dark spots, uneven tone etc which we can use for "dull skin".
    DATASET = "sankha1998/facial-skin-analysis-and-type-classification"
    DOWNLOAD_PATH = os.path.join(os.path.dirname(__file__), "..", "storage", "datasets", "raw")
    
    fetch_dataset(DATASET, DOWNLOAD_PATH)
