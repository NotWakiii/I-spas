<template>

<div class="monitor-page">

    

    <div class="page-header">

        <div>

            <h1>

                Real-Time Student Monitoring

            </h1>

            <p>

                Exam: {{ exam.title }}

            </p>

        </div>

       <div class="header-buttons">

    <button
        class="end-btn"
        @click="endExam"
    >

        ⛔ End Examination

    </button>

</div>

        </div>

   

    <!-- ===========================================
         STATISTICS
    ============================================ -->

    <div class="stats">

        <!-- Active -->

        <div class="card">

            <div>

                <small>

                    Active Students

                </small>

                <h2 class="green">

                    {{ activeStudents }}

                </h2>

            </div>

            <div class="icon green-bg">

                🖥️

            </div>

        </div>

        <!-- Idle -->

        <div class="card">

            <div>

                <small>

                    Idle Students

                </small>

                <h2 class="orange">

                    {{ idleStudents }}

                </h2>

            </div>

            <div class="icon yellow-bg">

                ⏱️

            </div>

        </div>

        <!-- Suspicious -->

        <div class="card">

            <div>

                <small>

                    Suspicious Activity

                </small>

                <h2 class="red">

                    {{ suspiciousStudents }}

                </h2>

            </div>

            <div class="icon red-bg">

                ⚠️

            </div>

        </div>

        <!-- Progress -->

        <div class="card">

            <div>

                <small>

                    Average Progress

                </small>

                <h2 class="blue">

                    {{ averageProgress }}%

                </h2>

            </div>

            <div class="icon blue-bg">

                📊

            </div>

        </div>

    </div>

    <!-- ===========================================
         STUDENT ACTIVITY
    ============================================ -->

    <div class="activity-panel">

        <div class="activity-header">

            <h2>

                Student Activity

            </h2>

        </div>

                <!-- ===========================================
             STUDENT LIST
        ============================================ -->

        <div
            v-for="student in students"
            :key="student.id"
            class="student-card"
        >

            <!-- TOP -->

            <div class="student-top">

                <div class="student-info">

                    <div class="avatar">

                        {{ student.initials }}

                    </div>

                    <div>

                        <h3>

                            {{ student.name }}

                        </h3>

                        <span
                            class="status"
                            :class="student.status.toLowerCase()"
                        >

                            {{ student.status }}

                        </span>

                    </div>

                </div>

                <div class="timer">

                    <small>

                        Time Remaining

                    </small>

                    <strong>

                        {{ examTimer }}

                    </strong>

                </div>

            </div>

            <!-- MIDDLE -->

            <div class="student-stats">

                <!-- Progress -->

                <div>

                    <small>

                        Progress

                    </small>

                    <div class="progress">

                        <div
                            class="progress-fill"
                            :style="{

                                width: student.progress + '%'

                            }"
                        ></div>

                    </div>

                    <strong>

                        {{ student.progress }}%

                    </strong>

                </div>

                <!-- Current Question -->

                <div>

                    <small>

                        Current Question

                    </small>

                    <strong>

                        {{ student.currentQuestion }}

                        /

                        {{ exam.items }}

                    </strong>

                </div>

                <!-- Tab Switches -->

                <div>

                    <small>

                        Tab Switches

                    </small>

                    <strong
                        :class="{

                            danger: student.tabSwitches > 2

                        }"
                    >

                        {{ student.tabSwitches }}

                    </strong>

                </div>

                <!-- Idle -->

                <div>

                    <small>

                        Idle Time

                    </small>

                    <strong>

                        {{ student.idleTime }}s

                    </strong>

                </div>

            </div>


    <!-- ===========================================
         LIVE ALERT
    ============================================ -->

    <transition name="fade">

        <div
            v-if="alertMessage"
            class="live-alert"
        >

            ⚠ {{ alertMessage }}

        </div>

    </transition>

</div>

<!-- ===========================================
     END EXAM POPUP
=========================================== -->

<div
    v-if="showEndPopup"
    class="popup-overlay"
