let adminToken = null;

export const setAdminToken = (token) => {
  adminToken = token || null;
};

export const getAdminToken = () => adminToken;

