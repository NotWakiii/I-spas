<template>
  <div class="exam-results-page">

    <div class="page-header">
      <div>
        <h1>Exam Results</h1>

        <p>
          View and export previous examination results.
        </p>
      </div>
    </div>

    <!-- Loading -->
    <div
      v-if="loading"
      class="results-card"
    >
      <h2>Loading exam results...</h2>
    </div>

    <!-- Error -->
    <div
      v-else-if="errorMessage"
      class="results-card error-card"
    >
      <h2>Unable to load results</h2>

      <p>
        {{ errorMessage }}
      </p>
    </div>

    <!-- No Results -->
    <div
      v-else-if="exams.length === 0"
      class="results-card empty-state"
    >
      <FileSearch :size="38" />

      <h2>No exam results yet</h2>

      <p>
        Completed examination results will appear here.
      </p>
    </div>

    <!-- Results -->
    <div
      v-else
      class="results-list"
    >
      <div
        v-for="exam in exams"
        :key="exam.id"
        class="results-card"
      >
        <div class="exam-header">

          <div>
            <h2>
              {{ exam.title }}
            </h2>
            <div class="exam-info">
              <span>
                {{ exam.grade || 'No Grade' }}
                -
                {{ exam.section || 'No Section' }}
              </span>

              <span>
                {{ exam.subject || 'No Subject' }}
              </span>
            </div>

          </div>

          <span class="exam-code">
            {{ exam.access_code }}
          </span>

        </div>

        <div class="stats">

          <div class="stat-box">

            <div class="stat-icon">
              <Users :size="20" />
            </div>

            <div>
              <span class="stat-label">
                Examinees
              </span>

              <strong>
                {{ exam.students_count }}
              </strong>
            </div>

          </div>


          <div class="stat-box">

            <div class="stat-icon">
              <ChartNoAxesColumnIncreasing :size="20" />
            </div>

            <div>
              <span class="stat-label">
                Average Score
              </span>

              <strong>
                {{ exam.average_score }}
              </strong>
            </div>

          </div>


          <div class="stat-box">

            <div class="stat-icon">
              <Percent :size="20" />
            </div>

            <div>
              <span class="stat-label">
                Average %
              </span>

              <strong>
                {{ exam.average_percentage }}%
              </strong>
            </div>

          </div>


          <div class="stat-box">

            <div class="stat-icon">
              <Trophy :size="20" />
            </div>

            <div>
              <span class="stat-label">
                Highest Score
              </span>

              <strong>
                {{ exam.highest_score }}
              </strong>
            </div>

          </div>


          <div class="stat-box">

            <div class="stat-icon">
              <TrendingDown :size="20" />
            </div>

            <div>
              <span class="stat-label">
                Lowest Score
              </span>

              <strong>
                {{ exam.lowest_score }}
              </strong>
            </div>

          </div>

        </div>

        <div class="exam-footer">

          <span class="exam-date">
            <CalendarDays :size="15" />

            <span>
              Created:
              {{ formatDate(exam.created_at) }}
            </span>
          </span>

          <button
            class="view-btn"
            @click="viewResults(exam.id)"
          >
            <Eye :size="17" />
            <span>View Results</span>
          </button>

        </div>

      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '../services/api'

import {
  Users,
  ChartNoAxesColumnIncreasing,
  Percent,
  Trophy,
  TrendingDown,
  CalendarDays,
  Eye,
  FileSearch
} from '@lucide/vue'

const router = useRouter()

interface ExamResult {
  id: number
  title: string

  grade: string | null
  section: string | null
  subject: string | null

  access_code: string
  passing: number
  status: string

  students_count: number
  average_score: number
  average_percentage: number
  highest_score: number
  lowest_score: number

  created_at: string
}

const exams = ref<ExamResult[]>([])
const loading = ref(true)
const errorMessage = ref('')

onMounted(() => {
  loadExamResults()
})

async function loadExamResults() {
  loading.value = true
  errorMessage.value = ''

  try {
    const response =
      await api.get(
        '/faculty/exam-results'
      )

    exams.value = response.data.data

  } catch (error) {

    console.error(
      'Failed to load exam results:',
      error
    )

    errorMessage.value =
      'Failed to retrieve examination results.'

  } finally {

    loading.value = false

  }
}

