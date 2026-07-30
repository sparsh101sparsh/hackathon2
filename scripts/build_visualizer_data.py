import json
import urllib.request
import re

with open('CHAICODE_MATCHED_VISUALIZERS.json') as f:
    matched_data = json.load(f)

matched_list = matched_data['matchedList']
print(f"Processing {len(matched_list)} matched visualizer problems...")

visualizer_db = {}

for item in matched_list:
    prob_id = item['problemId']
    path = item['chaicodePath']
    url = "https://dsa.chaicode.com" + path
    
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    try:
        with urllib.request.urlopen(req) as resp:
            html = resp.read().decode('utf-8')
            
            # Extract title
            title_match = re.search(r'<title>(.*?)</title>', html)
            title = title_match.group(1).replace(' - Chai Visual', '').strip() if title_match else item['problemTitle']

            # Extract Next.js page data / hydration state if available
            script_matches = re.findall(r'self\.__next_f\.push\(\[1,\"(.*?)\"\]\)', html)
            page_text = " ".join(script_matches)

            # Store rich visualizer config
            visualizer_db[prob_id] = {
                "problemId": prob_id,
                "title": title,
                "pattern": item['pattern'],
                "chaicodePath": path,
                "chaicodeUrl": url,
                "hasVisualizer": True
            }
    except Exception as e:
        print(f"Error fetching {url}: {e}")

print(f"Successfully compiled {len(visualizer_db)} visualizer configs!")

with open('public/data/visualizers.json', 'w') as f:
    json.dump(visualizer_db, f, indent=2)

print("Saved public/data/visualizers.json")
