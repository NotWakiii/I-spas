<template>
  <div class="results-page">

    <!-- HEADER -->
    <div class="page-header">
      <div>
        <h1>Results Overview</h1>
        <p>
          View examination results from all faculty.
        </p>
      </div>
    </div>

    <!-- STAT CARDS -->
    <div class="stats">

      <div class="stat-card">
        <div>
          <span>Exams with Results</span>
          <h2>{{ results.length }}</h2>
        </div>
      </div>

      <div class="stat-card">
        <div>
          <span>Total Examinees</span>
          <h2>{{ totalStudents }}</h2>
        </div>
      </div>

      <div class="stat-card">
        <div>
          <span>Total Passed</span>
          <h2>{{ totalPassed }}</h2>
        </div>
      </div>

      <div class="stat-card">
        <div>
          <span>Total Failed</span>
          <h2>{{ totalFailed }}</h2>
        </div>
      </div>

    </div>

    <!-- RESULTS SECTION -->
    <div class="results-section">

      <div class="section-header">

        <div>
          <h2>Examination Results</h2>

          <p>
            {{ filteredResults.length }}
            examination(s) displayed
          </p>
        </div>

        <button
          v-if="hasFilters"
          class="clear-btn"
          @click="clearFilters"
        >
          Clear Filters
        </button>

      </div>

      <!-- FILTERS -->
      <div class="filters">

        <div class="filter-group search-group">
          <label>Search</label>

          <input
            v-model="search"
            type="text"
            placeholder="Search exam, faculty, subject..."
          />
        </div>

        <div class="filter-group">
          <label>Faculty</label>

          <select v-model="facultyFilter">
            <option value="">
              All Faculty
            </option>

            <option
              v-for="faculty in facultyOptions"
              :key="faculty.id ?? faculty.name"
              :value="String(faculty.id)"
            >
              {{ faculty.name }}
            </option>
          </select>
        </div>

        <div class="filter-group">
          <label>Subject</label>

          <select v-model="subjectFilter">
            <option value="">
              All Subjects
            </option>

            <option
              v-for="subject in subjectOptions"
              :key="subject"
              :value="subject"
            >
              {{ subject }}
            </option>
          </select>
        </div>

      </div>

      <!-- LOADING -->
      <div
        v-if="loading"
        class="state-message"
      >
        Loading examination results...
      </div>

      <!-- ERROR -->
      <div
        v-else-if="errorMessage"
        class="error-box"
      >
        <span>{{ errorMessage }}</span>

        <button @click="fetchResults">
          Try Again
        </button>
      </div>

      <!-- TABLE -->
      <div
        v-else
        class="table-container"
      >
        <table>

          <thead>
            <tr>
              <th>Examination</th>
              <th>Faculty</th>
              <th>Subject</th>
              <th>Examinees</th>
              <th>Passed</th>
              <th>Failed</th>
              <th>Average</th>
              <th>Highest</th>
              <th>Lowest</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>

            <tr
              v-for="exam in filteredResults"
              :key="exam.id"
            >

              <td>
                <div class="exam-info">
                  <strong>
                    {{ exam.title }}
                  </strong>

                  <small>
                    {{
                      exam.grade || '—'
                    }}
                    <template v-if="exam.section">
                      • {{ exam.section }}
                    </template>
                  </small>
                </div>
              </td>

              <td>
                <div class="faculty-info">

                  <div class="avatar">
                    {{
                      getInitials(
                        exam.faculty?.name
                      )
                    }}
                  </div>

                  <div>
                    <strong>
                      {{
                        exam.faculty?.name ||
                        'Unknown Faculty'
                      }}
                    </strong>

                    <small>
                      {{
                        exam.faculty?.email ||
                        'No email'
                      }}
                    </small>
                  </div>

                </div>
              </td>

              <td>
                {{ exam.subject || '—' }}
              </td>

              <td>
                <span class="count-badge">
                  {{ exam.students_count }}
                </span>
              </td>

              <td>
                <span class="passed-text">
                  {{ exam.passed }}
                </span>
              </td>

              <td>
                <span class="failed-text">
                  {{ exam.failed }}
                </span>
              </td>

              <td>
                <strong>
                  {{
                    formatPercentage(
                      exam.average_percentage
                    )
                  }}
                </strong>
              </td>

              <td>
                {{ exam.highest_score }}
              </td>

              <td>
                {{ exam.lowest_score }}
              </td>

              <td>
                <button
                  class="view-btn"
                  @click="viewExamResults(exam.id)"
                >
                  View Results
                </button>
              </td>

            </tr>

            <tr
              v-if="filteredResults.length === 0"
            >
              <td
                colspan="10"
                class="empty"
              >
                <div class="empty-content">
                  <div class="empty-icon">
                    📭
                  </div>

                  <strong>
                    No examination results found
                  </strong>

                  <p>
                    No submitted results match
                    your current filters.
                  </p>
                </div>
              </td>
            </tr>

          </tbody>

        </table>
      </div>

    </div>


    <!-- ==================================
         EXAM RESULTS MODAL
    =================================== -->
    <div
      v-if="showResultsModal"
      class="modal-overlay"
      @click.self="closeResultsModal"
    >

      <div class="results-modal">

        <div class="modal-header">

          <div>
            <h2>
              {{
                selectedExam?.title ||
                'Examination Results'
              }}
            </h2>

            <p v-if="selectedExam">
              {{ selectedExam.subject || 'No Subject' }}
              •
              {{ selectedExam.faculty?.name }}
            </p>
          </div>

          <button
            class="close-btn"
            @click="closeResultsModal"
          >
            ×
          </button>

        </div>


        <!-- LOADING DETAILS -->
        <div
          v-if="detailsLoading"
          class="state-message"
        >
          Loading student results...
        </div>


        <template v-else>

          <!-- SUMMARY -->
          <div
            v-if="selectedSummary"
            class="modal-stats"
          >

            <div class="mini-stat">
              <span>Students</span>
              <strong>
                {{ selectedSummary.students_count }}
              </strong>
            </div>

            <div class="mini-stat passed">
              <span>Passed</span>
              <strong>
                {{ selectedSummary.passed }}
              </strong>
            </div>

            <div class="mini-stat failed">
              <span>Failed</span>
              <strong>
                {{ selectedSummary.failed }}
              </strong>
            </div>

            <div class="mini-stat">
              <span>Average</span>
              <strong>
                {{
                  formatPercentage(
                    selectedSummary.average_percentage
                  )
                }}
              </strong>
            </div>

          </div>


          <!-- STUDENT TABLE -->
          <div class="student-table">

            <table>

              <thead>
                <tr>
                  <th>Student</th>
                  <th>Score</th>
                  <th>Percentage</th>
                  <th>Result</th>
                  <th>Tab Switches</th>
                  <th>Time Spent</th>
                  <th>Submitted</th>
                </tr>
              </thead>

              <tbody>

                <tr
                  v-for="student in studentResults"
                  :key="student.id"
                >

                  <td>
                    <strong>
                      {{ student.student_name }}
                    </strong>
                  </td>

                  <td>
                    {{ student.score }}
                  </td>

                  <td>
                    {{
                      formatPercentage(
                        student.percentage
                      )
                    }}
                  </td>

                  <td>
                    <span
                      class="result-badge"
                      :class="
                        student.result === 'Passed'
                          ? 'result-passed'
                          : 'result-failed'
                      "
                    >
                      {{ student.result }}
                    </span>
                  </td>

                  <td>
                    {{ student.tab_switches || 0 }}
                  </td>

                  <td>
                    {{
                      formatTime(
                        student.time_spent
                      )
                    }}
                  </td>

                  <td>
                    {{
                      formatDateTime(
                        student.submitted_at
                      )
                    }}
                  </td>

                </tr>

                <tr
                  v-if="studentResults.length === 0"
                >
                  <td
                    colspan="7"
                    class="empty"
                  >
                    No submitted student results.
                  </td>
                </tr>

              </tbody>

            </table>

          </div>

        </template>

      </div>

    </div>

  </div>
