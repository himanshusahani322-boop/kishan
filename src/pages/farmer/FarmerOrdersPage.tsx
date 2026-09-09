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
import { Truck, Package } from 'lucide-react';

export const FarmerOrdersPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { currentUser, orders, language } = useApp();

  const farmerUser = user || currentUser;
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const myOrders = orders.filter(o =>
    o.sellerId === farmerUser.id ||
    o.sellerName.includes(farmerUser.name) ||
    o.sellerId === 'user_farmer_1'
  );

  const filteredOrders = myOrders.filter(o => {
    if (filterStatus === 'all') return true;
    if (filterStatus === 'pending') return o.orderStatus === 'placed' || o.orderStatus === 'confirmed';
    if (filterStatus === 'dispatched') return o.orderStatus === 'dispatched' || o.orderStatus === 'out_for_delivery' || o.orderStatus === 'aggregated_at_mandi';
    if (filterStatus === 'delivered') return o.orderStatus === 'delivered';
    return true;
  });

  const filterTabs = [
    { id: 'all', label: 'All Orders', count: myOrders.length },
    { id: 'pending', label: 'Pending Dispatch', count: myOrders.filter(o => o.orderStatus === 'placed' || o.orderStatus === 'confirmed').length },
    { id: 'dispatched', label: 'In Transit', count: myOrders.filter(o => o.orderStatus === 'dispatched' || o.orderStatus === 'out_for_delivery').length },
    { id: 'delivered', label: 'Delivered', count: myOrders.filter(o => o.orderStatus === 'delivered').length },
  ];

  return (
    <PageContainer>
      <Breadcrumbs
        items={[
          { label: 'Farmer Dashboard', href: '/farmer' },
          { label: 'Order Dispatch Center' }
        ]}
        className="mb-4"
      />

      <SectionHeader
        title="Order Dispatch & Mandi Freight Center"
        subtitle="Manage incoming buyer orders, allocate freight trucks, and upload certified weighbridge slips"
        badge={`${myOrders.length} Total Orders`}
      />

      {/* Filter Tabs - horizontally scrollable on mobile */}
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
            <span>{tab.label}</span>
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
          description="You have no orders in this category. Active buyer orders will appear here once received."
          icon={Package}
        />
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              role="farmer"
              onViewDetails={() => navigate(`/farmer/orders/${order.id}`)}
              onDispatchAction={() => navigate(`/farmer/orders/${order.id}`)}
            />
          ))}
        </div>
      )}
    </PageContainer>
  );
};
