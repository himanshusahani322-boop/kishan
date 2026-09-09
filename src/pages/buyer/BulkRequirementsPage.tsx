import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { 
  PageContainer, 
  Breadcrumbs, 
  SectionHeader, 
  RequirementCard, 
  RFQSummary, 
  OfferCard, 
  Button, 
  Modal 
} from '../../components/ui';
import { PlusCircle, FileText, Filter, Users, ShieldCheck } from 'lucide-react';
import { RFQRequirement } from '../../types';

export const BulkRequirementsPage: React.FC = () => {
  const navigate = useNavigate();
  const { rfqs, rfqOffers, respondToOffer, language, currentRole } = useApp();

  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedRFQForOffers, setSelectedRFQForOffers] = useState<RFQRequirement | null>(null);

  const filteredRFQs = rfqs.filter(r => {
    if (statusFilter === 'all') return true;
    return r.status === statusFilter;
  });

  const activeOffers = selectedRFQForOffers 
    ? rfqOffers.filter(o => o.rfqId === selectedRFQForOffers.id)
    : [];

  return (
    <PageContainer>
      <Breadcrumbs
        items={[
          { label: 'Buyer Home', href: '/buyer' },
          { label: 'Bulk Crop Requirements (RFQ)' }
        ]}
        className="mb-4"
      />

      <SectionHeader
        title="Institutional Bulk Crop Requirements (RFQ)"
        subtitle="Post commercial grade demands, invite verified farmer producer bids, and execute forward escrow contracts"
        badge={`${rfqs.length} Demands Active`}
        action={
          <Button
            variant="primary"
            onClick={() => navigate('/buyer/bulk-requirements/create')}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Post New Bulk Requirement</span>
          </Button>
        }
      />

      {/* RFQ High Level KPI Stats */}
      <RFQSummary
        rfqs={rfqs}
        onNewRFQ={() => navigate('/buyer/bulk-requirements/create')}
        className="mb-8"
      />

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 mb-6 border-b border-stone-200 pb-3">
        <span className="text-xs font-bold text-stone-500 uppercase mr-2">Filter:</span>
        {['all', 'open', 'negotiating', 'fulfilled'].map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`px-3 py-1 rounded-full text-xs font-semibold capitalize transition-colors cursor-pointer ${
              statusFilter === st
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            {st}
          </button>
        ))}
      </div>

      {/* Requirements Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredRFQs.map((rfq) => (
          <RequirementCard
            key={rfq.id}
            rfq={rfq}
            role="buyer"
            onViewDetails={() => setSelectedRFQForOffers(rfq)}
          />
        ))}
      </div>

      {/* Manage Offers Modal */}
      {selectedRFQForOffers && (
        <Modal
          isOpen={!!selectedRFQForOffers}
          onClose={() => setSelectedRFQForOffers(null)}
          title={`Farmer Bids for ${selectedRFQForOffers.cropName}`}
          size="lg"
        >
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 text-xs space-y-1">
              <div className="flex justify-between">
                <span>Target Volume: <strong>{selectedRFQForOffers.targetQuantityQuintals} Quintals</strong></span>
                <span>Target Price: <strong>₹{selectedRFQForOffers.targetPricePerQuintal.toLocaleString('en-IN')}/Q</strong></span>
              </div>
              <p className="text-stone-500">Delivery: {selectedRFQForOffers.deliveryLocation}</p>
            </div>

            {activeOffers.length === 0 ? (
              <p className="text-xs text-stone-500 text-center py-6">
                No farmer bids submitted yet for this requirement. Local FPOs in this mandi zone have been notified.
              </p>
            ) : (
              <div className="space-y-3">
                {activeOffers.map((offer) => (
                  <OfferCard
                    key={offer.id}
                    offer={offer}
                    targetPrice={selectedRFQForOffers.targetPricePerQuintal}
                    onAccept={() => {
                      respondToOffer(offer.id, 'accept');
                      alert('Bid accepted! Forward escrow booking generated.');
                    }}
                    onCounter={(price, notes) => {
                      respondToOffer(offer.id, 'counter', price, notes);
                      alert(`Counter-offer of ₹${price}/Q submitted to ${offer.farmerName}.`);
                    }}
                    onReject={() => {
                      respondToOffer(offer.id, 'reject');
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </Modal>
      )}
    </PageContainer>
  );
};
