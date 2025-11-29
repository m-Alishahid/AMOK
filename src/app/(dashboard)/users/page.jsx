"use client";

import { useState, useEffect } from "react";
import { useAuth } from '@/context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import DataTable from "@/components/DataTable";
import { User, Shield, CheckSquare, Square, Edit, Trash2, Plus } from "lucide-react";

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

  // Dialog state
  const [isCreateUserDialogOpen, setIsCreateUserDialogOpen] = useState(false);
  const [isCreateRoleDialogOpen, setIsCreateRoleDialogOpen] = useState(false);

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
    <div className="space-y-4 md:space-y-6 px-0 sm:px-0">
      {/* Header Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
        <div className="flex items-center gap-1">
          <User className="h-8 w-8 sm:h-10 sm:w-10 text-blue-600" />
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Users & Roles Management</h1>
            <p className="text-gray-600 mt-1 text-sm sm:text-base">Manage users and roles for the admin panel.</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4 sm:p-6">

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mx-6 sm:mx-0 mb-2 justify-center">
              <TabsTrigger value="users" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                <User className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden xs:inline">Users ({users.length})</span>
                <span className="xs:hidden">Users</span>
              </TabsTrigger>
              {hasPermission('user', 'create') && (
                <TabsTrigger value="roles" className="flex items-center gap-1 sm:gap-1 text-xs sm:text-sm">
                  <Shield className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden xs:inline">Roles ({roles.length})</span>
                  <span className="xs:hidden">Roles</span>
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
                  {/* Create User Button */}
                  {hasPermission('user', 'create') && (
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <h2 className="text-lg font-medium text-gray-900">All Users</h2>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto">
                            <Plus className="h-4 w-4 mr-2" />
                            Create User
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[600px] max-w-full h-full sm:h-auto sm:max-h-[90vh] overflow-y-auto p-4">
                          <DialogHeader>
                            <DialogTitle>Create New User</DialogTitle>
                            <DialogDescription>
                              Fill in the details below to create a new user account.
                            </DialogDescription>
                          </DialogHeader>
                          <form onSubmit={handleUserSubmit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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

                            <div className="sm:col-span-2">
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

                            <div className="sm:col-span-2">
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

                            <div className="sm:col-span-2 flex justify-end gap-3">
                              <DialogTrigger asChild>
                                <Button type="button" variant="outline">
                                  Cancel
                                </Button>
                              </DialogTrigger>
                              <Button
                                type="submit"
                                disabled={loading}
                                className="bg-blue-600 hover:bg-blue-700 text-white"
                              >
                                {loading ? 'Creating...' : 'Create User'}
                              </Button>
                            </div>
                          </form>
                        </DialogContent>
                      </Dialog>
                    </div>
                  )}

                  {/* Users List */}
                  <div>
                    {!hasPermission('user', 'create') && (
                      <h2 className="text-lg font-medium text-gray-900 mb-4">All Users</h2>
                    )}
                    <DataTable
                      columns={[
                        {
                          key: "name",
                          label: "Name",
                          sortable: true,
                          render: (value, user) => (
                            <div className="flex items-center gap-0">
                              <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center mr-1">
                                <span className="text-white font-medium text-sm">
                                  {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                                </span>
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">{user.firstName} {user.lastName}</p>
                                <p className="text-sm text-gray-500">{user.email}</p>
                              </div>
                            </div>
                          ),
                        },
                        {
                          key: "role.name",
                          label: "Role",
                          sortable: true,
                          render: (value) => (
                            <Badge variant="secondary">{value}</Badge>
                          ),
                        },
                        {
                          key: "department",
                          label: "Department",
                          sortable: true,
                        },
                        {
                          key: "position",
                          label: "Position",
                          sortable: true,
                        },
                        {
                          key: "isActive",
                          label: "Status",
                          sortable: true,
                          render: (value) => (
                            <Badge className={value ? "bg-green-200 hover:bg-green-100 text-green-600" : "bg-red-200 hover:bg-red-100 text-red-600"}>
                              {value ? 'Active' : 'Inactive'}
                            </Badge>
                          ),
                        },
                      ]}
                      data={users}
                      responsiveView={true}
                      mobileCard={(user) => (
                        <div className="bg-white border border-gray-200 rounded-lg p-3 space-y-3">
                          <div className="flex items-start gap-3">
                            <div className="h-10 w-10 bg-blue-600 rounded-full flex items-center justify-center text-white flex-shrink-0">
                              <span className="text-sm font-medium">{user.firstName?.charAt(0)}{user.lastName?.charAt(0)}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-medium text-gray-900 text-sm truncate">{user.firstName} {user.lastName}</h3>
                              <p className="text-xs text-gray-500 truncate">{user.email}</p>
                              <p className="text-xs text-gray-600 mt-1 truncate">{user.role?.name}</p>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-1 text-xs pt-2 border-t border-gray-100">
                            <div>
                              <p className="text-gray-600">Department</p>
                              <p className="font-medium text-gray-900 truncate">{user.department || '—'}</p>
                            </div>
                            <div>
                              <p className="text-gray-600">Position</p>
                              <p className="font-medium text-gray-900 truncate">{user.position || '—'}</p>
                            </div>
                          </div>

                          <div className="flex gap-2 pt-2 border-t border-gray-100">
                            <button
                              onClick={() => handleToggleUserStatus(user._id, user.isActive)}
                              className="flex-1 text-xs py-2 rounded-lg bg-white border border-gray-200 text-gray-800 hover:bg-gray-50 active:bg-gray-100 touch-manipulation"
                            >
                              {user.isActive ? 'Deactivate' : 'Activate'}
                            </button>
                            {hasPermission('user', 'delete') && (
                              <button
                                onClick={() => handleDeleteUser(user._id)}
                                className="flex-1 text-xs py-2 rounded-lg bg-white border border-red-100 text-red-600 hover:bg-red-50 active:bg-red-100 touch-manipulation"
                              >
                                Delete
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                      actions={[
                        {
                          label: (user) => user.isActive ? "Deactivate" : "Activate",
                          icon: (user) => user.isActive ? Square : CheckSquare,
                          onClick: (user) => handleToggleUserStatus(user._id, user.isActive),
                          variant: "secondary",
                        },
                        ...(hasPermission('user', 'delete') ? [{
                          label: "Delete",
                          icon: Trash2,
                          variant: "secondary",
                          onClick: (user) => handleDeleteUser(user._id),
                        }] : []),
                      ]}
                      searchable={true}
                      paginated={true}
                      pageSize={10}
                      loading={loading}
                      emptyMessage="No users found"
                      searchPlaceholder="Search users by name, email, or role..."
                    />
                  </div>
                </div>
              )}

              {/* Roles Tab */}
              {activeTab === 'roles' && hasPermission('user', 'create') && (
                <div className="space-y-6">
                  {/* Create Role Button */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <h2 className="text-lg font-medium text-gray-900">All Roles</h2>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button className="bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto">
                          <Plus className="h-4 w-4 mr-2" />
                          Create Role
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[800px] max-w-full h-full sm:h-auto sm:max-h-[90vh] overflow-y-auto p-4">
                        <DialogHeader>
                          <DialogTitle>Create New Role</DialogTitle>
                          <DialogDescription>
                            Fill in the details below to create a new role with specific permissions.
                          </DialogDescription>
                        </DialogHeader>
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
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
                              <h3 className="text-lg font-medium text-gray-900">Permissions</h3>
                              <div className="flex flex-wrap gap-2">
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => permissionModules.forEach(module => handleSelectAll(module.name))}
                                  className="flex items-center gap-1 text-xs sm:text-sm"
                                >
                                  <CheckSquare className="h-3 w-3 sm:h-4 sm:w-4" />
                                  Select All
                                </Button>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  onClick={() => permissionModules.forEach(module => handleDeselectAll(module.name))}
                                  className="flex items-center gap-1 text-xs sm:text-sm"
                                >
                                  <Square className="h-3 w-3 sm:h-4 sm:w-4" />
                                  Clear All
                                </Button>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                              {permissionModules.map((module) => (
                                <Card key={module.name} className="border">
                                  <CardHeader className="pb-3">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                      <CardTitle className="text-sm sm:text-base capitalize">{module.title}</CardTitle>
                                      <div className="flex gap-1 self-start sm:self-auto">
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
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
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

                          <div className="flex justify-end gap-3">
                            <DialogTrigger asChild>
                              <Button type="button" variant="outline">
                                Cancel
                              </Button>
                            </DialogTrigger>
                            <Button
                              type="submit"
                              disabled={loading}
                              className="bg-blue-600 hover:bg-blue-700 text-white"
                            >
                              {loading ? 'Creating...' : 'Create Role'}
                            </Button>
                          </div>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </div>

                  {/* Roles List */}
                  <div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                      {roles.map((role) => (
                        <Card key={role._id} className="border">
                          <CardHeader className="pb-3">
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                              <CardTitle className="text-base sm:text-lg capitalize">{role.name}</CardTitle>
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full self-start ${
                                role.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                              }`}>
                                {role.isActive ? 'Active' : 'Inactive'}
                              </span>
                            </div>
                            <CardDescription className="text-sm">{role.description}</CardDescription>
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
        </div>
      </div>
    </div>
  );
}
