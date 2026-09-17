<template>
  <div class="dashboard">
    <!-- ================= HEADER ================= -->
    <div class="dashboard-header">
      <div>
        <h1>Faculty Dashboard</h1>
        <p>View student performance for a selected school year, semester, or class.</p>
      </div>
    </div>
    <!-- ================= PERFORMANCE ANALYTICS ================= -->
    <section class="analytics-section">
      <div class="analytics-heading">
        <div>
          <h2>Performance Analytics</h2>
          <p>Simple descriptive graphs based on submitted assessment results.</p>
        </div>
        <div class="analytics-filters">
          <select v-model="selectedSchoolYear">
            <option value="All School Years">All School Years</option>
            <option v-for="year in schoolYears" :key="year" :value="year">{{ year }}</option>
          </select>
          <select v-model="selectedSemester">
            <option value="All Semesters">All Semesters</option>
            <option value="1st Semester">1st Semester</option>
            <option value="2nd Semester">2nd Semester</option>
          </select>
          <select v-model="selectedClassId">
            <option value="all">All Classes</option>
            <option v-for="schoolClass in analyticsClasses" :key="schoolClass.id" :value="String(schoolClass.id)">
              {{ classLabel(schoolClass) }}
            </option>
          </select>
        </div>
      </div>

      <div v-if="analyticsLoading" class="analytics-state">
        <LoaderCircle :size="22" class="spin" />
        <span>Loading performance data...</span>
      </div>

      <div v-else-if="analyticsError" class="analytics-state analytics-error">
        <CircleAlert :size="22" />
        <span>{{ analyticsError }}</span>
      </div>

      <template v-else>
        <div class="stats analytics-stats">
          <div class="card">
            <div class="stat-icon"><Users :size="22" /></div>
            <div><span>Students Assessed</span><h2>{{ analyticsSummary.studentsAssessed }}</h2></div>
          </div>
          <div class="card">
            <div class="stat-icon"><FileText :size="22" /></div>
            <div><span>Assessments With Results</span><h2>{{ analyticsSummary.assessments }}</h2></div>
          </div>
          <div class="card">
            <div class="stat-icon"><Target :size="22" /></div>
            <div><span>Average Score</span><h2>{{ analyticsSummary.averageScore.toFixed(1) }}%</h2></div>
          </div>
          <div class="card">
            <div class="stat-icon"><CircleCheckBig :size="22" /></div>
            <div><span>Pass Rate</span><h2>{{ analyticsSummary.passRate.toFixed(1) }}%</h2></div>
          </div>
        </div>

        <div v-if="analyticsSummary.assessments === 0" class="analytics-empty">
          <FileSearch :size="42" />
          <h3>No submitted results for this filter</h3>
          <p>Analytics will appear after students submit assessments.</p>
        </div>

        <div v-else class="analytics-grid">
          <div class="analytics-card">
            <div class="chart-header">
              <div>
                <h3>Student Performance Distribution</h3>
                <p>Students grouped by their average score in the selected period.</p>
              </div>
            </div>
            <div class="bar-list">
              <div v-for="item in performanceDistribution" :key="item.label" class="bar-row">
                <div class="bar-meta"><span>{{ item.label }}</span><strong>{{ item.count }}</strong></div>
                <div class="bar-track"><div class="bar-fill" :style="{ width: `${item.width}%` }"></div></div>
                <small>{{ item.range }}</small>
              </div>
            </div>
          </div>

          <div class="analytics-card">
            <div class="chart-header">
              <div>
                <h3>Pass / Fail Distribution</h3>
                <p>All submitted assessment results in the selected period.</p>
              </div>
            </div>
            <div class="donut-wrap">
              <div class="donut" :style="donutStyle">
                <div class="donut-center">
                  <strong>{{ analyticsSummary.totalSubmissions }}</strong>
                  <span>Results</span>
                </div>
              </div>
              <div class="legend">
                <div><span class="legend-dot pass-dot"></span><span>Passed</span><strong>{{ analyticsSummary.passed }}</strong></div>
                <div><span class="legend-dot fail-dot"></span><span>Failed</span><strong>{{ analyticsSummary.failed }}</strong></div>
              </div>
            </div>
          </div>

          <div class="analytics-card wide-card">
            <div class="chart-header">
              <div>
                <h3>Average Performance per Assessment</h3>
                <p>Average percentage of each assessment with submitted results.</p>
              </div>
            </div>
            <div class="assessment-bars">
              <div v-for="item in assessmentPerformance" :key="item.id" class="assessment-row">
                <div class="assessment-name">
                  <strong>{{ item.title }}</strong>
                  <span>{{ item.subject }} • {{ item.section }}</span>
                </div>
                <div class="assessment-track"><div class="assessment-fill" :style="{ width: `${item.average}%` }"></div></div>
                <strong class="assessment-value">{{ item.average.toFixed(1) }}%</strong>
              </div>
            </div>
          </div>
        </div>
      </template>
    </section>
  </div>
