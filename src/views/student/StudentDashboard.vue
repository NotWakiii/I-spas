<template>
  <div class="student-page">
    <div class="student-card">

      
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


/* ==========================================
   GLOBAL
========================================== */

*{

    margin:0;

    padding:0;

    box-sizing:border-box;

    font-family:'Poppins',sans-serif;

}

button,
input{

    font-family:inherit;

}

button{

    -webkit-tap-highlight-color:transparent;

}


/* ==========================================
   PAGE
========================================== */

.student-page{

    width:100%;

    min-height:100vh;

    min-height:100dvh;

    padding:24px;

    display:flex;

    align-items:center;

    justify-content:center;

    overflow-x:hidden;

    overflow-y:auto;

    background:#064e3b;

}


/* ==========================================
   MAIN CARD
========================================== */

.student-card{

    width:min(92vw,570px);

    max-width:570px;

    max-height:calc(100dvh - 40px);

    margin:auto;

    overflow:hidden;

    border-radius:26px;

    background:#ffffff;

    box-shadow:

        0 24px 60px

        rgba(0,0,0,.28);

}


/* ==========================================
   INTRO PANEL
========================================== */

.intro-panel{

    width:100%;

    min-height:620px;

    max-height:calc(100dvh - 40px);

    padding:38px 40px;

    display:flex;

    align-items:center;

    overflow-y:auto;

    color:#ffffff;

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

    max-width:500px;

    margin:0 auto;

}


/* ==========================================
   INTRO LOGO
========================================== */

.logo{

    width:82px;

    height:82px;

    margin-bottom:20px;

    padding:8px;

    object-fit:contain;

    border-radius:20px;

    background:#ffffff;

    box-shadow:

        0 12px 26px

        rgba(0,0,0,.18);

}


/* ==========================================
   INTRO TEXT
========================================== */

.eyebrow{

    margin-bottom:10px;

    color:#bbf7d0;

    font-size:11px;

    font-weight:800;

    letter-spacing:1.6px;

}

.intro-panel h1{

    margin-bottom:14px;

    color:#ffffff;

    font-size:34px;

    line-height:1.12;

    font-weight:800;

}

.description{

    color:#dcfce7;

    font-size:13px;

    line-height:1.7;

}


/* ==========================================
   FEATURES
========================================== */

.feature-list{

    margin-top:22px;

    display:grid;

    grid-template-columns:

        repeat(

            2,

            minmax(0,1fr)

        );

    gap:10px;

}

.feature-item{

    min-width:0;

    padding:11px;

    display:flex;

    align-items:flex-start;

    gap:10px;

    border:

        1px solid

        rgba(255,255,255,.20);

    border-radius:12px;

    background:rgba(255,255,255,.10);

    backdrop-filter:blur(8px);

    -webkit-backdrop-filter:blur(8px);

}

.feature-item > span{

    flex:0 0 30px;

    width:30px;

    height:30px;

    display:flex;

    align-items:center;

    justify-content:center;

    border-radius:50%;

    background:#dcfce7;

    color:#15803d;

    font-size:13px;

    font-weight:800;

}

.feature-item > div{

    min-width:0;

}

.feature-item strong{

    display:block;

    margin-bottom:2px;

    color:#ffffff;

    font-size:11px;

    font-weight:800;

}

.feature-item p{

    color:#dcfce7;

    font-size:9px;

    line-height:1.45;

}


/* ==========================================
   CONTINUE BUTTON
========================================== */

.continue-btn{

    width:100%;

    min-height:48px;

    margin-top:20px;

    padding:10px 16px;

    border:none;

    border-radius:11px;

    display:flex;

    align-items:center;

    justify-content:center;

    gap:9px;

    background:#ffffff;

    color:#166534;

    font-size:14px;

    font-weight:800;

    cursor:pointer;

    transition:

        transform .22s ease,

        box-shadow .22s ease;

}

