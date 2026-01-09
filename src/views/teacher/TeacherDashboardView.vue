<template>
  <div class="dashboard">
    <div class="header">
      <h1>Pulpit wykładowcy</h1>
      <button @click="handleLogout" class="btn-secondary">Wyloguj</button>
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
          @click="goToSession(session.courseSessionId)"
        >
          <div class="session-header">
            <h3>{{ session.courseName }}</h3>
            <span class="badge">{{ session.courseGroupName }}</span>
          </div>
          <div class="session-info">
            <p><strong>Termin:</strong> {{ formatDate(session.dateStart) }}</p>
            <p v-if="session.locationName"><strong>Sala:</strong> {{ session.locationName }}</p>
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
  let filtered = [...sessions.value]

  if (dateFilter.value !== 'all') {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    
    filtered = filtered.filter(session => {
      const sessionDate = new Date(session.dateStart)
      const sessionDay = new Date(sessionDate.getFullYear(), sessionDate.getMonth(), sessionDate.getDate())
      
      switch (dateFilter.value) {
        case 'today':
          return sessionDay.getTime() === today.getTime()
        case 'tomorrow':
          const tomorrow = new Date(today)
          tomorrow.setDate(tomorrow.getDate() + 1)
          return sessionDay.getTime() === tomorrow.getTime()
        case 'nextWeek':
          const nextWeek = new Date(today)
          nextWeek.setDate(nextWeek.getDate() + 7)
          return sessionDay >= today && sessionDay <= nextWeek
        case 'past':
          return sessionDay < today
        default:
          return true
      }
    })
  }

  if (textFilter.value) {
    const searchLower = textFilter.value.toLowerCase()
    filtered = filtered.filter(session => 
      session.courseName?.toLowerCase().includes(searchLower) ||
      session.courseGroupName?.toLowerCase().includes(searchLower)
    )
  }

  return filtered
})

onMounted(() => {
  loadSessions()
})

async function loadSessions() {
  loading.value = true
  errorMessage.value = ''

  try {
    const response = await Backend.courseTeacherSessionsGet({
      pageNumber: 1,
      pageSize: 999999
    })
    
    sessions.value = response?.items || []
  } catch (error: any) {
    errorMessage.value = 'Błąd podczas ładowania zajęć'
  } finally {
    loading.value = false
  }
}

function formatDate(dateValue: Date | string | undefined) {
  if (!dateValue) return ''
  const date = dateValue instanceof Date ? dateValue : new Date(dateValue)
  return date.toLocaleDateString('pl-PL', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function goToSession(sessionId: number | undefined) {
  if (sessionId) {
    router.push(`/teacher/session/${sessionId}`)
  }
}

function handleLogout() {
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
}

.header h1 {
  color: #333;
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
