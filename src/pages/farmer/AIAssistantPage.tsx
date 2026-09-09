import React from 'react';
import { PageContainer, Breadcrumbs, SectionHeader } from '../../components/ui';
import { AgriAdvisoryAI } from '../../components/AgriAdvisoryAI';

export const AIAssistantPage: React.FC = () => {
  return (
    <PageContainer>
      <Breadcrumbs
        items={[
          { label: 'Farmer Dashboard', href: '/farmer' },
          { label: 'AI Kisan Advisor' },
        ]}
        className="mb-4"
      />
      <SectionHeader
        title="AI Kisan Advisory — फसल सलाहकार"
        subtitle="Ask your crop, pest, irrigation, and market questions in Hindi or English. Powered by Gemini."
        badge="Powered by Gemini"
        className="mb-6"
      />
      <AgriAdvisoryAI />
    </PageContainer>
  );
};
