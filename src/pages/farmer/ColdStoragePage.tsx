import React from 'react';
import { PageContainer, Breadcrumbs, SectionHeader } from '../../components/ui';
import { ColdStorageFinder } from '../../components/ColdStorageFinder';

export const ColdStoragePage: React.FC = () => {
  return (
    <PageContainer>
      <Breadcrumbs
        items={[
          { label: 'Farmer Dashboard', href: '/farmer' },
          { label: 'Cold Storage Finder' },
        ]}
        className="mb-4"
      />
      <SectionHeader
        title="Cold Storage Facilities Near You"
        subtitle="Find certified, temperature-controlled warehouses in your district. Preserve quality and command better prices."
        badge="NABARD Listed"
        className="mb-6"
      />
      <ColdStorageFinder />
    </PageContainer>
  );
};
