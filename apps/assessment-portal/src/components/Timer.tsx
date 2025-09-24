import { Clock } from "lucide-react";
import { clsx } from "clsx";

interface TimerProps {
  timeRemaining: number; // in seconds
  className?: string;
}

export function Timer({ timeRemaining, className }: TimerProps) {
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const isUrgent = timeRemaining <= 300; // Less than 5 minutes
  const isCritical = timeRemaining <= 60; // Less than 1 minute

  return (
    <div className={clsx(
      "flex items-center gap-3 px-4 py-3 rounded-lg font-mono text-sm font-medium border shadow-sm",
      {
        "bg-accent border-primary/20 text-primary": !isUrgent,
        "bg-yellow-50 border-yellow-300 text-yellow-900": isUrgent && !isCritical,
        "bg-destructive/10 border-destructive text-destructive animate-pulse": isCritical,
      },
      className
    )}>
      <Clock className={clsx("h-4 w-4", {
        "text-primary": !isUrgent,
        "text-yellow-600": isUrgent && !isCritical,
        "text-destructive": isCritical,
      })} />
      <span className="font-bold">{formatTime(timeRemaining)}</span>
    </div>
  );
}
