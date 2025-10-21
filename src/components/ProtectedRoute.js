"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, requiredPermissions = [] }) {
  const { isAuthenticated, loading, user, hasPermission } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, loading, router]);

  // Check permissions if required
  useEffect(() => {
    if (!loading && isAuthenticated && requiredPermissions.length > 0) {
      const hasRequiredPermissions = requiredPermissions.every(
        ([module, action]) => hasPermission(module, action)
      );
      
      if (!hasRequiredPermissions) {
        router.push('/dashboard');
      }
    }
  }, [loading, isAuthenticated, requiredPermissions, hasPermission, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  // Check permissions for the route
  if (requiredPermissions.length > 0) {
    const hasRequiredPermissions = requiredPermissions.every(
      ([module, action]) => hasPermission(module, action)
    );

    if (!hasRequiredPermissions) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
            <p className="text-gray-600">You don&apos;t have permission to access this page.</p>
          </div>
        </div>
      );
    }
  }

  return children;
}