</template>

<script setup lang="ts">
import {
  ref,
  computed,
  onMounted,
  watch
} from 'vue'
import api from '../services/api'
import {
  FileText,
  CircleCheckBig,
  Target,
  Users,
  FileSearch,
  CircleAlert,
  LoaderCircle
} from '@lucide/vue'

// ===========================================
// TYPES
// ===========================================

type NotificationType =
  'success' |
  'error' |
  'info'
const notification =
  ref({
    show: false,
    type:
      'success' as NotificationType,
    title: '',
    message: ''
  })

let notificationTimer:
  ReturnType<typeof setTimeout> |
  null =
  null

function showNotification(
  type: NotificationType,
  title: string,
  message: string
) {
  if (notificationTimer) {
    clearTimeout(
      notificationTimer
    )
  }

  notification.value = {
    show: true,
    type,
    title,
    message
  }

  notificationTimer =
    setTimeout(() => {
      notification.value.show =
        false
    }, 4000)
}
// ===========================================
// EXAMS
// ===========================================

const exams =
  ref<any[]>([])

const loading =
  ref(false)

// ===========================================
// FETCH EXAMS
// ===========================================

async function fetchExams() {
  loading.value =
    true

  try {
    const response =
      await api.get(
        '/exams'
      )

    exams.value =
      response.data.data.map(
        (exam: any) => {
          const questions =
            exam.questions || []

          return {
            id:
              exam.id,
            class_id:
              exam.class_id ?? null,
            title:
              exam.title,
            grade:
              exam.grade ||
              'No Grade',
            section:
              exam.section ||
              'No Section',
            subject:
              exam.subject ||
              'No Subject',
            status:
              exam.status ===
                'draft'
                ? 'Draft'
                : exam.status ===
                    'published'
                  ? 'Published'
                  : exam.status ===
                      'started'
                    ? 'Started'
                    : exam.status ===
                        'finished'
                      ? 'Finished'
                      : exam.status,
            duration:
              exam.duration,
            items:
              questions.length,
            points:
              questions.reduce(
                (
                  sum: number,
                  questionItem: any
                ) =>
                  sum +
                  Number(
                    questionItem.points ||
                    0
                  ),
                0
              ),
            passing:
              exam.passing || 0,
            students:
              '0 / 0',
            created:
              new Date(
                exam.created_at
              )
                .toLocaleDateString(),
            questions
          }
        }
      )
  }
  catch (error) {
    console.error(
      error
    )

    showNotification(
      'error',
      'Unable to Load Exams',
      'Failed to load examinations. Please try again.'
    )
  }
  finally {
    loading.value =
      false
  }
}

// ===========================================
// ON MOUNT
// ===========================================

onMounted(async () => {
  await Promise.all([
    fetchExams(),
    fetchClasses()
  ])
  await loadAnalytics()
})

// ===========================================
// PERFORMANCE ANALYTICS
// ===========================================

interface SchoolYearInfo {
  id: number
  year: string
  status?: string
}

interface FacultyClass {
  id: number
  school_year_id: number
  semester: string
  grade: string
  section?: string
  school_year?: SchoolYearInfo
  subject?: { id: number; name: string }
  section_data?: { id: number; section: string }
}

interface StudentAnalyticsResult {
  student_name: string
  percentage: number
  passed: boolean
}

interface AssessmentAnalytics {
  id: number
  title: string
  subject: string
  section: string
  average: number
  students: StudentAnalyticsResult[]
  passed: number
  failed: number
}

const facultyClasses = ref<FacultyClass[]>([])
const selectedSchoolYear = ref('All School Years')
const selectedSemester = ref('All Semesters')
const selectedClassId = ref('all')
const analyticsLoading = ref(false)
const analyticsError = ref('')
const assessmentAnalytics = ref<AssessmentAnalytics[]>([])

async function fetchClasses() {
  try {
    const response = await api.get('/faculty/classes')
    facultyClasses.value = Array.isArray(response.data?.data)
      ? response.data.data
      : []

    const activeClass = facultyClasses.value.find(
      item => String(item.school_year?.status || '').toLowerCase() === 'active'
    )

    if (activeClass?.school_year?.year) {
      selectedSchoolYear.value = activeClass.school_year.year
      selectedSemester.value = activeClass.semester || 'All Semesters'
    }
  } catch (error) {
    console.error('FACULTY CLASSES LOAD ERROR:', error)
  }
}

const schoolYears = computed(() => {
  return [...new Set(
    facultyClasses.value
      .map(item => item.school_year?.year)
      .filter((year): year is string => Boolean(year))
  )]
})

const analyticsClasses = computed(() => {
  return facultyClasses.value.filter(item => {
    const yearMatch =
      selectedSchoolYear.value === 'All School Years' ||
      item.school_year?.year === selectedSchoolYear.value

    const semesterMatch =
      selectedSemester.value === 'All Semesters' ||
      item.semester === selectedSemester.value

    return yearMatch && semesterMatch
  })
})

function classLabel(schoolClass: FacultyClass) {
  const section =
    schoolClass.section_data?.section ||
    schoolClass.section ||
    'No Section'

  const subject = schoolClass.subject?.name || 'No Subject'

  return `${schoolClass.grade} - ${section} • ${subject}`
}

const selectedAnalyticsClassIds = computed(() => {
  if (selectedClassId.value !== 'all') {
    return [Number(selectedClassId.value)]
  }

  return analyticsClasses.value.map(item => Number(item.id))
})

async function loadAnalytics() {
  analyticsLoading.value = true
  analyticsError.value = ''
  assessmentAnalytics.value = []

  try {
    const classIds = selectedAnalyticsClassIds.value

    if (!classIds.length) {
      analyticsLoading.value = false
      return
    }

    const eligibleExams = exams.value.filter(exam =>
      exam.class_id && classIds.includes(Number(exam.class_id))
    )

    const requests = eligibleExams.map(async exam => {
      try {
        const response = await api.get(`/faculty/exam-results/${exam.id}`)
        const summary = response.data?.summary
        const students = Array.isArray(response.data?.data)
          ? response.data.data
          : []

        if (!summary || students.length === 0) {
          return null
        }

        return {
          id: Number(exam.id),
          title: String(exam.title || 'Assessment'),
          subject: String(exam.subject || 'No Subject'),
          section: String(exam.section || 'No Section'),
          average: Math.max(0, Math.min(100, Number(summary.average_percentage || 0))),
          students: students.map((student: any) => ({
            student_name: String(student.student_name || 'Student'),
            percentage: Number(student.percentage || 0),
            passed: Boolean(student.passed)
          })),
          passed: Number(summary.passed || 0),
          failed: Number(summary.failed || 0)
        } as AssessmentAnalytics
      } catch (error: any) {
        if (error.response?.status !== 404) {
          console.error(`ANALYTICS EXAM ${exam.id} ERROR:`, error)
        }
        return null
      }
    })

    const results = await Promise.all(requests)
    assessmentAnalytics.value = results.filter(
      (item): item is AssessmentAnalytics => item !== null
    )
  } catch (error) {
    console.error('ANALYTICS LOAD ERROR:', error)
    analyticsError.value = 'Unable to load performance analytics.'
  } finally {
    analyticsLoading.value = false
  }
}

