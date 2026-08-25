<template>
  <div class="exam-page">

    <!-- HEADER -->
    <div class="page-header">
      <div>
        <h1>Examination Overview</h1>
        <p>
          View and monitor examinations created by all faculty.
        </p>
      </div>
    </div>


    <!-- STAT CARDS -->
    <div class="stats">

      <div class="stat-card">
        <div>
          <span>Total Exams</span>
          <h2>{{ exams.length }}</h2>
        </div>

        <div class="stat-icon">
          📝
        </div>
      </div>


      <div class="stat-card">
        <div>
          <span>Total Questions</span>
          <h2>{{ totalQuestions }}</h2>
        </div>

        <div class="stat-icon">
          📋
        </div>
      </div>


      <div class="stat-card">
        <div>
          <span>Total Examinees</span>
          <h2>{{ totalExaminees }}</h2>
        </div>

        <div class="stat-icon">
          👥
        </div>
      </div>


      <div class="stat-card">
        <div>
          <span>Faculty with Exams</span>
          <h2>{{ facultyCount }}</h2>
        </div>

        <div class="stat-icon">
          👨‍🏫
        </div>
      </div>

    </div>


    <!-- MAIN SECTION -->
    <div class="exam-section">

      <!-- SECTION HEADER -->
      <div class="section-header">

        <div>
          <h2>All Examinations</h2>

          <p>
            {{ filteredExams.length }}
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

        <!-- SEARCH -->
        <div class="filter-group search-group">

          <label>
            Search
          </label>

          <input
            v-model="search"
            type="text"
            placeholder="Search exam, subject, faculty..."
          />

        </div>


        <!-- FACULTY -->
        <div class="filter-group">

          <label>
            Faculty
          </label>

          <select v-model="facultyFilter">

            <option value="">
              All Faculty
            </option>

            <option
              v-for="faculty in facultyOptions"
              :key="faculty.id"
              :value="String(faculty.id)"
            >
              {{ faculty.name }}
            </option>

          </select>

        </div>


        <!-- SUBJECT -->
        <div class="filter-group">

          <label>
            Subject
          </label>

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


        <!-- STATUS -->
        <div class="filter-group">

          <label>
            Status
          </label>

          <select v-model="statusFilter">

            <option value="">
              All Status
            </option>

            <option
              v-for="status in statusOptions"
              :key="status"
              :value="status"
            >
              {{ formatStatus(status) }}
            </option>

          </select>

        </div>

      </div>


      <!-- LOADING -->
      <div
        v-if="loading"
        class="state-message"
      >
        Loading examinations...
      </div>


      <!-- ERROR -->
      <div
        v-else-if="errorMessage"
        class="error-box"
      >
        <span>
          {{ errorMessage }}
        </span>

        <button @click="fetchExams">
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
              <th>Grade / Section</th>
              <th>Status</th>
              <th>Questions</th>
              <th>Examinees</th>
              <th>Created</th>
            </tr>
          </thead>


          <tbody>

            <tr
              v-for="exam in filteredExams"
              :key="exam.id"
            >

              <!-- EXAM -->
              <td>
                <div class="exam-info">

                  <div class="exam-icon">
                    📝
                  </div>

                  <div>

                    <strong>
                      {{ exam.title }}
                    </strong>

                    <small>
                      Exam ID: {{ exam.id }}
                    </small>

                  </div>

                </div>
              </td>


              <!-- FACULTY -->
              <td>
                <div class="faculty-info">

                  <div class="faculty-avatar">
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


              <!-- SUBJECT -->
              <td>
                {{
                  exam.subject ||
                  '—'
                }}
              </td>


              <!-- GRADE / SECTION -->
              <td>
                <div class="grade-section">

                  <span>
                    {{
                      exam.grade ||
                      '—'
                    }}
                  </span>

                  <small
                    v-if="exam.section"
                  >
                    {{ exam.section }}
                  </small>

                </div>
              </td>


              <!-- STATUS -->
              <td>

                <span
                  class="status-badge"
                  :class="
                    statusClass(
                      exam.status
                    )
                  "
                >
                  {{
                    formatStatus(
                      exam.status
                    )
                  }}
                </span>

              </td>


              <!-- QUESTIONS -->
              <td>
                <span class="count-badge">
                  {{ exam.questions_count }}
                </span>
              </td>


              <!-- EXAMINEES -->
              <td>
                <span class="count-badge">
                  {{ exam.students_count }}
                </span>
              </td>


              <!-- CREATED -->
              <td>
                {{ formatDate(exam.created_at) }}
              </td>

            </tr>


            <!-- EMPTY -->
            <tr
              v-if="filteredExams.length === 0"
            >
              <td
                colspan="8"
                class="empty"
              >

                <div class="empty-content">

                  <div class="empty-icon">
                    📭
                  </div>

                  <strong>
                    No examinations found
                  </strong>

                  <p>
                    Try changing your search
                    or filters.
                  </p>

                </div>

              </td>
            </tr>

          </tbody>

        </table>

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


