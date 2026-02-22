<template>
  <div class="register-container">
    <div class="register-card">
      <h1>Rejestracja urządzenia</h1>
      <div v-if="success" class="success-message">
        Urządzenie zostało zarejestrowane pomyślnie!
      </div>
      <div v-else>
        <form @submit.prevent="handleRegister">
          <div class="form-group">
            <label>Nazwa urządzenia:</label>
            <input 
              v-model="deviceName" 
              type="text" 
              required 
              placeholder="Wprowadź nazwę urządzenia"
            />
          </div>
          <div class="form-group">
            <label>Twoje imię:</label>
            <input 
              v-model="studentName" 
              type="text" 
              required 
              placeholder="Wprowadź swoje imię"
            />
          </div>
          <div class="form-group">
            <label>Twoje nazwisko:</label>
            <input 
              v-model="studentSurname" 
              type="text" 
              required 
              placeholder="Wprowadź swoje nazwisko"
            />
          </div>
          <div class="form-group">
            <label>Twój numer albumu:</label>
            <input 
              v-model.number="albumIdNumber" 
              type="number" 
              required 
              placeholder="Wprowadź numer albumu"
            />
          </div>
          <div v-if="errorMessage" class="error-message">
            {{ errorMessage }}
          </div>
          <button type="submit" class="btn-primary" :disabled="loading">
            {{ loading ? 'Rejestrowanie...' : 'Zarejestruj urządzenie' }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Backend } from '@/backend/AttendMeBackendClient'

const route = useRoute()
const router = useRouter()

const token = ref('')
const deviceName = ref('')
const studentName = ref('')
const studentSurname = ref('')
const albumIdNumber = ref<number | null>(null)
const errorMessage = ref('')
const loading = ref(false)
const success = ref(false)

onMounted(() => {
  const tokenParam = String(route.params.token || route.query.token || '')
  if (tokenParam) token.value = tokenParam
  else errorMessage.value = 'Brak tokenu rejestracyjnego'
})

async function handleRegister() {
  errorMessage.value = ''
  loading.value = true

  if (!token.value) {
    errorMessage.value = 'Brak tokenu rejestracyjnego'
    loading.value = false
    return
  }

  if (!albumIdNumber.value || albumIdNumber.value <= 0) {
    errorMessage.value = 'Numer albumu jest wymagany i musi być liczbą dodatnią'
    loading.value = false
    return
  }

  try {
    await Backend.userDeviceRegisterWithToken(token.value, {
      deviceName: deviceName.value,
      studentName: studentName.value,
      studentSurname: studentSurname.value,
      albumIdNumber: albumIdNumber.value
    })
    
    success.value = true
    setTimeout(() => router.push('/login'), 2000)
  } catch (error: any) {
    if (error?.status === 403) {
      errorMessage.value = 'Brak uprawnień. Token może być nieprawidłowy lub wygasł. Skontaktuj się z wykładowcą.'
    } else if (error?.status === 400) {
      errorMessage.value = 'Nieprawidłowe dane. Sprawdź wszystkie pola formularza.'
    } else {
      errorMessage.value = error?.message || 'Błąd rejestracji urządzenia'
    }
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.register-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.register-card {
  background: white;
  padding: 40px;
  border-radius: 10px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.2);
  width: 100%;
  max-width: 400px;
}

.register-card h1 {
  text-align: center;
  color: #667eea;
  margin-bottom: 30px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: #555;
  font-weight: 500;
}

.form-group input {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 16px;
}

button {
  width: 100%;
  padding: 12px;
  font-size: 16px;
  margin-top: 10px;
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>