const analyticsSummary = computed(() => {
  const assessments = assessmentAnalytics.value.length
  const allResults = assessmentAnalytics.value.flatMap(item => item.students)
  const totalSubmissions = allResults.length

  const uniqueStudents = new Set(
    allResults.map(item => item.student_name.trim().toLowerCase())
  )

  const averageScore = totalSubmissions > 0
    ? allResults.reduce((sum, item) => sum + Number(item.percentage || 0), 0) / totalSubmissions
    : 0

  const passed = assessmentAnalytics.value.reduce((sum, item) => sum + item.passed, 0)
  const failed = assessmentAnalytics.value.reduce((sum, item) => sum + item.failed, 0)
  const passRate = passed + failed > 0
    ? (passed / (passed + failed)) * 100
    : 0

  return {
    studentsAssessed: uniqueStudents.size,
    assessments,
    averageScore,
    passRate,
    passed,
    failed,
    totalSubmissions
  }
})

const studentPeriodAverages = computed(() => {
  const grouped = new Map<string, { name: string; total: number; count: number }>()

  assessmentAnalytics.value.forEach(assessment => {
    assessment.students.forEach(student => {
      const key = student.student_name.trim().toLowerCase()
      const current = grouped.get(key) || {
        name: student.student_name,
        total: 0,
        count: 0
      }
      current.total += Number(student.percentage || 0)
      current.count += 1
      grouped.set(key, current)
    })
  })

  return [...grouped.values()].map(item => ({
    name: item.name,
    average: item.count > 0 ? item.total / item.count : 0
  }))
})

const performanceDistribution = computed(() => {
  const students = studentPeriodAverages.value
  const groups = [
    { label: 'Excellent', range: '90–100%', min: 90, max: 100 },
    { label: 'Very Good', range: '85–89%', min: 85, max: 89.999 },
    { label: 'Good', range: '80–84%', min: 80, max: 84.999 },
    { label: 'Satisfactory', range: '75–79%', min: 75, max: 79.999 },
    { label: 'Below 75', range: '0–74%', min: 0, max: 74.999 }
  ]

  const counts = groups.map(group => ({
    ...group,
    count: students.filter(student =>
      student.average >= group.min && student.average <= group.max
    ).length
  }))

  const highest = Math.max(1, ...counts.map(item => item.count))

  return counts.map(item => ({
    ...item,
    width: (item.count / highest) * 100
  }))
})

const assessmentPerformance = computed(() => {
  return [...assessmentAnalytics.value]
    .sort((a, b) => b.average - a.average)
})

const donutStyle = computed(() => {
  const total = analyticsSummary.value.passed + analyticsSummary.value.failed
  const passedPercent = total > 0
    ? (analyticsSummary.value.passed / total) * 100
    : 0

  return {
    background: total > 0
      ? `conic-gradient(#16a34a 0 ${passedPercent}%, #dc2626 ${passedPercent}% 100%)`
      : '#e2e8f0'
  }
})

watch(
  [selectedSchoolYear, selectedSemester],
  async () => {
    const validIds = analyticsClasses.value.map(item => String(item.id))
    if (
      selectedClassId.value !== 'all' &&
      !validIds.includes(selectedClassId.value)
    ) {
      selectedClassId.value = 'all'
    }
    await loadAnalytics()
  }
)

watch(selectedClassId, async () => {
  await loadAnalytics()
})

</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.dashboard {
  padding: 32px 40px;
  background: #f8fafc;
  min-height: 100vh;
  font-family:
    "Segoe UI",
    Arial,
    Helvetica,
    sans-serif;
  color: #0f172a;
  -webkit-font-smoothing:
    antialiased;
}

.dashboard-header {
  display: flex;
  justify-content:
    space-between;
  align-items: center;
  gap: 20px;
  margin-bottom: 28px;
}

.dashboard-header h1 {
  font-size: 26px;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: #0f172a;
}

.dashboard-header p {
  margin-top: 5px;
  color: #64748b;
  font-size: 14px;
}

.new-exam-btn {
  border: none;
  background: #00c853;
  color: white;
  padding: 12px 22px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition:
    background .15s ease,
    transform .15s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
}

