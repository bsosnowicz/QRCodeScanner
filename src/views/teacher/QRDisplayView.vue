<template>
  <div class="qr-display-view">
    <div class="header">
      <h1>Kod QR do skanowania</h1>
      <p>Studenci mogą zeskanować ten kod QR, aby potwierdzić obecność</p>
    </div>

    <div class="qr-container">
      <div v-if="qrCode" class="qr-wrapper">
        <qrcode-vue 
          :value="qrCode" 
          :size="400"
          :margin="2"
          level="H"
        />
      </div>
      <div v-else class="loading">Generowanie kodu...</div>
    </div>

    <div class="info card">
      <p><strong>Instrukcja:</strong> Studenci powinni zeskanować ten kod QR swoim telefonem, aby automatycznie zarejestrować obecność.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { Backend } from '@/backend/AttendMeBackendClient'
import QrcodeVue from 'qrcode.vue'

const route = useRoute()
const qrCode = ref('')
let refreshInterval: number | undefined

onMounted(async () => {
  const sessionId = Number(route.params.sessionId)
  if (sessionId) {
    await loadQRCode(sessionId)
    refreshInterval = window.setInterval(() => loadQRCode(sessionId), 30000)
  }
})

onUnmounted(() => {
  if (refreshInterval) clearInterval(refreshInterval)
})

async function loadQRCode(sessionId: number) {
  try {
    const tokenResult = await Backend.courseSessionAttendanceScannerTokenGet(sessionId)
    if (tokenResult?.token) {
      const baseUrl = window.location.origin
      qrCode.value = `${baseUrl}/#/student/scan-attendance?token=${tokenResult.token}&sessionId=${sessionId}`
    }
  } catch {
  }
}
</script>

<style scoped>
.qr-display-view {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 20px;
  min-height: 100vh;
  background: #f5f5f5;
}

.header {
  text-align: center;
  margin-bottom: 40px;
}

.header h1 {
  color: #333;
  margin-bottom: 10px;
  font-size: 32px;
}

.header p {
  color: #666;
  font-size: 18px;
}

.qr-container {
  display: flex;
  justify-content: center;
  margin: 40px 0;
  min-height: 400px;
  align-items: center;
}

.qr-wrapper {
  padding: 30px;
  background: white;
  border-radius: 15px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.info {
  max-width: 600px;
  margin-top: 30px;
  text-align: center;
  color: #666;
  padding: 20px;
}

.loading {
  padding: 40px;
  color: #666;
  font-size: 18px;
}
</style>