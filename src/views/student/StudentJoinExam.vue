<template>
  <div class="page">
    <header class="topbar">
      <button class="back-btn" type="button" @click="goBack">←</button>
      <div>
        <strong>I-SPAS</strong>
        <span>Student Portal</span>
      </div>
    </header>

    <main class="content">
      <div class="access-card">
        <div class="header">
          <span class="eyebrow">STUDENT ACCESS</span>
          <h1>Enter Exam Code</h1>
          <p>Enter the access code provided by your faculty.</p>
        </div>

        <form v-if="!examLoaded" @submit.prevent="checkExamCode">
          <div class="form-group">
            <label for="access-code">Exam Access Code</label>
            <input
              id="access-code"
              v-model="accessCode"
              type="text"
              maxlength="12"
              autocomplete="off"
              placeholder="Example: ABC123"
              @input="formatAccessCode"
            >
            <small>Codes are not case-sensitive.</small>
          </div>

          <div v-if="errorMessage" class="error-message">
            {{ errorMessage }}
          </div>

          <button
            type="submit"
            class="primary-btn"
            :disabled="checkingCode || !accessCode.trim()"
          >
            <span v-if="checkingCode" class="spinner"></span>
            {{ checkingCode ? 'Checking Exam...' : 'Check Exam Code' }}
          </button>
        </form>

        <div v-else class="verified-section">
          <div class="success-icon">✓</div>
          <span class="verified-label">EXAM CODE VERIFIED</span>

          <div class="exam-info">
            <div>
              <span>Examination</span>
              <strong>{{ examInfo?.title }}</strong>
            </div>
            <div>
              <span>Subject</span>
              <strong>{{ examInfo?.subject || 'Not specified' }}</strong>
            </div>
            <div>
              <span>Class</span>
              <strong>{{ classLabel }}</strong>
            </div>
          </div>

          <div v-if="verifiedStudent" class="student-info">
            <div class="avatar">
              {{ getInitials(verifiedStudent.name) }}
            </div>

            <div class="student-details">
              <span>LOGGED-IN STUDENT</span>

              <strong>
                {{ verifiedStudent.name }}
              </strong>

              <small>
                LRN: {{ verifiedStudent.lrn }}
              </small>
            </div>
          </div>

          <div v-if="verifiedStudent && classInfo" class="student-class-info">
            <div>
              <span>Grade</span>
              <strong>{{ verifiedStudent.grade }}</strong>
            </div>

            <div>
              <span>Strand</span>
              <strong>{{ verifiedStudent.strand || 'N/A' }}</strong>
            </div>

            <div>
              <span>Section</span>
              <strong>{{ verifiedStudent.section }}</strong>
            </div>

            <div>
              <span>Class</span>
              <strong>{{ classInfo.subject }}</strong>
            </div>
          </div>

          <div v-if="errorMessage" class="error-message">
            {{ errorMessage }}
          </div>

          <button
            type="button"
            class="primary-btn"
            :disabled="joining"
            @click="joinExam"
          >
            <span v-if="joining" class="spinner"></span>
            {{ joining ? 'Joining Lobby...' : 'Join Examination' }}
          </button>

          <button
            type="button"
            class="secondary-btn"
            :disabled="joining"
            @click="resetExam"
          >
            Use Different Exam Code
          </button>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '../../services/api'

const verifiedStudent = ref<StudentInfo | null>(null)

interface StudentInfo {
  id: number
  name: string
  lrn: string
  grade: string
  strand: string | null
  section: string
  class_id: number
}

interface ExamInfo {
  id: number
  title: string
  subject: string | null
  status: string
  duration: number
  questions_count: number
}

interface ClassInfo {
  id: number
  grade: string
  strand: string | null
  section: string
  subject: string | null
  school_year: string | null
  semester: string
}

const route = useRoute()
const router = useRouter()

const accessCode = ref('')
const examLoaded = ref(false)
const checkingCode = ref(false)
const joining = ref(false)
const errorMessage = ref('')
const examInfo = ref<ExamInfo | null>(null)
const classInfo = ref<ClassInfo | null>(null)

const storedStudent = localStorage.getItem('student_user')
const student = ref<StudentInfo | null>(
  storedStudent ? JSON.parse(storedStudent) : null
)

const classLabel = computed(() => {
  if (!classInfo.value) return ''
  return `${classInfo.value.grade} - ${classInfo.value.section}`
})