// ==========================================
// TYPES
// ==========================================

interface Faculty {
  id: number | null
  name: string
  email: string | null
}


interface Exam {
  id: number
  title: string
  description: string | null

  faculty: Faculty

  grade: string | null
  section: string | null
  subject: string | null

  duration: number | null
  passing: number | null

  access_code: string | null

  status: string | null

  questions_count: number
  students_count: number

  created_at: string | null
}


// ==========================================
// STATE
// ==========================================

const exams =
  ref<Exam[]>([])

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

const statusFilter =
  ref('')


// ==========================================
// DASHBOARD COUNTS
// ==========================================

const totalQuestions =
  computed(() => {

    return exams.value.reduce(
      (total, exam) =>
        total +
        Number(
          exam.questions_count || 0
        ),
      0
    )

  })


const totalExaminees =
  computed(() => {

    return exams.value.reduce(
      (total, exam) =>
        total +
        Number(
          exam.students_count || 0
        ),
      0
    )

  })


const facultyCount =
  computed(() => {

    const ids =
      exams.value
        .map(
          exam =>
            exam.faculty?.id
        )
        .filter(
          id =>
            id !== null &&
            id !== undefined
        )

    return new Set(ids).size

  })


// ==========================================
// FILTER OPTIONS
// ==========================================

const facultyOptions =
  computed(() => {

    const map =
      new Map<number, Faculty>()


    exams.value.forEach(
      exam => {

        if (
          exam.faculty?.id !== null &&
          exam.faculty?.id !== undefined
        ) {

          map.set(
            exam.faculty.id,
            exam.faculty
          )

        }

      }
    )


    return Array
      .from(map.values())
      .sort(
        (a, b) =>
          a.name.localeCompare(
            b.name
          )
      )

  })


const subjectOptions =
  computed(() => {

    const subjects =
      exams.value
        .map(
          exam =>
            exam.subject?.trim()
        )
        .filter(
          (
            subject
          ): subject is string =>
            Boolean(subject)
        )


    return [
      ...new Set(subjects)
    ].sort()

  })


const statusOptions =
  computed(() => {

    const statuses =
      exams.value
        .map(
          exam =>
            exam.status
              ?.trim()
              .toLowerCase()
        )
        .filter(
          (
            status
          ): status is string =>
            Boolean(status)
        )


    return [
      ...new Set(statuses)
    ].sort()

  })


// ==========================================
// FILTERED EXAMS
// ==========================================

const filteredExams =
  computed(() => {

    const keyword =
      search.value
        .trim()
        .toLowerCase()


    return exams.value.filter(
      exam => {

        // SEARCH
        const matchesSearch =
          !keyword
          ||
          exam.title
            ?.toLowerCase()
            .includes(keyword)
          ||
          exam.subject
            ?.toLowerCase()
            .includes(keyword)
          ||
          exam.grade
            ?.toLowerCase()
            .includes(keyword)
          ||
          exam.section
            ?.toLowerCase()
            .includes(keyword)
          ||
          exam.faculty?.name
            ?.toLowerCase()
            .includes(keyword)
          ||
          exam.faculty?.email
            ?.toLowerCase()
            .includes(keyword)


        // FACULTY
        const matchesFaculty =
          !facultyFilter.value
          ||
          String(
            exam.faculty?.id
          ) ===
          facultyFilter.value


        // SUBJECT
        const matchesSubject =
          !subjectFilter.value
          ||
          exam.subject ===
          subjectFilter.value


        // STATUS
        const matchesStatus =
          !statusFilter.value
          ||
          exam.status
            ?.toLowerCase() ===
          statusFilter.value


        return (
          matchesSearch &&
          matchesFaculty &&
          matchesSubject &&
          matchesStatus
        )

      }
    )

  })


// ==========================================
// HAS FILTERS
// ==========================================

const hasFilters =
  computed(() => {

    return Boolean(
      search.value ||
      facultyFilter.value ||
      subjectFilter.value ||
      statusFilter.value
    )

  })


// ==========================================
// FETCH EXAMS
// ==========================================

