export type Role = {
  id: string;
  name: string;
  description: string;
};

export type RoleToMigrate = {
  name: string;
  description: string;
  sourceRoleId: string;
  destinationRoleId: string;
};
