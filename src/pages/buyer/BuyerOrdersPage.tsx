import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { 
  PageContainer, 
  Breadcrumbs, 
  SectionHeader, 
  OrderCard, 
  EmptyState, 
  Button 
} from '../../components/ui';
import { ShoppingBag } from 'lucide-react';

export const BuyerOrdersPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { currentUser, orders } = useApp();
  const buyerUser = user || currentUser;

  const [filterStatus, setFilterStatus] = useState<string>('all');

  const myOrders = orders.filter(o =>
    o.buyerId === buyerUser.id ||
    o.buyerName.includes(buyerUser.name) ||
    o.buyerId === 'user_buyer_1'
  );

  const filteredOrders = myOrders.filter(o => {
    if (filterStatus === 'all') return true;
    if (filterStatus === 'active') return ['placed', 'confirmed', 'aggregated_at_mandi', 'quality_inspected', 'dispatched', 'out_for_delivery'].includes(o.orderStatus);
    if (filterStatus === 'delivered') return o.orderStatus === 'delivered';
    if (filterStatus === 'cancelled') return o.orderStatus === 'cancelled';
    return true;
  });

  const filterTabs = [
    { id: 'all', label: 'All Orders', count: myOrders.length },
    { id: 'active', label: 'In Progress', count: myOrders.filter(o => ['placed', 'confirmed', 'aggregated_at_mandi', 'quality_inspected', 'dispatched', 'out_for_delivery'].includes(o.orderStatus)).length },
    { id: 'delivered', label: 'Delivered', count: myOrders.filter(o => o.orderStatus === 'delivered').length },
    { id: 'cancelled', label: 'Cancelled', count: myOrders.filter(o => o.orderStatus === 'cancelled').length },
  ];

  return (
    <PageContainer>
      <Breadcrumbs
        items={[
          { label: 'Buyer Home', href: '/buyer' },
          { label: 'My Orders' },
        ]}
        className="mb-4"
      />

      <SectionHeader
        title="My Procurement Orders"
        subtitle="Track all your bulk procurement orders, escrow payments, and freight dispatches"
        badge={`${myOrders.length} Orders`}
      />

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1 border-b border-stone-200">
        {filterTabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setFilterStatus(tab.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap cursor-pointer transition-colors shrink-0 ${
              filterStatus === tab.id
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            {tab.label}
            {tab.count > 0 && (
              <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded-full ${
                filterStatus === tab.id ? 'bg-emerald-800 text-emerald-100' : 'bg-stone-200 text-stone-600'
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {filteredOrders.length === 0 ? (
        <EmptyState
          title="No Orders Found"
          description="You haven't placed any procurement orders yet. Explore the marketplace to find quality verified crops."
          icon={ShoppingBag}
          action={
            <Button variant="primary" onClick={() => navigate('/buyer/marketplace')}>
              Browse Marketplace
            </Button>
          }
        />
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              role="buyer"
              onViewDetails={() => navigate(`/buyer/orders/${order.id}`)}
            />
          ))}
        </div>
      )}
    </PageContainer>
  );
};
