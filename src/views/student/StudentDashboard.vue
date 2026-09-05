<template>
  <div class="student-page">
    <div class="student-card">
      <!-- ==========================================
           STEP 1: INTRODUCTION
      =========================================== -->
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
            then select your name from the class list to join the
            waiting lobby.
          </p>
          <div class="feature-list">
            <div class="feature-item">
              <span>✓</span>
              <div>
                <strong>
                  Secure Intranet Assessment
                </strong>
                <p>
                  Works through your local school network.
                </p>
              </div>
            </div>
            <div class="feature-item">
              <span>✓</span>
              <div>
                <strong>
                  Live Examination Monitoring
                </strong>
                <p>
                  Exam activity is monitored after the test begins.
                </p>
              </div>
            </div>
            <div class="feature-item">
              <span>✓</span>
              <div>
                <strong>
                  Automatic Answer Saving
                </strong>
                <p>
                  Your answers will be saved while taking the exam.
                </p>
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
      <!-- ==========================================
           STEP 2: JOIN FORM
      =========================================== -->
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
            Enter the access code first, then select your
            name from the assigned class.
          </p>
        </div>
        <form @submit.prevent="joinExam">
          <!-- ACCESS CODE -->
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
              @input="handleAccessCodeInput"
            >
            <small>
              Codes are not case-sensitive.
            </small>
          </div>
          <!-- CHECK CODE -->
          <button
            v-if="!examLoaded"
            class="check-code-btn"
            type="button"
            :disabled="
              checkingCode ||
              !accessCode.trim()
            "
            @click="loadExamStudents"
          >
            <span
              v-if="checkingCode"
              class="spinner"
            ></span>
            {{
              checkingCode
                ? 'Checking Exam...'
                : 'Check Exam Code'
            }}
          </button>
          <!-- ==========================================
               EXAM INFORMATION
          =========================================== -->
          <div
            v-if="examLoaded"
            class="exam-info-box"
          >
            <div>
              <span>Examination</span>
              <strong>
                {{ examInfo?.title }}
              </strong>
            </div>
            <div>
              <span>Subject</span>
              <strong>
                {{ examInfo?.subject || 'Not specified' }}
              </strong>
            </div>
            <div>
              <span>Class</span>
              <strong>
                {{ classLabel }}
              </strong>
            </div>
          </div>
          <!-- ==========================================
               STUDENT NAME
          =========================================== -->
          <div
            v-if="examLoaded"
            class="form-group student-name-group"
          >
            <label for="student-name">
              Full Name
            </label>
            <input
              id="student-name"
              v-model="studentName"
              type="text"
              autocomplete="off"
              placeholder="Start typing your name..."
              @input="handleStudentInput"
              @focus="showSuggestions = true"
            >
            <!-- AUTOCOMPLETE -->
            <div
              v-if="
                showSuggestions &&
                filteredStudents.length > 0
              "
              class="student-suggestions"
            >
              <button
                v-for="student in filteredStudents"
                :key="student.id"
                type="button"
                class="student-suggestion"
                :class="{
                  'student-already-taken': student.already_taken,
                  'student-in-lobby': student.in_lobby
                }"
                :disabled="student.already_taken || student.in_lobby"
                @click="selectStudent(student)"
              >
                <span class="student-avatar">
                  {{ getInitials(student.student_name) }}
                </span>
                <span class="student-suggestion-info">
                  <strong>
                    {{ student.student_name }}
                  </strong>
                  <small
                    v-if="student.already_taken"
                    class="already-taken-label"
                  >
                    ✓ Already Taken
                  </small>
                  <small
                    v-else-if="student.in_lobby"
                    class="in-lobby-label"
                  >
                    ✓ In Lobby
                  </small>
                  <small v-else>
                    Available
                  </small>
                </span>
              </button>
            </div>
            <!-- NO MATCH -->
            <div
              v-if="
                studentName.trim() &&
                filteredStudents.length === 0 &&
                !selectedStudent
              "
              class="no-student-message"
            >
              No matching student found in this class.
            </div>
            <!-- SELECTED -->
            <div
              v-if="selectedStudent"
              class="selected-student"
            >
              ✓
              {{ selectedStudent.student_name }}
              selected
            </div>
            <small>
              Select your name from the class list.
            </small>
          </div>
          <!-- ERROR -->
          <div
            v-if="errorMessage"
            class="error-message"
          >
            {{ errorMessage }}
          </div>
          <!-- JOIN -->
          <button
            v-if="examLoaded"
            class="join-btn"
            type="submit"
            :disabled="
              joining ||
              !selectedStudent
            "
          >
            <span
              v-if="joining"
              class="spinner"
            ></span>
            {{
              joining
                ? 'Joining Lobby...'
                : 'Join Examination'
            }}
          </button>
          <!-- CHANGE EXAM -->
          <button
            v-if="examLoaded"
            class="change-exam-btn"
            type="button"
            :disabled="joining"
            @click="resetExam"
          >
            Use Different Exam Code
          </button>
        </form>
        <div class="help-box">
          <strong>
            Unable to join?
          </strong>
          <p>
            Confirm that the exam is published, the access
            code is correct, and your name has been added
            to the assigned class by your professor.
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
import {
  computed,
  ref
} from 'vue'
import {
  useRouter
} from 'vue-router'
import api from '../../services/api'
// ==========================================
// TYPES
// ==========================================
interface Student {
  id: number
  student_name: string
  already_taken: boolean
  in_lobby: boolean
}
interface ExamInfo {
  id: number
  title: string
  subject: string | null
}
interface ClassInfo {
  id: number
  grade: string
  section: string
}
// ==========================================
// ROUTER
// ==========================================
const router =
  useRouter()
