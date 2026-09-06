<template>
  <div class="student-scores-page">
    <!-- ================= PAGE HEADER ================= -->
    <div class="page-header">
      <div>
        <h1>
          {{ exam?.title || 'Student Scores' }}
        </h1>
        <p>
          View individual student scores and examination performance.
        </p>
      </div>
      <button
        class="back-btn"
        @click="router.push('/faculty/exam-results')"
      >
        <ArrowLeft :size="18" />
        <span>Back</span>
      </button>
    </div>
    <!-- ================= LOADING ================= -->
    <div
      v-if="loading"
      class="message-card"
    >
      <LoaderCircle
        :size="32"
        class="loading-icon"
      />
      <h2>Loading student scores...</h2>
    </div>
    <!-- ================= ERROR ================= -->
    <div
      v-else-if="errorMessage"
      class="message-card error-card"
    >
      <CircleAlert :size="34" />
      <h2>Unable to load student scores</h2>
      <p>
        {{ errorMessage }}
      </p>
    </div>
    <!-- ================= CONTENT ================= -->
    <template v-else>
      <!-- ================= SUMMARY ================= -->
      <div
        v-if="summary"
        class="summary-grid"
      >
        <!-- TOTAL EXAMINEES -->
        <div class="summary-card">
          <div class="summary-content">
            <span>Total Examinees</span>
            <strong>
              {{ summary.students_count }}
            </strong>
          </div>
          <div class="summary-icon">
            <Users :size="23" />
          </div>
        </div>
        <!-- AVERAGE SCORE -->
        <div class="summary-card">
          <div class="summary-content">
            <span>Average Score</span>
            <strong>
              {{ summary.average_score }}
            </strong>
          </div>
          <div class="summary-icon">
            <ChartNoAxesColumnIncreasing :size="23" />
          </div>
        </div>
        <!-- AVERAGE PERCENTAGE -->
        <div class="summary-card">
          <div class="summary-content">
            <span>Average Percentage</span>
            <strong>
              {{ summary.average_percentage }}%
            </strong>
          </div>
          <div class="summary-icon">
            <Percent :size="23" />
          </div>
        </div>
        <!-- HIGHEST -->
        <div class="summary-card">
          <div class="summary-content">
            <span>Highest Score</span>
            <strong>
              {{ summary.highest_score }}
            </strong>
          </div>
          <div class="summary-icon">
            <Trophy :size="23" />
          </div>
        </div>
        <!-- LOWEST -->
        <div class="summary-card">
          <div class="summary-content">
            <span>Lowest Score</span>
            <strong>
              {{ summary.lowest_score }}
            </strong>
          </div>
          <div class="summary-icon">
            <TrendingDown :size="23" />
          </div>
        </div>
        <!-- PASSED -->
        <div class="summary-card passed-card">
          <div class="summary-content">
            <span>Passed</span>
            <strong>
              {{ summary.passed }}
            </strong>
          </div>
          <div class="summary-icon passed-icon">
            <CircleCheckBig :size="23" />
          </div>
        </div>
        <!-- FAILED -->
        <div class="summary-card failed-card">
          <div class="summary-content">
            <span>Failed</span>
            <strong>
              {{ summary.failed }}
            </strong>
          </div>
          <div class="summary-icon failed-icon">
            <CircleX :size="23" />
          </div>
        </div>
      </div>
      <!-- ================= NO STUDENTS ================= -->
      <div
        v-if="students.length === 0"
        class="message-card empty-state"
      >
        <FileSearch :size="40" />
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
            <div class="search-box">
              <Search :size="17" />
              <input
                v-model="search"
                type="text"
                placeholder="Search student..."
                class="search-input"
              />
            </div>
            <button
              class="export-btn"
              @click="exportToExcel"
            >
              <Download :size="17" />
              <span>Export Excel</span>
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
                <th>Copy</th>
                <th>Paste</th>
                <th>Fullscreen Exit</th>
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
                  <strong class="score-value">
                    {{ student.score }}
                  </strong>
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
                    <CircleCheckBig
                      v-if="student.passed"
                      :size="13"
                    />
                    <CircleX
                      v-else
                      :size="13"
                    />
                    {{
                      student.passed
                        ? 'Passed'
                        : 'Failed'
                    }}
                  </span>
                </td>
                <td>
                  <div
                    class="data-with-icon"
                    :class="{ 'violation-data': (student.tab_switches ?? 0) > 0 }"
                  >
                    <MonitorOff :size="14" />
                    <span>
                      {{ student.tab_switches ?? 0 }}
                    </span>
                  </div>
                </td>
                <td>
                  <div
                    class="data-with-icon"
                    :class="{ 'violation-data': (student.copy_attempts ?? 0) > 0 }"
                  >
                    <Copy :size="14" />
                    <span>
                      {{ student.copy_attempts ?? 0 }}
                    </span>
                  </div>
                </td>
                <td>
                  <div
                    class="data-with-icon"
                    :class="{ 'violation-data': (student.paste_attempts ?? 0) > 0 }"
                  >
                    <ClipboardPaste :size="14" />
                    <span>
                      {{ student.paste_attempts ?? 0 }}
                    </span>
                  </div>
                </td>
                <td>
                  <div
                    class="data-with-icon"
                    :class="{ 'violation-data': (student.fullscreen_exits ?? 0) > 0 }"
                  >
                    <Minimize2 :size="14" />
                    <span>
                      {{ student.fullscreen_exits ?? 0 }}
                    </span>
                  </div>
                </td>
                <td>
                  <div class="data-with-icon">
                    <Clock3 :size="14" />
                    <span>
                      {{
                        formatSeconds(
                          student.idle_seconds
                        )
                      }}
                    </span>
                  </div>
                </td>
                <td>
                  <div class="data-with-icon">
                    <Timer :size="14" />
                    <span>
                      {{
                        formatSeconds(
                          student.time_spent
                        )
                      }}
                    </span>
                  </div>
                </td>
                <td>
                  <div class="data-with-icon submitted-date">
                    <CalendarDays :size="14" />
                    <span>
                      {{
                        formatDate(
                          student.submitted_at
                        )
                      }}
                    </span>
                  </div>
                </td>
              </tr>
              <!-- NO SEARCH RESULT -->
              <tr
                v-if="filteredStudents.length === 0"
              >
                <td
                  colspan="12"
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
import {
  ref,
  computed,
  onMounted
} from 'vue'
import {
  useRoute,
  useRouter
} from 'vue-router'
import api from '../services/api'
import * as XLSX from 'xlsx'
import {
  ArrowLeft,
  Users,
  ChartNoAxesColumnIncreasing,
  Percent,
  Trophy,
  TrendingDown,
  CircleCheckBig,
  CircleX,
  Search,
  Download,
  FileSearch,
  LoaderCircle,
  CircleAlert,
  MonitorOff,
  Copy,
  ClipboardPaste,
  Minimize2,
  Clock3,
  Timer,
  CalendarDays
} from '@lucide/vue'
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
  copy_attempts: number | null
  paste_attempts: number | null
  fullscreen_exits: number | null
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
          'Copy Attempts':
            student.copy_attempts ?? 0,
          'Paste Attempts':
            student.paste_attempts ?? 0,
          'Fullscreen Exits':
            student.fullscreen_exits ?? 0,
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
    { wch: 6 },
    { wch: 30 },
    { wch: 12 },
    { wch: 15 },
    { wch: 12 },
    { wch: 15 },
    { wch: 15 },
    { wch: 15 },
    { wch: 18 },
    { wch: 15 },
    { wch: 15 },
    { wch: 28 }
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
  min-height: 100vh;
  padding:
    32px
    36px
    45px;
  background: #f6faf7;
  box-sizing: border-box;
}
/* ================= HEADER ================= */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 24px;
  margin-bottom: 28px;
}
.page-header h1 {
  margin: 0 0 7px;
  color: #112244;
  font-size: 32px;
  font-weight: 700;
  line-height: 1.25;
}
.page-header p {
  margin: 0;
  color: #6b7280;
  font-size: 14px;
}
/* ================= BACK BUTTON ================= */
.back-btn {
  border: 1px solid #dfe5e1;
  background: white;
  color: #374151;
  padding: 10px 16px;
  border-radius: 8px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  font-weight: 600;
  cursor: pointer;
  transition: .2s ease;
  box-shadow:
    0 2px 6px
    rgba(0, 0, 0, .04);
}
.back-btn:hover {
  background: #f8faf9;
  border-color: #cbd5d0;
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
  margin-bottom: 26px;
}
.summary-card {
  min-height: 108px;
  background: white;
  border-radius: 13px;
  padding: 18px;
  border:
    1px solid #e4e9e6;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 15px;
  box-shadow:
    0 3px 12px
    rgba(0, 0, 0, .045);
  transition:
    transform .2s ease,
    box-shadow .2s ease;
}
.summary-card:hover {
  transform: translateY(-2px);
  box-shadow:
    0 7px 18px
    rgba(0, 0, 0, .07);
}
.summary-content {
  min-width: 0;
}
.summary-card span {
  display: block;
  color: #6b7280;
  font-size: 12px;
  margin-bottom: 7px;
}
.summary-card strong {
  display: block;
  color: #111827;
  font-size: 24px;
  line-height: 1;
}
.summary-icon {
  width: 46px;
  height: 46px;
  flex-shrink: 0;
  border-radius: 11px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #ecfdf3;
  color: #00a844;
}
.passed-card strong {
  color: #16a34a;
}
.passed-icon {
  background: #dcfce7;
  color: #15803d;
}
.failed-card strong {
  color: #dc2626;
}
.failed-icon {
  background: #fee2e2;
  color: #dc2626;
}
/* ================= TABLE CARD ================= */
.table-card {
  width: 100%;
  background: white;
  border:
    1px solid #e7ece9;
  border-radius: 15px;
  overflow: hidden;
  box-shadow:
    0 5px 18px
    rgba(0, 0, 0, .055);
}
/* ================= TABLE HEADER ================= */
.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  padding:
    22px
    24px;
  border-bottom:
    1px solid #e5e7eb;
}
.table-header h2 {
  margin: 0 0 5px;
  color: #112244;
  font-size: 20px;
}
.table-header p {
  margin: 0;
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
.search-box {
  position: relative;
  width: 230px;
}
.search-box svg {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
  pointer-events: none;
}
.search-input {
  width: 100%;
  height: 40px;
  padding:
    0
    13px
    0
    38px;
  border:
    1px solid #d1d5db;
  border-radius: 8px;
  background: white;
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
  height: 40px;
  border: none;
  background: #16a34a;
  color: white;
  padding:
    0
    16px;
  border-radius: 8px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
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
    rgba(22, 163, 74, .22);
}
/* ================= TABLE ================= */
.table-wrapper {
  width: 100%;
  overflow-x: auto;
}
table {
  width: 100%;
  border-collapse: collapse;
  min-width: 1450px;
}
th {
  background: #f8faf9;
  color: #4b5563;
  font-size: 11px;
  font-weight: 700;
  text-align: left;
  text-transform: uppercase;
  letter-spacing: .02em;
  padding:
    14px
    16px;
  border-bottom:
    1px solid #e5e7eb;
}
td {
  padding:
    15px
    16px;
  color: #374151;
  font-size: 13px;
  border-bottom:
    1px solid #f1f3f2;
  vertical-align: middle;
}
tbody tr {
  transition: background .15s ease;
}
tbody tr:hover {
  background: #fafcfb;
}
.student-name {
  color: #111827;
  font-weight: 600;
}
.score-value {
  color: #112244;
}
/* ================= DATA ICON ================= */
.data-with-icon {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #4b5563;
  white-space: nowrap;
}
.data-with-icon svg {
  color: #9ca3af;
  flex-shrink: 0;
}
/* ================= STATUS ================= */
.status-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  padding:
    5px
    10px;
  border-radius: 20px;
  font-size: 11px;
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
/* ================= MESSAGE ================= */
.message-card {
  width: 100%;
  background: white;
  padding: 45px 30px;
  border:
    1px solid #e7ece9;
  border-radius: 14px;
  text-align: center;
  color: #6b7280;
  box-shadow:
    0 4px 15px
    rgba(0, 0, 0, .05);
}
.message-card h2 {
  margin:
    10px
    0
    7px;
  color: #111827;
  font-size: 19px;
}
.message-card p {
  margin: 0;
  font-size: 13px;
}
.empty-state svg {
  color: #00a844;
}
.error-card {
  color: #dc2626;
  border-left:
    4px solid #dc2626;
}
.error-card svg {
  color: #dc2626;
}
.error-card h2 {
  color: #dc2626;
}
.loading-icon {
  color: #00a844;
  animation:
    spin 1s linear infinite;
}
@keyframes spin {
  to {
    transform:
      rotate(360deg);
  }
}
/* ================= NO SEARCH RESULT ================= */
.no-search-results {
  text-align: center;
  color: #6b7280;
  padding: 35px;
}
/* ================= RESPONSIVE ================= */
@media(max-width: 1100px) {
  .student-scores-page {
    padding:
      28px
      26px
      40px;
  }
  .summary-grid {
    grid-template-columns:
      repeat(
        2,
        1fr
      );
  }
}
@media(max-width: 700px) {
  .student-scores-page {
    padding:
      22px
      18px
      35px;
  }
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }
  .page-header h1 {
    font-size: 27px;
  }
  .back-btn {
    width: 100%;
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
  .search-box {
    width: 100%;
  }
  .export-btn {
    width: 100%;
  }
}
.violation-data{
  color:#dc2626;
  font-weight:700;
}
.violation-data svg{
  color:#dc2626;
}
</style>
