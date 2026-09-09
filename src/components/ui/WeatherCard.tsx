import React from 'react';
import { CloudRain, Sun, Cloud, Wind, Droplets, ShieldAlert, CheckCircle2 } from 'lucide-react';

export interface WeatherCardProps {
  district?: string;
  state?: string;
  temperature?: number;
  condition?: 'Sunny' | 'Partly Cloudy' | 'Rainy' | 'Humid';
  humidity?: number;
  windSpeed?: number;
  rainProbability?: number;
  sprayAdvisory?: string;
  className?: string;
}

export const WeatherCard: React.FC<WeatherCardProps> = ({
  district = 'Sehore',
  state = 'Madhya Pradesh',
  temperature = 31,
  condition = 'Sunny',
  humidity = 48,
  windSpeed = 12,
  rainProbability = 10,
  sprayAdvisory = 'Clear skies: Favorable window for pest control spraying and farm gate threshing.',
  className = ''
}) => {
  const isRainRisk = rainProbability > 40;

  const getConditionIcon = () => {
    switch (condition) {
      case 'Rainy':
        return <CloudRain className="w-8 h-8 text-sky-500" />;
      case 'Partly Cloudy':
        return <Cloud className="w-8 h-8 text-amber-400" />;
      default:
        return <Sun className="w-8 h-8 text-amber-500 animate-spin-slow" />;
    }
  };

  return (
    <div className={`bg-gradient-to-br from-stone-900 via-stone-800 to-emerald-950 text-white rounded-2xl p-5 border border-stone-800 shadow-md space-y-3.5 ${className}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-300 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Mandi Micro-Climate Forecast
          </div>
          <h3 className="text-base font-extrabold font-display text-white mt-0.5">
            {district}, {state}
          </h3>
        </div>
        <div className="p-2 bg-white/10 rounded-xl backdrop-blur-xs">
          {getConditionIcon()}
        </div>
      </div>

      <div className="flex items-baseline gap-3">
        <span className="text-3xl font-black font-display text-white tracking-tight">
          {temperature}°C
        </span>
        <span className="text-xs font-semibold text-stone-300">
          {condition}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2 text-xs pt-1 border-t border-white/10">
        <div className="flex items-center gap-1.5 text-stone-300">
          <Droplets className="w-3.5 h-3.5 text-sky-400 shrink-0" />
          <span>{humidity}% Hum</span>
        </div>
        <div className="flex items-center gap-1.5 text-stone-300">
          <Wind className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>{windSpeed} km/h</span>
        </div>
        <div className="flex items-center gap-1.5 text-stone-300">
          <CloudRain className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>{rainProbability}% Rain</span>
        </div>
      </div>

      <div className={`p-2.5 rounded-xl text-xs flex items-start gap-2 border ${
        isRainRisk 
          ? 'bg-amber-950/60 border-amber-600/50 text-amber-200' 
          : 'bg-emerald-950/60 border-emerald-700/50 text-emerald-200'
      }`}>
        {isRainRisk ? (
          <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        ) : (
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
        )}
        <div className="leading-snug text-[11px]">
          <strong className="block font-bold">Agronomic Spray Advisory:</strong>
          {sprayAdvisory}
        </div>
      </div>
    </div>
  );
};
