"use client";

import { useState, useEffect } from "react";
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Shield, CheckSquare, Square } from "lucide-react";

export default function Users() {
  const { user, hasPermission } = useAuth();
  const [activeTab, setActiveTab] = useState('users');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Users state
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  
  // User form state
  const [userForm, setUserForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    department: '',
    position: '',
    employeeId: '',
    role: ''
  });

  // Role form state
  const [roleForm, setRoleForm] = useState({
    name: '',
    description: '',
    permissions: {
      user: { view: false, create: false, edit: false, delete: false, change_role: false },
      category: { view: false, create: false, edit: false, delete: false },
      product: { view: false, create: false, edit: false, delete: false },
      order: { view: false, create: false, edit: false, delete: false, update_status: false },
      inventory: { view: false, create: false, edit: false, delete: false },
      analytics: { view: false, export: false },
      settings: { view: false, edit: false }
    }
  });

  // Load users and roles
  useEffect(() => {
    loadUsers();
    loadRoles();
  }, []);

  const loadUsers = async () => {
    try {
      const response = await fetch('/api/users');
      const data = await response.json();
      if (data.success) {
        setUsers(data.data.users || []);
      }
    } catch (error) {
      showMessage('error', 'Failed to load users');
    }
  };

  const loadRoles = async () => {
    try {
      const response = await fetch('/api/roles');
      const data = await response.json();
      if (data.success) {
        setRoles(data.data || []);
      }
    } catch (error) {
      showMessage('error', 'Failed to load roles');
    }
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  // User form handlers
  const handleUserFormChange = (e) => {
    const { name, value } = e.target;
    setUserForm(prev => ({ ...prev, [name]: value }));
  };

  const handleUserSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userForm),
      });

      const data = await response.json();

      if (data.success) {
        showMessage('success', 'User created successfully');
        setUserForm({
          firstName: '',
          lastName: '',
          email: '',
          password: '',
          phone: '',
          department: '',
          position: '',
          employeeId: '',
          role: ''
        });
        loadUsers();
      } else {
        showMessage('error', data.error || 'Failed to create user');
      }
    } catch (error) {
      showMessage('error', 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  // Role form handlers
  const handleRoleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.startsWith('permissions.')) {
      const [, module, action] = name.split('.');
      setRoleForm(prev => ({
        ...prev,
        permissions: {
          ...prev.permissions,
          [module]: {
            ...prev.permissions[module],
            [action]: type === 'checkbox' ? checked : value
          }
        }
      }));
    } else {
      setRoleForm(prev => ({ ...prev, [name]: value }));
    }
  };

  // Select all permissions for a module
  const handleSelectAll = (module) => {
    setRoleForm(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [module]: Object.keys(prev.permissions[module]).reduce((acc, action) => {
          acc[action] = true;
          return acc;
        }, {})
      }
    }));
  };

  // Deselect all permissions for a module
  const handleDeselectAll = (module) => {
    setRoleForm(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [module]: Object.keys(prev.permissions[module]).reduce((acc, action) => {
          acc[action] = false;
          return acc;
        }, {})
      }
    }));
  };

  const handleRoleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/roles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(roleForm),
      });

      const data = await response.json();

      if (data.success) {
        showMessage('success', 'Role created successfully');
        setRoleForm({
          name: '',
          description: '',
          permissions: {
            user: { view: false, create: false, edit: false, delete: false, change_role: false },
            category: { view: false, create: false, edit: false, delete: false },
            product: { view: false, create: false, edit: false, delete: false },
            order: { view: false, create: false, edit: false, delete: false, update_status: false },
            inventory: { view: false, create: false, edit: false, delete: false },
            analytics: { view: false, export: false },
            settings: { view: false, edit: false }
          }
        });
        loadRoles();
      } else {
        showMessage('error', data.error || 'Failed to create role');
      }
    } catch (error) {
      showMessage('error', 'Failed to create role');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        showMessage('success', 'User deleted successfully');
        loadUsers();
      } else {
        showMessage('error', data.error || 'Failed to delete user');
      }
    } catch (error) {
      showMessage('error', 'Failed to delete user');
    }
  };

  const handleToggleUserStatus = async (userId, currentStatus) => {
    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isActive: !currentStatus }),
      });

      const data = await response.json();

      if (data.success) {
        showMessage('success', `User ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
        loadUsers();
      } else {
        showMessage('error', data.error || 'Failed to update user status');
      }
    } catch (error) {
      showMessage('error', 'Failed to update user status');
    }
  };

  // Permission module configuration
  const permissionModules = [
    {
      name: 'user',
      title: 'User Management',
      description: 'Manage system users and their roles',
      permissions: ['view', 'create', 'edit', 'delete', 'change_role']
    },
    {
      name: 'category',
      title: 'Category Management',
      description: 'Manage product categories',
      permissions: ['view', 'create', 'edit', 'delete']
    },
    {
      name: 'product',
      title: 'Product Management',
      description: 'Manage products and inventory',
      permissions: ['view', 'create', 'edit', 'delete']
    },
    {
      name: 'order',
      title: 'Order Management',
      description: 'Manage customer orders',
      permissions: ['view', 'create', 'edit', 'delete', 'update_status']
    },
    {
      name: 'inventory',
      title: 'Inventory Management',
      description: 'Manage stock and inventory',
      permissions: ['view', 'create', 'edit', 'delete']
    },
    {
      name: 'analytics',
      title: 'Analytics',
      description: 'View and export reports',
      permissions: ['view', 'export']
    },
    {
      name: 'settings',
      title: 'System Settings',
      description: 'Manage system configuration',
      permissions: ['view', 'edit']
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <Card className="shadow-lg">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              <User className="h-6 w-6 text-blue-600" />
              <CardTitle className="text-2xl">Users & Roles Management</CardTitle>
            </div>
            <CardDescription>
              Manage users and roles for the admin panel.
            </CardDescription>
          </CardHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mx-6 mb-4">
              <TabsTrigger value="users" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Users ({users.length})
              </TabsTrigger>
              {hasPermission('user', 'create') && (
                <TabsTrigger value="roles" className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Roles ({roles.length})
                </TabsTrigger>
              )}
            </TabsList>

            {/* Message */}
            {message.text && (
              <div className="mx-6 mb-4">
                <Alert variant={message.type === 'success' ? 'default' : 'destructive'}>
                  <AlertDescription>{message.text}</AlertDescription>
                </Alert>
              </div>
            )}

            <div className="px-6 pb-6">
              {/* Users Tab */}
              {activeTab === 'users' && (
                <div className="space-y-6">
                  {/* Create User Form */}
                  {hasPermission('user', 'create') && (
                    <div className="bg-gray-50 p-6 rounded-lg">
                      <h2 className="text-lg font-medium text-gray-900 mb-4">Create New User</h2>
                      <form onSubmit={handleUserSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        <div>
                          <Label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                            First Name *
                          </Label>
                          <Input
                            type="text"
                            name="firstName"
                            id="firstName"
                            required
                            value={userForm.firstName}
                            onChange={handleUserFormChange}
                            className="mt-1"
                          />
                        </div>

                        <div>
                          <Label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                            Last Name *
                          </Label>
                          <Input
                            type="text"
                            name="lastName"
                            id="lastName"
                            required
                            value={userForm.lastName}
                            onChange={handleUserFormChange}
                            className="mt-1"
                          />
                        </div>

                        <div>
                          <Label htmlFor="email" className="block text-sm font-medium text-gray-700">
                            Email *
                          </Label>
                          <Input
                            type="email"
                            name="email"
                            id="email"
                            required
                            value={userForm.email}
                            onChange={handleUserFormChange}
                            className="mt-1"
                          />
                        </div>

                        <div>
                          <Label htmlFor="password" className="block text-sm font-medium text-gray-700">
                            Password *
                          </Label>
                          <Input
                            type="password"
                            name="password"
                            id="password"
                            required
                            minLength="6"
                            value={userForm.password}
                            onChange={handleUserFormChange}
                            className="mt-1"
                          />
                        </div>

                        <div>
                          <Label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                            Phone
                          </Label>
                          <Input
                            type="text"
                            name="phone"
                            id="phone"
                            value={userForm.phone}
                            onChange={handleUserFormChange}
                            className="mt-1"
                          />
                        </div>

                        <div>
                          <Label htmlFor="role" className="block text-sm font-medium text-gray-700">
                            Role *
                          </Label>
                          <select
                            name="role"
                            id="role"
                            required
                            value={userForm.role}
                            onChange={handleUserFormChange}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="">Select a role</option>
                            {roles.map((role) => (
                              <option key={role._id} value={role._id}>
                                {role.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <Label htmlFor="department" className="block text-sm font-medium text-gray-700">
                            Department
                          </Label>
                          <Input
                            type="text"
                            name="department"
                            id="department"
                            value={userForm.department}
                            onChange={handleUserFormChange}
                            className="mt-1"
                          />
                        </div>

                        <div>
                          <Label htmlFor="position" className="block text-sm font-medium text-gray-700">
                            Position
                          </Label>
                          <Input
                            type="text"
                            name="position"
                            id="position"
                            value={userForm.position}
                            onChange={handleUserFormChange}
                            className="mt-1"
                          />
                        </div>

                        <div>
                          <Label htmlFor="employeeId" className="block text-sm font-medium text-gray-700">
                            Employee ID
                          </Label>
                          <Input
                            type="text"
                            name="employeeId"
                            id="employeeId"
                            value={userForm.employeeId}
                            onChange={handleUserFormChange}
                            className="mt-1"
                          />
                        </div>

                        <div className="sm:col-span-2 lg:col-span-3">
                          <Button
                            type="submit"
                            disabled={loading}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md disabled:bg-blue-400 disabled:cursor-not-allowed"
                          >
                            {loading ? 'Creating...' : 'Create User'}
                          </Button>
                        </div>
                      </form>
                    </div>
                  )}

                  {/* Users List */}
                  <div>
                    <h2 className="text-lg font-medium text-gray-900 mb-4">All Users</h2>
                    <div className="bg-white shadow overflow-hidden sm:rounded-md">
                      <ul className="divide-y divide-gray-200">
                        {users.map((userItem) => (
                          <li key={userItem._id}>
                            <div className="px-4 py-4 flex items-center justify-between sm:px-6">
                              <div className="flex items-center">
                                <div className="flex-shrink-0">
                                  <div className="h-10 w-10 bg-blue-600 rounded-full flex items-center justify-center">
                                    <span className="text-white font-medium text-sm">
                                      {userItem.firstName?.charAt(0)}{userItem.lastName?.charAt(0)}
                                    </span>
                                  </div>
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">
                                    {userItem.firstName} {userItem.lastName}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {userItem.email}
                                  </div>
                                  <div className="text-xs text-gray-400 mt-1">
                                    {userItem.role?.name} • {userItem.department} • {userItem.position}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center space-x-4">
                                <button
                                  onClick={() => handleToggleUserStatus(userItem._id, userItem.isActive)}
                                  className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full cursor-pointer ${
                                    userItem.isActive
                                      ? 'bg-green-100 text-green-800 hover:bg-green-200'
                                      : 'bg-red-100 text-red-800 hover:bg-red-200'
                                  }`}
                                >
                                  {userItem.isActive ? 'Active' : 'Inactive'}
                                </button>
                                {hasPermission('user', 'delete') && (
                                  <button
                                    onClick={() => handleDeleteUser(userItem._id)}
                                    className="text-red-600 hover:text-red-900 text-sm font-medium"
                                  >
                                    Delete
                                  </button>
                                )}
                              </div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Roles Tab */}
              {activeTab === 'roles' && hasPermission('user', 'create') && (
                <div className="space-y-6">
                  {/* Create Role Form */}
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">Create New Role</h2>
                    <form onSubmit={handleRoleSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        <div>
                          <Label htmlFor="roleName" className="block text-sm font-medium text-gray-700">
                            Role Name *
                          </Label>
                          <Input
                            type="text"
                            name="name"
                            id="roleName"
                            required
                            value={roleForm.name}
                            onChange={handleRoleFormChange}
                            placeholder="e.g., admin, manager, support"
                          />
                        </div>

                        <div>
                          <Label htmlFor="description" className="block text-sm font-medium text-gray-700">
                            Description *
                          </Label>
                          <Input
                            type="text"
                            name="description"
                            id="description"
                            required
                            value={roleForm.description}
                            onChange={handleRoleFormChange}
                            placeholder="Brief description of the role"
                          />
                        </div>
                      </div>

                      {/* Permissions Section */}
                      <div className="border-t pt-6">
                        <div className="flex items-center justify-between mb-6">
                          <h3 className="text-lg font-medium text-gray-900">Permissions</h3>
                          <div className="flex gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => permissionModules.forEach(module => handleSelectAll(module.name))}
                              className="flex items-center gap-1"
                            >
                              <CheckSquare className="h-4 w-4" />
                              Select All
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => permissionModules.forEach(module => handleDeselectAll(module.name))}
                              className="flex items-center gap-1"
                            >
                              <Square className="h-4 w-4" />
                              Clear All
                            </Button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          {permissionModules.map((module) => (
                            <Card key={module.name} className="border">
                              <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                  <CardTitle className="text-base capitalize">{module.title}</CardTitle>
                                  <div className="flex gap-1">
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleSelectAll(module.name)}
                                      className="h-6 px-2 text-xs"
                                    >
                                      All
                                    </Button>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleDeselectAll(module.name)}
                                      className="h-6 px-2 text-xs"
                                    >
                                      None
                                    </Button>
                                  </div>
                                </div>
                                <CardDescription className="text-xs">
                                  {module.description}
                                </CardDescription>
                              </CardHeader>
                              <CardContent className="pt-0">
                                <div className="grid grid-cols-2 gap-2">
                                  {module.permissions.map((action) => (
                                    <label
                                      key={action}
                                      className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-50 cursor-pointer"
                                    >
                                      <input
                                        type="checkbox"
                                        name={`permissions.${module.name}.${action}`}
                                        checked={roleForm.permissions[module.name][action]}
                                        onChange={handleRoleFormChange}
                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                      />
                                      <span className="text-sm font-medium capitalize text-gray-700">
                                        {action.replace('_', ' ')}
                                      </span>
                                    </label>
                                  ))}
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>

                      <div className="flex justify-end">
                        <Button
                          type="submit"
                          disabled={loading}
                          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md disabled:bg-blue-400 disabled:cursor-not-allowed"
                        >
                          {loading ? 'Creating...' : 'Create Role'}
                        </Button>
                      </div>
                    </form>
                  </div>

                  {/* Roles List */}
                  <div>
                    <h2 className="text-lg font-medium text-gray-900 mb-4">All Roles</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {roles.map((role) => (
                        <Card key={role._id} className="border">
                          <CardHeader className="pb-3">
                            <div className="flex justify-between items-start">
                              <CardTitle className="text-lg capitalize">{role.name}</CardTitle>
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                role.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                              }`}>
                                {role.isActive ? 'Active' : 'Inactive'}
                              </span>
                            </div>
                            <CardDescription>{role.description}</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-3">
                              {Object.entries(role.permissions).map(([module, permissions]) => (
                                <div key={module} className="text-sm">
                                  <div className="font-medium capitalize text-gray-900 mb-1">
                                    {module.replace('_', ' ')}
                                  </div>
                                  <div className="text-gray-600 text-xs">
                                    {Object.entries(permissions)
                                      .filter(([_, value]) => value)
                                      .map(([action]) => action.replace('_', ' '))
                                      .join(', ') || 'No permissions'}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}