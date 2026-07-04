<template>
  <div class="lobby-page">

    <div class="top-bar">
      <button class="back-btn" @click="goBack">
        ← Back to Dashboard
      </button>
    </div>

    <div class="page-header">
      <div>
        <h1>Exam Lobby</h1>
        <p>Wait for students to join before starting the examination.</p>
      </div>
    </div>

    <div v-if="loading" class="loading">
      Loading lobby...
    </div>

    <div v-else class="content">

      <!-- LEFT PANEL -->
      <div class="students-panel">
        <div class="panel-header">
          <h2>Students in Lobby</h2>

          <span class="student-counter">
            👥 {{ students.length }} Students
          </span>
        </div>

        <div v-if="students.length === 0" class="empty-students">
          No students joined yet.
        </div>

        <div v-else class="students-grid">
          <div
            class="student-card"
            v-for="student in students"
            :key="student.id"
          >
            <div class="student-left">
              <div class="avatar">
                {{ student.initials }}
              </div>

              <div>
                <h4>{{ student.name }}</h4>
              </div>
            </div>

            <div class="ready">
              <span class="dot"></span>
              Ready
            </div>
          </div>
        </div>
      </div>

      <!-- RIGHT PANEL -->
      <div class="right-panel">

        <div class="access-card">
          <h3>Exam Access Code</h3>
          <p>Share this code with students</p>

          <div class="access-code">
            {{ accessCode }}
          </div>

          <button class="copy-btn" @click="copyCode">
            📋 Copy Code
          </button>
        </div>

        <div class="exam-details">
          <div class="detail-box">
            <small>Exam Title</small>
            <strong>{{ exam.title }}</strong>
          </div>

          <div class="detail-box">
            <small>Course</small>
            <strong>{{ exam.course }}</strong>
          </div>

          <div class="detail-box">
            <small>Duration</small>
            <strong>{{ exam.duration }} Minutes</strong>
          </div>

          <div class="detail-box">
            <small>Total Questions</small>
            <strong>{{ exam.items }}</strong>
          </div>

          <div class="detail-box">
            <small>Passing Score</small>
            <strong>{{ exam.passing }}%</strong>
          </div>

          <div class="detail-box">
            <small>Status</small>
            <strong>{{ exam.status }}</strong>
          </div>
        </div>

        <button class="start-btn" @click="startExamNow">
          ▶ Start Exam Now
        </button>

        <div class="footer-note">
          {{ students.length }} students ready to begin
        </div>
      </div>
    </div>

    <!-- START POPUP -->
    <div v-if="showStartPopup" class="popup-overlay">
      <div class="popup-card">
        <div class="popup-icon">▶</div>

        <h2>Start Examination?</h2>

        <p>
          Students will immediately begin the examination.
          <br><br>
          Once started, the examination timer will begin.
        </p>

        <div class="popup-buttons">
          <button class="cancel-btn" @click="cancelStartExam">
            Cancel
          </button>

          <button
            class="confirm-btn"
            :disabled="startingExam"
            @click="confirmStartExam"
          >
            {{ startingExam ? 'Starting...' : 'Start Exam' }}
          </button>
        </div>
      </div>
    </div>

  </div>
</template>



<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import api from '../services/api'

const router = useRouter()
const route = useRoute()

const loading = ref(false)
const startingExam = ref(false)
const showStartPopup = ref(false)

const exam = ref({
  id: 0,
  title: '',
  course: '',
  duration: 0,
  items: 0,
  passing: 0,
  status: ''
})

const accessCode = ref('')

const students = ref<any[]>([])

