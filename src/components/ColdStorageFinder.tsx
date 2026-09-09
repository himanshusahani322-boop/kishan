import React, { useState, useEffect } from 'react';
import { 
  Warehouse, 
  MapPin, 
  Thermometer, 
  Phone, 
  ShieldCheck, 
  Search, 
  CheckCircle2, 
  Calendar, 
  IndianRupee,
  Layers,
  ArrowUpRight
} from 'lucide-react';
import { ColdStorageFacility } from '../types';
import { useApp } from '../context/AppContext';

export const ColdStorageFinder: React.FC = () => {
  const { language, showToast } = useApp();
  const [facilities, setFacilities] = useState<ColdStorageFacility[]>([]);
  const [searchDistrict, setSearchDistrict] = useState('');
  const [selectedCropFilter, setSelectedCropFilter] = useState('all');

  useEffect(() => {
    fetch('/api/cold-storage')
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.coldStorages)) {
          // Map to ColdStorageFacility if needed
          const mapped: ColdStorageFacility[] = data.coldStorages.map((cs: any) => ({
            id: cs.id,
            name: cs.facilityName,
            district: cs.district,
            state: cs.state,
            distanceKm: 12,
            totalCapacityMT: cs.totalCapacityMT,
            availableCapacityMT: cs.availableCapacityMT,
            temperatureRange: `${cs.tempRangeMinCelsius}°C to ${cs.tempRangeMaxCelsius}°C`,
            humidityControlled: cs.humidityControlled,
            monthlyRatePerQuintal: cs.monthlyRentalPerQuintal,
            suitableCrops: cs.suitableCommodities || ['Potato', 'Fruits', 'Vegetables', 'Pulses'],
            contactPhone: cs.contactPhone,
            isWDRAApproved: cs.wdraAccredited,
            address: cs.addressLine
          }));
          setFacilities(mapped);
        }
      })
      .catch(err => console.warn('Cold storage fetch error:', err));
  }, []);

  const filteredFacilities = facilities.filter(f => {
    const matchesDist = !searchDistrict || 
      f.district.toLowerCase().includes(searchDistrict.toLowerCase()) || 
      f.state.toLowerCase().includes(searchDistrict.toLowerCase()) ||
      f.name.toLowerCase().includes(searchDistrict.toLowerCase());
    
    const matchesCrop = selectedCropFilter === 'all' || f.suitableCrops.some(c => c.toLowerCase().includes(selectedCropFilter.toLowerCase()));
    return matchesDist && matchesCrop;
  });

  const handleBookSpace = (facilityName: string) => {
    showToast(`Space reservation inquiry sent to ${facilityName}. Manager will call you within 2 hours.`, 'success');
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-cyan-950 via-emerald-950 to-stone-900 rounded-2xl p-6 sm:p-8 text-white shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-bold tracking-wide uppercase border border-cyan-500/30">
            <Warehouse className="w-3.5 h-3.5" />
            <span>MIDH & NABARD ACCREDITED WAREHOUSES</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-display">
            {language === 'hi' ? 'निकटतम कोल्ड स्टोरेज व गोदाम' : 'Nearby Cold Storage & Preservation Hubs'}
          </h1>
          <p className="text-stone-300 text-xs sm:text-sm leading-relaxed">
            Prevent distress sales by storing your harvest (Potato, Onion, Garlic, Fruits, Basmati Seed) in humidity-controlled multi-chamber chambers with WDRA electronic negotiable warehouse receipts (e-NWR).
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 sm:p-5 rounded-xl border border-stone-200 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input
            type="text"
            value={searchDistrict}
            onChange={e => setSearchDistrict(e.target.value)}
            placeholder="Search by district, state, or warehouse name (e.g. Sehore, Nashik, Agra)..."
            className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-stone-50 border border-stone-200 text-xs text-stone-900 focus:outline-hidden focus:ring-2 focus:ring-emerald-600 focus:bg-white transition-all"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={selectedCropFilter}
            onChange={e => setSelectedCropFilter(e.target.value)}
            className="px-3 py-2.5 bg-stone-50 border border-stone-200 rounded-lg text-xs font-semibold text-stone-700 w-full sm:w-auto"
          >
            <option value="all">All Crops Suitable</option>
            <option value="Potato">Potatoes & Tubers</option>
            <option value="Onion">Red Onions & Garlic</option>
            <option value="Basmati">Basmati Seeds & Grains</option>
            <option value="Spices">Spices & Turmeric</option>
          </select>
        </div>
      </div>

      {/* Facility Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {filteredFacilities.map(f => (
          <div 
            key={f.id}
            className="bg-white rounded-xl border border-stone-200 hover:border-emerald-500 shadow-xs hover:shadow-md transition-all p-5 flex flex-col justify-between space-y-4 text-xs"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                    {f.distanceKm} km from district center
                  </span>
                  <h3 className="text-base font-extrabold text-stone-900 font-display mt-1">
                    {f.name}
                  </h3>
                  <div className="flex items-center gap-1 text-stone-500 text-[11px] mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                    <span>{f.address}</span>
                  </div>
                </div>

                {f.verifiedGovtSubsidized && (
                  <span className="px-2 py-1 bg-cyan-50 text-cyan-800 rounded-md text-[10px] font-bold border border-cyan-200 shrink-0 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-cyan-600" />
                    WDRA Subsidy
                  </span>
                )}
              </div>

              {/* Temperature & Capacity Badges */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="p-2.5 bg-stone-50 rounded-lg border border-stone-200 space-y-0.5">
                  <div className="flex items-center gap-1 text-stone-400 text-[10px]">
                    <Thermometer className="w-3 h-3 text-cyan-600" />
                    <span>Controlled Atmosphere</span>
                  </div>
                  <strong className="text-stone-900 block text-[11px]">{f.temperatureRange}</strong>
                </div>

                <div className="p-2.5 bg-stone-50 rounded-lg border border-stone-200 space-y-0.5">
                  <div className="flex items-center gap-1 text-stone-400 text-[10px]">
                    <Layers className="w-3 h-3 text-emerald-600" />
                    <span>Available Capacity</span>
                  </div>
                  <strong className="text-emerald-700 block text-[11px] font-bold">
                    {f.availableCapacityMT} MT <span className="text-stone-400 font-normal">/ {f.totalCapacityMT} MT</span>
                  </strong>
                </div>
              </div>

              {/* Suitable Crops Tags */}
              <div className="space-y-1">
                <span className="text-stone-400 text-[10px] block">Crops Supported:</span>
                <div className="flex flex-wrap gap-1">
                  {f.suitableCrops.map((c, i) => (
                    <span key={i} className="px-2 py-0.5 bg-stone-100 text-stone-700 rounded text-[10px] font-medium">
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Row */}
            <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
              <div>
                <span className="text-stone-400 text-[10px] block">Storage Tariff:</span>
                <span className="text-base font-extrabold text-stone-900 font-display">
                  ₹{f.ratePerMonthPerQuintal}
                </span>
                <span className="text-stone-500 text-[10px]"> / Quintal / Month</span>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={`tel:${f.contactNumber}`}
                  className="p-2.5 border border-stone-200 text-stone-700 hover:bg-stone-50 rounded-lg"
                  title="Call manager"
                >
                  <Phone className="w-4 h-4" />
                </a>
                <button
                  onClick={() => handleBookSpace(f.name)}
                  className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg shadow-xs transition-colors flex items-center gap-1"
                >
                  <span>Book Space</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