>

    <div class="popup-card">

        <div class="popup-icon danger-icon">

            ⛔

        </div>

        <h2>

            End Examination?

        </h2>

        <p>

            This will immediately stop the examination for all students.

            <br><br>

            Submitted answers will be recorded automatically.

        </p>

        <div class="popup-buttons">

            <button
                class="cancel-btn"
                @click="cancelEndExam"
            >

                Cancel

            </button>

            <button
                class="danger-btn"
                @click="confirmEndExam"
            >

                End Exam

            </button>

        </div>
</div>
    </div>
</div>
</div>

</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import api from '../services/api'

const router = useRouter()
const route = useRoute()

const alertMessage = ref('')
const showEndPopup = ref(false)

const exam = ref({
  id: 0,
  title: '',
  items: 0,
  duration: 0
})

const students = ref<any[]>([])
const remainingSeconds = ref(0)

const examTimer = computed(() => {
  const minutes = Math.floor(remainingSeconds.value / 60)
  const seconds = remainingSeconds.value % 60

  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
})

const activeStudents = computed(() =>
  students.value.filter(s => s.status === 'Active').length
)

const idleStudents = computed(() =>
  students.value.filter(s => s.status === 'Idle').length
)

const suspiciousStudents = computed(() =>
  students.value.filter(s => s.tabSwitches >= 3).length
)

const averageProgress = computed(() => {
  if (students.value.length === 0) return 0

  const total = students.value.reduce(
    (sum, s) => sum + Number(s.progress || 0),
    0
  )

  return Math.round(total / students.value.length)
})

async function fetchMonitoring() {
  try {
    const examId = route.params.id

    const examResponse = await api.get(`/exams/${examId}`)
    const data = examResponse.data.data
    const questions = data.questions || []

    exam.value = {
      id: data.id,
      title: data.title,
      items: questions.length,
      duration: data.duration
    }

    if (remainingSeconds.value === 0) {
      remainingSeconds.value = Number(data.duration || 0) * 60
    }

    const lobbyResponse = await api.get(`/exams/${examId}/lobby`)

    students.value = lobbyResponse.data.data.map((session:any) => {
      const name = session.student_name || 'Unknown Student'

      return {
        id: session.id,
        initials: name
          .split(' ')
          .map((word:string) => word[0])
          .join('')
          .substring(0, 2)
          .toUpperCase(),
        name,
        status: Number(session.idle_seconds || 0) >= 30 ? 'Idle' : 'Active',
        progress: Number(session.progress || 0),
        currentQuestion: Math.max(
          1,
          Math.ceil((Number(session.progress || 0) / 100) * questions.length)
        ),
        tabSwitches: Number(session.tab_switches || 0),
        idleTime: Number(session.idle_seconds || 0)
      }
    })

  } catch (error) {
    console.error(error)
    alert('Failed to load monitoring.')
  }
}

let timer:any = null

function startTimer() {
  timer = setInterval(() => {
    if (remainingSeconds.value > 0) {
      remainingSeconds.value--
    }
  }, 1000)
}

function endExam() {
  showEndPopup.value = true
}

async function confirmEndExam() {
  showEndPopup.value = false

  try {
   clearInterval(timer)

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
  startTimer()
})
</script>

<style scoped>

/* ==========================================
   GLOBAL
========================================== */

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

/* ==========================================
   HEADER
========================================== */

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

.header-buttons{

    display:flex;

    gap:15px;

}

.pause-btn{

    border:none;

    background:#facc15;

    color:#222;

    padding:14px 24px;

    border-radius:12px;

    cursor:pointer;

    font-weight:600;

    transition:.25s;

}

.pause-btn:hover{

    background:#eab308;

}

.end-btn{

    border:none;

    background:#ef4444;

    color:white;

    padding:14px 24px;

    border-radius:12px;

    cursor:pointer;

    font-weight:600;

    transition:.25s;

}

.end-btn:hover{

    background:#dc2626;

}

/* ==========================================
   STATISTICS
========================================== */

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

.card small{

    color:#666;

}

