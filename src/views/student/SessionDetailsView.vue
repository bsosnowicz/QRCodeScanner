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
        <h2>{{ courseName }}</h2>
        <p><strong>Grupa:</strong> {{ groupName }}</p>
      </div>

      <div class="actions card">
        <button @click="goToAttendance" class="btn-success">Rejestruj obecność</button>
        <button @click="refreshData" class="btn-secondary">Odśwież</button>
      </div>

      <div class="stats card">
        <h3>Frekwencja</h3>
        <div class="stats-grid">
          <div class="stat-item">
            <div class="stat-value">{{ attendancePercentage }}%</div>
            <div class="stat-label">Frekwencja całkowita</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ totalSessions }}</div>
            <div class="stat-label">Wszystkie zajęcia</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ attendedSessions }}</div>
            <div class="stat-label">Obecności</div>
          </div>
        </div>
      </div>

      <div class="attendance-history card">
        <h3>Historia obecności</h3>
        <div v-if="allSessions.length === 0" class="empty-state">
          Brak danych o obecności
        </div>
        <div v-else class="history-list">
          <div 
            v-for="session in allSessions" 
            :key="session.courseSessionId"
            class="history-item"
          >
            <div class="history-date">
              {{ formatDate(session.dateStart) }}
            </div>
            <div :class="isPresent(session.courseSessionId) ? 'status-present' : 'status-absent'">
              {{ isPresent(session.courseSessionId) ? 'Obecny' : 'Nieobecny' }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { Backend } from '@/backend/AttendMeBackendClient'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const courseGroupId = ref(Number(route.params.id))
const allSessions = ref<any[]>([])
const attendanceLogs = ref<any[]>([])
const loading = ref(false)
const errorMessage = ref('')

const courseName = computed(() => allSessions.value[0]?.courseName)
const groupName = computed(() => allSessions.value[0]?.courseGroupName)

const totalSessions = computed(() => allSessions.value.length)
const attendedSessions = computed(() => attendanceLogs.value.length)
const attendancePercentage = computed(() => totalSessions.value ? Math.round((attendedSessions.value / totalSessions.value) * 100) : 0)

onMounted(loadData)

async function loadData() {
  loading.value = true
  errorMessage.value = ''

  try {
    const [sessionsData, attendanceData] = await Promise.all([
      Backend.courseStudentGroupSessionsGet(courseGroupId.value),
      Backend.courseStudentAttendanceGet(courseGroupId.value)
    ])
    
    allSessions.value = sessionsData
    attendanceLogs.value = attendanceData
  } catch {
    errorMessage.value = 'Błąd podczas ładowania danych'
  } finally {
    loading.value = false
  }
}

function isPresent(sessionId?: number) {
  return sessionId ? attendanceLogs.value.some(log => log.courseSessionId === sessionId) : false
}

const refreshData = () => loadData()

function formatDate(dateValue: string | Date) {
  if (!dateValue) return ''
  return new Date(dateValue).toLocaleDateString('pl-PL', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const goBack = () => router.push('/student/dashboard')
const goToAttendance = () => router.push('/student/attendance')
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
}

.stats {
  margin-bottom: 20px;
}

.stats h3 {
  margin-bottom: 20px;
  color: #333;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.stat-item {
  text-align: center;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
}

.stat-value {
  font-size: 32px;
  font-weight: bold;
  color: #667eea;
  margin-bottom: 8px;
}

.stat-label {
  color: #666;
  font-size: 14px;
}

.attendance-history h3 {
  margin-bottom: 15px;
  color: #333;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.history-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: #f8f9fa;
  border-radius: 5px;
}

.history-date {
  color: #666;
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