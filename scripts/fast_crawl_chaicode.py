import urllib.request
import re
import json
from concurrent.futures import ThreadPoolExecutor

BASE_URL = "https://dsa.chaicode.com"
visited = set()
all_pages = {}

def get_links_from_url(path):
    url = BASE_URL + path if path.startswith('/') else path
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    try:
        with urllib.request.urlopen(req) as resp:
            html = resp.read().decode('utf-8')
            
            title_match = re.search(r'<title>(.*?)</title>', html)
            title = title_match.group(1) if title_match else path
            
            desc_match = re.search(r'<meta name="description" content="(.*?)"', html)
            desc = desc_match.group(1) if desc_match else ""

            parts = [p for p in path.split('/') if p]
            pattern = parts[0] if parts else "general"

            links = set(re.findall(r'href=[\"\'](/[^\"\'\s>#]+)[\"\']', html))
            clean_links = [l for l in links if not l.startswith('/_next') and 'privacy' not in l and 'terms' not in l and 'pricing' not in l and 'refund' not in l]

            return path, {
                "path": path,
                "title": title,
                "description": desc,
                "pattern": pattern,
            }, clean_links
    except Exception as e:
        return path, None, []

# Queue
queue = {"/"}

with ThreadPoolExecutor(max_workers=20) as executor:
    while queue:
        current_batch = list(queue)
        queue.clear()
        
        futures = [executor.submit(get_links_from_url, path) for path in current_batch if path not in visited]
        for path in current_batch:
            visited.add(path)
            
        for future in futures:
            path, data, links = future.result()
            if data:
                all_pages[path] = data
                for l in links:
                    if l not in visited:
                        queue.add(l)

print(f"Total ChaiCode visualizer pages extracted: {len(all_pages)}")

with open("CHAICODE_VISUALIZATION_CATALOG.json", "w") as f:
    json.dump(all_pages, f, indent=2)

print("Catalog saved to CHAICODE_VISUALIZATION_CATALOG.json")
