import React, { useState } from 'react';
import { 
  PlusCircle, 
  Layers, 
  TrendingUp, 
  IndianRupee, 
  PackageCheck, 
  Edit3, 
  Trash2, 
  Eye, 
  Sparkles, 
  AlertCircle, 
  CheckCircle2, 
  MapPin, 
  Building2, 
  Truck,
  Upload,
  Calendar,
  X
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CropCategory, CropListing, QualityGrade } from '../types';

export const FarmerDashboard: React.FC = () => {
  const { 
    currentUser, 
    crops, 
    addCrop, 
    updateCrop, 
    deleteCrop, 
    orders, 
    updateOrderStatus,
    language 
  } = useApp();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCrop, setEditingCrop] = useState<CropListing | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [hindiTitle, setHindiTitle] = useState('');
  const [category, setCategory] = useState<CropCategory>('Grains & Cereals');
  const [variety, setVariety] = useState('');
  const [grade, setGrade] = useState<QualityGrade>('Grade A (Premium)');
  const [moisture, setMoisture] = useState<number>(10.5);
  const [quantity, setQuantity] = useState<number>(100);
  const [minOrder, setMinOrder] = useState<number>(10);
  const [price, setPrice] = useState<number>(3800);
  const [mandiBenchmark, setMandiBenchmark] = useState<number>(3650);
  const [isOrganic, setIsOrganic] = useState(false);
  const [harvestDate, setHarvestDate] = useState('2026-03-25');
  const [packaging, setPackaging] = useState('50kg HDPE laminated gunny bags');
  const [description, setDescription] = useState('');
  const [district, setDistrict] = useState(currentUser.location.district);
  const [state, setState] = useState(currentUser.location.state);
  const [nearestMandi, setNearestMandi] = useState(`${currentUser.location.district} APMC Yard`);
  const [imageUrl, setImageUrl] = useState('https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=800&auto=format&fit=crop&q=80');

  // Filter crops belonging to this farmer
  const myCrops = crops.filter(c => c.sellerId === currentUser.id || c.sellerName.includes(currentUser.name));
  const myOrders = orders.filter(o => o.sellerId === currentUser.id || o.sellerName.includes(currentUser.name));

  const totalQuintalsStock = myCrops.reduce((acc, c) => acc + c.quantityAvailable, 0);
  const estimatedInventoryValue = myCrops.reduce((acc, c) => acc + (c.quantityAvailable * c.pricePerQuintal), 0);
  const escrowPendingRelease = myOrders
    .filter(o => o.paymentStatus === 'escrow_hold')
    .reduce((acc, o) => acc + o.totalAmount, 0);

  const resetForm = () => {
    setTitle('');
    setHindiTitle('');
    setCategory('Grains & Cereals');
    setVariety('');
    setGrade('Grade A (Premium)');
    setMoisture(10.5);
    setQuantity(100);
    setMinOrder(10);
    setPrice(3800);
    setMandiBenchmark(3650);
    setIsOrganic(false);
    setPackaging('50kg HDPE laminated gunny bags');
    setDescription('');
    setEditingCrop(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingCrop) {
      updateCrop(editingCrop.id, {
        title,
        hindiTitle: hindiTitle || title,
        category,
        variety,
        grade,
        moisturePercentage: moisture,
        quantityAvailable: quantity,
        minOrderQuantity: minOrder,
        pricePerQuintal: price,
        mandiBenchmarkPrice: mandiBenchmark,
        isOrganicCertified: isOrganic,
        harvestDate,
        packagingType: packaging,
        description,
        imageUrl
      });
    } else {
      addCrop({
        title,
        hindiTitle: hindiTitle || title,
        category,
        variety,
        grade,
        moisturePercentage: moisture,
        quantityAvailable: quantity,
        minOrderQuantity: minOrder,
        pricePerQuintal: price,
        mandiBenchmarkPrice: mandiBenchmark,
        isOrganicCertified: isOrganic,
        harvestDate,
        packagingType: packaging,
        description: description || 'Fresh harvest direct from verified farm with e-NAM standard quality assay.',
        sellerType: currentUser.isVerifiedFPO ? 'FPO (Farmer Producer Org)' : 'Progressive Grower',
        location: {
          district,
          state,
          nearestMandi
        },
        imageUrl,
        images: [imageUrl],
        shelfLifeDays: 180,
        status: 'active'
      });
    }
    setIsAddModalOpen(false);
    resetForm();
  };

  const handleEditClick = (crop: CropListing) => {
    setEditingCrop(crop);
    setTitle(crop.title);
    setHindiTitle(crop.hindiTitle);
    setCategory(crop.category);
    setVariety(crop.variety);
    setGrade(crop.grade);
    setMoisture(crop.moisturePercentage);
    setQuantity(crop.quantityAvailable);
    setMinOrder(crop.minOrderQuantity);
    setPrice(crop.pricePerQuintal);
    setMandiBenchmark(crop.mandiBenchmarkPrice);
    setIsOrganic(crop.isOrganicCertified);
    setHarvestDate(crop.harvestDate);
    setPackaging(crop.packagingType);
    setDescription(crop.description);
    setImageUrl(crop.imageUrl);
    setIsAddModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Seller Header Profile Card */}
      <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="relative">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              referrerPolicy="no-referrer"
              className="w-16 h-16 rounded-full object-cover border-2 border-emerald-600 shadow-sm"
            />
            <span className="absolute bottom-0 right-0 w-5 h-5 bg-emerald-600 text-white rounded-full flex items-center justify-center text-xs">
              🌾
            </span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold text-stone-900 font-display">
                {currentUser.name}
              </h1>
              {currentUser.isVerifiedFPO && (
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold flex items-center gap-1 border border-emerald-300">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  Verified FPO: {currentUser.fpoName}
                </span>
              )}
            </div>
            <p className="text-xs text-stone-500 font-medium mt-0.5">
              {currentUser.location.villageOrCity}, {currentUser.location.district}, {currentUser.location.state} • Mandi Code: APMC-{currentUser.location.pincode}
            </p>
            <div className="flex items-center gap-3 text-xs text-stone-600 mt-2">
              <span>Rating: <strong className="text-amber-600">★ {currentUser.rating}</strong> ({currentUser.totalRatingsCount} verified mandi trades)</span>
              <span>•</span>
              <span className="text-emerald-700 font-semibold">Direct Bank Payout Active (e-NACH Verified)</span>
            </div>
          </div>
        </div>

        <button
          onClick={() => {
            resetForm();
            setIsAddModalOpen(true);
          }}
          className="w-full md:w-auto px-5 py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-sm rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all"
          id="btn-add-crop-listing"
        >
          <PlusCircle className="w-5 h-5 text-emerald-200" />
          <span>+ List New Harvest / फसल जोड़ें</span>
        </button>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-stone-500 text-xs font-semibold">
            <span>My Active Listings</span>
            <Layers className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-stone-900 font-display">
            {myCrops.length} Crops
          </div>
          <p className="text-[11px] text-stone-400">Live across all APMC wholesale buyers</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-stone-500 text-xs font-semibold">
            <span>Aggregated Stock Available</span>
            <PackageCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-900 font-display">
            {totalQuintalsStock.toLocaleString('en-IN')} Qtl
          </div>
          <p className="text-[11px] text-stone-400">Approx. {(totalQuintalsStock / 10).toFixed(1)} Metric Tonnes</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-stone-500 text-xs font-semibold">
            <span>Active Escrow in Transit</span>
            <IndianRupee className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-amber-700 font-display">
            ₹{escrowPendingRelease.toLocaleString('en-IN')}
          </div>
          <p className="text-[11px] text-stone-400">Locked safely; auto-releases upon delivery</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-stone-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-stone-500 text-xs font-semibold">
            <span>Inventory Realizable Value</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-stone-900 font-display">
            ₹{estimatedInventoryValue.toLocaleString('en-IN')}
          </div>
          <p className="text-[11px] text-stone-400">Based on your listed farm gate prices</p>
        </div>
      </div>

      {/* Main Tabs: My Listings & Pending Dispatches */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-stone-200 flex items-center justify-between">
          <div>
            <h2 className="text-base font-extrabold text-stone-900 font-display">
              {language === 'hi' ? 'मेरी फसल सूची व भंडार (Crop Inventory)' : 'My Crop Listings & Inventory Management'}
            </h2>
            <p className="text-xs text-stone-500">
              Update quantities, adjust rates in accordance with daily mandi movements, or withdraw lots
            </p>
          </div>
          <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
            {myCrops.length} Active Lots
          </span>
        </div>

        {myCrops.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <PackageCheck className="w-12 h-12 text-stone-300 mx-auto" />
            <h3 className="text-sm font-bold text-stone-800">You haven't listed any crops yet</h3>
            <p className="text-xs text-stone-500 max-w-sm mx-auto">
              Post your harvest with moisture test and price to connect with thousands of institutional food processors and mills.
            </p>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2 bg-emerald-700 text-white rounded-lg text-xs font-bold hover:bg-emerald-800"
            >
              List First Harvest Now
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-stone-50 border-b border-stone-200 text-stone-600 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3.5 px-4">Crop & Variety</th>
                  <th className="py-3.5 px-4">Grade & Moisture</th>
                  <th className="py-3.5 px-4">Stock Available</th>
                  <th className="py-3.5 px-4">My Price / Qtl</th>
                  <th className="py-3.5 px-4">Mandi Benchmark</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200">
                {myCrops.map(crop => (
                  <tr key={crop.id} className="hover:bg-stone-50/70 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={crop.imageUrl}
                          alt={crop.title}
                          referrerPolicy="no-referrer"
                          className="w-12 h-12 rounded-lg object-cover border border-stone-200"
                        />
                        <div>
                          <div className="font-bold text-stone-900 text-sm">{crop.title}</div>
                          <div className="text-stone-500 text-[11px]">{crop.hindiTitle} • {crop.variety}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-stone-800">{crop.grade}</div>
                      <div className="text-stone-500 text-[11px]">{crop.moisturePercentage}% moisture</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-emerald-800 text-sm">{crop.quantityAvailable} Quintals</div>
                      <div className="text-stone-400 text-[11px]">Min order: {crop.minOrderQuantity} Qtl</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-extrabold text-stone-900 text-sm">
                        ₹{crop.pricePerQuintal.toLocaleString('en-IN')}
                      </div>
                      <div className="text-stone-400 text-[10px]">Farm gate</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-stone-700">
                        ₹{crop.mandiBenchmarkPrice.toLocaleString('en-IN')}
                      </div>
                      <div className="text-emerald-700 text-[10px]">
                        {crop.pricePerQuintal <= crop.mandiBenchmarkPrice ? 'Competitive' : 'Premium'}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                        ● Active Listing
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleEditClick(crop)}
                          className="p-1.5 rounded-md hover:bg-stone-200 text-stone-600"
                          title="Edit Crop"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteCrop(crop.id)}
                          className="p-1.5 rounded-md hover:bg-rose-100 text-rose-600"
                          title="Delete Listing"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Orders To Fulfill / Dispatch Orders */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-extrabold text-stone-900 font-display">
              Orders Requiring Dispatch & Logistics Action
            </h2>
            <p className="text-xs text-stone-500">
              Buyer funds are secured in Kisan Saathi Escrow. Proceed with mandi weighbridge and truck assignment.
            </p>
          </div>
        </div>

        {myOrders.length === 0 ? (
          <p className="text-xs text-stone-500 py-4 text-center">No pending orders for your account at this moment.</p>
        ) : (
          <div className="space-y-3">
            {myOrders.map(order => (
              <div 
                key={order.id}
                className="p-4 rounded-xl border border-stone-200 hover:border-emerald-500 transition-colors bg-stone-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-stone-900">Order #{order.id}</span>
                    <span className="text-xs font-semibold px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full border border-amber-300">
                      Status: {order.orderStatus.toUpperCase()}
                    </span>
                    <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                      Escrow Paid: ₹{order.totalAmount.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="text-xs text-stone-600 font-medium">
                    Produce: <strong>{order.cropTitle}</strong> • Quantity: <strong>{order.quantityQuintals} Qtl</strong>
                  </div>
                  <div className="text-xs text-stone-500 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-stone-400" />
                    Ship to: {order.deliveryAddress.city}, {order.deliveryAddress.state} ({order.buyerName})
                  </div>
                </div>

                {/* Farmer Quick Action Controls */}
                <div className="flex items-center gap-2 shrink-0">
                  {order.orderStatus === 'confirmed' && (
                    <button
                      onClick={() => updateOrderStatus(order.id, 'aggregated_at_mandi', 'Loaded at APMC Mandi Weighbridge')}
                      className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold transition-colors"
                    >
                      Confirm Weighment & Bagging
                    </button>
                  )}
                  {order.orderStatus === 'aggregated_at_mandi' && (
                    <button
                      onClick={() => updateOrderStatus(order.id, 'dispatched', 'Dispatched on Truck with GPS seal')}
                      className="px-3 py-1.5 bg-indigo-700 hover:bg-indigo-800 text-white rounded-lg text-xs font-bold transition-colors"
                    >
                      Mark Dispatched on Truck
                    </button>
                  )}
                  <span className="text-[11px] text-stone-400 font-medium">
                    Tracking: {order.trackingId}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add / Edit Crop Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-stone-200 p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <h3 className="text-lg font-extrabold text-stone-900 font-display">
                {editingCrop ? 'Edit Crop Listing' : 'List New Harvest / नई फसल दर्ज करें'}
              </h3>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-lg text-stone-400 hover:bg-stone-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Crop Title (English):</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sharbati Wheat Premium"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-lg text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Hindi Title (हिंदी नाम):</label>
                  <input
                    type="text"
                    placeholder="उदा. शरबती गेहूं प्रीमियम"
                    value={hindiTitle}
                    onChange={e => setHindiTitle(e.target.value)}
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-lg text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Category:</label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value as CropCategory)}
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-lg text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                  >
                    <option value="Grains & Cereals">Grains & Cereals</option>
                    <option value="Pulses (Dal)">Pulses (Dal)</option>
                    <option value="Vegetables">Vegetables</option>
                    <option value="Spices">Spices</option>
                    <option value="Oilseeds">Oilseeds</option>
                    <option value="Fruits">Fruits</option>
                    <option value="Cash Crops">Cash Crops</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Variety:</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. C-306, 1121, JG-11"
                    value={variety}
                    onChange={e => setVariety(e.target.value)}
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-lg text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Quality Grade:</label>
                  <select
                    value={grade}
                    onChange={e => setGrade(e.target.value as QualityGrade)}
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-lg text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                  >
                    <option value="Grade A+ (Export)">Grade A+ (Export)</option>
                    <option value="Grade A (Premium)">Grade A (Premium)</option>
                    <option value="Grade B (Standard)">Grade B (Standard)</option>
                    <option value="Grade C (Fair)">Grade C (Fair)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Moisture (%):</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={moisture}
                    onChange={e => setMoisture(Number(e.target.value))}
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-lg text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Stock (Quintals):</label>
                  <input
                    type="number"
                    required
                    value={quantity}
                    onChange={e => setQuantity(Number(e.target.value))}
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-lg text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Min Order (Qtl):</label>
                  <input
                    type="number"
                    required
                    value={minOrder}
                    onChange={e => setMinOrder(Number(e.target.value))}
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-lg text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Price (₹/Qtl):</label>
                  <input
                    type="number"
                    required
                    value={price}
                    onChange={e => setPrice(Number(e.target.value))}
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-lg text-xs font-bold text-emerald-800 focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Mandi Benchmark (₹/Qtl):</label>
                  <input
                    type="number"
                    value={mandiBenchmark}
                    onChange={e => setMandiBenchmark(Number(e.target.value))}
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-lg text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Harvest Date:</label>
                  <input
                    type="date"
                    value={harvestDate}
                    onChange={e => setHarvestDate(e.target.value)}
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-lg text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Packaging Specification:</label>
                <input
                  type="text"
                  value={packaging}
                  onChange={e => setPackaging(e.target.value)}
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-lg text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Produce Description / Assay Highlights:</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Describe your soil, harvest freshness, lab test details..."
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-lg text-xs focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                />
              </div>

              <div className="flex items-center gap-2 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                <input
                  type="checkbox"
                  id="organicCheck"
                  checked={isOrganic}
                  onChange={e => setIsOrganic(e.target.checked)}
                  className="w-4 h-4 accent-emerald-700"
                />
                <label htmlFor="organicCheck" className="font-semibold text-emerald-900 cursor-pointer">
                  NPOP / PGS-India Certified Organic Produce
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-stone-300 rounded-lg font-bold text-stone-700 hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg shadow-sm"
                >
                  {editingCrop ? 'Save Changes' : 'Publish Listing'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
