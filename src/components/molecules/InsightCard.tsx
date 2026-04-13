import React from 'react';
import { Insight } from '@/services/InsightsEngine';
import { AlertCircle, Info, Zap, ChevronRight, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface InsightCardProps {
  insight: Insight;
}

export const InsightCard: React.FC<InsightCardProps> = ({ insight }) => {
  const isCritical = insight.type === 'CRITICAL';
  const isWarning = insight.type === 'WARNING';

  // Aesthetic mapping
  const config = {
    CRITICAL: {
      bg: 'bg-rose-500/10',
      border: 'border-rose-500/20',
      text: 'text-rose-500',
      icon: <AlertCircle className="w-5 h-5" />,
      glow: 'shadow-[0_0_20px_rgba(244,63,94,0.1)]'
    },
    WARNING: {
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/20',
      text: 'text-amber-500',
      icon: <Zap className="w-5 h-5" />,
      glow: 'shadow-[0_0_20px_rgba(245,158,11,0.1)]'
    },
    INFO: {
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/20',
      text: 'text-blue-500',
      icon: <Info className="w-5 h-5" />,
      glow: 'shadow-[0_0_20px_rgba(59,130,246,0.1)]'
    }
  }[insight.type];

  return (
    <div className={cn(
      "group relative p-5 rounded-3xl border transition-all duration-500 hover:scale-[1.02] active:scale-[0.98]",
      config.bg,
      config.border,
      config.glow
    )}>
      <div className="flex items-start gap-4">
        <div className={cn(
          "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border transition-transform duration-500 group-hover:rotate-6",
          config.border,
          "bg-white/[0.03]"
        )}>
          <div className={config.text}>
            {config.icon}
          </div>
        </div>

        <div className="flex-1 space-y-1">
          <div className="flex items-center justify-between">
            <h4 className={cn("text-sm font-black uppercase tracking-widest", config.text)}>
              {insight.title}
            </h4>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
               <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">İncele</span>
               <ChevronRight className="w-3 h-3 text-muted-foreground" />
            </div>
          </div>
          <p className="text-sm font-medium text-white/70 leading-relaxed">
            {insight.message}
          </p>
        </div>
      </div>
      
      {/* Decorative Gradient Background Reveal */}
      <div className={cn(
        "absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-10 transition-opacity duration-700 pointer-events-none",
        isCritical ? "bg-gradient-to-br from-rose-500/50 to-transparent" : 
        isWarning ? "bg-gradient-to-br from-amber-500/50 to-transparent" :
        "bg-gradient-to-br from-blue-500/50 to-transparent"
      )} />
    </div>
  );
};
