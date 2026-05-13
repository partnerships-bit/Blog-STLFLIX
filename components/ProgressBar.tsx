'use client';

const STAGE_LABELS: Record<string, string> = {
  validating: 'Validando URL...',
  cache_hit: 'Transcrição em cache — gerando artigo...',
  transcribing: 'Transcrevendo áudio via Assembly AI...',
  generating: 'Gerando artigo com Claude...',
  done: 'Artigo gerado!',
};

interface ProgressBarProps {
  progress: number;
  stage: string;
}

export function ProgressBar({ progress, stage }: ProgressBarProps) {
  const label = STAGE_LABELS[stage] ?? 'Processando...';

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col gap-4">
      <div className="flex justify-between items-center text-sm">
        <span className="text-slate-300">{label}</span>
        <span className="text-orange-400 font-mono font-semibold">{progress}%</span>
      </div>

      <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-orange-500 rounded-full transition-all duration-700 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <p className="text-xs text-slate-500 text-center">
        Aguarde — vídeos de 15–30 min levam até 2 minutos
      </p>
    </div>
  );
}
