// frontend/src/components/dashboard/PropertyManagementTable.tsx
// Comprehensive property management table for owners
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { updatePropertyStatus } from '../../api/properties';
import { useAuth } from '../../hooks/useAuth';

interface Property {
  id: number;
  title: string;
  address: string;
  city: string;
  property_type: string;
  rent_amount: number;
  bedrooms: number;
  bathrooms: number;
  availability_status: string;
  verification_status: string;
  created_at: string;
  updated_at: string;
  images?: any[];
  engagement_metrics?: {
    view_count: number;
    favorite_count: number;
    contact_count: number;
  };
  last_verified?: string;
}

interface PropertyManagementTableProps {
  properties: Property[];
  onRefresh: () => void;
}

const PropertyManagementTable: React.FC<PropertyManagementTableProps> = ({
  properties,
  onRefresh
}) => {
  const { token } = useAuth();
  const [updatingStatus, setUpdatingStatus] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<'created_at' | 'updated_at' | 'rent_amount' | 'title'>('updated_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filterStatus, setFilterStatus] = useState<'all' | 'available' | 'rented' | 'maintenance'>('all');

  const handleStatusUpdate = async (propertyId: number, newStatus: string) => {
    if (!token) return;
    
    setUpdatingStatus(propertyId);
    
    try {
      await updatePropertyStatus(token, propertyId, newStatus);
      
      // Show success message
      const property = properties.find(p => p.id === propertyId);
      console.log(`Successfully updated ${property?.title || 'property'} status to ${newStatus}`);
      
      // Refresh the data
      onRefresh();
    } catch (error: any) {
      console.error('Error updating property status:', error);
      
      // Show user-friendly error message
      const errorMessage = error.message || 'Failed to update property status. Please try again.';
      alert(errorMessage);
      
      // Revert the select value by refreshing
      onRefresh();
    } finally {
      setUpdatingStatus(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      available: { bg: 'bg-green-100', text: 'text-green-800', label: 'Available' },
      rented: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Rented' },
      maintenance: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Maintenance' },
      sold: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Sold' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || 
                   { bg: 'bg-gray-100', text: 'text-gray-800', label: status };
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  const getVerificationBadge = (status: string) => {
    const statusConfig = {
      verified: { bg: 'bg-green-100', text: 'text-green-800', label: 'Verified', icon: '✓' },
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pending Review', icon: '⏳' },
      rejected: { bg: 'bg-red-100', text: 'text-red-800', label: 'Needs Updates', icon: '✗' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || 
                   { bg: 'bg-gray-100', text: 'text-gray-800', label: status, icon: '?' };
    
    return (
      <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${config.bg} ${config.text}`}>
        <span className="mr-1">{config.icon}</span>
        {config.label}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Filter and sort properties
  const filteredAndSortedProperties = properties
    .filter(property => filterStatus === 'all' || property.availability_status === filterStatus)
    .sort((a, b) => {
      let aValue, bValue;
      
      switch (sortBy) {
        case 'rent_amount':
          aValue = a.rent_amount;
          bValue = b.rent_amount;
          break;
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case 'created_at':
          aValue = new Date(a.created_at).getTime();
          bValue = new Date(b.created_at).getTime();
          break;
        default:
          aValue = new Date(a.updated_at).getTime();
          bValue = new Date(b.updated_at).getTime();
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  return (
    <div>
      {/* Filters and Sorting */}
      <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 p-4 bg-gray-50 border-b">
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-gray-700">Filter:</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Properties</option>
            <option value="available">Available</option>
            <option value="rented">Rented</option>
            <option value="maintenance">Maintenance</option>
          </select>
        </div>
        
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-gray-700">Sort by:</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="updated_at">Last Updated</option>
            <option value="created_at">Date Created</option>
            <option value="rent_amount">Rent Amount</option>
            <option value="title">Title</option>
          </select>
          
          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="p-1 text-gray-500 hover:text-gray-700"
          >
            {sortOrder === 'asc' ? '↑' : '↓'}
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Property
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Details
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Performance
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredAndSortedProperties.map((property) => (
              <tr key={property.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-12 w-12 flex-shrink-0">
                      {property.images && property.images.length > 0 ? (
                        <img
                          className="h-12 w-12 rounded-md object-cover"
                          src={`/uploads/${property.images[0].path}`}
                          alt={property.title}
                        />
                      ) : (
                        <div className="h-12 w-12 rounded-md bg-gray-200 flex items-center justify-center">
                          <svg className="h-6 w-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {property.title}
                      </div>
                      <div className="text-sm text-gray-500">
                        {property.address}, {property.city}
                      </div>
                    </div>
                  </div>
                </td>

                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    <div className="font-medium">{formatCurrency(property.rent_amount)}/month</div>
                    <div className="text-gray-500">
                      {property.bedrooms} bed • {property.bathrooms} bath
                    </div>
                    <div className="text-gray-500 capitalize">
                      {property.property_type}
                    </div>
                  </div>
                </td>

                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="space-y-2">
                    <div>
                      <label className="text-xs text-gray-500">Availability:</label>
                      <div className="mt-1">
                        {updatingStatus === property.id ? (
                          <div className="animate-pulse bg-gray-200 h-6 w-20 rounded"></div>
                        ) : (
                          <select
                            value={property.availability_status}
                            onChange={(e) => handleStatusUpdate(property.id, e.target.value)}
                            className="text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                          >
                            <option value="available">Available</option>
                            <option value="rented">Rented</option>
                            <option value="maintenance">Maintenance</option>
                            <option value="sold">Sold</option>
                          </select>
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">Verification:</label>
                      <div className="mt-1">
                        {getVerificationBadge(property.verification_status)}
                      </div>
                    </div>
                  </div>
                </td>

                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    <div className="space-y-1">
                      <div className="flex items-center">
                        <svg className="h-4 w-4 text-green-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7z" clipRule="evenodd"/>
                        </svg>
                        <span className="text-xs">
                          {property.engagement_metrics?.contact_count || 0} contacts
                        </span>
                      </div>
                    </div>
                  </div>
                </td>

                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex flex-col space-y-2">
                    <Link
                      to={`/properties/${property.id}`}
                      className="text-blue-600 hover:text-blue-900 text-xs"
                    >
                      View Details
                    </Link>
                    <Link
                      to={`/properties/${property.id}/edit`}
                      className="text-indigo-600 hover:text-indigo-900 text-xs"
                    >
                      Edit Property
                    </Link>
                    <div className="text-xs text-gray-500">
                      Updated: {formatDate(property.updated_at)}
                    </div>
                    {property.last_verified && (
                      <div className="text-xs text-gray-500">
                        Verified: {formatDate(property.last_verified)}
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredAndSortedProperties.length === 0 && (
        <div className="text-center py-8">
          <div className="text-gray-500">
            {filterStatus === 'all' 
              ? 'No properties found.' 
              : `No ${filterStatus} properties found.`
            }
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertyManagementTable;