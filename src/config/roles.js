export const ROLES = { INVESTOR: "INVESTOR", FIELD_MGR: "FIELD_MGR", FINANCE: "FINANCE", ADMIN: "ADMIN" };

export const ROLE_HOME = {
  INVESTOR: "/dashboard",
  FIELD_MGR: "/field",
  FINANCE: "/finance",
  ADMIN: "/admin",
};

// SRS auth levels: Investor = JWT, Field Manager = OTP, Finance/Admin = 2FA
export const ROLE_VERIFICATION = { INVESTOR: null, FIELD_MGR: "OTP", FINANCE: "2FA", ADMIN: "2FA" };
