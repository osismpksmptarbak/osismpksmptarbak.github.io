import re
import sys

try:
    import requests
except ImportError:
    print("Error: 'requests' module not found.")
    print("Install it with: pip install requests")
    sys.exit(1)

def extract_file_ids_from_folder(folder_url, recursive=True):
    """
    Extract file IDs from a Google Drive folder URL
    
    Args:
        folder_url: URL like https://drive.google.com/drive/folders/FOLDER_ID
        recursive: If True, recursively process subdirectories
    
    Returns:
        list: List of file IDs
    """
    
    folder_id_match = re.search(r'/folders/([a-zA-Z0-9_-]+)', folder_url)
    if not folder_id_match:
        print("Error: Invalid Google Drive folder URL")
        return []
    
    folder_id = folder_id_match.group(1)
    return process_folder(folder_id, recursive)

def process_folder(folder_id, recursive=True, depth=0):
    """Process a folder and optionally its subdirectories"""
    
    view_url = f"https://drive.google.com/embeddedfolderview?id={folder_id}"
    
    indent = "  " * depth
    print(f"{indent}Processing folder: {folder_id}")
    
    try:
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
        response = requests.get(view_url, headers=headers)
        response.raise_for_status()
        
        file_ids = []
        
        # Extract file IDs
        file_pattern = r'/file/d/([a-zA-Z0-9_-]+)/'
        file_matches = re.findall(file_pattern, response.text)
        file_ids.extend(list(dict.fromkeys(file_matches)))
        
        # Extract subfolder IDs if recursive
        if recursive:
            folder_pattern = r'/folders/([a-zA-Z0-9_-]+)'
            folder_matches = re.findall(folder_pattern, response.text)
            unique_folders = list(dict.fromkeys(folder_matches))
            
            # Remove the current folder from the list
            unique_folders = [f for f in unique_folders if f != folder_id]
            
            for subfolder_id in unique_folders:
                subfolder_files = process_folder(subfolder_id, recursive, depth + 1)
                file_ids.extend(subfolder_files)
        
        if not file_ids and depth == 0:
            print("\nWarning: No files found. Make sure the folder is shared publicly.")
            print("To share: Right-click folder > Share > Get link > Anyone with the link")
            return []
        
        print(f"{indent}Found {len(file_matches)} files")
        return file_ids
        
    except requests.exceptions.RequestException as e:
        print(f"{indent}Error: {e}")
        return []

def generate_config(file_ids, output_file='image-config.js'):
    """Generate JavaScript configuration file"""
    
    js_content = f"""const GALLERY_IMAGE_IDS = [
{chr(10).join(f"    '{file_id}'," for file_id in file_ids)}
];

const IMAGE_CAPTIONS = [
{chr(10).join(f"    'Image {i+1}'," for i in range(len(file_ids)))}
];
"""
    
    with open(output_file, 'w') as f:
        f.write(js_content)
    
    print(f"\n✓ Saved to: {output_file}")
    print(f"✓ Total files: {len(file_ids)}")

def main():
    if len(sys.argv) > 1:
        folder_url = sys.argv[1]
        recursive = '--no-recursive' not in sys.argv
    else:
        folder_url = input("Folder URL: ").strip()
        recursive = True
    
    if not folder_url:
        print("Error: No URL provided")
        return
    
    print()
    file_ids = extract_file_ids_from_folder(folder_url, recursive)
    
    if file_ids:
        generate_config(file_ids)
        
        print("\nFile IDs:")
        for i, file_id in enumerate(file_ids, 1):
            print(f"  '{file_id}',")

if __name__ == "__main__":
    main()