// lib/auth.js
import { jwtVerify } from 'jose';

// // Main function to get session from both cookies and localStorage
// export async function getServerSession(request) {
//   try {
//     let token = null;

//     // 1️⃣ First try to get token from cookies (Server-side)
//     token = request.cookies.get('token')?.value;

//     // 2️⃣ If no token in cookies, try to get from Authorization header (Client-side API calls)
//     if (!token) {
//       const authHeader = request.headers.get('authorization');
//       if (authHeader && authHeader.startsWith('Bearer ')) {
//         token = authHeader.substring(7);
//       }
//     }

//     // 3️⃣ If still no token, try to get from request body (for specific cases)
//     if (!token) {
//       try {
//         const cloneRequest = request.clone();
//         const body = await cloneRequest.json();
//         token = body.token;
//       } catch (error) {
//         // Ignore if no JSON body
//       }
//     }

//     // 4️⃣ If no token found in any of the above, return null
//     if (!token) {
//       return null;
//     }

//     // Verify JWT token
//     const secret = new TextEncoder().encode(process.env.JWT_SECRET);
//     const { payload } = await jwtVerify(token, secret);

//     return {
//       user: {
//         id: payload.userId,
//         email: payload.email,
//         role: payload.role,
//         roleType: payload.roleType || payload.role
//       },
//       token: token // Return token for client-side use if needed
//     };
//   } catch (error) {
//     console.error('Session error:', error);
//     return null;
//   }
// }


export async function getServerSession(request) {
  try {
    let token = null;

    // Get token from cookies
    token = request.cookies.get('token')?.value;

    // Get from Authorization header
    if (!token) {
      const authHeader = request.headers.get('authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }

    if (!token) {
      return null;
    }

    // Verify token
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);

    return {
      user: {
        id: payload.userId,
        email: payload.email,
        role: payload.role,
        roleType: payload.roleType,
        isVendor: payload.isVendor,
        vendorProfile: payload.vendorProfile
      }
    };
  } catch (error) {
    console.error('Session error:', error);
    return null;
  }
}

// Enhanced version that also checks localStorage on client-side
export async function getUniversalSession(request) {
  try {
    let token = null;

    // 1️⃣ Priority 1: Cookies (Server-side)
    token = request.cookies.get('token')?.value;

    // 2️⃣ Priority 2: Authorization Header
    if (!token) {
      const authHeader = request.headers.get('authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
      }
    }

    // 3️⃣ Priority 3: Request Body
    if (!token) {
      try {
        const cloneRequest = request.clone();
        const body = await cloneRequest.json();
        token = body.token;
      } catch (error) {
        // Ignore if no JSON body
      }
    }

    // 4️⃣ Priority 4: localStorage (Client-side only - through special header)
    if (!token) {
      const clientToken = request.headers.get('x-client-token');
      if (clientToken) {
        token = clientToken;
      }
    }

    if (!token) {
      return null;
    }

    // Verify token
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);

    return {
      user: {
        id: payload.userId,
        email: payload.email,
        role: payload.role,
        roleType: payload.roleType || payload.role,
        permissions: payload.permissions || []
      },
      token: token
    };
  } catch (error) {
    console.error('Universal session error:', error);
    return null;
  }
}

// Client-side helper to get token from localStorage
export function getClientToken() {
  if (typeof window === 'undefined') {
    return null;
  }
  return localStorage.getItem('token');
}

// Client-side helper to set token in localStorage
export function setClientToken(token) {
  if (typeof window === 'undefined') {
    return;
  }
  localStorage.setItem('token', token);
}

// Client-side helper to remove token from localStorage
export function removeClientToken() {
  if (typeof window === 'undefined') {
    return;
  }
  localStorage.removeItem('token');
}

// Check if user has specific permission
export function hasPermission(session, module, action) {
  if (!session?.user?.permissions) return false;
  return session.user.permissions[module]?.[action] || false;
}

// // Check if user is admin
// export function isAdmin(session) {
//   return session?.user?.role === 'admin' || session?.user?.role === 'super_admin';
// }

// ✅ CHECK IF USER IS ADMIN (Enhanced)
export function isAdmin(session) {
  const adminRoles = ['admin', 'super_admin', 'administrator'];
  return session?.user?.role && adminRoles.includes(session.user.role.toLowerCase());
}

// ✅ CHECK PERMISSIONS FOR VENDOR ALLOCATION
export function canAllocateProducts(session) {
  if (!session) return false;
  
  // Only admin can allocate products
  if (isAdmin(session)) return true;
  
  // Check specific permissions if using permission-based system
  if (session.user.permissions) {
    return hasPermission(session, 'vendor', 'allocate_products');
  }
  
  return false;
}

// ✅ CHECK PERMISSIONS FOR VIEWING PROFIT
export function canViewProfit(session) {
  if (!session) return false;
  
  // Admin can always view profit
  if (isAdmin(session)) return true;
  
  // Vendors can only view their own profit
  if (isVendor(session)) return true;
  
  return false;
}

// Check if user is vendor
export function isVendor(session) {
  return session?.user?.role === 'vendor' || session?.user?.isVendor === true;
}


export function canViewAllInvoices(session) {
  return isAdmin(session) || hasPermission(session, 'view_all_invoices');
}

export function canCreateInvoice(session) {
  return isAdmin(session) || isVendor(session) || hasPermission(session, 'create_invoices');
}

