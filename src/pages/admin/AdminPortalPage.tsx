import React from 'react';
import { PageContainer, Breadcrumbs, SectionHeader } from '../../components/ui';
import { AdminPanel } from '../../components/AdminPanel';

export const AdminPortalPage: React.FC = () => {
  return (
    <PageContainer maxWidth="full">
      <Breadcrumbs
        items={[
          { label: 'Admin Portal' },
        ]}
        className="mb-4"
      />
      <SectionHeader
        title="Kisan Saathi — Admin Control Panel"
        subtitle="Manage farmers, buyers, listings, orders, and platform KPIs. KYC verification and dispute resolution."
        badge="Admin Only"
        className="mb-6"
      />
      <AdminPanel />
    </PageContainer>
  );
};
