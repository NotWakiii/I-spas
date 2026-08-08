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
      class="results-card"
    >
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

            <p>
              {{ exam.course || 'No course specified' }}
            </p>
          </div>

          <span class="exam-code">
            {{ exam.access_code }}
          </span>

        </div>

        <div class="stats">

          <div class="stat-box">
            <span class="stat-label">
              Examinees
            </span>

            <strong>
              {{ exam.students_count }}
            </strong>
          </div>

          <div class="stat-box">
            <span class="stat-label">
              Average Score
            </span>

            <strong>
              {{ exam.average_score }}
            </strong>
          </div>

          <div class="stat-box">
            <span class="stat-label">
              Average %
            </span>

            <strong>
              {{ exam.average_percentage }}%
            </strong>
          </div>

          <div class="stat-box">
            <span class="stat-label">
              Highest Score
            </span>

            <strong>
              {{ exam.highest_score }}
            </strong>
          </div>

          <div class="stat-box">
            <span class="stat-label">
              Lowest Score
            </span>

            <strong>
              {{ exam.lowest_score }}
            </strong>
          </div>

        </div>

        <div class="exam-footer">

          <span class="exam-date">
            Created:
            {{ formatDate(exam.created_at) }}
          </span>

          <button
            class="view-btn"
            @click="viewResults(exam.id)"
          >
            View Results
          </button>

        </div>

      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()

interface ExamResult {
  id: number
  title: string
  course: string | null
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
    const token = localStorage.getItem('token')

    const response = await axios.get(
      'http://192.168.100.59:8000/api/faculty/exam-results',
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
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
.exam-results-page {
  width: 100%;
}

.page-header {
  margin-bottom: 25px;
}

.page-header h1 {
  color: #111827;
  margin-bottom: 6px;
}

.page-header p {
  color: #6b7280;
}

.results-list {
  display: grid;
  gap: 18px;
}

.results-card {
  background: #ffffff;
  padding: 24px;
  border-radius: 14px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
}

.exam-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 15px;
  margin-bottom: 22px;
}

.exam-header h2 {
  color: #111827;
  margin-bottom: 4px;
}

.exam-header p {
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
  grid-template-columns: repeat(5, 1fr);
  gap: 12px;
  margin-bottom: 22px;
}

.stat-box {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  padding: 15px;
  border-radius: 10px;
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
  .stats {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 600px) {
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
</style>
