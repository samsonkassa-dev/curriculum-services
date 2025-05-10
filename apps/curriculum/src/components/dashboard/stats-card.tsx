import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  className?: string;
  icon?: React.ReactNode;
  trend?: {
    value: string;
    positive: boolean;
  };
}

export function StatsCard({
  title,
  value,
  description,
  className,
  icon,
  trend,
}: StatsCardProps) {
  return (
    <Card className={cn("p-6 shadow-md h-full", className)}>
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <h3 className="text-2xl font-bold text-primary">{value}</h3>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
          {trend && (
            <div className="flex items-center mt-2">
              <span
                className={cn(
                  "text-sm font-medium",
                  trend.positive ? "text-green-500" : "text-red-500"
                )}
              >
                {trend.positive ? "+" : "-"}{trend.value}
              </span>
              <span className="ml-1 text-xs text-muted-foreground">
                since last month
              </span>
            </div>
          )}
        </div>
        {icon && (
          <div className="w-10 h-10 flex items-center justify-center rounded-full">
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
} 