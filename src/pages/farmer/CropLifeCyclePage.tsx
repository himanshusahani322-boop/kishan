import React, { useState } from 'react';
import { PageContainer, Breadcrumbs, SectionHeader, Button, Alert } from '../../components/ui';
import {
  Sprout,
  Droplets,
  Sun,
  Wind,
  Scissors,
  PackageCheck,
  ChevronRight,
  CheckCircle2,
  Clock,
  Leaf,
  CalendarDays,
  FlaskConical,
  Bug,
  Tractor,
} from 'lucide-react';

interface CropStage {
  id: number;
  name: string;
  nameHindi: string;
  daysRange: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  borderColor: string;
  description: string;
  activities: string[];
  inputs: string[];
  watchout: string;
  completed: boolean;
}

const CROP_STAGES: CropStage[] = [
  {
    id: 1,
    name: 'Land Preparation & Sowing',
    nameHindi: 'भूमि तैयारी और बुवाई',
    daysRange: 'Day 0 – Day 10',
    icon: Tractor,
    color: 'text-amber-700',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-300',
    description:
      'Prepare the field with deep ploughing, apply basal fertilizers, and sow certified seeds at recommended spacing.',
    activities: [
      'Deep ploughing (2–3 passes)',
      'Soil testing & pH correction',
      'FYM / compost application (5–8 tonnes/acre)',
      'Seed treatment with Trichoderma',
      'Sowing at 20 cm × 15 cm spacing',
    ],
    inputs: ['Certified seeds (8 kg/acre)', 'DAP 50 kg/acre', 'MOP 25 kg/acre', 'Trichoderma 4 g/kg seed'],
    watchout: 'Ensure soil moisture is at field capacity. Avoid sowing in waterlogged areas.',
    completed: true,
  },
  {
    id: 2,
    name: 'Germination & Early Vegetative',
    nameHindi: 'अंकुरण और प्रारंभिक वृद्धि',
    daysRange: 'Day 10 – Day 30',
    icon: Sprout,
    color: 'text-emerald-700',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-300',
    description:
      'Monitor germination uniformity. Apply first irrigation if rainfall is insufficient. Weed control is critical in this window.',
    activities: [
      'First irrigation at 7–10 DAS',
      'Gap filling within 10 DAS',
      'Pre-emergence herbicide spray',
      'Thinning to one plant per hill',
      'Top dressing — Urea 20 kg/acre',
    ],
    inputs: ['Urea 20 kg/acre', 'Pre-emergence herbicide (Pendimethalin 1 L/acre)'],
    watchout: 'Cutworms and aphids are common at this stage. Scout daily.',
    completed: true,
  },
  {
    id: 3,
    name: 'Active Vegetative Growth',
    nameHindi: 'सक्रिय वनस्पति विकास',
    daysRange: 'Day 30 – Day 60',
    icon: Leaf,
    color: 'text-green-700',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-300',
    description:
      'Maximum nutrient uptake phase. Ensure adequate water, nitrogen supply, and intercultural operations.',
    activities: [
      'Second irrigation at 30 DAS',
      'Hoeing & earthing up',
      'Foliar spray of micronutrients (ZnSO₄)',
      'Apply second dose Urea 20 kg/acre',
      'Install pheromone traps (5/acre)',
    ],
    inputs: ['Urea 20 kg/acre', 'ZnSO₄ 0.5% foliar', 'Neem oil 2% (pest management)'],
    watchout: 'Leaf blight and stem borer peak at this stage. Spray on flag leaf if needed.',
    completed: true,
  },
  {
    id: 4,
    name: 'Flowering & Pollination',
    nameHindi: 'फूल और परागण',
    daysRange: 'Day 60 – Day 80',
    icon: Sun,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-300',
    description:
      'Critical pollination window. Avoid spraying insecticides. Maintain soil moisture. Frost risk monitoring for Rabi crops.',
    activities: [
      'Irrigation at flower initiation',
      'Borer spray (avoid peak flowering hours)',
      'Record flowering date for estimation',
      'Remove diseased/volunteer plants',
    ],
    inputs: ['Boron 0.2% foliar spray for pod set', 'Fungicide (Mancozeb) if blight pressure high'],
    watchout: 'Do NOT spray insecticides between 9 AM – 5 PM during flowering — protects pollinators.',
    completed: false,
  },
  {
    id: 5,
    name: 'Grain / Pod Filling',
    nameHindi: 'दाना भराई',
    daysRange: 'Day 80 – Day 110',
    icon: FlaskConical,
    color: 'text-blue-700',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-300',
    description:
      'Assimilates move from leaves into grains/pods. Critical irrigation at this stage determines final yield.',
    activities: [
      'Irrigation at pod filling (critical)',
      'Monitor for pod borer',
      'Stop N application (avoid hollow grain)',
      'Estimate yield (bag count × weight)',
    ],
    inputs: ['K₂SO₄ 0.5% foliar for grain quality', 'Biopesticide (Bt) for pod borer if needed'],
    watchout:
      'Late rains can cause aflatoxin contamination in groundnut/maize. Ensure drainage channels are open.',
    completed: false,
  },
  {
    id: 6,
    name: 'Maturity & Harvesting',
    nameHindi: 'परिपक्वता और कटाई',
    daysRange: 'Day 110 – Day 120',
    icon: Scissors,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-300',
    description:
      'Determine harvest maturity by blacklayer formation or dry-down. Harvest at optimum moisture to maintain grade.',
    activities: [
      'Stop irrigation 10–14 days before harvest',
      'Mechanical harvesting at 25–28% moisture',
      'Sun-drying to 14% moisture',
      'Threshing & winnowing',
      'Sampling for AGMARK grading',
    ],
    inputs: ['Harvesting equipment', 'Gunny bags (50 kg capacity)', 'Moisture meter'],
    watchout: 'Pre-harvest sprouting possible in high-humidity zones. Harvest promptly if rains forecast.',
    completed: false,
  },
  {
    id: 7,
    name: 'Post-Harvest & Market Linkage',
    nameHindi: 'फसल कटाई के बाद',
    daysRange: 'Day 120 – Day 135',
    icon: PackageCheck,
    color: 'text-purple-700',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-300',
    description:
      'Grade, bag, and list your produce on Kisan Saathi for direct buyer access. Upload quality certificates for premium pricing.',
    activities: [
      'Grading by AGMARK standards',
      'FSSAI compliant bagging & labelling',
      'Cold storage booking if needed',
      'Create Kisan Saathi listing',
      'Upload harvest certificate & analysis report',
    ],
    inputs: ['PP woven bags 50 kg', 'AGMARK stamp', 'Moisture / protein test kit'],
    watchout: 'Moisture above 14% leads to Grade B downgrade. Use cold storage if market prices are low.',
    completed: false,
  },
];

