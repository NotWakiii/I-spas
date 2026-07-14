<template>
  <div class="monitor-page">
    <div class="page-header">
      <div>
        <h1>Real-Time Student Monitoring</h1>
        <p>Exam: {{ exam.title }}</p>
      </div>

      <button class="end-btn" @click="endExam">
        ⛔ End Examination
      </button>
    </div>

    <div class="stats">
      <div class="card">
        <div>
          <small>Active Students</small>
          <h2 class="green">{{ activeStudents }}</h2>
        </div>
        <div class="icon green-bg">🖥️</div>
      </div>

      <div class="card">
        <div>
          <small>Idle Students</small>
          <h2 class="orange">{{ idleStudents }}</h2>
        </div>
        <div class="icon yellow-bg">⏱️</div>
      </div>

      <div class="card">
        <div>
          <small>Suspicious Activity</small>
          <h2 class="red">{{ suspiciousStudents }}</h2>
        </div>
        <div class="icon red-bg">⚠️</div>
      </div>

      <div class="card">
        <div>
          <small>Average Progress</small>
          <h2 class="blue">{{ averageProgress }}%</h2>
        </div>
        <div class="icon blue-bg">📊</div>
      </div>
    </div>

    <div class="activity-panel">
      <h2>Student Activity</h2>

      <div v-if="students.length === 0" class="empty-state">
        No students are currently connected.
      </div>

      <div
        v-for="student in students"
        :key="student.id"
        class="student-card"
      >
        <div class="student-top">
          <div class="student-info">
            <div class="avatar">{{ student.initials }}</div>

            <div>
              <h3>{{ student.name }}</h3>
              <span
                class="status"
                :class="student.status.toLowerCase()"
              >
                {{ student.status }}
              </span>
            </div>
          </div>

          <div class="timer">
            <small>Time Remaining</small>
            <strong>{{ formatStudentTime(student.timeRemaining) }}</strong>
          </div>
        </div>

        <div class="student-stats">
          <div>
            <small>Progress</small>
            <div class="progress">
              <div
                class="progress-fill"
                :style="{ width: `${student.progress}%` }"
              ></div>
            </div>
            <strong>{{ student.progress }}%</strong>
          </div>

          <div>
            <small>Current Question</small>
            <strong>{{ student.currentQuestion }} / {{ exam.items }}</strong>
          </div>

          <div>
            <small>Tab Switches</small>
            <strong :class="{ danger: student.tabSwitches > 0 }">
              {{ student.tabSwitches }}
            </strong>
          </div>

          <div>
            <small>Idle Time</small>
            <strong :class="{ danger: student.idleTime >= 30 }">
              {{ student.idleTime }}s
            </strong>
          </div>
        </div>
      </div>
    </div>

    <transition name="fade">
      <div v-if="alertMessage" class="live-alert">
        ⚠ {{ alertMessage }}
      </div>
    </transition>

    <div v-if="showEndPopup" class="popup-overlay">
      <div class="popup-card">
        <div class="popup-icon">⛔</div>
        <h2>End Examination?</h2>
        <p>
          This will immediately stop the examination for all students.
          Submitted answers will be recorded automatically.
        </p>

        <div class="popup-buttons">
          <button class="cancel-btn" @click="cancelEndExam">
            Cancel
          </button>

          <button class="danger-btn" @click="confirmEndExam">
            End Exam
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  ref,
  computed,
  onMounted,
  onUnmounted,
} from 'vue'

import { useRouter, useRoute } from 'vue-router'
import api from '../services/api'

interface MonitoringStudent {
  id: number
  initials: string
  name: string
  status: 'Active' | 'Idle' | 'Disconnected'
  progress: number
  currentQuestion: number
  tabSwitches: number
  idleTime: number
  timeRemaining: number
}

interface SessionPayload {
  id: number
  student_name?: string
  progress?: number
  current_question?: number
  tab_switches?: number
  idle_seconds?: number
  time_remaining?: number
  last_seen_at?: string | null
}

const router = useRouter()
const route = useRoute()

const alertMessage = ref('')
const showEndPopup = ref(false)

const exam = ref({
  id: 0,
  title: '',
  items: 0,
  duration: 0,
})

const students = ref<MonitoringStudent[]>([])

let monitoringInterval:
  ReturnType<typeof setInterval> | null = null

let alertTimeout:
  ReturnType<typeof setTimeout> | null = null

const activeStudents = computed(() =>
  students.value.filter(
    (student) => student.status === 'Active'
  ).length
)

const idleStudents = computed(() =>
  students.value.filter(
    (student) => student.status === 'Idle'
  ).length
)

const suspiciousStudents = computed(() =>
  students.value.filter(
    (student) => student.tabSwitches > 0
  ).length
)

const averageProgress = computed(() => {
  if (!students.value.length) return 0

  const total = students.value.reduce(
    (sum, student) => sum + student.progress,
    0
  )

  return Math.round(total / students.value.length)
})

