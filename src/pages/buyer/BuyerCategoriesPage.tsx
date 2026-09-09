import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { CropCategory } from '../../types';
import { PageContainer, SectionHeader, CategoryCard, Breadcrumbs, Button } from '../../components/ui';
import { Wheat, Bean, Apple, Carrot, Flame, Droplets, Banknote, ArrowRight, ShieldCheck } from 'lucide-react';

interface CategoryDetails {
  category: CropCategory;
  hindiName: string;
  description: string;
  keyVarieties: string[];
  mandiAverageQuintal: number;
  activeLotsCount: number;
}

const CATEGORY_DETAILS: CategoryDetails[] = [
  {
    category: 'Grains & Cereals',
    hindiName: 'अनाज व खाद्यान्न',
    description: 'Wheat, Basmati & Non-Basmati Paddy, Maize, Barley, Pearl Millet (Bajra), Sorghum (Jowar).',
    keyVarieties: ['Sharbati C-306', '1121 Steam Basmati', 'Pusa 1509', 'Yellow Hybrid Maize', 'Malwa Durum'],
    mandiAverageQuintal: 3200,
    activeLotsCount: 42
  },
  {
    category: 'Pulses (Dal)',
    hindiName: 'दालें व दलहन',
    description: 'Chickpeas (Chana), Pigeon Pea (Tur/Arhar), Green Gram (Moong), Black Gram (Urad), Masoor.',
    keyVarieties: ['Desi Chana Bold', 'Gulbarga Tur Maruthi', 'IPM-02-03 Moong', 'Latur Black Urad'],
    mandiAverageQuintal: 6850,
    activeLotsCount: 28
  },
  {
    category: 'Oilseeds',
    hindiName: 'तिलहन उपज',
    description: 'Soyabean, Mustard Seed (Rai), Groundnut (Peanut), Sunflower, Sesame (Til).',
    keyVarieties: ['JS-9560 Soyabean', 'Pusa Mustard 25', 'GJG-32 Bold Groundnut', 'White Z-Til'],
    mandiAverageQuintal: 5400,
    activeLotsCount: 19
  },
  {
    category: 'Spices',
    hindiName: 'मसाले व जड़ी-बूटी',
    description: 'Coriander (Dhaniya), Cumin (Jeera), Turmeric (Haldi), Red Chilli, Fenugreek (Methi), Fennel (Saunf).',
    keyVarieties: ['Unjha Machine Clean Jeera', 'Salem Erode Turmeric', 'Guntur Sannam Chilli', 'Kumbhraj Green Dhaniya'],
    mandiAverageQuintal: 14200,
    activeLotsCount: 31
  },
  {
    category: 'Vegetables',
    hindiName: 'ताजी सब्जियां व कंद',
    description: 'Red Onions (Nashik/Pimpalgaon), Potatoes (Chipsona/Jyoti), Garlic, Tomatoes, Ginger.',
    keyVarieties: ['Nashik Garwa Onion', 'Agra Kufri Chipsona', 'Mandsaur Desi Garlic', 'Hassan Ginger'],
    mandiAverageQuintal: 2150,
    activeLotsCount: 35
  },
  {
    category: 'Fruits',
    hindiName: 'बागवानी फल',
    description: 'Apples (Kinnaur/Shimla), Mangoes (Alphonso/Kesar), Citrus (Nagpur Santra), Pomegranate, Bananas.',
    keyVarieties: ['Kinnaur Royal Apple', 'Ratnagiri Hapus Mango', 'Solapur Bhagwa Anar', 'Jalgaon G9 Banana'],
    mandiAverageQuintal: 6200,
    activeLotsCount: 16
  },
  {
    category: 'Cash Crops',
    hindiName: 'व्यावसायिक फसलें',
    description: 'Raw Cotton (Kapas), Sugarcane, Jute, Tobacco, Guar Gum.',
    keyVarieties: ['BT Cotton Shankar-6', 'Co-0238 Sugarcane', 'Guar Gum HG-365', 'TD-5 Jute'],
    mandiAverageQuintal: 7100,
    activeLotsCount: 14
  }
];

export const BuyerCategoriesPage: React.FC = () => {
  const navigate = useNavigate();
  const { language } = useApp();

  return (
    <PageContainer>
      <Breadcrumbs
        items={[
          { label: 'Buyer Home', href: '/buyer' },
          { label: 'Commodity Categories' }
        ]}
        className="mb-4"
      />

      <SectionHeader
        title="Institutional Commodity Categories"
        subtitle="Explore agricultural trading classifications with AGMARK specifications and live mandi averages"
        badge="7 APMC Sectors"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {CATEGORY_DETAILS.map((cat) => (
          <div
            key={cat.category}
            className="p-6 rounded-3xl bg-white border border-stone-200/90 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-3 mb-3">
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                  {cat.activeLotsCount} Mandi Lots Active
                </span>
                <span className="text-xs font-bold text-stone-900">
                  Avg ₹{cat.mandiAverageQuintal.toLocaleString('en-IN')}/Q
                </span>
              </div>

              <h3 className="text-lg font-bold text-stone-900 font-display">
                {cat.category}
              </h3>
              <p className="text-xs text-stone-500 font-medium mt-0.5">
                {cat.hindiName}
              </p>
              <p className="text-xs text-stone-600 mt-2 leading-relaxed">
                {cat.description}
              </p>

              <div className="mt-4 pt-3 border-t border-stone-100">
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block mb-1.5">
                  Top Traded Varieties
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {cat.keyVarieties.map((v) => (
                    <span
                      key={v}
                      className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-stone-50 border border-stone-200/60 text-stone-700"
                    >
                      {v}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-stone-100">
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate(`/buyer/marketplace?category=${encodeURIComponent(cat.category)}`)}
                className="w-full flex items-center justify-center gap-1.5"
              >
                <span>Browse {cat.category} Lots</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </PageContainer>
  );
};
