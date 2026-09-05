import { ResearchClaim, RawSearchResult } from '../types';

export function EvidenceGraph({ claims, sources }: { claims: ResearchClaim[]; sources: RawSearchResult[] }) {
  const byId = Object.fromEntries(sources.map((s) => [s.id, s]));
  if (!claims.length) return null;
  return (
    <div className="rounded-2xl border border-white/10 p-4 space-y-2">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Claim → source map</h3>
      <ul className="space-y-2 text-xs text-slate-300">
        {claims.map((c) => (
          <li key={c.id}>
            <span className="font-mono text-slate-500">{c.id}</span>{' '}
            {c.sources.length
              ? c.sources.map((sid) => (
                  <a key={sid} href={`#folio-${sid}`} className="text-blue-300 hover:underline mr-2">
                    {byId[sid]?.citation || sid}
                  </a>
                ))
              : <span className="text-rose-300">unsupported</span>}
          </li>
        ))}
      </ul>
    </div>
  );
}
