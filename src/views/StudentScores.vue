<template>
  <div class="student-scores-page">

    <!-- ================= PAGE HEADER ================= -->

    <div class="page-header">

      <div>
        <h1>
          {{ exam?.title || 'Student Scores' }}
        </h1>
      </div>

      <button
        class="back-btn"
        @click="router.push('/faculty/exam-results')"
      >
        ← Back
      </button>

    </div>


    <!-- ================= LOADING ================= -->

    <div
      v-if="loading"
      class="message-card"
    >
      Loading student scores...
    </div>


    <!-- ================= ERROR ================= -->

    <div
      v-else-if="errorMessage"
      class="message-card error-card"
    >
      {{ errorMessage }}
    </div>


    <!-- ================= CONTENT ================= -->

    <template v-else>

      <!-- ================= SUMMARY ================= -->

      <div
        v-if="summary"
        class="summary-grid"
      >

        <div class="summary-card">
          <span>Total Examinees</span>

          <strong>
            {{ summary.students_count }}
          </strong>
        </div>


        <div class="summary-card">
          <span>Average Score</span>

          <strong>
            {{ summary.average_score }}
          </strong>
        </div>


        <div class="summary-card">
          <span>Average Percentage</span>

          <strong>
            {{ summary.average_percentage }}%
          </strong>
        </div>


        <div class="summary-card">
          <span>Highest Score</span>

          <strong>
            {{ summary.highest_score }}
          </strong>
        </div>


        <div class="summary-card">
          <span>Lowest Score</span>

          <strong>
            {{ summary.lowest_score }}
          </strong>
        </div>


        <div class="summary-card passed-card">
          <span>Passed</span>

          <strong>
            {{ summary.passed }}
          </strong>
        </div>


        <div class="summary-card failed-card">
          <span>Failed</span>

          <strong>
            {{ summary.failed }}
          </strong>
        </div>

      </div>


      <!-- ================= NO STUDENTS ================= -->

      <div
        v-if="students.length === 0"
        class="message-card"
      >

        <h2>
          No submitted results
        </h2>

        <p>
          Student scores will appear here after they submit the exam.
        </p>

      </div>


      <!-- ================= STUDENT TABLE ================= -->

      <div
        v-else
        class="table-card"
      >

        <!-- TABLE HEADER -->

        <div class="table-header">

          <div>
            <h2>
              Student Results
            </h2>

            <p>
              {{ students.length }}
              submitted examination result(s)
            </p>
          </div>


          <!-- SEARCH + EXPORT -->

          <div class="table-actions">

            <input
              v-model="search"
              type="text"
              placeholder="Search student..."
              class="search-input"
            />

            <button
              class="export-btn"
              @click="exportToExcel"
            >
              📥 Export Excel
            </button>

          </div>

        </div>


        <!-- ================= TABLE ================= -->

        <div class="table-wrapper">

          <table>

            <thead>

              <tr>
                <th>No.</th>
                <th>Student Name</th>
                <th>Score</th>
                <th>Percentage</th>
                <th>Status</th>
                <th>Tab Switches</th>
                <th>Idle Time</th>
                <th>Time Spent</th>
                <th>Submitted</th>
              </tr>

            </thead>


            <tbody>

              <tr
                v-for="(student, index) in filteredStudents"
                :key="student.id"
              >

                <td>
                  {{ index + 1 }}
                </td>


                <td class="student-name">
                  {{ student.student_name }}
                </td>


                <td>
                  {{ student.score }}
                </td>


                <td>
                  {{ student.percentage }}%
                </td>


                <td>

                  <span
                    :class="[
                      'status-badge',
                      student.passed
                        ? 'passed'
                        : 'failed'
                    ]"
                  >
                    {{
                      student.passed
                        ? 'Passed'
                        : 'Failed'
                    }}
                  </span>

                </td>


                <td>
                  {{ student.tab_switches ?? 0 }}
                </td>


                <td>
                  {{
                    formatSeconds(
                      student.idle_seconds
                    )
                  }}
                </td>


                <td>
                  {{
                    formatSeconds(
                      student.time_spent
                    )
                  }}
                </td>


                <td>
                  {{
                    formatDate(
                      student.submitted_at
                    )
                  }}
                </td>

              </tr>


              <!-- NO SEARCH RESULT -->

              <tr
                v-if="filteredStudents.length === 0"
              >
                <td
                  colspan="10"
                  class="no-search-results"
                >
                  No student found.
                </td>
              </tr>

            </tbody>

          </table>

        </div>

      </div>

    </template>

  </div>
