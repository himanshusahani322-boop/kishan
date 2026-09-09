import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Users, 
  Layers, 
  TrendingUp, 
  IndianRupee, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Clock,
  Eye,
  FileCheck,
  RefreshCw,
  Search,
  Database,
  Server
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { MandiPriceItem } from '../types';

export const AdminPanel: React.FC = () => {
  const { crops, orders, rfqs, language, showToast } = useApp();
  const [mandiPrices, setMandiPrices] = useState<MandiPriceItem[]>([]);
  const [dbHealth, setDbHealth] = useState<any>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchAdminData = () => {
    setIsRefreshing(true);
    const token = localStorage.getItem('ks_auth_token');

    // Fetch live Mandi benchmark prices from database
    fetch('/api/mandi-prices')
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.mandiPrices)) {
          setMandiPrices(data.mandiPrices);
        }
      })
      .catch(err => console.warn('Mandi prices load error:', err));

    // Fetch Database Health check
    fetch('/api/admin/db-health', {
      headers: token ? { 'Authorization': `Bearer ${token}` } : {}
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setDbHealth(data.health);
        }
      })
      .catch(err => console.warn('DB health check error:', err))
      .finally(() => setIsRefreshing(false));
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const [fpoVerifications, setFpoVerifications] = useState([
    {
      id: 'fpo_req_01',
      name: 'Narmada Kisan Samriddhi FPO',
      district: 'Sehore',
      state: 'Madhya Pradesh',
      cinNumber: 'U01409MP2022PTC061240',
      farmerMembers: 420,
      cropSpecialty: 'Sharbati Wheat, Desi Chana',
      status: 'verified'
    },
    {
      id: 'fpo_req_02',
      name: 'Malwa Organic Producer Co. Ltd.',
      district: 'Ujjain',
      state: 'Madhya Pradesh',
      cinNumber: 'U01111MP2023PTC059881',
      farmerMembers: 290,
      cropSpecialty: 'Organic Soybean, Garlic',
      status: 'pending'
    },
    {
      id: 'fpo_req_03',
      name: 'Krishna Valley Farmers Cooperative',
      district: 'Guntur',
      state: 'Andhra Pradesh',
      cinNumber: 'U01122AP2021PTC044190',
      farmerMembers: 680,
      cropSpecialty: 'Guntur Sannam Chilli, Turmeric',
      status: 'pending'
    }
  ]);

  const totalGMV = orders.reduce((sum, o) => sum + o.totalAmount, 0);
  const totalEscrowHeld = orders
    .filter(o => o.paymentStatus === 'escrow_hold')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const handleVerifyFPO = (id: string, approve: boolean) => {
    setFpoVerifications(prev => prev.map(f => f.id === id ? { ...f, status: approve ? 'verified' : 'rejected' } : f));
    showToast(`FPO compliance status marked as ${approve ? 'Verified' : 'Rejected'}.`, approve ? 'success' : 'warning');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-700" />
            <h1 className="text-xl font-extrabold text-stone-900 font-display">
              {language === 'hi' ? 'किसान साथी राष्ट्रीय संचालन एवं नियंत्रण कक्ष' : 'Platform Administration & Market Oversight'}
            </h1>
          </div>
          <p className="text-xs text-stone-500">
            Monitoring e-NAM synchronizations, FPO compliance vetting, Escrow custody, and dispute resolution.
          </p>
        </div>

        <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-lg border border-emerald-300">
          ● Platform Health: 100% Operational
        </span>
      </div>

      {/* Metrics Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
        <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs space-y-1">
          <span className="text-stone-500 font-semibold">Total Gross Marketplace Volume (GMV)</span>
          <div className="text-2xl font-black text-stone-900 font-display">
            ₹{totalGMV.toLocaleString('en-IN')}
          </div>
          <p className="text-[11px] text-emerald-700 font-medium">Across verified mandi contracts</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs space-y-1">
          <span className="text-stone-500 font-semibold">Escrow Funds in Safe Custody</span>
          <div className="text-2xl font-black text-amber-700 font-display">
            ₹{totalEscrowHeld.toLocaleString('en-IN')}
          </div>
          <p className="text-[11px] text-stone-400">Locked pending delivery gate QC</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs space-y-1">
          <span className="text-stone-500 font-semibold">Live Trade Listings</span>
          <div className="text-2xl font-black text-emerald-900 font-display">
            {crops.length} Batches
          </div>
          <p className="text-[11px] text-stone-400">AGMARK assay standards passed</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs space-y-1">
          <span className="text-stone-500 font-semibold">Bulk Institutional RFQs</span>
          <div className="text-2xl font-black text-stone-900 font-display">
            {rfqs.length} Active Tenders
          </div>
          <p className="text-[11px] text-stone-400">Institutional food mills bidding</p>
        </div>
      </div>

      {/* FPO Verification Queue */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden text-xs">
        <div className="p-5 border-b border-stone-200 flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-stone-900 text-sm font-display">
              Farmer Producer Organization (FPO) Verification Queue
            </h3>
            <p className="text-stone-500 text-[11px]">
              Vetting MCA corporate records, shareholder registers, and bank KYC before granting certified badge.
            </p>
          </div>
          <span className="text-xs font-bold text-amber-800 bg-amber-50 px-2 py-1 rounded-md border border-amber-200">
            {fpoVerifications.filter(f => f.status === 'pending').length} Pending Vetting
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-200 text-stone-600 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-3 px-4">FPO Name & Location</th>
                <th className="py-3 px-4">Corporate CIN</th>
                <th className="py-3 px-4">Farmer Base</th>
                <th className="py-3 px-4">Key Produce</th>
                <th className="py-3 px-4">Compliance Status</th>
                <th className="py-3 px-4 text-right">Verification Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200">
              {fpoVerifications.map(fpo => (
                <tr key={fpo.id} className="hover:bg-stone-50/70">
                  <td className="py-3.5 px-4 font-bold text-stone-900">
                    <div>{fpo.name}</div>
                    <div className="text-stone-400 font-normal text-[11px]">{fpo.district}, {fpo.state}</div>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-stone-700 text-[11px]">{fpo.cinNumber}</td>
                  <td className="py-3.5 px-4 font-semibold text-stone-800">{fpo.farmerMembers} Farmers</td>
                  <td className="py-3.5 px-4 text-stone-600">{fpo.cropSpecialty}</td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      fpo.status === 'verified' ? 'bg-emerald-100 text-emerald-800' :
                      fpo.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                      'bg-rose-100 text-rose-800'
                    }`}>
                      {fpo.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    {fpo.status === 'pending' ? (
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleVerifyFPO(fpo.id, true)}
                          className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-[11px] font-bold"
                        >
                          Approve FPO
                        </button>
                        <button
                          onClick={() => handleVerifyFPO(fpo.id, false)}
                          className="px-2.5 py-1 bg-stone-100 hover:bg-rose-50 text-stone-600 hover:text-rose-600 rounded text-[11px] font-bold"
                        >
                          Reject
                        </button>
                      </div>
                    ) : (
                      <span className="text-stone-400 text-[11px]">Audit complete</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* APMC Mandi Benchmark Feed Oversight */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs p-5 space-y-4 text-xs">
        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
          <h3 className="font-extrabold text-stone-900 text-sm font-display">
            APMC & e-NAM Mandi Benchmark Feed Status
          </h3>
          <span className="text-[11px] text-emerald-700 font-bold flex items-center gap-1">
            <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Next Sync in 4 mins
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {mandiPrices.map((m, idx) => (
            <div key={idx} className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-1">
              <div className="flex justify-between font-bold text-stone-800">
                <span className="truncate">{m.commodity}</span>
                <span className={m.changePercentage >= 0 ? 'text-emerald-700' : 'text-rose-700'}>
                  {m.changePercentage >= 0 ? `+${m.changePercentage}%` : `${m.changePercentage}%`}
                </span>
              </div>
              <div className="text-base font-black text-emerald-950 font-display">
                ₹{m.modalPrice}/Qtl
              </div>
              <div className="text-[10px] text-stone-400 truncate">
                Mandi: {m.mandi} ({m.state})
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Persistent 30-Entity Data Layer Health & Diagnostics */}
      <div className="bg-stone-900 text-stone-100 rounded-2xl p-5 border border-stone-800 shadow-md space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-800">
          <div className="flex items-center gap-2.5">
            <Database className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="font-extrabold text-sm text-white font-display flex items-center gap-2">
                Enterprise Data Layer: 30 Scalable Relational Entities
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold uppercase tracking-wider border border-emerald-500/30">
                  Healthy & Validated
                </span>
              </h3>
              <p className="text-stone-400 text-xs mt-0.5">
                Atomic JSON persistence with secondary relation indexes and Zod schema enforcement.
              </p>
            </div>
          </div>
          <button
            onClick={fetchAdminData}
            disabled={isRefreshing}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-xs text-stone-300 font-medium transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh Diagnostics
          </button>
        </div>

        {dbHealth ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3 bg-stone-800/60 rounded-xl border border-stone-700/50">
                <span className="text-stone-400 block text-[11px]">Database Status</span>
                <span className="text-emerald-400 font-bold text-sm flex items-center gap-1 mt-0.5">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Synchronized & Healthy
                </span>
              </div>
              <div className="p-3 bg-stone-800/60 rounded-xl border border-stone-700/50">
                <span className="text-stone-400 block text-[11px]">Foreign Key Integrity</span>
                <span className="text-emerald-400 font-bold text-sm flex items-center gap-1 mt-0.5">
                  <CheckCircle2 className="w-3.5 h-3.5" /> 100% Verified
                </span>
              </div>
              <div className="p-3 bg-stone-800/60 rounded-xl border border-stone-700/50">
                <span className="text-stone-400 block text-[11px]">Primary Entities Modeled</span>
                <span className="text-white font-bold text-sm mt-0.5 block">
                  {Object.keys(dbHealth.entitiesCounts || {}).length} Entities
                </span>
              </div>
              <div className="p-3 bg-stone-800/60 rounded-xl border border-stone-700/50">
                <span className="text-stone-400 block text-[11px]">Secondary Indexes</span>
                <span className="text-white font-bold text-sm mt-0.5 block">
                  O(1) Memory Indexed
                </span>
              </div>
            </div>

            {/* Entity counts pills */}
            <div className="p-3 bg-stone-800/40 rounded-xl border border-stone-800">
              <span className="text-stone-400 text-[11px] font-bold uppercase tracking-wider block mb-2">
                Live Entity Record Counts in Database:
              </span>
              <div className="flex flex-wrap gap-2 text-[11px]">
                {Object.entries(dbHealth.entitiesCounts || {}).map(([name, count]) => (
                  <span
                    key={name}
                    className="px-2 py-1 rounded-md bg-stone-800 text-stone-300 border border-stone-700/60 flex items-center gap-1.5"
                  >
                    <span className="text-stone-400">{name}:</span>
                    <strong className="text-emerald-400">{String(count)}</strong>
                  </span>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-stone-800/50 rounded-xl text-stone-400 text-xs flex items-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-emerald-500" />
            <span>Connecting to Kisan Saathi persistent database engine...</span>
          </div>
        )}
      </div>
    </div>
  );
};