</template>


<script setup lang="ts">

import {
  computed,
  onMounted,
  ref
} from 'vue'

import api from '../../services/api'


interface Faculty {
  id: number
  name: string
  email: string | null
}


interface ExamResult {
  id: number
  title: string
  faculty: Faculty
  grade: string | null
  section: string | null
  subject: string | null
  passing: number
  students_count: number
  passed: number
  failed: number
  average_score: number
  average_percentage: number
  highest_score: number
  lowest_score: number
  created_at: string | null
}


interface StudentResult {
  id: number
  student_name: string
  score: number
  percentage: number
  result: string
  time_spent: number | null
  tab_switches: number | null
  idle_seconds: number | null
  started_at: string | null
  submitted_at: string | null
}


interface Summary {
  students_count: number
  passed: number
  failed: number
  average_score: number
  average_percentage: number
}


const results =
  ref<ExamResult[]>([])

const loading =
  ref(false)

const errorMessage =
  ref('')

const search =
  ref('')

const facultyFilter =
  ref('')

const subjectFilter =
  ref('')


const showResultsModal =
  ref(false)

const detailsLoading =
  ref(false)

const selectedExam =
  ref<ExamResult | null>(null)

const selectedSummary =
  ref<Summary | null>(null)

const studentResults =
  ref<StudentResult[]>([])