.continue-btn:hover{

    transform:translateY(-2px);

    box-shadow:

        0 14px 28px

        rgba(0,0,0,.20);

}

.continue-btn span{

    font-size:18px;

}


/* ==========================================
   INTRO HOME BUTTON
========================================== */

.intro-home-btn{

    margin-top:12px;

    border:none;

    background:transparent;

    color:#dcfce7 !important;

    font-size:9px;

    font-weight:700;

    cursor:pointer;

}


/* ==========================================
   FORM PANEL
========================================== */

.form-panel{

    width:100%;

    min-height:620px;

    max-height:calc(100dvh - 40px);

    padding:34px 36px;

    display:flex;

    flex-direction:column;

    justify-content:center;

    overflow-y:auto;

    background:#ffffff;

}


/* ==========================================
   FORM TOP
========================================== */

.form-top{

    margin-bottom:18px;

    display:flex;

    align-items:center;

    justify-content:flex-end;

}


/* Hide the unwanted top-left Back button */

.back-step-btn{

    display:none;

}

.small-logo{

    width:48px;

    height:48px;

    padding:5px;

    object-fit:contain;

    border:

        1px solid

        #dcfce7;

    border-radius:13px;

    background:#f0fdf4;

}


/* ==========================================
   FORM HEADER
========================================== */

.form-header{

    margin-bottom:20px;

}

.step-label{

    display:inline-block;

    margin-bottom:10px;

    padding:6px 11px;

    border-radius:999px;

    background:#dcfce7;

    color:#15803d;

    font-size:9px;

    font-weight:800;

    letter-spacing:1.2px;

}

.form-header h2{

    margin-bottom:6px;

    color:#0f172a;

    font-size:26px;

    line-height:1.2;

    font-weight:800;

}

.form-header p{

    color:#64748b;

    font-size:11px;

    line-height:1.6;

}


/* ==========================================
   FORM GROUP
========================================== */

.form-group{

    margin-bottom:14px;

}

.form-group label{

    display:block;

    margin-bottom:6px;

    color:#334155;

    font-size:12px;

    font-weight:700;

}

.form-group input{

    width:100%;

    min-height:46px;

    padding:0 14px;

    border:

        1px solid

        #cbd5e1;

    border-radius:10px;

    outline:none;

    background:#f8fafc;

    color:#0f172a;

    font-size:16px;

    transition:

        border-color .22s ease,

        background .22s ease,

        box-shadow .22s ease;

    -webkit-appearance:none;

    appearance:none;

}

.form-group input:focus{

    border-color:#16a34a;

    background:#ffffff;

    box-shadow:

        0 0 0 4px

        rgba(22,163,74,.12);

}

.form-group small{

    display:block;

    margin-top:5px;

    color:#94a3b8;

    font-size:9px;

}


/* ==========================================
   ERROR MESSAGE
========================================== */

.error-message{

    margin-bottom:14px;

    padding:10px 12px;

    border:

        1px solid

        #fecaca;

    border-radius:9px;

    background:#fef2f2;

    color:#b91c1c;

    font-size:10px;

    font-weight:600;

}


/* ==========================================
   JOIN BUTTON
========================================== */

.join-btn{

    width:100%;

    min-height:48px;

    padding:10px 16px;

    border:none;

    border-radius:10px;

    display:flex;

    align-items:center;

    justify-content:center;

    gap:9px;

    background:#16a34a;

    color:#ffffff;

    font-size:13px;

    font-weight:800;

    cursor:pointer;

    box-shadow:

        0 10px 22px

        rgba(22,163,74,.20);

    transition:

        background .22s ease,

        transform .22s ease;

}

.join-btn:hover:not(:disabled){

    background:#15803d;

    transform:translateY(-2px);

}

.join-btn:disabled{

    opacity:.68;

    cursor:not-allowed;

}


/* ==========================================
   SPINNER
========================================== */

