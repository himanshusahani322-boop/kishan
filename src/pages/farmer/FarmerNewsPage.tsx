import React, { useState } from 'react';
import { PageContainer, Breadcrumbs, SectionHeader, Button, Alert } from '../../components/ui';
import { 
  Newspaper, 
  ExternalLink, 
  Tag,
  TrendingUp,
  CloudRain,
  IndianRupee,
  Sprout,
  Bug,
  Leaf,
  Calendar,
  Clock,
  BookOpen,
} from 'lucide-react';

interface NewsArticle {
  id: string;
  title: string;
  titleHindi: string;
  excerpt: string;
  category: string;
  categoryColor: string;
  date: string;
  source: string;
  readTimeMin: number;
  imageUrl: string;
  icon: React.ElementType;
  isBreaking?: boolean;
}

const AGRI_NEWS: NewsArticle[] = [
  {
    id: '1',
    title: 'Cabinet approves ₹2,017 Crore for Pradhan Mantri Fasal Bima Yojana in Kharif 2025',
    titleHindi: 'प्रधानमंत्री फसल बीमा योजना के लिए ₹2,017 करोड़ का प्रस्ताव',
    excerpt:
      'The Union Cabinet has approved enhanced premium subsidy for crop insurance covering over 5.6 crore farmer applications under PMFBY for the Kharif season.',
    category: 'Government Scheme',
    categoryColor: 'bg-blue-100 text-blue-700',
    date: 'Sep 8, 2025',
    source: 'PIB India',
    readTimeMin: 3,
    imageUrl: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=400&q=80',
    icon: IndianRupee,
    isBreaking: true,
  },
  {
    id: '2',
    title: 'IMD issues early warning: Northeast Monsoon to arrive October 20 — Rabi sowing advisory issued',
    titleHindi: 'मौसम विभाग: उत्तर-पूर्व मानसून 20 अक्टूबर को; रबी बुवाई की सलाह',
    excerpt:
      'India Meteorological Department warns of delayed northeast monsoon onset. Farmers in Tamil Nadu, Andhra Pradesh, and Karnataka advised to delay wheat sowing by 2 weeks.',
    category: 'Weather Alert',
    categoryColor: 'bg-amber-100 text-amber-700',
    date: 'Sep 7, 2025',
    source: 'IMD India',
    readTimeMin: 2,
    imageUrl: 'https://images.unsplash.com/photo-1523978591478-c753949ff840?w=400&q=80',
    icon: CloudRain,
    isBreaking: true,
  },
  {
    id: '3',
    title: 'Soybean MSP raised to ₹4,892/quintal for Kharif 2025–26; Farmers cheer historic 12% hike',
    titleHindi: 'सोयाबीन MSP ₹4,892/क्विंटल — 12% बढ़ोतरी',
    excerpt:
      'CCEA has approved a 12% increase in soybean MSP, the largest single-year hike in 15 years. Procurement begins October 1, 2025 through State Procurement Agencies.',
    category: 'MSP Update',
    categoryColor: 'bg-emerald-100 text-emerald-700',
    date: 'Sep 6, 2025',
    source: 'Ministry of Agriculture',
    readTimeMin: 4,
    imageUrl: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400&q=80',
    icon: TrendingUp,
  },
  {
    id: '4',
    title: 'Fall Armyworm detected in 3 Maharashtra districts — ICAR issues emergency pest advisory',
    titleHindi: 'फॉल आर्मीवर्म 3 जिलों में — ICAR की आपात कीट सलाह',
    excerpt:
      'ICAR-NCIPM has confirmed Fall Armyworm (FAW) outbreaks in Nashik, Ahmednagar, and Aurangabad districts. Recommended: Spinetoram 11.7% SC @ 0.5 ml/litre spray.',
    category: 'Pest Alert',
    categoryColor: 'bg-red-100 text-red-700',
    date: 'Sep 5, 2025',
    source: 'ICAR',
    readTimeMin: 3,
    imageUrl: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400&q=80',
    icon: Bug,
  },
  {
    id: '5',
    title: 'PM-KISAN 17th Installment: ₹2,000 to be disbursed September 15 — Check eligibility now',
    titleHindi: 'PM-KISAN 17वीं किस्त 15 सितंबर को — पात्रता जांचें',
    excerpt:
      'Over 9 crore eligible farmers will receive the 17th installment of PM-KISAN on September 15. Farmers must complete e-KYC on the pmkisan.gov.in portal before September 12.',
    category: 'Government Scheme',
    categoryColor: 'bg-blue-100 text-blue-700',
    date: 'Sep 4, 2025',
    source: 'PM-KISAN Portal',
    readTimeMin: 2,
    imageUrl: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&q=80',
    icon: IndianRupee,
  },
  {
    id: '6',
    title: 'Natural farming adoption rises 34% in Gujarat: FPOs credit soil health card program',
    titleHindi: 'गुजरात में प्राकृतिक खेती 34% बढ़ी — FPO का योगदान',
    excerpt:
      'Farmers switching to natural farming methods are seeing 18% premium on produce sold through FPO-linked marketplaces including Kisan Saathi, according to a new NABARD study.',
    category: 'Agri News',
    categoryColor: 'bg-purple-100 text-purple-700',
    date: 'Sep 3, 2025',
    source: 'NABARD',
    readTimeMin: 5,
    imageUrl: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&q=80',
    icon: Leaf,
  },
];