// ==========================================
// TOTALS
// ==========================================

const totalStudents =
  computed(() =>
    results.value.reduce(
      (total, exam) =>
        total +
        Number(exam.students_count || 0),
      0
    )
  )


const totalPassed =
  computed(() =>
    results.value.reduce(
      (total, exam) =>
        total +
        Number(exam.passed || 0),
      0
    )
  )


const totalFailed =
  computed(() =>
    results.value.reduce(
      (total, exam) =>
        total +
        Number(exam.failed || 0),
      0
    )
  )


// ==========================================
// FILTER OPTIONS
// ==========================================

const facultyOptions =
  computed(() => {

    const map =
      new Map<number, Faculty>()

    results.value.forEach(exam => {

      if (
        exam.faculty?.id !== null &&
        exam.faculty?.id !== undefined
      ) {
        map.set(
          exam.faculty.id,
          exam.faculty
        )
      }

    })

    return Array
      .from(map.values())
      .sort(
        (a, b) =>
          a.name.localeCompare(b.name)
      )

  })


const subjectOptions =
  computed(() => {

    const subjects =
      results.value
        .map(
          exam =>
            exam.subject?.trim()
        )
        .filter(
          (subject): subject is string =>
            Boolean(subject)
        )

    return [
      ...new Set(subjects)
    ].sort()

  })


// ==========================================
// FILTER RESULTS
// ==========================================

const filteredResults =
  computed(() => {

    const keyword =
      search.value
        .trim()
        .toLowerCase()

    return results.value.filter(exam => {

      const matchesSearch =
        !keyword ||
        exam.title
          ?.toLowerCase()
          .includes(keyword) ||
        exam.subject
          ?.toLowerCase()
          .includes(keyword) ||
        exam.grade
          ?.toLowerCase()
          .includes(keyword) ||
        exam.section
          ?.toLowerCase()
          .includes(keyword) ||
        exam.faculty?.name
          ?.toLowerCase()
          .includes(keyword)

      const matchesFaculty =
        !facultyFilter.value ||
        String(exam.faculty?.id) ===
          facultyFilter.value

      const matchesSubject =
        !subjectFilter.value ||
        exam.subject ===
          subjectFilter.value

      return (
        matchesSearch &&
        matchesFaculty &&
        matchesSubject
      )

    })

  })


const hasFilters =
  computed(() =>
    Boolean(
      search.value ||
      facultyFilter.value ||
      subjectFilter.value
    )
  )


// ==========================================
// FETCH OVERVIEW
// ==========================================

async function fetchResults() {

  loading.value = true
  errorMessage.value = ''

  try {

    const response =
      await api.get(
        '/admin/results'
      )

    results.value =
      response.data.data || []

  } catch (error: any) {

    console.error(
      'ADMIN RESULTS ERROR:',
      error
    )

    if (
      error.response?.status === 401
    ) {

      errorMessage.value =
        'Your session has expired.'

    } else if (
      error.response?.status === 403
    ) {

      errorMessage.value =
        'Administrator access required.'

    } else {

      errorMessage.value =
        'Failed to load examination results.'
    }

  } finally {

    loading.value = false

  }

}


// ==========================================
// VIEW ONE EXAM
// ==========================================

async function viewExamResults(
  examId: number
) {

  showResultsModal.value = true
  detailsLoading.value = true

  selectedExam.value = null
  selectedSummary.value = null
  studentResults.value = []

  try {

    const response =
      await api.get(
        `/admin/results/${examId}`
      )

    selectedExam.value =
      response.data.exam

    selectedSummary.value =
      response.data.summary

    studentResults.value =
      response.data.data || []

  } catch (error) {

    console.error(
      'RESULT DETAILS ERROR:',
      error
    )

    closeResultsModal()

    errorMessage.value =
      'Failed to load student results.'

  } finally {

    detailsLoading.value = false

  }

}


function closeResultsModal() {

  showResultsModal.value = false

  selectedExam.value = null
  selectedSummary.value = null
  studentResults.value = []

}


// ==========================================
// HELPERS
// ==========================================

function clearFilters() {

  search.value = ''
  facultyFilter.value = ''
  subjectFilter.value = ''

}


function getInitials(
  name?: string | null
) {

  if (!name) {
    return '?'
  }

  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(
      word =>
        word.charAt(0).toUpperCase()
    )
    .join('')

}


function formatPercentage(
  value: number | string | null
) {

  const number =
    Number(value || 0)

  return `${number.toFixed(2)}%`

}


function formatTime(
  seconds: number | null
) {

  if (
    seconds === null ||
    seconds === undefined
  ) {
    return '—'
  }

  const total =
    Number(seconds)

  const minutes =
    Math.floor(total / 60)

  const remaining =
    total % 60

  return `${minutes}m ${remaining}s`

}


function formatDateTime(
  date: string | null
) {

  if (!date) {
    return '—'
  }

  return new Date(date)
    .toLocaleString(
      'en-PH',
      {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
      }
    )

}


onMounted(() => {
  fetchResults()
})

</script>


<style scoped>

* {
  box-sizing: border-box;
}

.results-page {
  min-height: 100vh;
  padding: 28px;
  background: #f4fbf6;
  font-family: 'Poppins', sans-serif;
  color: #0f172a;
}


/* HEADER */

.page-header {
  margin-bottom: 22px;
}

.page-header h1 {
  margin: 0;
  font-size: 28px;
  font-weight: 800;
}

.page-header p {
  margin-top: 6px;
  color: #64748b;
  font-size: 14px;
}


/* STATS */

.stats {
  display: grid;
  grid-template-columns:
    repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  min-height: 90px;
  padding: 17px 18px;
  background: white;
  border: 1px solid #00d400;
  border-radius: 10px;

  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stat-card span {
  color: #475569;
  font-size: 14px;
}

.stat-card h2 {
  margin: 8px 0 0;
  font-size: 24px;
}

.stat-icon {
  width: 50px;
  height: 50px;
  border-radius: 9px;
  background: #dcfce7;

  display: flex;
  align-items: center;
  justify-content: center;

  font-size: 25px;
}


/* SECTION */

.results-section {
  padding: 24px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 14px;

  box-shadow:
    0 5px 18px
    rgba(15, 23, 42, .04);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 15px;
  margin-bottom: 20px;
}

.section-header h2 {
  margin: 0;
  font-size: 20px;
}

.section-header p {
  margin-top: 5px;
  color: #64748b;
  font-size: 12px;
}

.clear-btn {
  border: none;
  padding: 9px 14px;
  border-radius: 7px;
  background: #f1f5f9;
  color: #475569;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
}


/* FILTER */

.filters {
  display: grid;
  grid-template-columns:
    2fr 1fr 1fr;
  gap: 12px;

  margin-bottom: 22px;
  padding: 16px;

  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
}

.filter-group label {
  display: block;
  margin-bottom: 6px;
  color: #475569;
  font-size: 11px;
  font-weight: 700;
}

.filter-group input,
.filter-group select {
  width: 100%;
  height: 41px;
  padding: 0 11px;

  background: white;
  border: 1px solid #cbd5e1;
  border-radius: 7px;

  outline: none;
  font-size: 12px;
}

.filter-group input:focus,
.filter-group select:focus {
  border-color: #16a34a;

  box-shadow:
    0 0 0 3px
    rgba(22, 163, 74, .08);
}


/* TABLE */

.table-container,
.student-table {
  width: 100%;
  overflow-x: auto;
}

table {
  width: 100%;
  min-width: 1000px;
  border-collapse: collapse;
}

th {
  padding: 13px 12px;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;

  color: #475569;
  font-size: 11px;
  font-weight: 700;
  text-align: left;
  white-space: nowrap;
}

td {
  padding: 14px 12px;
  border-bottom: 1px solid #f1f5f9;

  color: #334155;
  font-size: 12px;
}

tbody tr:hover {
  background: #f8fff9;
}


/* EXAM */

.exam-info strong {
  display: block;
  color: #0f172a;
}

.exam-info small {
  display: block;
  margin-top: 4px;
  color: #94a3b8;
  font-size: 9px;
}


/* FACULTY */

.faculty-info {
  display: flex;
  align-items: center;
  gap: 9px;
  min-width: 170px;
}

.avatar {
  width: 35px;
  height: 35px;
  min-width: 35px;

  border-radius: 50%;
  background: #dcfce7;
  color: #15803d;

  display: flex;
  align-items: center;
  justify-content: center;

  font-size: 10px;
  font-weight: 800;
}

.faculty-info strong {
  display: block;
  color: #0f172a;
  font-size: 11px;
}

.faculty-info small {
  display: block;
  margin-top: 2px;
  color: #94a3b8;
  font-size: 9px;
}


/* COUNTS */

.count-badge {
  display: inline-flex;
  min-width: 30px;
  height: 27px;

  align-items: center;
  justify-content: center;

  padding: 0 8px;
  background: #f1f5f9;
  border-radius: 6px;
  font-weight: 700;
}

.passed-text {
  color: #15803d;
  font-weight: 800;
}

.failed-text {
  color: #dc2626;
  font-weight: 800;
}


/* VIEW */

.view-btn {
  border: none;
  padding: 8px 12px;

  background: #16a34a;
  color: white;

  border-radius: 6px;

  font-size: 10px;
  font-weight: 700;
  cursor: pointer;
}

.view-btn:hover {
  background: #15803d;
}


/* MODAL */

.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;

  padding: 25px;

  display: flex;
  align-items: center;
  justify-content: center;

  background:
    rgba(15, 23, 42, .55);

  backdrop-filter:
    blur(4px);
}

