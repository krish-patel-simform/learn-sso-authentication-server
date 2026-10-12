//^ register user request bosy
export interface RegisterUserBody {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
}

export interface LoginUserBody {
  email: string;
  password: string;
}

//^ attached to req.user by authMiddleware
export interface AuthUser {
  id: string;
  sessionId: string;
}
