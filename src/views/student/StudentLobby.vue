<template>

<div class="lobby-page">

    <!-- Background -->

    <div class="background-overlay"></div>

    <!-- Main Card -->

    <div class="lobby-card">

        <!-- Header -->

        <div class="header">

            <img
                src="../../assets/logo.png"
                class="logo"
            >

            <div>

                <h1>
                    Student Lobby
                </h1>

                <p>
                    Waiting for your professor to start the examination.
                </p>

            </div>

        </div>

        <!-- Exam Information -->

        <div class="exam-card">

            <h2>
                {{ exam.title }}
            </h2>

            <p class="course">
                {{ exam.course }}
            </p>

            <div class="exam-grid">

                <div>
                    <small>Duration</small>

                    <strong>
                        {{ exam.duration }} mins
                    </strong>
                </div>

                <div>
                    <small>Questions</small>

                    <strong>
                        {{ exam.total_questions }}
                    </strong>
                </div>

                <div>
                    <small>Passing</small>

                    <strong>
                        {{ exam.passing }}%
                    </strong>
                </div>

                <div>
                    <small>Status</small>

                    <strong class="status">

                        {{ exam.status }}

                    </strong>
                </div>

            </div>

        </div>

        <!-- Student Information -->

        <div class="student-card">

            <h3>

                Welcome,

                <span>

                    {{ studentName }}

                </span>

            </h3>

            <p>

                {{ section }}

            </p>

        </div>

        <!-- Waiting Status -->

        <div
            class="waiting-card"
            v-if="!countdownStarted"
        >

            <div class="loader"></div>

            <h2>

                Waiting for Professor...

            </h2>

            <p>

                The examination has not started yet.

            </p>

        </div>

        <!-- Students Joined -->

        <div class="joined-card">

            <div class="joined-header">

                <h2>

                    Students Joined

                </h2>

                <span>

                    {{ students.length }}

                </span>

            </div>

            <div class="student-list">

                <div
                    v-for="student in students"
                    :key="student.id"
                    class="student-item"
                >

                    <div class="avatar">

                        {{ student.student_name.charAt(0) }}

                    </div>

                    <div>

                        <strong>

                            {{ student.student_name }}

                        </strong>

                    </div>

                </div>

            </div>

        </div>

    </div>

    <!-- Countdown -->

    <div
        v-if="countdownStarted"
        class="countdown-overlay"
    >

        <div class="countdown-box">

            <h2>

                GET READY

            </h2>

            <p>

                Examination will begin in

            </p>

            <div class="count">

                {{ countdown }}

            </div>

            <ul>

                <li>
                    Do not switch tabs
                </li>

                <li>
                    Copy & Paste is disabled
                </li>

                <li>
                    Stay in fullscreen mode
                </li>

            </ul>

        </div>

    </div>

</div>

</template>

<script setup lang="ts">
import {
  ref,
  onMounted,
  onUnmounted,
} from 'vue'

import { useRouter } from 'vue-router'
import api from '../../services/api'

const router = useRouter()

interface StoredSession {
  id: number
  exam_id: number
  student_name: string
  status: string
}

interface StoredExam {
  id: number
  title?: string
  course?: string
  duration?: number
  passing?: number
  status?: string
  questions_count?: number
  total_questions?: number
  items?: number
  questions?: unknown[]
}

interface LobbyStudent {
  id: number
  student_name: string
  status?: string
}

const exam = ref({
  id: 0,
  title: 'Loading examination...',
  course: '',
  duration: 0,
  total_questions: 0,
  passing: 75,
  status: 'Ready',
})

const studentName = ref('')
const section = ref('')

const students = ref<LobbyStudent[]>([])

const loading = ref(true)
const errorMessage = ref('')

const countdownStarted = ref(false)
const countdown = ref(10)

let lobbyInterval:
  ReturnType<typeof setInterval> | null = null

let countdownInterval:
  ReturnType<typeof setInterval> | null = null

function clearStudentStorage() {
  localStorage.removeItem('student_session')
  localStorage.removeItem('student_exam')
  localStorage.removeItem('student_name')
  localStorage.removeItem('student_section')
  localStorage.removeItem('student_access_code')
}

function readStoredData(): {
  session: StoredSession
  exam: StoredExam
} | null {
  const sessionText =
    localStorage.getItem('student_session')

  const examText =
    localStorage.getItem('student_exam')

  if (!sessionText || !examText) {
    clearStudentStorage()
    router.replace('/student')
    return null
  }

  try {
    return {
      session: JSON.parse(sessionText) as StoredSession,
      exam: JSON.parse(examText) as StoredExam,
    }
  } catch (error) {
    console.error(
      'Invalid stored student information:',
      error
    )

    clearStudentStorage()
    router.replace('/student')

    return null
  }
}

