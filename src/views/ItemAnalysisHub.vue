<template>
  <div class="analysis-page">

    <!-- HEADER -->
    <div class="page-header">
      <div>
        <h1>Item Analysis</h1>

        <p>
          Select an exam to view question performance analysis.
        </p>
      </div>
    </div>

    <!-- FILTERS -->
    <div class="filter-card">
      <input
        v-model="search"
        type="text"
        placeholder="Search exam..."
      >

      <select v-model="selectedCourse">
        <option value="All Courses">
          All Courses
        </option>

        <option
          v-for="course in courses"
          :key="course"
          :value="course"
        >
          {{ course }}
        </option>
      </select>
    </div>

    <!-- LOADING -->
    <div
      v-if="loading"
      class="state-card"
    >
      <div class="loading-spinner"></div>

      <h2>Loading Item Analysis</h2>

      <p>
        Please wait while examination statistics are being calculated.
      </p>
    </div>

    <!-- ERROR -->
    <div
      v-else-if="errorMessage"
      class="state-card error-state"
    >
      <h2>Unable to Load Exams</h2>

      <p>
        {{ errorMessage }}
      </p>

      <button
        class="retry-btn"
        @click="fetchExams"
      >
        Try Again
      </button>
    </div>

    <!-- EMPTY STATE -->
    <div
      v-else-if="filteredExams.length === 0"
      class="state-card"
    >
      <h2>No Finished Exams Found</h2>

      <p v-if="search || selectedCourse !== 'All Courses'">
        No finished examination matches your search or selected course.
      </p>

      <p v-else>
        Finished examinations will appear here once they are available.
      </p>
    </div>

    <!-- EXAM LIST -->
    <div
      v-else
      class="exam-grid"
    >
      <div
        v-for="exam in filteredExams"
        :key="exam.id"
        class="exam-card"
      >
        <div class="exam-top">
          <div class="exam-information">
            <h2>
              {{ exam.title }}
            </h2>

            <p>
              {{ exam.course }}
            </p>
          </div>

          <span class="badge">
            {{ exam.type }}
          </span>
        </div>

        <div class="exam-stats">
          <div>
            <small>Questions</small>

            <strong>
              {{ exam.questions }}
            </strong>
          </div>

          <div>
            <small>Students</small>

            <strong>
              {{ exam.students }}
            </strong>
          </div>

          <div>
            <small>Avg. Success</small>

            <strong>
              {{ exam.success }}%
            </strong>
          </div>

          <div>
            <small>Hard Items</small>

            <strong>
              {{ exam.hardItems }}
            </strong>
          </div>
        </div>

        <button
          class="view-btn"
          @click="viewAnalysis(exam.id)"
        >
          View Analysis
        </button>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import {
  ref,
  computed,
  onMounted
} from 'vue'

import { useRouter } from 'vue-router'

import api from '../services/api'

interface AnalysisItem {
  id?: number
  successRate?: number | string
  total?: number | string
  correct?: number | string
  wrong?: number | string
}

interface BackendExam {
  id: number
  title: string
  course?: string | null
  status?: string | null
  questions?: unknown[]
  questions_count?: number | string
}

interface ExamCard {
  id: number
  title: string
  course: string
  type: string
  questions: number
  students: number
  success: number
  hardItems: number
}

const router = useRouter()

const search = ref('')

const selectedCourse = ref('All Courses')

const exams = ref<ExamCard[]>([])

const loading = ref(false)

const errorMessage = ref('')

function getArrayResponse(response: any): any[] {
  if (Array.isArray(response?.data?.data)) {
    return response.data.data
  }

  if (Array.isArray(response?.data)) {
    return response.data
  }

  return []
}

function normalizeNumber(value: unknown): number {
  const numberValue = Number(value)

  if (!Number.isFinite(numberValue)) {
    return 0
  }

  return numberValue
}

function formatStatus(status: unknown): string {
  const value = String(status || 'finished')
    .trim()
    .toLowerCase()

  if (!value) {
    return 'Finished'
  }

  return value.charAt(0).toUpperCase() + value.slice(1)
}

function isFinishedExam(exam: BackendExam): boolean {
  return String(exam.status || '')
    .trim()
    .toLowerCase() === 'finished'
}

function getFallbackQuestionCount(exam: BackendExam): number {
  if (Array.isArray(exam.questions)) {
    return exam.questions.length
  }

  return normalizeNumber(exam.questions_count)
}

