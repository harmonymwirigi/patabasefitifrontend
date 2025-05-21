// frontend/src/pages/Dashboard/Admin/UserManagement.tsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { getAllUsers, updateUserStatus, updateUserRole } from '../../../api/admin';

interface User {
  id: number;
  email: string;
  full_name: string;
  role: string;
  account_status: 'active' | 'inactive' | 'suspended';
  created_at: string;
  updated_at: string;
  last_login: string | null;
  token_balance: number;
  profile_image: string | null;
  phone_number: string | null;
  reliability_score: number | null;
}

const UserManagement: React.FC = () => {
  const { token } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive' | 'suspended'>('all');
  const [roleFilter, setRoleFilter] = useState<'all' | 'tenant' | 'owner' | 'admin'>('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');

  useEffect(() => {
    fetchUsers();
  }, [token, filter, roleFilter]);

  const fetchUsers = async () => {
    if (!token) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const fetchedUsers = await getAllUsers(token);
      
      // Apply filters
      let filteredUsers = fetchedUsers;
      
      if (filter !== 'all') {
        filteredUsers = filteredUsers.filter((u: User) => u.account_status === filter);
      }
      
      if (roleFilter !== 'all') {
        filteredUsers = filteredUsers.filter((u: User) => u.role === roleFilter);
      }
      
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        filteredUsers = filteredUsers.filter((u: User) => 
          u.full_name.toLowerCase().includes(term) || 
          u.email.toLowerCase().includes(term) ||
          (u.phone_number && u.phone_number.includes(term))
        );
      }
      
      setUsers(filteredUsers);
      setLoading(false);
    } catch (err: any) {
      console.error('Error fetching users:', err);
      setError(err.response?.data?.detail || 'Failed to load users');
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: number, status: 'active' | 'inactive' | 'suspended') => {
    setActionLoading(true);
    
    try {
      await updateUserStatus(token, id, status);
      
      // Update the user in the local state
      setUsers(prev => 
        prev.map(u => (u.id === id ? { ...u, account_status: status } : u))
      );
      
      if (selectedUser && selectedUser.id === id) {
        setSelectedUser({...selectedUser, account_status: status});
      }
      
      setActionLoading(false);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to update user status');
      setActionLoading(false);
    }
  };

  const handleRoleChange = async (id: number, role: 'tenant' | 'owner' | 'admin') => {
    setActionLoading(true);
    
    try {
      await updateUserRole(token, id, role);
      
      // Update the user in the local state
      setUsers(prev => 
        prev.map(u => (u.id === id ? { ...u, role } : u))
      );
      
      if (selectedUser && selectedUser.id === id) {
        setSelectedUser({...selectedUser, role});
      }
      
      setActionLoading(false);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to update user role');
      setActionLoading(false);
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    
    if (users.length > 0) {
      // Local filtering based on the search term
      const term = e.target.value.toLowerCase();
      
      if (!term) {
        // If search term is cleared, fetch all users again
        fetchUsers();
      } else {
        const filtered = users.filter(u => 
          u.full_name.toLowerCase().includes(term) || 
          u.email.toLowerCase().includes(term) ||
          (u.phone_number && u.phone_number.includes(term))
        );
        setUsers(filtered);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-4 mb-4">
          <p>{error}</p>
          <button 
            onClick={fetchUsers}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
        
        <div className="flex items-center space-x-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search users..."
              value={searchTerm}
              onChange={handleSearch}
              className="w-64 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {searchTerm && (
              <button 
                onClick={() => {
                  setSearchTerm('');
                  fetchUsers();
                }}
                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
      
      <div className="mb-6 flex flex-wrap gap-2">
        <div className="mr-4">
          <span className="text-sm text-gray-700 mr-2">Status:</span>
          <div className="inline-flex rounded-md shadow-sm">
            <button 
              onClick={() => setFilter('all')}
              className={`px-3 py-1 text-sm ${
                filter === 'all' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              } rounded-l-md`}
            >
              All
            </button>
            <button 
              onClick={() => setFilter('active')}
              className={`px-3 py-1 text-sm ${
                filter === 'active' 
                  ? 'bg-green-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Active
            </button>
            <button 
              onClick={() => setFilter('inactive')}
              className={`px-3 py-1 text-sm ${
                filter === 'inactive' 
                  ? 'bg-yellow-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Inactive
            </button>
            <button 
              onClick={() => setFilter('suspended')}
              className={`px-3 py-1 text-sm ${
                filter === 'suspended' 
                  ? 'bg-red-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              } rounded-r-md`}
            >
              Suspended
            </button>
          </div>
        </div>
        
        <div>
          <span className="text-sm text-gray-700 mr-2">Role:</span>
          <div className="inline-flex rounded-md shadow-sm">
            <button 
              onClick={() => setRoleFilter('all')}
              className={`px-3 py-1 text-sm ${
                roleFilter === 'all' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              } rounded-l-md`}
            >
              All
            </button>
            <button 
              onClick={() => setRoleFilter('tenant')}
              className={`px-3 py-1 text-sm ${
                roleFilter === 'tenant' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Tenants
            </button>
            <button 
              onClick={() => setRoleFilter('owner')}
              className={`px-3 py-1 text-sm ${
                roleFilter === 'owner' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Owners
            </button>
            <button 
              onClick={() => setRoleFilter('admin')}
              className={`px-3 py-1 text-sm ${
                roleFilter === 'admin' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              } rounded-r-md`}
            >
              Admins
            </button>
          </div>
        </div>
      </div>
      
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tokens
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Last Login
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                  No users found with the selected filters.
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0">
                        {user.profile_image ? (
                          <img className="h-10 w-10 rounded-full" src={`/uploads/${user.profile_image}`} alt="" />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                            <span className="text-gray-600 font-medium">
                              {user.full_name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{user.full_name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                        {user.phone_number && (
                          <div className="text-xs text-gray-500">{user.phone_number}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                      ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 
                        user.role === 'owner' ? 'bg-blue-100 text-blue-800' : 
                        'bg-green-100 text-green-800'}`}>
                      {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                      ${user.account_status === 'active' ? 'bg-green-100 text-green-800' : 
                        user.account_status === 'inactive' ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-red-100 text-red-800'}`}>
                      {user.account_status.charAt(0).toUpperCase() + user.account_status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.token_balance}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.last_login ? (
                      new Date(user.last_login).toLocaleDateString()
                    ) : (
                      'Never'
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => setSelectedUser(user)}
                      className="text-blue-600 hover:text-blue-900 mr-2"
                    >
                      Manage
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      {/* User Management Modal */}
      {selectedUser && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Manage User
                    </h3>
                    
                    <div className="mt-4">
                      <div className="flex items-center mb-4">
                        <div className="h-12 w-12 flex-shrink-0">
                          {selectedUser.profile_image ? (
                            <img className="h-12 w-12 rounded-full" src={`/uploads/${selectedUser.profile_image}`} alt="" />
                          ) : (
                            <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                              <span className="text-gray-600 font-medium text-lg">
                                {selectedUser.full_name.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <h4 className="text-lg font-medium">{selectedUser.full_name}</h4>
                          <p className="text-gray-500">{selectedUser.email}</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-500">Role</p>
                          <select
                            value={selectedUser.role}
                            onChange={(e) => handleRoleChange(
                              selectedUser.id, 
                              e.target.value as 'tenant' | 'owner' | 'admin'
                            )}
                            disabled={actionLoading}
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                          >
                            <option value="tenant">Tenant</option>
                            <option value="owner">Owner</option>
                            <option value="admin">Admin</option>
                          </select>
                        </div>
                        
                        <div>
                          <p className="text-sm text-gray-500">Account Status</p>
                          <select
                            value={selectedUser.account_status}
                            onChange={(e) => handleStatusChange(
                              selectedUser.id, 
                              e.target.value as 'active' | 'inactive' | 'suspended'
                            )}
                            disabled={actionLoading}
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                          >
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                            <option value="suspended">Suspended</option>
                          </select>
                        </div>
                      </div>
                      
                      <div className="border-t border-gray-200 pt-4">
                        <dl className="divide-y divide-gray-200">
                          <div className="py-2 flex justify-between">
                            <dt className="text-sm font-medium text-gray-500">User ID</dt>
                            <dd className="text-sm text-gray-900">{selectedUser.id}</dd>
                          </div>
                          <div className="py-2 flex justify-between">
                            <dt className="text-sm font-medium text-gray-500">Token Balance</dt>
                            <dd className="text-sm text-gray-900">{selectedUser.token_balance}</dd>
                          </div>
                          <div className="py-2 flex justify-between">
                            <dt className="text-sm font-medium text-gray-500">Join Date</dt>
                            <dd className="text-sm text-gray-900">
                              {new Date(selectedUser.created_at).toLocaleDateString()}
                            </dd>
                          </div>
                          <div className="py-2 flex justify-between">
                            <dt className="text-sm font-medium text-gray-500">Last Login</dt>
                            <dd className="text-sm text-gray-900">
                              {selectedUser.last_login ? (
                                new Date(selectedUser.last_login).toLocaleDateString()
                              ) : (
                                'Never'
                              )}
                            </dd>
                          </div>
                          <div className="py-2 flex justify-between">
                            <dt className="text-sm font-medium text-gray-500">Phone Number</dt>
                            <dd className="text-sm text-gray-900">
                              {selectedUser.phone_number || 'Not provided'}
                            </dd>
                          </div>
                          {selectedUser.reliability_score !== null && (
                            <div className="py-2 flex justify-between">
                              <dt className="text-sm font-medium text-gray-500">Reliability Score</dt>
                              <dd className="text-sm text-gray-900">
                                {selectedUser.reliability_score.toFixed(2)}
                              </dd>
                            </div>
                          )}
                        </dl>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={() => setSelectedUser(null)}
                  className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:w-auto sm:text-sm"
                >
                  {actionLoading ? 'Processing...' : 'Close'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;