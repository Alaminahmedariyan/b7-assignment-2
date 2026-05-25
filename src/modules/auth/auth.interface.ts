export interface IUser {
  id: number;
  name: string;
  email: string;
  password: string;
  role: 'contributor' | 'maintainer';
  created_at: string;
  updated_at: string;
}

export interface ISafeUser {
  id: number;
  name: string;
  email: string;
  role: 'contributor' | 'maintainer';
  created_at: string;
  updated_at: string;
}

export interface ISignupInput {
  name: string;
  email: string;
  password: string;
  role?: 'contributor' | 'maintainer';
}

export interface ILoginInput {
  email: string;
  password: string;
}