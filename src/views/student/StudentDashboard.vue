<template>
  <div class="student-page">
    <div class="student-card">

      <!-- STEP 1: INTRO -->
      <section
        v-if="currentStep === 1"
        class="intro-panel"
      >
        <div class="intro-content">
          <img
            src="../../assets/logo.png"
            alt="I-SPAS Logo"
            class="logo"
          >

          <p class="eyebrow">
            I-SPAS STUDENT PORTAL
          </p>

          <h1>
            Join Your Examination
          </h1>

          <p class="description">
            Enter the examination code provided by your professor,
            then provide your name and section to join the waiting lobby.
          </p>

          <div class="feature-list">
            <div class="feature-item">
              <span>✓</span>

              <div>
                <strong>Secure Intranet Assessment</strong>
                <p>Works through your local school network.</p>
              </div>
            </div>

            <div class="feature-item">
              <span>✓</span>

              <div>
                <strong>Live Examination Monitoring</strong>
                <p>Exam activity is monitored after the test begins.</p>
              </div>
            </div>

            <div class="feature-item">
              <span>✓</span>

              <div>
                <strong>Automatic Answer Saving</strong>
                <p>Your answers will be saved while taking the exam.</p>
              </div>
            </div>
          </div>

          <button
            class="continue-btn"
            type="button"
            @click="goToForm"
          >
            Continue
            <span>→</span>
          </button>

          <button
            class="home-btn intro-home-btn"
            type="button"
            @click="goHome"
          >
            ← Back to Portal Selection
          </button>
        </div>
      </section>

      <!-- STEP 2: FORM -->
      <section
        v-else
        class="form-panel"
      >
        <div class="form-top">
          <button
            class="back-step-btn"
            type="button"
            @click="currentStep = 1"
          >
            ← Back
          </button>

          <img
            src="../../assets/logo.png"
            alt="I-SPAS Logo"
            class="small-logo"
          >
        </div>

        <div class="form-header">
          <span class="step-label">
            STUDENT ACCESS
          </span>

          <h2>
            Enter Exam Details
          </h2>

          <p>
            Use the access code shared by your professor.
          </p>
        </div>

        <form @submit.prevent="joinExam">
          <div class="form-group">
            <label for="access-code">
              Exam Access Code
            </label>

            <input
              id="access-code"
              v-model="accessCode"
              type="text"
              maxlength="12"
              autocomplete="off"
              placeholder="Example: ABC123"
              @input="formatAccessCode"
            >

            <small>
              Codes are not case-sensitive.
            </small>
          </div>

          <div class="form-group">
            <label for="student-name">
              Full Name
            </label>

            <input
              id="student-name"
              v-model="studentName"
              type="text"
              autocomplete="name"
              placeholder="Enter your full name"
            >
          </div>

          <div class="form-group">
            <label for="section">
              Year and Section
            </label>

            <input
              id="section"
              v-model="section"
              type="text"
              autocomplete="off"
              placeholder="Example: BSIT 3A"
            >
          </div>

          <div
            v-if="errorMessage"
            class="error-message"
          >
            {{ errorMessage }}
          </div>

          <button
            class="join-btn"
            type="submit"
            :disabled="joining"
          >
            <span
              v-if="joining"
              class="spinner"
            ></span>

            {{ joining ? 'Joining Lobby...' : 'Join Examination' }}
          </button>
        </form>

        <div class="help-box">
          <strong>Unable to join?</strong>

          <p>
            Confirm that the exam is published and the access code
            matches the code displayed by your professor.
          </p>
        </div>

        <button
          class="home-btn"
          type="button"
          @click="goHome"
        >
          ← Back to Portal Selection
        </button>
      </section>

    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import api from '../../services/api'

const router = useRouter()

const currentStep = ref(1)

const accessCode = ref('')
const studentName = ref('')
const section = ref('')

const joining = ref(false)
const errorMessage = ref('')

function goToForm() {
  currentStep.value = 2
  errorMessage.value = ''
}

function formatAccessCode() {
  accessCode.value = accessCode.value
    .replace(/\s+/g, '')
    .toUpperCase()
}

function validateForm(): boolean {
  errorMessage.value = ''

  if (!accessCode.value.trim()) {
    errorMessage.value = 'Please enter the examination access code.'
    return false
  }

  if (!studentName.value.trim()) {
    errorMessage.value = 'Please enter your full name.'
    return false
  }

  if (studentName.value.trim().length < 3) {
    errorMessage.value = 'Please enter a valid full name.'
    return false
  }

  if (!section.value.trim()) {
    errorMessage.value = 'Please enter your year and section.'
    return false
  }

  return true
}

