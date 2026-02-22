import { FileQuestion } from 'lucide-react';
import { Button } from '../ui/button';

export default function EmptyState({ title, description, actionText, onAction, icon: Icon = FileQuestion }) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-zinc-900/50 border border-zinc-800 border-dashed rounded-xl">
      <div className="h-16 w-16 bg-zinc-900 rounded-2xl flex items-center justify-center border border-zinc-800 mb-6">
        <Icon className="h-8 w-8 text-zinc-500" />
      </div>
      <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
      <p className="text-zinc-400 max-w-sm mb-8">{description}</p>
      
      {actionText && onAction && (
        <Button 
          onClick={onAction}
          className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold px-6"
        >
          {actionText}
        </Button>
      )}
    </div>
  );
}
