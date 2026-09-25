<template>
  <div class="page">
    <header class="topbar">
      <div>
        <strong>I-SPAS</strong>
        <span>Student Portal</span>
      </div>
    </header>
    <main class="content">
      <div v-if="loading" class="state-card">
        <div class="spinner"></div>
        <p>Loading class...</p>
      </div>
      <div v-else-if="errorMessage" class="state-card error">
        <strong>Unable to load class</strong>
        <p>{{ errorMessage }}</p>
        <button @click="loadClass">
          Try Again
        </button>
      </div>
      <template v-else-if="schoolClass">
        <section class="class-header">
          <span class="label">
            CURRENT CLASS
          </span>
          <div class="class-title-row">
            <div class="class-title-info">
              <h1>
                {{ schoolClass.subject }}
              </h1>
              <p>
                {{ schoolClass.grade }}
                <template v-if="schoolClass.strand">
                  • {{ schoolClass.strand }}
                </template>
                <template v-if="schoolClass.section">
                  • {{ schoolClass.section }}
                </template>
              </p>
            </div>
            <button class="class-back-btn" @click="goBack">
              ← Back
            </button>
          </div>
          <div class="class-meta">
            <span v-if="schoolClass.school_year">
              SY {{ schoolClass.school_year }}
            </span>
            <span v-if="schoolClass.semester">
              {{ formatSemester(schoolClass.semester) }}
            </span>
            <span v-if="schoolClass.faculty">
              {{ schoolClass.faculty }}
            </span>
          </div>
        </section>
        <section class="actions">
          <button
            class="action-card join-card"
            @click="joinExam"
          >
            <div class="action-icon">
              +
            </div>
            <div>
              <strong>
                Join Exam
              </strong>
              <span>
                Enter examination code
              </span>
            </div>
            <span class="arrow">
              →
            </span>
          </button>
        </section>
        <section class="exams-section">
          <div class="section-title">
            <div>
              <span class="label">
                ASSESSMENTS
              </span>
              <h2>
                Exams
              </h2>
            </div>
            <span class="exam-count">
              {{ assessments.length }}
            </span>
          </div>
          <div
            v-if="assessments.length === 0"
            class="empty-exams"
          >
            <strong>
              No Exams Available
            </strong>
            <p>
              There are currently no available assessments for this class.
            </p>
          </div>
          <div
            v-else
            class="exam-list"
          >
            <button
              v-for="exam in assessments"
              :key="exam.id"
              class="exam-card"
              @click="viewExamResult(exam)"
            >
              <div class="exam-top">
                <div>
                  <span
                    class="type-badge"
                    :class="exam.assessment_type"
                  >
                    {{ formatType(exam.assessment_type) }}
                  </span>
                  <h3>
                    {{ exam.title }}
                  </h3>
                </div>
                <span
                  class="status-badge"
                  :class="exam.status"
                >
                  {{ formatStatus(exam.status) }}
                </span>
              </div>
              <div class="exam-meta">
                <span>
                  {{ exam.questions_count }} Questions
                </span>
                <span>
                  {{ exam.duration }} Minutes
                </span>
                <span>
                  Passing: {{ exam.passing }}%
                </span>
                <div class="view-result-hint">
                  View your result →
                </div>
              </div>
            </button>
          </div>
        </section>
      </template>
    </main>
  </div>