async function fetchExams() {

  loading.value = true

  errorMessage.value = ''


  try {

    const response =
      await api.get(
        '/admin/exams'
      )


    exams.value =
      response.data.data || []


  } catch (error: any) {

    console.error(
      'ADMIN EXAMS ERROR:',
      error
    )


    if (
      error.response?.status === 401
    ) {

      errorMessage.value =
        'Your session has expired. Please login again.'

    } else if (
      error.response?.status === 403
    ) {

      errorMessage.value =
        'Administrator access required.'

    } else {

      errorMessage.value =
        'Failed to load examinations.'
    }


  } finally {

    loading.value = false

  }

}


// ==========================================
// CLEAR FILTERS
// ==========================================

function clearFilters() {

  search.value = ''

  facultyFilter.value = ''

  subjectFilter.value = ''

  statusFilter.value = ''

}


// ==========================================
// HELPERS
// ==========================================

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
        word
          .charAt(0)
          .toUpperCase()
    )
    .join('')

}


function formatDate(
  date: string | null
) {

  if (!date) {
    return '—'
  }


  return new Date(
    date
  ).toLocaleDateString(
    'en-PH',
    {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }
  )

}


function formatStatus(
  status?: string | null
) {

  if (!status) {
    return 'Unknown'
  }


  return status
    .replace(
      /_/g,
      ' '
    )
    .replace(
      /\b\w/g,
      letter =>
        letter.toUpperCase()
    )

}


function statusClass(
  status?: string | null
) {

  const value =
    status
      ?.toLowerCase()
      .trim()


  if (
    value === 'active' ||
    value === 'ongoing' ||
    value === 'published'
  ) {

    return 'status-active'

  }


  if (
    value === 'finished' ||
    value === 'completed' ||
    value === 'submitted'
  ) {

    return 'status-completed'

  }


  if (
    value === 'draft'
  ) {

    return 'status-draft'

  }


  if (
    value === 'inactive' ||
    value === 'closed'
  ) {

    return 'status-inactive'

  }


  return 'status-default'

}


// ==========================================
// MOUNT
// ==========================================

onMounted(() => {

  fetchExams()

})

</script>


<style scoped>

* {
  box-sizing: border-box;
}


/* ==========================================
   PAGE
========================================== */

.exam-page {
  min-height: 100vh;

  padding: 28px;

  background: #f4fbf6;

  font-family:
    'Poppins',
    sans-serif;

  color: #0f172a;
}


/* ==========================================
   HEADER
========================================== */

