<template>
  <div class="results-page">
    <!-- ==========================================
         PAGE HEADER
    =========================================== -->
    <div class="page-header">
      <div class="header-info">
        <h1>Exam Results</h1>
        <p class="exam-title">
          {{ exam.title }}
        </p>
        <div class="exam-details">
          <div class="exam-detail">
            <span>Class</span>
            <strong>{{ classLabel }}</strong>
          </div>
          <div class="exam-detail">
            <span>Subject</span>
            <strong>
              {{ exam.subject || 'Not specified' }}
            </strong>
          </div>
          <div class="exam-detail">
            <span>Passing Score</span>
            <strong>
              {{ exam.passingScore }}%
            </strong>
          </div>
          <div class="exam-detail">
            <span>Total Questions</span>
            <strong>
              {{ exam.totalQuestions }}
            </strong>
          </div>
        </div>
      </div>
      <!-- HEADER ACTION BUTTONS -->
      <div class="header-buttons">
        <button
          class="analysis-btn"
          @click="goToItemAnalysis"
        >
          <BarChart3 :size="19" />
          <span>Item Analysis</span>
        </button>
        <button
          class="export-btn"
          @click="exportCSV"
        >
          <Download :size="19" />
          <span>Export Results</span>
        </button>
      </div>
    </div>
    <!-- ==========================================
         STATISTICS
    =========================================== -->
    <div class="stats">
      <!-- TOTAL STUDENTS -->
      <div class="card">
        <div>
          <small>Total Students</small>
          <h2>{{ totalStudents }}</h2>
        </div>
        <div class="icon blue">
          <Users :size="28" />
        </div>
      </div>
      <!-- AVERAGE SCORE -->
      <div class="card">
        <div>
          <small>Average Score</small>
          <h2 class="blue-text">
            {{ averageScore }}%
          </h2>
        </div>
        <div class="icon light-blue">
          <ChartNoAxesColumnIncreasing :size="28" />
        </div>
      </div>
      <!-- PASS RATE -->
      <div class="card">
        <div>
          <small>Pass Rate</small>
          <h2 class="green-text">
            {{ passRate }}%
          </h2>
        </div>
        <div class="icon green">
          <CircleCheckBig :size="28" />
        </div>
      </div>
      <!-- HIGHEST SCORE -->
      <div class="card">
        <div>
          <small>Highest Score</small>
          <h2 class="purple-text">
            {{ highestScore }}%
          </h2>
        </div>
        <div class="icon purple">
          <Trophy :size="28" />
        </div>
      </div>
    </div>
    <!-- ==========================================
         RESULTS TABLE
    =========================================== -->
    <div class="results-table">
      <table>
        <thead>
          <tr>
            <th>Rank</th>
            <th>Student</th>
            <th>Score</th>
            <th>Correct</th>
            <th>Wrong</th>
            <th>Time Spent</th>
            <th>Violations</th>
            <th>Performance</th>
            <th>Submitted</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(student, index) in rankedStudents"
            :key="student.id"
          >
            <!-- RANK -->
            <td class="rank">
              <span
                v-if="index === 0"
                class="rank-medal gold"
              >
                <Medal :size="26" />
              </span>
              <span
                v-else-if="index === 1"
                class="rank-medal silver"
              >
                <Medal :size="26" />
              </span>
              <span
                v-else-if="index === 2"
                class="rank-medal bronze"
              >
                <Medal :size="26" />
              </span>
              <span
                v-else
                class="rank-number"
              >
                {{ index + 1 }}
              </span>
            </td>
            <!-- STUDENT -->
            <td>
              {{ student.name }}
            </td>
            <!-- SCORE -->
            <td>
              <strong>
                {{ student.score }}%
              </strong>
              <br>
              <small>
                {{ student.correct }}/{{ exam.totalQuestions }}
              </small>
            </td>
            <!-- CORRECT -->
            <td class="correct">
              <div class="result-count">
                <Check
                  :size="17"
                  stroke-width="3"
                />
                <span>
                  {{ student.correct }}
                </span>
              </div>
            </td>
            <!-- WRONG -->
            <td class="wrong">
              <div class="result-count">
                <X
                  :size="17"
                  stroke-width="3"
                />
                <span>
                  {{ student.wrong }}
                </span>
              </div>
            </td>
            <td>
              {{ student.timeSpent }}
            </td>
            <td>
              <div class="violation-list">
                <span :class="{ 'has-violation': student.tabSwitches > 0 }">
                  Tab Switch: <strong>{{ student.tabSwitches }}</strong>
                </span>
                <span :class="{ 'has-violation': student.copyAttempts > 0 }">
                  Copy: <strong>{{ student.copyAttempts }}</strong>
                </span>
                <span :class="{ 'has-violation': student.pasteAttempts > 0 }">
                  Paste: <strong>{{ student.pasteAttempts }}</strong>
                </span>
                <span :class="{ 'has-violation': student.fullscreenExits > 0 }">
                  Fullscreen Exit: <strong>{{ student.fullscreenExits }}</strong>
                </span>
              </div>
            </td>
            <td>
              <span
                class="badge"
                :class="student.performanceClass"
              >
                {{ student.performance }}
              </span>
            </td>
            <!-- SUBMITTED -->
            <td>
              {{ student.submitted }}
            </td>
          </tr>
        </tbody>
      </table>
      <!-- EMPTY STATE -->
      <div
        v-if="rankedStudents.length === 0"
        class="empty-results"
      >
        <FileSearch :size="38" />
        <p>
          No submitted results yet.
        </p>
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
import {
  useRouter,
  useRoute
} from 'vue-router'
import api from '../services/api'
import {
  BarChart3,
  Download,
  Users,
  ChartNoAxesColumnIncreasing,
  CircleCheckBig,
  Trophy,
  Medal,
  Check,
  X,
  FileSearch
} from '@lucide/vue'
/* ==========================================
   ROUTER
========================================== */
const router = useRouter()
const route = useRoute()
/* ==========================================
   EXAM
========================================== */
const exam = ref({
  id: 0,
  title: '',
  grade: '',
  section: '',
  subject: '',
  totalQuestions: 0,
  passingScore: 75
})
/* ==========================================
   STUDENTS
========================================== */
const students = ref<any[]>([])
/* ==========================================
   CLASS LABEL
========================================== */
const classLabel = computed(() => {
  const grade =
    exam.value.grade?.trim()
  const section =
    exam.value.section?.trim()
  if (grade && section) {
    return `${grade} - ${section}`
  }
  if (grade) {
    return grade
  }
  if (section) {
    return section
  }
  return 'Not specified'
})
/* ==========================================
   FETCH RESULTS
========================================== */
async function fetchResults() {
  try {
    const examId =
      route.params.id
    const response =
      await api.get(
        `/exams/${examId}/results`
      )
    exam.value = {
      id:
        response.data.exam.id,
      title:
        response.data.exam.title,
      grade:
        response.data.exam.grade
        ?? '',
      section:
        response.data.exam.section
        ?? '',
      subject:
        response.data.exam.subject
        ?? '',
      totalQuestions:
        response.data.exam.questions_count
        ?? 0,
      passingScore:
        Number(
          response.data.exam.passing
          ?? 75
        )
    }
    students.value =
      response.data.data.map(
        (student: any) => {
          let performance =
            'Excellent'
          let performanceClass =
            'excellent'
          if (
            student.percentage < 90
          ) {
            performance =
              'Very Good'
            performanceClass =
              'very-good'
          }
          if (
            student.percentage < 80
          ) {
            performance =
              'Good'
            performanceClass =
              'good'
          }
          if (
            student.percentage < 70
          ) {
            performance =
              'Fair'
            performanceClass =
              'fair'
          }
          if (
            student.percentage < 60
          ) {
            performance =
              'Failed'
            performanceClass =
              'failed'
          }
          return {
            id:
              student.id,
            name:
              student.student_name,
            score:
              Number(
                student.percentage
              ),
            correct:
              student.correct,
            wrong:
              student.wrong,
            timeSpent:
              student.time_spent
                ? `${student.time_spent} sec`
                : '-',
                tabSwitches:
                  Number(student.tab_switches || 0),
                copyAttempts:
                  Number(student.copy_attempts || 0),
                pasteAttempts:
                  Number(student.paste_attempts || 0),
                fullscreenExits:
                  Number(student.fullscreen_exits || 0),
            submitted:
              student.submitted_at
                ? new Date(
                    student.submitted_at
                  ).toLocaleTimeString()
                : '-',
            performance,
            performanceClass
          }
        }
      )
  }
  catch (error) {
    console.error(
      'RESULTS LOAD ERROR:',
      error
    )
    alert(
      'Failed to load exam results.'
    )
  }
}
/* ==========================================
   RANK STUDENTS
========================================== */
const rankedStudents = computed(() => {
  return [
    ...students.value
  ].sort(
    (a, b) =>
      b.score - a.score
  )
})
/* ==========================================
   TOTAL STUDENTS
========================================== */
const totalStudents =
  computed(() =>
    students.value.length
  )