function formatStudentTime(seconds: number): string {
  const safe = Math.max(Number(seconds || 0), 0)
  const minutes = Math.floor(safe / 60)
  const remaining = safe % 60

  return `${String(minutes).padStart(2, '0')}:${String(remaining).padStart(2, '0')}`
}

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word.charAt(0))
    .join('')
    .substring(0, 2)
    .toUpperCase()
}

function getStudentStatus(
  session: SessionPayload
): 'Active' | 'Idle' | 'Disconnected' {
  const idleSeconds = Number(session.idle_seconds || 0)

  if (session.last_seen_at) {
    const lastSeen = new Date(session.last_seen_at).getTime()
    const secondsSinceUpdate = Math.floor(
      (Date.now() - lastSeen) / 1000
    )

    if (secondsSinceUpdate > 15) {
      return 'Disconnected'
    }
  }

  return idleSeconds >= 30 ? 'Idle' : 'Active'
}

function showAlert(message: string) {
  alertMessage.value = message

  if (alertTimeout) {
    clearTimeout(alertTimeout)
  }

  alertTimeout = setTimeout(() => {
    alertMessage.value = ''
  }, 4000)
}

async function fetchMonitoring() {
  try {
    const examId = route.params.id

    const examResponse = await api.get(
      `/exams/${examId}`,
      { params: { timestamp: Date.now() } }
    )

    const data = examResponse.data.data
    const questions = Array.isArray(data.questions)
      ? data.questions
      : []

    exam.value = {
      id: Number(data.id),
      title: data.title || 'Examination',
      items:
        Number(data.questions_count) ||
        questions.length ||
        0,
      duration: Number(data.duration || 0),
    }

    const lobbyResponse = await api.get(
      `/exams/${examId}/lobby`,
      { params: { timestamp: Date.now() } }
    )

    const sessions: SessionPayload[] =
      Array.isArray(lobbyResponse.data?.data)
        ? lobbyResponse.data.data
        : []

    const previous = new Map(
      students.value.map((student) => [
        student.id,
        student,
      ])
    )

    students.value = sessions.map((session) => {
      const name =
        session.student_name ||
        'Unknown Student'

      const oldStudent = previous.get(session.id)
      const tabSwitches = Number(
        session.tab_switches || 0
      )

      if (
        oldStudent &&
        tabSwitches > oldStudent.tabSwitches
      ) {
        showAlert(
          `${name} switched tabs. Total: ${tabSwitches}`
        )
      }

      return {
        id: session.id,
        initials: getInitials(name),
        name,
        status: getStudentStatus(session),
        progress: Number(session.progress || 0),
        currentQuestion: Math.max(
          Number(session.current_question || 1),
          1
        ),
        tabSwitches,
        idleTime: Number(session.idle_seconds || 0),
        timeRemaining: Number(
          session.time_remaining ||
          exam.value.duration * 60
        ),
      }
    })
  } catch (error) {
    console.error('MONITORING LOAD ERROR:', error)
  }
}

function endExam() {
  showEndPopup.value = true
}

async function confirmEndExam() {
  showEndPopup.value = false

  try {
    if (monitoringInterval) {
      clearInterval(monitoringInterval)
      monitoringInterval = null
    }

    await api.post(`/exams/${exam.value.id}/end`)
    router.push(`/faculty/results/${exam.value.id}`)
  } catch (error) {
    console.error(error)
    alert('Failed to end exam.')
  }
}

function cancelEndExam() {
  showEndPopup.value = false
}

onMounted(async () => {
  await fetchMonitoring()

  monitoringInterval = setInterval(() => {
    fetchMonitoring()
  }, 2000)
})

onUnmounted(() => {
  if (monitoringInterval) {
    clearInterval(monitoringInterval)
  }

  if (alertTimeout) {
    clearTimeout(alertTimeout)
  }
})
</script>

<style scoped>
*{
  margin:0;
  padding:0;
  box-sizing:border-box;
}

.monitor-page{
  min-height:100vh;
  background:#eefbf4;
  padding:30px;
  font-family:'Poppins',sans-serif;
}

.page-header{
  display:flex;
  justify-content:space-between;
  align-items:center;
  margin-bottom:30px;
}

.page-header h1{
  font-size:38px;
  color:#112244;
  margin-bottom:6px;
}

.page-header p{
  color:#666;
}

.end-btn{
  border:none;
  background:#ef4444;
  color:white;
  padding:14px 24px;
  border-radius:12px;
  cursor:pointer;
  font-weight:600;
}

.stats{
  display:grid;
  grid-template-columns:repeat(4,1fr);
  gap:20px;
  margin-bottom:30px;
}

.card{
  background:white;
  border-radius:18px;
  padding:22px;
  display:flex;
  justify-content:space-between;
  align-items:center;
  box-shadow:0 10px 25px rgba(0,0,0,.05);
}

