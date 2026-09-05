<template>
  <div class="history-page">
    <!-- ================= PAGE HEADER ================= -->
    <div class="page-header">
      <div>
        <h1>Student History</h1>
        <p>
          Search a student name to view all submitted examination records.
        </p>
      </div>
    </div>
    <!-- ================= FILTERS ================= -->
    <div class="filter-card">
      <!-- SEARCH -->
      <div class="filter-field search-field">
        <Search :size="18" />
        <input
          v-model="search"
          type="text"
          placeholder="Search student name..."
        >
      </div>
      <!-- CLASS FILTER -->
      <div class="filter-field">
        <GraduationCap :size="18" />
        <select v-model="selectedClass">
          <option>
            All Classes
          </option>
          <option
            v-for="className in classes"
            :key="className"
          >
            {{ className }}
          </option>
        </select>
      </div>
      <!-- SUBJECT FILTER -->
      <div class="filter-field">
        <BookOpen :size="18" />
        <select v-model="selectedSubject">
          <option>
            All Subjects
          </option>
          <option
            v-for="subject in subjects"
            :key="subject"
          >
            {{ subject }}
          </option>
        </select>
      </div>
    </div>
    <!-- ================= STUDENT SUMMARY ================= -->
    <div
      v-if="search.trim() !== '' && filteredHistory.length"
      class="summary-card"
    >
      <div class="summary-header">
        <div class="student-icon">
          <UserRound :size="22" />
        </div>
        <div>
          <span>Student</span>
          <h2>
            {{ searchedStudentName }}
          </h2>
        </div>
      </div>
      <div class="summary-grid">
        <div class="summary-box">
          <div class="summary-icon">
            <FileText :size="21" />
          </div>
          <div>
            <small>Total Exams Taken</small>
            <strong>
              {{ studentSummary.total }}
            </strong>
          </div>
        </div>
        <div class="summary-box">
          <div class="summary-icon">
            <ChartNoAxesColumnIncreasing :size="21" />
          </div>
          <div>
            <small>Average Score</small>
            <strong>
              {{ studentSummary.average }}%
            </strong>
          </div>
        </div>
        <div class="summary-box">
          <div class="summary-icon">
            <Trophy :size="21" />
          </div>
          <div>
            <small>Highest Score</small>
            <strong>
              {{ studentSummary.highest }}%
            </strong>
          </div>
        </div>
        <div class="summary-box">
          <div class="summary-icon">
            <TrendingDown :size="21" />
          </div>
          <div>
            <small>Lowest Score</small>
            <strong>
              {{ studentSummary.lowest }}%
            </strong>
          </div>
        </div>
      </div>
    </div>
    <!-- ================= TABLE ================= -->
    <div class="table-card">
      <div class="table-header">
        <div>
          <h2>Examination History</h2>
          <p>
            {{ filteredHistory.length }}
            record(s) found
          </p>
        </div>
      </div>
      <div class="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Student Name</th>
              <th>Class</th>
              <th>Subject</th>
              <th>Examination</th>
              <th>Score</th>
              <th>Date & Time</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="record in filteredHistory"
              :key="record.id"
            >
              <td class="student-name">
                <div class="student-cell">
                  <div class="avatar">
                    {{
                      record.studentName
                        .charAt(0)
                        .toUpperCase()
                    }}
                  </div>
                  <span>
                    {{ record.studentName }}
                  </span>
                </div>
              </td>
              <td>
                <span class="class-badge">
                  {{ record.className }}
                </span>
              </td>
              <td>
                {{ record.subject }}
              </td>
              <td>
                {{ record.exam }}
              </td>
              <td>
                <strong class="score-value">
                  {{ record.score }}
                  /
                  {{ record.totalItems }}
                </strong>
                <span class="percentage">
                  {{ record.percentage }}%
                </span>
              </td>
              <td>
                <div class="date-cell">
                  <CalendarDays :size="14" />
                  <span>
                    {{ record.dateTime }}
                  </span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <!-- EMPTY -->
      <div
        v-if="filteredHistory.length === 0"
        class="empty"
      >
        <FileSearch :size="38" />
        <h3>
          No student history found
        </h3>
        <p>
          Try changing the search or selected filters.
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
import api from '../services/api'
import {
  Search,
  GraduationCap,
  BookOpen,
  UserRound,
  FileText,
  ChartNoAxesColumnIncreasing,
  Trophy,
  TrendingDown,
  CalendarDays,
  FileSearch
} from '@lucide/vue'
const search =
  ref('')
