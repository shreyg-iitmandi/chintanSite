export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER'
}

export interface User {
  username: string;
  password: string;
}

export interface Mockup {
  id: string;
  dataUrl: string;
  file: File;
}

export interface Product {
  id: string;
  name: string;
  mockups: Mockup[];
  previewImageUrl: string;
}