.card h2{
  margin-top:8px;
  font-size:36px;
}

.green{ color:#16a34a; }
.orange{ color:#d97706; }
.red{ color:#dc2626; }
.blue{ color:#2563eb; }

.icon{
  width:58px;
  height:58px;
  border-radius:14px;
  display:flex;
  justify-content:center;
  align-items:center;
  font-size:28px;
}

.green-bg{ background:#dcfce7; }
.yellow-bg{ background:#fef3c7; }
.red-bg{ background:#fee2e2; }
.blue-bg{ background:#dbeafe; }

.activity-panel{
  background:white;
  border-radius:20px;
  padding:25px;
  box-shadow:0 10px 25px rgba(0,0,0,.05);
}

.activity-panel h2{
  color:#112244;
  margin-bottom:20px;
}

.empty-state{
  text-align:center;
  padding:40px;
  color:#777;
}

.student-card{
  border:1px solid #e5e7eb;
  border-radius:16px;
  padding:20px;
  margin-bottom:18px;
}

.student-top{
  display:flex;
  justify-content:space-between;
  align-items:center;
  margin-bottom:20px;
}

.student-info{
  display:flex;
  align-items:center;
  gap:15px;
}

.avatar{
  width:48px;
  height:48px;
  border-radius:50%;
  background:#dcfce7;
  color:#15803d;
  display:flex;
  justify-content:center;
  align-items:center;
  font-weight:700;
}

.student-info h3{
  margin-bottom:6px;
  color:#112244;
}

.status{
  display:inline-block;
  padding:6px 12px;
  border-radius:999px;
  font-size:12px;
  font-weight:600;
}

.active{
  background:#dcfce7;
  color:#15803d;
}

.idle{
  background:#fef3c7;
  color:#b45309;
}

.disconnected{
  background:#e2e8f0;
  color:#475569;
}

.timer{
  text-align:right;
}

.timer small{
  display:block;
  color:#777;
  margin-bottom:6px;
}

.timer strong{
  font-size:22px;
  color:#ef4444;
}

.student-stats{
  display:grid;
  grid-template-columns:repeat(4,1fr);
  gap:20px;
}

.student-stats small{
  display:block;
  color:#777;
  margin-bottom:8px;
}

.danger{
  color:#dc2626 !important;
}

.progress{
  width:100%;
  height:10px;
  background:#e5e7eb;
  border-radius:999px;
  overflow:hidden;
  margin-bottom:8px;
}

.progress-fill{
  height:100%;
  background:#16a34a;
  border-radius:999px;
  transition:.4s;
}

.live-alert{
  position:fixed;
  bottom:30px;
  right:30px;
  background:#ef4444;
  color:white;
  padding:16px 22px;
  border-radius:14px;
  font-weight:600;
  z-index:9999;
}

.fade-enter-active,
.fade-leave-active{
  transition:.3s;
}

.fade-enter-from,
.fade-leave-to{
  opacity:0;
  transform:translateY(20px);
}

.popup-overlay{
  position:fixed;
  inset:0;
  background:rgba(0,0,0,.55);
  display:flex;
  justify-content:center;
  align-items:center;
  z-index:99999;
}

.popup-card{
  width:430px;
  max-width:95%;
  background:white;
  border-radius:22px;
  padding:35px;
  text-align:center;
}

.popup-icon{
  width:80px;
  height:80px;
  margin:0 auto 20px;
  border-radius:50%;
  background:#ef4444;
  color:white;
  display:flex;
  justify-content:center;
  align-items:center;
  font-size:34px;
}

.popup-card p{
  color:#666;
  line-height:1.7;
}

.popup-buttons{
  display:flex;
  gap:15px;
  margin-top:30px;
}

.cancel-btn,
.danger-btn{
  flex:1;
  border:none;
  padding:14px;
  border-radius:10px;
  cursor:pointer;
  font-weight:600;
}

.cancel-btn{
  background:#e5e7eb;
}

.danger-btn{
  background:#ef4444;
  color:white;
}

@media(max-width:1100px){
  .stats{
    grid-template-columns:repeat(2,1fr);
  }

  .student-stats{
    grid-template-columns:repeat(2,1fr);
  }
}

@media(max-width:768px){
  .monitor-page{
    padding:20px;
  }

  .page-header{
    flex-direction:column;
    align-items:flex-start;
    gap:20px;
  }

  .end-btn{
    width:100%;
  }

  .student-top{
    flex-direction:column;
    align-items:flex-start;
    gap:15px;
  }

  .timer{
    text-align:left;
  }

  .student-stats{
    grid-template-columns:1fr;
  }
}

@media(max-width:500px){
  .stats{
    grid-template-columns:1fr;
  }

  .page-header h1{
    font-size:28px;
  }

  .live-alert{
    left:15px;
    right:15px;
    bottom:15px;
    text-align:center;
  }
}
</style>
