export interface User {
  id: string;
  name: string;
  nickname?: string;
  email: string;
  avatarUrl?: string;
  role: 'Admin' | 'Viewer' | 'Editor';
  createdAt?: string;
  updatedAt?: string;
}