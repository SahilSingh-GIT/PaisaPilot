import { Loader2 } from 'lucide-react';

export default function LoadingState({ message = 'Loading...' }) {
  return (
    <div className="flex flex-col items-center justify-center p-12 w-full h-full min-h-[300px]">
      <Loader2 className="h-10 w-10 text-yellow-400 animate-spin mb-4" />
      <p className="text-zinc-400 font-medium">{message}</p>
    </div>
  );
}
