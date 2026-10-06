/**
 * Super Admin Configuration & Role-Based Access Control (RBAC)
 * 
 * Designated Super Admin Email for Master Admin Control Center
 */
export const SUPER_ADMIN_EMAIL = 'admin111205@gmail.com';

/**
 * Validates whether an email has Super Admin privileges.
 * Performs case-insensitive comparison.
 */
export function isSuperAdmin(email?: string | null): boolean {
  if (!email) return false;
  return email.trim().toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase();
}
