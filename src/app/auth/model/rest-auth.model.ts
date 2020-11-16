// REST representation of a user fetched from the the backend
export interface RestUser {
  _id: string;
  email: string;
}

// REST response from the backend on GET /api/auth/login
export interface RestPostAuthLoginResponse {
  message: string;
  user: RestUser;
  token: string;
  expiresIn: number;
}

// REST response from the backend on GET /api/auth/signup
export interface RestPostAuthSignupResponse {
  message: string;
  user: RestUser;
}

// REST response from the backend on GET /api/auth/delete
export interface RestDeleteAuthDeleteResponse {
  message: string;
  user: RestUser;
}
