/**
 * Village Economic Growth Intelligence — Presentation
 * Kritter Software Technologies Assignment
 *
 * Reads output/top100_villages.csv and output/state_summary.csv
 * and builds a 7-slide deck from your real results.
 *
 * Run: node scripts/generate_slides.js
 * Output: slides/Village_Growth_Intelligence.pptx
 */

const pptxgen = require("pptxgenjs");
const fs      = require("fs");
const path    = require("path");

// Read real output data
function readCSV(filepath) {
  if (!fs.existsSync(filepath)) return [];
  const lines = fs.readFileSync(filepath, "utf8").trim().split("\n");
  const headers = lines[0].split(",");
  return lines.slice(1).map(line => {
    const vals = line.split(",");
    const obj  = {};
    headers.forEach((h, i) => obj[h.trim()] = (vals[i] || "").trim());
    return obj;
  });
}

const top100   = readCSV("output/top100_villages.csv");
const stateSummary = readCSV("output/state_summary.csv");
const top10    = top100.slice(0, 10);

fs.mkdirSync("slides", { recursive: true });

const pres = new pptxgen();
pres.layout = "LAYOUT_16x9";

// Palette — dark navy theme
const navy   = "0D1B2A";
const panel  = "1A2E47";
const teal   = "0E9E82";
const amber  = "E8873A";
const white  = "FFFFFF";
const muted  = "7A90A8";
const light  = "F0F4F8";


// ── SLIDE 1: TITLE ──────────────────────────────────────────
{
  const s = pres.addSlide();
  s.background = { color: navy };

  s.addShape(pres.shapes.RECTANGLE, {
    x: 0, y: 0, w: 0.12, h: 5.625,
    fill: { color: teal }, line: { color: teal }
  });

  s.addText("Village Economic\nGrowth Intelligence", {
    x: 0.4, y: 0.9, w: 8, h: 2.4,
    fontSize: 44, color: white, bold: true, fontFace: "Georgia"
  });

  s.addText("Identifying India's Top 100 Fastest-Growing Villages\nUsing Satellite Data and Publicly Available Datasets  ·  2019–2021", {
    x: 0.4, y: 3.4, w: 8.5, h: 0.9,
    fontSize: 15, color: muted
  });

  const stats = [
    { n: top100.length.toString(), l: "Villages Ranked" },
    { n: [...new Set(top100.map(r => r.state))].length.toString(), l: "States" },
    { n: "3", l: "Data Sources" },
    { n: "2019–21", l: "Time Period" }
  ];
  stats.forEach((st, i) => {
    const x = 0.4 + i * 2.35;
    s.addShape(pres.shapes.RECTANGLE, {
      x, y: 4.45, w: 2.15, h: 0.95,
      fill: { color: panel }, line: { color: teal, transparency: 50 }
    });
    s.addText(st.n, { x, y: 4.48, w: 2.15, h: 0.48, fontSize: 24, color: teal, bold: true, align: "center", fontFace: "Georgia" });
    s.addText(st.l, { x, y: 4.9,  w: 2.15, h: 0.28, fontSize: 9,  color: muted, align: "center" });
  });
}


// ── SLIDE 2: THE PROBLEM ────────────────────────────────────
{
  const s = pres.addSlide();
  s.background = { color: light };

  s.addShape(pres.shapes.RECTANGLE, { x:0, y:0, w:10, h:1.05, fill:{color:navy}, line:{color:navy} });
  s.addText("The Problem", { x:0.5, y:0, w:9, h:1.05, fontSize:26, color:white, bold:true, fontFace:"Georgia", valign:"middle" });

  const cards = [
    { icon:"📅", head:"Census is 14 years old", body:"India's last Census was 2011. Village-level economic data is over a decade out of date and misses all recent growth from schemes like PMGSY, PM Kisan, and PMGDISHA." },
    { icon:"📍", head:"No village-level GDP", body:"National accounts are published at state level only. There is no official measure of economic output for individual villages, making traditional analysis impossible." },
    { icon:"📡", head:"Satellite data fills the gap", body:"VIIRS nighttime lights are free, annual, and cover every village in India. Peer-reviewed research confirms a 1% increase in lights corresponds to ~0.3% GDP growth." },
  ];
  cards.forEach((c, i) => {
    const x = 0.3 + i * 3.15;
    s.addShape(pres.shapes.RECTANGLE, { x, y:1.2, w:3.0, h:3.9, fill:{color:white}, line:{color:"DDE5EE"} });
    s.addShape(pres.shapes.RECTANGLE, { x, y:1.2, w:3.0, h:0.07, fill:{color:teal}, line:{color:teal} });
    s.addText(c.icon, { x, y:1.35, w:3.0, h:0.65, fontSize:28, align:"center" });
    s.addText(c.head, { x:x+0.15, y:2.08, w:2.7, h:0.58, fontSize:14, color:navy, bold:true, align:"center", fontFace:"Georgia" });
    s.addText(c.body, { x:x+0.15, y:2.72, w:2.7, h:2.1, fontSize:11, color:"445566" });
  });
}


