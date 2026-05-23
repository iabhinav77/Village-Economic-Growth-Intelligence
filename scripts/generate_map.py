"""
Generates interactive map from output/top100_villages.csv
Run after pipeline.py:   python scripts/generate_map.py
Output: output/top100_villages_map.html
"""

import pandas as pd
import folium
import numpy as np
import os

os.makedirs("output", exist_ok=True)
df = pd.read_csv("output/top100_villages.csv")

# Fill NaN population with median
df['population'] = pd.to_numeric(df['population'], errors='coerce')
df['population'] = df['population'].fillna(df['population'].median()).fillna(1000)

COLOR = {
    "Tier 1 - Hotspot":     "#E53E3E",
    "Tier 2 - High Growth": "#DD6B20",
    "Tier 3 - Moderate":    "#38A169",
    "Tier 4 - Emerging":    "#3182CE",
}
RADIUS = {
    "Tier 1 - Hotspot":     14,
    "Tier 2 - High Growth": 11,
    "Tier 3 - Moderate":    8,
    "Tier 4 - Emerging":    6,
}
STATE_COORDS = {
    "Uttar Pradesh":(26.8,80.9),"Rajasthan":(27.0,74.2),"Maharashtra":(19.7,75.7),
    "Madhya Pradesh":(22.9,78.6),"Gujarat":(22.2,71.2),"Karnataka":(15.3,75.7),
    "Tamil Nadu":(11.1,78.6),"West Bengal":(22.9,87.8),"Andhra Pradesh":(15.9,79.7),
    "Punjab":(31.1,75.3),"Haryana":(29.0,76.0),"Bihar":(25.9,85.1),
    "Telangana":(18.1,79.0),"Kerala":(10.8,76.2),"Odisha":(20.9,84.2),
    "Jharkhand":(23.6,85.2),"Chhattisgarh":(21.3,81.8),"Assam":(26.2,92.9),
    "Himachal Pradesh":(31.1,77.1),"Uttarakhand":(30.0,79.0),
    "Jammu & Kashmir":(34.0,76.0),"Delhi":(28.6,77.2),
    "Chandigarh":(30.7,76.8),"Sikkim":(27.5,88.5),
    "Arunachal Pradesh":(28.2,94.7),"Nagaland":(26.1,94.5),
    "Manipur":(24.8,93.9),"Mizoram":(23.2,92.8),"Tripura":(23.7,91.7),
    "Meghalaya":(25.5,91.4),"Goa":(15.3,74.0),
    "India":(22.0,78.0),
}

rng = np.random.default_rng(42)

m = folium.Map(location=[20.5937, 78.9629], zoom_start=5, tiles="CartoDB positron")

folium.Element("""
<div style="position:fixed;top:12px;left:50%;transform:translateX(-50%);
z-index:1000;background:white;padding:10px 22px;border-radius:8px;
box-shadow:0 2px 10px rgba(0,0,0,.18);font-family:Arial,sans-serif;text-align:center">
<b style="font-size:15px;color:#1a1a2e">Top 100 Economically Growing Villages in India (2019-2021)</b><br>
<span style="font-size:11px;color:#555">VIIRS Nighttime Lights + PMGSY Roads | Click a marker for details</span>
</div>""").add_to(m.get_root().html)

folium.Element("""
<div style="position:fixed;bottom:24px;left:16px;z-index:1000;
background:white;padding:10px 14px;border-radius:8px;
box-shadow:0 2px 8px rgba(0,0,0,.14);font-family:Arial,sans-serif;font-size:12px">
<b>Growth Tier</b><br>
<span style="color:#E53E3E">&#9679;</span> Tier 1 Hotspot (80+)<br>
<span style="color:#DD6B20">&#9679;</span> Tier 2 High Growth (65-80)<br>
<span style="color:#38A169">&#9679;</span> Tier 3 Moderate (50-65)<br>
<span style="color:#3182CE">&#9679;</span> Tier 4 Emerging (&lt;50)
</div>""").add_to(m.get_root().html)

for _, r in df.iterrows():
    tier  = str(r.get('growth_tier', 'Tier 4 - Emerging'))
    color = COLOR.get(tier, "#3182CE")
    rad   = RADIUS.get(tier, 8)

    # Get coordinates
    lat = r.get('latitude')
    lon = r.get('longitude')
    if pd.isna(lat) or pd.isna(lon):
        state = str(r.get('state', 'India'))
        base  = STATE_COORDS.get(state, STATE_COORDS['India'])
        lat   = base[0] + rng.uniform(-1.5, 1.5)
        lon   = base[1] + rng.uniform(-1.5, 1.5)

    pop = int(r['population']) if pd.notna(r['population']) else 0

    popup = f"""
    <div style="font-family:Arial,sans-serif;width:240px">
    <b style="font-size:14px">#{int(r['rank'])}. {r['village_name']}</b>
    <hr style="margin:5px 0">
    <table style="font-size:12px;width:100%">
    <tr><td><b>State</b></td><td>{r.get('state','')}</td></tr>
    <tr><td><b>Score</b></td><td><b style="color:#e53e3e">{r['score_0_100']}</b> / 100</td></tr>
    <tr><td><b>Tier</b></td><td>{tier}</td></tr>
    <tr><td><b>Light 2019</b></td><td>{float(r['viirs_2019']):.4f} nW</td></tr>
    <tr><td><b>Light 2021</b></td><td>{float(r['viirs_latest']):.4f} nW</td></tr>
    <tr><td><b>Growth</b></td><td>+{float(r['nl_pct_growth']):.0f}%</td></tr>
    <tr><td><b>Population</b></td><td>{pop:,}</td></tr>
    <tr><td><b>Road</b></td><td>{'Yes' if r['road_connected'] else 'No'}</td></tr>
    </table></div>"""

    folium.CircleMarker(
        location=[float(lat), float(lon)], radius=rad,
        color=color, fill=True, fill_color=color, fill_opacity=0.8,
        popup=folium.Popup(popup, max_width=260),
        tooltip=f"#{int(r['rank'])} {r['village_name']} | {r.get('state','')} | Score: {r['score_0_100']}"
    ).add_to(m)

m.save("output/top100_villages_map.html")
print("Map saved to output/top100_villages_map.html")
print("Open that file in Chrome to view the interactive map")
