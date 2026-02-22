import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { Backend } from '@/backend/AttendMeBackendClient'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<any>(null)
  const userRole = ref<string | null>(null)

  const isAuthenticated = computed(() => !!Backend.userTokenResult?.token)
  const hasDeviceToken = computed(() => !!Backend.deviceTokenResult?.token)

  async function initAuth() {
    if (!Backend.userTokenResult?.token) return

    try {
      const userData = await Backend.userGet(undefined)
      setUser(userData)
    } catch (error: any) {
      if ([400, 401, 403].includes(error?.status)) {
        logout()
      }
    }
  }

  function setUser(userData: any) {
    user.value = userData
    
    if (userData?.isTeacher) userRole.value = 'teacher'
    else if (userData?.isStudent) userRole.value = 'student'
    else if (userData?.isAdmin) userRole.value = 'admin'
    else userRole.value = null
  }

  function logout() {
    Backend.userLogout()
    user.value = null
    userRole.value = null
  }

  function resetDeviceAuth() {
    Backend.deviceAuthReset()
  }

  return {
    user,
    userRole,
    isAuthenticated,
    hasDeviceToken,
    setUser,
    logout,
    resetDeviceAuth,
    initAuth
  }
})