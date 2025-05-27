// frontend/src/components/dashboard/PropertyStatisticsCard.tsx
// Statistics card component for property metrics
import React from 'react';

interface PropertyStatisticsCardProps {
  title: string;
  value: string | number;
  icon: string;
  color: 'blue' | 'green' | 'purple' | 'yellow' | 'red' | 'indigo';
  trend?: string;
  subtitle?: string;
  onClick?: () => void;
}

const PropertyStatisticsCard: React.FC<PropertyStatisticsCardProps> = ({
  title,
  value,
  icon,
  color,
  trend,
  subtitle,
  onClick
}) => {
  const getColorClasses = (color: string) => {
    const colorMap = {
      blue: {
        bg: 'bg-blue-100',
        text: 'text-blue-600',
        ring: 'ring-blue-500'
      },
      green: {
        bg: 'bg-green-100',
        text: 'text-green-600',
        ring: 'ring-green-500'
      },
      purple: {
        bg: 'bg-purple-100',
        text: 'text-purple-600',
        ring: 'ring-purple-500'
      },
      yellow: {
        bg: 'bg-yellow-100',
        text: 'text-yellow-600',
        ring: 'ring-yellow-500'
      },
      red: {
        bg: 'bg-red-100',
        text: 'text-red-600',
        ring: 'ring-red-500'
      },
      indigo: {
        bg: 'bg-indigo-100',
        text: 'text-indigo-600',
        ring: 'ring-indigo-500'
      }
    };
    
    return colorMap[color as keyof typeof colorMap] || colorMap.blue;
  };

  const getIcon = (iconName: string) => {
    const icons = {
      home: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
      available: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      eye: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      ),
      money: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
        </svg>
      ),
      heart: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      ),
      message: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      ),
      users: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
        </svg>
      ),
      clock: (
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    };
    
    return icons[iconName as keyof typeof icons] || icons.home;
  };

  const colors = getColorClasses(color);
  const isPositiveTrend = trend && (trend.includes('+') || trend.includes('↑'));
  const isNegativeTrend = trend && (trend.includes('-') || trend.includes('↓'));

  return (
    <div 
      className={`bg-white rounded-lg shadow-md p-6 border-l-4 border-${color}-500 ${
        onClick ? 'cursor-pointer hover:shadow-lg transition-shadow' : ''
      }`}
      onClick={onClick}
    >
      <div className="flex items-center">
        <div className={`p-3 rounded-full ${colors.bg} ${colors.text}`}>
          {getIcon(icon)}
        </div>
        
        <div className="ml-5 w-0 flex-1">
          <dl>
            <dt className="text-sm font-medium text-gray-500 truncate">
              {title}
            </dt>
            <dd className="flex items-baseline">
              <div className="text-2xl font-semibold text-gray-900">
                {typeof value === 'number' ? value.toLocaleString() : value}
              </div>
              
              {trend && (
                <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                  isPositiveTrend ? 'text-green-600' : 
                  isNegativeTrend ? 'text-red-600' : 
                  'text-gray-600'
                }`}>
                  {isPositiveTrend && (
                    <svg className="self-center flex-shrink-0 h-3 w-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                  {isNegativeTrend && (
                    <svg className="self-center flex-shrink-0 h-3 w-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M14.707 10.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 111.414-1.414L9 12.586V5a1 1 0 012 0v7.586l2.293-2.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                  <span className="sr-only">
                    {isPositiveTrend ? 'Increased' : isNegativeTrend ? 'Decreased' : 'Changed'} by
                  </span>
                  {trend}
                </div>
              )}
            </dd>
            
            {subtitle && (
              <dd className="mt-1 text-sm text-gray-500">
                {subtitle}
              </dd>
            )}
          </dl>
        </div>
      </div>
    </div>
  );
};

export default PropertyStatisticsCard;