.page-header {
  display: flex;

  justify-content:
    space-between;

  align-items: center;

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


/* ==========================================
   STATS
========================================== */

.stats {
  display: grid;

  grid-template-columns:
    repeat(4, 1fr);

  gap: 16px;

  margin-bottom: 24px;
}


.stat-card {
  min-height: 90px;

  background: white;

  border:
    1px solid #00d400;

  border-radius: 10px;

  padding: 17px 18px;

  display: flex;

  justify-content:
    space-between;

  align-items: center;

  transition: .2s;
}


.stat-card:hover {
  transform:
    translateY(-2px);

  box-shadow:
    0 8px 20px
    rgba(15, 23, 42, .07);
}


.stat-card span {
  color: #475569;

  font-size: 14px;
}


.stat-card h2 {
  margin: 9px 0 0;

  color: #0f172a;

  font-size: 24px;
}


.stat-icon {
  width: 50px;
  height: 50px;

  background: #dcfce7;

  border-radius: 9px;

  display: flex;

  align-items: center;

  justify-content: center;

  font-size: 27px;
}


/* ==========================================
   EXAM SECTION
========================================== */

.exam-section {
  background: white;

  border:
    1px solid #e2e8f0;

  border-radius: 14px;

  padding: 24px;

  box-shadow:
    0 5px 18px
    rgba(15, 23, 42, .04);
}


/* ==========================================
   SECTION HEADER
========================================== */

.section-header {
  display: flex;

  justify-content:
    space-between;

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

  background: #f1f5f9;

  color: #475569;

  padding:
    9px 14px;

  border-radius: 7px;

  font-size: 11px;

  font-weight: 700;

  cursor: pointer;
}


.clear-btn:hover {
  background: #e2e8f0;
}


/* ==========================================
   FILTERS
========================================== */

.filters {
  display: grid;

  grid-template-columns:
    2fr 1fr 1fr 1fr;

  gap: 12px;

  margin-bottom: 22px;

  padding: 16px;

  background: #f8fafc;

  border-radius: 10px;

  border:
    1px solid #e2e8f0;
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

  padding:
    0 11px;

  background: white;

  border:
    1px solid #cbd5e1;

  border-radius: 7px;

  outline: none;

  color: #334155;

  font-size: 12px;
}


.filter-group input:focus,
.filter-group select:focus {
  border-color: #16a34a;

  box-shadow:
    0 0 0 3px
    rgba(22, 163, 74, .08);
}


/* ==========================================
   TABLE
========================================== */

.table-container {
  width: 100%;

  overflow-x: auto;
}


table {
  width: 100%;

  border-collapse:
    collapse;

  min-width: 1050px;
}


th {
  padding:
    13px 12px;

  background: #f8fafc;

  border-bottom:
    1px solid #e2e8f0;

  color: #475569;

  font-size: 11px;

  font-weight: 700;

  text-align: left;

  white-space: nowrap;
}


td {
  padding:
    14px 12px;

  border-bottom:
    1px solid #f1f5f9;

  color: #334155;

  font-size: 12px;

  vertical-align: middle;
}


tbody tr {
  transition: .15s;
}


tbody tr:hover {
  background: #f8fff9;
}


/* ==========================================
   EXAM
========================================== */

.exam-info {
  display: flex;

  align-items: center;

  gap: 10px;

  min-width: 190px;
}


.exam-icon {
  width: 39px;
  height: 39px;

  min-width: 39px;

  display: flex;

  align-items: center;

  justify-content: center;

  background: #dcfce7;

  border-radius: 8px;

  font-size: 19px;
}


.exam-info strong {
  display: block;

  max-width: 220px;

  color: #0f172a;

  font-size: 12px;

  overflow: hidden;

  text-overflow: ellipsis;

  white-space: nowrap;
}


.exam-info small {
  display: block;

  margin-top: 3px;

  color: #94a3b8;

  font-size: 9px;
}


/* ==========================================
   FACULTY
========================================== */

.faculty-info {
  display: flex;

  align-items: center;

  gap: 9px;

  min-width: 180px;
}


.faculty-avatar {
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

  max-width: 160px;

  margin-top: 2px;

  color: #94a3b8;

  font-size: 9px;

  overflow: hidden;

  text-overflow: ellipsis;

  white-space: nowrap;
}


/* ==========================================
   GRADE
========================================== */

.grade-section span {
  display: block;

  color: #334155;

  font-weight: 600;
}


.grade-section small {
  display: block;

  margin-top: 3px;

  color: #94a3b8;

  font-size: 9px;
}


/* ==========================================
   STATUS
========================================== */

.status-badge {
  display: inline-block;

  padding:
    5px 9px;

  border-radius: 20px;

  font-size: 9px;

  font-weight: 700;

  white-space: nowrap;
}


.status-active {
  background: #dcfce7;

  color: #15803d;
}


.status-completed {
  background: #dbeafe;

  color: #1d4ed8;
}


.status-draft {
  background: #fef3c7;

  color: #b45309;
}


.status-inactive {
  background: #fee2e2;

  color: #dc2626;
}


.status-default {
  background: #f1f5f9;

  color: #475569;
}


/* ==========================================
   COUNTS
========================================== */

.count-badge {
  display: inline-flex;

  min-width: 31px;
  height: 27px;

  padding:
    0 8px;

  align-items: center;

  justify-content: center;

  background: #f1f5f9;

  border-radius: 6px;

  color: #334155;

  font-weight: 700;
}


/* ==========================================
   EMPTY / ERROR
========================================== */

.state-message {
  padding: 40px;

  text-align: center;

  color: #64748b;

  font-size: 13px;
}


.empty {
  padding: 50px;
}


.empty-content {
  text-align: center;

  color: #64748b;
}


.empty-icon {
  margin-bottom: 10px;

  font-size: 35px;
}


.empty-content strong {
  display: block;

  color: #334155;

  margin-bottom: 4px;
}


.empty-content p {
  margin: 0;

  font-size: 11px;
}


.error-box {
  display: flex;

  justify-content:
    space-between;

  align-items: center;

  gap: 15px;

  padding: 14px;

  background: #fef2f2;

  border:
    1px solid #fecaca;

  border-radius: 8px;

  color: #dc2626;

  font-size: 12px;
}


.error-box button {
  border: none;

  background: #dc2626;

  color: white;

  padding:
    7px 12px;

  border-radius: 6px;

  cursor: pointer;

  font-weight: 600;
}


/* ==========================================
   RESPONSIVE
========================================== */

@media(max-width: 1100px) {

  .stats {
    grid-template-columns:
      repeat(2, 1fr);
  }


  .filters {
    grid-template-columns:
      repeat(2, 1fr);
  }

}


@media(max-width: 700px) {

  .exam-page {
    padding: 18px;
  }


  .stats,
  .filters {
    grid-template-columns:
      1fr;
  }


  .section-header {
    flex-direction: column;

    align-items:
      flex-start;
  }

}

</style>