function formatAccessCode() {
  accessCode.value = accessCode.value.replace(/\s+/g, '').toUpperCase()

  if (examLoaded.value) {
    resetExamData()
  }
}

async function checkExamCode() {
  errorMessage.value = ''

  if (!accessCode.value.trim()) {
    errorMessage.value = 'Please enter the examination access code.'
    return
  }

  checkingCode.value = true

  try {
    const response = await api.post('/student/exam-students', {
      access_code: accessCode.value.trim().toUpperCase()
    })

    const returnedClass = response.data.class

    if (
      route.params.id &&
      returnedClass?.id &&
      Number(returnedClass.id) !== Number(route.params.id)
    ) {
      errorMessage.value = 'This examination does not belong to this class.'
      return
    }

    examInfo.value = response.data.exam
    classInfo.value = response.data.class
    verifiedStudent.value = response.data.student
    examLoaded.value = true
  } catch (error: any) {
    console.error('CHECK EXAM ERROR:', error)

    errorMessage.value =
      error.response?.data?.message ||
      'Unable to find this examination.'

    resetExamData()
  } finally {
    checkingCode.value = false
  }
}

async function joinExam() {
  errorMessage.value = ''

  if (!examLoaded.value || !examInfo.value) {
    errorMessage.value = 'Please check the examination code first.'
    return
  }

  if (!student.value) {
    errorMessage.value = 'Student login information was not found.'
    return
  }

  joining.value = true

  try {
    const response = await api.post('/student/join-exam', {
      access_code: accessCode.value.trim().toUpperCase()
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
      response.data.student?.name || student.value.name
    )

    localStorage.setItem(
      'student_section',
      response.data.student
        ? `${response.data.student.grade} - ${response.data.student.section}`
        : classLabel.value
    )

    localStorage.setItem(
      'student_class_id',
      String(
        response.data.student?.class_id ||
        classInfo.value?.id ||
        route.params.id ||
        ''
      )
    )

    localStorage.setItem(
      'student_access_code',
      accessCode.value.trim().toUpperCase()
    )

    await router.push('/student/lobby')
  } catch (error: any) {
    console.error('JOIN EXAM ERROR:', error)

    const validationErrors = error.response?.data?.errors as Record<string, string[]> | undefined

    if (validationErrors) {
      const firstError = Object.values(validationErrors)[0]?.[0]
      errorMessage.value = firstError || 'Unable to join the examination.'
    } else {
      errorMessage.value = error.response?.data?.message || 'Unable to join the examination.'
    }
  } finally {
    joining.value = false
  }
}

function resetExamData() {
  examLoaded.value = false
  examInfo.value = null
  classInfo.value = null
}

function resetExam() {
  accessCode.value = ''
  errorMessage.value = ''
  resetExamData()
}

function goBack() {
  router.push(`/student/classes/${route.params.id}`)
}

function getInitials(name: string) {
  const words = name.trim().split(/\s+/).filter(Boolean)

  if (!words.length) return '?'
  if (words.length === 1) return words[0]!.charAt(0).toUpperCase()

  return (
    words[0]!.charAt(0) +
    words[words.length - 1]!.charAt(0)
  ).toUpperCase()
}
</script>

<style scoped>
* {
  box-sizing: border-box;
}

.page {
  min-height: 100vh;
  background: #f6f8f7;
  font-family: 'Poppins', sans-serif;
}

.topbar {
  min-height: 72px;
  padding: 0 6%;
  display: flex;
  align-items: center;
  gap: 14px;
  background: #064e3b;
  color: #fff;
}

.topbar > div {
  display: flex;
  flex-direction: column;
}

.topbar strong {
  font-size: 14px;
  font-weight: 800;
}

.topbar span {
  color: #bbf7d0;
  font-size: 9px;
}

.back-btn {
  width: 36px;
  height: 36px;
  border: 1px solid rgba(255,255,255,.25);
  border-radius: 9px;
  background: rgba(255,255,255,.08);
  color: #fff;
  font-size: 18px;
  cursor: pointer;
}

.content {
  width: min(500px, 90%);
  margin: 0 auto;
  padding: 60px 0;
}

.access-card {
  padding: 32px;
  border: 1px solid #e2e8f0;
  border-radius: 18px;
  background: #fff;
  box-shadow: 0 12px 35px rgba(15,23,42,.06);
}

.header {
  margin-bottom: 26px;
  text-align: center;
}

.eyebrow,
.verified-label {
  color: #16a34a;
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 1.2px;
}

.header h1 {
  margin: 6px 0;
  color: #0f172a;
  font-size: 27px;
  font-weight: 800;
}

.header p {
  margin: 0;
  color: #64748b;
  font-size: 10px;
}

.form-group label {
  display: block;
  margin-bottom: 7px;
  color: #334155;
  font-size: 10px;
  font-weight: 700;
}

.form-group input {
  width: 100%;
  height: 52px;
  padding: 0 16px;
  border: 1px solid #dbe3eb;
  border-radius: 10px;
  outline: none;
  color: #0f172a;
  font-family: inherit;
  font-size: 16px;
  font-weight: 800;
  letter-spacing: 3px;
  text-align: center;
  text-transform: uppercase;
}

.form-group input:focus {
  border-color: #22c55e;
  box-shadow: 0 0 0 3px rgba(34,197,94,.1);
}

.form-group small {
  display: block;
  margin-top: 7px;
  color: #94a3b8;
  font-size: 9px;
}

.primary-btn,
.secondary-btn {
  width: 100%;
  min-height: 46px;
  border-radius: 9px;
  font-family: inherit;
  font-size: 10px;
  font-weight: 800;
  cursor: pointer;
}

.primary-btn {
  margin-top: 18px;
  border: none;
  background: #16a34a;
  color: #fff;
}

.primary-btn:hover:not(:disabled) {
  background: #15803d;
}

.primary-btn:disabled,
.secondary-btn:disabled {
  opacity: .55;
  cursor: not-allowed;
}

.secondary-btn {
  margin-top: 9px;
  border: 1px solid #dbe3eb;
  background: #fff;
  color: #475569;
}

.error-message {
  margin-top: 13px;
  padding: 11px 12px;
  border-radius: 8px;
  background: #fef2f2;
  color: #dc2626;
  font-size: 9px;
  font-weight: 600;
}

.verified-section {
  text-align: center;
}

.success-icon {
  width: 55px;
  height: 55px;
  margin: 0 auto 10px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #dcfce7;
  color: #16a34a;
  font-size: 25px;
  font-weight: 800;
}

.exam-info {
  margin-top: 20px;
  border: 1px solid #e2e8f0;
  border-radius: 11px;
  overflow: hidden;
  text-align: left;
}

.exam-info div {
  padding: 12px 14px;
}

.exam-info div:not(:last-child) {
  border-bottom: 1px solid #e2e8f0;
}

.exam-info span {
  display: block;
  color: #94a3b8;
  font-size: 8px;
  font-weight: 700;
}

.exam-info strong {
  display: block;
  margin-top: 3px;
  color: #334155;
  font-size: 11px;
}

.student-info {
  margin-top: 14px;
  padding: 14px;
  border-radius: 11px;
  display: flex;
  align-items: center;
  gap: 12px;
  background: #f0fdf4;
  text-align: left;
}

.avatar {
  flex: 0 0 43px;
  width: 43px;
  height: 43px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #16a34a;
  color: #fff;
  font-size: 12px;
  font-weight: 800;
}

.student-info > div:last-child {
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.student-info span {
  color: #16a34a;
  font-size: 8px;
  font-weight: 800;
}

.student-info strong {
  margin-top: 2px;
  color: #166534;
  font-size: 11px;
}

.student-info small {
  color: #64748b;
  font-size: 8px;
}

.spinner {
  width: 13px;
  height: 13px;
  margin-right: 7px;
  border: 2px solid rgba(255,255,255,.45);
  border-top-color: #fff;
  border-radius: 50%;
  display: inline-block;
  vertical-align: middle;
  animation: spin .7s linear infinite;
}
.student-class-info {
  margin-top: 12px;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  overflow: hidden;
  text-align: left;
}

.student-class-info div {
  padding: 12px 14px;
  border-bottom: 1px solid #e2e8f0;
}

.student-class-info div:nth-child(odd) {
  border-right: 1px solid #e2e8f0;
}

.student-class-info span {
  display: block;
  color: #94a3b8;
  font-size: 8px;
  font-weight: 700;
}

.student-class-info strong {
  display: block;
  margin-top: 3px;
  color: #334155;
  font-size: 10px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 500px) {
  .content {
    width: calc(100% - 28px);
    padding: 30px 0;
  }

  .access-card {
    padding: 23px 18px;
  }
}
</style>
