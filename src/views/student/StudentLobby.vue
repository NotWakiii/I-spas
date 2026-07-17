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

            <div class="header-content">

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

img{
    display:block;
    max-width:100%;
}

.lobby-page{
    position:relative;
    width:100%;
    min-height:100vh;
    min-height:100dvh;
    padding:clamp(16px,3vw,32px);
    display:flex;
    justify-content:center;
    align-items:flex-start;
    overflow-x:hidden;
    background:
        radial-gradient(circle at top left,rgba(34,197,94,.22),transparent 35%),
        linear-gradient(135deg,#052e24 0%,#064e3b 50%,#0a6b45 100%);
}

.background-overlay{
    position:fixed;
    inset:0;
    pointer-events:none;
    background:
        radial-gradient(circle at bottom right,rgba(255,255,255,.08),transparent 38%);
}

.lobby-card{
    position:relative;
    z-index:1;
    width:min(100%,1100px);
    margin:auto;
    padding:clamp(22px,3vw,36px);
    border:1px solid rgba(255,255,255,.25);
    border-radius:28px;
    background:rgba(255,255,255,.96);
    box-shadow:0 30px 70px rgba(0,0,0,.3);
    backdrop-filter:blur(12px);
    -webkit-backdrop-filter:blur(12px);
}

.header{
    width:100%;
    margin-bottom:28px;
    padding-bottom:24px;
    display:flex;
    flex-direction:row;
    align-items:center;
    justify-content:flex-start;
    gap:20px;
    border-bottom:1px solid #e2e8f0;
}

.logo{
    flex:0 0 76px;
    width:76px;
    height:76px;
    padding:7px;
    display:block;
    object-fit:contain;
    border-radius:18px;
    background:#ffffff;
    box-shadow:0 10px 24px rgba(15,23,42,.12);
}

.header-content{
    flex:1 1 auto;
    min-width:0;
}

.header h1{
    margin:0 0 5px;
    overflow-wrap:anywhere;
    color:#0f172a;
    font-size:clamp(25px,3vw,30px);
    line-height:1.15;
    font-weight:800;
}

.header p{
    margin:0;
    max-width:700px;
    color:#64748b;
    font-size:clamp(12px,1.6vw,14px);
    line-height:1.55;
}

.exam-card{
    margin-bottom:22px;
    padding:clamp(19px,2.5vw,25px);
    border:1px solid #bbf7d0;
    border-radius:18px;
    background:linear-gradient(135deg,#f0fdf4,#ffffff);
}

.exam-card h2{
    margin-bottom:5px;
    overflow-wrap:anywhere;
    color:#14532d;
    font-size:clamp(20px,2.5vw,25px);
    font-weight:800;
}

.course{
    margin-bottom:20px;
    overflow-wrap:anywhere;
    color:#16a34a;
    font-size:14px;
    font-weight:700;
}

.exam-grid{
    display:grid;
    grid-template-columns:repeat(4,minmax(0,1fr));
    gap:14px;
}

.exam-grid > div{
    min-width:0;
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
    overflow-wrap:anywhere;
    color:#0f172a;
    font-size:14px;
    font-weight:800;
}

.status{
    color:#15803d !important;
    text-transform:capitalize;
}

.student-card{
    margin-bottom:22px;
    padding:19px 22px;
    border-left:5px solid #16a34a;
    border-radius:14px;
    background:#f8fafc;
}

.student-card h3{
    margin-bottom:5px;
    overflow-wrap:anywhere;
    color:#334155;
    font-size:16px;
}

.student-card h3 span{
    color:#15803d;
}

.student-card p{
    overflow-wrap:anywhere;
    color:#64748b;
    font-size:13px;
}

.waiting-card{
    margin-bottom:22px;
    padding:clamp(28px,4vw,35px) 22px;
    border:1px dashed #86efac;
    border-radius:18px;
    background:#f0fdf4;
    text-align:center;
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
    font-size:clamp(19px,2.2vw,21px);
}

.waiting-card p{
    color:#64748b;
    font-size:13px;
}

.joined-card{
    padding:23px;
    border:1px solid #e2e8f0;
    border-radius:18px;
    background:#ffffff;
}

.joined-header{
    margin-bottom:18px;
    display:flex;
    align-items:center;
    justify-content:space-between;
    gap:12px;
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
    align-items:center;
    justify-content:center;
    border-radius:999px;
    background:#dcfce7;
    color:#15803d;
    font-size:13px;
    font-weight:800;
}

.student-list{
    max-height:300px;
    padding-right:4px;
    display:grid;
    grid-template-columns:repeat(3,minmax(0,1fr));
    gap:12px;
    overflow-y:auto;
    overscroll-behavior:contain;
}

.student-item{
    min-width:0;
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
    align-items:center;
    justify-content:center;
    border-radius:50%;
    background:#dcfce7;
    color:#15803d;
    font-size:15px;
    font-weight:800;
    text-transform:uppercase;
}

.student-item > div:last-child{
    min-width:0;
}

.student-item strong{
    display:block;
    overflow:hidden;
    color:#334155;
    font-size:13px;
    text-overflow:ellipsis;
    white-space:nowrap;
}

.countdown-overlay{
    position:fixed;
    inset:0;
    z-index:99999;
    padding:max(20px,env(safe-area-inset-top)) 20px max(20px,env(safe-area-inset-bottom));
    display:flex;
    align-items:center;
    justify-content:center;
    background:rgba(2,44,34,.88);
    backdrop-filter:blur(12px);
    -webkit-backdrop-filter:blur(12px);
}

.countdown-box{
    width:min(100%,500px);
    max-height:calc(100dvh - 40px);
    padding:clamp(30px,5vw,42px);
    overflow-y:auto;
    border:1px solid rgba(255,255,255,.25);
    border-radius:28px;
    color:#ffffff;
    background:linear-gradient(145deg,rgba(22,163,74,.94),rgba(5,78,59,.97));
    text-align:center;
    box-shadow:0 30px 70px rgba(0,0,0,.42);
    animation:countdownEnter .35s ease;
}

.countdown-box h2{
    margin-bottom:8px;
    font-size:clamp(28px,5vw,34px);
    font-weight:800;
    letter-spacing:2px;
}

.countdown-box > p{
    color:#dcfce7;
    font-size:14px;
}

.count{
    width:clamp(120px,26vw,145px);
    height:clamp(120px,26vw,145px);
    margin:28px auto;
    display:flex;
    align-items:center;
    justify-content:center;
    border:5px solid rgba(255,255,255,.78);
    border-radius:50%;
    font-size:clamp(58px,12vw,72px);
    font-weight:800;
    box-shadow:0 0 0 12px rgba(255,255,255,.08),0 18px 40px rgba(0,0,0,.2);
    animation:pulse 1s infinite;
}

.countdown-box ul{
    margin-top:20px;
    padding:18px 20px;
    border-radius:14px;
    background:rgba(255,255,255,.11);
    text-align:left;
    list-style-position:inside;
}

.countdown-box li{
    margin:9px 0;
    color:#f0fdf4;
    font-size:13px;
}

@keyframes spin{
    to{transform:rotate(360deg);}
}

@keyframes pulse{
    0%,100%{transform:scale(1);}
    50%{transform:scale(1.05);}
}

@keyframes countdownEnter{
    from{opacity:0;transform:scale(.9);}
    to{opacity:1;transform:scale(1);}
}

@media(max-width:900px){
    .lobby-card{
        width:min(100%,820px);
    }

    .exam-grid{
        grid-template-columns:repeat(2,minmax(0,1fr));
    }

    .student-list{
        grid-template-columns:repeat(2,minmax(0,1fr));
    }
}

@media(max-width:600px){
    .lobby-page{
        padding:0;
        align-items:stretch;
    }

    .lobby-card{
        width:100%;
        min-height:100dvh;
        margin:0;
        padding:max(20px,env(safe-area-inset-top)) 16px max(28px,env(safe-area-inset-bottom));
        border:none;
        border-radius:0;
        box-shadow:none;
    }

    .header{
        width:100%;
        margin-bottom:24px;
        padding-bottom:20px;
        display:flex !important;
        flex-direction:row !important;
        align-items:center !important;
        justify-content:flex-start !important;
        gap:14px !important;
    }

    .logo{
        flex:0 0 60px !important;
        width:60px !important;
        min-width:60px !important;
        max-width:60px !important;
        height:60px !important;
        min-height:60px !important;
        max-height:60px !important;
        padding:6px;
        align-self:center !important;
    }

    .header-content{
        flex:1 1 0% !important;
        min-width:0 !important;
        width:auto !important;
    }

    .header h1{
        margin:0 0 5px;
        font-size:clamp(22px,6.2vw,27px);
        line-height:1.15;
        white-space:normal;
    }

    .header p{
        margin:0;
        font-size:clamp(10px,3vw,12px);
        line-height:1.5;
    }

    .exam-card{
        padding:19px;
    }

    .exam-grid{
        grid-template-columns:repeat(2,minmax(0,1fr));
        gap:10px;
    }

    .student-list{
        grid-template-columns:1fr;
    }

    .countdown-box{
        border-radius:22px;
    }
}

@media(max-width:390px){
    .lobby-card{
        padding-left:14px;
        padding-right:14px;
    }

    .header{
        flex-direction:row !important;
        align-items:flex-start !important;
        gap:11px !important;
    }

    .logo{
        flex:0 0 54px !important;
        width:54px !important;
        min-width:54px !important;
        max-width:54px !important;
        height:54px !important;
        min-height:54px !important;
        max-height:54px !important;
    }

    .header h1{
        font-size:21px;
    }

    .header p{
        font-size:10px;
    }

    .exam-grid{
        grid-template-columns:1fr;
    }

    .joined-header{
        align-items:flex-start;
    }
}

@media(prefers-reduced-motion:reduce){
    *,
    *::before,
    *::after{
        animation-duration:.01ms !important;
        animation-iteration-count:1 !important;
        transition-duration:.01ms !important;
    }
}
</style>