async function fetchLobby() {
  loading.value = true

  try {
    const examId = route.params.id

    const response = await api.get(`/exams/${examId}`)

    const data = response.data.data
    const questions = data.questions || []

    exam.value = {
      id: data.id,
      title: data.title,
      course: data.course || 'No Course',
      duration: data.duration,
      items: questions.length,
      passing: data.passing || 75,
      status: data.status
    }

    accessCode.value = data.access_code

    const lobbyResponse = await api.get(`/exams/${examId}/lobby`)

    students.value = lobbyResponse.data.data.map((session:any) => {
      const name = session.student_name || 'Unknown Student'

      return {
        id: session.id,
        name,
        initials: name
          .split(' ')
          .map((word:string) => word[0])
          .join('')
          .substring(0, 2)
          .toUpperCase()
      }
    })

  } catch (error) {
    console.error(error)
    alert('Failed to load lobby.')
  } finally {
    loading.value = false
  }
}

let lobbyInterval:any = null

function goBack() {
  router.push('/faculty/dashboard')
}

async function copyCode() {
  try {
    await navigator.clipboard.writeText(accessCode.value)
    alert('Access Code Copied.')
  } catch {
    alert('Unable to copy code.')
  }
}

function startExamNow() {
  showStartPopup.value = true
}

async function confirmStartExam() {
  startingExam.value = true

  try {
    showStartPopup.value = false

    await api.post(`/exams/${exam.value.id}/start`)

router.push(`/faculty/monitoring/${exam.value.id}`)
  } catch (error) {
    console.error(error)
    alert('Failed to start exam.')
  } finally {
    startingExam.value = false
  }
}

function cancelStartExam() {
  showStartPopup.value = false
}

onMounted(() => {
  fetchLobby()

  lobbyInterval = setInterval(() => {
    fetchLobby()
  }, 8000)
})