const CATEGORIES = ['All', 'Government Scheme', 'MSP Update', 'Weather Alert', 'Pest Alert', 'Agri News'];

export const FarmerNewsPage: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState('All');

  const filtered = activeCategory === 'All'
    ? AGRI_NEWS
    : AGRI_NEWS.filter(a => a.category === activeCategory);

  const breaking = filtered.filter(a => a.isBreaking);
  const rest = filtered.filter(a => !a.isBreaking);

  return (
    <PageContainer>
      <Breadcrumbs
        items={[
          { label: 'Farmer Dashboard', href: '/farmer' },
          { label: 'Agri News & Advisories' },
        ]}
        className="mb-4"
      />

      <SectionHeader
        title="कृषि समाचार — Agri News & Advisories"
        subtitle="Government schemes, MSP updates, weather alerts, pest advisories, and market news curated for farmers."
        badge="Daily Updated"
        className="mb-6"
      />

      {/* Category Filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-6 border-b border-stone-200">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap cursor-pointer transition-colors shrink-0 ${
              activeCategory === cat
                ? 'bg-emerald-600 text-white'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Breaking News Banner */}
      {breaking.length > 0 && activeCategory === 'All' && (
        <Alert
          variant="warning"
          title={`🔴 Breaking: ${breaking[0].title}`}
          description={breaking[0].excerpt}
          className="mb-6"
        />
      )}

      {/* News Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filtered.map(article => {
          const Icon = article.icon;
          return (
            <article
              key={article.id}
              className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-2xs hover:shadow-xs hover:border-emerald-200 transition-all group"
            >
              <div className="relative overflow-hidden aspect-[16/8]">
                <img
                  src={article.imageUrl}
                  alt={article.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                {article.isBreaking && (
                  <span className="absolute top-2 left-2 bg-red-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full animate-pulse">
                    🔴 BREAKING
                  </span>
                )}
                <span className={`absolute bottom-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-full ${article.categoryColor}`}>
                  {article.category}
                </span>
              </div>
              <div className="p-4">
                <h3 className="font-display font-bold text-stone-900 text-sm leading-snug mb-1 line-clamp-2 group-hover:text-emerald-700 transition-colors">
                  {article.title}
                </h3>
                <p className="text-xs text-stone-500 mb-2 line-clamp-1 font-medium">{article.titleHindi}</p>
                <p className="text-xs text-stone-600 leading-relaxed mb-3 line-clamp-2">{article.excerpt}</p>
                <div className="flex items-center justify-between pt-2 border-t border-stone-100">
                  <div className="flex items-center gap-3 text-[10px] text-stone-400 font-medium">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {article.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {article.readTimeMin} min
                    </span>
                    <span className="flex items-center gap-1">
                      <BookOpen className="w-3 h-3" />
                      {article.source}
                    </span>
                  </div>
                  <button className="text-emerald-600 hover:text-emerald-800 transition-colors cursor-pointer">
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </PageContainer>
  );
};
