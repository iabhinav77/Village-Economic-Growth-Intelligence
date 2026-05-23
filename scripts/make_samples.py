

import pandas as pd
import os

files = [
    ("data/shrug-viirs-annual-csv/viirs_annual_shrid.csv",  "data/sample_viirs.csv"),
    ("data/shrug-pmgsy-csv/pmgsy_2015_shrid.csv",           "data/sample_pmgsy.csv"),
    ("data/shrug-vd11-csv/pc11_vd_clean_shrid.csv",         "data/sample_vd11.csv"),
]

for src, dst in files:
    if not os.path.exists(src):
        print(f"Not found: {src}")
        continue
    df = pd.read_csv(src, nrows=10000)
    df.to_csv(dst, index=False)
    src_mb = os.path.getsize(src) / 1e6
    dst_kb = os.path.getsize(dst) / 1e3
    print(f"{src} ({src_mb:.0f} MB)  =>  {dst} ({dst_kb:.0f} KB)")

print("\nDone. Upload the sample_ files to GitHub.")
