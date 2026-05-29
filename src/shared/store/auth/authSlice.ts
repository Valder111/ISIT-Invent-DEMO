import { createSlice } from '@reduxjs/toolkit'
import type { MeResponse } from '../../api/auth'
import { fetchMe, login, logout, patchMe } from './authThunks'

export type AuthStatus = 'idle' | 'loading' | 'succeeded' | 'failed'

export type AuthState = {
  me: MeResponse | null
  status: AuthStatus
}

const initialState: AuthState = {
  me: null,
  status: 'idle',
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    sessionCheckSkipped(state) {
      state.status = 'succeeded'
    },
    clearSession(state) {
      state.me = null
    },
  },
  extraReducers: (builder) => {
    const setLoading = (state: AuthState) => {
      state.status = 'loading'
    }

    builder
      .addCase(fetchMe.pending, setLoading)
      .addCase(fetchMe.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.me = action.payload
      })
      .addCase(fetchMe.rejected, (state) => {
        state.status = 'failed'
        state.me = null
      })

      .addCase(login.pending, setLoading)
      .addCase(login.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.me = action.payload
      })
      .addCase(login.rejected, (state) => {
        state.status = 'failed'
        state.me = null
      })

      .addCase(logout.pending, setLoading)
      .addCase(logout.fulfilled, (state) => {
        state.status = 'succeeded'
        state.me = null
      })
      .addCase(logout.rejected, (state) => {
        state.status = 'succeeded'
        state.me = null
      })

      .addCase(patchMe.fulfilled, (state, action) => {
        state.me = action.payload
      })
  },
})

export const { sessionCheckSkipped, clearSession } = authSlice.actions
export const authReducer = authSlice.reducer
