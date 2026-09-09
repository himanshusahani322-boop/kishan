import React from 'react';
import { PageContainer, Breadcrumbs, SectionHeader } from '../../components/ui';
import { AgriCalculators } from '../../components/AgriCalculators';

export const FarmerCalculationsPage: React.FC = () => {
  return (
    <PageContainer>
      <Breadcrumbs
        items={[
          { label: 'Farmer Dashboard', href: '/farmer' },
          { label: 'Agri Calculators' },
        ]}
        className="mb-4"
      />
      <SectionHeader
        title="Agri Calculators & Planning Tools"
        subtitle="Estimate crop yield, fertilizer needs, irrigation schedules, and profitability before each sowing cycle"
        badge="7 Calculators"
        className="mb-6"
      />
      <AgriCalculators />
    </PageContainer>
  );
};
