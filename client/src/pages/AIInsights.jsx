import { useState, useEffect } from 'react';
import { Sparkles, RefreshCw, Loader2, Bot, Info } from 'lucide-react';
import { Button } from '../components/ui/button';
import { aiService } from '../services/api';
import toast from 'react-hot-toast';

function MarkdownText({ text }) {
  if (!text) return null;
  const blocks = text.split('\n\n');
  
  return (
    <div className="space-y-4 text-zinc-300 leading-relaxed">
      {blocks.map((block, i) => {
        const lines = block.split('\n');
        return (
          <div key={i} className="space-y-2">
            {lines.map((line, j) => {
              let textContent = line.trim();
              const isBullet = textContent.startsWith('- ') || textContent.startsWith('* ');
              if (isBullet) {
                textContent = textContent.slice(2);
              }

              // Basic bold markdown parser
              const parts = textContent.split(/(\*\*.*?\*\*)/g);
              const formattedLine = parts.map((part, k) => {
                if (part.startsWith('**') && part.endsWith('**')) {
                  return <strong key={k} className="text-white font-semibold">{part.slice(2, -2)}</strong>;
                }
                return <span key={k}>{part}</span>;
              });

              if (isBullet) {
                return (
                  <div key={j} className="flex gap-3 ml-2">
                    <span className="text-yellow-400 mt-1.5 shrink-0">•</span>
                    <span>{formattedLine}</span>
                  </div>
                );
              }

              return <p key={j}>{formattedLine}</p>;
            })}
          </div>
        );
      })}
    </div>
  );
}

export default function AIInsights() {
  const [insightText, setInsightText] = useState('');
  const [loading, setLoading] = useState(true);
  const [isUnavailable, setIsUnavailable] = useState(false);

  useEffect(() => {
    fetchInsights();

    const handleUpdate = () => {
      // Invalidate cache and fetch new insights when data changes
      sessionStorage.removeItem('paisapilot_insights');
      fetchInsights();
    };

    window.addEventListener('data-updated', handleUpdate);
    return () => window.removeEventListener('data-updated', handleUpdate);
  }, []);

  const fetchInsights = async (forceRefresh = false) => {
    setLoading(true);
    setIsUnavailable(false);

    if (!forceRefresh) {
      const cached = sessionStorage.getItem('paisapilot_insights');
      if (cached) {
        setInsightText(cached);
        setLoading(false);
        return;
      }
    }

    try {
      const response = await aiService.getInsights();
      setInsightText(response.insightText);
      sessionStorage.setItem('paisapilot_insights', response.insightText);
    } catch (error) {
      if (error.response?.status === 503) {
        setIsUnavailable(true);
      } else {
        toast.error('Failed to load AI insights');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    sessionStorage.removeItem('paisapilot_insights');
    fetchInsights(true);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="h-10 w-10 text-yellow-400 animate-spin" />
        <p className="text-zinc-400 font-medium animate-pulse">Analyzing your financial data...</p>
      </div>
    );
  }

  if (isUnavailable) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center max-w-md mx-auto px-4">
        <Bot className="h-12 w-12 text-zinc-500 mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">AI Temporarily Unavailable</h2>
        <p className="text-zinc-400 mb-6">
          Your local Ollama instance is not responding. Please make sure <code className="text-yellow-400 bg-zinc-900 px-1 py-0.5 rounded">ollama run llama3.2:1b</code> is running locally.
        </p>
        <Button onClick={handleRefresh} className="bg-yellow-400 hover:bg-yellow-500 text-black">
          <RefreshCw className="mr-2 h-4 w-4" /> Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-yellow-400" />
            Financial Insights
          </h1>
          <p className="text-zinc-400 text-sm mt-1">
            Personalized intelligence based on your recent activity
          </p>
        </div>
        
        <Button 
          variant="outline" 
          onClick={handleRefresh}
          className="border-zinc-700 bg-zinc-900 text-zinc-300 hover:text-white hover:bg-zinc-800"
        >
          <RefreshCw className="mr-2 h-4 w-4" /> Refresh Insights
        </Button>
      </div>

      <div className="bg-zinc-950 border border-zinc-800 rounded-xl p-6 shadow-sm">
        <div className="flex items-start gap-4 mb-6">
          <div className="mt-1 bg-yellow-400/10 p-2 rounded-lg">
            <Info className="h-5 w-5 text-yellow-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white mb-1">Your Financial Picture</h3>
            <p className="text-sm text-zinc-500">Generated automatically by analyzing your spending, budgets, and goals.</p>
          </div>
        </div>
        
        <div className="bg-zinc-900/50 rounded-xl p-6 border border-zinc-800/50">
          <MarkdownText text={insightText} />
        </div>
      </div>
    </div>
  );
}
