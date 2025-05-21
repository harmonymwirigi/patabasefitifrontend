// frontend/src/components/charts/PieChart.tsx
import React from 'react';

interface DataPoint {
  [key: string]: any;
}

interface PieChartProps {
  data: DataPoint[];
  nameField: string;
  valueField: string;
  colors?: string[];
  height?: number;
  width?: number;
  title?: string;
  subtitle?: string;
  formatter?: (value: number) => string;
  showPercentage?: boolean;
  donut?: boolean;
  donutRatio?: number;
}

const PieChart: React.FC<PieChartProps> = ({
  data,
  nameField,
  valueField,
  colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#6366F1'],
  height = 300,
  width = 600,
  title,
  subtitle,
  formatter = (value) => value.toString(),
  showPercentage = true,
  donut = false,
  donutRatio = 0.6
}) => {
  if (!data || data.length === 0) {
    return (
      <div className="text-center p-8 bg-gray-50 rounded-lg">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
        </svg>
        <p className="text-gray-600">No data available</p>
      </div>
    );
  }

  // Calculate total value
  const total = data.reduce((sum, item) => sum + (item[valueField] || 0), 0);
  
  // Calculate radius
  const chartSize = Math.min(width, height);
  const radius = chartSize * 0.35;  // Use 70% of the smaller dimension
  const innerRadius = donut ? radius * donutRatio : 0;
  
  // Calculate center point
  const centerX = width / 2;
  const centerY = height / 2;
  
  // Generate pie slices
  const slices = [];
  let startAngle = 0;
  
  data.forEach((item, index) => {
    const value = item[valueField] || 0;
    const percentage = value / total;
    const angle = percentage * Math.PI * 2;
    const endAngle = startAngle + angle;
    
    // Calculate SVG arc path
    const largeArcFlag = angle > Math.PI ? 1 : 0;
    
    // Outer arc
    const outerX1 = centerX + Math.cos(startAngle) * radius;
    const outerY1 = centerY + Math.sin(startAngle) * radius;
    const outerX2 = centerX + Math.cos(endAngle) * radius;
    const outerY2 = centerY + Math.sin(endAngle) * radius;
    
    // Inner arc (for donut charts)
    const innerX1 = centerX + Math.cos(endAngle) * innerRadius;
    const innerY1 = centerY + Math.sin(endAngle) * innerRadius;
    const innerX2 = centerX + Math.cos(startAngle) * innerRadius;
    const innerY2 = centerY + Math.sin(startAngle) * innerRadius;
    
    let pathData = '';
    
    if (donut) {
      // Donut slice (outer arc + inner arc + close)
      pathData = `M ${outerX1} ${outerY1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${outerX2} ${outerY2} L ${innerX1} ${innerY1} A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${innerX2} ${innerY2} Z`;
    } else {
      // Pie slice (center point + outer arc + close)
      pathData = `M ${centerX} ${centerY} L ${outerX1} ${outerY1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${outerX2} ${outerY2} Z`;
    }
    
    // Calculate label position
    const labelAngle = startAngle + angle / 2;
    const labelRadius = radius * 0.7;  // Position labels at 70% of the radius
    const labelX = centerX + Math.cos(labelAngle) * labelRadius;
    const labelY = centerY + Math.sin(labelAngle) * labelRadius;
    
    slices.push({
      path: pathData,
      color: colors[index % colors.length],
      name: item[nameField],
      value: item[valueField],
      percentage,
      labelX,
      labelY,
      index
    });
    
    startAngle = endAngle;
  });

  // Calculate legend positions
  const legendX = width * 0.7;
  const legendY = height * 0.3;
  
  return (
    <div className="chart-container">
      {title && <h3 className="text-lg font-semibold">{title}</h3>}
      {subtitle && <p className="text-sm text-gray-500 mb-4">{subtitle}</p>}
      
      <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
        {/* Pie/Donut */}
        <g>
          {slices.map((slice, index) => (
            <path 
              key={`slice-${index}`}
              d={slice.path}
              fill={slice.color}
              stroke="white"
              strokeWidth="1"
            />
          ))}
        </g>
        
        {/* Center label for donut chart */}
        {donut && (
          <text
            x={centerX}
            y={centerY}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="14"
            fontWeight="bold"
            fill="#374151"
          >
            {formatter(total)}
          </text>
        )}
        
        {/* Legend */}
        <g transform={`translate(${legendX}, ${legendY})`}>
          {data.map((item, index) => (
            <g key={`legend-${index}`} transform={`translate(0, ${index * 20})`}>
              <rect width="12" height="12" fill={colors[index % colors.length]} />
              <text 
                x="20" 
                y="9" 
                fontSize="12" 
                fill="#6B7280"
              >
                {item[nameField]}
                {showPercentage && (
                  <tspan x="120" textAnchor="end">
                    {Math.round((item[valueField] / total) * 100)}%
                  </tspan>
                )}
              </text>
            </g>
          ))}
        </g>
      </svg>
    </div>
  );
};

export default PieChart;