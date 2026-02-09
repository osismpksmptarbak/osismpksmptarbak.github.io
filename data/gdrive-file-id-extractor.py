import re
import sys
import argparse
import json
from pathlib import Path
from typing import List, Set, Optional
from dataclasses import dataclass

try:
    import requests
except ImportError:
    print("Error: 'requests' module not found.")
    print("Install it with: pip install requests")
    sys.exit(1)


@dataclass
class FileInfo:
    """Represents a file in Google Drive"""
    file_id: str
    folder_path: str = ""
    
    def __hash__(self):
        return hash(self.file_id)
    
    def __eq__(self, other):
        return isinstance(other, FileInfo) and self.file_id == other.file_id


class DriveExtractor:
    """Handles extraction of file IDs from Google Drive folders"""
    
    FILE_PATTERN = re.compile(r'/file/d/([a-zA-Z0-9_-]+)/')
    FOLDER_PATTERN = re.compile(r'/folders/([a-zA-Z0-9_-]+)')
    FOLDER_ID_PATTERN = re.compile(r'/folders/([a-zA-Z0-9_-]+)')
    
    def __init__(self, session: Optional[requests.Session] = None):
        self.session = session or self._create_session()
        self.visited_folders: Set[str] = set()
    
    @staticmethod
    def _create_session() -> requests.Session:
        """Create a requests session with appropriate headers"""
        session = requests.Session()
        session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        })
        return session
    
    def extract_folder_id(self, folder_url: str) -> Optional[str]:
        """Extract folder ID from Google Drive URL"""
        match = self.FOLDER_ID_PATTERN.search(folder_url)
        if match:
            return match.group(1)
        return None
    
    def fetch_folder_content(self, folder_id: str) -> Optional[str]:
        """Fetch folder content HTML"""
        url = f"https://drive.google.com/embeddedfolderview?id={folder_id}"
        
        try:
            response = self.session.get(url, timeout=30)
            response.raise_for_status()
            return response.text
        except requests.exceptions.Timeout:
            print(f"Error: Request timed out for folder {folder_id}")
        except requests.exceptions.RequestException as e:
            print(f"Error fetching folder {folder_id}: {e}")
        
        return None
    
    def extract_file_ids(self, html_content: str) -> List[str]:
        """Extract file IDs from HTML content"""
        matches = self.FILE_PATTERN.findall(html_content)
        # Remove duplicates while preserving order
        return list(dict.fromkeys(matches))
    
    def extract_subfolder_ids(self, html_content: str, current_folder_id: str) -> List[str]:
        """Extract subfolder IDs from HTML content"""
        matches = self.FOLDER_PATTERN.findall(html_content)
        unique_folders = list(dict.fromkeys(matches))
        # Remove current folder
        return [f for f in unique_folders if f != current_folder_id]
    
    def process_folder(
        self,
        folder_id: str,
        recursive: bool = True,
        depth: int = 0,
        max_depth: int = 10,
        folder_path: str = ""
    ) -> List[FileInfo]:
        """
        Process a folder and optionally its subdirectories
        
        Args:
            folder_id: The Google Drive folder ID
            recursive: Whether to process subdirectories
            depth: Current recursion depth
            max_depth: Maximum recursion depth to prevent infinite loops
            folder_path: Path representation for tracking file locations
        
        Returns:
            List of FileInfo objects
        """
        indent = "  " * depth
        
        # Prevent infinite recursion and revisiting folders
        if depth > max_depth:
            print(f"{indent}Warning: Max depth reached for folder {folder_id}")
            return []
        
        if folder_id in self.visited_folders:
            print(f"{indent}Skipping already visited folder: {folder_id}")
            return []
        
        self.visited_folders.add(folder_id)
        print(f"{indent}Processing folder: {folder_id}")
        
        html_content = self.fetch_folder_content(folder_id)
        if not html_content:
            return []
        
        file_infos = []
        
        # Extract files
        file_ids = self.extract_file_ids(html_content)
        for file_id in file_ids:
            file_infos.append(FileInfo(file_id=file_id, folder_path=folder_path))
        
        print(f"{indent}Found {len(file_ids)} files")
        
        # Process subfolders if recursive
        if recursive:
            subfolder_ids = self.extract_subfolder_ids(html_content, folder_id)
            
            for subfolder_id in subfolder_ids:
                subfolder_path = f"{folder_path}/{subfolder_id}" if folder_path else subfolder_id
                subfolder_files = self.process_folder(
                    subfolder_id,
                    recursive=True,
                    depth=depth + 1,
                    max_depth=max_depth,
                    folder_path=subfolder_path
                )
                file_infos.extend(subfolder_files)
        
        return file_infos
    
    def extract_from_url(
        self,
        folder_url: str,
        recursive: bool = True,
        max_depth: int = 10
    ) -> List[FileInfo]:
        """
        Extract file IDs from a Google Drive folder URL
        
        Args:
            folder_url: Google Drive folder URL
            recursive: Whether to process subdirectories
            max_depth: Maximum recursion depth
        
        Returns:
            List of FileInfo objects
        """
        folder_id = self.extract_folder_id(folder_url)
        
        if not folder_id:
            print("Error: Invalid Google Drive folder URL")
            print("Expected format: https://drive.google.com/drive/folders/FOLDER_ID")
            return []
        
        self.visited_folders.clear()
        file_infos = self.process_folder(folder_id, recursive, max_depth=max_depth)
        
        if not file_infos:
            print("\n⚠️  Warning: No files found.")
            print("Make sure the folder is shared publicly:")
            print("  1. Right-click folder > Share")
            print("  2. Click 'Get link'")
            print("  3. Set to 'Anyone with the link'")
        
        return file_infos


