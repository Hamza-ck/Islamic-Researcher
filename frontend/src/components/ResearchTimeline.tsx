import { ResearchTimelineStep } from '../types';
import { CheckCircle2, Circle, Loader2 } from 'lucide-react';

const LABELS: Record<string, string> = {
  query_understood: 'Query understood',
  routing: 'Source routing',
  retrieval: 'Hybrid retrieval',
  reranking: 'Reranking',
  evidence_check: 'Evidence check',
  external_research: 'External research',
  verification: 'Verification',
  complete: 'Complete',
  continue: 'Continued',
};

export function ResearchTimeline({
  steps,
  active,
}: {
  steps: ResearchTimelineStep[];
  active?: boolean;
}) {
  const order = [
    'query_understood',
    'retrieval',
    'reranking',
    'evidence_check',
    'external_research',
    'verification',
    'complete',
  ];
  const seen = new Set(steps.map((s) => s.stage));
  return (
    <ol className="space-y-2">
      {order.map((stage) => {
        const hit = [...steps].reverse().find((s) => s.stage === stage);
        const done = seen.has(stage);
        return (
          <li key={stage} className="flex items-start gap-2 text-xs">
            {done ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
            ) : active ? (
              <Loader2 className="w-3.5 h-3.5 text-blue-400 mt-0.5 shrink-0 animate-spin" />
            ) : (
              <Circle className="w-3.5 h-3.5 text-slate-600 mt-0.5 shrink-0" />
            )}
            <div>
              <div className="text-slate-200 font-medium">{LABELS[stage] || stage}</div>
              {hit?.detail && <div className="text-slate-500">{hit.detail}</div>}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
