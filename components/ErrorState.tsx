'use client';

interface ErrorStateProps {
  message: string;
  onRetry: () => void;
  onNewUrl: () => void;
}

export function ErrorState({ message, onRetry, onNewUrl }: ErrorStateProps) {
  const isPrivateVideo =
    message.toLowerCase().includes('privado') ||
    message.toLowerCase().includes('indisponível');

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col items-center gap-5 py-8">
      <div className="w-14 h-14 rounded-full bg-red-500/10 flex items-center justify-center text-2xl">
        ⚠
      </div>

      <div className="text-center">
        <h2 className="text-lg font-semibold text-white mb-2">
          {isPrivateVideo ? 'Vídeo indisponível' : 'Algo deu errado'}
        </h2>
        <p className="text-slate-400 text-sm max-w-md">{message}</p>
      </div>

      <div className="flex gap-3 flex-wrap justify-center">
        <button
          onClick={onRetry}
          className="
            px-5 py-2.5 rounded-lg font-medium bg-orange-500 hover:bg-orange-400
            text-white transition-colors text-sm
          "
        >
          Tentar novamente
        </button>
        <button
          onClick={onNewUrl}
          className="
            px-5 py-2.5 rounded-lg font-medium border border-slate-600
            hover:border-slate-400 text-slate-300 transition-colors text-sm
          "
        >
          Tentar com outra URL
        </button>
      </div>
    </div>
  );
}
