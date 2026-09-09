import React from 'react';
import { Sun, CloudRain, Cloud, Wind, Droplets, AlertTriangle } from 'lucide-react';

export interface WeatherDay {
  day: string;
  tempMax: number;
  tempMin: number;
  condition: string;
  rainChance: number;
  icon: 'sun' | 'rain' | 'cloud' | 'wind';
}

export interface WeatherForecastProps {
  locationName?: string;
  days?: WeatherDay[];
  advisoryAlert?: string;
  className?: string;
}

const DEFAULT_DAYS: WeatherDay[] = [
  { day: 'Today', tempMax: 34, tempMin: 22, condition: 'Clear & Sunny', rainChance: 5, icon: 'sun' },
  { day: 'Wed', tempMax: 33, tempMin: 21, condition: 'Partly Cloudy', rainChance: 15, icon: 'cloud' },
  { day: 'Thu', tempMax: 31, tempMin: 20, condition: 'Light Showers', rainChance: 65, icon: 'rain' },
  { day: 'Fri', tempMax: 32, tempMin: 21, condition: 'Clear Sky', rainChance: 10, icon: 'sun' },
  { day: 'Sat', tempMax: 35, tempMin: 23, condition: 'Dry & Breezy', rainChance: 0, icon: 'wind' },
];

export const WeatherForecast: React.FC<WeatherForecastProps> = ({
  locationName = 'Sehore District, MP (Malwa Agro-Climatic Zone)',
  days = DEFAULT_DAYS,
  advisoryAlert = 'Favorable dry conditions for wheat & gram harvesting over next 48 hours. Postpone urea top dressing if showers arrive Thursday.',
  className = ''
}) => {
  const getIcon = (icon: string) => {
    switch (icon) {
      case 'sun': return <Sun className="w-5 h-5 text-amber-500" />;
      case 'rain': return <CloudRain className="w-5 h-5 text-sky-500" />;
      case 'wind': return <Wind className="w-5 h-5 text-teal-500" />;
      default: return <Cloud className="w-5 h-5 text-stone-400" />;
    }
  };

  return (
    <div className={`p-5 bg-gradient-to-br from-emerald-900 to-stone-900 text-white rounded-2xl shadow-sm border border-emerald-800/60 space-y-4 ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-white/10 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <h3 className="font-bold text-sm text-emerald-200 uppercase tracking-wider font-display">
              Agro-Meteorological Forecast
            </h3>
          </div>
          <p className="text-xs text-stone-300 mt-0.5">{locationName}</p>
        </div>
        <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-white/10 text-emerald-300 w-fit">
          IMD Verified
        </span>
      </div>

      {/* Days forecast row */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
        {days.map((d, idx) => (
          <div
            key={d.day}
            className={`p-3 rounded-xl flex flex-col items-center justify-between text-center transition-all ${
              idx === 0 ? 'bg-white/15 border border-emerald-400/30' : 'bg-white/5 border border-white/5'
            }`}
          >
            <span className="text-xs font-bold text-stone-200">{d.day}</span>
            <div className="my-2">{getIcon(d.icon)}</div>
            <div className="text-xs font-bold">
              <span>{d.tempMax}°</span>
              <span className="text-stone-400 font-normal ml-1">/ {d.tempMin}°</span>
            </div>
            <div className="flex items-center gap-1 text-[10px] text-sky-300 mt-1 font-medium">
              <Droplets className="w-2.5 h-2.5" />
              <span>{d.rainChance}%</span>
            </div>
          </div>
        ))}
      </div>

      {/* Advisory Alert Banner */}
      {advisoryAlert && (
        <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-500/15 border border-amber-400/30 text-amber-200 text-xs leading-relaxed">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block text-amber-300">Krishi Vigyan Advisory:</span>
            <span>{advisoryAlert}</span>
          </div>
        </div>
      )}
    </div>
  );
};
