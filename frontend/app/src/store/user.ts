import { create } from 'zustand'

interface UserState {
  token: string | null
  profile: Record<string, unknown> | null
  setToken: (token: string | null) => void
  setProfile: (profile: Record<string, unknown> | null) => void
}

export const useUserStore = create<UserState>((set) => ({
  token: null,
  profile: null,
  setToken: (token) => set({ token }),
  setProfile: (profile) => set({ profile })
}))
