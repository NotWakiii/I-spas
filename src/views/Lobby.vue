<template>
  <div class="lobby-page">

    <!-- TOP BAR -->
    <div class="top-bar">
      <button class="back-btn" @click="goBack">
        ← Back to Dashboard
      </button>
    </div>

    <!-- PAGE HEADER -->
    <div class="page-header">
      <div>
        <h1>Exam Lobby</h1>
        <p>
          Wait for students to join before starting the examination.
        </p>
      </div>
    </div>

    <!-- LOADING -->
    <div v-if="loading" class="loading">
      Loading lobby...
    </div>

    <!-- CONTENT -->
    <div v-else class="content">

      <!-- LEFT PANEL -->
      <div class="students-panel">

        <div class="panel-header">

          <h2>
            Students in Lobby
          </h2>

          <span class="student-counter">
            👥 {{ students.length }} Students
          </span>

        </div>

        <!-- NO STUDENTS -->
        <div
          v-if="students.length === 0"
          class="empty-students"
        >
          No students joined yet.
        </div>

        <!-- STUDENTS -->
        <div
          v-else
          class="students-grid"
        >

          <div
            v-for="student in students"
            :key="student.id"
            class="student-card"
          >

            <div class="student-left">

              <div class="avatar">
                {{ student.initials }}
              </div>

              <div>
                <h4>
                  {{ student.name }}
                </h4>
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

        <!-- ACCESS CODE -->
        <div class="access-card">

          <h3>
            Exam Access Code
          </h3>

          <p>
            Share this code with students
          </p>

          <div class="access-code">
            {{ accessCode }}
          </div>

          <button
            class="copy-btn"
            @click="copyCode"
          >
            📋 Copy Code
          </button>

        </div>


        <!-- EXAM DETAILS -->
        <div class="exam-details">

          <div class="detail-box">
            <small>Exam Title</small>
            <strong>
              {{ exam.title }}
            </strong>
          </div>

          <div class="detail-box">
            <small>Subject</small>
            <strong>
              {{ exam.subject }}
            </strong>
          </div>

          <div class="detail-box">

            <small>
              Class
            </small>

            <strong>
              {{
                exam.grade && exam.section
                  ? `${exam.grade} - ${exam.section}`
                  : 'No Class'
              }}
            </strong>

          </div>

          <div class="detail-box">
            <small>
              Duration
            </small>

            <strong>
              {{ exam.duration }} Minutes
            </strong>
          </div>

          <div class="detail-box">
            <small>
              Total Questions
            </small>

            <strong>
              {{ exam.items }}
            </strong>
          </div>

          <div class="detail-box">
            <small>
              Passing Score
            </small>

            <strong>
              {{ exam.passing }}%
            </strong>
          </div>

          <div class="detail-box">
            <small>
              Status
            </small>

            <strong>
              {{ exam.status }}
            </strong>
          </div>

        </div>


        <!-- LOBBY ACTIONS -->
        <div class="lobby-actions">

          <!-- CANCEL LOBBY -->
          <button
            class="cancel-lobby-btn"
            :disabled="
              cancellingLobby ||
              startingExam
            "
            @click="openCancelLobbyPopup"
          >
            {{
              cancellingLobby
                ? 'Cancelling...'
                : 'Cancel Lobby'
            }}
          </button>


          <!-- START EXAM -->
          <button
            class="start-btn"
            :disabled="
              startingExam ||
              cancellingLobby
            "
            @click="openStartPopup"
          >
            {{
              startingExam
                ? 'Starting...'
                : 'Start Exam'
            }}
          </button>

        </div>


        <div class="footer-note">
          {{ students.length }} students ready to begin
        </div>

      </div>

    </div>


    <!-- ==========================================
         START EXAM POPUP
    =========================================== -->
    <div
      v-if="showStartPopup"
      class="popup-overlay"
    >

      <div class="popup-card">

        <div class="popup-icon">
          ▶
        </div>

        <h2>
          Start Examination?
        </h2>

        <p>
          Students will immediately begin the examination.
          <br><br>
          Once started, the examination timer will begin.
        </p>

        <div class="popup-buttons">

          <button
            class="cancel-btn"
            :disabled="startingExam"
            @click="closeStartPopup"
          >
            Cancel
          </button>

          <button
            class="confirm-start-btn"
            :disabled="startingExam"
            @click="confirmStartExam"
          >
            {{
              startingExam
                ? 'Starting...'
                : 'Start Exam'
            }}
          </button>

        </div>

      </div>

    </div>


    <!-- ==========================================
         CANCEL LOBBY POPUP
    =========================================== -->
    <div
      v-if="showCancelLobbyPopup"
      class="popup-overlay"
    >

      <div class="popup-card">

        <div class="popup-icon cancel-icon">
          ×
        </div>

        <h2>
          Cancel Examination Lobby?
        </h2>

        <p>
          All students currently waiting in the lobby
          will be removed.
          <br><br>
          The examination itself will not be deleted
          and may be opened again later.
        </p>

        <div class="popup-buttons">

          <button
            class="cancel-btn"
            :disabled="cancellingLobby"
            @click="closeCancelLobbyPopup"
          >
            Go Back
          </button>

          <button
            class="confirm-cancel-btn"
            :disabled="cancellingLobby"
            @click="confirmCancelLobby"
          >
            {{
              cancellingLobby
                ? 'Cancelling...'
                : 'Yes, Cancel Lobby'
            }}
          </button>

        </div>

      </div>

    </div>

  </div>
