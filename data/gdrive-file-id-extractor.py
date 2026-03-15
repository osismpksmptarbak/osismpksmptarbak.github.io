import re
import sys
from pathlib import Path

try:
    import requests
except ImportError:
    print("Error: 'requests' module not found. Run: pip install requests")
    sys.exit(1)

FILE_PATTERN = re.compile(r'/file/d/([a-zA-Z0-9_-]+)/')
FOLDER_PATTERN = re.compile(r'/folders/([a-zA-Z0-9_-]+)')

session = requests.Session()
session.headers.update({'User-Agent': 'Mozilla/5.0'})
visited = set()


def fetch(folder_id):
    try:
        r = session.get(f"https://drive.google.com/embeddedfolderview?id={folder_id}", timeout=30)
        r.raise_for_status()
        return r.text
    except requests.exceptions.RequestException as e:
        print(f"Error fetching folder {folder_id}: {e}")
        return None


def get_ids(folder_id):
    if folder_id in visited:
        return []
    visited.add(folder_id)

    html = fetch(folder_id)
    if not html:
        return []

    file_ids = list(dict.fromkeys(FILE_PATTERN.findall(html)))
    subfolder_ids = [f for f in dict.fromkeys(FOLDER_PATTERN.findall(html)) if f != folder_id]

    print(f"Folder {folder_id}: {len(file_ids)} files, {len(subfolder_ids)} subfolders")

    for sub in subfolder_ids:
        file_ids.extend(get_ids(sub))

    return file_ids


def main():
    url = sys.argv[1] if len(sys.argv) > 1 else input("Enter Google Drive folder URL: ").strip()

    match = re.search(r'/folders/([a-zA-Z0-9_-]+)', url)
    if not match:
        print("Error: Invalid Google Drive folder URL")
        sys.exit(1)

    ids = get_ids(match.group(1))

    if not ids:
        print("No files found. Make sure the folder is shared publicly.")
        sys.exit(1)

    print(f"\nTotal: {len(ids)} files")

    out = Path("image-ids.js")
    out.write_text("const IMAGE_IDS = [\n" + "".join(f"  '{i}',\n" for i in ids) + "];\n")
    print(f"Saved to {out}")


if __name__ == "__main__":
    main()