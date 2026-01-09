<template>
  <div class="login-container">
    <div class="login-card">
      <h1>AttendMe</h1>
      <h2>Logowanie</h2>
      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label>Login:</label>
          <input 
            v-model="login" 
            type="text" 
            required 
            placeholder="Wprowadź login"
          />
        </div>
        <div class="form-group">
          <label>Hasło:</label>
          <input 
            v-model="password" 
            type="password" 
            required 
            placeholder="Wprowadź hasło"
          />
        </div>
        <div v-if="errorMessage" class="error-message">
          {{ errorMessage }}
        </div>
        <button type="submit" class="btn-primary" :disabled="loading">
          {{ loading ? 'Logowanie...' : 'Zaloguj' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { Backend } from '@/backend/AttendMeBackendClient'

const router = useRouter()
const authStore = useAuthStore()

const login = ref('')
const password = ref('')
const errorMessage = ref('')
const loading = ref(false)

async function handleLogin() {
  errorMessage.value = ''
  loading.value = true

  try {
    if (Backend.userTokenResult?.token) {
      Backend.userLogout()
    }
    
    await Backend.userLogin(login.value.trim(), password.value.trim())
    
    const user = await Backend.userGet(undefined)
    authStore.setUser(user)
    
    if (authStore.userRole === 'teacher') {
      router.push('/teacher/dashboard')
    } else if (authStore.userRole === 'student') {
      router.push('/student/dashboard')
    } else {
      errorMessage.value = 'Nieznana rola użytkownika'
    }
  } catch (error: any) {
    errorMessage.value = 'Nieprawidłowy login lub hasło'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-card {
  background: white;
  padding: 40px;
  border-radius: 10px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.2);
  width: 100%;
  max-width: 400px;
}

.login-card h1 {
  text-align: center;
  color: #667eea;
  margin-bottom: 10px;
  font-size: 32px;
}

.login-card h2 {
  text-align: center;
  margin-bottom: 30px;
  color: #333;
  font-size: 24px;
  font-weight: normal;
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