</template>


<script setup lang="ts">

import {
  ref,
  onMounted,
  onUnmounted
} from 'vue'

import {
  useRouter,
  useRoute
} from 'vue-router'

import api from '../services/api'


/*
|--------------------------------------------------------------------------
| ROUTER
|--------------------------------------------------------------------------
*/

const router = useRouter()
const route = useRoute()


/*
|--------------------------------------------------------------------------
| STATES
|--------------------------------------------------------------------------
*/

const loading = ref(false)

const startingExam = ref(false)

const cancellingLobby = ref(false)

const showStartPopup = ref(false)

const showCancelLobbyPopup = ref(false)


/*
|--------------------------------------------------------------------------
| EXAM
|--------------------------------------------------------------------------
*/

const exam = ref({

  id: 0,

  title: '',

  subject: '',

  grade: '',

  section: '',

  duration: 0,

  items: 0,

  passing: 0,

  status: ''

})


const accessCode = ref('')

const students = ref<any[]>([])


/*
|--------------------------------------------------------------------------
| FETCH LOBBY
|--------------------------------------------------------------------------
*/

async function fetchLobby() {

  /*
   * Do not display the main loading screen
   * every time the 8-second refresh runs.
   */

  if (!exam.value.id) {
    loading.value = true
  }

  try {

    const examId =
      route.params.id


    /*
    |--------------------------------------------------------------------------
    | GET EXAM
    |--------------------------------------------------------------------------
    */

    const response =
      await api.get(
        `/exams/${examId}`
      )


    const data =
      response.data.data


    const questions =
      data.questions || []


    exam.value = {

      id:
        data.id,

      title:
        data.title,

      subject:
        data.subject ||
        'No Subject',

      grade:
        data.grade || '',

      section:
        data.section || '',

      duration:
        data.duration,

      items:
        questions.length,

      passing:
        data.passing || 75,

      status:
        data.status

    }


    accessCode.value =
      data.access_code


    /*
    |--------------------------------------------------------------------------
    | GET STUDENTS IN LOBBY
    |--------------------------------------------------------------------------
    */

    const lobbyResponse =
      await api.get(
        `/exams/${examId}/lobby`
      )


    const lobbyData =
      lobbyResponse.data.data || []


    students.value =
      lobbyData.map(
        (session: any) => {

          const name =
            session.student_name ||
            'Unknown Student'


          return {

            id:
              session.id,

            name,

            initials:
              name
                .split(' ')
                .filter(Boolean)
                .map(
                  (word: string) =>
                    word[0]
                )
                .join('')
                .substring(0, 2)
                .toUpperCase()

          }

        }
      )


  } catch (error) {

    console.error(
      'FETCH LOBBY ERROR:',
      error
    )

  } finally {

    loading.value = false

  }

}


/*
|--------------------------------------------------------------------------
| BACK TO DASHBOARD
|--------------------------------------------------------------------------
*/

