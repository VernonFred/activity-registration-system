import Taro from '@tarojs/taro'

const TOKEN_KEY = 'access_token'
const REFRESH_TOKEN_KEY = 'refresh_token'
const USER_INFO_KEY = 'user_info'

export const saveToken = (accessToken: string, refreshToken: string): void => {
  Taro.setStorageSync(TOKEN_KEY, accessToken)
  Taro.setStorageSync(REFRESH_TOKEN_KEY, refreshToken)
}

export const getAccessToken = (): string | null => Taro.getStorageSync(TOKEN_KEY)
export const getRefreshToken = (): string | null => Taro.getStorageSync(REFRESH_TOKEN_KEY)

export const clearToken = (): void => {
  Taro.removeStorageSync(TOKEN_KEY)
  Taro.removeStorageSync(REFRESH_TOKEN_KEY)
  Taro.removeStorageSync(USER_INFO_KEY)
}

export const saveUserInfo = (user: any): void => {
  Taro.setStorageSync(USER_INFO_KEY, user)
}

export const getUserInfo = (): any => Taro.getStorageSync(USER_INFO_KEY)
export const isLoggedIn = (): boolean => !!getAccessToken()
