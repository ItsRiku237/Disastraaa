/** Role identifiers — extend this object to add future roles */
export const ROLES = {
  STATE_AUTHORITY:    'STATE_AUTHORITY',
  DISTRICT_AUTHORITY: 'DISTRICT_AUTHORITY',
  BLOCK_AUTHORITY:    'BLOCK_AUTHORITY',
  OPERATIONS:         'OPERATIONS',
  CITIZEN:            'CITIZEN',
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

/** Authenticated user context — passed through auth layer (future task) */
export interface UserContext {
  id: string;
  name: string;
  role: Role;
  /** State / district / block code this user administers */
  regionCode?: string;
  regionName?: string;
}

/**
 * Permission map per role.
 *
 * Used by components and server actions to gate visibility and actions.
 * Extend the record when new permission flags are introduced.
 */
export const rolePermissions = {
  [ROLES.STATE_AUTHORITY]: {
    canViewStateData:    true,
    canViewDistrictData: true,
    canVerifyReports:    true,
    canManageAlerts:     true,
    canManageResources:  true,
    canViewOperations:   true,
  },
  [ROLES.DISTRICT_AUTHORITY]: {
    canViewStateData:    false,
    canViewDistrictData: true,
    canVerifyReports:    true,
    canManageAlerts:     true,
    canManageResources:  true,
    canViewOperations:   true,
  },
  [ROLES.BLOCK_AUTHORITY]: {
    canViewStateData:    false,
    canViewDistrictData: false,
    canVerifyReports:    true,
    canManageAlerts:     false,
    canManageResources:  false,
    canViewOperations:   true,
  },
  [ROLES.OPERATIONS]: {
    canViewStateData:    false,
    canViewDistrictData: false,
    canVerifyReports:    false,
    canManageAlerts:     false,
    canManageResources:  true,
    canViewOperations:   true,
  },
  [ROLES.CITIZEN]: {
    canViewStateData:    false,
    canViewDistrictData: false,
    canVerifyReports:    false,
    canManageAlerts:     false,
    canManageResources:  false,
    canViewOperations:   false,
  },
} as const satisfies Record<Role, Record<string, boolean>>;
