import { ResearchContradiction } from '../types';
import { GitCompare } from 'lucide-react';

export function ConflictPanel({ contradictions }: { contradictions: ResearchContradiction[] }) {
  if (!contradictions.length) return null;
  return (
    <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 space-y-2">
      <div className="flex items-center gap-2 text-amber-200 text-sm font-semibold">
        <GitCompare className="w-4 h-4" />
        Scholarly disagreement detected
      </div>
      {contradictions.map((c, i) => (
        <p key={i} className="text-sm text-amber-100/90 leading-relaxed">
          {c.summary}
        </p>
      ))}
    </div>
  );
}