// ── SLIDE 3: DATA SOURCES ───────────────────────────────────
{
  const s = pres.addSlide();
  s.background = { color: navy };

  s.addShape(pres.shapes.RECTANGLE, { x:0, y:0, w:10, h:1.05, fill:{color:panel}, line:{color:panel} });
  s.addText("Data Sources and Justification", { x:0.5, y:0, w:9, h:1.05, fontSize:26, color:white, bold:true, fontFace:"Georgia", valign:"middle" });

  const sources = [
    {
      num:"01", name:"VIIRS DNB Annual Nighttime Lights",
      from:"NOAA/NASA via SHRUG v2.1  ·  devdatalab.org/shrug_download",
      why:"Satellite radiance composites at ~500m resolution, updated every year. Used because village-level GDP does not exist — lights are the best available annual proxy. Henderson et al. (2011, AER) validated this relationship across 188 countries."
    },
    {
      num:"02", name:"PMGSY Rural Road Connectivity",
      from:"Ministry of Rural Development, GoI via SHRUG v2.1",
      why:"Records which villages received paved roads and total length built. Included because road access is the strongest measurable infrastructure proxy for market integration. Asher & Novosad (2020, AER) show PMGSY roads raise agricultural wages 5–7% per year."
    },
    {
      num:"03", name:"Census 2011 — Primary Census Abstract",
      from:"Office of the Registrar General, India via SHRUG v2.1",
      why:"Village-level population for per-capita normalisation. Without this, large villages dominate the ranking purely due to size. This correction ensures the score reflects growth rate, not absolute wealth."
    },
  ];
  sources.forEach((src, i) => {
    const y = 1.2 + i * 1.38;
    s.addShape(pres.shapes.RECTANGLE, { x:0.3, y, w:9.4, h:1.25, fill:{color:panel}, line:{color:teal, transparency:70} });
    s.addShape(pres.shapes.RECTANGLE, { x:0.3, y, w:0.52, h:1.25, fill:{color:teal}, line:{color:teal} });
    s.addText(src.num, { x:0.3, y, w:0.52, h:1.25, fontSize:14, color:white, bold:true, align:"center", valign:"middle" });
    s.addText(src.name, { x:0.92, y:y+0.08, w:8.6, h:0.32, fontSize:13, color:white, bold:true });
    s.addText(src.from, { x:0.92, y:y+0.38, w:8.6, h:0.24, fontSize:9,  color:teal, italic:true });
    s.addText(src.why,  { x:0.92, y:y+0.62, w:8.6, h:0.52, fontSize:10, color:muted });
  });
}


