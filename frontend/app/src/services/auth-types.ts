export interface LoginResponse {
  access_token: string
  refresh_token: string
  expires_in: number
  user: {
    id: number
    name: string
    avatar?: string
    phone?: string
  }
}

export interface RefreshTokenResponse {
  access_token: string
  expires_in: number
}

export interface DecryptPhoneResponse {
  phone: string
}