class ConfigGenerator:
    """Generates configuration files from file IDs"""
    
    @staticmethod
    def generate_js(file_infos: List[FileInfo], output_file: Path) -> None:
        """Generate JavaScript configuration file"""
        file_ids = [info.file_id for info in file_infos]
        
        js_content = f"""// Auto-generated Google Drive image gallery configuration
// Total files: {len(file_ids)}

const GALLERY_IMAGE_IDS = [
{chr(10).join(f"    '{file_id}'," for file_id in file_ids)}
];

const IMAGE_CAPTIONS = [
{chr(10).join(f"    'Image {i+1}'," for i in range(len(file_ids)))}
];

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {{
    module.exports = {{ GALLERY_IMAGE_IDS, IMAGE_CAPTIONS }};
}}
"""
        output_file.write_text(js_content)
        print(f"✅ JavaScript config saved to: {output_file}")
    
    @staticmethod
    def generate_json(file_infos: List[FileInfo], output_file: Path) -> None:
        """Generate JSON configuration file"""
        data = {
            "file_ids": [info.file_id for info in file_infos],
            "total_files": len(file_infos),
            "files": [
                {
                    "id": info.file_id,
                    "folder_path": info.folder_path,
                    "url": f"https://drive.google.com/file/d/{info.file_id}/view"
                }
                for info in file_infos
            ]
        }
        
        output_file.write_text(json.dumps(data, indent=2))
        print(f"✅ JSON config saved to: {output_file}")
    
    @staticmethod
    def generate_txt(file_infos: List[FileInfo], output_file: Path) -> None:
        """Generate plain text file with file IDs"""
        content = "\n".join(info.file_id for info in file_infos)
        output_file.write_text(content)
        print(f"✅ Text file saved to: {output_file}")


def main():
    parser = argparse.ArgumentParser(
        description="Extract file IDs from Google Drive folders",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  %(prog)s https://drive.google.com/drive/folders/ABC123
  %(prog)s --no-recursive --format json https://drive.google.com/drive/folders/ABC123
  %(prog)s --output my-config.js --max-depth 2 https://drive.google.com/drive/folders/ABC123
        """
    )
    
    parser.add_argument(
        'folder_url',
        nargs='?',
        help='Google Drive folder URL'
    )
    parser.add_argument(
        '--no-recursive',
        action='store_true',
        help='Do not process subdirectories'
    )
    parser.add_argument(
        '--output', '-o',
        default='image-config.js',
        help='Output file path (default: image-config.js)'
    )
    parser.add_argument(
        '--format', '-f',
        choices=['js', 'json', 'txt'],
        default='js',
        help='Output format (default: js)'
    )
    parser.add_argument(
        '--max-depth',
        type=int,
        default=10,
        help='Maximum folder depth for recursive extraction (default: 10)'
    )
    parser.add_argument(
        '--list',
        action='store_true',
        help='Print file IDs to stdout instead of saving to file'
    )
    
    args = parser.parse_args()
    
    # Get folder URL from args or prompt
    folder_url = args.folder_url
    if not folder_url:
        try:
            folder_url = input("Enter Google Drive folder URL: ").strip()
        except KeyboardInterrupt:
            print("\nCancelled.")
            return
    
    if not folder_url:
        parser.print_help()
        return
    
    # Extract file IDs
    print()
    extractor = DriveExtractor()
    file_infos = extractor.extract_from_url(
        folder_url,
        recursive=not args.no_recursive,
        max_depth=args.max_depth
    )
    
    if not file_infos:
        sys.exit(1)
    
    print(f"\n✅ Total files found: {len(file_infos)}")
    
    # Output results
    if args.list:
        print("\nFile IDs:")
        for info in file_infos:
            print(f"  {info.file_id}")
    else:
        output_path = Path(args.output)
        
        # Auto-detect format from extension if not specified
        if args.format == 'js' and output_path.suffix:
            if output_path.suffix == '.json':
                args.format = 'json'
            elif output_path.suffix == '.txt':
                args.format = 'txt'
        
        generator = ConfigGenerator()
        
        if args.format == 'js':
            generator.generate_js(file_infos, output_path)
        elif args.format == 'json':
            generator.generate_json(file_infos, output_path)
        elif args.format == 'txt':
            generator.generate_txt(file_infos, output_path)


if __name__ == "__main__":
    main()