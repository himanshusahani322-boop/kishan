import React from 'react';
import { CropCategory } from '../../types';
import { Wheat, Bean, Apple, Carrot, Flame, Droplets, Banknote, ArrowRight } from 'lucide-react';

export interface CategoryCardProps {
  category: CropCategory;
  hindiName?: string;
  itemCount?: number;
  imageUrl?: string;
  onClick: () => void;
  className?: string;
}

const CATEGORY_META: Record<CropCategory, { icon: any; color: string; bg: string; hindi: string; image: string }> = {
  'Grains & Cereals': {
    icon: Wheat,
    color: 'text-amber-700',
    bg: 'bg-amber-50 border-amber-200',
    hindi: 'अनाज व दलहन',
    image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=500&auto=format&fit=crop&q=80'
  },
  'Pulses (Dal)': {
    icon: Bean,
    color: 'text-orange-700',
    bg: 'bg-orange-50 border-orange-200',
    hindi: 'दालें व तिलहन',
    image: 'https://images.unsplash.com/photo-1515543237350-b3eea1ec8082?w=500&auto=format&fit=crop&q=80'
  },
  'Vegetables': {
    icon: Carrot,
    color: 'text-emerald-700',
    bg: 'bg-emerald-50 border-emerald-200',
    hindi: 'ताजी सब्जियां',
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=500&auto=format&fit=crop&q=80'
  },
  'Spices': {
    icon: Flame,
    color: 'text-red-700',
    bg: 'bg-red-50 border-red-200',
    hindi: 'मसाले व जड़ी-बूटी',
    image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=500&auto=format&fit=crop&q=80'
  },
  'Oilseeds': {
    icon: Droplets,
    color: 'text-yellow-700',
    bg: 'bg-yellow-50 border-yellow-200',
    hindi: 'तिलहन उपज',
    image: 'https://images.unsplash.com/photo-1589927986089-35812388d1f4?w=500&auto=format&fit=crop&q=80'
  },
  'Fruits': {
    icon: Apple,
    color: 'text-rose-700',
    bg: 'bg-rose-50 border-rose-200',
    hindi: 'बागवानी फल',
    image: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=500&auto=format&fit=crop&q=80'
  },
  'Cash Crops': {
    icon: Banknote,
    color: 'text-lime-700',
    bg: 'bg-lime-50 border-lime-200',
    hindi: 'व्यावसायिक फसलें',
    image: 'https://images.unsplash.com/photo-1605000797499-95a51c5269ae?w=500&auto=format&fit=crop&q=80'
  }
};

export const CategoryCard: React.FC<CategoryCardProps> = ({
  category,
  hindiName,
  itemCount,
  imageUrl,
  onClick,
  className = ''
}) => {
  const meta = CATEGORY_META[category] || CATEGORY_META['Grains & Cereals'];
  const Icon = meta.icon;

  return (
    <div
      onClick={onClick}
      className={`group relative overflow-hidden rounded-2xl bg-white border border-stone-200/90 shadow-2xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between p-4 sm:p-5 hover:-translate-y-0.5 ${className}`}
    >
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${meta.bg}`}>
          <Icon className={`w-6 h-6 ${meta.color}`} />
        </div>
        {typeof itemCount === 'number' && (
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-stone-100 text-stone-600">
            {itemCount} Lots
          </span>
        )}
      </div>

      <div>
        <h3 className="font-bold text-stone-900 text-base group-hover:text-emerald-700 transition-colors font-display">
          {category}
        </h3>
        <p className="text-xs text-stone-500 font-medium mt-0.5">
          {hindiName || meta.hindi}
        </p>
      </div>

      <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs font-semibold text-emerald-700 group-hover:text-emerald-800">
        <span>Browse Lots</span>
        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
      </div>
    </div>
  );
};
