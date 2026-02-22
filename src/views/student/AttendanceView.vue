<template>
  <div class="attendance-view">
    <div class="header">
      <button @click="goBack" class="btn-secondary">← Powrót</button>
      <button @click="handleLogout" class="btn-secondary">Wyloguj</button>
    </div>

    <div class="qr-display">
      <div class="qr-header">
        <h1>Rejestrowanie obecności</h1>
        <p>Zbliż telefon do kamery wykładowcy</p>
      </div>

      <div v-if="!hasDeviceToken" class="error-message">
        <p>Urządzenie nie zostało zarejestrowane. Skontaktuj się z wykładowcą.</p>
        <button @click="goBack" class="btn-primary">Wróć do pulpitu</button>
      </div>

      <div v-else class="qr-container">
        <div v-if="qrCode" class="qr-wrapper">
          <qrcode-vue 
            :value="qrCode" 
            :size="300"
            :margin="2"
            level="H"
          />
        </div>
        <div v-else class="loading">Generowanie kodu...</div>
      </div>

      <div v-if="lastAttendance" class="success-message">
        <h2>✓ Obecność zarejestrowana!</h2>
        <p v-if="lastAttendance.courseName">{{ lastAttendance.courseName }}</p>
        <p v-if="lastAttendance.sessionDate">{{ formatDate(lastAttendance.sessionDate) }}</p>
      </div>

      <div class="info">
        <p><small>Kod QR odświeża się automatycznie co 2 sekundy</small></p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { Backend } from '@/backend/AttendMeBackendClient'
import QrcodeVue from 'qrcode.vue'

const router = useRouter()
const authStore = useAuthStore()

const qrCode = ref('')
const lastAttendance = ref<any>(null)
const hasDeviceToken = ref(false)
let refreshInterval: number | undefined

onMounted(async () => {
  hasDeviceToken.value = authStore.hasDeviceToken
  if (!hasDeviceToken.value) return
  
  await loadTicket()
  refreshInterval = window.setInterval(loadTicket, 2000)
})

onUnmounted(() => {
  if (refreshInterval) clearInterval(refreshInterval)
})

async function loadTicket() {
  try {
    const ticketResult = await Backend.userAttendanceTicketGet()
    if (ticketResult?.token) {
      qrCode.value = ticketResult.token
      
      const extraData = ticketResult as any
      if (extraData.lastRegisteredAttendance) {
        lastAttendance.value = extraData.lastRegisteredAttendance
      }
    }
  } catch {
  }
}

function formatDate(dateString?: string) {
  return dateString ? new Date(dateString).toLocaleString('pl-PL') : ''
}

const goBack = () => router.push('/student/dashboard')
const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.attendance-view {
  padding: 20px;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 30px;
}

.qr-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  max-width: 600px;
  margin: 0 auto;
}

.qr-header {
  text-align: center;
  margin-bottom: 30px;
  color: white;
}

.qr-header h1 {
  margin-bottom: 10px;
  font-size: 32px;
}

.qr-header p {
  font-size: 18px;
  opacity: 0.9;
}

.qr-container {
  width: 100%;
  display: flex;
  justify-content: center;
  margin: 40px 0;
  min-height: 300px;
  align-items: center;
}

.qr-wrapper {
  padding: 30px;
  background: white;
  border-radius: 15px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.3);
}

.loading {
  color: white;
  font-size: 18px;
  text-align: center;
}

.error-message {
  background: white;
  color: #721c24;
  padding: 30px;
  border-radius: 10px;
  text-align: center;
  margin: 20px 0;
  box-shadow: 0 10px 30px rgba(0,0,0,0.3);
}

.error-message p {
  margin-bottom: 20px;
  font-size: 18px;
}

.success-message {
  background: white;
  color: #155724;
  padding: 20px;
  border-radius: 10px;
  text-align: center;
  margin: 20px 0;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}

.success-message h2 {
  margin: 0 0 10px 0;
  font-size: 24px;
  color: #28a745;
}

.success-message p {
  margin: 5px 0;
  font-size: 16px;
}

.info {
  text-align: center;
  color: white;
  margin-top: 20px;
  opacity: 0.8;
}
</style>