function getQuestionCount(data: StoredExam): number {
  if (Number(data.questions_count) > 0) {
    return Number(data.questions_count)
  }

  if (Number(data.total_questions) > 0) {
    return Number(data.total_questions)
  }

  if (Number(data.items) > 0) {
    return Number(data.items)
  }

  if (Array.isArray(data.questions)) {
    return data.questions.length
  }

  return 0
}

function getStudentStatus(
  backendStatus?: string
): string {
  const status = String(
    backendStatus || 'published'
  ).toLowerCase()

  if (status === 'started') {
    return 'Starting'
  }

  if (status === 'finished') {
    return 'Finished'
  }

  if (status === 'published') {
    return 'Ready'
  }

  if (status === 'draft') {
    return 'Not Ready'
  }

  return 'Ready'
}

function applyStoredExam(storedExam: StoredExam) {
  exam.value = {
    id: Number(storedExam.id || 0),

    title:
      storedExam.title ||
      'Untitled Examination',

    course:
      storedExam.course ||
      'No course specified',

    duration:
      Number(storedExam.duration || 0),

    total_questions:
      getQuestionCount(storedExam),

    passing:
      Number(storedExam.passing || 75),

    status:
      getStudentStatus(storedExam.status),
  }
}

async function fetchLobby() {
  const storedData = readStoredData()

  if (!storedData || countdownStarted.value) return

  const examId = Number(
    storedData.exam.id ||
    storedData.session.exam_id
  )

  if (!examId) {
    errorMessage.value = 'Invalid examination information.'
    return
  }

  try {
    errorMessage.value = ''

    /*
     * Check status separately so a failed student-list request
     * cannot prevent the countdown.
     */
    const statusResponse = await api.get(
      `/student/exams/${examId}/status`,
      {
        params: {
          timestamp: Date.now(),
        },
        headers: {
          'Cache-Control': 'no-cache',
        },
      }
    )

    const examData = statusResponse.data?.data as StoredExam

    if (!examData) {
      throw new Error('Laravel returned no examination data.')
    }

    const backendStatus = String(
      examData.status || ''
    )
      .trim()
      .toLowerCase()

    console.log(
      'Student detected exam status:',
      backendStatus
    )

    exam.value = {
      id: Number(examData.id),
      title:
        examData.title ||
        'Untitled Examination',
      course:
        examData.course ||
        'No course specified',
      duration:
        Number(examData.duration || 0),
      total_questions:
        getQuestionCount(examData),
      passing:
        Number(examData.passing || 75),
      status:
        getStudentStatus(backendStatus),
    }

    localStorage.setItem(
      'student_exam',
      JSON.stringify(examData)
    )

    /*
     * Start countdown immediately.
     */
    if (backendStatus === 'started') {
      startCountdown()
      return
    }

    if (backendStatus === 'finished') {
      router.replace('/student/results')
      return
    }

    /*
     * Fetch student list separately.
     */
    try {
      const lobbyResponse = await api.get(
        `/student/exams/${examId}/lobby`,
        {
          params: {
            timestamp: Date.now(),
          },
        }
      )

      students.value = Array.isArray(
        lobbyResponse.data?.data
      )
        ? lobbyResponse.data.data
        : []
    } catch (lobbyError) {
      console.error(
        'LOBBY STUDENT LIST ERROR:',
        lobbyError
      )
    }
  } catch (error: unknown) {
    console.error(
      'STUDENT STATUS ERROR:',
      error
    )

    const apiError = error as {
      response?: {
        status?: number
        data?: {
          message?: string
        }
      }
    }

    errorMessage.value =
      apiError.response?.data?.message ||
      'Unable to check examination status. Retrying...'
  } finally {
    loading.value = false
  }
}

function startCountdown() {
  if (countdownStarted.value) return

  console.log('Starting student countdown')

  countdownStarted.value = true
  countdown.value = 10

  if (lobbyInterval) {
    clearInterval(lobbyInterval)
    lobbyInterval = null
  }

  if (countdownInterval) {
    clearInterval(countdownInterval)
  }

  countdownInterval = setInterval(() => {
    countdown.value -= 1

    console.log(
      'Countdown:',
      countdown.value
    )

    if (countdown.value <= 0) {
      if (countdownInterval) {
        clearInterval(countdownInterval)
        countdownInterval = null
      }

      router.replace('/student/exam')
    }
  }, 1000)
}

