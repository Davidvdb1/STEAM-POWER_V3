import { keycloak } from "../connectors/keycloak.js";

// Protect by role
export const requireRole = (role) => keycloak.protect((token) => token.hasRealmRole(role));

// Extract user/orgs from token
export const getUserFromReq = (req) => {
    const ka = req.kauth?.grant?.access_token?.content || {};
    // console.log(ka)

    return {
        userId: ka.sub,
        name: ka.preferred_username || ka.email || ka.sub,
        orgIds: Array.isArray(ka.organization) ? ka.organization : [],
        roles: ka.realm_access?.roles || []
    };
};
