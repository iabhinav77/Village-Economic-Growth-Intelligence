"""
Village Economic Growth Intelligence
Kumar Abhinav Kritter Assignment

Run with real data:   python scripts/pipeline.py --mode real
Run in demo mode:     python scripts/pipeline.py
"""

import os
import argparse
import numpy as np
import pandas as pd

parser = argparse.ArgumentParser()
parser.add_argument("--mode", choices=["real", "demo"], default="demo")
args = parser.parse_args()

os.makedirs("output", exist_ok=True)

VIIRS_FILE  = "data/shrug-viirs-annual-csv/viirs_annual_shrid.csv"
PMGSY_FILE  = "data/shrug-pmgsy-csv/pmgsy_2015_shrid.csv"
NAMES_FILE  = "data/shrug-shrid-keys-csv/shrid_loc_names.csv"
VD11_FILE   = "data/shrug-vd11-csv/pc11_vd_clean_shrid.csv"


def load_real_data():
    print("EXTRACTION")

    # ── VIIRS ─────────────────────────────────────────────
    print(f"  Loading VIIRS from {VIIRS_FILE}")
    viirs_raw = pd.read_csv(VIIRS_FILE)
    print(f"  Rows: {len(viirs_raw):,}  Columns: {list(viirs_raw.columns)}")
    print(f"  Years: {sorted(viirs_raw['year'].unique())}")

    if 'category' in viirs_raw.columns:
        cats = list(viirs_raw['category'].unique())
        print(f"  Categories: {cats}")
        if 'median' in cats:
            viirs_raw = viirs_raw[viirs_raw['category'] == 'median'].copy()
        elif 'mean' in cats:
            viirs_raw = viirs_raw[viirs_raw['category'] == 'mean'].copy()
        print(f"  After filter: {len(viirs_raw):,} rows")

    print("  Pivoting to one row per village...")
    viirs = viirs_raw.pivot_table(
        index='shrid2', columns='year',
        values='viirs_annual_mean', aggfunc='mean'
    ).reset_index()
    viirs.columns.name = None

    years    = [c for c in viirs.columns if isinstance(c, int)]
    baseline = 2019 if 2019 in years else min(years)
    latest   = 2021 if 2021 in years else (2020 if 2020 in years else max(years))
    print(f"  Baseline: {baseline}   Latest: {latest}   Villages: {len(viirs):,}")

    viirs = viirs.rename(columns={baseline: 'viirs_2019', latest: 'viirs_latest'})
    viirs = viirs[['shrid2', 'viirs_2019', 'viirs_latest']].copy()

    # ── Names ─────────────────────────────────────────────
    print(f"\n  Loading names from {NAMES_FILE}")
    names = pd.read_csv(NAMES_FILE)
    print(f"  Rows: {len(names):,}  Columns: {list(names.columns)}")
    names = names[['shrid2','state_name','district_name','village_name']].copy()
    names = names.rename(columns={'state_name':'state','district_name':'district'})
    names['village_name'] = names['village_name'].fillna(names['shrid2'])
    names['state']        = names['state'].fillna('Unknown')
    names['district']     = names['district'].fillna('Unknown')

    # ── Population ────────────────────────────────────────
    print(f"\n  Loading population from {VD11_FILE}")
    vd11_cols = pd.read_csv(VD11_FILE, nrows=0).columns.tolist()
    pop_col   = next((c for c in vd11_cols if 'tot_p' in c.lower()), None)
    print(f"  Population column: {pop_col}")
    if pop_col:
        vd11 = pd.read_csv(VD11_FILE, usecols=['shrid2', pop_col])
        vd11 = vd11.rename(columns={pop_col: 'population'})
    else:
        vd11 = pd.DataFrame({'shrid2':[], 'population':[]})

    # ── PMGSY ─────────────────────────────────────────────
    print(f"\n  Loading PMGSY from {PMGSY_FILE}")
    pmgsy = pd.read_csv(PMGSY_FILE)
    print(f"  Rows: {len(pmgsy):,}")
    pmgsy['road_km'] = (
        pd.to_numeric(pmgsy.get('road_length_new', 0), errors='coerce').fillna(0) +
        pd.to_numeric(pmgsy.get('road_length_upg', 0), errors='coerce').fillna(0)
    )
    pmgsy['road_connected'] = (pmgsy['road_km'] > 0).astype(int)
    pmgsy = pmgsy.groupby('shrid2').agg(
        road_km=('road_km','sum'),
        road_connected=('road_connected','max')
    ).reset_index()
    print(f"  Villages with road: {len(pmgsy):,}")

    # ── Merge ─────────────────────────────────────────────
    print(f"\n  Merging on shrid2...")
    df = viirs.merge(names, on='shrid2', how='left')
    df = df.merge(vd11,  on='shrid2', how='left')
    df = df.merge(pmgsy, on='shrid2', how='left')
    df['road_connected'] = df['road_connected'].fillna(0)
    df['road_km']        = df['road_km'].fillna(0)
    df['latitude']  = np.nan
    df['longitude'] = np.nan
    print(f"  Final: {len(df):,} villages")
    return df


