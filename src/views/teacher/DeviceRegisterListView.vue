<template>
  <div class="device-register-list">
    <div class="header">
      <button @click="goBack" class="btn-secondary">← Powrót</button>
      <button @click="handleLogout" class="btn-secondary">Wyloguj</button>
    </div>

    <div class="content">
      <h1>Rejestracja urządzeń</h1>
      <p class="subtitle">Wybierz studenta, dla którego chcesz wygenerować link rejestracyjny</p>

      <div v-if="loading" class="loading">Ładowanie...</div>
      <div v-else-if="errorMessage" class="error-message">{{ errorMessage }}</div>
      <div v-else>
        <div v-if="students.length === 0" class="empty-state">
          Brak studentów na liście obecności
        </div>
        <div v-else class="students-list">
          <div 
            v-for="student in students" 
            :key="student.attenderUserId"
            class="student-item card"
          >
            <div class="student-info">
              <h3>{{ student.userName }} {{ student.userSurname }}</h3>
              <p v-if="student.studentAlbumIdNumber"><strong>Nr indeksu:</strong> {{ student.studentAlbumIdNumber }}</p>
            </div>
            <div class="student-actions">
              <button 
                @click="generateRegisterLink(student)" 
                class="btn-primary"
                :disabled="loadingLink === student.attenderUserId"
              >
                {{ loadingLink === student.attenderUserId ? 'Generowanie...' : 'Wygeneruj link' }}
              </button>
              <button 
                v-if="registerLinks[student.attenderUserId]"
                @click="copyLink(registerLinks[student.attenderUserId])"
                class="btn-secondary"
              >
                Kopiuj link
              </button>
            </div>
            <div v-if="registerLinks[student.attenderUserId]" class="link-display">
              <input 
                type="text" 
                :value="registerLinks[student.attenderUserId]" 
                readonly
                class="link-input"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { Backend } from '@/backend/AttendMeBackendClient'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const sessionId = ref(Number(route.params.sessionId))
const students = ref<any[]>([])
const loading = ref(false)
const errorMessage = ref('')
const loadingLink = ref<number | null>(null)
const registerLinks = ref<Record<number, string>>({})

onMounted(() => {
  loadStudents()
})

async function loadStudents() {
  loading.value = true
  errorMessage.value = ''

  try {
    const attendanceData = await Backend.courseSessionAttendanceListGet(sessionId.value)
    students.value = attendanceData || []
  } catch {
    errorMessage.value = 'Błąd podczas ładowania listy studentów'
  } finally {
    loading.value = false
  }
}

async function generateRegisterLink(student: any) {
  if (!student.attenderUserId) return
  
  loadingLink.value = student.attenderUserId
  
  try {
    const tokenResult = await Backend.userDeviceRegisterTokenGet(student.attenderUserId)
    if (tokenResult?.token) {
      registerLinks.value[student.attenderUserId] = `${window.location.origin}/#/device-register/${tokenResult.token}`
    }
  } catch {
    alert('Nie udało się wygenerować linku rejestracyjnego')
  } finally {
    loadingLink.value = null
  }
}

async function copyLink(link: string) {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(link)
      alert('Link skopiowany do schowka')
      return
    }
  } catch {}

  try {
    const textarea = document.createElement('textarea')
    textarea.value = link
    textarea.style.position = 'fixed'
    textarea.style.opacity = '0'
    document.body.appendChild(textarea)
    textarea.select()
    const successful = document.execCommand('copy')
    document.body.removeChild(textarea)
    
    if (successful) {
      alert('Link skopiowany do schowka')
    } else {
      throw new Error('Fallback failed')
    }
  } catch {
    prompt('Skopiuj ten link (Ctrl+C):', link)
  }
}

const goBack = () => router.push(`/teacher/session/${sessionId.value}`)
const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.device-register-list {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 30px;
}

.content h1 {
  color: #333;
  margin-bottom: 10px;
}

.subtitle {
  color: #666;
  margin-bottom: 30px;
  font-size: 16px;
}

.students-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.student-item {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.student-info h3 {
  margin: 0 0 8px 0;
  color: #667eea;
}

.student-info p {
  margin: 0;
  color: #666;
}

.student-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.link-display {
  margin-top: 10px;
}

.link-input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  background: #f8f9fa;
}

.loading, .empty-state {
  text-align: center;
  padding: 40px;
  color: #666;
}
</style>