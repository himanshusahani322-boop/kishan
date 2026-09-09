import React, { useState } from 'react';
import { 
  FileText, 
  Plus, 
  Send, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Building2, 
  MapPin, 
  Calendar, 
  ShieldCheck, 
  IndianRupee, 
  Scale, 
  AlertCircle,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  X
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CropCategory, RFQOffer, RFQRequirement } from '../types';

export const RFQNegotiationView: React.FC = () => {
  const { 
    currentUser, 
    currentRole, 
    rfqs, 
    createRFQ, 
    rfqOffers, 
    submitRFQOffer, 
    respondToOffer, 
    createOrderFromCart, 
    crops,
    language 
  } = useApp();

  const [isCreateRFQModalOpen, setIsCreateRFQModalOpen] = useState(false);
  const [selectedRFQForOffer, setSelectedRFQForOffer] = useState<RFQRequirement | null>(null);
  const [expandedRFQId, setExpandedRFQId] = useState<string | null>(rfqs[0]?.id || null);

  // New RFQ Form
  const [cropCategory, setCropCategory] = useState<CropCategory>('Grains & Cereals');
  const [cropName, setCropName] = useState('');
  const [varietyPreferred, setVarietyPreferred] = useState('');
  const [targetQuantity, setTargetQuantity] = useState<number>(200);
  const [targetPrice, setTargetPrice] = useState<number>(3700);
  const [deliveryLocation, setDeliveryLocation] = useState('Azadpur Wholesale Mandi Hub, Delhi');
  const [deadlineDate, setDeadlineDate] = useState('2026-04-20');
  const [specifications, setSpecifications] = useState('');

  // Submit Offer Form
  const [offerPrice, setOfferPrice] = useState<number>(3800);
  const [offerQuantity, setOfferQuantity] = useState<number>(150);
  const [deliveryDays, setDeliveryDays] = useState<number>(5);
  const [sampleAvailable, setSampleAvailable] = useState(true);
  const [offerNotes, setOfferNotes] = useState('');

  // Counter offer state
  const [counterPriceInput, setCounterPriceInput] = useState<{ [offerId: string]: number }>({});
  const [counterNotesInput, setCounterNotesInput] = useState<{ [offerId: string]: string }>({});

  const handleCreateRFQ = (e: React.FormEvent) => {
    e.preventDefault();
    createRFQ({
      buyerOrg: currentUser.role === 'buyer' ? 'Wholesale Agri Procurement Ltd' : `${currentUser.name} Buyer Account`,
      cropCategory,
      cropName,
      varietyPreferred,
      targetQuantityQuintals: targetQuantity,
      targetPricePerQuintal: targetPrice,
      deliveryLocation,
      deadlineDate,
      specifications: specifications || 'Quality grading required as per AGMARK standards. Digital weighbridge slips mandatory.'
    });
    setIsCreateRFQModalOpen(false);
    setCropName('');
    setVarietyPreferred('');
    setSpecifications('');
  };

  const handleOfferSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRFQForOffer) return;

    submitRFQOffer({
      rfqId: selectedRFQForOffer.id,
      offeredPricePerQuintal: offerPrice,
      offeredQuantityQuintals: offerQuantity,
      deliveryTimelineDays: deliveryDays,
      sampleAvailable,
      notes: offerNotes || 'Lab tested assay report ready for dispatch from our FPO warehouse.'
    });

    setSelectedRFQForOffer(null);
    setOfferNotes('');
  };

  const handleAcceptAndConvertOrder = async (rfq: RFQRequirement, offer: RFQOffer) => {
    // Convert negotiated offer directly to an Escrow order
    const matchedCrop = crops.find(c => c.category === rfq.cropCategory) || crops[0];
    
    await createOrderFromCart({
      crop: {
        ...matchedCrop,
        title: `${rfq.cropName} (${rfq.varietyPreferred || 'Negotiated RFQ Lot'})`,
        pricePerQuintal: offer.counterPrice || offer.offeredPricePerQuintal,
        sellerId: offer.farmerId,
        sellerName: offer.farmerName,
        sellerPhone: '+91 98260 44123'
      },
      quantityQuintals: offer.offeredQuantityQuintals,
      paymentMethod: 'Escrow Agropay',
      deliveryAddress: {
        addressLine: rfq.deliveryLocation,
        city: 'Delhi',
        district: 'North West Delhi',
        state: 'Delhi',
        pincode: '110033'
      }
    });

    respondToOffer(offer.id, 'accept');
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-stone-900 via-emerald-950 to-stone-900 rounded-2xl p-6 sm:p-8 text-white shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold tracking-wide uppercase border border-amber-500/30">
            <Scale className="w-3.5 h-3.5" />
            <span>INSTITUTIONAL PROCUREMENT & CONTRACTS</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-display">
            {language === 'hi' ? 'थोक मांग व किसान बोली (Bulk RFQ Bidding)' : 'Bulk Crop Procurement & RFQ Bidding'}
          </h1>
          <p className="text-stone-300 text-xs sm:text-sm leading-relaxed">
            Wholesale buyers post requirement tenders (100–5000+ Quintals); FPOs and individual growers submit transparent bids with moisture assay and counter-negotiations.
          </p>
        </div>

        {currentRole === 'buyer' && (
          <button
            onClick={() => setIsCreateRFQModalOpen(true)}
            className="px-5 py-3 bg-amber-500 hover:bg-amber-600 text-emerald-950 font-black text-sm rounded-xl flex items-center gap-2 transition-all shadow-md shrink-0 cursor-pointer"
            id="btn-post-rfq"
          >
            <Plus className="w-5 h-5" />
            <span>+ Post Bulk Procurement RFQ</span>
          </button>
        )}
      </div>

      {/* RFQ List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-extrabold text-stone-900 font-display">
            Active Tender Inquiries ({rfqs.length})
          </h2>
          <span className="text-xs text-stone-500">
            Click on any requirement to inspect farmer offers and live negotiations
          </span>
        </div>

        <div className="space-y-4">
          {rfqs.map(rfq => {
            const isExpanded = expandedRFQId === rfq.id;
            const offers = rfqOffers.filter(o => o.rfqId === rfq.id);
            const myOffer = offers.find(o => o.farmerId === currentUser.id);

            return (
              <div 
                key={rfq.id}
                className="bg-white rounded-xl border border-stone-200 shadow-xs overflow-hidden transition-all"
              >
                {/* RFQ Summary Card Header */}
                <div 
                  onClick={() => setExpandedRFQId(isExpanded ? null : rfq.id)}
                  className="p-5 cursor-pointer hover:bg-stone-50/70 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4 select-none"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                        {rfq.cropCategory}
                      </span>
                      <span className="text-xs font-semibold text-stone-400">Tender #{rfq.id}</span>
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800">
                        {offers.length} Farmer Offers
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-stone-900">
                      {rfq.cropName} {rfq.varietyPreferred ? `(${rfq.varietyPreferred})` : ''}
                    </h3>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-stone-600 pt-1">
                      <div>
                        <span className="text-stone-400 block text-[10px]">Target Quantity</span>
                        <strong className="text-stone-900 font-bold">{rfq.targetQuantityQuintals} Qtl</strong>
                      </div>
                      <div>
                        <span className="text-stone-400 block text-[10px]">Buyer's Target Rate</span>
                        <strong className="text-emerald-700 font-bold">₹{rfq.targetPricePerQuintal}/Qtl</strong>
                      </div>
                      <div>
                        <span className="text-stone-400 block text-[10px]">Delivery Destination</span>
                        <strong className="text-stone-900 truncate block">{rfq.deliveryLocation}</strong>
                      </div>
                      <div>
                        <span className="text-stone-400 block text-[10px]">Valid Until</span>
                        <strong className="text-stone-900">{rfq.deadlineDate}</strong>
                      </div>
                    </div>
                  </div>

                  {/* Right side controls */}
                  <div className="flex items-center gap-3 shrink-0">
                    {currentRole === 'farmer' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedRFQForOffer(rfq);
                          setOfferPrice(rfq.targetPricePerQuintal + 50);
                          setOfferQuantity(Math.min(rfq.targetQuantityQuintals, 200));
                        }}
                        className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold transition-colors shadow-xs"
                      >
                        {myOffer ? 'Update My Bid' : 'Submit Farmer Bid'}
                      </button>
                    )}

                    <div className="p-2 text-stone-400 hover:text-stone-600 rounded-lg">
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </div>
                  </div>
                </div>

                {/* Expanded Section: Specifications & Offers */}
                {isExpanded && (
                  <div className="border-t border-stone-200 bg-stone-50/50 p-5 space-y-4">
                    {/* Buyer Specs Note */}
                    <div className="p-3 bg-white rounded-lg border border-stone-200 text-xs space-y-1">
                      <span className="font-bold text-stone-800 block">Buyer Specifications & Terms:</span>
                      <p className="text-stone-600 leading-relaxed">{rfq.specifications}</p>
                      <div className="text-[11px] text-stone-400 pt-1">
                        Posted by: <strong className="text-stone-700">{rfq.buyerOrg}</strong> ({rfq.buyerName})
                      </div>
                    </div>

                    {/* Offers Header */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-extrabold text-stone-800 uppercase tracking-wider flex items-center justify-between">
                        <span>Submitted Farmer / FPO Bids ({offers.length}):</span>
                        <span className="text-stone-400 font-normal">Direct negotiation without broker interference</span>
                      </h4>

                      {offers.length === 0 ? (
                        <p className="text-xs text-stone-400 italic py-2">No bids submitted for this tender yet.</p>
                      ) : (
                        <div className="space-y-3">
                          {offers.map(offer => (
                            <div 
                              key={offer.id}
                              className="bg-white rounded-xl p-4 border border-stone-200 shadow-xs space-y-3 text-xs"
                            >
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                <div className="space-y-0.5">
                                  <div className="flex items-center gap-2">
                                    <strong className="text-stone-900 font-bold text-sm">{offer.farmerName}</strong>
                                    <span className="text-stone-400 text-[11px]">({offer.farmerLocation})</span>
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                      offer.status === 'accepted' ? 'bg-emerald-100 text-emerald-800' :
                                      offer.status === 'countered' ? 'bg-amber-100 text-amber-800' :
                                      offer.status === 'rejected' ? 'bg-rose-100 text-rose-800' :
                                      'bg-stone-100 text-stone-700'
                                    }`}>
                                      {offer.status.toUpperCase()}
                                    </span>
                                  </div>
                                  <p className="text-stone-600 text-[11px]">{offer.notes}</p>
                                </div>

                                <div className="text-right">
                                  <div className="text-base font-extrabold text-emerald-950 font-display">
                                    ₹{offer.offeredPricePerQuintal}/Qtl
                                  </div>
                                  <div className="text-[11px] text-stone-500 font-medium">
                                    Lot: <strong>{offer.offeredQuantityQuintals} Qtl</strong> • In {offer.deliveryTimelineDays} Days
                                  </div>
                                </div>
                              </div>

                              {/* Counter Offer Info if present */}
                              {offer.status === 'countered' && (
                                <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-xs space-y-1">
                                  <div className="font-bold text-amber-900">
                                    Buyer Counter-Offer: ₹{offer.counterPrice}/Qtl
                                  </div>
                                  {offer.counterNotes && (
                                    <p className="text-amber-800 text-[11px]">{offer.counterNotes}</p>
                                  )}
                                </div>
                              )}

                              {/* Actions for Buyer (Accept / Counter / Reject) */}
                              {currentRole === 'buyer' && offer.status !== 'accepted' && offer.status !== 'rejected' && (
                                <div className="pt-2 border-t border-stone-100 flex flex-wrap items-center gap-2 justify-end">
                                  {/* Counter Inputs */}
                                  <div className="flex items-center gap-2">
                                    <input
                                      type="number"
                                      placeholder="Counter ₹/Qtl"
                                      value={counterPriceInput[offer.id] || ''}
                                      onChange={(e) => setCounterPriceInput({ ...counterPriceInput, [offer.id]: Number(e.target.value) })}
                                      className="w-28 p-1.5 bg-stone-50 border border-stone-300 rounded text-xs"
                                    />
                                    <button
                                      onClick={() => {
                                        const cp = counterPriceInput[offer.id];
                                        if (cp) {
                                          respondToOffer(offer.id, 'counter', cp, 'We are ready to close at this rate today with instant Escrow lock.');
                                        }
                                      }}
                                      className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded text-xs"
                                    >
                                      Send Counter
                                    </button>
                                  </div>

                                  <button
                                    onClick={() => handleAcceptAndConvertOrder(rfq, offer)}
                                    className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded text-xs flex items-center gap-1"
                                  >
                                    <CheckCircle2 className="w-3.5 h-3.5" />
                                    <span>Accept & Book Escrow</span>
                                  </button>

                                  <button
                                    onClick={() => respondToOffer(offer.id, 'reject')}
                                    className="px-2.5 py-1.5 text-stone-500 hover:text-rose-600 text-xs font-semibold"
                                  >
                                    Decline
                                  </button>
                                </div>
                              )}

                              {/* Actions for Farmer when countered */}
                              {currentRole === 'farmer' && offer.farmerId === currentUser.id && offer.status === 'countered' && (
                                <div className="pt-2 border-t border-stone-100 flex items-center justify-end gap-2">
                                  <button
                                    onClick={() => respondToOffer(offer.id, 'accept')}
                                    className="px-3 py-1.5 bg-emerald-700 text-white font-bold rounded text-xs"
                                  >
                                    Accept Buyer's Counter (₹{offer.counterPrice}/Qtl)
                                  </button>
                                  <button
                                    onClick={() => respondToOffer(offer.id, 'reject')}
                                    className="px-3 py-1.5 border border-stone-300 text-stone-700 rounded text-xs"
                                  >
                                    Decline Counter
                                  </button>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Post RFQ Modal */}
      {isCreateRFQModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-stone-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <h3 className="text-lg font-extrabold text-stone-900 font-display">
                Post Bulk Procurement Tender (RFQ)
              </h3>
              <button 
                onClick={() => setIsCreateRFQModalOpen(false)}
                className="text-stone-400 hover:text-stone-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRFQ} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Crop Category:</label>
                  <select
                    value={cropCategory}
                    onChange={e => setCropCategory(e.target.value as CropCategory)}
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-lg"
                  >
                    <option value="Grains & Cereals">Grains & Cereals</option>
                    <option value="Pulses (Dal)">Pulses (Dal)</option>
                    <option value="Vegetables">Vegetables</option>
                    <option value="Spices">Spices</option>
                    <option value="Oilseeds">Oilseeds</option>
                    <option value="Cash Crops">Cash Crops</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Crop Name:</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sharbati Wheat"
                    value={cropName}
                    onChange={e => setCropName(e.target.value)}
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Target Qtl:</label>
                  <input
                    type="number"
                    required
                    value={targetQuantity}
                    onChange={e => setTargetQuantity(Number(e.target.value))}
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-lg font-bold"
                  />
                </div>
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Target Rate (₹/Qtl):</label>
                  <input
                    type="number"
                    required
                    value={targetPrice}
                    onChange={e => setTargetPrice(Number(e.target.value))}
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-lg font-bold text-emerald-800"
                  />
                </div>
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Deadline:</label>
                  <input
                    type="date"
                    required
                    value={deadlineDate}
                    onChange={e => setDeadlineDate(e.target.value)}
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Delivery Destination / Warehouse Hub:</label>
                <input
                  type="text"
                  required
                  value={deliveryLocation}
                  onChange={e => setDeliveryLocation(e.target.value)}
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-lg"
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Quality Requirements & Terms:</label>
                <textarea
                  rows={3}
                  value={specifications}
                  onChange={e => setSpecifications(e.target.value)}
                  placeholder="Specify acceptable moisture %, packaging requirements, assay test parameters..."
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-lg"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setIsCreateRFQModalOpen(false)}
                  className="px-4 py-2 border border-stone-300 rounded-lg font-bold text-stone-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg shadow-sm"
                >
                  Publish Tender
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Submit Farmer Offer Modal */}
      {selectedRFQForOffer && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-stone-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <div>
                <h3 className="text-lg font-extrabold text-stone-900 font-display">
                  Submit Bid for Tender #{selectedRFQForOffer.id}
                </h3>
                <p className="text-xs text-stone-500">
                  {selectedRFQForOffer.cropName} • Target: ₹{selectedRFQForOffer.targetPricePerQuintal}/Qtl
                </p>
              </div>
              <button 
                onClick={() => setSelectedRFQForOffer(null)}
                className="text-stone-400 hover:text-stone-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleOfferSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Your Offered Price (₹/Qtl):</label>
                  <input
                    type="number"
                    required
                    value={offerPrice}
                    onChange={e => setOfferPrice(Number(e.target.value))}
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-lg font-bold text-emerald-800"
                  />
                </div>
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Offered Quantity (Qtl):</label>
                  <input
                    type="number"
                    required
                    value={offerQuantity}
                    onChange={e => setOfferQuantity(Number(e.target.value))}
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-lg font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Delivery Timeline (Days to Dispatch):</label>
                <input
                  type="number"
                  required
                  value={deliveryDays}
                  onChange={e => setDeliveryDays(Number(e.target.value))}
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-lg"
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Bid Description & Produce Quality:</label>
                <textarea
                  rows={3}
                  value={offerNotes}
                  onChange={e => setOfferNotes(e.target.value)}
                  placeholder="Mention moisture test percentage, packaging type, and willingness to send physical samples..."
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-lg"
                />
              </div>

              <div className="flex items-center gap-2 p-3 bg-stone-50 rounded-lg border border-stone-200">
                <input
                  type="checkbox"
                  id="sampleCheck"
                  checked={sampleAvailable}
                  onChange={e => setSampleAvailable(e.target.checked)}
                  className="w-4 h-4 accent-emerald-700"
                />
                <label htmlFor="sampleCheck" className="font-semibold text-stone-700 cursor-pointer">
                  Courier sample available on request (500g sealed pouch)
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setSelectedRFQForOffer(null)}
                  className="px-4 py-2 border border-stone-300 rounded-lg font-bold text-stone-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg shadow-sm"
                >
                  Submit Offer to Buyer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