</template>


<script setup lang="ts">

import {ref,computed,onMounted
} from 'vue'


import {useRoute,useRouter} from 'vue-router'


import api from '../services/api'


import * as XLSX from 'xlsx'


/* ================= ROUTER ================= */

const route = useRoute()

const router = useRouter()


/* ================= INTERFACES ================= */

interface ExamInfo {

  id: number

  title: string

  description: string | null

  course: string | null

  access_code: string

  passing: number

}


interface Summary {

  students_count: number

  highest_score: number

  lowest_score: number

  average_score: number

  average_percentage: number

  passed: number

  failed: number

}


interface StudentResult {

  id: number

  student_name: string

  score: number

  percentage: number

  passed: boolean

  started_at: string | null

  submitted_at: string | null

  time_spent: number | null

  tab_switches: number | null

  idle_seconds: number | null

  status: string

}


/* ================= STATE ================= */

const exam =
  ref<ExamInfo | null>(null)


const summary =
  ref<Summary | null>(null)


const students =
  ref<StudentResult[]>([])


const loading =
  ref(true)


const errorMessage =
  ref('')


const search =
  ref('')


/* ================= SEARCH ================= */

const filteredStudents =
  computed(() => {

    const keyword =
      search.value
        .trim()
        .toLowerCase()


    if (!keyword) {

      return students.value

    }


    return students.value.filter(
      student =>

        student.student_name
          ?.toLowerCase()
          .includes(keyword)

    )

  })


/* ================= ON MOUNT ================= */

onMounted(() => {

  loadStudentScores()

})


/* ================= LOAD STUDENT SCORES ================= */

async function loadStudentScores() {

  loading.value = true

  errorMessage.value = ''


  try {

    const examId =
      route.params.examId


    const token =
      localStorage.getItem('token')


    const response =
      await api.get(
        `/faculty/exam-results/${examId}`,
        {

          headers: {

            Authorization:
              `Bearer ${token}`,

            Accept:
              'application/json'

          }

        }

      )


    exam.value =
      response.data.exam


    summary.value =
      response.data.summary


    students.value =
      response.data.data

  }


  catch (error) {

    console.error(

      'Failed to load student scores:',

      error

    )


    errorMessage.value =
      'Failed to load student examination results.'

  }


  finally {

    loading.value = false

  }

}

/* ================= EXPORT TO EXCEL ================= */

