export interface ApiResponse {
  success: boolean;
  message: string;
  [key: string]: unknown;
}

export interface WithAuthRequest {
  accessToken?: string;
  refreshToken?: string;
}