// ==========================================
// PAGE STATE
// ==========================================
const currentStep =
  ref(1)
const accessCode =
  ref('')
const studentName =
  ref('')
// ==========================================
// EXAM STATE
// ==========================================
const examLoaded =
  ref(false)
const checkingCode =
  ref(false)
const examInfo =
  ref<ExamInfo | null>(null)
const classInfo =
  ref<ClassInfo | null>(null)
const students =
  ref<Student[]>([])
// ==========================================
// STUDENT SELECTION
// ==========================================
const selectedStudent =
  ref<Student | null>(null)
const showSuggestions =
  ref(false)
// ==========================================
// JOIN STATE
// ==========================================
const joining =
  ref(false)
const errorMessage =
  ref('')
// ==========================================
// CLASS LABEL
// ==========================================
const classLabel =
  computed(() => {
    if (!classInfo.value) {
      return ''
    }
    return (
      `${classInfo.value.grade} - ` +
      `${classInfo.value.section}`
    )
  })
// ==========================================
// FILTER STUDENTS
// ==========================================
const filteredStudents =
  computed(() => {
    const search =
      studentName.value
        .trim()
        .toLowerCase()
    if (!search) {
      return students.value
        .slice(0, 8)
    }
    return students.value
      .filter(
        student =>
          student.student_name
            .toLowerCase()
            .includes(search)
      )
      .slice(0, 8)
  })