export const CropLifeCyclePage: React.FC = () => {
  const [selectedStage, setSelectedStage] = useState<CropStage | null>(CROP_STAGES[3]);
  const [activeCrop, setActiveCrop] = useState('Soybean (Rabi 2025–26)');

  const completedCount = CROP_STAGES.filter(s => s.completed).length;
  const progressPct = Math.round((completedCount / CROP_STAGES.length) * 100);

  return (
    <PageContainer>
      <Breadcrumbs
        items={[
          { label: 'Farmer Dashboard', href: '/farmer' },
          { label: 'Crop Life Cycle Tracker' },
        ]}
        className="mb-4"
      />

      <SectionHeader
        title="Crop Life Cycle Planner — फसल चक्र"
        subtitle="Stage-by-stage agronomy roadmap with recommended inputs, activities, and risk alerts."
        badge="Kharif 2025"
        className="mb-6"
      />

      {/* Crop Selector Row */}
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        {['Soybean (Rabi 2025–26)', 'Wheat (Rabi 2025–26)', 'Cotton (Kharif 2025)'].map(crop => (
          <button
            key={crop}
            onClick={() => setActiveCrop(crop)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold cursor-pointer transition-colors ${
              activeCrop === crop
                ? 'bg-emerald-600 text-white'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            {crop}
          </button>
        ))}
      </div>

      {/* Overall Progress Bar */}
      <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-2xs mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-stone-800">{activeCrop}</span>
          <span className="text-sm font-bold text-emerald-700">
            {completedCount}/{CROP_STAGES.length} stages complete ({progressPct}%)
          </span>
        </div>
        <div className="w-full h-3 bg-stone-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-emerald-700 rounded-full transition-all duration-700"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        <div className="flex items-center gap-4 mt-3 text-xs text-stone-500">
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Completed
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-amber-500" /> Upcoming
          </span>
          <span className="flex items-center gap-1">
            <CalendarDays className="w-3.5 h-3.5 text-blue-500" /> Estimated harvest: Dec 15, 2025
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Stage List */}
        <div className="space-y-2">
          {CROP_STAGES.map((stage, idx) => {
            const Icon = stage.icon;
            const isSelected = selectedStage?.id === stage.id;
            return (
              <button
                key={stage.id}
                onClick={() => setSelectedStage(stage)}
                className={`w-full text-left flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                  isSelected
                    ? `${stage.bgColor} ${stage.borderColor} shadow-xs`
                    : 'bg-white border-stone-200 hover:border-stone-300'
                }`}
              >
                {/* Step Connector */}
                <div className="relative flex flex-col items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                      stage.completed ? 'bg-emerald-600' : stage.bgColor
                    }`}
                  >
                    {stage.completed ? (
                      <CheckCircle2 className="w-4 h-4 text-white" />
                    ) : (
                      <Icon className={`w-4 h-4 ${stage.color}`} />
                    )}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-bold ${stage.completed ? 'text-stone-500' : 'text-stone-800'}`}>
                      {stage.name}
                    </span>
                    <ChevronRight className={`w-3 h-3 ${isSelected ? stage.color : 'text-stone-400'}`} />
                  </div>
                  <span className="text-[10px] text-stone-400">{stage.daysRange}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Stage Detail Panel */}
        <div className="lg:col-span-2">
          {selectedStage ? (
            <div className={`bg-white rounded-2xl border-2 ${selectedStage.borderColor} p-6 shadow-xs`}>
              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold mb-4 ${selectedStage.bgColor} ${selectedStage.color}`}>
                <selectedStage.icon className="w-3.5 h-3.5" />
                Stage {selectedStage.id} of {CROP_STAGES.length}
                {selectedStage.completed && (
                  <span className="ml-1 bg-emerald-600 text-white text-[10px] px-1.5 py-0.5 rounded-full">Completed</span>
                )}
              </div>

              <h2 className="font-display font-bold text-xl text-stone-900 mb-1">{selectedStage.name}</h2>
              <p className={`text-sm font-medium mb-1 ${selectedStage.color}`}>{selectedStage.nameHindi}</p>
              <p className="text-xs text-stone-500 mb-4 flex items-center gap-1">
                <CalendarDays className="w-3 h-3" />
                {selectedStage.daysRange}
              </p>

              <p className="text-sm text-stone-700 leading-relaxed mb-5">{selectedStage.description}</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                {/* Key Activities */}
                <div className={`${selectedStage.bgColor} rounded-xl p-4`}>
                  <h3 className={`text-xs font-bold mb-2 ${selectedStage.color} flex items-center gap-1`}>
                    <CheckCircle2 className="w-3.5 h-3.5" /> Key Activities
                  </h3>
                  <ul className="space-y-1.5">
                    {selectedStage.activities.map((act, i) => (
                      <li key={i} className="flex items-start gap-1.5 text-xs text-stone-700">
                        <span className={`w-1.5 h-1.5 rounded-full mt-1 shrink-0 ${selectedStage.color.replace('text-', 'bg-')}`} />
                        {act}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Recommended Inputs */}
                <div className="bg-stone-50 rounded-xl p-4">
                  <h3 className="text-xs font-bold mb-2 text-stone-700 flex items-center gap-1">
                    <FlaskConical className="w-3.5 h-3.5" /> Recommended Inputs
                  </h3>
                  <ul className="space-y-1.5">
                    {selectedStage.inputs.map((inp, i) => (
                      <li key={i} className="flex items-start gap-1.5 text-xs text-stone-600">
                        <span className="w-1.5 h-1.5 rounded-full mt-1 bg-stone-400 shrink-0" />
                        {inp}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Watch Out */}
              <Alert
                variant="warning"
                title="⚠️ Watch Out"
                description={selectedStage.watchout}
              />

              {!selectedStage.completed && (
                <Button variant="primary" size="sm" className="mt-4">
                  <CheckCircle2 className="w-4 h-4 mr-1.5" />
                  Mark Stage as Complete
                </Button>
              )}
            </div>
          ) : (
            <div className="bg-stone-50 rounded-2xl border border-stone-200 p-10 flex flex-col items-center text-center text-stone-400">
              <Leaf className="w-10 h-10 mb-3" />
              <p className="font-medium">Select a crop stage on the left to view details</p>
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  );
};