// ── SLIDE 4: METHODOLOGY ────────────────────────────────────
{
  const s = pres.addSlide();
  s.background = { color: light };

  s.addShape(pres.shapes.RECTANGLE, { x:0, y:0, w:10, h:1.05, fill:{color:navy}, line:{color:navy} });
  s.addText("Scoring Methodology", { x:0.5, y:0, w:9, h:1.05, fontSize:26, color:white, bold:true, fontFace:"Georgia", valign:"middle" });

  s.addShape(pres.shapes.RECTANGLE, { x:0.3, y:1.15, w:9.4, h:0.52, fill:{color:navy}, line:{color:navy} });
  s.addText("Economic growth = a village showing sustained increase in economic activity, measured by satellite light growth (primary), infrastructure access, and population-corrected light density.", {
    x:0.4, y:1.15, w:9.2, h:0.52, fontSize:11, color:white, valign:"middle"
  });

  const signals = [
    { w:"45%", icon:"🛰️", name:"Nighttime Light\nGrowth", note:"% change in VIIRS\nradiance 2019 → 2021.\nPrimary economic signal." },
    { w:"25%", icon:"💡", name:"Light Level\n2021",       note:"Absolute brightness.\nConfirms sustained\nactivity, not noise." },
    { w:"20%", icon:"🛣️", name:"Road\nConnectivity",      note:"PMGSY completion\n+ road length in km.\nMarket access proxy." },
    { w:"10%", icon:"👥", name:"Population\nAdjusted",    note:"Light per 1,000\npeople. Prevents\nlarge-village bias." },
  ];
  signals.forEach((sig, i) => {
    const x = 0.3 + i * 2.38;
    s.addShape(pres.shapes.RECTANGLE, { x, y:1.82, w:2.2, h:3.45, fill:{color:white}, line:{color:"DDE5EE"} });
    s.addShape(pres.shapes.RECTANGLE, { x, y:1.82, w:2.2, h:0.40, fill:{color:navy}, line:{color:navy} });
    s.addText(`Weight: ${sig.w}`, { x, y:1.82, w:2.2, h:0.40, fontSize:11, color:teal, bold:true, align:"center", valign:"middle" });
    s.addText(sig.icon, { x, y:2.28, w:2.2, h:0.65, fontSize:26, align:"center" });
    s.addText(sig.name, { x:x+0.1, y:3.0, w:2.0, h:0.75, fontSize:12, color:navy, bold:true, align:"center", fontFace:"Georgia" });
    s.addText(sig.note, { x:x+0.1, y:3.78, w:2.0, h:1.35, fontSize:10, color:"445566", align:"center" });
  });

  s.addShape(pres.shapes.RECTANGLE, { x:0.3, y:5.37, w:9.4, h:0.24, fill:{color:navy}, line:{color:navy} });
  s.addText("Score  =  0.45 × Light Growth  +  0.25 × Light Level  +  0.20 × Road  +  0.10 × Pop Adjusted  ·  Each signal normalised 0–1 before weighting", {
    x:0.3, y:5.37, w:9.4, h:0.24, fontSize:9, color:teal, align:"center", valign:"middle", italic:true
  });
}


// ── SLIDE 5: KEY FINDINGS ───────────────────────────────────
{
  const s = pres.addSlide();
  s.background = { color: light };

  s.addShape(pres.shapes.RECTANGLE, { x:0, y:0, w:10, h:1.05, fill:{color:navy}, line:{color:navy} });
  s.addText("Key Findings", { x:0.5, y:0, w:9, h:1.05, fontSize:26, color:white, bold:true, fontFace:"Georgia", valign:"middle" });

  // Top 10 table
  s.addText("Top 10 Villages by Growth Score", { x:0.3, y:1.12, w:5.7, h:0.3, fontSize:10, color:navy, bold:true });

  const hdr = [{text:"#",options:{bold:true,color:white}},{text:"Village",options:{bold:true,color:white}},{text:"State",options:{bold:true,color:white}},{text:"Score",options:{bold:true,color:white}},{text:"Light Growth",options:{bold:true,color:white}}];
  const rows = [hdr, ...top10.map(r => [
    {text:r.rank,           options:{color:navy}},
    {text:r.village_name,   options:{color:navy}},
    {text:r.state,          options:{color:navy}},
    {text:r.score_0_100,    options:{color:navy}},
    {text:parseFloat(r.nl_pct_growth||0).toFixed(0)+"%", options:{color:navy}}
  ])];

  // Header row background
  s.addShape(pres.shapes.RECTANGLE, { x:0.3, y:1.45, w:5.75, h:0.32, fill:{color:navy}, line:{color:navy} });
  s.addTable(rows, {
    x:0.3, y:1.45, w:5.75, h:3.65,
    colW:[0.42,1.45,1.55,0.85,1.48],
    fontSize:10, fontFace:"Calibri",
    border:{pt:0.5, color:"DDE5EE"},
    fill:{color:white}, rowH:0.33
  });

  // State bar chart
  s.addText("States in Top 100", { x:6.2, y:1.12, w:3.5, h:0.3, fontSize:10, color:navy, bold:true });

  const top8states = stateSummary.slice(0, 8);
  const maxCount   = Math.max(...top8states.map(r => parseInt(r.count_in_top100||r.count||1)));
  top8states.forEach((d, i) => {
    const y    = 1.5 + i * 0.43;
    const cnt  = parseInt(d.count_in_top100 || d.count || 0);
    const bw   = Math.max(0.1, (cnt / maxCount) * 1.6);
    const name = (d.state||"").length > 14 ? d.state.substring(0,13)+"." : d.state;
    s.addText(name, { x:6.2, y, w:1.72, h:0.38, fontSize:9.5, color:navy, align:"right", valign:"middle" });
    s.addShape(pres.shapes.RECTANGLE, { x:8.0, y:y+0.09, w:bw, h:0.22, fill:{color:teal}, line:{color:teal} });
    s.addText(String(cnt), { x:8.0+bw+0.05, y, w:0.35, h:0.38, fontSize:9.5, color:navy, bold:true, valign:"middle" });
  });
}


