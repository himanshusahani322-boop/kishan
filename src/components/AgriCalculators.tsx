import React, { useState } from 'react';
import { 
  Calculator, 
  Sprout, 
  Sun, 
  CloudRain, 
  Droplets, 
  Compass, 
  IndianRupee, 
  TrendingUp, 
  Scale,
  Calendar,
  Layers,
  Leaf
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const AgriCalculators: React.FC = () => {
  const { language } = useApp();
  const [activeTab, setActiveTab] = useState<'fertilizer' | 'seed' | 'yield' | 'lifecycle'>('fertilizer');

  // Fertilizer Calculator State
  const [fertCrop, setFertCrop] = useState<'Wheat' | 'Paddy' | 'Cotton' | 'Mustard' | 'Potato'>('Wheat');
  const [fertLandArea, setFertLandArea] = useState<number>(5);
  const [fertLandUnit, setFertLandUnit] = useState<'Acre' | 'Bigha' | 'Hectare'>('Acre');

  // Multiplier for land unit into acres
  const unitToAcreMultiplier = fertLandUnit === 'Acre' ? 1 : fertLandUnit === 'Bigha' ? 0.4 : 2.47;
  const effectiveAcres = fertLandArea * unitToAcreMultiplier;

  // NPK standards per acre (kg):
  const npkStandards = {
    Wheat: { n: 48, p: 24, k: 16, urea: 90, dap: 55, mop: 25 },
    Paddy: { n: 50, p: 20, k: 20, urea: 95, dap: 45, mop: 32 },
    Cotton: { n: 60, p: 30, k: 30, urea: 115, dap: 65, mop: 50 },
    Mustard: { n: 32, p: 16, k: 12, urea: 60, dap: 35, mop: 20 },
    Potato: { n: 72, p: 40, k: 48, urea: 130, dap: 90, mop: 80 }
  };

  const selectedFert = npkStandards[fertCrop];
  const totalUreaBags = Math.ceil((selectedFert.urea * effectiveAcres) / 45); // 45kg bag
  const totalDapBags = Math.ceil((selectedFert.dap * effectiveAcres) / 50); // 50kg bag
  const totalMopBags = Math.ceil((selectedFert.mop * effectiveAcres) / 50); // 50kg bag
  const estimatedFertCost = Math.round(
    (totalUreaBags * 266.5) + (totalDapBags * 1350) + (totalMopBags * 1700)
  );

  // Seed Calculator State
  const [seedCrop, setSeedCrop] = useState<'Wheat' | 'Paddy' | 'Chana' | 'Soybean' | 'Mustard'>('Wheat');
  const [seedLandArea, setSeedLandArea] = useState<number>(3);
  const seedRatesPerAcre = {
    Wheat: { seedKg: 40, spacing: '20 cm row-to-row', depth: '4-5 cm', seedCostKg: 45 },
    Paddy: { seedKg: 15, spacing: '20 × 15 cm transplanting', depth: '2-3 cm', seedCostKg: 65 },
    Chana: { seedKg: 30, spacing: '30 × 10 cm', depth: '7-10 cm', seedCostKg: 85 },
    Soybean: { seedKg: 30, spacing: '45 × 5 cm', depth: '3-4 cm', seedCostKg: 75 },
    Mustard: { seedKg: 1.8, spacing: '45 × 15 cm', depth: '2-3 cm', seedCostKg: 180 }
  };
  const totalSeedRequiredKg = (seedRatesPerAcre[seedCrop].seedKg * seedLandArea).toFixed(1);
  const estimatedSeedExpense = Math.round(Number(totalSeedRequiredKg) * seedRatesPerAcre[seedCrop].seedCostKg);

  // Yield & Revenue Forecaster State
  const [yieldLandArea, setYieldLandArea] = useState<number>(4);
  const [expectedYieldPerAcre, setExpectedYieldPerAcre] = useState<number>(20); // Quintals
  const [sellingPricePerQtl, setSellingPricePerQtl] = useState<number>(3850);
  const [costOfCultivationPerAcre, setCostOfCultivationPerAcre] = useState<number>(14500);

  const totalYieldQuintals = yieldLandArea * expectedYieldPerAcre;
  const grossRevenue = totalYieldQuintals * sellingPricePerQtl;
  const totalCost = yieldLandArea * costOfCultivationPerAcre;
  const netProfit = grossRevenue - totalCost;

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-stone-900 font-display">
            {language === 'hi' ? 'कृषि कैलकुलेटर व फसल चक्र' : 'Agronomy Calculators & Crop Lifecycle Engine'}
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Standard ICAR agricultural formulas for optimal fertilizer dosage, certified seed rates, revenue forecasting, and weather stages.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl text-xs font-semibold overflow-x-auto">
          <button
            onClick={() => setActiveTab('fertilizer')}
            className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap ${
              activeTab === 'fertilizer' ? 'bg-white text-stone-900 shadow-xs font-bold' : 'text-stone-600'
            }`}
          >
            Fertilizer NPK
          </button>
          <button
            onClick={() => setActiveTab('seed')}
            className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap ${
              activeTab === 'seed' ? 'bg-white text-stone-900 shadow-xs font-bold' : 'text-stone-600'
            }`}
          >
            Seed Rate
          </button>
          <button
            onClick={() => setActiveTab('yield')}
            className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap ${
              activeTab === 'yield' ? 'bg-white text-stone-900 shadow-xs font-bold' : 'text-stone-600'
            }`}
          >
            Yield & Profit
          </button>
          <button
            onClick={() => setActiveTab('lifecycle')}
            className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap ${
              activeTab === 'lifecycle' ? 'bg-white text-stone-900 shadow-xs font-bold' : 'text-stone-600'
            }`}
          >
            Crop Lifecycle & Weather
          </button>
        </div>
      </div>

      {/* Tab 1: Fertilizer Calculator */}
      {activeTab === 'fertilizer' && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-5 bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4 text-xs">
            <h3 className="font-extrabold text-stone-900 text-sm font-display">
              Field Inputs & Crop Selection
            </h3>

            <div className="space-y-3">
              <div>
                <label className="font-bold text-stone-700 block mb-1">Target Crop:</label>
                <select
                  value={fertCrop}
                  onChange={e => setFertCrop(e.target.value as any)}
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-lg text-xs font-semibold"
                >
                  <option value="Wheat">Wheat (गेहूं)</option>
                  <option value="Paddy">Paddy / Rice (धान)</option>
                  <option value="Cotton">Cotton / Kapas (कपास)</option>
                  <option value="Mustard">Mustard (सरसों)</option>
                  <option value="Potato">Potato (आलू)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Land Measure:</label>
                  <input
                    type="number"
                    min={0.5}
                    step={0.5}
                    value={fertLandArea}
                    onChange={e => setFertLandArea(Number(e.target.value))}
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-lg text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Unit:</label>
                  <select
                    value={fertLandUnit}
                    onChange={e => setFertLandUnit(e.target.value as any)}
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-lg text-xs"
                  >
                    <option value="Acre">Acre (एकड़)</option>
                    <option value="Bigha">Bigha (बीघा - 0.4 Acre)</option>
                    <option value="Hectare">Hectare (हेक्टेयर)</option>
                  </select>
                </div>
              </div>

              <p className="text-[11px] text-stone-500 pt-1">
                Standard basal + top-dressing split recommended by state agricultural universities (PAU, JNKVV).
              </p>
            </div>
          </div>

          <div className="md:col-span-7 bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-5 text-xs">
            <h3 className="font-extrabold text-stone-900 text-sm font-display flex items-center justify-between">
              <span>Required Fertilizer Bag Quantities:</span>
              <span className="text-emerald-700 font-bold">Effective: {effectiveAcres.toFixed(1)} Acres</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 text-center space-y-1">
                <span className="text-[11px] font-bold text-amber-800">Neem-Coated Urea</span>
                <div className="text-2xl font-black text-amber-900 font-display">{totalUreaBags} Bags</div>
                <span className="text-[10px] text-amber-700 block">45 Kg / bag @ ₹266.50</span>
              </div>

              <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 text-center space-y-1">
                <span className="text-[11px] font-bold text-emerald-800">DAP (18:46:0)</span>
                <div className="text-2xl font-black text-emerald-900 font-display">{totalDapBags} Bags</div>
                <span className="text-[10px] text-emerald-700 block">50 Kg / bag @ ₹1,350</span>
              </div>

              <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 text-center space-y-1">
                <span className="text-[11px] font-bold text-blue-800">MOP (Potash 60%)</span>
                <div className="text-2xl font-black text-blue-900 font-display">{totalMopBags} Bags</div>
                <span className="text-[10px] text-blue-700 block">50 Kg / bag @ ₹1,700</span>
              </div>
            </div>

            <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 flex items-center justify-between">
              <div>
                <span className="text-stone-500 block text-[11px]">Total Estimated Fertilizer Cost</span>
                <span className="text-lg font-black text-stone-900 font-display">
                  ₹{estimatedFertCost.toLocaleString('en-IN')}
                </span>
              </div>
              <div className="text-right text-[11px] text-stone-500">
                <span>Direct DBTI Subsidized Rates</span>
                <div className="text-emerald-700 font-bold">Zero Nitrogen Burn Protection</div>
              </div>
            </div>

            <div className="text-[11px] text-stone-600 bg-stone-50 p-3 rounded-lg border border-stone-100 space-y-1">
              <strong>Application Schedule:</strong>
              <p>• <strong>Basal Dose (At Sowing):</strong> 100% of DAP, 100% of MOP, and 1/3rd of Urea.</p>
              <p>• <strong>First Top Dressing (21-25 Days):</strong> 1/3rd Urea after first CRI irrigation.</p>
              <p>• <strong>Second Top Dressing (45-50 Days):</strong> Remaining 1/3rd Urea at tillering / jointing stage.</p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Seed Rate Calculator */}
      {activeTab === 'seed' && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-5 bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4 text-xs">
            <h3 className="font-extrabold text-stone-900 text-sm font-display">
              Crop & Certified Seed Parameters
            </h3>

            <div className="space-y-3">
              <div>
                <label className="font-bold text-stone-700 block mb-1">Select Crop:</label>
                <select
                  value={seedCrop}
                  onChange={e => setSeedCrop(e.target.value as any)}
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-lg text-xs font-semibold"
                >
                  <option value="Wheat">Wheat (गेहूं)</option>
                  <option value="Paddy">Paddy (धान)</option>
                  <option value="Chana">Chana / Gram (चना)</option>
                  <option value="Soybean">Soybean (सोयाबीन)</option>
                  <option value="Mustard">Mustard (सरसों)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Land Area (Acres):</label>
                <input
                  type="number"
                  min={0.5}
                  step={0.5}
                  value={seedLandArea}
                  onChange={e => setSeedLandArea(Number(e.target.value))}
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-lg text-xs font-bold"
                />
              </div>

              <div className="p-3 bg-stone-50 rounded-lg border border-stone-200 space-y-1">
                <span className="font-bold text-stone-800 block text-[11px]">Agronomic Sowing Guidelines:</span>
                <p className="text-stone-600 text-[11px]">• Line spacing: {seedRatesPerAcre[seedCrop].spacing}</p>
                <p className="text-stone-600 text-[11px]">• Sowing depth: {seedRatesPerAcre[seedCrop].depth}</p>
                <p className="text-stone-600 text-[11px]">• Seed germination test: &gt; 85% recommended</p>
              </div>
            </div>
          </div>

          <div className="md:col-span-7 bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-5 text-xs flex flex-col justify-between">
            <div className="space-y-4">
              <h3 className="font-extrabold text-stone-900 text-sm font-display">
                Certified Seed Requirement Output
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-5 rounded-xl bg-emerald-50 border border-emerald-200 space-y-1">
                  <span className="text-emerald-800 text-[11px] font-bold">Total Seed Quantity Needed:</span>
                  <div className="text-3xl font-black text-emerald-950 font-display">
                    {totalSeedRequiredKg} Kg
                  </div>
                  <span className="text-emerald-700 text-[10px]">
                    At {seedRatesPerAcre[seedCrop].seedKg} Kg per acre standard rate
                  </span>
                </div>

                <div className="p-5 rounded-xl bg-stone-50 border border-stone-200 space-y-1">
                  <span className="text-stone-600 text-[11px] font-bold">Estimated Certified Seed Cost:</span>
                  <div className="text-3xl font-black text-stone-900 font-display">
                    ₹{estimatedSeedExpense.toLocaleString('en-IN')}
                  </div>
                  <span className="text-stone-400 text-[10px]">
                    Govt. NSC / State Beej Nigam rate benchmark
                  </span>
                </div>
              </div>

              <div className="p-4 bg-amber-50/80 rounded-xl border border-amber-200 text-amber-900 space-y-1 text-xs">
                <strong className="block font-bold">Fungicide & Rhizobium Seed Treatment (बीजोपचार):</strong>
                <p className="text-[11px] leading-relaxed">
                  Treat seeds with Trichoderma viride (4g/kg) or Carboxin + Thiram (2g/kg) before drilling to prevent collar rot, damping off, and wilt.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Yield & Revenue Forecaster */}
      {activeTab === 'yield' && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-5 bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-4 text-xs">
            <h3 className="font-extrabold text-stone-900 text-sm font-display">
              Commercial Yield & Cost Assumptions
            </h3>

            <div className="space-y-3">
              <div>
                <label className="font-bold text-stone-700 block mb-1">Harvest Area (Acres):</label>
                <input
                  type="number"
                  min={1}
                  value={yieldLandArea}
                  onChange={e => setYieldLandArea(Number(e.target.value))}
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-lg text-xs font-bold"
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Expected Yield per Acre (Quintals):</label>
                <input
                  type="number"
                  min={1}
                  value={expectedYieldPerAcre}
                  onChange={e => setExpectedYieldPerAcre(Number(e.target.value))}
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-lg text-xs font-bold text-emerald-800"
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Expected Mandi Rate (₹/Quintal):</label>
                <input
                  type="number"
                  min={500}
                  step={50}
                  value={sellingPricePerQtl}
                  onChange={e => setSellingPricePerQtl(Number(e.target.value))}
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-lg text-xs font-bold text-emerald-800"
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Cost of Cultivation per Acre (₹):</label>
                <input
                  type="number"
                  min={1000}
                  step={500}
                  value={costOfCultivationPerAcre}
                  onChange={e => setCostOfCultivationPerAcre(Number(e.target.value))}
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-lg text-xs"
                />
                <span className="text-[10px] text-stone-400">Includes plowing, seeds, fertilizer, labor, harvesting</span>
              </div>
            </div>
          </div>

          <div className="md:col-span-7 bg-white p-6 rounded-2xl border border-stone-200 shadow-xs space-y-5 text-xs">
            <h3 className="font-extrabold text-stone-900 text-sm font-display">
              Commercial Financial Realization Forecast
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-1">
                <span className="text-stone-500 text-[10px]">Total Production</span>
                <div className="text-xl font-black text-stone-900 font-display">{totalYieldQuintals} Qtl</div>
                <span className="text-stone-400 text-[10px]">{(totalYieldQuintals / 10).toFixed(1)} Tonnes</span>
              </div>

              <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-1">
                <span className="text-stone-500 text-[10px]">Total Input Expense</span>
                <div className="text-xl font-black text-rose-800 font-display">₹{totalCost.toLocaleString('en-IN')}</div>
                <span className="text-stone-400 text-[10px]">Across {yieldLandArea} acres</span>
              </div>

              <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 space-y-1">
                <span className="text-emerald-800 text-[10px] font-bold">Estimated Net Profit</span>
                <div className="text-2xl font-black text-emerald-950 font-display">
                  ₹{netProfit.toLocaleString('en-IN')}
                </div>
                <span className="text-emerald-700 text-[10px] font-semibold">
                  ROI: {((netProfit / totalCost) * 100).toFixed(0)}%
                </span>
              </div>
            </div>

            <div className="p-4 bg-stone-900 text-white rounded-xl space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-stone-400">Gross Harvest Value (Turnover):</span>
                <span className="text-lg font-black text-amber-300 font-display">₹{grossRevenue.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between items-center text-[11px] text-stone-300">
                <span>Kisan Saathi Direct Marketplace Premium vs Local Village Trader:</span>
                <span className="text-emerald-400 font-bold">+₹{Math.round(totalYieldQuintals * 220).toLocaleString('en-IN')} additional profit</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Crop Lifecycle & Weather */}
      {activeTab === 'lifecycle' && (
        <div className="bg-white rounded-2xl border border-stone-200 shadow-xs p-6 space-y-6 text-xs">
          {/* Weather Widget */}
          <div className="p-5 bg-gradient-to-r from-blue-900 to-indigo-900 text-white rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center text-amber-300">
                <Sun className="w-8 h-8" />
              </div>
              <div>
                <span className="text-blue-200 text-[10px] font-bold uppercase tracking-wider">
                  Agro-Meteorological Advisory (IMD Weather Station Sehore / Central Zone)
                </span>
                <h3 className="text-xl font-extrabold font-display">32°C • Clear & Dry Sky</h3>
                <p className="text-blue-200 text-xs">Humidity: 38% • Wind: 12 km/h WNW • Rain Probability: 0%</p>
              </div>
            </div>
            <div className="bg-white/10 px-4 py-2 rounded-xl text-left md:text-right">
              <span className="text-amber-300 text-[10px] font-bold block">Next 5 Days Outlook:</span>
              <span className="font-semibold text-xs">Optimal conditions for wheat & mustard threshing and sun-drying.</span>
            </div>
          </div>

          {/* Lifecycle Stages */}
          <div className="space-y-3">
            <h3 className="font-extrabold text-stone-900 text-sm font-display">
              Wheat (Rabi Season) 120-Day Crop Lifecycle Stages
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
              <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200 space-y-1.5">
                <div className="flex items-center justify-between font-bold text-emerald-900">
                  <span>Stage 1: CRI</span>
                  <span className="text-[10px] bg-emerald-200 px-1.5 py-0.5 rounded">Days 20-25</span>
                </div>
                <p className="text-stone-600 text-[11px]">Crown Root Initiation. Most critical first irrigation window. Apply first Urea dose.</p>
              </div>

              <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 space-y-1.5">
                <div className="flex items-center justify-between font-bold text-stone-900">
                  <span>Stage 2: Tillering</span>
                  <span className="text-[10px] bg-stone-200 px-1.5 py-0.5 rounded">Days 40-45</span>
                </div>
                <p className="text-stone-600 text-[11px]">Active side tillers develop. Second irrigation and weed control spray if necessary.</p>
              </div>

              <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 space-y-1.5">
                <div className="flex items-center justify-between font-bold text-stone-900">
                  <span>Stage 3: Jointing</span>
                  <span className="text-[10px] bg-stone-200 px-1.5 py-0.5 rounded">Days 60-65</span>
                </div>
                <p className="text-stone-600 text-[11px]">Stem elongation. Third irrigation to ensure maximum spikelet development.</p>
              </div>

              <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 space-y-1.5">
                <div className="flex items-center justify-between font-bold text-stone-900">
                  <span>Stage 4: Milking</span>
                  <span className="text-[10px] bg-stone-200 px-1.5 py-0.5 rounded">Days 85-90</span>
                </div>
                <p className="text-stone-600 text-[11px]">Grain filling milky state. Guard against terminal heat with light irrigation.</p>
              </div>

              <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200 space-y-1.5">
                <div className="flex items-center justify-between font-bold text-amber-900">
                  <span>Stage 5: Harvest</span>
                  <span className="text-[10px] bg-amber-200 px-1.5 py-0.5 rounded">Days 115-125</span>
                </div>
                <p className="text-stone-600 text-[11px]">Grain hardens, golden luster. Thresh when grain moisture falls below 12%.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