.new-exam-btn:hover {
  background: #00a845;
  transform:
    translateY(-1px);
}

.stats {
  display: grid;
  grid-template-columns:
    repeat(4, 1fr);
  gap: 14px;
  margin-bottom: 28px;
}

.card {
  background: #ffffff;
  border:
    1px solid #e2e8f0;
  border-radius: 12px;
  padding: 20px 22px;
  min-height: 90px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow:
    0 1px 2px
    rgba(15, 23, 42, .03);
}

.stat-icon {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  background: #eaf9ef;
  color: #00b248;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.card span {
  display: block;
  color: #64748b;
  font-size: 13px;
  font-weight: 500;
  margin-bottom: 8px;
}

.card h2 {
  color: #0f172a;
  font-size: 26px;
  font-weight: 700;
  line-height: 1;
}

.exam-section {
  background: white;
  border:
    1px solid #e2e8f0;
  border-radius: 14px;
  padding: 26px;
  box-shadow:
    0 1px 3px
    rgba(15, 23, 42, .04);
}

.exam-header {
  display: flex;
  justify-content:
    space-between;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
  padding-bottom: 20px;
  border-bottom:
    1px solid #f1f5f9;
}

.exam-header h2 {
  font-size: 18px;
  font-weight: 700;
}

.exam-header p {
  color: #64748b;
  font-size: 13px;
  margin-top: 4px;
}

.filters {
  display: flex;
  gap: 10px;
}

.search-box {
  position: relative;
  display: flex;
  align-items: center;
}

.search-box svg {
  position: absolute;
  left: 12px;
  color: #94a3b8;
  pointer-events: none;
}

.filters input,
.filters select {
  height: 38px;
  border:
    1px solid #e2e8f0;
  border-radius: 8px;
  background: #f8fafc;
  padding: 0 12px;
  outline: none;
  font-size: 13px;
}

.search-box input {
  width: 230px;
  padding-left: 38px;
}

.exam-card {
  background: #fff;
  border:
    1px solid #e2e8f0;
  border-radius: 12px;
  padding: 20px 22px;
  margin-bottom: 14px;
}

.exam-card:hover {
  border-color: #cbd5e1;
  box-shadow:
    0 4px 14px
    rgba(15, 23, 42, .06);
}

.exam-title {
  display: flex;
  justify-content:
    space-between;
  align-items:
    flex-start;
  gap: 16px;
  margin-bottom: 18px;
  padding-bottom: 16px;
  border-bottom:
    1px solid #f1f5f9;
}

.exam-title h3 {
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 8px;
}

.badge {
  display: inline-flex;
  padding: 4px 11px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
}

.draft {
  background: #fef3e7;
  color: #c2540a;
}

.published {
  background: #e7f5ec;
  color: #0f7a3d;
}

.finished {
  background: #e8eefc;
  color: #334ca1;
}

.started {
  background: #e0f2fe;
  color: #0369a1;
}