async function buildExamCard(
  exam: BackendExam
): Promise<ExamCard> {
  const fallbackCard: ExamCard = {
    id: exam.id,

    title: exam.title || 'Untitled Examination',

    course: exam.course || 'No Course',

    type: formatStatus(exam.status),

    questions: getFallbackQuestionCount(exam),

    students: 0,

    success: 0,

    hardItems: 0
  }

  try {
    const analysisResponse = await api.get(
      `/exams/${exam.id}/item-analysis`
    )

    const analysisItems = getArrayResponse(
      analysisResponse
    ) as AnalysisItem[]

    if (analysisItems.length === 0) {
      return fallbackCard
    }

    const successRates = analysisItems.map(
      (item) => normalizeNumber(item.successRate)
    )

    const totalSuccess = successRates.reduce(
      (sum, successRate) => sum + successRate,
      0
    )

    const averageSuccess = Math.round(
      totalSuccess / analysisItems.length
    )

    /*
     * The detailed ItemAnalysis.vue classifies:
     *
     * 90% and above = Easy
     * 75% to 89%    = Medium
     * 50% to 74%    = Hard
     * Below 50%     = Very Hard
     *
     * Therefore, anything below 75% is counted
     * as a Hard Item on the examination card.
     */
    const hardItems = analysisItems.filter(
      (item) =>
        normalizeNumber(item.successRate) < 75
    ).length

    /*
     * The ResultController returns the same total
     * student count on each analysis item.
     */
    const students = normalizeNumber(
      analysisItems[0]?.total
    )

    return {
      id: exam.id,

      title: exam.title || 'Untitled Examination',

      course: exam.course || 'No Course',

      type: formatStatus(exam.status),

      questions: analysisItems.length,

      students,

      success: averageSuccess,

      hardItems
    }
  } catch (analysisError: any) {
    console.error(
      `Failed to load item analysis for exam ${exam.id}:`,
      analysisError?.response?.data || analysisError
    )

    /*
     * One failed item-analysis request should not prevent
     * the other examination cards from appearing.
     */
    return fallbackCard
  }
}

async function fetchExams() {
  loading.value = true

  errorMessage.value = ''

  try {
    const response = await api.get('/exams')

    const allExams = getArrayResponse(
      response
    ) as BackendExam[]

    const finishedExams = allExams.filter(
      isFinishedExam
    )

    const cards = await Promise.all(
      finishedExams.map(
        (exam) => buildExamCard(exam)
      )
    )

    exams.value = cards
  } catch (error: any) {
    console.error(
      'Failed to load examinations:',
      error?.response?.data || error
    )

    exams.value = []

    errorMessage.value =
      error?.response?.data?.message ||
      'Failed to load examinations. Please check your connection and try again.'
  } finally {
    loading.value = false
  }
}

const courses = computed<string[]>(() => {
  const uniqueCourses = new Set<string>()

  exams.value.forEach((exam) => {
    if (exam.course) {
      uniqueCourses.add(exam.course)
    }
  })

  return Array.from(uniqueCourses).sort(
    (firstCourse, secondCourse) =>
      firstCourse.localeCompare(secondCourse)
  )
})

const filteredExams = computed<ExamCard[]>(() => {
  const searchValue = search.value
    .trim()
    .toLowerCase()

  return exams.value.filter((exam) => {
    const matchesCourse =
      selectedCourse.value === 'All Courses' ||
      exam.course === selectedCourse.value

    const matchesSearch =
      !searchValue ||
      exam.title.toLowerCase().includes(searchValue) ||
      exam.course.toLowerCase().includes(searchValue)

    return matchesCourse && matchesSearch
  })
})

function viewAnalysis(id: number) {
  router.push(
    `/faculty/item-analysis/${id}`
  )
}

onMounted(() => {
  fetchExams()
})
</script>

<style scoped>
*{
  margin:0;
  padding:0;
  box-sizing:border-box;
}

.analysis-page{
  min-height:100vh;
  background:#f5f7fb;
  padding:30px;
  font-family:'Poppins',sans-serif;
}

/* ==========================================
   HEADER
========================================== */

.page-header{
  margin-bottom:25px;
}

.page-header h1{
  color:#112244;
  font-size:36px;
  margin-bottom:8px;
}

.page-header p{
  color:#666;
}

/* ==========================================
   FILTERS
========================================== */

.filter-card{
  background:white;
  padding:20px;
  border-radius:16px;
  display:flex;
  gap:15px;
  margin-bottom:25px;
  box-shadow:0 8px 20px rgba(0,0,0,.06);
}

.filter-card input,
.filter-card select{
  min-height:48px;
  padding:13px 15px;
  border:1px solid #ddd;
  border-radius:10px;
  outline:none;
  background:white;
  color:#112244;
  font-family:inherit;
  font-size:14px;
  transition:.2s;
}

.filter-card input{
  flex:1;
  min-width:0;
}

.filter-card select{
  min-width:220px;
  cursor:pointer;
}