.results-modal {
  width: 1100px;
  max-width: 100%;
  max-height: 90vh;

  padding: 25px;

  background: white;
  border-radius: 16px;

  overflow-y: auto;

  box-shadow:
    0 20px 55px
    rgba(0, 0, 0, .25);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;

  margin-bottom: 20px;
}

.modal-header h2 {
  margin: 0;
  font-size: 21px;
}

.modal-header p {
  margin-top: 5px;
  color: #64748b;
  font-size: 12px;
}

.close-btn {
  border: none;
  background: transparent;
  color: #64748b;

  font-size: 28px;
  cursor: pointer;
}


/* MODAL STATS */

.modal-stats {
  display: grid;
  grid-template-columns:
    repeat(4, 1fr);

  gap: 12px;
  margin-bottom: 20px;
}

.mini-stat {
  padding: 14px;

  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
}

.mini-stat span {
  display: block;
  color: #64748b;
  font-size: 10px;
}

.mini-stat strong {
  display: block;
  margin-top: 5px;
  font-size: 18px;
}

.mini-stat.passed strong {
  color: #15803d;
}

.mini-stat.failed strong {
  color: #dc2626;
}


/* RESULT BADGE */

.result-badge {
  display: inline-block;

  padding: 5px 9px;
  border-radius: 20px;

  font-size: 9px;
  font-weight: 700;
}

.result-passed {
  background: #dcfce7;
  color: #15803d;
}

.result-failed {
  background: #fee2e2;
  color: #dc2626;
}


/* STATES */

.state-message {
  padding: 40px;
  text-align: center;
  color: #64748b;
}

.error-box {
  display: flex;
  justify-content: space-between;
  align-items: center;

  padding: 14px;

  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;

  color: #dc2626;
}

.error-box button {
  border: none;
  padding: 7px 12px;

  background: #dc2626;
  color: white;

  border-radius: 6px;
  cursor: pointer;
}

.empty {
  padding: 40px;
  text-align: center;
  color: #94a3b8;
}

.empty-content {
  text-align: center;
}

.empty-icon {
  margin-bottom: 8px;
  font-size: 30px;
}

.empty-content strong {
  display: block;
  color: #475569;
}

.empty-content p {
  font-size: 11px;
}


/* RESPONSIVE */

@media(max-width: 1000px) {

  .stats {
    grid-template-columns:
      repeat(2, 1fr);
  }

  .filters {
    grid-template-columns:
      1fr;
  }

  .modal-stats {
    grid-template-columns:
      repeat(2, 1fr);
  }
}

@media(max-width: 600px) {

  .results-page {
    padding: 18px;
  }

  .stats,
  .modal-stats {
    grid-template-columns:
      1fr;
  }

  .modal-overlay {
    padding: 10px;
  }

}

</style>
