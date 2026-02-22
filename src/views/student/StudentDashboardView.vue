<template>
  <div class="dashboard">
    <div class="header">
      <h1>Pulpit studenta</h1>
      <div class="header-actions">
        <button @click="goToAttendance" class="btn-success">Rejestruj obecność</button>
        <button @click="handleLogout" class="btn-secondary">Wyloguj</button>
      </div>
    </div>

    <div class="filters card">
      <h3>Filtry</h3>
      <div class="filter-row">
        <select v-model="dateFilter">
          <option value="all">Wszystkie</option>
          <option value="today">Dziś</option>
          <option value="tomorrow">Jutro</option>
          <option value="nextWeek">Następny tydzień</option>
          <option value="past">Minione</option>
        </select>
        <input 
          v-model="textFilter" 
          type="text" 
          placeholder="Szukaj po nazwie przedmiotu..."
        />
      </div>
    </div>

    <div v-if="loading" class="loading">Ładowanie...</div>
    <div v-else-if="errorMessage" class="error-message">{{ errorMessage }}</div>
    <div v-else>
      <div v-if="filteredSessions.length === 0" class="empty-state">
        Brak zajęć do wyświetlenia
      </div>
      <div v-else class="sessions-list">
        <div 
          v-for="session in filteredSessions" 
          :key="session.courseSessionId"
          class="session-item card"
          @click="goToSession(session)"
        >
          <div class="session-header">
            <h3>{{ session.courseName }}</h3>
            <span class="badge">{{ session.courseGroupName }}</span>
          </div>
          <div class="session-info">
            <p><strong>Termin:</strong> {{ formatDate(session.dateStart) }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { Backend } from '@/backend/AttendMeBackendClient'

const router = useRouter()
const authStore = useAuthStore()

const sessions = ref<any[]>([])
const loading = ref(false)
const errorMessage = ref('')
const dateFilter = ref('all')
const textFilter = ref('')

const filteredSessions = computed(() => {
  let filtered = sessions.value

  if (dateFilter.value !== 'all') {
    const now = new Date()
    const todayTime = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
    const tomorrowTime = todayTime + 86400000 
    const nextWeekTime = todayTime + 7 * 86400000 
    
    filtered = filtered.filter(session => {
      const sDate = new Date(session.dateStart)
      const sessionTime = new Date(sDate.getFullYear(), sDate.getMonth(), sDate.getDate()).getTime()
      
      if (dateFilter.value === 'today') return sessionTime === todayTime
      if (dateFilter.value === 'tomorrow') return sessionTime === tomorrowTime
      if (dateFilter.value === 'nextWeek') return sessionTime >= todayTime && sessionTime <= nextWeekTime
      if (dateFilter.value === 'past') return sessionTime < todayTime
      return true
    })
  }

  if (textFilter.value) {
    const searchLower = textFilter.value.toLowerCase()
    filtered = filtered.filter(session => session.courseName?.toLowerCase().includes(searchLower))
  }

  return filtered
})

onMounted(() => {
  if (!authStore.hasDeviceToken) {
    errorMessage.value = 'Urządzenie nie zostało zarejestrowane. Skontaktuj się z wykładowcą.'
    return
  }
  loadSessions()
})

async function loadSessions() {
  loading.value = true
  errorMessage.value = ''

  try {
    const response = await Backend.courseStudentSessionsGet({ pageNumber: 1, pageSize: 999999 })
    sessions.value = response.items
  } catch {
    errorMessage.value = 'Błąd podczas ładowania zajęć'
  } finally {
    loading.value = false
  }
}

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

const goToSession = (session: any) => router.push(`/student/session/${session.courseGroupId}`)
const goToAttendance = () => router.push('/student/attendance')
const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.dashboard {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  flex-wrap: wrap;
  gap: 15px;
}

.header h1 {
  color: #333;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.filters {
  margin-bottom: 20px;
}

.filter-row {
  display: flex;
  gap: 15px;
  margin-top: 15px;
}

.filter-row select {
  min-width: 200px;
}

.filter-row input {
  flex: 1;
}

.sessions-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.session-item {
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.session-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.15);
}

.session-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.session-header h3 {
  margin: 0;
  color: #667eea;
}

.badge {
  background: #667eea;
  color: white;
  padding: 5px 12px;
  border-radius: 12px;
  font-size: 12px;
}

.session-info {
  color: #666;
}

.loading, .empty-state {
  text-align: center;
  padding: 40px;
  color: #666;
}
</style>