// ==========================================
// GO TO FORM
// ==========================================
function goToForm() {
  currentStep.value =
    2
  errorMessage.value =
    ''
}
// ==========================================
// ACCESS CODE FORMAT
// ==========================================
function formatAccessCode() {
  accessCode.value =
    accessCode.value
      .replace(
        /\s+/g,
        ''
      )
      .toUpperCase()
}
// ==========================================
// ACCESS CODE INPUT
// ==========================================
function handleAccessCodeInput() {
  formatAccessCode()
  /*
   * If student changes the access code after
   * loading an exam, reset the previous exam.
   */
  if (examLoaded.value) {
    examLoaded.value =
      false
    examInfo.value =
      null
    classInfo.value =
      null
    students.value =
      []
    studentName.value =
      ''
    selectedStudent.value =
      null
    showSuggestions.value =
      false
  }
}
// ==========================================
// LOAD EXAM + STUDENTS
// ==========================================
async function loadExamStudents() {
  errorMessage.value =
    ''
  if (!accessCode.value.trim()) {
    errorMessage.value =
      'Please enter the examination access code.'
    return
  }
  checkingCode.value =
    true
  try {
    const response =
      await api.post(
        '/exam-students',
        {
          access_code:
            accessCode.value
              .trim()
              .toUpperCase()
        }
      )
    examInfo.value =
      response.data.exam
    classInfo.value =
      response.data.class
    students.value =
      Array.isArray(
        response.data.students
      )
        ? response.data.students
        : []
    examLoaded.value =
      true
    studentName.value =
      ''
    selectedStudent.value =
      null
    showSuggestions.value =
      false
  } catch (error: unknown) {
    console.error(
      'CHECK EXAM ERROR:',
      error
    )
    const apiError =
      error as {
        response?: {
          data?: {
            message?: string
            errors?: Record<
              string,
              string[]
            >
          }
        }
      }
    const validationErrors =
      apiError.response
        ?.data
        ?.errors
    if (validationErrors) {
      const firstError =
        Object.values(
          validationErrors
        )[0]?.[0]
      errorMessage.value =
        firstError ||
        'Please check the examination code.'
    } else {
      errorMessage.value =
        apiError.response
          ?.data
          ?.message
        ||
        'Unable to find this examination.'
    }
    examLoaded.value =
      false
  } finally {
    checkingCode.value =
      false
  }
}
// ==========================================
// STUDENT INPUT
// ==========================================
function handleStudentInput() {
  showSuggestions.value =
    true
  /*
   * If the student edits the text after selecting
   * a name, invalidate the previous selection.
   */
  if (
    selectedStudent.value &&
    studentName.value !==
      selectedStudent.value.student_name
  ) {
    selectedStudent.value =
      null
  }
}
// ==========================================
// SELECT STUDENT
// ==========================================
function selectStudent(
  student: Student
) {
  if (
    student.already_taken ||
    student.in_lobby
  ) {
    errorMessage.value =
      student.already_taken
        ? 'This student has already taken this examination.'
        : 'This student is already in the examination lobby.'
    return
  }
  selectedStudent.value =
    student
  studentName.value =
    student.student_name
  showSuggestions.value =
    false
  errorMessage.value =
    ''
}
// ==========================================
// INITIALS
// ==========================================
function getInitials(
  name: string
) {
  const words =
    name
      .trim()
      .split(/\s+/)
      .filter(Boolean)
  if (words.length === 0) {
    return '?'
  }
  if (words.length === 1) {
    return words[0]!
      .charAt(0)
      .toUpperCase()
  }
  return (
    words[0]!
      .charAt(0)
    +
    words[
      words.length - 1
    ]!
      .charAt(0)
  ).toUpperCase()
}
// ==========================================
// VALIDATE
// ==========================================
function validateForm():
  boolean {
  errorMessage.value =
    ''
  if (
    !accessCode.value.trim()
  ) {
    errorMessage.value =
      'Please enter the examination access code.'
    return false
  }
  if (
    !examLoaded.value
  ) {
    errorMessage.value =
      'Please check the examination code first.'
    return false
  }
  if (
    !selectedStudent.value
  ) {
    errorMessage.value =
      'Please select your name from the class list.'
    return false
  }
  if (
    selectedStudent.value.already_taken
  ) {
    errorMessage.value =
      'This student has already taken this examination.'
    selectedStudent.value =
      null
    return false
  }
  if (
    selectedStudent.value.in_lobby
  ) {
    errorMessage.value =
      'This student is already in the examination lobby.'
    selectedStudent.value =
      null
    return false
  }
  return true
}
// ==========================================
// JOIN EXAM
// ==========================================
async function joinExam() {
  if (!validateForm()) {
    return
  }
  joining.value =
    true
  errorMessage.value =
    ''
  try {
    const response =
      await api.post(
        '/join-exam',
        {
          access_code:
            accessCode.value
              .trim()
              .toUpperCase(),
          student_name:
            selectedStudent.value!
              .student_name
        }
      )
    /*
    |--------------------------------------------------------------------------
    | SAVE SESSION
    |--------------------------------------------------------------------------
    */
    localStorage.setItem(
      'student_session',
      JSON.stringify(
        response.data.session
      )
    )
    /*
    |--------------------------------------------------------------------------
    | SAVE EXAM
    |--------------------------------------------------------------------------
    */
    localStorage.setItem(
      'student_exam',
      JSON.stringify(
        response.data.exam
      )
    )
    /*
    |--------------------------------------------------------------------------
    | SAVE STUDENT
    |--------------------------------------------------------------------------
    */
    localStorage.setItem(
      'student_name',
      response.data.student?.name
      ||
      selectedStudent.value!
        .student_name
    )
    /*
    |--------------------------------------------------------------------------
    | SAVE CLASS
    |--------------------------------------------------------------------------
    */
    localStorage.setItem(
      'student_section',
      response.data.student
        ? (
            `${response.data.student.grade} - ` +
            `${response.data.student.section}`
          )
        : classLabel.value
    )
    localStorage.setItem(
      'student_class_id',
      String(
        response.data.student
          ?.class_id
        ||
        classInfo.value?.id
        ||
        ''
      )
    )
    /*
    |--------------------------------------------------------------------------
    | SAVE ACCESS CODE
    |--------------------------------------------------------------------------
    */
    localStorage.setItem(
      'student_access_code',
      accessCode.value
        .trim()
        .toUpperCase()
    )
    /*
    |--------------------------------------------------------------------------
    | GO TO LOBBY
    |--------------------------------------------------------------------------
    */
    router.push(
      '/student/lobby'
    )
  } catch (error: unknown) {
    console.error(
      'JOIN EXAM ERROR:',
      error
    )
    const apiError =
      error as {
        response?: {
          data?: {
            message?: string
            errors?: Record<
              string,
              string[]
            >
          }
        }
      }
    const validationErrors =
      apiError.response
        ?.data
        ?.errors
    if (validationErrors) {
      const firstError =
        Object.values(
          validationErrors
        )[0]?.[0]
      errorMessage.value =
        firstError ||
        'Please check the information you entered.'
    } else {
      errorMessage.value =
        apiError.response
          ?.data
          ?.message
        ||
        'Unable to join the examination.'
    }
  } finally {
    joining.value =
      false
  }
}
// ==========================================
// RESET EXAM
// ==========================================
function resetExam() {
  accessCode.value =
    ''
  studentName.value =
    ''
  selectedStudent.value =
    null
  examInfo.value =
    null
  classInfo.value =
    null
  students.value =
    []
  examLoaded.value =
    false
  showSuggestions.value =
    false
  errorMessage.value =
    ''
}
// ==========================================
// HOME
// ==========================================
function goHome() {
  router.push('/')
}
</script>
<style scoped>
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
.form-group input,
.form-group select {
    width: 100%;
    min-height: 46px;
    padding: 0 14px;
    border: 1px solid #cbd5e1;
    border-radius: 10px;
    outline: none;
    background: #f8fafc;
    color: #0f172a;
    font-size: 16px;
    transition:
        border-color .22s ease,
        background .22s ease,
        box-shadow .22s ease;
}
.form-group input:focus,
.form-group select:focus {
    border-color: #16a34a;
    background: #ffffff;
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
/* ==========================================
   CHECK EXAM BUTTON
========================================== */
.check-code-btn {
    width:100%;
    min-height:46px;
    margin-bottom:14px;
    padding:10px 16px;
    border:none;
    border-radius:10px;
    display:flex;
    align-items:center;
    justify-content:center;
    gap:9px;
    background:#0f766e;
    color:#ffffff;
    font-size:12px;
    font-weight:800;
    cursor:pointer;
    transition:
        background .22s ease,
        transform .22s ease;
}
.check-code-btn:hover:not(:disabled) {
    background:#115e59;
    transform:translateY(-1px);
}
.check-code-btn:disabled {
    opacity:.6;
    cursor:not-allowed;
}
/* ==========================================
   EXAM INFORMATION
========================================== */
.exam-info-box {
    margin-bottom:16px;
    padding:14px;
    display:grid;
    gap:10px;
    border:1px solid #bbf7d0;
    border-radius:12px;
    background:#f0fdf4;
}
.exam-info-box > div {
    display:flex;
    justify-content:space-between;
    align-items:flex-start;
    gap:15px;
}
.exam-info-box span {
    color:#64748b;
    font-size:9px;
    font-weight:600;
}
.exam-info-box strong {
    color:#166534;
    font-size:10px;
    font-weight:800;
    text-align:right;
}
/* ==========================================
   STUDENT AUTOCOMPLETE
========================================== */
.student-name-group {
    position:relative;
}
.student-suggestions {
    position:absolute;
    top:73px;
    left:0;
    right:0;
    z-index:50;
    max-height:230px;
    overflow-y:auto;
    border:1px solid #d1d5db;
    border-radius:10px;
    background:#ffffff;
    box-shadow:
        0 12px 30px
        rgba(0,0,0,.14);
}
.student-suggestion {
    width:100%;
    padding:10px 12px;
    border:none;
    border-bottom:1px solid #f1f5f9;
    display:flex;
    align-items:center;
    gap:10px;
    background:#ffffff;
    text-align:left;
    cursor:pointer;
}
.student-suggestion:last-child {
    border-bottom:none;
}
.student-suggestion:hover {
    background:#f0fdf4;
}
.student-avatar {
    flex:0 0 34px;
    width:34px;
    height:34px;
    display:flex;
    align-items:center;
    justify-content:center;
    border-radius:50%;
    background:#dcfce7;
    color:#15803d;
    font-size:10px;
    font-weight:800;
}
.student-suggestion-info {
    min-width:0;
}
.student-suggestion-info strong {
    display:block;
    overflow:hidden;
    text-overflow:ellipsis;
    white-space:nowrap;
    color:#1e293b;
    font-size:11px;
}
.student-suggestion-info small {
    margin-top:2px;
    color:#94a3b8;
    font-size:8px;
}
/* ==========================================
   SELECTED STUDENT
========================================== */
.selected-student {
    margin-top:7px;
    padding:8px 10px;
    border-radius:8px;
    background:#dcfce7;
    color:#166534;
    font-size:9px;
    font-weight:700;
}
/* ==========================================
   NO STUDENT
========================================== */
.no-student-message {
    margin-top:7px;
    padding:8px 10px;
    border-radius:8px;
    background:#fef2f2;
    color:#b91c1c;
    font-size:9px;
    font-weight:600;
}
/* ==========================================
   CHANGE EXAM
========================================== */
.change-exam-btn {
    width:100%;
    margin-top:9px;
    padding:9px;
    border:none;
    background:transparent;
    color:#64748b;
    font-size:9px;
    font-weight:700;
    cursor:pointer;
}
.change-exam-btn:hover {
    color:#15803d;
}
/* ==========================================
   ALREADY TAKEN STUDENT
========================================== */
.student-suggestion.student-already-taken {
    background:#f8fafc;
    cursor:not-allowed;
    opacity:.72;
}
.student-suggestion.student-already-taken:hover {
    background:#f8fafc;
}
.student-already-taken .student-avatar {
    background:#e2e8f0;
    color:#64748b;
}
.already-taken-label {
    display:block;
    margin-top:3px;
    color:#16a34a !important;
    font-size:8px;
    font-weight:800;
}
/* ==========================================
   STUDENT CURRENTLY IN LOBBY
========================================== */
.student-suggestion.student-in-lobby {
    background:#fff7ed;
    cursor:not-allowed;
    opacity:.78;
}
.student-suggestion.student-in-lobby:hover {
    background:#fff7ed;
}
.student-in-lobby .student-avatar {
    background:#ffedd5;
    color:#c2410c;
}
.in-lobby-label {
    display:block;
    margin-top:3px;
    color:#c2410c !important;
    font-size:8px;
    font-weight:800;
}
.student-suggestion:disabled {
    cursor:not-allowed;
}
</style>
