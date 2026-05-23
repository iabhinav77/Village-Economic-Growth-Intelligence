# Village-Economic-Growth-Intelligence
Kumar Abhinav Assignment
Village Economic Growth Intelligence
Built for the given assignment. The goal was to find the top 100 villages in India that grew the most economically over the last 5 years, using satellite data and public datasets.
I have used night time satellite light data from VIIRS (NASA/NOAA) as the main signal. The idea is simple that if a village has more artificial light in 2021 than it did in 2019, something economic is happening there. New shops, electricity connections, construction, commercial activity. This is a well established method in economics research. Henderson et al. (2011) showed that a 1% increase in nighttime lights corresponds to roughly 0.3% GDP growth.
I also added road connectivity from the PMGSY programme and population data from Census 2011 to make the scoring fairer.
All data came from SHRUG v2.1 by Development Data Lab, which is a free public platform that pre-processes village level data for all of India. You can download it at devdatalab.org/shrug_download.

Data sources
VIIRS annual nighttime lights - NOAA/NASA via SHRUG v2.1. This is satellite data measuring light intensity at ground level, updated every year. I used 2019 as the baseline and 2021 as the latest year available in SHRUG.
PMGSY road connectivity -Ministry of Rural Development via SHRUG. Records which villages got paved roads and how many km were built. Road access means market access, which means economic activity.
Census 2011 population - Registrar General of India via SHRUG. Used to stop large villages from dominating the ranking just because they have more total light. I normalize by population.
Village names, states, districts - SHRUG location names file (shrid_loc_names.csv).

How to run it
Install what you need:

pip install pandas numpy folium
npm install pptxgenjs

Run the full pipeline on real SHRUG data:

python scripts/pipeline.py --mode real

Generate the interactive map:

python scripts/generate_map.py

Generate the presentation:

node scripts/generate_slides.js

Create small sample files for sharing (the real files are 1-2 GB each):

python scripts/make_samples.py

What the pipeline does
Step 1 is the extraction. It loads the VIIRS file which has 14 million rows in long format, one row per village per year. I pivoted it so that each village becomes one row with a 2019 column and a 2021 column.
Step 2 is cleaning. I have dropped villages where both years have zero light since those are either uninhabited or have no satellite coverage. I have also clipped the top 1% of light values because some extreme readings are from gas flares or industrial sites, not villages. Same with growth percentage, anything above the 99.5th percentile is almost certainly a satellite anomaly.
Step 3 is feature engineering. I then calculated three things: percentage growth in light from 2019 to 2021, absolute light level in 2021, and light per 1000 people.
Step 4 is normalizing. Each signal gets scaled from 0 to 1 using min-max normalization so they can be combined fairly.
Step 5 is scoring. I have applied weights and multiply by 100 to get a final score between 0 and 100.
score = 0.45 x light growth + 0.25 x light level + 0.20 x road connectivity + 0.10 x population adjusted
Step 6 is ranking. All 514,595 villages get sorted by score. Top 100 go into the final output file.

Why these weights
Light growth gets the highest weight at 45% because it directly measures change over time, which is what economic growth means. A village that was already bright in 2019 but didn't grow much should score lower than a village that was dim in 2019 and grew a lot.
Absolute light level gets 25% because pure growth from near-zero to slightly above zero is not that meaningful. Some baseline brightness confirms there is real activity.
Roads get 20% because PMGSY data shows that villages with paved road access have measurably better economic outcomes. Asher and Novosad (2020) found it raises agricultural wages by 5-7% per year.
Population adjustment gets 10% just to correct for size. Without it a village of 8000 people beats a village of 500 people just because it has more total light, even if the smaller one grew faster per person.

Results
514,595 villages were scored across 20 states. Top village is kaliyapani grant in Assam with a score of 84.55.
Output files are in the output folder:
top100_villages.csv is the final answer
all_villages_ranked.csv has all 514,595 villages if you want to look deeper
state_summary.csv shows which states have the most high-growth villages
top100_villages_map.html is an interactive map, which can be opened and viewed.

Limitations
SHRUG VIIRS only goes to 2021 so I could not do a true 2019 to 2024 comparison. To extend it to 2024 I would need to extract data directly from Google Earth Engine using the NOAA/VIIRS/DNB/ANNUAL_V22 dataset.
The satellite picks up light from nearby towns and industries which can inflate scores for villages that are close to cities. This is called the blooming effect and it is a known limitation of VIIRS at village scale.
Census 2011 population is 14 years old now so population-adjusted scores are only approximate.
The scores have not been validated against actual income or consumption data. They are proxy-based estimates.

What I would do if i would have more time
I would pull 2022 to 2024 VIIRS data from Google Earth Engine to complete the five year window the assignment asked for.
Add TRAI mobile tower data as a fifth signal. Mobile penetration strongly correlates with rural economic activity and is updated annually.
Run a validation check against SECC 2011 household consumption data to see if high-scoring villages actually have higher consumption levels.
Use the SHRUG shapefile to get accurate GPS coordinates for each village so the map markers land in the right place instead of being scattered around the state centroid.

References
Asher S, Lunt T, Matsuura R, Novosad P. Development research at high geographic resolution. World Bank Economic Review. 2021.
Henderson JV, Storeygard A, Weil DN. A bright idea for measuring economic growth. American Economic Review. 2011.
Asher S, Novosad P. Rural roads and local economic development. American Economic Review. 2020.