def demo_data():
    print("Demo mode. Run with --mode real for real results.")
    rng = np.random.default_rng(42)
    states = {
        "Uttar Pradesh":  (1800,0.10,1.20,0.55,(24.0,30.5),(77.0,84.5)),
        "Rajasthan":      (850, 0.08,0.90,0.45,(23.5,30.2),(69.5,78.0)),
        "Maharashtra":    (700, 0.25,2.50,0.72,(15.6,22.0),(72.6,80.5)),
        "Madhya Pradesh": (900, 0.08,1.10,0.50,(21.1,26.9),(74.0,82.8)),
        "Gujarat":        (650, 0.30,2.80,0.78,(20.1,24.7),(68.2,74.5)),
        "Karnataka":      (550, 0.18,1.80,0.68,(11.6,18.4),(74.1,78.5)),
        "Tamil Nadu":     (500, 0.40,3.50,0.82,(8.0,13.5), (76.2,80.3)),
        "West Bengal":    (750, 0.30,2.00,0.70,(21.5,27.2),(85.8,89.9)),
        "Andhra Pradesh": (480, 0.20,1.80,0.65,(13.0,19.9),(76.8,84.7)),
        "Punjab":         (250, 0.60,4.00,0.92,(29.5,32.5),(73.9,76.9)),
        "Haryana":        (280, 0.50,3.20,0.88,(27.6,30.9),(74.5,77.6)),
        "Bihar":          (900, 0.07,0.80,0.40,(24.3,27.5),(83.3,88.2)),
        "Telangana":      (420, 0.20,1.70,0.62,(15.8,19.9),(77.3,81.3)),
        "Kerala":         (220, 0.60,4.20,0.95,(8.3,12.8), (74.9,77.4)),
    }
    sfx  = ["pur","nagar","gaon","palli","wadi","khurd","kalan","tanda","khera","ganj"]
    rows = []
    for state,(n,lo,hi,rp,latr,lonr) in states.items():
        for _ in range(n):
            name = f"{'ABCDEFGHIJKLMNPRST'[rng.integers(0,18)]}{'aeiou'[rng.integers(0,5)]}{rng.choice(sfx)}"
            v19  = float(rng.uniform(lo,hi))
            tier = rng.choice([0,1,2,3],p=[0.60,0.25,0.10,0.05])
            gf   = [rng.uniform(1.0,1.4),rng.uniform(1.4,2.2),
                    rng.uniform(2.2,5.0),rng.uniform(5.0,10.0)][tier]
            rows.append({
                "shrid2":f"s{len(rows):06d}","village_name":name.capitalize(),
                "state":state,"district":f"District {rng.integers(1,30):02d}",
                "latitude":round(float(rng.uniform(*latr)),4),
                "longitude":round(float(rng.uniform(*lonr)),4),
                "population":int(rng.integers(300,9000)),
                "viirs_2019":round(v19,5),"viirs_latest":round(v19*gf,5),
                "road_connected":int(rng.random()<rp),
                "road_km":round(float(rng.uniform(0,12)*rp),2),
            })
    return pd.DataFrame(rows)


df = load_real_data() if args.mode == "real" else demo_data()

for c,v in [('road_connected',0),('road_km',0.0),('latitude',np.nan),('longitude',np.nan)]:
    if c not in df.columns: df[c] = v

# CLEANING
print("\nCLEANING")
n0 = len(df)
df = df.dropna(subset=['viirs_2019','viirs_latest'])
df['population'] = pd.to_numeric(df['population'], errors='coerce').fillna(1000.0)
df = df[df['population'] > 0]

# Keep only villages where both years have positive light
# This removes data-gap villages and zero-light uninhabited areas
df = df[(df['viirs_2019'] > 0) & (df['viirs_latest'] > 0)]

