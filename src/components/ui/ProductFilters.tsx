import React from 'react';
import { Filter, X, RotateCcw } from 'lucide-react';
import { CropCategory, QualityGrade } from '../../types';
import { Checkbox } from './Checkbox';
import { Select } from './Select';
import { Button } from './Button';

export interface FilterState {
  category: string;
  state: string;
  grade: string;
  onlyOrganic: boolean;
  minPrice: number;
  maxPrice: number;
  sortBy: 'recommended' | 'price_low' | 'price_high' | 'quantity_high' | 'mandi_spread';
}

export interface ProductFiltersProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  onReset: () => void;
  availableStates: string[];
  totalResultsCount?: number;
  className?: string;
  isMobileDrawer?: boolean;
  isOpen?: boolean;
  onClose?: () => void;
}

const CATEGORIES: CropCategory[] = [
  'Grains & Cereals',
  'Pulses (Dal)',
  'Vegetables',
  'Spices',
  'Oilseeds',
  'Fruits',
  'Cash Crops'
];

const GRADES: QualityGrade[] = [
  'Grade A+ (Export)',
  'Grade A (Premium)',
  'Grade B (Standard)',
  'Grade C (Fair)'
];

export const ProductFilters: React.FC<ProductFiltersProps> = ({
  filters,
  onChange,
  onReset,
  availableStates,
  totalResultsCount,
  className = '',
  isMobileDrawer = false,
  isOpen = false,
  onClose
}) => {
  const content = (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-3 border-b border-stone-200">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-emerald-700" />
          <h3 className="font-bold text-stone-900 text-sm font-display">Filters & Standards</h3>
        </div>
        <button
          onClick={onReset}
          className="text-xs text-stone-500 hover:text-emerald-700 flex items-center gap-1 font-medium transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset</span>
        </button>
      </div>

      {/* Category */}
      <div className="space-y-2">
        <label className="block text-xs font-bold uppercase tracking-wider text-stone-700">
          Crop Category
        </label>
        <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
          <label className="flex items-center gap-2 text-xs text-stone-700 py-1 hover:text-emerald-700 cursor-pointer">
            <input
              type="radio"
              name="filter-cat"
              checked={filters.category === 'all'}
              onChange={() => onChange({ ...filters, category: 'all' })}
              className="text-emerald-600 focus:ring-emerald-500"
            />
            <span className="font-medium">All Categories</span>
          </label>
          {CATEGORIES.map((cat) => (
            <label key={cat} className="flex items-center gap-2 text-xs text-stone-700 py-1 hover:text-emerald-700 cursor-pointer">
              <input
                type="radio"
                name="filter-cat"
                checked={filters.category === cat}
                onChange={() => onChange({ ...filters, category: cat })}
                className="text-emerald-600 focus:ring-emerald-500"
              />
              <span className="font-medium">{cat}</span>
            </label>
          ))}
        </div>
      </div>

      {/* State / Region */}
      <div className="space-y-2">
        <label className="block text-xs font-bold uppercase tracking-wider text-stone-700">
          State Origin
        </label>
        <select
          value={filters.state}
          onChange={(e) => onChange({ ...filters, state: e.target.value })}
          className="w-full text-xs px-3 py-2 rounded-xl border border-stone-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option value="all">All States of India</option>
          {availableStates.map((st) => (
            <option key={st} value={st}>{st}</option>
          ))}
        </select>
      </div>

      {/* AGMARK Quality Grade */}
      <div className="space-y-2">
        <label className="block text-xs font-bold uppercase tracking-wider text-stone-700">
          AGMARK Quality Grade
        </label>
        <select
          value={filters.grade}
          onChange={(e) => onChange({ ...filters, grade: e.target.value })}
          className="w-full text-xs px-3 py-2 rounded-xl border border-stone-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option value="all">All Certified Grades</option>
          {GRADES.map((g) => (
            <option key={g} value={g}>{g}</option>
          ))}
        </select>
      </div>

      {/* Organic Certification Checkbox */}
      <div className="pt-2 border-t border-stone-100">
        <Checkbox
          checked={filters.onlyOrganic}
          onChange={(e) => onChange({ ...filters, onlyOrganic: e.target.checked })}
          label="🌱 Certified Organic Only"
          description="NPOP / Jaivik Bharat Certified"
        />
      </div>

      {/* Sort By */}
      <div className="space-y-2 pt-2 border-t border-stone-100">
        <label className="block text-xs font-bold uppercase tracking-wider text-stone-700">
          Sort Order
        </label>
        <select
          value={filters.sortBy}
          onChange={(e) => onChange({ ...filters, sortBy: e.target.value as any })}
          className="w-full text-xs px-3 py-2 rounded-xl border border-stone-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
        >
          <option value="recommended">APMC Recommended</option>
          <option value="price_low">Price: Low to High</option>
          <option value="price_high">Price: High to Low</option>
          <option value="quantity_high">Largest Lot First (Quintals)</option>
          <option value="mandi_spread">Best Spread Below Mandi</option>
        </select>
      </div>
    </div>
  );

  if (isMobileDrawer) {
    if (!isOpen) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-stone-900/60 backdrop-blur-xs animate-in fade-in">
        <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto bg-white rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-stone-100">
            <h3 className="text-base font-bold text-stone-900 font-display">Filter Marketplace Lots</h3>
            <button
              onClick={onClose}
              className="p-1 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {content}

          <div className="pt-4 border-t border-stone-200 flex gap-3">
            <Button
              variant="outline"
              onClick={onReset}
              className="w-1/3"
            >
              Clear
            </Button>
            <Button
              variant="primary"
              onClick={onClose}
              className="w-2/3"
            >
              Apply ({totalResultsCount ?? 0} Results)
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <aside className={`w-64 shrink-0 bg-white rounded-2xl border border-stone-200/90 p-5 shadow-2xs ${className}`}>
      {content}
    </aside>
  );
};