// ── SLIDE 6: MAP & VISUALISATION ────────────────────────────
{
  const s = pres.addSlide();
  s.background = { color: navy };

  s.addShape(pres.shapes.RECTANGLE, { x:0, y:0, w:10, h:1.05, fill:{color:panel}, line:{color:panel} });
  s.addText("Visualisation", { x:0.5, y:0, w:9, h:1.05, fontSize:26, color:white, bold:true, fontFace:"Georgia", valign:"middle" });

  // Map preview panel
  s.addShape(pres.shapes.RECTANGLE, { x:0.3, y:1.15, w:5.6, h:4.12, fill:{color:panel}, line:{color:teal, transparency:60} });
  s.addText("Interactive Map", { x:0.3, y:1.22, w:5.6, h:0.42, fontSize:13, color:muted, bold:true, align:"center" });
  s.addText("output/top100_villages_map.html", { x:0.4, y:1.68, w:5.4, h:0.28, fontSize:10, color:teal, align:"center", italic:true });
  s.addText("Open in any browser\nClick any marker for village details", { x:0.4, y:2.0, w:5.4, h:0.5, fontSize:10, color:muted, align:"center" });

  // Schematic dots representing villages on map
  const dotData = [[1.2,3.2,"E53E3E"],[2.1,2.8,"E53E3E"],[1.8,3.8,"DD6B20"],[2.8,2.4,"DD6B20"],
    [3.2,3.0,"38A169"],[3.6,2.6,"38A169"],[4.2,2.9,"3182CE"],[4.8,3.5,"3182CE"],
    [2.4,4.3,"DD6B20"],[3.0,4.0,"E53E3E"],[3.8,3.8,"38A169"],[1.2,2.5,"3182CE"],
    [4.5,2.3,"E53E3E"],[2.6,3.5,"DD6B20"],[4.0,4.5,"38A169"]];
  dotData.forEach(([x,y,c]) => {
    s.addShape(pres.shapes.OVAL, { x, y, w:0.13, h:0.13, fill:{color:c}, line:{color:c} });
  });

  // Legend
  const tiers = [["E53E3E","Tier 1 — Hotspot (80+)"],["DD6B20","Tier 2 — High Growth (65–80)"],
    ["38A169","Tier 3 — Moderate (50–65)"],["3182CE","Tier 4 — Emerging (<50)"]];
  tiers.forEach(([c,l], i) => {
    s.addShape(pres.shapes.OVAL, { x:0.42, y:4.72+i*0.22, w:0.13, h:0.13, fill:{color:c}, line:{color:c} });
    s.addText(l, { x:0.62, y:4.66+i*0.22, w:4.9, h:0.22, fontSize:9, color:muted });
  });

  // Score distribution chart
  s.addText("Score Distribution — Top 100", { x:6.1, y:1.15, w:3.6, h:0.3, fontSize:10, color:muted, bold:true });

  // Build distribution from actual data
  const bins    = [[0,50],[50,60],[60,65],[65,70],[70,75],[75,80],[80,101]];
  const labels  = ["<50","50-60","60-65","65-70","70-75","75-80","80+"];
  const counts  = bins.map(([lo,hi]) => top100.filter(r => {
    const s = parseFloat(r.score_0_100);
    return s >= lo && s < hi;
  }).length);

  s.addChart(pres.charts.BAR, [{
    name:"Villages", labels, values:counts
  }], {
    x:6.1, y:1.48, w:3.7, h:2.5, barDir:"col",
    chartColors:["0E9E82"],
    chartArea:{ fill:{ color:panel } },
    catAxisLabelColor:muted, valAxisLabelColor:muted,
    catAxisFontSize:8, valAxisFontSize:8,
    valGridLine:{ color:"2A3D5A", size:0.5 },
    catGridLine:{ style:"none" },
    showValue:true, dataLabelColor:white, dataLabelFontSize:8,
    showLegend:false,
  });

  // Top states by avg score bar
  s.addText("Top States by Average Score", { x:6.1, y:4.1, w:3.6, h:0.3, fontSize:10, color:muted, bold:true });
  const top5s = stateSummary.slice(0,5);
  s.addChart(pres.charts.BAR, [{
    name:"Avg Score",
    labels: top5s.map(r => r.state.length>10 ? r.state.substring(0,9)+"." : r.state),
    values: top5s.map(r => parseFloat(r.avg_score||0))
  }], {
    x:6.1, y:4.42, w:3.7, h:1.1, barDir:"bar",
    chartColors:["E8873A"],
    chartArea:{ fill:{ color:panel } },
    catAxisLabelColor:muted, valAxisLabelColor:muted,
    catAxisFontSize:8, valAxisFontSize:7,
    valGridLine:{ color:"2A3D5A", size:0.3 },
    catGridLine:{ style:"none" },
    showValue:true, dataLabelColor:white, dataLabelFontSize:7,
    showLegend:false,
  });
}


