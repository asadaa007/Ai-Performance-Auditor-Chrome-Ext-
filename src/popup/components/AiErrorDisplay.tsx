import { useState } from 'react';
import type { FriendlyAIError } from '@features/ai/errors';
import { Button } from '@shared/components';

interface AiErrorDisplayProps {
  error: FriendlyAIError;
  onRetry?: () => void;
}

export function AiErrorDisplay({ error, onRetry }: AiErrorDisplayProps) {
  const [showTechnical, setShowTechnical] = useState(false);

  return (
    <div className="rounded-lg border border-auditor-danger/30 bg-auditor-danger-muted p-3 text-xs">
      <p className="font-semibold text-auditor-text">{error.title}</p>
      <p className="mt-1 leading-relaxed text-auditor-text-secondary">{error.explanation}</p>
      <p className="mt-2 text-auditor-muted">
        <span className="font-medium text-auditor-text-secondary">Suggested action: </span>
        {error.suggestedAction}
      </p>

      <div className="mt-3 flex flex-wrap gap-2">
        <Button size="sm" variant="ghost" onClick={() => setShowTechnical((value) => !value)}>
          {showTechnical ? 'Hide technical details' : 'Technical details'}
        </Button>
        {error.retryable && onRetry && (
          <Button size="sm" onClick={onRetry}>
            Retry
          </Button>
        )}
      </div>

      {showTechnical && (
        <pre className="mt-3 max-h-40 overflow-auto rounded-lg border border-auditor-border-subtle bg-auditor-bg-elevated p-2 font-mono text-2xs text-auditor-muted">
          {error.technicalDetails}
        </pre>
      )}
    </div>
  );
}
