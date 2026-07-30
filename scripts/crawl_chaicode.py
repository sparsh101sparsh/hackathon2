import urllib.request
import re
import json
import time

BASE_URL = "https://dsa.chaicode.com"
visited = set()
to_visit = {"/"}
all_pages = {}

def get_html(path):
    url = BASE_URL + path if path.startswith('/') else path
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    try:
        with urllib.request.urlopen(req) as resp:
            return resp.read().decode('utf-8')
    except Exception as e:
        print(f"Error fetching {url}: {e}")
        return ""

print("Starting ChaiCode Visualizer Crawlers...")
while to_visit:
    path = to_visit.pop()
    if path in visited or path.startswith('/_next') or path.startswith('#') or 'privacy' in path or 'terms' in path:
        continue
    visited.add(path)
    
    html = get_html(path)
    if not html:
        continue
    
    # Extract title
    title_match = re.search(r'<title>(.*?)</title>', html)
    title = title_match.group(1) if title_match else path
    
    # Extract description
    desc_match = re.search(r'<meta name="description" content="(.*?)"', html)
    desc = desc_match.group(1) if desc_match else ""

    # Check if page has visualization components
    is_visualizer = "live" in html.lower() or "approach" in html.lower() or "canvas" in html.lower() or "animation" in html.lower()

    # Determine topic pattern
    parts = [p for p in path.split('/') if p]
    pattern = parts[0] if parts else "general"

    all_pages[path] = {
        "path": path,
        "title": title,
        "description": desc,
        "pattern": pattern,
        "is_visualizer": is_visualizer
    }
    
    # Find links
    found_links = set(re.findall(r'href=[\"\'](/[^\"\'\s>#]+)[\"\']', html))
    for link in found_links:
        if link not in visited and not link.startswith('/_next') and not 'policy' in link:
            to_visit.add(link)

print(f"Total ChaiCode pages discovered: {len(all_pages)}")

with open("chaicode_visualization_catalog.json", "w") as f:
    json.dump(all_pages, f, indent=2)

print("Saved catalog to chaicode_visualization_catalog.json")
