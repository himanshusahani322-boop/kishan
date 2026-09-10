import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { marketplaceService } from '../../services/marketplaceService';
import {
  PageContainer,
  Breadcrumbs,
  SectionHeader,
  Alert,
  LoadingState,
  EmptyState,
} from '../../components/ui';
import {
  TrendingUp,
  IndianRupee,
  Package,
  Clock,
  CheckCircle2,
  Truck,
  RefreshCw,
} from 'lucide-react';

// ─── Skeleton ──────────────────────────────────────────────────────────────────
const MetricSkeleton: React.FC = () => (
  <div className="bg-white rounded-2xl border border-stone-200 p-5 animate-pulse">
    <div className="h-3 bg-stone-200 rounded w-2/3 mb-3" />
    <div className="h-7 bg-stone-200 rounded w-1/2 mb-1" />
    <div className="h-2 bg-stone-100 rounded w-3/4" />
  </div>
);

// ─── Metric card ───────────────────────────────────────────────────────────────
interface EarningCardProps {
  title: string;
  hindiTitle?: string;
  value: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  colorClass: string;
  bgClass: string;
}

const EarningCard: React.FC<EarningCardProps> = ({
  title, hindiTitle, value, subtitle, icon: Icon, colorClass, bgClass
}) => (
  <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-2xs hover:shadow-sm transition-shadow">
    <div className="flex items-start justify-between mb-3">
      <div>
        <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider">{title}</p>
        {hindiTitle && <p className="text-[10px] text-stone-400">{hindiTitle}</p>}
      </div>
      <div className={`p-2 rounded-xl ${bgClass}`}>
        <Icon className={`w-4 h-4 ${colorClass}`} />
      </div>
    </div>
    <p className="text-2xl font-extrabold font-display text-stone-900">{value}</p>
    <p className="text-xs text-stone-500 mt-1">{subtitle}</p>
  </div>
);

// ─── Format INR ───────────────────────────────────────────────────────────────
const fmtINR = (n: number) =>
  n >= 100000
    ? `₹${(n / 100000).toFixed(2)}L`
    : `₹${n.toLocaleString('en-IN')}`;

