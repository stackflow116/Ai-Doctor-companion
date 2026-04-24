
import React from 'react';
import { GroundingChunk } from '../types';

interface GroundingChipsProps {
  chunks: GroundingChunk[];
}

export const GroundingChips: React.FC<GroundingChipsProps> = ({ chunks }) => {
  const mapChunks = chunks.filter(c => c.maps && c.maps.formattedAddress);
  if (mapChunks.length === 0) return null;

  return (
    <div className="mt-3 space-y-2">
      <h4 className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-1">Nearby Resources</h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {mapChunks.map((chunk, idx) => {
          const mapData = chunk.maps!;
          return (
            <a
              key={idx}
              href={mapData.uri || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="block group bg-white dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 rounded-lg p-2 hover:border-blue-300 dark:hover:border-blue-500 hover:shadow-sm transition-all"
            >
              <div className="flex items-center gap-2.5">
                <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 p-1.5 rounded-md group-hover:bg-blue-600 group-hover:text-white transition-colors shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <h5 className="text-[11px] font-bold text-slate-700 dark:text-slate-200 truncate group-hover:text-blue-700 dark:group-hover:text-blue-400 leading-tight">
                    {mapData.displayName || "Medical Facility"}
                  </h5>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 truncate mt-0.5">{mapData.formattedAddress}</p>
                </div>
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
};