/* ==========================================
   HIGHEST SCORE
========================================== */
const highestScore =
  computed(() => {
    if (
      students.value.length === 0
    ) {
      return 0
    }
    return Math.max(
      ...students.value.map(
        student =>
          student.score
      )
    )
  })
/* ==========================================
   AVERAGE SCORE
========================================== */
const averageScore =
  computed(() => {
    if (
      students.value.length === 0
    ) {
      return 0
    }
    const total =
      students.value.reduce(
        (
          sum,
          student
        ) =>
          sum + student.score,
        0
      )
    return Number(
      (
        total
        /
        students.value.length
      ).toFixed(1)
    )
  })
/* ==========================================
   PASS RATE
========================================== */
const passRate =
  computed(() => {
    if (
      students.value.length === 0
    ) {
      return 0
    }
    const passed =
      students.value.filter(
        student =>
          student.score
          >=
          exam.value.passingScore
      ).length
    return Math.round(
      (
        passed
        /
        students.value.length
      )
      *
      100
    )
  })
/* ==========================================
   ITEM ANALYSIS
========================================== */
function goToItemAnalysis() {
  router.push(
    `/faculty/item-analysis/${exam.value.id}`
  )
}
/* ==========================================
   EXPORT CSV
========================================== */
function exportCSV() {
  const headers = [
    'Rank',
    'Student',
    'Score',
    'Correct',
    'Wrong',
    'Time Spent',
    'Tab Switches',
    'Copy Attempts',
    'Paste Attempts',
    'Fullscreen Exits',
    'Performance',
    'Submitted'
  ]
  const rows =
    rankedStudents.value.map(
      (
        student,
        index
      ) => [
        index + 1,
        student.name,
        student.score + '%',
        student.correct,
        student.wrong,
        student.timeSpent,
        student.tabSwitches,
        student.copyAttempts,
        student.pasteAttempts,
        student.fullscreenExits,
        student.performance,
        student.submitted
      ]
    )
  const csv = [
    headers.join(','),
    ...rows.map(
      row =>
        row.join(',')
    )
  ].join('\n')
  const blob =
    new Blob(
      [csv],
      {
        type:
          'text/csv;charset=utf-8;'
      }
    )
  const url =
    URL.createObjectURL(
      blob
    )
  const link =
    document.createElement(
      'a'
    )
  link.href =
    url
  link.download =
    `${exam.value.title}_Results.csv`
  link.click()
  URL.revokeObjectURL(
    url
  )
}
/* ==========================================
   MOUNTED
========================================== */
onMounted(() => {
  fetchResults()
})
</script>
<style scoped>
/* ==========================================
   GLOBAL
========================================== */
*{
  margin:0;
  padding:0;
  box-sizing:border-box;
}
/* ==========================================
   PAGE
========================================== */
.results-page{
  min-height:100vh;
  background:#f5f7fb;
  padding:30px;
  font-family:
    'Poppins',
    sans-serif;
}
/* ==========================================
   HEADER
========================================== */
.page-header{
  display:flex;
  justify-content:
    space-between;
  align-items:center;
  margin-bottom:30px;
}
.page-header h1{
  color:#112244;
  font-size:36px;
  margin-bottom:8px;
}
.page-header p{
  color:#666;
  font-size:15px;
}
.header-info{
  flex:1;
}
.exam-title{
  color:#64748b;
  font-size:15px;
  font-weight:500;
}
/* ==========================================
   EXAM DETAILS
========================================== */
.exam-details{
  display:flex;
  flex-wrap:wrap;
  gap:10px;
  margin-top:16px;
}
.exam-detail{
  min-width:130px;
  padding:10px 14px;
  border:
    1px solid #e2e8f0;
  border-radius:10px;
  background:#ffffff;
}
.exam-detail span{
  display:block;
  margin-bottom:3px;
  color:#94a3b8;
  font-size:10px;
  font-weight:600;
  text-transform:
    uppercase;
}
.exam-detail strong{
  color:#112244;
  font-size:12px;
  font-weight:700;
}
/* ==========================================
   HEADER BUTTONS
========================================== */
.header-buttons{
  display:flex;
  gap:15px;
}
.analysis-btn,
.export-btn{
  border:none;
  color:white;
  padding:
    14px 22px;
  border-radius:10px;
  cursor:pointer;
  font-weight:600;
  transition:.25s;
  display:flex;
  align-items:center;
  justify-content:center;
  gap:8px;
}
.analysis-btn{
  background:#2563eb;
}
.analysis-btn:hover{
  background:#1d4ed8;
  transform:
    translateY(-1px);
}
.export-btn{
  background:#16a34a;
}
.export-btn:hover{
  background:#15803d;
  transform:
    translateY(-1px);
}
/* ==========================================
   STATS
========================================== */
.stats{
  display:grid;
  grid-template-columns:
    repeat(4,1fr);
  gap:20px;
  margin-bottom:30px;
}
.card{
  background:white;
  border-radius:18px;
  padding:25px;
  display:flex;
  justify-content:
    space-between;
  align-items:center;
  box-shadow:
    0 8px 20px
    rgba(0,0,0,.06);
}
.card small{
  color:#666;
}
.card h2{
  margin-top:10px;
  font-size:34px;
}
/* ==========================================
   STAT ICONS
========================================== */
.icon{
  width:60px;
  height:60px;
  border-radius:16px;
  display:flex;
  justify-content:center;
  align-items:center;
}
.icon.blue{
  background:#dbeafe;
  color:#2563eb;
}
.icon.light-blue{
  background:#e0f2fe;
  color:#0284c7;
}
.icon.green{
  background:#dcfce7;
  color:#16a34a;
}
.icon.purple{
  background:#ede9fe;
  color:#7c3aed;
}
.blue-text{
  color:#2563eb;
}
.green-text{
  color:#16a34a;
}
.purple-text{
  color:#7c3aed;
}
/* ==========================================
   TABLE CONTAINER
========================================== */
.results-table{
  background:white;
  border-radius:18px;
  overflow:hidden;
  box-shadow:
    0 8px 20px
    rgba(0,0,0,.06);
}
/* ==========================================
   TABLE
========================================== */
table{
  width:100%;
  border-collapse:
    collapse;
}
thead{
  background:#112244;
  color:white;
}
thead th{
  padding:18px;
  text-align:left;
  font-size:14px;
  font-weight:600;
}
tbody td{
  padding:18px;
  border-bottom:
    1px solid #eeeeee;
  font-size:15px;
  color:#333;
}
tbody tr{
  transition:.25s;
}
tbody tr:hover{
  background:#f8fafc;
}
/* ==========================================
   RANK
========================================== */
.rank{
  font-size:18px;
  font-weight:700;
}
.rank-medal{
  display:inline-flex;
  align-items:center;
  justify-content:center;
}
.rank-number{
  color:#666;
}
.gold{
  color:#d4a017;
}
.silver{
  color:#64748b;
}
.bronze{
  color:#b45309;
}
/* ==========================================
   SCORE
========================================== */
.correct{
  color:#16a34a;
  font-weight:600;
}
.wrong{
  color:#dc2626;
  font-weight:600;
}
.result-count{
  display:flex;
  align-items:center;
  gap:6px;
}
/* ==========================================
   PERFORMANCE BADGES
========================================== */
.badge{
  display:inline-block;
  padding:
    8px 14px;
  border-radius:999px;
  font-size:13px;
  font-weight:600;
}
.excellent{
  background:#dcfce7;
  color:#166534;
}
.very-good{
  background:#dbeafe;
  color:#1d4ed8;
}
.good{
  background:#fef9c3;
  color:#a16207;
}
.fair{
  background:#fed7aa;
  color:#c2410c;
}
.failed{
  background:#fee2e2;
  color:#dc2626;
}
/* ==========================================
   EMPTY RESULTS
========================================== */
.empty-results{
  min-height:180px;
  display:flex;
  flex-direction:column;
  align-items:center;
  justify-content:center;
  gap:12px;
  text-align:center;
  padding:35px;
  color:#94a3b8;
}
.empty-results p{
  color:#777;
  font-size:14px;
}
/* ==========================================
   RESPONSIVE - TABLET
========================================== */
@media(max-width:1200px){
  .stats{
    grid-template-columns:
      repeat(2,1fr);
  }
  .results-table{
    overflow-x:auto;
  }
  table{
    min-width:950px;
  }
}
/* ==========================================
   RESPONSIVE - MOBILE
========================================== */
@media(max-width:768px){
  .results-page{
    padding:20px;
  }
  .page-header{
    flex-direction:
      column;
    align-items:
      flex-start;
    gap:20px;
  }
  .exam-details{
    width:100%;
  }
  .exam-detail{
    flex:
      1 1
      calc(50% - 10px);
  }
  .header-buttons{
    width:100%;
    flex-direction:
      column;
  }
  .header-buttons button{
    width:100%;
  }
  .stats{
    grid-template-columns:
      1fr;
  }
  .page-header h1{
    font-size:30px;
  }
  .card h2{
    font-size:28px;
  }
}
/* ==========================================
   SMALL MOBILE
========================================== */
@media(max-width:480px){
  .results-page{
    padding:15px;
  }
  .exam-detail{
    flex:
      1 1 100%;
  }
  thead th{
    font-size:13px;
  }
  tbody td{
    font-size:13px;
    padding:14px;
  }
}
.violation-list{
  display:flex;
  flex-direction:column;
  gap:4px;
  min-width:130px;
}
.violation-list span{
  color:#64748b;
  font-size:12px;
  white-space:nowrap;
}
.violation-list span strong{
  color:#64748b;
}
.violation-list .has-violation{
  color:#dc2626;
  font-weight:600;
}
.violation-list .has-violation strong{
  color:#dc2626;
}
</style>