# Remove extreme outliers — anything above 99th percentile in either year
# This handles the 191 million % growth cases which are data errors
for col in ['viirs_2019','viirs_latest']:
    cap = df[col].quantile(0.99)
    df[col] = df[col].clip(upper=cap)

# Also clip growth to sensible range — real economic growth max ~2000%
# Values above this are satellite anomalies (fires, flares, construction sites)
df['road_connected'] = pd.to_numeric(df['road_connected'],errors='coerce').fillna(0)
df['road_km']        = pd.to_numeric(df['road_km'],       errors='coerce').fillna(0)
print(f"  Before: {n0:,}   After: {len(df):,}   Removed: {n0-len(df):,}")

# PROCESSING
print("\nPROCESSING")
eps = 1e-6
df['nl_pct_growth']  = (df['viirs_latest'] - df['viirs_2019']) / (df['viirs_2019'] + eps) * 100
# Clip growth percentage — anything above 99.5th percentile is an anomaly
growth_cap = df['nl_pct_growth'].quantile(0.995)
df['nl_pct_growth']  = df['nl_pct_growth'].clip(upper=growth_cap)
df['nl_per_1000pop'] = (df['viirs_latest'] / df['population']) * 1000
df['road_score']     = df['road_connected']*0.6 + (df['road_km'].clip(upper=10)/10)*0.4
print(f"  Light growth range after clipping: {df['nl_pct_growth'].min():.0f}% to {df['nl_pct_growth'].max():.0f}%")
print(f"  Villages with road: {int(df['road_connected'].sum()):,}")

# SCORING
print("\nSCORING")
def minmax(s):
    s2 = s.replace([np.inf,-np.inf], np.nan)
    lo, hi = s2.min(), s2.max()
    if pd.isna(lo) or pd.isna(hi) or hi == lo:
        return pd.Series(0.0, index=s.index)
    return (s2 - lo) / (hi - lo)

df['norm_nl_growth'] = minmax(df['nl_pct_growth']).fillna(0)
df['norm_nl_level']  = minmax(df['viirs_latest']).fillna(0)
df['norm_road']      = minmax(df['road_score']).fillna(0)
df['norm_pop_adj']   = minmax(df['nl_per_1000pop']).fillna(0)

df['score_0_100'] = (
    0.45*df['norm_nl_growth'] + 0.25*df['norm_nl_level'] +
    0.20*df['norm_road']      + 0.10*df['norm_pop_adj']
) * 100
df['score_0_100'] = df['score_0_100'].round(2)
print(f"  Score range: {df['score_0_100'].min():.1f} to {df['score_0_100'].max():.1f}")

# RANKING
df = df.sort_values('score_0_100', ascending=False).reset_index(drop=True)
df['rank'] = df.index + 1
df['nl_growth_x'] = (df['viirs_latest']/(df['viirs_2019']+eps)).round(2)

def tier(s):
    if s >= 80: return "Tier 1 - Hotspot"
    if s >= 65: return "Tier 2 - High Growth"
    if s >= 50: return "Tier 3 - Moderate"
    return "Tier 4 - Emerging"

df['growth_tier'] = df['score_0_100'].apply(tier)
top100 = df.head(100).copy()

# OUTPUT
cols = ['rank','village_name','state','district','latitude','longitude',
        'population','viirs_2019','viirs_latest','nl_pct_growth',
        'nl_growth_x','road_connected','road_km','score_0_100','growth_tier']
cols = [c for c in cols if c in top100.columns]

top100[cols].to_csv("output/top100_villages.csv", index=False)
df[cols].to_csv("output/all_villages_ranked.csv", index=False)
top100[cols].to_json("output/top100_map_data.json", orient="records", indent=2)

df.groupby('state').agg(
    count_in_top100=('rank', lambda x:(x<=100).sum()),
    avg_score=('score_0_100','mean'),
    best_score=('score_0_100','max'),
    avg_light_growth=('nl_pct_growth','mean')
).reset_index().sort_values('avg_score',ascending=False).round(2).to_csv(
    "output/state_summary.csv", index=False)

print(f"\nRESULTS")
print(f"  Total villages scored: {len(df):,}")
print(f"\n  Top 10 villages:")
print(top100[['rank','village_name','state','score_0_100','growth_tier']].head(10).to_string(index=False))
print(f"\n  Files saved to output/ folder")