function goBack() {

  router.push(
    '/faculty/dashboard'
  )

}


/*
|--------------------------------------------------------------------------
| COPY ACCESS CODE
|--------------------------------------------------------------------------
*/

async function copyCode() {

  try {

    await navigator.clipboard.writeText(
      accessCode.value
    )

    alert(
      'Access Code Copied.'
    )

  } catch {

    alert(
      'Unable to copy code.'
    )

  }

}


/*
|--------------------------------------------------------------------------
| OPEN START EXAM POPUP
|--------------------------------------------------------------------------
*/

function openStartPopup() {

  if (startingExam.value) {
    return
  }

  showStartPopup.value =
    true

}


/*
|--------------------------------------------------------------------------
| CLOSE START EXAM POPUP
|--------------------------------------------------------------------------
*/

function closeStartPopup() {

  if (startingExam.value) {
    return
  }

  showStartPopup.value =
    false

}


/*
|--------------------------------------------------------------------------
| START EXAM
|--------------------------------------------------------------------------
*/

async function confirmStartExam() {

  if (
    !exam.value.id ||
    startingExam.value
  ) {
    return
  }


  startingExam.value =
    true


  try {

    await api.post(
      `/exams/${exam.value.id}/start`
    )


    showStartPopup.value =
      false


    if (lobbyInterval) {

      clearInterval(
        lobbyInterval
      )

    }


    router.push(
      `/faculty/monitoring/${exam.value.id}`
    )


  } catch (error: unknown) {

    console.error(
      'START EXAM ERROR:',
      error
    )


    const apiError =
      error as {
        response?: {
          data?: {
            message?: string
          }
        }
      }


    alert(
      apiError.response
        ?.data
        ?.message ||
      'Failed to start exam.'
    )


  } finally {

    startingExam.value =
      false

  }

}


/*
|--------------------------------------------------------------------------
| OPEN CANCEL LOBBY POPUP
|--------------------------------------------------------------------------
*/

function openCancelLobbyPopup() {

  if (
    cancellingLobby.value ||
    startingExam.value
  ) {
    return
  }


  showCancelLobbyPopup.value =
    true

}


/*
|--------------------------------------------------------------------------
| CLOSE CANCEL LOBBY POPUP
|--------------------------------------------------------------------------
*/

function closeCancelLobbyPopup() {

  if (cancellingLobby.value) {
    return
  }


  showCancelLobbyPopup.value =
    false

}


/*
|--------------------------------------------------------------------------
| CANCEL LOBBY
|--------------------------------------------------------------------------
*/

async function confirmCancelLobby() {

  if (
    !exam.value.id ||
    cancellingLobby.value
  ) {
    return
  }


  cancellingLobby.value =
    true


  try {

    await api.post(
      `/exams/${exam.value.id}/cancel-lobby`
    )


    showCancelLobbyPopup.value =
      false


    if (lobbyInterval) {

      clearInterval(
        lobbyInterval
      )

    }


    alert(
      'Examination lobby cancelled successfully.'
    )


    router.push(
      '/faculty/dashboard'
    )


  } catch (error: unknown) {

    console.error(
      'CANCEL LOBBY ERROR:',
      error
    )


    const apiError =
      error as {
        response?: {
          data?: {
            message?: string
          }
        }
      }


    alert(
      apiError.response
        ?.data
        ?.message ||
      'Failed to cancel examination lobby.'
    )


  } finally {

    cancellingLobby.value =
      false

  }

}


/*
|--------------------------------------------------------------------------
| AUTO REFRESH
|--------------------------------------------------------------------------
*/

let lobbyInterval: any =
  null


onMounted(() => {

  fetchLobby()


  lobbyInterval =
    setInterval(
      () => {

        if (
          !startingExam.value &&
          !cancellingLobby.value
        ) {

          fetchLobby()

        }

      },
      8000
    )

})


onUnmounted(() => {

  if (lobbyInterval) {

    clearInterval(
      lobbyInterval
    )

  }

})

</script>


<style scoped>

/* ==========================================
   GLOBAL
========================================== */

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.lobby-page {
  min-height: 100vh;
  background: #eefbf4;
  padding: 30px;
  font-family: 'Poppins', sans-serif;
}


