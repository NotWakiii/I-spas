<template>
  <div class="page">
    <header class="topbar">
      <div class="brand">
        <img src="../../assets/logo.png" alt="I-SPAS">
        <div>
          <strong>I-SPAS</strong>
          <span>Student Portal</span>
        </div>
      </div>

      <div class="student-menu">
        <button class="about-btn" type="button" @click="showAboutDialog = true">
          About Us
        </button>

        <div class="student-info">
          <strong>{{ student?.name || 'Student' }}</strong>
          <span>{{ student?.lrn || '' }}</span>
        </div>

        <button class="logout-btn" @click="showLogoutDialog = true">
          Logout
        </button>
      </div>
    </header>

    <main class="content">
      <div class="page-heading">
        <div>
          <span class="eyebrow">STUDENT DASHBOARD</span>
          <h1>Current Classes</h1>
          <p>Select a class to view its examinations and results.</p>
        </div>

        <button
          type="button"
          class="join-class-btn"
          @click="openJoinDialog"
        >
          + Join Class
        </button>
      </div>
      <div v-if="successMessage" class="dashboard-alert success">
        {{ successMessage }}
      </div>

      <div v-if="loading" class="state-card">
        <div class="spinner"></div>
        <p>Loading your classes...</p>
      </div>

      <div v-else-if="errorMessage" class="state-card error">
        <strong>Unable to load classes</strong>
        <p>{{ errorMessage }}</p>
        <button @click="loadClasses">
          Try Again
        </button>
      </div>

      <div v-else-if="classes.length === 0" class="state-card">
        <strong>No Current Classes</strong>
        <p>You are not enrolled in any class for the active school year.</p>
      </div>

      <div v-else class="class-grid">
        <button
          v-for="schoolClass in classes"
          :key="schoolClass.id"
          class="class-card"
          @click="openClass(schoolClass.id)"
        >
          <div class="subject-icon">
            {{ getInitials(schoolClass.subject) }}
          </div>

          <div class="class-content">
            <span class="subject-label">SUBJECT</span>
            <h2>{{ schoolClass.subject || 'Subject' }}</h2>

            <div class="details">
              <span>
                {{ schoolClass.grade }}
                <template v-if="schoolClass.strand">
                  • {{ schoolClass.strand }}
                </template>
                <template v-if="schoolClass.section">
                  • {{ schoolClass.section }}
                </template>
              </span>

              <span v-if="schoolClass.school_year">
                SY {{ schoolClass.school_year }}
                <template v-if="schoolClass.semester">
                  • {{ formatSemester(schoolClass.semester) }}
                </template>
              </span>

              <span v-if="schoolClass.faculty">
                Faculty: {{ schoolClass.faculty }}
              </span>
            </div>
          </div>

          <div class="open-arrow">
            →
          </div>
        </button>
      </div>
    </main>

    <div
      v-if="showJoinDialog"
      class="dialog-overlay"
      @click.self="closeJoinDialog"
    >
      <div class="join-dialog">
        <div class="join-icon">+</div>

        <h2>Join Class</h2>

        <p>
          Enter the class code provided by your faculty.
        </p>

        <form @submit.prevent="joinClass">
          <div class="class-code-field">
            <label>Class Code</label>

            <input
              v-model="classCode"
              type="text"
              maxlength="10"
              placeholder="Enter class code"
              autocomplete="off"
              :disabled="joiningClass"
              @input="formatClassCode"
            >
          </div>

          <div
            v-if="joinErrorMessage"
            class="join-error"
          >
            {{ joinErrorMessage }}
          </div>

          <div class="join-actions">
            <button
              type="button"
              class="cancel-join-btn"
              :disabled="joiningClass"
              @click="closeJoinDialog"
            >
              Cancel
            </button>

            <button
              type="submit"
              class="confirm-join-btn"
              :disabled="joiningClass || !classCode.trim()"
            >
              {{ joiningClass ? 'Joining...' : 'Join Class' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <div
      v-if="showLogoutDialog"
      class="dialog-overlay"
      @click.self="showLogoutDialog = false"
    >
      <div class="logout-dialog">
        <div class="logout-icon">↪</div>
        <h2>Logout?</h2>
        <p>Are you sure you want to logout from the Student Portal?</p>

        <div class="logout-actions">
          <button
            class="cancel-logout-btn"
            type="button"
            :disabled="loggingOut"
            @click="showLogoutDialog = false"
          >
            Cancel
          </button>

          <button
            class="confirm-logout-btn"
            type="button"
            :disabled="loggingOut"
            @click="logout"
          >
            {{ loggingOut ? 'Logging out...' : 'Logout' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import api from '../../services/api'

interface Student {
  id: number
  name: string
  email: string
  lrn: string
  role: string
}

interface SchoolClass {
  id: number
  grade: string
  semester: string
  subject: string | null
  strand: string | null
  section: string | null
  school_year: string | null
  faculty: string | null
}

const router = useRouter()
const student = ref<Student | null>(null)
const classes = ref<SchoolClass[]>([])
const loading = ref(true)
const errorMessage = ref('')
const showAboutDialog = ref(false)
const showLogoutDialog = ref(false)
const loggingOut = ref(false)
const showJoinDialog = ref(false)
const classCode = ref('')
const joiningClass = ref(false)
const joinErrorMessage = ref('')
const successMessage = ref('')

onMounted(() => {
  loadStudent()
  loadClasses()
})

function loadStudent() {
  const storedStudent = localStorage.getItem('student_user')
  if (!storedStudent) return

  try {
    student.value = JSON.parse(storedStudent)
  } catch {
    student.value = null
  }
}

async function loadClasses() {
  loading.value = true
  errorMessage.value = ''

  try {
    const response = await api.get('/student/classes')
    classes.value = Array.isArray(response.data?.data)
      ? response.data.data
      : []
  } catch (error: any) {
    console.error('LOAD STUDENT CLASSES ERROR:', error)

    if (error.response?.status === 401) {
      clearStudentSession()
      await router.replace('/student/login')
      return
    }

    errorMessage.value =
      error.response?.data?.message ||
      'Unable to load your current classes.'
  } finally {
    loading.value = false
  }
}
function openJoinDialog() {
  classCode.value = ''
  joinErrorMessage.value = ''
  showJoinDialog.value = true
}

function closeJoinDialog() {
  if (joiningClass.value) return

  showJoinDialog.value = false
  classCode.value = ''
  joinErrorMessage.value = ''
}
async function joinClass() {
  const code = classCode.value.trim().toUpperCase()

  if (!code || joiningClass.value) return

  joiningClass.value = true
  joinErrorMessage.value = ''

  try {
    const response = await api.post(
      '/student/classes/join',
      {
        class_code: code
      }
    )

    showJoinDialog.value = false
    classCode.value = ''

    successMessage.value =
      response.data?.message ||
      'Class joined successfully.'

    await loadClasses()

    window.setTimeout(() => {
      successMessage.value = ''
    }, 3500)
  }  catch (error: any) {
  console.error('JOIN CLASS ERROR:', error)
  console.error('STATUS:', error.response?.status)
  console.error('RESPONSE:', error.response?.data)

    if (error.response?.status === 401) {
      clearStudentSession()
      await router.replace('/student/login')
      return
    }

    joinErrorMessage.value =
      error.response?.data?.message ||
      'Unable to join this class.'
  } finally {
    joiningClass.value = false
  }
}
function formatClassCode() {
  classCode.value = classCode.value
    .toUpperCase()
    .replace(/\s/g, '')
}
function openClass(id: number) {
  router.push(`/student/classes/${id}`)
}

function getInitials(subject: string | null) {
  if (!subject) return 'C'

  const words = subject
    .trim()
    .split(/\s+/)
    .filter(Boolean)

  if (words.length === 1) {
    return words[0]!.charAt(0).toUpperCase()
  }

  return (
    words[0]!.charAt(0) +
    words[words.length - 1]!.charAt(0)
  ).toUpperCase()
}

function formatSemester(semester: string) {
  const value = semester.toLowerCase()

  if (value.includes('1')) return '1st Semester'
  if (value.includes('2')) return '2nd Semester'

  return semester
}

function clearStudentSession() {
  localStorage.removeItem('token')
  localStorage.removeItem('role')
  localStorage.removeItem('student_user')
}

async function logout() {
  if (loggingOut.value) return

  loggingOut.value = true

  try {
    await api.post('/student/logout')
  } catch (error) {
    console.error('STUDENT LOGOUT ERROR:', error)
  } finally {
    showLogoutDialog.value = false
    clearStudentSession()
    loggingOut.value = false
    await router.replace('/student/login')
  }
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
  min-height: 76px;
  padding: 0 6%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  background: #064e3b;
  color: #fff;
}

.brand {
  display: flex;
  align-items: center;
  gap: 11px;
}

.brand img {
  width: 43px;
  height: 43px;
  padding: 4px;
  object-fit: contain;
  border-radius: 11px;
  background: #fff;
}

.brand div {
  display: flex;
  flex-direction: column;
}

.brand strong {
  font-size: 15px;
  font-weight: 800;
}

.brand span {
  color: #bbf7d0;
  font-size: 9px;
  font-weight: 600;
}

.student-menu {
  display: flex;
  align-items: center;
  gap: 15px;
}

.student-info {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.student-info strong {
  font-size: 10px;
  font-weight: 700;
}

.student-info span {
  color: #bbf7d0;
  font-size: 8px;
}

.about-btn,
.logout-btn {
  padding: 8px 13px;
  border: 1px solid rgba(255,255,255,.3);
  border-radius: 8px;
  background: transparent;
  color: #fff;
  font-size: 9px;
  font-weight: 700;
  cursor: pointer;
}

.about-btn:hover,
.logout-btn:hover {
  background: rgba(255,255,255,.1);
}

.content {
  width: min(1100px, 90%);
  margin: 0 auto;
  padding: 46px 0;
}

.page-heading {
  margin-bottom: 25px;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 20px;
}

.eyebrow {
  color: #16a34a;
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 1.2px;
}

.page-heading h1 {
  margin: 5px 0 5px;
  color: #0f172a;
  font-size: 28px;
  font-weight: 800;
}

.page-heading p {
  margin: 0;
  color: #64748b;
  font-size: 11px;
}
.join-dialog {
  width: 430px;
  max-width: 100%;
  padding: 28px;
  border-radius: 16px;
  background: #fff;
  box-shadow: 0 20px 50px rgba(15,23,42,.25);
}
.join-class-btn {
  height: 42px;
  padding: 0 18px;
  border: 1px solid #15803d;
  border-radius: 10px;

  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;

  background: #15803d;
  color: #ffffff;

  font-family: inherit;
  font-size: 10px;
  font-weight: 700;

  cursor: pointer;
  box-shadow: 0 4px 12px rgba(21, 128, 61, .15);
  transition: all .2s ease;
}

.join-class-btn:hover {
  background: #166534;
  border-color: #166534;
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(21, 128, 61, .22);
}

.join-class-btn:active {
  transform: translateY(0);
  box-shadow: 0 2px 7px rgba(21, 128, 61, .16);
}
.join-icon {
  width: 58px;
  height: 58px;
  margin: 0 auto 14px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #dcfce7;
  color: #15803d;
  font-size: 28px;
  font-weight: 700;
}

.join-dialog h2 {
  margin: 0;
  color: #0f172a;
  font-size: 20px;
  text-align: center;
}

.join-dialog > p {
  margin: 7px 0 20px;
  color: #64748b;
  font-size: 10px;
  line-height: 1.6;
  text-align: center;
}

.class-code-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.class-code-field label {
  color: #334155;
  font-size: 10px;
  font-weight: 700;
}

.class-code-field input {
  width: 100%;
  height: 46px;
  padding: 0 14px;
  border: 1px solid #cbd5e1;
  border-radius: 9px;
  outline: none;
  background: #fff;
  color: #0f172a;
  font-family: inherit;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 2px;
  text-transform: uppercase;
}

.class-code-field input:focus {
  border-color: #16a34a;
  box-shadow: 0 0 0 3px rgba(22,163,74,.1);
}

.class-code-field input::placeholder {
  font-size: 10px;
  font-weight: 500;
  letter-spacing: 0;
  text-transform: none;
}

.join-error {
  margin-top: 10px;
  padding: 9px 11px;
  border: 1px solid #fecaca;
  border-radius: 8px;
  background: #fef2f2;
  color: #dc2626;
  font-size: 9px;
}

.join-actions {
  margin-top: 18px;
  display: flex;
  gap: 10px;
}

.cancel-join-btn,
.confirm-join-btn {
  flex: 1;
  padding: 10px 14px;
  border: none;
  border-radius: 8px;
  font-family: inherit;
  font-size: 10px;
  font-weight: 700;
  cursor: pointer;
}

.cancel-join-btn {
  background: #e2e8f0;
  color: #475569;
}

.confirm-join-btn {
  background: #16a34a;
  color: #fff;
}

.confirm-join-btn:hover:not(:disabled) {
  background: #15803d;
}

.cancel-join-btn:disabled,
.confirm-join-btn:disabled {
  opacity: .6;
  cursor: not-allowed;
}

.class-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.class-card {
  width: 100%;
  min-height: 155px;
  padding: 22px;
  border: 1px solid #e2e8f0;
  border-radius: 15px;
  display: flex;
  align-items: center;
  gap: 17px;
  background: #fff;
  text-align: left;
  cursor: pointer;
  box-shadow: 0 5px 18px rgba(15,23,42,.04);
  transition: .2s ease;
}

.class-card:hover {
  border-color: #86efac;
  transform: translateY(-3px);
  box-shadow: 0 12px 28px rgba(15,23,42,.08);
}

.subject-icon {
  flex: 0 0 54px;
  width: 54px;
  height: 54px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #dcfce7;
  color: #15803d;
  font-size: 17px;
  font-weight: 800;
}


.class-content {
  min-width: 0;
  flex: 1;
}

.subject-label {
  color: #16a34a;
  font-size: 8px;
  font-weight: 800;
  letter-spacing: 1px;
}

.class-content h2 {
  margin: 3px 0 9px;
  overflow: hidden;
  color: #0f172a;
  font-size: 16px;
  font-weight: 800;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.details {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.details span {
  color: #64748b;
  font-size: 9px;
  line-height: 1.5;
}

.open-arrow {
  color: #16a34a;
  font-size: 22px;
  font-weight: 700;
}

.state-card {
  padding: 50px 25px;
  border: 1px solid #e2e8f0;
  border-radius: 15px;
  background: #fff;
  color: #64748b;
  text-align: center;
}

.state-card strong {
  display: block;
  margin-bottom: 5px;
  color: #0f172a;
  font-size: 14px;
}

.state-card p {
  margin: 0;
  font-size: 10px;
}

.state-card button {
  margin-top: 14px;
  padding: 9px 16px;
  border: none;
  border-radius: 8px;
  background: #16a34a;
  color: #fff;
  font-size: 9px;
  font-weight: 700;
  cursor: pointer;
}

.state-card.error {
  border-color: #fecaca;
  background: #fffafa;
}

.spinner {
  width: 25px;
  height: 25px;
  margin: 0 auto 12px;
  border: 3px solid #dcfce7;
  border-top-color: #16a34a;
  border-radius: 50%;
  animation: spin .7s linear infinite;
}

.dialog-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  padding: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(15,23,42,.55);
  backdrop-filter: blur(4px);
}

.about-dialog {
  width: 430px;
  max-width: 100%;
  padding: 28px;
  border-radius: 16px;
  background: #fff;
  text-align: center;
  box-shadow: 0 20px 50px rgba(15,23,42,.25);
}

.about-icon {
  width: 58px;
  height: 58px;
  margin: 0 auto 14px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #dcfce7;
  color: #15803d;
  font-size: 25px;
  font-weight: 800;
}

.about-dialog h2 {
  margin: 0 0 8px;
  color: #0f172a;
  font-size: 20px;
}

.about-dialog > p {
  margin: 0;
  color: #64748b;
  font-size: 11px;
  line-height: 1.6;
}

.developer-box {
  margin-top: 18px;
  padding: 17px;
  border: 1px solid #bbf7d0;
  border-radius: 11px;
  display: flex;
  flex-direction: column;
  gap: 5px;
  background: #f0fdf4;
}

.developer-box span {
  margin-bottom: 4px;
  color: #64748b;
  font-size: 10px;
  font-weight: 700;
}

.developer-box strong {
  color: #0f172a;
  font-size: 13px;
}

.developer-box small {
  margin-top: 8px;
  color: #16a34a;
  font-size: 9px;
  font-weight: 700;
}

.about-close-btn {
  margin-top: 18px;
  padding: 10px 27px;
  border: none;
  border-radius: 8px;
  background: #16a34a;
  color: #fff;
  font-size: 10px;
  font-weight: 700;
  cursor: pointer;
}

.about-close-btn:hover {
  background: #15803d;
}


.logout-dialog {
  width: 410px;
  max-width: 100%;
  padding: 28px;
  border-radius: 16px;
  background: #fff;
  text-align: center;
  box-shadow: 0 20px 50px rgba(15,23,42,.25);
}

.logout-icon {
  width: 58px;
  height: 58px;
  margin: 0 auto 14px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fee2e2;
  color: #dc2626;
  font-size: 27px;
  font-weight: 800;
}

.logout-dialog h2 {
  margin: 0 0 8px;
  color: #0f172a;
  font-size: 20px;
}

.logout-dialog p {
  margin: 0;
  color: #64748b;
  font-size: 11px;
  line-height: 1.6;
}

.logout-actions {
  margin-top: 20px;
  display: flex;
  gap: 10px;
}

.cancel-logout-btn,
.confirm-logout-btn {
  flex: 1;
  padding: 10px 14px;
  border: none;
  border-radius: 8px;
  font-size: 10px;
  font-weight: 700;
  cursor: pointer;
}

.cancel-logout-btn {
  background: #e2e8f0;
  color: #475569;
}

.cancel-logout-btn:hover:not(:disabled) {
  background: #cbd5e1;
}

.confirm-logout-btn {
  background: #dc2626;
  color: #fff;
}

.confirm-logout-btn:hover:not(:disabled) {
  background: #b91c1c;
}

.cancel-logout-btn:disabled,
.confirm-logout-btn:disabled {
  opacity: .6;
  cursor: not-allowed;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 760px) {
  .topbar {
    padding: 0 20px;
  }

  .student-info {
    display: none;
  }

  .content {
    width: calc(100% - 30px);
    padding: 30px 0;
  }

  .class-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 420px) {
  .student-menu {
    gap: 7px;
  }

  .about-btn,
  .logout-btn {
    padding: 7px 9px;
    font-size: 8px;
  }

  .class-card {
    padding: 17px;
  }

  .subject-icon {
    flex-basis: 46px;
    width: 46px;
    height: 46px;
  }

  .page-heading h1 {
    font-size: 24px;
  }

  .about-dialog,
  .logout-dialog {
    padding: 22px;
  }

  .logout-actions {
    flex-direction: column;
  }
}
</style>
