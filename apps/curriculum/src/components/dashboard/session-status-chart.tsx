/* eslint-disable @typescript-eslint/no-explicit-any */
import { Card } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { SessionAnalytics } from "@/lib/hooks/useAnalytics";
import { cn } from "@/lib/utils";

interface SessionStatusChartProps {
  data: SessionAnalytics[];
  title?: string;
  className?: string;
  limit?: number;
}

export function SessionStatusChart({
  data,
  title = "Session Status by Training",
  className,
  limit = 5,
}: SessionStatusChartProps) {
  // Sort data by total session count (descending)
  const sortedData = [...data]
    .filter(item => item.totalSessionCount > 0)
    .sort((a, b) => b.totalSessionCount - a.totalSessionCount)
    .slice(0, limit);
  
  // Format the data for recharts
  const chartData = sortedData.map(training => {
    return {
      name: training.trainingName.length > 15 
        ? `${training.trainingName.substring(0, 15)}...` 
        : training.trainingName,
      fullName: training.trainingName,
      active: training.activeSessionCount,
      completed: training.completedSessionCount,
      cancelled: training.cancelledSessionCount,
      total: training.totalSessionCount,
    };
  });
  
  // Custom tooltip for prettier display
  const CustomTooltip = ({ active, payload, label }: {
    active?: boolean;
    payload?: Array<any>;
    label?: string;
  }) => {
    if (active && payload && payload.length) {
      const training = chartData.find(item => item.name === label);
      
      return (
        <div className="bg-white p-3 border border-gray-200 shadow-lg rounded-lg">
          <p className="font-medium text-sm text-gray-900">
            {training?.fullName || label}
          </p>
          <div className="mt-2 space-y-1">
            {payload.map((entry, index) => (
              <p key={index} className="text-sm" style={{ color: entry.color }}>
                {`${entry.name}: ${entry.value} sessions`}
              </p>
            ))}
            <p className="text-sm text-gray-700 border-t border-gray-200 pt-1 mt-1">
              {`Total: ${training?.total} sessions`}
            </p>
          </div>
        </div>
      );
    }
    
    return null;
  };
  
  return (
    <Card className={cn("p-5 shadow-sm rounded-xl overflow-hidden", className)}>
      <h3 className="text-lg font-semibold mb-5 text-gray-800">{title}</h3>
      
      {chartData.length === 0 ? (
        <div className="h-64 w-full flex justify-center items-center text-gray-500">
          No session data available
        </div>
      ) : (
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{
                top: 5,
                right: 10,
                left: 10,
                bottom: 20,
              }}
              layout="vertical"
            >
              <CartesianGrid 
                strokeDasharray="3 3" 
                horizontal={true} 
                vertical={false} 
                stroke="#E5E7EB" 
              />
              <XAxis 
                type="number" 
                tick={{ fontSize: 12, fill: '#6B7280' }}
                axisLine={{ stroke: '#D1D5DB' }}
                tickLine={false}
              />
              <YAxis 
                type="category" 
                dataKey="name" 
                width={100}
                tick={{ fontSize: 12, fill: '#6B7280' }}
                axisLine={{ stroke: '#D1D5DB' }}
                tickLine={false}
              />
              <Tooltip 
                content={<CustomTooltip />} 
                cursor={{ fill: 'rgba(224, 231, 255, 0.3)' }} 
              />
              <Legend 
                iconType="circle"
                iconSize={10}
                wrapperStyle={{ paddingTop: '15px' }}
              />
              <Bar 
                dataKey="active" 
                name="Active" 
                stackId="a" 
                fill="#0B75FF" 
                radius={[0, 0, 0, 0]} 
                animationDuration={1500}
              />
              <Bar 
                dataKey="completed" 
                name="Completed" 
                stackId="a" 
                fill="#8EEDF7" 
                radius={[0, 0, 0, 0]} 
                animationDuration={1500}
              />
              <Bar 
                dataKey="cancelled" 
                name="Cancelled" 
                stackId="a" 
                fill="#8A2D3B" 
                radius={[0, 4, 4, 0]} 
                animationDuration={1500}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
} 