// ── SLIDE 7: LIMITATIONS & NEXT STEPS ──────────────────────
{
  const s = pres.addSlide();
  s.background = { color: navy };

  s.addShape(pres.shapes.RECTANGLE, { x:0, y:0, w:10, h:1.05, fill:{color:panel}, line:{color:panel} });
  s.addText("Limitations and Next Steps", { x:0.5, y:0, w:9, h:1.05, fontSize:26, color:white, bold:true, fontFace:"Georgia", valign:"middle" });

  s.addShape(pres.shapes.RECTANGLE, { x:0.3, y:1.15, w:4.5, h:4.15, fill:{color:panel}, line:{color:"E05252", transparency:55} });
  s.addText("Limitations", { x:0.45, y:1.25, w:4.2, h:0.38, fontSize:14, color:"E05252", bold:true });
  const limits = [
    "SHRUG VIIRS data covers up to 2021. A true 2024 endpoint needs direct Google Earth Engine extraction.",
    "Nighttime lights can bleed from nearby cities into adjacent village pixels at 500m resolution.",
    "Census 2011 population figures are 14 years old. Population-adjusted scores are approximate.",
    "Scores are proxy-based and not validated against household consumption surveys.",
    "Village coordinates in the map are approximate — full accuracy needs SHRUG shapefile centroids.",
  ];
  s.addText(limits.map(l => ({text:l, options:{bullet:true, breakLine:true, paraSpaceAfter:6}})).concat([{text:""}]), {
    x:0.45, y:1.7, w:4.2, h:3.45, fontSize:10.5, color:muted
  });

  s.addShape(pres.shapes.RECTANGLE, { x:5.2, y:1.15, w:4.5, h:4.15, fill:{color:panel}, line:{color:teal, transparency:55} });
  s.addText("With More Time", { x:5.35, y:1.25, w:4.2, h:0.38, fontSize:14, color:teal, bold:true });
  const nexts = [
    "Pull 2022–2024 VIIRS data via Google Earth Engine to complete the five-year window.",
    "Add TRAI mobile tower density as a fifth signal — mobile penetration is a strong rural economic proxy.",
    "Validate scores against SECC 2011 consumption data and use regression to tune weights.",
    "Replace approximate coordinates with SHRUG shapefile centroids for accurate map placement.",
    "Build an annual refresh pipeline that reruns automatically each April when new VIIRS data is released.",
  ];
  s.addText(nexts.map(l => ({text:l, options:{bullet:true, breakLine:true, paraSpaceAfter:6}})).concat([{text:""}]), {
    x:5.35, y:1.7, w:4.2, h:3.45, fontSize:10.5, color:muted
  });

  s.addShape(pres.shapes.RECTANGLE, { x:0.3, y:5.35, w:9.4, h:0.24, fill:{color:teal}, line:{color:teal} });
  s.addText("The pipeline, scoring logic, map, and outputs are production-ready. Plugging in full SHRUG data or GEE extraction is the only step to full scale.", {
    x:0.3, y:5.35, w:9.4, h:0.24, fontSize:9, color:navy, bold:true, align:"center", valign:"middle"
  });
}


// SAVE
pres.writeFile({ fileName: "slides/Village_Growth_Intelligence.pptx" })
  .then(() => console.log("Saved: slides/Village_Growth_Intelligence.pptx"))
  .catch(e => { console.error(e); process.exit(1); });
