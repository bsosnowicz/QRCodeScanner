<template>
  <div class="scan-view">
    <div class="scan-header">
      <h1>Skanowanie obecności</h1>
      <p>Zbliż telefon z kodem QR do kamery</p>
    </div>

    <div class="scanner-container">
      <div ref="scannerElement" id="qr-reader" class="scanner"></div>
    </div>

    <div v-if="lastResult" class="result-message" :class="lastResult.success ? 'success' : 'error'">
      {{ lastResult.message }}
    </div>

    <div class="controls">
      <button @click="toggleScanner" class="btn-primary">
        {{ paused ? 'Wznów skanowanie' : 'Zatrzymaj skanowanie' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { Html5Qrcode } from 'html5-qrcode'
import { Backend } from '@/backend/AttendMeBackendClient'

const route = useRoute()
const scannerElement = ref<HTMLElement | null>(null)
const paused = ref(false)
const lastResult = ref<{ success: boolean; message: string } | null>(null)
const processing = ref(false)
let html5QrcodeScanner: Html5Qrcode | null = null

onMounted(async () => {
  const token = route.query.token as string
  if (token) Backend.deviceTokenResult = { token }
  await initScanner()
})

onUnmounted(() => {
  stopScanner()
})

async function initScanner() {
  if (!scannerElement.value) return
  
  try {
    html5QrcodeScanner = new Html5Qrcode('qr-reader')
    await html5QrcodeScanner.start(
      { facingMode: 'environment' },
      { fps: 10, qrbox: { width: 250, height: 250 } },
      onScanSuccess,
      onScanError
    )
  } catch {
    lastResult.value = { success: false, message: 'Nie udało się uruchomić kamery' }
  }
}

function onScanSuccess(decodedText: string) {
  if (!processing.value && !paused.value) processCode(decodedText)
}

function onScanError() {}

async function processCode(code: string) {
  if (processing.value) return
  
  processing.value = true
  paused.value = true

  try {
    const result = await Backend.courseSessionAttendanceRegister(code)
    lastResult.value = result 
      ? { success: true, message: `Obecność zarejestrowana: ${result.name} ${result.surname}` }
      : { success: false, message: 'Nie udało się zarejestrować obecności' }
  } catch (error: any) {
    lastResult.value = { success: false, message: error?.message || 'Błąd podczas rejestracji obecności' }
  } finally {
    processing.value = false
    setTimeout(() => {
      lastResult.value = null
      paused.value = false
    }, 3000)
  }
}

async function toggleScanner() {
  if (paused.value) {
    await initScanner()
    paused.value = false
  } else {
    stopScanner()
    paused.value = true
  }
}

function stopScanner() {
  if (html5QrcodeScanner) {
    html5QrcodeScanner.stop().catch(() => {})
    html5QrcodeScanner.clear()
    html5QrcodeScanner = null
  }
}
</script>

<style scoped>
.scan-view {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  min-height: 100vh;
  background: #f5f5f5;
}

.scan-header {
  text-align: center;
  margin-bottom: 30px;
}

.scan-header h1 {
  color: #333;
  margin-bottom: 10px;
}

.scan-header p {
  color: #666;
  font-size: 18px;
}

.scanner-container {
  width: 100%;
  max-width: 600px;
  margin-bottom: 20px;
}

.scanner {
  width: 100%;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}

#qr-reader {
  width: 100%;
}

#qr-reader__dashboard {
  display: none;
}

.controls {
  margin-top: 20px;
}

.result-message {
  padding: 15px 30px;
  border-radius: 5px;
  margin: 20px 0;
  font-size: 16px;
  text-align: center;
}

.result-message.success {
  background-color: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.result-message.error {
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}
</style>