/* eslint-disable @typescript-eslint/no-explicit-any */
import { Card } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { TrainingAnalytics } from "@/lib/hooks/useAnalytics";
import { cn } from "@/lib/utils";

interface AgeDistributionChartProps {
  data: TrainingAnalytics[];
  title?: string;
  className?: string;
}

export function AgeDistributionChart({
  data,
  title = "Age Distribution",
  className,
}: AgeDistributionChartProps) {
  // Aggregate age range data across all trainings
  const aggregatedData = data.reduce((acc, training) => {
    const { ageRangeCount } = training;
    
    // Add the age range counts to our accumulator
    Object.entries(ageRangeCount).forEach(([ageRange, count]) => {
      if (!acc[ageRange]) {
        acc[ageRange] = 0;
      }
      acc[ageRange] += count;
    });
    
    return acc;
  }, {} as Record<string, number>);
  
  // Define age range order for proper sorting
  const ageRangeOrder = ["<18", "18-25", "26-35", "36-45", "46+"];
  
  // Format the data for recharts
  const chartData = ageRangeOrder
    .filter(range => aggregatedData[range] > 0) // Only include age ranges with counts > 0
    .map(range => ({
      name: range,
      count: aggregatedData[range]
    }));
  
  // Calculate total for percentage
  const total = chartData.reduce((sum, item) => sum + item.count, 0);
  
  // Custom tooltip to make it prettier
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const value = payload[0].value;
      const percentage = ((value / total) * 100).toFixed(1);
      
      return (
        <div className="bg-white p-3 border border-gray-200 shadow-lg rounded-lg">
          <p className="font-medium text-sm text-gray-900">{`Age: ${label}`}</p>
          <p className="text-sm text-gray-700">{`${value} trainees (${percentage}%)`}</p>
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
          No age distribution data available
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
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 12, fill: '#6B7280' }}
                axisLine={{ stroke: '#D1D5DB' }}
                tickLine={false}
              />
              <YAxis 
                tick={{ fontSize: 12, fill: '#6B7280' }}
                axisLine={{ stroke: '#D1D5DB' }}
                tickLine={false}
                width={40}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(224, 231, 255, 0.3)' }} />
              <Bar 
                dataKey="count" 
                name="Trainees" 
                fill="#0B75FF" 
                radius={[4, 4, 0, 0]} 
                barSize={30}
                animationDuration={1500}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
} 