.card h2{

    margin-top:8px;

    font-size:36px;

}

.green{

    color:#16a34a;

}

.orange{

    color:#d97706;

}

.red{

    color:#dc2626;

}

.blue{

    color:#2563eb;

}

.icon{

    width:58px;

    height:58px;

    border-radius:14px;

    display:flex;

    justify-content:center;

    align-items:center;

    font-size:28px;

}

.green-bg{

    background:#dcfce7;

}

.yellow-bg{

    background:#fef3c7;

}

.red-bg{

    background:#fee2e2;

}

.blue-bg{

    background:#dbeafe;

}

/* ==========================================
   ACTIVITY PANEL
========================================== */

.activity-panel{

    background:white;

    border-radius:20px;

    padding:25px;

    box-shadow:0 10px 25px rgba(0,0,0,.05);

}

.activity-header{

    margin-bottom:20px;

}

.activity-header h2{

    color:#112244;

}

/* ==========================================
   STUDENT CARD
========================================== */

.student-card{

    border:1px solid #e5e7eb;

    border-radius:16px;

    padding:20px;

    margin-bottom:18px;

    transition:.25s;

}

.student-card:hover{

    transform:translateY(-2px);

    box-shadow:0 8px 20px rgba(0,0,0,.06);

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

/* ==========================================
   STATUS
========================================== */

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

/* ==========================================
   TIMER
========================================== */

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

/* ==========================================
   STUDENT STATS
========================================== */

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

.student-stats strong{

    color:#112244;

    font-size:16px;

}

.danger{

    color:#dc2626 !important;

    font-weight:700;

}

/* ==========================================
   PROGRESS BAR
========================================== */

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

/* ==========================================
   LIVE ALERT
========================================== */

.live-alert{

    position:fixed;

    bottom:30px;

    right:30px;

    background:#ef4444;

    color:white;

    padding:16px 22px;

    border-radius:14px;

    font-weight:600;

    box-shadow:0 15px 40px rgba(0,0,0,.18);

    z-index:9999;

}

/* ==========================================
   ANIMATION
========================================== */

.fade-enter-active,

.fade-leave-active{

    transition:.3s;

}

.fade-enter-from,

.fade-leave-to{

    opacity:0;

    transform:translateY(20px);

}

/* ==========================================
   RESPONSIVE
========================================== */

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

.header-buttons{

    width:100%;

    flex-direction:column;

}

.header-buttons button{

    width:100%;

}

.student-top{

    flex-direction:column;

    align-items:flex-start;

    gap:15px;

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

.card h2{

    font-size:28px;

}

.live-alert{

    left:15px;

    right:15px;

    bottom:15px;

    text-align:center;

}

}

/* ==========================================
   CUSTOM POPUP
========================================== */

.popup-overlay{

    position:fixed;

    inset:0;

    background:rgba(0,0,0,.55);

    backdrop-filter:blur(5px);

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

    animation:popup .25s ease;

    box-shadow:0 20px 45px rgba(0,0,0,.18);

}

@keyframes popup{

from{

    transform:scale(.9);

    opacity:0;

}

to{

    transform:scale(1);

    opacity:1;

}

}

.popup-icon{

    width:80px;

    height:80px;

    margin:auto;

    margin-bottom:20px;

    border-radius:50%;

    display:flex;

    justify-content:center;

    align-items:center;

    font-size:34px;

    color:white;

}

.danger-icon{

    background:#ef4444;

}

.popup-card h2{

    color:#112244;

    margin-bottom:15px;

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

.cancel-btn{

    flex:1;

    border:none;

    background:#e5e7eb;

    color:#111827;

    padding:14px;

    border-radius:10px;

    cursor:pointer;

    font-weight:600;

}

.cancel-btn:hover{

    background:#d1d5db;

}

.danger-btn{

    flex:1;

    border:none;

    background:#ef4444;

    color:white;

    padding:14px;

    border-radius:10px;

    cursor:pointer;

    font-weight:600;

}

.danger-btn:hover{

    background:#dc2626;

}

</style>