async function joinExam() {
  if (!validateForm()) return

  joining.value = true
  errorMessage.value = ''

  try {
    const response = await api.post('/join-exam', {
      access_code: accessCode.value.trim().toUpperCase(),
      student_name: studentName.value.trim(),
      section: section.value.trim(),
    })

    localStorage.setItem(
      'student_session',
      JSON.stringify(response.data.session)
    )

    localStorage.setItem(
      'student_exam',
      JSON.stringify(response.data.exam)
    )

    localStorage.setItem(
      'student_name',
      studentName.value.trim()
    )

    localStorage.setItem(
      'student_section',
      section.value.trim()
    )

    localStorage.setItem(
      'student_access_code',
      accessCode.value.trim().toUpperCase()
    )

    router.push('/student/lobby')
  } catch (error: unknown) {
    console.error(error)

    const apiError = error as {
      response?: {
        data?: {
          message?: string
          errors?: Record<string, string[]>
        }
      }
    }

    const validationErrors = apiError.response?.data?.errors

    if (validationErrors) {
      const firstError = Object.values(validationErrors)[0]?.[0]

      errorMessage.value =
        firstError || 'Please check the information you entered.'
    } else {
      errorMessage.value =
        apiError.response?.data?.message ||
        'Unable to join the examination.'
    }
  } finally {
    joining.value = false
  }
}

