import { Card } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { SessionAnalytics } from "@/lib/hooks/useAnalytics";
import { cn } from "@/lib/utils";

interface DeliveryMethodChartProps {
  data: SessionAnalytics[];
  title?: string;
  className?: string;
}

export function DeliveryMethodChart({
  data,
  title = "Training Delivery Methods",
  className,
}: DeliveryMethodChartProps) {
  // Aggregate delivery method data across all trainings
  const aggregatedData = data.reduce((acc, training) => {
    const { deliveryMethodCount } = training;
    
    // Add the delivery method counts to our accumulator
    Object.entries(deliveryMethodCount).forEach(([method, count]) => {
      if (!acc[method]) {
        acc[method] = 0;
      }
      acc[method] += count;
    });
    
    return acc;
  }, {} as Record<string, number>);
  
  // Format the data for recharts
  const chartData = Object.entries(aggregatedData)
    .filter(([_, count]) => count > 0) // Only include methods with counts > 0
    .map(([method, count]) => ({
      name: formatDeliveryMethod(method),
      value: count
    }));
  
  // Calculate total for percentage
  const total = chartData.reduce((sum, item) => sum + item.value, 0);
  
  // Define chart colors
  const COLORS = ['#0B75FF', '#8EEDF7', '#FF9066', '#657153'];
  
  // Format delivery method for display
  function formatDeliveryMethod(method: string): string {
    switch (method) {
      case 'OFFLINE':
        return 'In-Person';
      case 'ONLINE':
        return 'Virtual';
      case 'SELF_PACED':
        return 'Self-Paced';
      default:
        return method;
    }
  }
  
  // Custom rendering for labels to make them prettier
  const renderCustomizedLabel = ({
    cx, cy, midAngle, innerRadius, outerRadius, percent, name
  }: {
    cx: number;
    cy: number;
    midAngle: number;
    innerRadius: number;
    outerRadius: number;
    percent: number;
    name: string;
  }) => {
    // Position the text directly at the center of the arc rather than offset
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5; // Center between inner and outer radius
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    
    // Only show percentages for segments that are large enough
    if (percent < 0.05) return null;

    return (
      <g>
        {/* Add a subtle shadow/background to make text more readable */}
        <text
          x={x}
          y={y}
          fill="rgba(0,0,0,0.25)"
          fontSize={12}
          fontWeight="500"
          textAnchor="middle"
          dominantBaseline="central"
        >
          {`${(percent * 100).toFixed(0)}%`}
        </text>
        <text
          x={x}
          y={y}
          fill="#fff"
          fontSize={12}
          fontWeight="500"
          textAnchor="middle"
          dominantBaseline="central"
        >
          {`${(percent * 100).toFixed(0)}%`}
        </text>
      </g>
    );
  };

  // Custom legend to make it prettier
  const renderColorfulLegendText = (value: string) => {
    const item = chartData.find(item => item.name === value);
    const count = item?.value || 0;
    const percentage = total ? ((count / total) * 100).toFixed(0) : 0;
    
    return (
      <span className="text-sm">
        {`${value}: ${count} (${percentage}%)`}
      </span>
    );
  };
  
  return (
    <Card className={cn("p-5 shadow-sm rounded-xl overflow-hidden", className)}>
      <h3 className="text-lg font-semibold mb-5 text-gray-800">{title}</h3>
      
      {chartData.length === 0 ? (
        <div className="h-80 w-full flex justify-center items-center text-gray-500">
          No delivery method data available
        </div>
      ) : (
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={75}
                outerRadius={100}
                fill="#8884d8"
                paddingAngle={5}
                dataKey="value"
                labelLine={false}
                label={renderCustomizedLabel}
                stroke="#fff" // white border around slices
                strokeWidth={2}
              >
                {chartData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={COLORS[index % COLORS.length]} 
                    style={{ filter: 'drop-shadow(0px 0px 2px rgba(0, 0, 0, 0.2))' }}
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => [`${value} sessions (${((value / total) * 100).toFixed(0)}%)`, 'Count']}
                contentStyle={{ 
                  borderRadius: '8px', 
                  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)', 
                  padding: '10px 14px' 
                }}
              />
              <Legend 
                formatter={renderColorfulLegendText}
                iconSize={10}
                iconType="circle"
                layout="horizontal"
                verticalAlign="bottom"
                align="center"
                wrapperStyle={{ paddingTop: '15px' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
} 