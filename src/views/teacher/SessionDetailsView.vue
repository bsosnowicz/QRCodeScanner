<template>
  <div class="session-details">
    <div class="header">
      <button @click="goBack" class="btn-secondary">← Powrót</button>
      <button @click="handleLogout" class="btn-secondary">Wyloguj</button>
    </div>

    <div v-if="loading" class="loading">Ładowanie...</div>
    <div v-else-if="errorMessage" class="error-message">{{ errorMessage }}</div>
    <div v-else>
      <div class="session-info card">
        <h2>{{ session?.courseName }}</h2>
        <p><strong>Grupa:</strong> {{ session?.courseGroupName }}</p>
        <p><strong>Termin:</strong> {{ formatDate(session?.dateStart) }}</p>
        <p v-if="session?.locationName"><strong>Sala:</strong> {{ session?.locationName }}</p>
      </div>

      <div class="actions card">
        <button @click="openScanLink" class="btn-primary">Otwórz ekran skanowania</button>
        <button @click="goToDeviceRegister" class="btn-secondary">Rejestracja urządzeń</button>
        <button @click="refreshData" class="btn-secondary">Odśwież</button>
      </div>

      <div class="attendance-list card">
        <h3>Lista obecności</h3>
        <div v-if="attendance.length === 0" class="empty-state">
          Brak danych o obecności
        </div>
        <table v-else>
          <thead>
            <tr>
              <th>Imię i nazwisko</th>
              <th>Nr indeksu</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="record in attendance" :key="record.attenderUserId">
              <td>{{ record.userName }} {{ record.userSurname }}</td>
              <td>{{ record.studentAlbumIdNumber || '-' }}</td>
              <td>
                <span :class="record.wasUserPresent ? 'status-present' : 'status-absent'">
                  {{ record.wasUserPresent ? 'Obecny' : 'Nieobecny' }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { Backend } from '@/backend/AttendMeBackendClient'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const sessionId = ref(Number(route.params.id))
const session = ref<any>(null)
const attendance = ref<any[]>([])
const loading = ref(false)
const errorMessage = ref('')
const scanLink = ref('')
let refreshInterval: number | undefined

onMounted(() => {
  loadData()
  generateScanLink()
  refreshInterval = window.setInterval(loadAttendance, 5000)
})

onUnmounted(() => {
  if (refreshInterval) clearInterval(refreshInterval)
})

async function loadData() {
  loading.value = true
  errorMessage.value = ''

  try {
    const [sessionData, attendanceData] = await Promise.all([
      Backend.courseTeacherSessionGet(sessionId.value),
      Backend.courseSessionAttendanceListGet(sessionId.value)
    ])

    session.value = sessionData
    attendance.value = attendanceData || []
  } catch {
    errorMessage.value = 'Błąd podczas ładowania danych'
  } finally {
    loading.value = false
  }
}

async function loadAttendance() {
  try {
    const attendanceData = await Backend.courseSessionAttendanceListGet(sessionId.value)
    attendance.value = attendanceData || []
  } catch {
  }
}

async function generateScanLink() {
  try {
    const tokenResult = await Backend.courseSessionAttendanceScannerTokenGet(sessionId.value)
    if (tokenResult?.token) {
      scanLink.value = `${window.location.origin}/#/teacher/scan/${sessionId.value}?token=${tokenResult.token}`
    }
  } catch {
  }
}

function openScanLink() {
  scanLink.value ? window.open(scanLink.value, '_blank') : router.push(`/teacher/scan/${sessionId.value}`)
}

function formatDate(dateValue: Date | string | undefined) {
  if (!dateValue) return ''
  return new Date(dateValue).toLocaleDateString('pl-PL', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
  })
}

const refreshData = () => loadData()
const goToDeviceRegister = () => router.push(`/teacher/device-register/${sessionId.value}`)
const goBack = () => router.push('/teacher/dashboard')
const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.session-details {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 30px;
}

.session-info h2 {
  color: #667eea;
  margin-bottom: 15px;
}

.session-info p {
  margin: 8px 0;
  color: #666;
}

.actions {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.attendance-list h3 {
  margin-bottom: 15px;
  color: #333;
}

table {
  width: 100%;
  border-collapse: collapse;
}

thead {
  background-color: #f8f9fa;
}

th, td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #ddd;
}

.status-present {
  color: #28a745;
  font-weight: bold;
}

.status-absent {
  color: #dc3545;
  font-weight: bold;
}

.empty-state {
  text-align: center;
  padding: 40px;
  color: #666;
}
</style>