import React from 'react';
import { GroundingChunk } from '../types';

interface GroundingChipsProps {
  chunks: GroundingChunk[];
}

export const GroundingChips: React.FC<GroundingChipsProps> = ({ chunks }) => {
  // Filter for valid map chunks
  const mapChunks = chunks.filter(c => c.maps && c.maps.formattedAddress);

  if (mapChunks.length === 0) return null;

  return (
    <div className="mt-4 space-y-3">
      <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Local Resources Found</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {mapChunks.map((chunk, idx) => {
          const mapData = chunk.maps!;
          return (
            <a
              key={idx}
              href={mapData.uri || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="block group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-md transition-all"
            >
              <div className="flex items-start gap-3">
                <div className="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 p-2 rounded-lg group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <h5 className="font-semibold text-slate-800 dark:text-slate-200 truncate group-hover:text-blue-700 dark:group-hover:text-blue-400">
                    {mapData.displayName || "Medical Facility"}
                  </h5>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{mapData.formattedAddress}</p>
                </div>
              </div>
            </a>
          );
        })}
      </div>
    </div>
  );
};