.filter-card input:focus,
.filter-card select:focus{
  border-color:#16a34a;
  box-shadow:0 0 0 3px rgba(22,163,74,.1);
}

/* ==========================================
   EXAM GRID
========================================== */

.exam-grid{
  display:grid;
  grid-template-columns:repeat(
    auto-fit,
    minmax(320px,1fr)
  );
  gap:20px;
}

/* ==========================================
   EXAM CARD
========================================== */

.exam-card{
  background:white;
  padding:22px;
  border-radius:18px;
  border:1px solid #edf2f7;
  box-shadow:0 8px 20px rgba(0,0,0,.06);
  transition:.25s;
}

.exam-card:hover{
  transform:translateY(-3px);
  box-shadow:0 14px 30px rgba(0,0,0,.09);
}

.exam-top{
  display:flex;
  justify-content:space-between;
  align-items:flex-start;
  gap:15px;
  margin-bottom:20px;
}

.exam-information{
  min-width:0;
}

.exam-top h2{
  color:#112244;
  font-size:22px;
  line-height:1.4;
  margin-bottom:6px;
  word-break:break-word;
}

.exam-top p{
  color:#666;
}

.badge{
  flex-shrink:0;
  background:#dcfce7;
  color:#15803d;
  padding:6px 14px;
  border-radius:999px;
  font-size:13px;
  font-weight:600;
  height:max-content;
}

/* ==========================================
   EXAM STATISTICS
========================================== */

.exam-stats{
  display:grid;
  grid-template-columns:repeat(2,1fr);
  gap:15px;
  margin-bottom:20px;
}

.exam-stats div{
  min-width:0;
  background:#f8fafc;
  padding:14px;
  border-radius:12px;
  border:1px solid #f1f5f9;
}

.exam-stats small{
  display:block;
  color:#777;
  margin-bottom:6px;
  font-size:12px;
}

.exam-stats strong{
  display:block;
  color:#112244;
  font-size:19px;
}

/* ==========================================
   VIEW BUTTON
========================================== */

.view-btn{
  width:100%;
  border:none;
  background:#16a34a;
  color:white;
  padding:14px;
  border-radius:12px;
  cursor:pointer;
  font-family:inherit;
  font-weight:600;
  font-size:14px;
  transition:.2s;
}

.view-btn:hover{
  background:#15803d;
}

.view-btn:active{
  transform:scale(.99);
}

/* ==========================================
   LOADING / ERROR / EMPTY STATES
========================================== */

.state-card{
  min-height:260px;
  background:white;
  border-radius:18px;
  padding:40px 25px;
  display:flex;
  flex-direction:column;
  align-items:center;
  justify-content:center;
  text-align:center;
  border:1px solid #edf2f7;
  box-shadow:0 8px 20px rgba(0,0,0,.06);
}

.state-card h2{
  color:#112244;
  font-size:22px;
  margin-bottom:10px;
}

.state-card p{
  max-width:560px;
  color:#667085;
  line-height:1.7;
}

.error-state{
  border-color:#fecaca;
}

.error-state h2{
  color:#b91c1c;
}

.loading-spinner{
  width:42px;
  height:42px;
  margin-bottom:20px;
  border:4px solid #dcfce7;
  border-top-color:#16a34a;
  border-radius:50%;
  animation:spin .8s linear infinite;
}

.retry-btn{
  margin-top:20px;
  border:none;
  background:#16a34a;
  color:white;
  padding:12px 22px;
  border-radius:10px;
  cursor:pointer;
  font-family:inherit;
  font-weight:600;
}

.retry-btn:hover{
  background:#15803d;
}

@keyframes spin{
  to{
    transform:rotate(360deg);
  }
}

/* ==========================================
   RESPONSIVE
========================================== */

@media(max-width:900px){
  .analysis-page{
    padding:24px;
  }

  .page-header h1{
    font-size:32px;
  }
}

@media(max-width:700px){
  .analysis-page{
    padding:20px;
  }

  .filter-card{
    flex-direction:column;
  }

  .filter-card select{
    width:100%;
    min-width:0;
  }

  .exam-grid{
    grid-template-columns:1fr;
  }

  .exam-top{
    flex-direction:column;
  }
}

@media(max-width:480px){
  .analysis-page{
    padding:15px;
  }

  .page-header h1{
    font-size:28px;
  }

  .filter-card{
    padding:16px;
  }

  .exam-card{
    padding:18px;
  }

  .exam-top h2{
    font-size:19px;
  }

  .exam-stats{
    gap:10px;
  }

  .exam-stats div{
    padding:12px;
  }

  .exam-stats strong{
    font-size:17px;
  }
}
</style>