const selectedClass =
  ref('All Classes')
const selectedSubject =
  ref('All Subjects')
const selectedExamType =
  ref('All Exam Types')
const history =
  ref<any[]>([])
/* ================= CLASSES ================= */
const classes =
  computed(() => {
    return [
      ...new Set(
        history.value
          .map(
            item =>
              item.className
          )
          .filter(
            className =>
              className !== 'No Class'
          )
      )
    ].sort()
  })
/* ================= FETCH HISTORY ================= */
async function fetchHistory() {
  try {
    const response =
      await api.get(
        '/results'
      )
    history.value =
      response.data.data
        .filter(
          (session: any) =>
            session.status === 'submitted'
        )
        .map(
          (session: any) => {
            const exam =
              session.exam || {}
            const totalItems =
              exam.questions_count
              ||
              session.answers?.length
              ||
              0
            return {
              id:
                session.id,
              studentName:
                session.student_name
                ||
                'Unknown Student',
              grade:
                exam.grade
                ||
                '',
              section:
                exam.section
                ||
                '',
              className:
                exam.grade &&
                exam.section
                  ? `${exam.grade} - ${exam.section}`
                  : 'No Class',
              subject:
                exam.subject
                ||
                'No Subject',
              exam:
                exam.title
                ||
                'Untitled Exam',
              examType:
                detectExamType(
                  exam.title || ''
                ),
              score:
                Number(
                  session.score || 0
                ),
              totalItems,
              percentage:
                Number(
                  session.percentage || 0
                ),
              dateTime:
                session.submitted_at
                  ? new Date(
                      session.submitted_at
                    ).toLocaleString(
                      'en-PH'
                    )
                  : '-'
            }
          }
        )
  }
  catch (error) {
    console.error(
      error
    )
    alert(
      'Failed to load student history.'
    )
  }
}
/* ================= EXAM TYPE ================= */
function detectExamType(
  title: string
) {
  const lower =
    title.toLowerCase()
  if (
    lower.includes('quiz')
  ) {
    return 'Quiz'
  }
  if (
    lower.includes('midterm')
  ) {
    return 'Midterm'
  }
  if (
    lower.includes('final')
  ) {
    return 'Final'
  }
  return 'Exam'
}
/* ================= SUBJECTS ================= */
const subjects =
  computed(() => {
    return [
      ...new Set(
        history.value.map(
          item =>
            item.subject
        )
      )
    ].sort()
  })
/* ================= FILTER ================= */
const filteredHistory =
  computed(() => {
    return history.value.filter(
      record => {
        const keyword =
          search.value
            .trim()
            .toLowerCase()
        const matchName =
          record.studentName
            .toLowerCase()
            .includes(
              keyword
            )
        const matchClass =
          selectedClass.value ===
            'All Classes'
          ||
          record.className ===
            selectedClass.value
        const matchSubject =
          selectedSubject.value ===
            'All Subjects'
          ||
          record.subject ===
            selectedSubject.value
        const matchExamType =
          selectedExamType.value ===
            'All Exam Types'
          ||
          record.examType ===
            selectedExamType.value
        return (
          matchName &&
          matchClass &&
          matchSubject &&
          matchExamType
        )
      }
    )
  })
/* ================= SEARCHED STUDENT ================= */
const searchedStudentName =
  computed(() => {
    return (
      filteredHistory.value[0]
        ?.studentName
      ||
      ''
    )
  })
/* ================= SUMMARY ================= */
const studentSummary =
  computed(() => {
    const records =
      filteredHistory.value
    if (
      !records.length
    ) {
      return {
        total: 0,
        average: 0,
        highest: 0,
        lowest: 0
      }
    }
    const scores =
      records.map(
        record =>
          record.percentage
      )
    return {
      total:
        records.length,
      average:
        Math.round(
          scores.reduce(
            (
              sum,
              score
            ) =>
              sum + score,
            0
          )
          /
          records.length
        ),
      highest:
        Math.max(
          ...scores
        ),
      lowest:
        Math.min(
          ...scores
        )
    }
  })
