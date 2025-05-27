// frontend/src/components/dashboard/PropertyPerformanceChart.tsx
// Chart component for property performance visualization
import React from 'react';

interface PropertyPerformanceChartProps {
  title: string;
  data: any;
  type: 'line' | 'doughnut' | 'bar';
}

const PropertyPerformanceChart: React.FC<PropertyPerformanceChartProps> = ({
  title,
  data,
  type
}) => {
  // Simple chart visualization using CSS and HTML (fallback if recharts not available)
  const renderLineChart = () => {
    if (!data || !Array.isArray(data) || data.length === 0) {
      return (
        <div className="flex items-center justify-center h-48 text-gray-500">
          <div className="text-center">
            <svg className="h-12 w-12 mx-auto text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <p className="mt-2 text-sm">No data available</p>
          </div>
        </div>
      );
    }

    const maxValue = Math.max(...data.map((item: any) => item.views || item.value || 0));
    
    return (
      <div className="h-48 flex items-end space-x-2 px-4">
        {data.map((item: any, index: number) => {
          const height = maxValue > 0 ? ((item.views || item.value || 0) / maxValue) * 100 : 0;
          return (
            <div key={index} className="flex-1 flex flex-col items-center">
              <div 
                className="w-full bg-blue-500 rounded-t-sm transition-all duration-300 hover:bg-blue-600"
                style={{ height: `${height}%`, minHeight: '4px' }}
                title={`${item.date || item.label}: ${item.views || item.value || 0}`}
              ></div>
              <div className="text-xs text-gray-500 mt-1 transform -rotate-45 origin-left">
                {item.date ? new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : item.label}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderDoughnutChart = () => {
    if (!data || typeof data !== 'object') {
      return (
        <div className="flex items-center justify-center h-48 text-gray-500">
          <div className="text-center">
            <svg className="h-12 w-12 mx-auto text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
            <p className="mt-2 text-sm">No engagement data</p>
          </div>
        </div>
      );
    }

    const total = (data.views || 0) + (data.favorites || 0) + (data.contacts || 0);
    if (total === 0) {
      return (
        <div className="flex items-center justify-center h-48 text-gray-500">
          <div className="text-center">
            <p className="text-sm">No engagement yet</p>
            <p className="text-xs text-gray-400 mt-1">Start promoting your properties to see engagement data</p>
          </div>
        </div>
      );
    }

    const viewsPercentage = (data.views / total) * 100;
    const favoritesPercentage = (data.favorites / total) * 100;
    const contactsPercentage = (data.contacts / total) * 100;

    return (
      <div className="h-48 flex items-center justify-center">
        <div className="relative">
          {/* Simple circular progress representation */}
          <div className="w-32 h-32 rounded-full border-8 border-gray-200 relative">
            <div 
              className="absolute inset-0 rounded-full border-8 border-blue-500"
              style={{
                clipPath: `polygon(50% 50%, 50% 0%, ${50 + 50 * Math.cos((viewsPercentage * 360 / 100 - 90) * Math.PI / 180)}% ${50 + 50 * Math.sin((viewsPercentage * 360 / 100 - 90) * Math.PI / 180)}%, 50% 50%)`
              }}
            ></div>
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-lg font-bold text-gray-900">{total}</div>
              <div className="text-xs text-gray-500">Total</div>
            </div>
          </div>
        </div>
        
        <div className="ml-6 space-y-2">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
            <span className="text-sm text-gray-700">Views ({data.views})</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
            <span className="text-sm text-gray-700">Favorites ({data.favorites})</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
            <span className="text-sm text-gray-700">Contacts ({data.contacts})</span>
          </div>
        </div>
      </div>
    );
  };

  const renderChart = () => {
    switch (type) {
      case 'line':
        return renderLineChart();
      case 'doughnut':
        return renderDoughnutChart();
      case 'bar':
        return renderLineChart(); // Use same as line for simplicity
      default:
        return renderLineChart();
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        
        {/* Chart type indicator */}
        <div className="flex items-center space-x-1">
          <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {type === 'line' && (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            )}
            {type === 'doughnut' && (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            )}
          </svg>
          <span className="text-xs text-gray-400 capitalize">{type}</span>
        </div>
      </div>
      
      {renderChart()}
      
      {/* Chart footer with additional info */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>
            {type === 'line' ? 'Showing trend over time' : 
             type === 'doughnut' ? 'Engagement breakdown' : 
             'Performance metrics'}
          </span>
          <span>Updated recently</span>
        </div>
      </div>
    </div>
  );
};

export default PropertyPerformanceChart;