<template>
  <div class="scan-attendance-view">
    <div class="content">
      <div v-if="loading" class="loading">
        <h1>Rejestrowanie obecności...</h1>
        <p>Proszę czekać...</p>
      </div>
      <div v-else-if="success" class="success-message">
        <h1>✓ Obecność zarejestrowana!</h1>
        <p>{{ message }}</p>
      </div>
      <div v-else-if="error" class="error-message">
        <h1>✗ Błąd</h1>
        <p>{{ error }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { Backend } from '@/backend/AttendMeBackendClient'

const route = useRoute()
const loading = ref(true)
const success = ref(false)
const error = ref('')
const message = ref('')

onMounted(async () => {
  const token = route.query.token as string

  if (!token) {
    error.value = 'Brak tokenu w linku'
    loading.value = false
    return
  }

  try {
    Backend.deviceTokenResult = { token }
    
    const ticketResult = await Backend.userAttendanceTicketGet()
    
    if (!ticketResult?.token) {
      error.value = 'Nie udało się pobrać tokenu studenta. Upewnij się, że jesteś zalogowany.'
      loading.value = false
      return
    }
    
    const result = await Backend.courseSessionAttendanceRegister(ticketResult.token)
    
    if (result) {
      success.value = true
      message.value = `Obecność zarejestrowana dla: ${result.name || ''} ${result.surname || ''}`
    } else {
      error.value = 'Nie udało się zarejestrować obecności'
    }
  } catch (err: any) {
    if (err.status === 403) {
      error.value = 'Brak uprawnień. Upewnij się, że jesteś zalogowany jako student.'
    } else {
      error.value = err.message || 'Błąd podczas rejestracji obecności'
    }
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.scan-attendance-view {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.content {
  background: white;
  border-radius: 15px;
  padding: 60px 40px;
  text-align: center;
  max-width: 500px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.3);
}

.loading h1,
.success-message h1,
.error-message h1 {
  margin-bottom: 20px;
  font-size: 32px;
}

.success-message h1 {
  color: #28a745;
}

.error-message h1 {
  color: #dc3545;
}

.loading p,
.success-message p,
.error-message p {
  color: #666;
  font-size: 18px;
  margin-top: 10px;
}

.loading {
  color: #333;
}
</style>

