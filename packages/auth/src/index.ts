// Authentication utilities will be implemented in future tasks

// Placeholder exports for build compatibility
export interface User {
  id: string;
  email: string;
  name: string;
}

export interface AuthResult {
  user: User;
  token: string;
}

// TODO: Implement in Task 3 - NextAuth.js를 사용한 인증 시스템 설정
export class AuthService {
  async validateJWT(_token: string): Promise<User | null> {
    return null; // Placeholder
  }
  
  async createUser(_userData: any): Promise<User> {
    throw new Error('Not implemented');
  }
}

export const JWTUtils = {
  sign: (_payload: any) => 'placeholder-token',
  verify: (_token: string) => null,
};

export const OAuthProviders = {
  google: {},
  github: {},
};
