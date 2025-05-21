// frontend/src/components/charts/BarChart.tsx
import React from 'react';

interface DataPoint {
  [key: string]: any;
}

interface BarChartProps {
  data: DataPoint[];
  nameField: string;
  valueField: string;
  color?: string;
  height?: number;
  width?: number;
  title?: string;
  subtitle?: string;
  horizontal?: boolean;
  maxBars?: number;
  formatter?: (value: number) => string;
}

const BarChart: React.FC<BarChartProps> = ({
  data,
  nameField,
  valueField,
  color = '#3B82F6',
  height = 300,
  width = 600,
  title,
  subtitle,
  horizontal = false,
  maxBars = 10,
  formatter = (value) => value.toString()
}) => {
  if (!data || data.length === 0) {
    return (
      <div className="text-center p-8 bg-gray-50 rounded-lg">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        <p className="text-gray-600">No data available</p>
      </div>
    );
  }

  // Limit the number of bars
  const limitedData = data.slice(0, maxBars);

  // Calculate chart dimensions
  const padding = 40;
  const chartWidth = width - (padding * 2);
  const chartHeight = height - (padding * 2);
  
  // Find max value for scaling
  const maxValue = Math.max(...limitedData.map(item => item[valueField] || 0)) * 1.1;
  
  if (horizontal) {
    // Horizontal bar chart
    const barHeight = Math.min(25, (chartHeight / limitedData.length) * 0.8);
    const barSpacing = (chartHeight / limitedData.length);
    
    return (
      <div className="chart-container">
        {title && <h3 className="text-lg font-semibold">{title}</h3>}
        {subtitle && <p className="text-sm text-gray-500 mb-4">{subtitle}</p>}
        
        <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
          {/* Y-axis */}
          <line 
            x1={padding} 
            y1={padding} 
            x2={padding} 
            y2={padding + chartHeight} 
            stroke="#E5E7EB" 
            strokeWidth="1" 
          />
          
          {/* X-axis */}
          <line 
            x1={padding} 
            y1={padding + chartHeight} 
            x2={padding + chartWidth} 
            y2={padding + chartHeight} 
            stroke="#E5E7EB" 
            strokeWidth="1" 
          />
          
          {/* X-axis labels - only show a few to avoid crowding */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => {
            const value = maxValue * ratio;
            const x = padding + (chartWidth * ratio);
            return (
              <g key={`x-label-${index}`}>
                <text 
                  x={x} 
                  y={padding + chartHeight + 20} 
                  textAnchor="middle"
                  fontSize="10"
                  fill="#6B7280"
                >
                  {formatter(value)}
                </text>
                <line 
                  x1={x} 
                  y1={padding} 
                  x2={x} 
                  y2={padding + chartHeight} 
                  stroke="#E5E7EB" 
                  strokeWidth={index === 0 ? "0" : "1"} 
                  strokeDasharray="4"
                />
              </g>
            );
          })}
          
          {/* Bars and Y-axis labels */}
          {limitedData.map((item, index) => {
            const barWidth = (item[valueField] / maxValue) * chartWidth;
            const y = padding + (index * barSpacing) + (barSpacing - barHeight) / 2;
            
            return (
              <g key={`bar-${index}`}>
                <text 
                  x={padding - 10} 
                  y={y + barHeight / 2} 
                  textAnchor="end" 
                  dominantBaseline="middle"
                  fontSize="10"
                  fill="#6B7280"
                >
                  {item[nameField]}
                </text>
                <rect 
                  x={padding} 
                  y={y} 
                  width={barWidth} 
                  height={barHeight} 
                  fill={color}
                  rx="2"
                  ry="2"
                />
                <text 
                  x={padding + barWidth + 5} 
                  y={y + barHeight / 2} 
                  dominantBaseline="middle"
                  fontSize="10"
                  fill="#6B7280"
                >
                  {formatter(item[valueField])}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    );
  } else {
    // Vertical bar chart
    const barWidth = Math.min(50, (chartWidth / limitedData.length) * 0.8);
    const barSpacing = (chartWidth / limitedData.length);
    
    return (
      <div className="chart-container">
        {title && <h3 className="text-lg font-semibold">{title}</h3>}
        {subtitle && <p className="text-sm text-gray-500 mb-4">{subtitle}</p>}
        
        <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
          {/* Y-axis */}
          <line 
            x1={padding} 
            y1={padding} 
            x2={padding} 
            y2={padding + chartHeight} 
            stroke="#E5E7EB" 
            strokeWidth="1" 
          />
          
          {/* X-axis */}
          <line 
            x1={padding} 
            y1={padding + chartHeight} 
            x2={padding + chartWidth} 
            y2={padding + chartHeight} 
            stroke="#E5E7EB" 
            strokeWidth="1" 
          />
          
          {/* Y-axis labels - only show a few to avoid crowding */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => {
            const value = maxValue * ratio;
            const y = padding + chartHeight - (chartHeight * ratio);
            return (
              <g key={`y-label-${index}`}>
                <text 
                  x={padding - 10} 
                  y={y} 
                  textAnchor="end" 
                  dominantBaseline="middle"
                  fontSize="10"
                  fill="#6B7280"
                >
                  {formatter(value)}
                </text>
                <line 
                  x1={padding} 
                  y1={y} 
                  x2={padding + chartWidth} 
                  y2={y} 
                  stroke="#E5E7EB" 
                  strokeWidth={index === 0 ? "0" : "1"}
                  strokeDasharray="4"
                />
              </g>
            );
          })}
          
          {/* Bars and X-axis labels */}
          {limitedData.map((item, index) => {
            const barHeight = (item[valueField] / maxValue) * chartHeight;
            const x = padding + (index * barSpacing) + (barSpacing - barWidth) / 2;
            
            return (
              <g key={`bar-${index}`}>
                <rect 
                  x={x} 
                  y={padding + chartHeight - barHeight} 
                  width={barWidth} 
                  height={barHeight} 
                  fill={color}
                  rx="2"
                  ry="2"
                />
                <text 
                  x={x + barWidth / 2} 
                  y={padding + chartHeight + 20} 
                  textAnchor="middle"
                  fontSize="10"
                  fill="#6B7280"
                >
                  {item[nameField]}
                </text>
                <text 
                  x={x + barWidth / 2} 
                  y={padding + chartHeight - barHeight - 5} 
                  textAnchor="middle"
                  fontSize="10"
                  fill="#6B7280"
                >
                  {formatter(item[valueField])}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    );
  }
};

export default BarChart;