onMounted(async () => {
  const storedData = readStoredData()

  if (!storedData) return

  applyStoredExam(storedData.exam)

  studentName.value =
    localStorage.getItem('student_name') ||
    storedData.session.student_name ||
    'Student'

  section.value =
    localStorage.getItem('student_section') ||
    ''

  await fetchLobby()

  lobbyInterval = setInterval(() => {
    fetchLobby()
  }, 3000)
})

onUnmounted(() => {
  if (lobbyInterval) {
    clearInterval(lobbyInterval)
    lobbyInterval = null
  }

  if (countdownInterval) {
    clearInterval(countdownInterval)
    countdownInterval = null
  }
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap');

*{
    margin:0;
    padding:0;
    box-sizing:border-box;
    font-family:'Poppins',sans-serif;
}

.lobby-page{
    position:relative;
    width:100%;
    min-height:100vh;
    padding:32px;
    display:flex;
    justify-content:center;
    align-items:flex-start;
    overflow-x:hidden;
    background:
        radial-gradient(
            circle at top left,
            rgba(34,197,94,.22),
            transparent 35%
        ),
        linear-gradient(
            135deg,
            #052e24 0%,
            #064e3b 50%,
            #0a6b45 100%
        );
}

.background-overlay{
    position:fixed;
    inset:0;
    pointer-events:none;
    background:
        radial-gradient(
            circle at bottom right,
            rgba(255,255,255,.08),
            transparent 38%
        );
}

.lobby-card{
    position:relative;
    z-index:1;
    width:min(100%,1000px);
    margin:auto;
    padding:34px;
    border:1px solid rgba(255,255,255,.25);
    border-radius:28px;
    background:rgba(255,255,255,.96);
    box-shadow:0 30px 70px rgba(0,0,0,.3);
    backdrop-filter:blur(12px);
}

/* =========================
   HEADER
========================= */

.header{
    display:flex;
    align-items:center;
    gap:20px;
    margin-bottom:28px;
    padding-bottom:24px;
    border-bottom:1px solid #e2e8f0;
}

.logo{
    width:76px;
    height:76px;
    padding:7px;
    object-fit:contain;
    border-radius:18px;
    background:#ffffff;
    box-shadow:0 10px 24px rgba(15,23,42,.12);
}

.header h1{
    margin-bottom:5px;
    color:#0f172a;
    font-size:30px;
    font-weight:800;
}

.header p{
    color:#64748b;
    font-size:14px;
}

/* =========================
   EXAM CARD
========================= */

.exam-card{
    margin-bottom:22px;
    padding:25px;
    border:1px solid #bbf7d0;
    border-radius:18px;
    background:
        linear-gradient(
            135deg,
            #f0fdf4,
            #ffffff
        );
}

.exam-card h2{
    margin-bottom:5px;
    color:#14532d;
    font-size:25px;
    font-weight:800;
}

.course{
    margin-bottom:20px;
    color:#16a34a;
    font-size:14px;
    font-weight:700;
}

.exam-grid{
    display:grid;
    grid-template-columns:repeat(4,1fr);
    gap:14px;
}

.exam-grid > div{
    padding:15px;
    border:1px solid #dcfce7;
    border-radius:13px;
    background:#ffffff;
}

.exam-grid small{
    display:block;
    margin-bottom:7px;
    color:#64748b;
    font-size:11px;
}

.exam-grid strong{
    color:#0f172a;
    font-size:14px;
    font-weight:800;
}

.status{
    text-transform:capitalize;
    color:#15803d !important;
}

/* =========================
   STUDENT INFORMATION
========================= */

.student-card{
    margin-bottom:22px;
    padding:19px 22px;
    border-left:5px solid #16a34a;
    border-radius:14px;
    background:#f8fafc;
}

.student-card h3{
    margin-bottom:5px;
    color:#334155;
    font-size:16px;
}

.student-card h3 span{
    color:#15803d;
}

.student-card p{
    color:#64748b;
    font-size:13px;
}

/* =========================
   WAITING STATUS
========================= */

.waiting-card{
    margin-bottom:22px;
    padding:35px 22px;
    border:1px dashed #86efac;
    border-radius:18px;
    text-align:center;
    background:#f0fdf4;
}

.loader{
    width:46px;
    height:46px;
    margin:0 auto 18px;
    border:4px solid #bbf7d0;
    border-top-color:#16a34a;
    border-radius:50%;
    animation:spin .8s linear infinite;
}

.waiting-card h2{
    margin-bottom:8px;
    color:#14532d;
    font-size:21px;
}

.waiting-card p{
    color:#64748b;
    font-size:13px;
}

/* =========================
   JOINED STUDENTS
========================= */

.joined-card{
    padding:23px;
    border:1px solid #e2e8f0;
    border-radius:18px;
    background:#ffffff;
}

.joined-header{
    display:flex;
    justify-content:space-between;
    align-items:center;
    margin-bottom:18px;
}

.joined-header h2{
    color:#0f172a;
    font-size:19px;
}

.joined-header span{
    min-width:38px;
    height:38px;
    padding:0 10px;
    display:flex;
    justify-content:center;
    align-items:center;
    border-radius:999px;
    background:#dcfce7;
    color:#15803d;
    font-size:13px;
    font-weight:800;
}

.student-list{
    max-height:270px;
    display:grid;
    grid-template-columns:repeat(2,1fr);
    gap:12px;
    overflow-y:auto;
    padding-right:4px;
}

.student-item{
    padding:13px;
    display:flex;
    align-items:center;
    gap:12px;
    border:1px solid #e2e8f0;
    border-radius:13px;
    background:#f8fafc;
}

.avatar{
    flex:0 0 40px;
    width:40px;
    height:40px;
    display:flex;
    justify-content:center;
    align-items:center;
    border-radius:50%;
    background:#dcfce7;
    color:#15803d;
    font-size:15px;
    font-weight:800;
    text-transform:uppercase;
}

.student-item strong{
    display:block;
    color:#334155;
    font-size:13px;
}

/* =========================
   COUNTDOWN
========================= */

.countdown-overlay{
    position:fixed;
    inset:0;
    z-index:99999;
    padding:20px;
    display:flex;
    justify-content:center;
    align-items:center;
    background:rgba(2,44,34,.88);
    backdrop-filter:blur(12px);
}

.countdown-box{
    width:min(100%,500px);
    padding:42px;
    border:1px solid rgba(255,255,255,.25);
    border-radius:28px;
    text-align:center;
    color:#ffffff;
    background:
        linear-gradient(
            145deg,
            rgba(22,163,74,.94),
            rgba(5,78,59,.97)
        );
    box-shadow:0 30px 70px rgba(0,0,0,.42);
    animation:countdownEnter .35s ease;
}

.countdown-box h2{
    margin-bottom:8px;
    font-size:34px;
    font-weight:800;
    letter-spacing:2px;
}

.countdown-box > p{
    color:#dcfce7;
    font-size:14px;
}

.count{
    width:145px;
    height:145px;
    margin:28px auto;
    display:flex;
    justify-content:center;
    align-items:center;
    border:5px solid rgba(255,255,255,.78);
    border-radius:50%;
    font-size:72px;
    font-weight:800;
    box-shadow:
        0 0 0 12px rgba(255,255,255,.08),
        0 18px 40px rgba(0,0,0,.2);
    animation:pulse 1s infinite;
}

.countdown-box ul{
    margin-top:20px;
    padding:18px 20px;
    border-radius:14px;
    text-align:left;
    list-style-position:inside;
    background:rgba(255,255,255,.11);
}

.countdown-box li{
    margin:9px 0;
    color:#f0fdf4;
    font-size:13px;
}

/* =========================
   ANIMATIONS
========================= */

@keyframes spin{
    to{
        transform:rotate(360deg);
    }
}

@keyframes pulse{
    0%,
    100%{
        transform:scale(1);
    }

    50%{
        transform:scale(1.05);
    }
}

@keyframes countdownEnter{
    from{
        opacity:0;
        transform:scale(.9);
    }

    to{
        opacity:1;
        transform:scale(1);
    }
}

/* =========================
   RESPONSIVE
========================= */

@media(max-width:850px){
    .lobby-page{
        padding:20px;
    }

    .lobby-card{
        padding:25px;
    }

    .exam-grid{
        grid-template-columns:repeat(2,1fr);
    }
}

@media(max-width:600px){
    .lobby-page{
        padding:10px;
    }

    .lobby-card{
        padding:20px;
        border-radius:20px;
    }

    .header{
        align-items:flex-start;
    }

    .logo{
        width:60px;
        height:60px;
    }

    .header h1{
        font-size:23px;
    }

    .header p{
        font-size:12px;
    }

    .exam-card{
        padding:19px;
    }

    .exam-card h2{
        font-size:20px;
    }

    .exam-grid{
        grid-template-columns:1fr;
    }

    .student-list{
        grid-template-columns:1fr;
    }

    .countdown-box{
        padding:30px 22px;
        border-radius:22px;
    }

    .countdown-box h2{
        font-size:28px;
    }

    .count{
        width:120px;
        height:120px;
        font-size:58px;
    }
}

@media(max-width:400px){
    .header{
        flex-direction:column;
    }

    .joined-header{
        align-items:flex-start;
    }
}
</style>
