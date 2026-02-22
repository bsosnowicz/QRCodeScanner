import { createRouter, createWebHashHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/login',
      name: 'Login',
      component: () => import('@/views/LoginView.vue'),
      meta: { requiresAuth: false }
    },
    {
      path: '/device-register/:token?',
      name: 'DeviceRegister',
      component: () => import('@/views/DeviceRegisterView.vue'),
      meta: { requiresAuth: false }
    },
    {
      path: '/teacher/dashboard',
      name: 'TeacherDashboard',
      component: () => import('@/views/teacher/TeacherDashboardView.vue'),
      meta: { requiresAuth: true, role: 'teacher' }
    },
    {
      path: '/teacher/session/:id',
      name: 'TeacherSessionDetails',
      component: () => import('@/views/teacher/SessionDetailsView.vue'),
      meta: { requiresAuth: true, role: 'teacher' }
    },
    {
      path: '/teacher/scan/:sessionId',
      name: 'TeacherScan',
      component: () => import('@/views/teacher/ScanView.vue'),
      meta: { requiresAuth: false }
    },
    {
      path: '/teacher/qr-display/:sessionId',
      name: 'TeacherQRDisplay',
      component: () => import('@/views/teacher/QRDisplayView.vue'),
      meta: { requiresAuth: false }
    },
    {
      path: '/teacher/device-register/:sessionId',
      name: 'TeacherDeviceRegisterList',
      component: () => import('@/views/teacher/DeviceRegisterListView.vue'),
      meta: { requiresAuth: true, role: 'teacher' }
    },
    {
      path: '/student/dashboard',
      name: 'StudentDashboard',
      component: () => import('@/views/student/StudentDashboardView.vue'),
      meta: { requiresAuth: true, role: 'student' }
    },
    {
      path: '/student/session/:id',
      name: 'StudentSessionDetails',
      component: () => import('@/views/student/SessionDetailsView.vue'),
      meta: { requiresAuth: true, role: 'student' }
    },
    {
      path: '/student/attendance',
      name: 'StudentAttendance',
      component: () => import('@/views/student/AttendanceView.vue'),
      meta: { requiresAuth: true, role: 'student' }
    },
    {
      path: '/student/scan-attendance',
      name: 'StudentScanAttendance',
      component: () => import('@/views/student/ScanAttendanceView.vue'),
      meta: { requiresAuth: false }
    },
    {
      path: '/',
      redirect: '/login'
    }
  ]
})

router.beforeEach(async (to, _from, next) => {
  const authStore = useAuthStore()
  
  if (authStore.isAuthenticated && !authStore.user) {
    await authStore.initAuth()
  }
  
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return next('/login')
  }
  
  if (to.meta.role && authStore.userRole !== to.meta.role) {
    if (authStore.userRole === 'teacher') return next('/teacher/dashboard')
    if (authStore.userRole === 'student') return next('/student/dashboard')
    return next('/login')
  }
  
  next()
})

export default router