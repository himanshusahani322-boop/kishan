import React from 'react';
import { CropListing } from '../../types';
import { Edit3, Trash2, MapPin } from 'lucide-react';
import { QualityBadge } from './QualityBadge';

export interface CropListingTableProps {
  crops: CropListing[];
  onEdit: (crop: CropListing) => void;
  onDelete: (cropId: string) => void;
  className?: string;
}

export const CropListingTable: React.FC<CropListingTableProps> = ({
  crops,
  onEdit,
  onDelete,
  className = ''
}) => {
  return (
    <div className={`overflow-x-auto rounded-2xl border border-stone-200/90 bg-white shadow-2xs ${className}`}>
      <table className="w-full text-left text-xs text-stone-700">
        <thead className="bg-stone-50/80 text-[11px] font-bold uppercase tracking-wider text-stone-500 border-b border-stone-200/90">
          <tr>
            <th className="py-3.5 px-4">Crop & Variety</th>
            <th className="py-3.5 px-4">Grade & Assaying</th>
            <th className="py-3.5 px-4">Available Stock</th>
            <th className="py-3.5 px-4">Price / Quintal</th>
            <th className="py-3.5 px-4">Mandi Rate</th>
            <th className="py-3.5 px-4">Location</th>
            <th className="py-3.5 px-4">Status</th>
            <th className="py-3.5 px-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-stone-100 font-medium">
          {crops.map((crop) => (
            <tr key={crop.id} className="hover:bg-stone-50/50 transition-colors">
              <td className="py-3.5 px-4">
                <div className="flex items-center gap-3">
                  <img
                    src={crop.imageUrl}
                    alt={crop.title}
                    className="w-10 h-10 rounded-lg object-cover border border-stone-100 shrink-0"
                  />
                  <div>
                    <span className="font-bold text-stone-900 block text-sm font-display">
                      {crop.title}
                    </span>
                    <span className="text-[11px] text-stone-500">{crop.variety}</span>
                  </div>
                </div>
              </td>
              <td className="py-3.5 px-4">
                <QualityBadge grade={crop.grade} isOrganic={crop.isOrganicCertified} />
                <span className="text-[10px] text-stone-400 block mt-0.5">
                  Moisture: {crop.moisturePercentage}%
                </span>
              </td>
              <td className="py-3.5 px-4 font-bold text-stone-900">
                {crop.quantityAvailable} Quintals
              </td>
              <td className="py-3.5 px-4 font-bold text-stone-900">
                ₹{crop.pricePerQuintal.toLocaleString('en-IN')}
              </td>
              <td className="py-3.5 px-4 text-emerald-700 font-semibold">
                ₹{crop.mandiBenchmarkPrice.toLocaleString('en-IN')}
              </td>
              <td className="py-3.5 px-4 text-stone-500">
                <div className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-stone-400 shrink-0" />
                  <span>{crop.location.district}, {crop.location.state}</span>
                </div>
              </td>
              <td className="py-3.5 px-4">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                  {crop.status === 'active' ? 'Active' : crop.status}
                </span>
              </td>
              <td className="py-3.5 px-4 text-right">
                <div className="flex items-center justify-end gap-1.5">
                  <button
                    onClick={() => onEdit(crop)}
                    className="p-1.5 rounded-lg text-stone-500 hover:text-emerald-700 hover:bg-emerald-50 transition-colors cursor-pointer"
                    title="Edit"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onDelete(crop.id)}
                    className="p-1.5 rounded-lg text-stone-500 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