.spinner{

    width:18px;

    height:18px;

    border:

        2px solid

        rgba(255,255,255,.35);

    border-top-color:#ffffff;

    border-radius:50%;

    animation:spin .7s linear infinite;

}


/* ==========================================
   HELP BOX
========================================== */

.help-box{

    margin-top:14px;

    padding:11px 12px;

    border-radius:10px;

    background:#f0fdf4;

    color:#166534;

}

.help-box strong{

    display:block;

    margin-bottom:3px;

    font-size:10px;

}

.help-box p{

    font-size:8px;

    line-height:1.55;

}


/* ==========================================
   BOTTOM HOME BUTTON
========================================== */

.home-btn{

    margin-top:14px;

    border:none;

    background:transparent;

    color:#64748b;

    font-size:9px;

    font-weight:700;

    cursor:pointer;

}

.home-btn:hover{

    color:#15803d;

}


/* ==========================================
   ANIMATION
========================================== */

@keyframes spin{

    to{

        transform:rotate(360deg);

    }

}


/* ==========================================
   SHORT LAPTOP SCREENS
========================================== */

@media(

    min-width:761px

) and (

    max-height:750px

){

    .student-page{

        padding:18px;

    }

    .student-card{

        width:min(90vw,550px);

        max-height:calc(100dvh - 28px);

    }

    .intro-panel{

        min-height:560px;

        max-height:calc(100dvh - 28px);

        padding:28px 34px;

    }

    .form-panel{

        min-height:560px;

        max-height:calc(100dvh - 28px);

        padding:26px 32px;

    }

    .logo{

        width:72px;

        height:72px;

        margin-bottom:16px;

    }

    .intro-panel h1{

        font-size:30px;

    }

    .feature-list{

        margin-top:17px;

        gap:8px;

    }

    .feature-item{

        padding:9px;

    }

    .continue-btn{

        min-height:44px;

        margin-top:16px;

    }

    .form-header{

        margin-bottom:15px;

    }

    .form-group{

        margin-bottom:11px;

    }

    .form-group input{

        min-height:43px;

    }

}


/* ==========================================
   TABLET
========================================== */

@media(max-width:760px){

    .student-page{

        padding:16px;

        align-items:flex-start;

    }

    .student-card{

        width:min(100%,600px);

        max-width:600px;

        max-height:none;

    }

    .intro-panel,
    .form-panel{

        min-height:calc(100dvh - 32px);

        max-height:none;

    }

    .feature-list{

        grid-template-columns:1fr;

    }

}


/* ==========================================
   MOBILE
========================================== */

@media(max-width:520px){

    .student-page{

        padding:0;

        align-items:stretch;

        background:#ffffff;

    }

    .student-card{

        width:100%;

        max-width:none;

        min-height:100dvh;

        border-radius:0;

        box-shadow:none;

    }

    .intro-panel{

        min-height:100dvh;

        max-height:none;

        padding:

            max(

                28px,

                env(safe-area-inset-top)

            )

            22px

            max(

                28px,

                env(safe-area-inset-bottom)

            );

    }

    .form-panel{

        min-height:100dvh;

        max-height:none;

        padding:

            max(

                24px,

                env(safe-area-inset-top)

            )

            22px

            max(

                28px,

                env(safe-area-inset-bottom)

            );

        justify-content:flex-start;

    }

    .logo{

        width:82px;

        height:82px;

    }

    .intro-panel h1{

        font-size:32px;

    }

    .feature-list{

        grid-template-columns:1fr;

    }

    .form-top{

        margin-bottom:16px;

    }

}


/* ==========================================
   VERY SMALL MOBILE
========================================== */

@media(max-width:360px){

    .intro-panel,
    .form-panel{

        padding-left:18px;

        padding-right:18px;

    }

    .intro-panel h1{

        font-size:29px;

    }

    .feature-item{

        padding:10px;

    }

}


/* ==========================================
   REDUCED MOTION
========================================== */

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