.buttons {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.buttons button {
  height: 34px;
  padding: 0 14px;
  border-radius: 7px;
  border:
    1px solid #e2e8f0;
  background: white;
  color: #334155;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
}

.publish-btn,
.start-btn {
  background:
    #00c853 !important;
  border-color:
    #00c853 !important;
  color:
    white !important;
}

.publish-btn:hover,
.start-btn:hover {
  background:
    #00a845 !important;
}

.delete {
  color:
    #b91c1c !important;
  border-color:
    #fecaca !important;
}

.exam-info {
  display: grid;
  grid-template-columns:
    repeat(
      auto-fit,
      minmax(115px, 1fr)
    );
  gap: 10px;
}

.exam-info div,
.preview-info div,
.dialog-info div {
  background: #f8fafc;
  border-radius: 8px;
  padding: 12px 10px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.info-icon {
  color: #00b248;
  margin-bottom: 7px;
}

.exam-info small,
.preview-info small,
.dialog-info small {
  color: #94a3b8;
  font-size: 11px;
  margin-bottom: 6px;
  text-transform: uppercase;
}

.exam-info strong,
.preview-info strong,
.dialog-info strong {
  color: #0f172a;
  font-size: 13px;
}

.empty {
  text-align: center;
  padding: 70px 20px;
  color: #94a3b8;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.empty svg {
  color: #cbd5e1;
  margin-bottom: 15px;
}

.empty h2 {
  color: #334155;
  font-size: 16px;
  margin-bottom: 8px;
}

.preview-overlay,
.dialog-overlay {
  position: fixed;
  inset: 0;
  background:
    rgba(15, 23, 42, .5);
  backdrop-filter:
    blur(4px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  padding: 20px;
  overflow-y: auto;
}

.preview-modal,
.dialog {
  background: white;
  border-radius: 16px;
  box-shadow:
    0 20px 50px
    rgba(15, 23, 42, .2);
}

.preview-modal {
  width: 900px;
  max-width: 95%;
  max-height: 90vh;
  overflow-y: auto;
  padding: 28px;
}

.preview-header {
  display: flex;
  justify-content:
    space-between;
  align-items:
    flex-start;
  margin-bottom: 22px;
  padding-bottom: 18px;
  border-bottom:
    1px solid #f1f5f9;
}

.close-btn {
  border:
    1px solid #e2e8f0;
  background: white;
  border-radius: 7px;
  padding: 8px 14px;
  cursor: pointer;
  display: flex;
  gap: 6px;
}

.preview-info {
  display: grid;
  grid-template-columns:
    repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 26px;
}

.question-preview h3 {
  font-size: 14px;
  margin-bottom: 12px;
}

.question-preview p {
  font-size: 17px;
  font-weight: 600;
  margin-bottom: 18px;
}

.option {
  border:
    1px solid #e2e8f0;
  border-radius: 8px;
  padding: 13px 16px;
  margin-bottom: 9px;
  font-size: 14px;
}

.preview-footer {
  margin-top: 26px;
  padding-top: 20px;
  border-top:
    1px solid #f1f5f9;
  display: flex;
  justify-content:
    space-between;
  align-items: center;
}

.nav-btn {
  border:
    1px solid #e2e8f0;
  background: white;
  padding: 10px 18px;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
}

.nav-btn:disabled {
  opacity: .45;
  cursor: not-allowed;
}

.dialog {
  width: 480px;
  max-width: 95%;
  padding: 32px;
  text-align: center;
}

.dialog-icon {
  width: 70px;
  height: 70px;
  margin:
    0 auto 15px;
  border-radius: 50%;
  background: #eaf9ef;
  color: #00b248;
  display: flex;
  align-items: center;
  justify-content: center;
}

.dialog h2 {
  font-size: 19px;
}

.dialog p {
  color: #64748b;
  font-size: 13px;
  line-height: 1.6;
  margin:
    14px 0 22px;
}

.dialog-info {
  display: grid;
  grid-template-columns:
    repeat(2, 1fr);
  gap: 10px;
  margin-bottom: 24px;
}

.dialog-buttons {
  display: flex;
  gap: 10px;
}

.cancel-btn,
.dialog .start-btn,
.action-confirm-btn {
  flex: 1;
  min-height: 44px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
}

.cancel-btn {
  border:
    1px solid #e2e8f0;
  background: white;
  color: #334155;
}

.dialog .start-btn {
  border: none;
  background: #00c853;
  color: white;
}

/* ======================
   PERFORMANCE ANALYTICS
====================== */

.analytics-section {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 26px;
  margin-bottom: 28px;
  box-shadow: 0 1px 3px rgba(15, 23, 42, .04);
}

.analytics-heading {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 18px;
  padding-bottom: 20px;
  margin-bottom: 22px;
  border-bottom: 1px solid #f1f5f9;
}

.analytics-heading h2 {
  font-size: 18px;
  font-weight: 700;
}

.analytics-heading p,
.chart-header p,
.analytics-empty p {
  color: #64748b;
  font-size: 13px;
  margin-top: 5px;
}

.analytics-filters {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.analytics-filters select {
  min-width: 150px;
  height: 40px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #f8fafc;
  padding: 0 12px;
  color: #334155;
  font-size: 13px;
  outline: none;
}

.analytics-stats {
  margin-bottom: 22px;
}

.analytics-state,
.analytics-empty {
  min-height: 180px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 10px;
  color: #64748b;
  text-align: center;
}

.analytics-error {
  color: #b91c1c;
}

.analytics-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.5fr) minmax(300px, .7fr);
  gap: 16px;
}

.analytics-card {
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 20px;
  background: #fff;
  min-width: 0;
}

.wide-card {
  grid-column: 1 / -1;
}

.chart-header {
  margin-bottom: 20px;
}

.chart-header h3 {
  font-size: 15px;
  color: #0f172a;
}

.bar-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.bar-row {
  display: grid;
  grid-template-columns: 130px minmax(100px, 1fr) 70px;
  align-items: center;
  gap: 12px;
}

.bar-meta {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  font-size: 12px;
}

.bar-meta span {
  color: #334155;
  font-weight: 600;
}

.bar-meta strong {
  color: #0f172a;
}

.bar-track,
.assessment-track {
  height: 10px;
  overflow: hidden;
  background: #eef2f7;
  border-radius: 999px;
}

.bar-fill,
.assessment-fill {
  height: 100%;
  background: #00c853;
  border-radius: inherit;
  transition: width .25s ease;
}

.bar-row small {
  color: #94a3b8;
  font-size: 11px;
}

.donut-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 24px;
  padding: 8px 0;
}

.donut {
  width: 180px;
  height: 180px;
  border-radius: 50%;
  display: grid;
  place-items: center;
}

.donut-center {
  width: 118px;
  height: 118px;
  border-radius: 50%;
  background: #ffffff;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 0 1px #f1f5f9;
}

.donut-center strong {
  font-size: 25px;
}

.donut-center span {
  color: #64748b;
  font-size: 12px;
  margin-top: 3px;
}

.legend {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.legend > div {
  display: grid;
  grid-template-columns: 12px 1fr auto;
  align-items: center;
  gap: 8px;
  color: #475569;
  font-size: 13px;
}

.legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.pass-dot { background: #16a34a; }
.fail-dot { background: #dc2626; }

.assessment-bars {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.assessment-row {
  display: grid;
  grid-template-columns: minmax(170px, 280px) minmax(160px, 1fr) 64px;
  align-items: center;
  gap: 14px;
}

.assessment-name {
  min-width: 0;
}

.assessment-name strong,
.assessment-name span {
  display: block;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.assessment-name strong {
  font-size: 13px;
  color: #0f172a;
}

.assessment-name span {
  margin-top: 3px;
  color: #94a3b8;
  font-size: 11px;
}

.assessment-value {
  font-size: 13px;
  text-align: right;
}

/* ======================
   ACTION CONFIRMATION
====================== */

.action-dialog-icon {
  width: 70px;
  height: 70px;
  margin:
    0 auto 15px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-dialog-icon.publish,
.action-dialog-icon.restart {
  background: #eaf9ef;
  color: #00b248;
}

.action-dialog-icon.delete {
  background: #fee2e2;
  color: #dc2626;
}

.action-exam-info {
  margin-bottom: 24px;
  padding: 14px;
  border:
    1px solid #e2e8f0;
  border-radius: 10px;
  background: #f8fafc;
}

.action-exam-info strong {
  display: block;
  color: #0f172a;
  font-size: 14px;
  margin-bottom: 5px;
}

.action-exam-info span {
  color: #64748b;
  font-size: 12px;
}

.action-confirm-btn {
  border: none;
  color: white;
}

.action-confirm-btn.publish,
.action-confirm-btn.restart {
  background: #00c853;
}

.action-confirm-btn.publish:hover,
.action-confirm-btn.restart:hover {
  background: #00a845;
}

.action-confirm-btn.delete {
  background: #dc2626;
  color: #ffffff !important;
}

.action-confirm-btn.delete:hover {
  background: #b91c1c;
  color: #ffffff !important;
}

.action-confirm-btn.delete span,
.action-confirm-btn.delete svg {
  color: #ffffff !important;
  stroke: #ffffff !important;
}

.action-confirm-btn:disabled,
.cancel-btn:disabled {
  opacity: .6;
  cursor: not-allowed;
}

/* ======================
   NOTIFICATION
====================== */

.notification-container {
  position: fixed;
  top: 25px;
  right: 25px;
  z-index: 10000;
  width: 390px;
  max-width:
    calc(100vw - 40px);
  padding:
    16px 45px 16px 16px;
  display: flex;
  align-items: flex-start;
  gap: 14px;
  border:
    1px solid #e5e7eb;
  border-radius: 14px;
  background: white;
  box-shadow:
    0 15px 35px
    rgba(0, 0, 0, .15);
}

.notification-icon {
  width: 38px;
  height: 38px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.notification-content {
  flex: 1;
}

.notification-content strong {
  display: block;
  margin-bottom: 3px;
  color: #1e293b;
  font-size: 14px;
}

.notification-content p {
  margin: 0;
  color: #64748b;
  font-size: 13px;
  line-height: 1.5;
}

.notification-container.success {
  border-left:
    5px solid #16a34a;
}

.notification-container.success
.notification-icon {
  background: #dcfce7;
  color: #16a34a;
}

.notification-container.error {
  border-left:
    5px solid #dc2626;
}

.notification-container.error
.notification-icon {
  background: #fee2e2;
  color: #dc2626;
}

.notification-container.info {
  border-left:
    5px solid #2563eb;
}

.notification-container.info
.notification-icon {
  background: #dbeafe;
  color: #2563eb;
}

.notification-close {
  position: absolute;
  top: 10px;
  right: 12px;
  border: none;
  background: transparent;
  color: #94a3b8;
  cursor: pointer;
}

.notification-enter-active,
.notification-leave-active {
  transition:
    opacity .25s ease,
    transform .25s ease;
}

.notification-enter-from,
.notification-leave-to {
  opacity: 0;
  transform:
    translateX(30px);
}

.spin {
  animation:
    spin .8s linear
    infinite;
}

@keyframes spin {
  to {
    transform:
      rotate(360deg);
  }
}

/* ======================
   RESPONSIVE
====================== */

@media (max-width: 1024px) {
  .stats {
    grid-template-columns:
      repeat(2, 1fr);
  }

  .analytics-grid {
    grid-template-columns: 1fr;
  }

  .wide-card {
    grid-column: auto;
  }

  .preview-info {
    grid-template-columns:
      repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .dashboard {
    padding: 18px;
  }

  .dashboard-header,
  .analytics-heading,
  .exam-header,
  .exam-title {
    flex-direction: column;
    align-items:
      flex-start;
  }

  .new-exam-btn {
    width: 100%;
  }

  .analytics-filters {
    width: 100%;
    justify-content: stretch;
  }

  .analytics-filters select {
    width: 100%;
  }

  .bar-row,
  .assessment-row {
    grid-template-columns: 1fr;
    gap: 7px;
  }

  .assessment-value {
    text-align: left;
  }

  .filters {
    width: 100%;
    flex-direction:
      column;
  }

  .search-box,
  .search-box input,
  .filters select {
    width: 100%;
  }

  .buttons {
    width: 100%;
  }

  .buttons button {
    flex: 1;
    min-width: 120px;
  }

  .stats,
  .exam-info,
  .preview-info,
  .dialog-info {
    grid-template-columns:
      1fr;
  }

  .dialog-buttons {
    flex-direction:
      column;
  }

  .preview-footer {
    flex-wrap: wrap;
  }

  .notification-container {
    top: 15px;
    right: 15px;
    left: 15px;
    width: auto;
    max-width: none;
  }
}

@media (max-width: 480px) {
  .dashboard {
    padding: 12px;
  }

  .exam-section {
    padding: 16px;
  }

  .stats {
    gap: 10px;
  }

  .card {
    padding: 16px;
  }

  .buttons button {
    width: 100%;
    min-width: 100%;
  }

  .preview-modal,
  .dialog {
    padding: 20px;
  }

  .preview-footer {
    justify-content: center;
  }
}
</style>