/* ================= MOUNT ================= */
onMounted(() => {
  fetchHistory()
})
</script>
<style scoped>
/* ================= PAGE ================= */
.history-page {
  width: 100%;
  min-height: 100vh;
  padding:
    32px
    36px
    45px;
  background:
    #f6faf7;
  font-family:
    'Inter',
    'Poppins',
    sans-serif;
  box-sizing:
    border-box;
}
/* ================= HEADER ================= */
.page-header {
  margin-bottom:
    28px;
}
.page-header h1 {
  margin:
    0
    0
    7px;
  color:
    #112244;
  font-size:
    34px;
  font-weight:
    700;
}
.page-header p {
  margin:
    0;
  color:
    #6b7280;
  font-size:
    14px;
}
/* ================= FILTER CARD ================= */
.filter-card {
  width:
    100%;
  display:
    grid;
  grid-template-columns:
    minmax(250px, 1.6fr)
    minmax(190px, .7fr)
    minmax(190px, .7fr);
  gap:
    12px;
  margin-bottom:
    25px;
  padding:
    18px;
  background:
    white;
  border:
    1px solid #e5ebe7;
  border-radius:
    14px;
  box-shadow:
    0 4px 14px
    rgba(0, 0, 0, .045);
}
/* ================= FILTER FIELD ================= */
.filter-field {
  position:
    relative;
  min-width:
    0;
}
.filter-field svg {
  position:
    absolute;
  left:
    13px;
  top:
    50%;
  transform:
    translateY(-50%);
  color:
    #94a3b8;
  pointer-events:
    none;
  z-index:
    1;
}
.filter-field input,
.filter-field select {
  width:
    100%;
  height:
    43px;
  padding:
    0
    13px
    0
    40px;
  border:
    1px solid #dfe5e1;
  border-radius:
    8px;
  background:
    white;
  color:
    #374151;
  outline:
    none;
  font-size:
    13px;
  transition:
    border-color .2s ease,
    box-shadow .2s ease;
}
.filter-field input:focus,
.filter-field select:focus {
  border-color:
    #00c853;
  box-shadow:
    0 0 0 3px
    rgba(0, 200, 83, .09);
}
/* ================= SUMMARY ================= */
.summary-card {
  margin-bottom:
    25px;
  padding:
    22px;
  background:
    white;
  border:
    1px solid #e5ebe7;
  border-radius:
    15px;
  box-shadow:
    0 5px 16px
    rgba(0, 0, 0, .05);
}
.summary-header {
  display:
    flex;
  align-items:
    center;
  gap:
    12px;
  margin-bottom:
    19px;
}
.student-icon {
  width:
    44px;
  height:
    44px;
  display:
    flex;
  align-items:
    center;
  justify-content:
    center;
  flex-shrink:
    0;
  border-radius:
    11px;
  background:
    #ecfdf3;
  color:
    #00a844;
}
.summary-header span {
  display:
    block;
  margin-bottom:
    2px;
  color:
    #94a3b8;
  font-size:
    11px;
  text-transform:
    uppercase;
  font-weight:
    600;
}
.summary-header h2 {
  margin:
    0;
  color:
    #112244;
  font-size:
    20px;
}
.summary-grid {
  display:
    grid;
  grid-template-columns:
    repeat(
      4,
      minmax(0, 1fr)
    );
  gap:
    14px;
}
.summary-box {
  min-height:
    88px;
  display:
    flex;
  align-items:
    center;
  gap:
    12px;
  padding:
    15px;
  background:
    #f9fbfa;
  border:
    1px solid #edf1ee;
  border-radius:
    11px;
}
.summary-icon {
  width:
    39px;
  height:
    39px;
  flex-shrink:
    0;
  display:
    flex;
  justify-content:
    center;
  align-items:
    center;
  border-radius:
    9px;
  background:
    #ecfdf3;
  color:
    #00a844;
}
.summary-grid small {
  display:
    block;
  margin-bottom:
    5px;
  color:
    #6b7280;
  font-size:
    11px;
}
.summary-grid strong {
  color:
    #112244;
  font-size:
    19px;
}
/* ================= TABLE CARD ================= */
.table-card {
  width:
    100%;
  overflow:
    hidden;
  background:
    white;
  border:
    1px solid #e5ebe7;
  border-radius:
    15px;
  box-shadow:
    0 5px 16px
    rgba(0, 0, 0, .05);
}
.table-header {
  padding:
    20px
    22px;
  border-bottom:
    1px solid #edf1ee;
}
.table-header h2 {
  margin:
    0
    0
    4px;
  color:
    #112244;
  font-size:
    19px;
}
.table-header p {
  margin:
    0;
  color:
    #6b7280;
  font-size:
    12px;
}
.table-wrapper {
  width:
    100%;
  overflow-x:
    auto;
}
/* ================= TABLE ================= */
table {
  width:
    100%;
  min-width:
    950px;
  border-collapse:
    collapse;
}
thead {
  background:
    #f8faf9;
}
th {
  padding:
    14px
    16px;
  color:
    #4b5563;
  text-align:
    left;
  font-size:
    11px;
  font-weight:
    700;
  text-transform:
    uppercase;
  letter-spacing:
    .02em;
  border-bottom:
    1px solid #e5e7eb;
}
td {
  padding:
    15px
    16px;
  color:
    #374151;
  font-size:
    13px;
  border-bottom:
    1px solid #f1f3f2;
  vertical-align:
    middle;
}
tbody tr {
  transition:
    background .15s ease;
}
tbody tr:hover {
  background:
    #fafcfb;
}
/* ================= STUDENT ================= */
.student-cell {
  display:
    flex;
  align-items:
    center;
  gap:
    10px;
}
.avatar {
  width:
    34px;
  height:
    34px;
  min-width:
    34px;
  display:
    flex;
  align-items:
    center;
  justify-content:
    center;
  border-radius:
    50%;
  background:
    #e3f9e9;
  color:
    #00a844;
  font-size:
    12px;
  font-weight:
    700;
}
.student-name span {
  color:
    #111827;
  font-weight:
    600;
}
/* ================= CLASS BADGE ================= */
.class-badge {
  display:
    inline-flex;
  padding:
    5px
    9px;
  border-radius:
    999px;
  background:
    #f0fdf4;
  color:
    #166534;
  font-size:
    11px;
  font-weight:
    600;
  white-space:
    nowrap;
}
/* ================= SCORE ================= */
.score-value {
  display:
    block;
  color:
    #112244;
}
.percentage {
  display:
    block;
  margin-top:
    3px;
  color:
    #6b7280;
  font-size:
    11px;
}
/* ================= DATE ================= */
.date-cell {
  display:
    inline-flex;
  align-items:
    center;
  gap:
    6px;
  white-space:
    nowrap;
}
.date-cell svg {
  flex-shrink:
    0;
  color:
    #94a3b8;
}
/* ================= EMPTY ================= */
.empty {
  display:
    flex;
  flex-direction:
    column;
  align-items:
    center;
  justify-content:
    center;
  padding:
    50px
    25px;
  color:
    #6b7280;
  text-align:
    center;
}
.empty svg {
  margin-bottom:
    10px;
  color:
    #00a844;
}
.empty h3 {
  margin:
    0
    0
    5px;
  color:
    #112244;
  font-size:
    16px;
}
.empty p {
  margin:
    0;
  font-size:
    12px;
}
/* ================= RESPONSIVE ================= */
@media(max-width: 1000px) {
  .history-page {
    padding:
      28px
      26px
      40px;
  }
  .filter-card {
    grid-template-columns:
      1fr;
  }
  .summary-grid {
    grid-template-columns:
      repeat(
        2,
        1fr
      );
  }
}
@media(max-width: 600px) {
  .history-page {
    padding:
      22px
      18px
      35px;
  }
  .page-header h1 {
    font-size:
      28px;
  }
  .summary-grid {
    grid-template-columns:
      1fr;
  }
}
</style>
