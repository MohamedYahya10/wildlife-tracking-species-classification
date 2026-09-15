import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  Database,
  ArrowUpRight,
  ShieldCheck,
  Tag,
  BookOpen
} from 'lucide-react';
import { fetchAllAnimals } from '../services/cameraTrapService.ts';
import { AnimalEntity, AnimalSpecies } from '../types.ts';
import { SPECIES_DATABASE } from '../data/wildlifeData.ts';

interface SpeciesDatabaseViewProps {
  onSelectSpecies?: (species: AnimalSpecies) => void;
}

export const SpeciesDatabaseView: React.FC<SpeciesDatabaseViewProps> = ({
  onSelectSpecies,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [animals, setAnimals] = useState<AnimalEntity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAnimals() {
      try {
        const list = await fetchAllAnimals();
        setAnimals(list);
      } catch (err) {
        console.error('Failed to load animals from API:', err);
      } finally {
        setLoading(false);
      }
    }
    loadAnimals();
  }, []);

  const filteredAnimals = animals.filter(a => {
    const term = searchTerm.toLowerCase();
    return (
      a.animal_name.toLowerCase().includes(term) ||
      a.scientific_name.toLowerCase().includes(term) ||
      a.class_index.toString().includes(term) ||
      a.description.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-stone-900 border border-stone-800 rounded-xl p-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-bold font-mono text-white uppercase tracking-wider">
              Exact 40 Camera Trap Reference Species (Classes 0–39)
            </h2>
          </div>
          <p className="text-xs text-stone-400 mt-1">
            Official 40-species taxonomy catalog from database with scientific names, descriptions, and fixed index mappings.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-emerald-950/80 border border-emerald-800 rounded-full text-xs font-mono text-emerald-300">
            {animals.length} Verified Species
          </span>
          <span className="px-3 py-1 bg-stone-800 border border-stone-700 rounded-full text-xs font-mono text-stone-300">
            Fixed Index: 0–39
          </span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-stone-900 border border-stone-800 rounded-xl p-4 flex items-center gap-3">
        <Search className="w-4 h-4 text-stone-400" />
        <input
          type="text"
          placeholder="Filter by species name, scientific name, class index (e.g. '0', 'Tiger', 'Panthera')..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-transparent border-none text-xs text-stone-200 placeholder-stone-500 focus:outline-none font-mono"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="text-xs text-stone-400 hover:text-white px-2 py-0.5 rounded bg-stone-800"
          >
            Clear
          </button>
        )}
      </div>

      {/* Table / Grid View of 40 Species */}
      {loading ? (
        <div className="p-12 text-center text-stone-500 font-mono text-xs">
          Loading 40 wildlife species from database...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAnimals.map((animal) => {
            const correspondingSpecies = SPECIES_DATABASE.find(
              s => s.commonName.toLowerCase() === animal.animal_name.toLowerCase()
            );

            return (
              <div
                key={animal.animal_id}
                className="bg-stone-900 border border-stone-800 hover:border-emerald-500/40 rounded-xl p-5 flex flex-col justify-between transition group"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-stone-800 border border-stone-700 rounded text-[10px] font-mono text-emerald-400 font-bold">
                          Class #{animal.class_index}
                        </span>
                        <h3 className="text-sm font-bold text-white group-hover:text-emerald-300 transition">
                          {animal.animal_name}
                        </h3>
                      </div>
                      <p className="text-xs font-serif italic text-emerald-400 mt-1">
                        {animal.scientific_name}
                      </p>
                    </div>

                    {correspondingSpecies && onSelectSpecies && (
                      <button
                        onClick={() => onSelectSpecies(correspondingSpecies)}
                        className="p-1.5 rounded bg-stone-800 hover:bg-emerald-900 text-stone-400 hover:text-white transition"
                        title="View Full Archival Dossier"
                      >
                        <BookOpen className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <p className="text-xs text-stone-300 leading-relaxed mt-2 line-clamp-3">
                    {animal.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-stone-800/80 flex items-center justify-between text-[10px] font-mono text-stone-400">
                  <span>DB ID: #{animal.animal_id}</span>
                  <span className="text-emerald-500/80">Target Species 40</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
