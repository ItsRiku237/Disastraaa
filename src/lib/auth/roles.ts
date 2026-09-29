/**
 * Authentication & Role Utilities for Authority Access
 *
 * Built on top of src/types/roles.ts.
 * Manages cookie-backed role resolution for server-side and client-side gating.
 */

import { ROLES, rolePermissions, type Role, type UserContext } from '@/types/roles';

export const ROLE_COOKIE_NAME = 'disastraaa-user-role';

/**
 * Returns true if the given role has clearance to access the
 * Emergency Operations Command Center (canViewOperations).
 */
export function isAuthorizedForOperations(role: Role): boolean {
  return Boolean(rolePermissions[role]?.canViewOperations);
}

/**
 * Returns the active role from a cookie string or header value.
 * Defaults to STATE_AUTHORITY for prototype demonstration convenience,
 * while allowing testing of CITIZEN (restricted) and other roles.
 */
export function parseRoleFromCookie(cookieHeader?: string | null): Role {
  if (!cookieHeader) return ROLES.STATE_AUTHORITY;

  const match = cookieHeader.match(new RegExp(`(?:^|; )${ROLE_COOKIE_NAME}=([^;]*)`));
  const rawRole = match ? decodeURIComponent(match[1]) : null;

  if (rawRole && Object.values(ROLES).includes(rawRole as Role)) {
    return rawRole as Role;
  }

  return ROLES.STATE_AUTHORITY;
}

/**
 * Helper to build standard UserContext for the demo session.
 */
export function getDemoUserContext(role: Role = ROLES.STATE_AUTHORITY): UserContext {
  switch (role) {
    case ROLES.STATE_AUTHORITY:
      return {
        id: 'usr-seoc-dir-01',
        name: 'Dr. Suresh Mohapatra',
        role: ROLES.STATE_AUTHORITY,
        regionCode: 'OD',
        regionName: 'Odisha State Disaster Management Authority (OSDMA)',
      };
    case ROLES.DISTRICT_AUTHORITY:
      return {
        id: 'usr-deoc-puri-01',
        name: 'Priyadarshini Sahoo (IAS)',
        role: ROLES.DISTRICT_AUTHORITY,
        regionCode: 'OD-PURI',
        regionName: 'Puri District Emergency Cell',
      };
    case ROLES.BLOCK_AUTHORITY:
      return {
        id: 'usr-beoc-konark-01',
        name: 'B. K. Pradhan (BDO)',
        role: ROLES.BLOCK_AUTHORITY,
        regionCode: 'OD-PURI-KONARK',
        regionName: 'Konark Coastal Block Administration',
      };
    case ROLES.OPERATIONS:
      return {
        id: 'usr-ndrf-03-cmd',
        name: 'Cmdr. R. K. Verma',
        role: ROLES.OPERATIONS,
        regionCode: 'NDRF-3BN',
        regionName: '3rd Battalion NDRF Emergency Logistics',
      };
    case ROLES.CITIZEN:
    default:
      return {
        id: 'usr-citizen-demo',
        name: 'Public Citizen Access',
        role: ROLES.CITIZEN,
        regionCode: 'PUBLIC',
        regionName: 'Public Portal (Citizen)',
      };
  }
}