/* ==========================================
   TOP BAR
========================================== */

.top-bar {
  margin-bottom: 20px;
}

.back-btn {
  border: none;
  background: white;
  padding: 10px 18px;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 600;
  transition: .25s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, .08);
}

.back-btn:hover {
  background: #f5f5f5;
}


/* ==========================================
   PAGE HEADER
========================================== */

.page-header {
  margin-bottom: 25px;
}

.page-header h1 {
  color: #112244;
  font-size: 40px;
  margin-bottom: 6px;
}

.page-header p {
  color: #666;
}


/* ==========================================
   CONTENT
========================================== */

.content {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 25px;
}


/* ==========================================
   STUDENTS PANEL
========================================== */

.students-panel {
  background: white;
  border-radius: 18px;
  padding: 25px;
  box-shadow:
    0 10px 30px
    rgba(0, 0, 0, .05);
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.panel-header h2 {
  color: #112244;
}

.student-counter {
  background: #e7f8ec;
  color: #16a34a;
  padding: 8px 16px;
  border-radius: 30px;
  font-weight: 600;
}

.students-grid {
  display: grid;
  grid-template-columns:
    repeat(2, 1fr);
  gap: 15px;
}

.student-card {
  display: flex;
  justify-content:
    space-between;
  align-items: center;
  padding: 16px;
  border:
    1px solid #e5e7eb;
  border-radius: 12px;
  transition: .25s;
}

.student-card:hover {
  transform:
    translateY(-2px);

  box-shadow:
    0 8px 20px
    rgba(0, 0, 0, .05);
}

.student-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.avatar {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  background: #dcfce7;
  color: #15803d;

  display: flex;
  justify-content: center;
  align-items: center;

  font-weight: 700;
}

.ready {
  display: flex;
  align-items: center;
  gap: 8px;

  color: #16a34a;
  font-size: 14px;
  font-weight: 600;
}

.dot {
  width: 8px;
  height: 8px;

  background: #16a34a;

  border-radius: 50%;
}


/* ==========================================
   RIGHT PANEL
========================================== */

.right-panel {
  display: flex;
  flex-direction: column;
  gap: 20px;
}


/* ==========================================
   ACCESS CARD
========================================== */

.access-card {
  background: #10c24b;
  color: white;

  border-radius: 18px;
  padding: 22px;

  text-align: center;
}

.access-card h3 {
  margin-bottom: 8px;
}

.access-card p {
  font-size: 13px;
  opacity: .9;
  margin-bottom: 18px;
}

.access-code {
  background: white;
  color: #112244;

  padding: 18px;

  border-radius: 12px;

  font-size: 36px;
  font-weight: 700;
  letter-spacing: 3px;

  margin-bottom: 15px;
}

.copy-btn {
  width: 100%;

  border: none;

  background: white;
  color: #16a34a;

  padding: 12px;

  border-radius: 10px;

  cursor: pointer;
  font-weight: 600;

  transition: .25s;
}

.copy-btn:hover {
  background: #f3f4f6;
}


/* ==========================================
   EXAM DETAILS
========================================== */

.exam-details {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.detail-box {
  background: white;

  padding: 18px;

  border-radius: 14px;

  box-shadow:
    0 8px 25px
    rgba(0, 0, 0, .05);
}

.detail-box small {
  display: block;

  color: #777;

  margin-bottom: 8px;
}

.detail-box strong {
  color: #112244;
}


/* ==========================================
   ACTION BUTTONS
========================================== */

.lobby-actions {
  display: grid;
  grid-template-columns:
    1fr 1fr;

  gap: 12px;
}


/* START EXAM */

.start-btn {
  border: none;

  background: #16a34a;
  color: white;

  padding: 18px;

  border-radius: 12px;

  cursor: pointer;

  font-size: 16px;
  font-weight: 700;

  transition: .25s;
}

.start-btn:hover:not(:disabled) {
  background: #15803d;
}


/* CANCEL LOBBY */

.cancel-lobby-btn {
  border:
    1px solid #dc2626;

  background: white;

  color: #dc2626;

  padding: 18px;

  border-radius: 12px;

  cursor: pointer;

  font-size: 16px;
  font-weight: 700;

  transition: .25s;
}

.cancel-lobby-btn:hover:not(:disabled) {
  background: #fef2f2;
}


/* DISABLED */

.start-btn:disabled,
.cancel-lobby-btn:disabled,
.confirm-start-btn:disabled,
.confirm-cancel-btn:disabled {
  opacity: .6;
  cursor: not-allowed;
}


.footer-note {
  text-align: center;
  color: #666;
  font-size: 14px;
}


/* ==========================================
   POPUP
========================================== */

.popup-overlay {
  position: fixed;

  inset: 0;

  background:
    rgba(0, 0, 0, .55);

  backdrop-filter:
    blur(5px);

  display: flex;

  justify-content: center;
  align-items: center;

  z-index: 9999;
}

.popup-card {
  width: 430px;

  max-width: 95%;

  background: white;

  border-radius: 20px;

  padding: 35px;

  text-align: center;

  box-shadow:
    0 20px 50px
    rgba(0, 0, 0, .20);

  animation:
    popup .25s ease;
}

@keyframes popup {

  from {
    opacity: 0;

    transform:
      scale(.95);
  }

  to {
    opacity: 1;

    transform:
      scale(1);
  }

}


/* ==========================================
   POPUP ICON
========================================== */

.popup-icon {
  width: 80px;
  height: 80px;

  margin: auto;
  margin-bottom: 20px;

  border-radius: 50%;

  background: #16a34a;
  color: white;

  display: flex;

  justify-content: center;
  align-items: center;

  font-size: 34px;
}

.cancel-icon {
  background: #dc2626;
  font-size: 48px;
}


/* ==========================================
   POPUP TEXT
========================================== */

.popup-card h2 {
  color: #112244;
  margin-bottom: 15px;
}

.popup-card p {
  color: #666;
  line-height: 1.7;
}


/* ==========================================
   POPUP BUTTONS
========================================== */

.popup-buttons {
  display: flex;
  gap: 15px;
  margin-top: 30px;
}

.cancel-btn {
  flex: 1;

  border: none;

  background: #e5e7eb;
  color: #111827;

  padding: 14px;

  border-radius: 10px;

  cursor: pointer;

  font-weight: 600;
}

.cancel-btn:hover:not(:disabled) {
  background: #d1d5db;
}


/* CONFIRM START */

.confirm-start-btn {
  flex: 1;

  border: none;

  background: #16a34a;
  color: white;

  padding: 14px;

  border-radius: 10px;

  cursor: pointer;

  font-weight: 600;
}

.confirm-start-btn:hover:not(:disabled) {
  background: #15803d;
}


/* CONFIRM CANCEL */

.confirm-cancel-btn {
  flex: 1;

  border: none;

  background: #dc2626;
  color: white;

  padding: 14px;

  border-radius: 10px;

  cursor: pointer;

  font-weight: 600;
}

.confirm-cancel-btn:hover:not(:disabled) {
  background: #b91c1c;
}


/* ==========================================
   LOADING / EMPTY
========================================== */

.loading {
  background: white;

  border-radius: 18px;

  padding: 40px;

  text-align: center;

  color: #666;

  font-weight: 600;

  box-shadow:
    0 10px 30px
    rgba(0, 0, 0, .05);
}

.empty-students {
  padding: 50px;

  text-align: center;

  color: #777;

  background: #f8fafc;

  border-radius: 14px;
}


/* ==========================================
   RESPONSIVE
========================================== */

@media (max-width: 1000px) {

  .content {
    grid-template-columns:
      1fr;
  }

  .students-grid {
    grid-template-columns:
      1fr;
  }

}


@media (max-width: 600px) {

  .lobby-page {
    padding: 18px;
  }

  .page-header h1 {
    font-size: 30px;
  }

  .panel-header {
    flex-direction:
      column;

    align-items:
      flex-start;

    gap: 15px;
  }

  .student-card {
    flex-direction:
      column;

    align-items:
      flex-start;

    gap: 12px;
  }

  .lobby-actions {
    grid-template-columns:
      1fr;
  }

  .popup-buttons {
    flex-direction:
      column;
  }

}

</style>