export const FarmerEarningsPage: React.FC = () => {
  const navigate = useNavigate();

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadEarnings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await marketplaceService.getFarmerEarnings();
      setData(res.data || res);
    } catch (err: any) {
      setError(err.message || 'Failed to load earnings data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadEarnings(); }, [loadEarnings]);

  const metrics = [
    {
      title: 'Total Gross Sales',
      hindiTitle: 'कुल बिक्री',
      value: data ? fmtINR(data.totalGrossSales || 0) : '—',
      subtitle: `${data?.totalOrdersCount ?? 0} total orders`,
      icon: TrendingUp,
      colorClass: 'text-emerald-700',
      bgClass: 'bg-emerald-50',
    },
    {
      title: 'Settled Amount',
      hindiTitle: 'प्राप्त राशि',
      value: data ? fmtINR(data.settledAmount || 0) : '—',
      subtitle: `${data?.completedOrdersCount ?? 0} delivered orders`,
      icon: CheckCircle2,
      colorClass: 'text-blue-700',
      bgClass: 'bg-blue-50',
    },
    {
      title: 'In-Transit Escrow',
      hindiTitle: 'ट्रांजिट में एस्क्रो',
      value: data ? fmtINR(data.inTransitEscrowAmount || 0) : '—',
      subtitle: `${data?.inTransitOrdersCount ?? 0} orders in transit`,
      icon: Truck,
      colorClass: 'text-amber-700',
      bgClass: 'bg-amber-50',
    },
    {
      title: 'Pending Confirmation',
      hindiTitle: 'अनुमोदन प्रतीक्षा',
      value: data ? fmtINR(data.pendingConfirmationAmount || 0) : '—',
      subtitle: 'Awaiting buyer payment',
      icon: Clock,
      colorClass: 'text-purple-700',
      bgClass: 'bg-purple-50',
    },
  ];

  return (
    <PageContainer>
      <Breadcrumbs
        items={[
          { label: 'Farmer Dashboard', href: '/farmer' },
          { label: 'Earnings & Settlements' },
        ]}
        className="mb-4"
      />

      <SectionHeader
        title="Farmer Earnings & Escrow Settlements"
        subtitle="Real-time analytics from verified order records. All amounts reflect actual transaction history."
        badge="Escrow Protected"
        action={
          <button
            onClick={loadEarnings}
            disabled={loading}
            className="p-2 rounded-xl border border-stone-200 text-stone-500 hover:text-stone-800 hover:bg-stone-50 transition-colors cursor-pointer disabled:opacity-50"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        }
      />

      {error && (
        <Alert variant="error" title="Failed to Load Earnings" description={error} className="mb-6" />
      )}

      {/* Important notice */}
      <div className="mb-6 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
        <span className="font-bold">Note: </span>
        Earnings are calculated from verified order records only. Amounts are shown as order totals —
        actual bank disbursement happens after escrow release confirmation.
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {loading
          ? [1, 2, 3, 4].map(i => <MetricSkeleton key={i} />)
          : metrics.map(m => <EarningCard key={m.title} {...m} />)
        }
      </div>

      {/* Recent transactions */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-2xs overflow-hidden">
        <div className="px-5 py-4 border-b border-stone-100 flex items-center justify-between">
          <h2 className="font-display font-semibold text-stone-900 text-sm flex items-center gap-2">
            <IndianRupee className="w-4 h-4 text-emerald-600" />
            Recent Settled Transactions
          </h2>
          <button
            onClick={() => navigate('/farmer/orders')}
            className="text-xs text-emerald-700 font-semibold hover:underline"
          >
            View All Orders →
          </button>
        </div>

        {loading ? (
          <div className="p-5 space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse h-10 bg-stone-100 rounded-xl" />
            ))}
          </div>
        ) : !data?.recentTransactions?.length ? (
          <div className="p-8">
            <EmptyState
              title="No Settled Transactions Yet"
              description="Completed and delivered orders will appear here with their settlement details."
              icon={Package}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-stone-50 border-b border-stone-100">
                  <th className="text-left px-5 py-3 text-stone-500 font-semibold uppercase tracking-wider">Order #</th>
                  <th className="text-left px-5 py-3 text-stone-500 font-semibold uppercase tracking-wider">Crop</th>
                  <th className="text-right px-5 py-3 text-stone-500 font-semibold uppercase tracking-wider">Qty (Qtl)</th>
                  <th className="text-right px-5 py-3 text-stone-500 font-semibold uppercase tracking-wider">Amount</th>
                  <th className="text-center px-5 py-3 text-stone-500 font-semibold uppercase tracking-wider">Payment</th>
                  <th className="text-left px-5 py-3 text-stone-500 font-semibold uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {data.recentTransactions.map((tx: any) => (
                  <tr
                    key={tx.orderId}
                    className="hover:bg-stone-50 cursor-pointer transition-colors"
                    onClick={() => navigate(`/farmer/orders/${tx.orderId}`)}
                  >
                    <td className="px-5 py-3 font-mono font-bold text-stone-900">
                      {tx.orderNumber || tx.orderId?.slice(-8).toUpperCase()}
                    </td>
                    <td className="px-5 py-3 text-stone-700 font-medium">{tx.cropName || '—'}</td>
                    <td className="px-5 py-3 text-right text-stone-700">
                      {(tx.quantityQuintals || 0).toFixed(1)}
                    </td>
                    <td className="px-5 py-3 text-right font-extrabold text-emerald-700">
                      {fmtINR(tx.settledAmount || 0)}
                    </td>
                    <td className="px-5 py-3 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                        tx.paymentStatus === 'disbursed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : tx.paymentStatus === 'escrow_locked'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-stone-100 text-stone-600'
                      }`}>
                        {(tx.paymentStatus || 'pending').replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-stone-500">
                      {new Date(tx.date).toLocaleDateString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </PageContainer>
  );
};