function exportToExcel() {

  if (students.value.length === 0) {

    alert(
      'There are no student results to export.'
    )

    return

  }


  /*
   * Export ALL students.
   * Search filtering does not affect the Excel export.
   */

  const excelData =
    students.value.map(
      (student, index) => {

        return {

          'No.':
            index + 1,


          'Student Name':
            student.student_name,


          'Score':
            student.score,


          'Percentage':
            `${student.percentage}%`,


          'Status':
            student.passed
              ? 'Passed'
              : 'Failed',


          'Tab Switches':
            student.tab_switches ?? 0,


          'Idle Time':
            formatSeconds(
              student.idle_seconds
            ),


          'Time Spent':
            formatSeconds(
              student.time_spent
            ),


          'Submitted At':
            formatDate(
              student.submitted_at
            )

        }

      }
    )


  /*
   * Convert the array into an Excel worksheet
   */

  const worksheet =
    XLSX.utils.json_to_sheet(
      excelData
    )


  /*
   * Set Excel column widths
   */

  worksheet['!cols'] = [

    {
      wch: 6
    },

    {
      wch: 30
    },

    {
      wch: 12
    },

    {
      wch: 15
    },

    {
      wch: 12
    },

    {
      wch: 15
    },

    {
      wch: 15
    },

    {
      wch: 15
    },

    {
      wch: 28
    }

  ]


  /*
   * Create Excel workbook
   */

  const workbook =
    XLSX.utils.book_new()


  /*
   * Add worksheet
   */

  XLSX.utils.book_append_sheet(

    workbook,

    worksheet,

    'Student Scores'

  )


  /*
   * Create safe filename
   */

  const examTitle =

    exam.value?.title

      ?.replace(

        /[\\/:*?"<>|]/g,

        '-'

      )

    || 'Exam'


  /*
   * Download Excel file
   */

  XLSX.writeFile(

    workbook,

    `${examTitle}-Student-Scores.xlsx`

  )

}


/* ================= FORMAT SECONDS ================= */

function formatSeconds(
  seconds: number | null
) {

  if (!seconds) {

    return '0s'

  }


  const minutes =
    Math.floor(
      seconds / 60
    )


  const remainingSeconds =
    seconds % 60


  if (minutes === 0) {

    return `${remainingSeconds}s`

  }


  if (minutes < 60) {

    return `${minutes}m ${remainingSeconds}s`

  }


  const hours =
    Math.floor(
      minutes / 60
    )


  const remainingMinutes =
    minutes % 60


  return `${hours}h ${remainingMinutes}m ${remainingSeconds}s`

}


/* ================= FORMAT DATE ================= */

function formatDate(
  date: string | null
) {

  if (!date) {

    return '-'

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

</script>


<style scoped>

/* ================= PAGE ================= */

.student-scores-page {

  width: 100%;

}


/* ================= HEADER ================= */

.page-header {

  display: flex;

  justify-content: space-between;

  align-items: center;

  margin-bottom: 25px;

}


.page-header h1 {

  color: #111827;

  margin-bottom: 5px;

}


.page-header p {

  color: #6b7280;

}


/* ================= BACK BUTTON ================= */

.back-btn {

  border: none;

  background: #e5e7eb;

  color: #374151;

  padding: 10px 18px;

  border-radius: 8px;

  font-weight: 600;

  cursor: pointer;

  transition: .2s ease;

}


.back-btn:hover {

  background: #d1d5db;

  transform: translateY(-1px);

}


/* ================= SUMMARY ================= */

.summary-grid {

  display: grid;

  grid-template-columns:
    repeat(
      4,
      minmax(0, 1fr)
    );

  gap: 15px;

  margin-bottom: 25px;

}


.summary-card {

  background: white;

  border-radius: 12px;

  padding: 18px;

  border:
    1px solid #e5e7eb;

  box-shadow:
    0 3px 12px
    rgba(0, 0, 0, .05);

}


.summary-card span {

  display: block;

  color: #6b7280;

  font-size: 13px;

  margin-bottom: 6px;

}


.summary-card strong {

  color: #111827;

  font-size: 24px;

}


.passed-card strong {

  color: #16a34a;

}


.failed-card strong {

  color: #dc2626;

}


/* ================= TABLE CARD ================= */

.table-card {

  background: white;

  border-radius: 14px;

  overflow: hidden;

  box-shadow:
    0 4px 15px
    rgba(0, 0, 0, .08);

}


/* ================= TABLE HEADER ================= */

.table-header {

  display: flex;

  justify-content: space-between;

  align-items: center;

  gap: 20px;

  padding: 22px;

  border-bottom:
    1px solid #e5e7eb;

}


.table-header h2 {

  color: #111827;

  margin-bottom: 4px;

}


.table-header p {

  color: #6b7280;

  font-size: 13px;

}


/* ================= TABLE ACTIONS ================= */

.table-actions {

  display: flex;

  align-items: center;

  gap: 10px;

}


/* ================= SEARCH ================= */

.search-input {

  width: 230px;

  padding: 10px 13px;

  border:
    1px solid #d1d5db;

  border-radius: 8px;

  outline: none;

  font-size: 13px;

  transition: .2s ease;

}


.search-input:focus {

  border-color: #00c853;

  box-shadow:
    0 0 0 3px
    rgba(0, 200, 83, .10);

}


/* ================= EXPORT BUTTON ================= */

.export-btn {

  border: none;

  background: #16a34a;

  color: white;

  padding: 10px 16px;

  border-radius: 8px;

  cursor: pointer;

  font-size: 13px;

  font-weight: 600;

  white-space: nowrap;

  transition:
    background .2s ease,
    transform .2s ease,
    box-shadow .2s ease;

}


.export-btn:hover {

  background: #15803d;

  transform:
    translateY(-1px);

  box-shadow:
    0 5px 12px
    rgba(22, 163, 74, .25);

}


/* ================= TABLE ================= */

.table-wrapper {

  width: 100%;

  overflow-x: auto;

}


table {

  width: 100%;

  border-collapse: collapse;

  min-width: 1100px;

}


th {

  background: #f9fafb;

  color: #4b5563;

  font-size: 12px;

  text-align: left;

  padding: 14px 16px;

  border-bottom:
    1px solid #e5e7eb;

}


td {

  padding: 15px 16px;

  color: #374151;

  font-size: 13px;

  border-bottom:
    1px solid #f3f4f6;

}


tbody tr:hover {

  background: #f9fafb;

}


.student-name {

  color: #111827;

  font-weight: 600;

}


/* ================= STATUS ================= */

.status-badge {

  display: inline-block;

  padding: 5px 10px;

  border-radius: 20px;

  font-size: 12px;

  font-weight: 700;

}


.status-badge.passed {

  background: #dcfce7;

  color: #15803d;

}


.status-badge.failed {

  background: #fee2e2;

  color: #b91c1c;

}


/* ================= VIEW BUTTON ================= */

.view-btn {

  border: none;

  background: #00c853;

  color: white;

  padding: 8px 12px;

  border-radius: 7px;

  cursor: pointer;

  font-size: 12px;

  font-weight: 600;

  white-space: nowrap;

  transition: .2s ease;

}


.view-btn:hover {

  background: #00b548;

  transform:
    translateY(-1px);

}


/* ================= MESSAGE ================= */

.message-card {

  background: white;

  padding: 35px;

  border-radius: 12px;

  text-align: center;

  color: #6b7280;

  box-shadow:
    0 4px 15px
    rgba(0, 0, 0, .06);

}


.message-card h2 {

  color: #111827;

  margin-bottom: 8px;

}


.error-card {

  color: #dc2626;

  border-left:
    4px solid #dc2626;

}


.no-search-results {

  text-align: center;

  color: #6b7280;

  padding: 30px;

}


/* ================= RESPONSIVE ================= */

@media(max-width: 1100px) {

  .summary-grid {

    grid-template-columns:
      repeat(
        2,
        1fr
      );

  }

}


@media(max-width: 700px) {

  .page-header {

    flex-direction: column;

    align-items: flex-start;

    gap: 15px;

  }


  .summary-grid {

    grid-template-columns:
      1fr;

  }


  .table-header {

    flex-direction: column;

    align-items: flex-start;

    gap: 15px;

  }


  .table-actions {

    width: 100%;

    flex-direction: column;

  }


  .search-input {

    width: 100%;

  }


  .export-btn {

    width: 100%;

  }


  .back-btn {

    width: 100%;

  }

}

</style>