onUnmounted(() => {
  if (lobbyInterval) {
    clearInterval(lobbyInterval)
  }
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

.lobby-page{

    min-height:100vh;

    background:#eefbf4;

    padding:30px;

    font-family:'Poppins',sans-serif;

}



.top-bar{

    margin-bottom:20px;

}

.back-btn{

    border:none;

    background:white;

    padding:10px 18px;

    border-radius:10px;

    cursor:pointer;

    font-weight:600;

    transition:.25s;

    box-shadow:0 2px 8px rgba(0,0,0,.08);

}

.back-btn:hover{

    background:#f5f5f5;

}

.page-header{

    margin-bottom:25px;

}

.page-header h1{

    color:#112244;

    font-size:40px;

    margin-bottom:6px;

}

.page-header p{

    color:#666;

}

/* ==========================================
   CONTENT
========================================== */

.content{

    display:grid;

    grid-template-columns:2fr 1fr;

    gap:25px;

}

/* ==========================================
   LEFT PANEL
========================================== */

.students-panel{

    background:white;

    border-radius:18px;

    padding:25px;

    box-shadow:0 10px 30px rgba(0,0,0,.05);

}

.panel-header{

    display:flex;

    justify-content:space-between;

    align-items:center;

    margin-bottom:20px;

}

.panel-header h2{

    color:#112244;

}

.student-counter{

    background:#e7f8ec;

    color:#16a34a;

    padding:8px 16px;

    border-radius:30px;

    font-weight:600;

}

.students-grid{

    display:grid;

    grid-template-columns:repeat(2,1fr);

    gap:15px;

}

.student-card{

    display:flex;

    justify-content:space-between;

    align-items:center;

    padding:16px;

    border:1px solid #e5e7eb;

    border-radius:12px;

    transition:.25s;

}

.student-card:hover{

    transform:translateY(-2px);

    box-shadow:0 8px 20px rgba(0,0,0,.05);

}

.student-left{

    display:flex;

    align-items:center;

    gap:12px;

}

.avatar{

    width:42px;

    height:42px;

    border-radius:50%;

    background:#dcfce7;

    color:#15803d;

    display:flex;

    justify-content:center;

    align-items:center;

    font-weight:700;

}

.ready{

    display:flex;

    align-items:center;

    gap:8px;

    color:#16a34a;

    font-size:14px;

    font-weight:600;

}

.dot{

    width:8px;

    height:8px;

    background:#16a34a;

    border-radius:50%;

}

/* ==========================================
   RIGHT PANEL
========================================== */

.right-panel{

    display:flex;

    flex-direction:column;

    gap:20px;

}

/* ==========================================
   ACCESS CARD
========================================== */

.access-card{

    background:#10c24b;

    color:white;

    border-radius:18px;

    padding:22px;

    text-align:center;

}

.access-card h3{

    margin-bottom:8px;

}

.access-card p{

    font-size:13px;

    opacity:.9;

    margin-bottom:18px;

}

.access-code{

    background:white;

    color:#112244;

    padding:18px;

    border-radius:12px;

    font-size:36px;

    font-weight:700;

    letter-spacing:3px;

    margin-bottom:15px;

}

.copy-btn{

    width:100%;

    border:none;

    background:white;

    color:#16a34a;

    padding:12px;

    border-radius:10px;

    cursor:pointer;

    font-weight:600;

    transition:.25s;

}

.copy-btn:hover{

    background:#f3f4f6;

}

/* ==========================================
   EXAM DETAILS
========================================== */

.exam-details{

    display:flex;

    flex-direction:column;

    gap:15px;

}

.detail-box{

    background:white;

    padding:18px;

    border-radius:14px;

    box-shadow:0 8px 25px rgba(0,0,0,.05);

}

.detail-box small{

    display:block;

    color:#777;

    margin-bottom:8px;

}

.detail-box strong{

    color:#112244;

}

/* ==========================================
   START BUTTON
========================================== */

.start-btn{

    border:none;

    background:#16a34a;

    color:white;

    padding:18px;

    border-radius:12px;

    cursor:pointer;

    font-size:17px;

    font-weight:700;

    transition:.25s;

}

.start-btn:hover{

    background:#15803d;

}

.footer-note{

    text-align:center;

    color:#666;

    font-size:14px;

}

/* ==========================================
   RESPONSIVE
========================================== */

@media(max-width:1000px){

.content{

    grid-template-columns:1fr;

}

.students-grid{

    grid-template-columns:1fr;

}

}

@media(max-width:600px){

.lobby-page{

    padding:18px;

}

.page-header h1{

    font-size:30px;

}

.panel-header{

    flex-direction:column;

    align-items:flex-start;

    gap:15px;

}

.student-card{

    flex-direction:column;

    align-items:flex-start;

    gap:12px;

}

}

/* ==========================================
   START POPUP
========================================== */

.popup-overlay{

    position:fixed;

    inset:0;

    background:rgba(0,0,0,.55);

    backdrop-filter:blur(5px);

    display:flex;

    justify-content:center;

    align-items:center;

    z-index:9999;

}

.popup-card{

    width:430px;

    max-width:95%;

    background:white;

    border-radius:20px;

    padding:35px;

    text-align:center;

    box-shadow:0 20px 50px rgba(0,0,0,.20);

    animation:popup .25s ease;

}

.popup-icon{

    width:80px;

    height:80px;

    margin:auto;

    margin-bottom:20px;

    border-radius:50%;

    background:#16a34a;

    color:white;

    display:flex;

    justify-content:center;

    align-items:center;

    font-size:34px;

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

.confirm-btn{

    flex:1;

    border:none;

    background:#16a34a;

    color:white;

    padding:14px;

    border-radius:10px;

    cursor:pointer;

    font-weight:600;

}

.confirm-btn:hover{

    background:#15803d;

}

.loading{
    background:white;
    border-radius:18px;
    padding:40px;
    text-align:center;
    color:#666;
    font-weight:600;
    box-shadow:0 10px 30px rgba(0,0,0,.05);
}

.empty-students{
    padding:50px;
    text-align:center;
    color:#777;
    background:#f8fafc;
    border-radius:14px;
}

</style>