</template>
<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '../../services/api'
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
interface Assessment {
  id: number
  title: string
  assessment_type: 'quiz' | 'examination'
  duration: number
  passing: number
  status: string
  questions_count: number
}
const route = useRoute()
const router = useRouter()
const schoolClass = ref<SchoolClass | null>(null)
const assessments = ref<Assessment[]>([])
const loading = ref(true)
const errorMessage = ref('')
onMounted(() => {
  loadClass()
})
async function loadClass() {
  loading.value = true
  errorMessage.value = ''
  try {
    const response = await api.get(
      `/student/classes/${route.params.id}`
    )
    schoolClass.value =
      response.data.data.class
    assessments.value =
      Array.isArray(response.data.data.assessments)
        ? response.data.data.assessments
        : []
  } catch (error: any) {
    console.error(
      'LOAD STUDENT CLASS ERROR:',
      error
    )
    if (error.response?.status === 401) {
      clearSession()
      await router.replace(
        '/student/login'
      )
      return
    }
    if (error.response?.status === 403) {
      errorMessage.value =
        'You are not enrolled in this class.'
      return
    }
    errorMessage.value =
      error.response?.data?.message ||
      'Unable to load this class.'
  } finally {
    loading.value = false
  }
}
function joinExam() {
  router.push(
    `/student/classes/${route.params.id}/join`
  )
}
function viewExamResult(exam: Assessment) {
  router.push({
    name: 'StudentExamResult',
    params: {
      examId: exam.id,
    },
  })
}
function goBack() {
  router.push(
    '/student/dashboard'
  )
}
function formatSemester(value: string) {
  const semester =
    value.toLowerCase()
  if (semester.includes('1')) {
    return '1st Semester'
  }
  if (semester.includes('2')) {
    return '2nd Semester'
  }
  return value
}
function formatType(value: string) {
  if (value === 'quiz') {
    return 'Quiz'
  }
  return 'Examination'
}
function formatStatus(value: string) {
  if (value === 'started') {
    return 'Ongoing'
  }
  if (value === 'published') {
    return 'Available'
  }
  if (value === 'finished') {
    return 'Finished'
  }
  return value
}
function clearSession() {
  localStorage.removeItem('token')
  localStorage.removeItem('role')
  localStorage.removeItem('student_user')
}
</script>
<style scoped>
\* {
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
.content {
  width: min(1000px, 90%);
  margin: 0 auto;
  padding: 40px 0 60px;
}
.class-header {
  margin-bottom: 26px;
}
.label {
  color: #16a34a;
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 1.2px;
}
.class-title-row {
  margin-top: 5px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;
}
.class-title-info {
  min-width: 0;
}
.class-back-btn {
  flex: 0 0 auto;
  min-height: 40px;
  padding: 0 15px;
  border: 1px solid #d1d5db;
  border-radius: 9px;
  background: #fff;
  color: #334155;
  font-family: inherit;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
  transition: .2s ease;
}
.class-back-btn:hover {
  border-color: #86efac;
  background: #f0fdf4;
  color: #15803d;
}
.class-header h1 {
  margin: 5px 0;
  color: #0f172a;
  font-size: 30px;
  font-weight: 800;
}
.class-header p {
  margin: 0;
  color: #475569;
  font-size: 12px;
  font-weight: 600;
}
.class-meta {
  margin-top: 10px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.class-meta span {
  padding: 6px 10px;
  border-radius: 7px;
  background: #eaf7ee;
  color: #166534;
  font-size: 9px;
  font-weight: 700;
}
.actions {
  margin-bottom: 38px;
  display: grid;
  grid-template-columns: minmax(260px, 360px);
  gap: 14px;
}
.action-card {
  min-height: 105px;
  padding: 17px;
  border: 1px solid #e2e8f0;
  border-radius: 13px;
  display: flex;
  align-items: center;
  gap: 12px;
  background: #fff;
  text-align: left;
  cursor: pointer;
  transition: .2s ease;
}
.action-card:hover {
  border-color: #86efac;
  transform: translateY(-2px);
  box-shadow: 0 9px 22px rgba(15,23,42,.06);
}
.join-card {
  border-color: #86efac;
  background: #f0fdf4;
}
.action-icon {
  flex: 0 0 42px;
  width: 42px;
  height: 42px;
  border-radius: 11px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #dcfce7;
  color: #15803d;
  font-size: 15px;
  font-weight: 800;
}
.action-card > div:nth-child(2) {
  min-width: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
}
.action-card strong {
  color: #0f172a;
  font-size: 12px;
  font-weight: 800;
}
.action-card span {
  margin-top: 2px;
  color: #64748b;
  font-size: 8px;
}
.arrow {
  color: #16a34a !important;
  font-size: 17px !important;
  font-weight: 800;
}
.exams-section {
  scroll-margin-top: 20px;
}
.section-title {
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.section-title h2 {
  margin: 3px 0 0;
  color: #0f172a;
  font-size: 22px;
  font-weight: 800;
}
.exam-count {
  min-width: 30px;
  height: 30px;
  padding: 0 9px;
  border-radius: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #dcfce7;
  color: #15803d;
  font-size: 10px;
  font-weight: 800;
}
.exam-list {
  display: grid;
  gap: 11px;
}
.exam-card {
  width: 100%;
  padding: 18px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  background: #fff;
  text-align: left;
  font-family: inherit;
  cursor: pointer;
  transition: .2s ease;
}
.exam-card:hover {
  border-color: #86efac;
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(15, 23, 42, .06);
}
.view-result-hint {
  margin-top: 14px;
  color: #16a34a;
  font-size: 9px;
  font-weight: 800;
}
.exam-top {
  display: flex;
  justify-content: space-between;
  gap: 15px;
}
.exam-top h3 {
  margin: 7px 0 0;
  color: #0f172a;
  font-size: 14px;
  font-weight: 800;
}
.type-badge,
.status-badge {
  display: inline-block;
  padding: 5px 8px;
  border-radius: 6px;
  font-size: 8px;
  font-weight: 800;
}
.type-badge {
  background: #e0f2fe;
  color: #0369a1;
}
.type-badge.examination {
  background: #ede9fe;
  color: #6d28d9;
}
.status-badge {
  height: fit-content;
  background: #f1f5f9;
  color: #475569;
}
.status-badge.published {
  background: #dcfce7;
  color: #15803d;
}
.status-badge.started {
  background: #fef3c7;
  color: #b45309;
}
.status-badge.finished {
  background: #e2e8f0;
  color: #475569;
}
.exam-meta {
  margin-top: 12px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.exam-meta span {
  color: #64748b;
  font-size: 9px;
}
.exam-meta span:not(:last-child)::after {
  margin-left: 8px;
  content: '•';
  color: #cbd5e1;
}
.empty-exams,
.state-card {
  padding: 40px 22px;
  border: 1px solid #e2e8f0;
  border-radius: 13px;
  background: #fff;
  text-align: center;
}
.empty-exams strong,
.state-card strong {
  display: block;
  margin-bottom: 5px;
  color: #0f172a;
  font-size: 13px;
}
.empty-exams p,
.state-card p {
  margin: 0;
  color: #64748b;
  font-size: 9px;
}
.state-card button {
  margin-top: 13px;
  padding: 8px 14px;
  border: none;
  border-radius: 7px;
  background: #16a34a;
  color: #fff;
  font-size: 9px;
  font-weight: 700;
  cursor: pointer;
}
.state-card.error {
  border-color: #fecaca;
}
.spinner {
  width: 25px;
  height: 25px;
  margin: 0 auto 10px;
  border: 3px solid #dcfce7;
  border-top-color: #16a34a;
  border-radius: 50%;
  animation: spin .7s linear infinite;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
@media (max-width: 760px) {
  .content {
    width: calc(100% - 30px);
    padding-top: 30px;
  }
  .actions {
    grid-template-columns: 1fr;
  }
}
@media (max-width: 480px) {
  .class-title-row {
    align-items: flex-start;
    gap: 10px;
  }
  .class-title-info {
    flex: 1;
  }
  .class-back-btn {
    min-height: 36px;
    padding: 0 10px;
    font-size: 10px;
  }
  .topbar {
    padding: 0 17px;
  }
  .class-header h1 {
    font-size: 25px;
  }
  .exam-top {
    flex-direction: column;
  }
  .status-badge {
    width: fit-content;
  }
}
</style>