function goHome() {
  router.push('/')
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap');

*{
  margin:0;
  padding:0;
  box-sizing:border-box;
  font-family:'Poppins',sans-serif;
}

.student-page{
  min-height:100vh;
  padding:24px;
  display:flex;
  justify-content:center;
  align-items:center;
  background:
    radial-gradient(
      circle at top left,
      rgba(34,197,94,.2),
      transparent 34%
    ),
    linear-gradient(
      135deg,
      #052e24 0%,
      #064e3b 48%,
      #0b6b45 100%
    );
}

.student-card{
  width:min(100%,560px);
  min-height:680px;
  overflow:hidden;
  border-radius:30px;
  background:#ffffff;
  box-shadow:0 30px 70px rgba(0,0,0,.32);
}

/* =========================
   INTRO
========================= */

.intro-panel{
  min-height:680px;
  padding:48px;
  display:flex;
  align-items:center;
  color:white;
  background:
    linear-gradient(
      rgba(3,88,58,.92),
      rgba(3,88,58,.95)
    ),
    url('../../assets/backgroundssj.jpg');
  background-size:cover;
  background-position:center;
}

.intro-content{
  width:100%;
}

.logo{
  width:105px;
  height:105px;
  margin-bottom:30px;
  padding:10px;
  object-fit:contain;
  border-radius:24px;
  background:#ffffff;
  box-shadow:0 15px 30px rgba(0,0,0,.2);
}

.eyebrow{
  margin-bottom:13px;
  color:#bbf7d0;
  font-size:13px;
  font-weight:800;
  letter-spacing:2px;
}

.intro-panel h1{
  margin-bottom:18px;
  font-size:44px;
  line-height:1.16;
  font-weight:800;
}

.description{
  color:#dcfce7;
  font-size:15px;
  line-height:1.8;
}

.feature-list{
  margin-top:30px;
  display:flex;
  flex-direction:column;
  gap:13px;
}

.feature-item{
  padding:14px;
  display:flex;
  gap:12px;
  align-items:flex-start;
  border:1px solid rgba(255,255,255,.2);
  border-radius:14px;
  background:rgba(255,255,255,.1);
  backdrop-filter:blur(8px);
}

.feature-item > span{
  flex:0 0 34px;
  width:34px;
  height:34px;
  display:flex;
  justify-content:center;
  align-items:center;
  border-radius:50%;
  background:#dcfce7;
  color:#15803d;
  font-weight:800;
}

.feature-item strong{
  display:block;
  margin-bottom:3px;
  font-size:13px;
}

.feature-item p{
  color:#dcfce7;
  font-size:11px;
  line-height:1.5;
}

.continue-btn{
  width:100%;
  height:56px;
  margin-top:30px;
  border:none;
  border-radius:13px;
  display:flex;
  justify-content:center;
  align-items:center;
  gap:10px;
  background:#ffffff;
  color:#166534;
  font-size:16px;
  font-weight:800;
  cursor:pointer;
  transition:.22s;
}

.continue-btn:hover{
  transform:translateY(-2px);
  box-shadow:0 14px 28px rgba(0,0,0,.2);
}

.continue-btn span{
  font-size:22px;
}

.intro-home-btn{
  color:#dcfce7 !important;
}

/* =========================
   FORM
========================= */

.form-panel{
  min-height:680px;
  padding:42px;
  display:flex;
  flex-direction:column;
  justify-content:center;
  background:#ffffff;
}

.form-top{
  display:flex;
  justify-content:space-between;
  align-items:center;
  margin-bottom:25px;
}

.back-step-btn{
  border:none;
  background:transparent;
  color:#64748b;
  font-size:13px;
  font-weight:700;
  cursor:pointer;
}

.back-step-btn:hover{
  color:#15803d;
}

.small-logo{
  width:58px;
  height:58px;
  padding:5px;
  object-fit:contain;
  border:1px solid #dcfce7;
  border-radius:15px;
  background:#f0fdf4;
}

.form-header{
  margin-bottom:27px;
}

.step-label{
  display:inline-block;
  margin-bottom:12px;
  padding:7px 13px;
  border-radius:999px;
  background:#dcfce7;
  color:#15803d;
  font-size:11px;
  font-weight:800;
  letter-spacing:1.4px;
}

.form-header h2{
  margin-bottom:8px;
  color:#0f172a;
  font-size:30px;
  font-weight:800;
}

.form-header p{
  color:#64748b;
  font-size:13px;
}

.form-group{
  margin-bottom:18px;
}

.form-group label{
  display:block;
  margin-bottom:8px;
  color:#334155;
  font-size:14px;
  font-weight:700;
}

.form-group input{
  width:100%;
  height:53px;
  padding:0 16px;
  border:1px solid #cbd5e1;
  border-radius:12px;
  outline:none;
  background:#f8fafc;
  color:#0f172a;
  font-size:15px;
  transition:.22s;
}

.form-group input:focus{
  border-color:#16a34a;
  background:#ffffff;
  box-shadow:0 0 0 4px rgba(22,163,74,.12);
}

.form-group small{
  display:block;
  margin-top:7px;
  color:#94a3b8;
  font-size:11px;
}

.error-message{
  margin-bottom:16px;
  padding:12px 14px;
  border:1px solid #fecaca;
  border-radius:10px;
  background:#fef2f2;
  color:#b91c1c;
  font-size:13px;
  font-weight:600;
}

.join-btn{
  width:100%;
  height:55px;
  margin-top:4px;
  border:none;
  border-radius:12px;
  display:flex;
  justify-content:center;
  align-items:center;
  gap:10px;
  background:#16a34a;
  color:white;
  font-size:16px;
  font-weight:800;
  cursor:pointer;
  box-shadow:0 12px 24px rgba(22,163,74,.22);
  transition:.22s;
}

.join-btn:hover:not(:disabled){
  background:#15803d;
  transform:translateY(-2px);
}

.join-btn:disabled{
  opacity:.68;
  cursor:not-allowed;
}

.spinner{
  width:18px;
  height:18px;
  border:2px solid rgba(255,255,255,.35);
  border-top-color:#ffffff;
  border-radius:50%;
  animation:spin .7s linear infinite;
}

.help-box{
  margin-top:20px;
  padding:14px;
  border-radius:12px;
  background:#f0fdf4;
  color:#166534;
}

.help-box strong{
  display:block;
  margin-bottom:4px;
  font-size:12px;
}

.help-box p{
  font-size:10px;
  line-height:1.6;
}

.home-btn{
  margin-top:17px;
  border:none;
  background:transparent;
  color:#64748b;
  font-size:11px;
  font-weight:700;
  cursor:pointer;
}

.home-btn:hover{
  color:#15803d;
}

@keyframes spin{
  to{
    transform:rotate(360deg);
  }
}

/* =========================
   TABLET
========================= */

@media(max-width:700px){
  .student-page{
    align-items:flex-start;
    padding:16px;
  }

  .student-card{
    min-height:auto;
  }

  .intro-panel,
  .form-panel{
    min-height:calc(100vh - 32px);
  }
}

/* =========================
   MOBILE
========================= */

@media(max-width:520px){
  .student-page{
    padding:0;
    background:#ffffff;
  }

  .student-card{
    width:100%;
    min-height:100vh;
    border-radius:0;
    box-shadow:none;
  }

  .intro-panel{
    min-height:100vh;
    padding:34px 24px;
  }

  .logo{
    width:90px;
    height:90px;
    margin-bottom:24px;
  }

  .intro-panel h1{
    font-size:34px;
  }

  .description{
    font-size:13px;
  }

  .feature-list{
    margin-top:24px;
  }

  .continue-btn{
    margin-top:25px;
  }

  .form-panel{
    min-height:100vh;
    padding:28px 24px;
    justify-content:flex-start;
  }

  .form-header h2{
    font-size:26px;
  }
}
</style>
