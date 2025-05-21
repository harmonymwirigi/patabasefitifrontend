// frontend/src/components/charts/LineChart.tsx
import React from 'react';

interface DataPoint {
  [key: string]: any;
}

interface LineChartProps {
  data: DataPoint[];
  xField: string;
  yFields: {
    key: string;
    color: string;
    label: string;
  }[];
  height?: number;
  width?: number;
  title?: string;
  subtitle?: string;
}

const LineChart: React.FC<LineChartProps> = ({
  data,
  xField,
  yFields,
  height = 300,
  width = 600,
  title,
  subtitle
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

  // Calculate chart dimensions
  const padding = 40;
  const chartWidth = width - (padding * 2);
  const chartHeight = height - (padding * 2);
  
  // Determine max value for scaling
  let maxValue = 0;
  data.forEach(point => {
    yFields.forEach(field => {
      if (point[field.key] > maxValue) {
        maxValue = point[field.key];
      }
    });
  });
  maxValue *= 1.1; // Add 10% padding to the top
  
  // Calculate x and y scales
  const xStep = chartWidth / (data.length - 1);
  const yScale = (value: number) => chartHeight - (value / maxValue) * chartHeight;

  // Generate paths for each line
  const paths = yFields.map(field => {
    const path = data.map((point, i) => {
      const x = padding + i * xStep;
      const y = padding + yScale(point[field.key] || 0);
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ');
    
    return {
      path,
      color: field.color,
      key: field.key,
      label: field.label
    };
  });

  // Generate area paths under lines (optional)
  const areaPaths = yFields.map(field => {
    const linePath = data.map((point, i) => {
      const x = padding + i * xStep;
      const y = padding + yScale(point[field.key] || 0);
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ');
    
    // Add points to close the path at the bottom
    const x1 = padding;
    const x2 = padding + (data.length - 1) * xStep;
    const y = padding + chartHeight;
    
    return {
      path: `${linePath} L ${x2} ${y} L ${x1} ${y} Z`,
      color: field.color,
      key: field.key
    };
  });

  return (
    <div className="chart-container">
      {title && <h3 className="text-lg font-semibold">{title}</h3>}
      {subtitle && <p className="text-sm text-gray-500 mb-4">{subtitle}</p>}
      
      <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
        {/* X-axis */}
        <line 
          x1={padding} 
          y1={padding + chartHeight} 
          x2={padding + chartWidth} 
          y2={padding + chartHeight} 
          stroke="#E5E7EB" 
          strokeWidth="1" 
        />
        
        {/* Y-axis */}
        <line 
          x1={padding} 
          y1={padding} 
          x2={padding} 
          y2={padding + chartHeight} 
          stroke="#E5E7EB" 
          strokeWidth="1" 
        />
        
        {/* X-axis labels */}
        {data.map((point, index) => (
          <text 
            key={`x-label-${index}`}
            x={padding + (index * xStep)} 
            y={padding + chartHeight + 20} 
            textAnchor="middle" 
            fontSize="10"
            fill="#6B7280"
          >
            {point[xField]}
          </text>
        ))}
        
        {/* Y-axis labels - only show a few to avoid crowding */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => {
          const value = maxValue * ratio;
          return (
            <text 
              key={`y-label-${index}`}
              x={padding - 10} 
              y={padding + yScale(value)} 
              textAnchor="end" 
              dominantBaseline="middle"
              fontSize="10"
              fill="#6B7280"
            >
              {value.toLocaleString(undefined, {
                maximumFractionDigits: 0
              })}
            </text>
          );
        })}
        
        {/* Area fills */}
        {areaPaths.map((area, index) => (
          <path 
            key={`area-${index}`}
            d={area.path}
            fill={area.color} 
            opacity="0.1"
          />
        ))}
        
        {/* Grid lines */}
        {[0.25, 0.5, 0.75].map((ratio, index) => {
          const y = padding + yScale(maxValue * ratio);
          return (
            <line 
              key={`grid-${index}`}
              x1={padding} 
              y1={y} 
              x2={padding + chartWidth} 
              y2={y} 
              stroke="#E5E7EB" 
              strokeWidth="1" 
              strokeDasharray="4"
            />
          );
        })}
        
        {/* Lines */}
        {paths.map((line, index) => (
          <path 
            key={`line-${index}`}
            d={line.path}
            stroke={line.color} 
            fill="none" 
            strokeWidth="2"
          />
        ))}
        
        {/* Data points */}
        {yFields.map((field, fieldIndex) => (
          data.map((point, pointIndex) => (
            <circle
              key={`point-${fieldIndex}-${pointIndex}`}
              cx={padding + pointIndex * xStep}
              cy={padding + yScale(point[field.key] || 0)}
              r="4"
              fill="white"
              stroke={field.color}
              strokeWidth="2"
            />
          ))
        ))}
        
        {/* Legend */}
        <g transform={`translate(${width - 150}, 20)`}>
          {yFields.map((field, index) => (
            <g key={`legend-${index}`} transform={`translate(0, ${index * 20})`}>
              <rect width="12" height="4" fill={field.color} y="6" />
              <text x="20" y="12" fontSize="12" fill="#6B7280">{field.label}</text>
            </g>
          ))}
        </g>
      </svg>
    </div>
  );
};

export default LineChart;