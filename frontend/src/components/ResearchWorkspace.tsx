import { useState } from 'react';
import { ResearchPayload } from '../types';
import { ResearchTimeline } from './ResearchTimeline';
import { EvidencePanel } from './EvidencePanel';
import { EvidenceGraph } from './EvidenceGraph';
import { ConflictPanel } from './ConflictPanel';

export function ResearchWorkspace({
  research,
  arabicFontSize,
  isDemo,
}: {
  research: ResearchPayload;
  arabicFontSize: 'normal' | 'large' | 'huge';
  isDemo?: boolean;
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const insufficient = research.sufficiency?.status === 'insufficient';
  const low = research.sufficiency?.status === 'low_quality';

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-4">
      <div className="xl:col-span-7 space-y-4">
        {isDemo && (
          <div className="rounded-xl border border-amber-400/40 bg-amber-500/15 px-3 py-2 text-xs font-bold tracking-wide text-amber-200">
            OFFLINE DEMO DATA — not live corpus evidence
          </div>
        )}
        {(insufficient || low) && (
          <div className="rounded-xl border border-rose-400/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-100">
            Evidence is insufficient to make a reliable conclusion
            {research.sufficiency?.reason ? `: ${research.sufficiency.reason}` : '.'}
          </div>
        )}
        <ConflictPanel contradictions={research.contradictions || []} />
        <article className="rounded-2xl border border-white/10 bg-[#1e1f20] p-5 space-y-3">
          <div className="flex flex-wrap gap-2 text-[10px] uppercase tracking-wide font-semibold">
            <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10">AI synthesis</span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300">
              {research.sufficiency?.status || 'unknown'}
            </span>
            <span className="px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300">
              confidence {research.confidence?.level} ({Math.round((research.confidence?.score || 0) * 100)}%)
            </span>
            {research.external_research_used && (
              <span className="px-2 py-0.5 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-200">
                External source used
              </span>
            )}
          </div>
          {research.confidence?.note && (
            <p className="text-[11px] text-slate-500">{research.confidence.note}</p>
          )}
          <div className="text-slate-100 whitespace-pre-wrap leading-relaxed text-sm sm:text-base">{research.answer}</div>
          {research.claims?.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-white/10">
              <div className="text-xs font-semibold text-slate-400">Claims</div>
              {research.claims.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => c.sources[0] && setSelectedId(c.sources[0])}
                  className="block w-full text-left text-xs rounded-lg border border-white/10 px-3 py-2 hover:border-blue-400/40"
                >
                  <span
                    className={`mr-2 uppercase font-mono ${
                      c.support === 'supported'
                        ? 'text-emerald-400'
                        : c.support === 'weak'
                        ? 'text-amber-400'
                        : 'text-rose-400'
                    }`}
                  >
                    {c.support}
                  </span>
                  {c.text}
                </button>
              ))}
            </div>
          )}
        </article>
      </div>
      <aside className="xl:col-span-5 space-y-4">
        <div className="rounded-2xl border border-white/10 bg-[#1e1f20] p-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">Research timeline</h3>
          <ResearchTimeline steps={research.timeline || []} />
        </div>
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">Evidence</h3>
          <EvidencePanel
            sources={research.sources || []}
            arabicFontSize={arabicFontSize}
            selectedId={selectedId}
            onSelect={setSelectedId}
          />
          <EvidenceGraph claims={research.claims || []} sources={research.sources || []} />
        </div>
      </aside>
    </div>
  );
}
