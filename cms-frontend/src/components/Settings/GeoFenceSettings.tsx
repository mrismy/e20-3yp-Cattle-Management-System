import { useState } from 'react';

interface GeoFenceSettingsProps {
  dangerThreshold: number;
  safeThreshold: number;
  setSafeThreshold: (value: number) => void;
  setDangerThreshold: (value: number) => void;
}

const GeoFenceSettings = ({
  safeThreshold,
  setSafeThreshold,
  dangerThreshold,
  setDangerThreshold,
}: GeoFenceSettingsProps) => {
  const MAX_THRESHOLD = 25;

  const center = 150;
  const baseDangerRadius = 70;
  const baseSafeRadius = 130;

  const dangerRadius = baseDangerRadius + dangerThreshold;
  const safeRadius = Math.max(baseSafeRadius - safeThreshold, 5); // avoid 0 radius

  const handleThresholdChange = (type: 'danger' | 'safe', delta: number) => {
    if (type === 'danger') {
      const newValue = Math.min(
        Math.max(dangerThreshold + delta, 0),
        MAX_THRESHOLD
      );
      setDangerThreshold(newValue);
    } else {
      const newValue = Math.min(
        Math.max(safeThreshold + delta, 0),
        MAX_THRESHOLD
      );
      setSafeThreshold(newValue);
    }
  };

  return (
    <div className="bg-gray-50 p-6 shadow-2xs rounded-lg w-1/3">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-700">
          GeoFence Settings
        </h2>
        <span className="px-2 py-1 bg-green-100 text-green-800 text-sm rounded-full">
          Map
        </span>
      </div>

      <div className="flex items-center justify-center">
        <svg viewBox="0 0 300 300" className="w-[350px] h-[350px]">
          {/* Danger zone (fixed) */}
          <circle
            cx={center}
            cy={center}
            r={baseDangerRadius}
            fill="none"
            stroke="#ef4444"
            strokeWidth="2"
          />
          {/* Safe zone (fixed) */}
          <circle
            cx={center}
            cy={center}
            r={baseSafeRadius}
            fill="none"
            stroke="#10b981"
            strokeWidth="2"
          />
          {/* Dynamic danger threshold */}
          <circle
            cx={center}
            cy={center}
            r={dangerRadius}
            fill="none"
            stroke="#fca5a5"
            strokeWidth="1"
            strokeDasharray="2 1"
          />
          {/* Dynamic safe threshold */}
          <circle
            cx={center}
            cy={center}
            r={safeRadius}
            fill="none"
            stroke="#6ee7b7"
            strokeWidth="1"
            strokeDasharray="2 1"
          />
        </svg>
      </div>

      <div className="mt-4 text-center">
        <div className="grid grid-cols-2 gap-4">
          {[
            {
              type: 'danger',
              value: dangerThreshold,
              label: 'DANGER THRESHOLD',
              color: 'red',
            },
            {
              type: 'safe',
              value: safeThreshold,
              label: 'SAFE THRESHOLD',
              color: 'green',
            },
          ].map(({ type, value, label, color }) => (
            <div key={type} className="space-y-2">
              <label className="block text-xs font-medium text-gray-500">
                {label}
              </label>
              <div className="flex items-center space-x-1">
                <button
                  onClick={() =>
                    handleThresholdChange(type as 'danger' | 'safe', -1)
                  }
                  disabled={value <= 0}
                  className={`w-7 h-7 flex items-center justify-center rounded-lg transition-colors ${
                    value <= 0
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-gray-200 hover:bg-gray-300'
                  }`}>
                  <span className="text-lg">−</span>
                </button>
                <div
                  className={`flex-1 text-center py-1.5 bg-white rounded-lg border font-medium ${
                    value >= MAX_THRESHOLD
                      ? `border-${color}-300 bg-${color}-50`
                      : 'border-gray-300'
                  }`}>
                  {value}m
                </div>
                <button
                  onClick={() =>
                    handleThresholdChange(type as 'danger' | 'safe', 1)
                  }
                  disabled={value >= MAX_THRESHOLD}
                  className={`w-7 h-7 flex items-center justify-center rounded-lg transition-colors ${
                    value >= MAX_THRESHOLD
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-gray-200 hover:bg-gray-300'
                  }`}>
                  <span className="text-lg">+</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GeoFenceSettings;