function viewResults(examId: number) {
  router.push(
    `/faculty/exam-results/${examId}`
  )
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString(
    'en-PH',
    {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }
  )
}
</script>

<style scoped>
.exam-info {
  margin-top: 8px;

  display: flex;
  flex-wrap: wrap;

  gap: 8px;
}

.exam-info span {
  padding: 5px 9px;

  border-radius: 999px;

  background: #f0fdf4;

  color: #166534;

  font-size: 11px;
  font-weight: 600;
}
.exam-results-page {
  width: 100%;
  min-height: 100vh;

  padding:
    32px
    36px
    40px;

  background:
    #f6faf7;
}

.page-header {
  margin-bottom: 28px;
}

.page-header h1 {
  margin: 0 0 8px;

  color: #112244;

  font-size: 34px;
  font-weight: 700;
}

.page-header p {
  margin: 0;

  color: #6b7280;

  font-size: 15px;
}

.results-list {
  display: grid;
  gap: 22px;
}

.results-card {
  width: 100%;

  padding: 26px;

  background: #ffffff;

  border: 1px solid #edf1ee;
  border-radius: 16px;

  box-shadow:
    0 6px 20px
    rgba(0, 0, 0, 0.06);
}

.exam-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;

  gap: 20px;

  margin-bottom: 26px;
}

.exam-header h2 {
  margin: 0 0 6px;

  color: #112244;

  font-size: 25px;
}

.exam-header p {
  margin: 0;

  color: #6b7280;

  font-size: 14px;
}

.exam-code {
  background: #ecfdf3;
  color: #008a3d;
  padding: 7px 12px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 700;
}

.stats {
  display: grid;

  grid-template-columns:
    repeat(5, minmax(0, 1fr));

  gap: 14px;

  margin-bottom: 24px;
}

.stat-box {
  min-height: 88px;

  padding: 16px;

  background: #f9fbfa;

  border: 1px solid #e3e9e5;
  border-radius: 11px;
}

.stat-label {
  display: block;
  color: #6b7280;
  font-size: 12px;
  margin-bottom: 5px;
}

.stat-box strong {
  color: #111827;
  font-size: 18px;
}

.exam-footer {
  display: flex;

  justify-content: space-between;
  align-items: center;

  gap: 20px;

  padding-top: 4px;
}

.exam-date {
  color: #6b7280;
  font-size: 13px;
}

.view-btn {
  border: none;
  background: #00c853;
  color: white;
  padding: 11px 18px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
}

.view-btn:hover {
  background: #00b548;
}

.error-card {
  border-left: 4px solid #dc2626;
}

.error-card h2 {
  color: #dc2626;
}

@media (max-width: 1000px) {

  .exam-results-page {
    padding: 26px;
  }

  .stats {
    grid-template-columns:
      repeat(2, 1fr);
  }
}

@media (max-width: 600px) {

  .exam-results-page {
    padding: 18px;
  }

  .page-header h1 {
    font-size: 28px;
  }

  .stats {
    grid-template-columns: 1fr;
  }

  .exam-header,
  .exam-footer {
    flex-direction: column;
    align-items: flex-start;
  }

  .view-btn {
    width: 100%;
  }
}
/* ==========================================
   RESULT STAT ICONS
========================================== */

.stat-box {
  display: flex;
  align-items: center;
  gap: 12px;
}

.stat-icon {
  width: 40px;
  height: 40px;

  flex-shrink: 0;

  display: flex;
  align-items: center;
  justify-content: center;

  border-radius: 10px;

  background: #ecfdf3;
  color: #00a844;
}


/* ==========================================
   DATE
========================================== */

.exam-date {
  display: inline-flex;
  align-items: center;
  gap: 7px;
}

.exam-date svg {
  flex-shrink: 0;
  color: #64748b;
}


/* ==========================================
   VIEW BUTTON
========================================== */

.view-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;

  gap: 7px;
}

.view-btn svg {
  flex-shrink: 0;
}


/* ==========================================
   EMPTY STATE
========================================== */

.empty-state {
  display: flex;
  flex-direction: column;

  align-items: center;
  justify-content: center;

  text-align: center;

  gap: 8px;

  padding: 55px 30px;
}

.empty-state svg {
  margin-bottom: 6px;

  color: #00a844;
}

.empty-state h2,
.empty-state p {
  margin: 0;
}
</style>
