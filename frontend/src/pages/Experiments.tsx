import { Search, FlaskConical } from 'lucide-react';
import { useMemo, useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import ExperimentCard from '@/components/experiment/ExperimentCard';
import { api } from '@/services/api';
import { useQuery } from '@/hooks/useApi';
import { toExperiment } from '@/services/adapters';

const statusFilters = ['All', 'Active', 'Completed', 'Scheduled'] as const;

const EXPERIMENTS_POLL_MS = 5000;

export default function Experiments() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<typeof statusFilters[number]>('All');

  const { data, loading, error } = useQuery(() => api.listExperiments(), {
    intervalMs: EXPERIMENTS_POLL_MS,
  });

  const experiments = useMemo(() => (data ?? []).map(toExperiment), [data]);

  const filtered = experiments.filter((e) => {
    const matchesSearch =
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      e.id.toLowerCase().includes(search.toLowerCase()) ||
      e.category.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'All' || e.status === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <AppLayout title="Experiments" subtitle="Manage and monitor all onboard scientific experiments.">
      {error && (
        <div className="panel border-redx-500/30 p-3 mb-4">
          <p className="text-xs text-redx-400">Backend unreachable — {error}</p>
        </div>
      )}

      {/* Search and filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-space-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search experiments by name, ID, or category..."
            className="input-field w-full pl-10"
          />
        </div>
        <div className="flex gap-2">
          {statusFilters.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                filter === f
                  ? 'bg-accent-500/15 text-accent-300 border border-accent-500/30'
                  : 'bg-space-800/60 text-space-300 border border-space-600/40 hover:bg-space-700/50'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Experiment count */}
      <div className="flex items-center gap-2 mb-4">
        <FlaskConical className="w-4 h-4 text-space-400" />
        <span className="text-sm text-space-300">
          {loading ? 'Loading experiments…' : `${filtered.length} experiment${filtered.length !== 1 ? 's' : ''}`}
        </span>
      </div>

      {/* Experiment grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((exp) => (
          <ExperimentCard key={exp.id} experiment={exp} />
        ))}
      </div>

      {!loading && filtered.length === 0 && (
        <div className="text-center py-16">
          <FlaskConical className="w-10 h-10 text-space-500 mx-auto mb-3" />
          <p className="text-sm text-space-300">No experiments found matching your search.</p>
        </div>
      )}
    </AppLayout>
  );
}
