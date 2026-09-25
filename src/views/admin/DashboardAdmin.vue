<template>
  <div class="dashboard-page">
    <div class="page-header">
      <div>
        <h1>Admin Dashboard</h1>
        <p>View current user, student, and class analytics.</p>
      </div>
    </div>

    <div v-if="errorMessage" class="notification error">
      <CircleAlert :size="20" />
      <span>{{ errorMessage }}</span>
    </div>

    <div v-if="loading" class="loading-state">
      <LoaderCircle :size="30" class="spinner" />
      <span>Loading dashboard...</span>
    </div>

    <template v-else>
      <section class="analytics-shell">
        <div class="analytics-header">
          <div>
            <h2>School Analytics</h2>
            <p>Descriptive analytics based on current accounts and classes.</p>
          </div>
          <BarChart3 :size="23" />
        </div>

        <div class="summary-grid">
          <div class="summary-card">
            <div class="card-icon"><UsersRound :size="24" /></div>
            <div class="card-content"><span>Total Faculty</span><strong>{{ dashboard.cards.faculty }}</strong></div>
          </div>
          <div class="summary-card">
            <div class="card-icon"><GraduationCap :size="24" /></div>
            <div class="card-content"><span>Total Students</span><strong>{{ dashboard.cards.students }}</strong></div>
          </div>
          <div class="summary-card">
            <div class="card-icon"><BookOpenText :size="24" /></div>
            <div class="card-content"><span>Total Classes</span><strong>{{ dashboard.cards.classes }}</strong></div>
          </div>
          <div class="summary-card">
            <div class="card-icon"><School :size="24" /></div>
            <div class="card-content"><span>Total Sections</span><strong>{{ dashboard.cards.sections }}</strong></div>
          </div>
        </div>

        <div class="analytics-grid">
          <div class="chart-card">
            <div class="chart-header">
              <div><h3>User Distribution</h3><p>Distribution of faculty and student accounts.</p></div>
              <UsersRound :size="21" />
            </div>
            <div v-if="userTotal === 0" class="empty-chart">
              <UsersRound :size="38" /><strong>No user data available</strong>
              <span>Add faculty or student accounts to display this graph.</span>
            </div>
            <div v-else class="gender-chart-layout">
              <div class="pie-container"><canvas ref="userChartCanvas"></canvas></div>
              <div class="gender-summary">
                <div class="gender-row">
                  <div class="gender-label"><span class="gender-dot male"></span><span>Faculty</span></div>
                  <div class="gender-value"><strong>{{ dashboard.user_distribution.faculty }}</strong><span>{{ facultyPercentage }}%</span></div>
                </div>
                <div class="gender-row">
                  <div class="gender-label"><span class="gender-dot female"></span><span>Students</span></div>
                  <div class="gender-value"><strong>{{ dashboard.user_distribution.students }}</strong><span>{{ studentPercentage }}%</span></div>
                </div>
                <div class="gender-total"><span>Total Users</span><strong>{{ userTotal }}</strong></div>
              </div>
            </div>
          </div>

          <div class="chart-card">
            <div class="chart-header">
              <div><h3>Student Gender Distribution</h3><p>Distribution of male and female student accounts.</p></div>
              <Users :size="21" />
            </div>
            <div v-if="genderTotal === 0" class="empty-chart">
              <Users :size="38" /><strong>No student data available</strong>
              <span>Add student accounts to display this graph.</span>
            </div>
            <div v-else class="gender-chart-layout">
              <div class="pie-container"><canvas ref="genderChartCanvas"></canvas></div>
              <div class="gender-summary">
                <div class="gender-row">
                  <div class="gender-label"><span class="gender-dot male"></span><span>Male</span></div>
                  <div class="gender-value"><strong>{{ dashboard.gender_distribution.male }}</strong><span>{{ malePercentage }}%</span></div>
                </div>
                <div class="gender-row">
                  <div class="gender-label"><span class="gender-dot female"></span><span>Female</span></div>
                  <div class="gender-value"><strong>{{ dashboard.gender_distribution.female }}</strong><span>{{ femalePercentage }}%</span></div>
                </div>
                <div class="gender-total"><span>Total Students</span><strong>{{ genderTotal }}</strong></div>
              </div>
            </div>
          </div>
        </div>

        <div class="analytics-grid">
          <div class="chart-card">
            <div class="chart-header">
              <div><h3>Classes by Strand</h3><p>Number of classes assigned to each strand.</p></div>
              <ChartNoAxesColumnIncreasing :size="21" />
            </div>
            <div v-if="dashboard.classes_by_strand.length === 0" class="empty-chart">
              <ChartNoAxesColumnIncreasing :size="38" /><strong>No strand data available</strong>
              <span>Add strands and classes to display this graph.</span>
            </div>
            <div v-else class="bar-chart-container side-chart"><canvas ref="strandChartCanvas"></canvas></div>
          </div>

          <div class="chart-card">
            <div class="chart-header">
              <div><h3>Classes by Grade Level</h3><p>Distribution of Grade 11 and Grade 12 classes.</p></div>
              <ChartColumnBig :size="21" />
            </div>
            <div v-if="classGradeTotal === 0" class="empty-chart">
              <ChartColumnBig :size="38" /><strong>No grade level data available</strong>
              <span>Add classes to display this graph.</span>
            </div>
            <div v-else class="bar-chart-container side-chart"><canvas ref="gradeChartCanvas"></canvas></div>
          </div>
        </div>
      </section>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import Chart from 'chart.js/auto'
import {
  BarChart3, BookOpenText, ChartColumnBig, ChartNoAxesColumnIncreasing,
  CircleAlert, GraduationCap, LoaderCircle, School, Users, UsersRound
} from '@lucide/vue'
import api from '../../services/api'

interface DashboardCards { faculty: number; students: number; classes: number; sections: number }
interface UserDistribution { faculty: number; students: number }
interface GenderDistribution { male: number; female: number }
interface ClassStrandData { strand_id: number; strand: string; total: number }
interface ClassGradeData { grade: string; total: number }
interface DashboardData {
  cards: DashboardCards
  user_distribution: UserDistribution
  gender_distribution: GenderDistribution
  classes_by_strand: ClassStrandData[]
  classes_by_grade: ClassGradeData[]
}

const loading = ref(true)
const errorMessage = ref('')
const userChartCanvas = ref<HTMLCanvasElement | null>(null)
const genderChartCanvas = ref<HTMLCanvasElement | null>(null)
const strandChartCanvas = ref<HTMLCanvasElement | null>(null)
const gradeChartCanvas = ref<HTMLCanvasElement | null>(null)

let userChart: Chart | null = null
let genderChart: Chart | null = null
let strandChart: Chart | null = null
let gradeChart: Chart | null = null

const dashboard = ref<DashboardData>({
  cards: { faculty: 0, students: 0, classes: 0, sections: 0 },
  user_distribution: { faculty: 0, students: 0 },
  gender_distribution: { male: 0, female: 0 },
  classes_by_strand: [],
  classes_by_grade: []
})

const userTotal = computed(() => dashboard.value.user_distribution.faculty + dashboard.value.user_distribution.students)
const genderTotal = computed(() => dashboard.value.gender_distribution.male + dashboard.value.gender_distribution.female)
const classGradeTotal = computed(() => dashboard.value.classes_by_grade.reduce((sum, item) => sum + Number(item.total || 0), 0))
const facultyPercentage = computed(() => userTotal.value ? Math.round((dashboard.value.user_distribution.faculty / userTotal.value) * 100) : 0)
const studentPercentage = computed(() => userTotal.value ? Math.round((dashboard.value.user_distribution.students / userTotal.value) * 100) : 0)
const malePercentage = computed(() => genderTotal.value ? Math.round((dashboard.value.gender_distribution.male / genderTotal.value) * 100) : 0)
const femalePercentage = computed(() => genderTotal.value ? Math.round((dashboard.value.gender_distribution.female / genderTotal.value) * 100) : 0)

async function fetchDashboard() {
  loading.value = true
  errorMessage.value = ''
  try {
    const response = await api.get('/admin/dashboard')
    if (response.data?.success && response.data?.data) dashboard.value = response.data.data
  } catch (error: any) {
    console.error('DASHBOARD ERROR:', error)
    errorMessage.value = error.response?.data?.message || 'Failed to load dashboard information.'
  } finally {
    loading.value = false
    await nextTick()
    renderCharts()
  }
}

function destroyCharts() {
  userChart?.destroy()
  genderChart?.destroy()
  strandChart?.destroy()
  gradeChart?.destroy()
  userChart = genderChart = strandChart = gradeChart = null
}

function doughnutOptions(total: number): any {
  return {
    responsive: true, maintainAspectRatio: false, resizeDelay: 100, cutout: '68%',
    layout: { padding: 8 },
    plugins: {
      legend: { display: false },
      tooltip: { callbacks: { label(context: any) {
        const value = Number(context.raw || 0)
        const percentage = total ? Math.round((value / total) * 100) : 0
        return `${context.label}: ${value} (${percentage}%)`
      }}}
    }
  }
}

function barOptions(): any {
  return {
    responsive: true, maintainAspectRatio: false, resizeDelay: 100,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { display: false }, ticks: { autoSkip: false, maxRotation: 45, minRotation: 0, font: { family: 'Poppins', size: 10 } } },
      y: { beginAtZero: true, ticks: { precision: 0, stepSize: 1, font: { family: 'Poppins', size: 10 } }, grid: { color: '#ecfdf5' }, title: { display: true, text: 'Number of Classes', font: { family: 'Poppins', size: 10 } } }
    }
  }
}

function horizontalBarOptions(): any {
  return {
    responsive: true,
    maintainAspectRatio: false,
    resizeDelay: 100,
    indexAxis: 'y',
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label(context: any) {
            return `Classes: ${context.raw}`
          }
        }
      }
    },
    scales: {
      x: {
        beginAtZero: true,
        ticks: {
          precision: 0,
          stepSize: 1,
          font: { family: 'Poppins', size: 10 }
        },
        grid: { color: '#ecfdf5' },
        title: {
          display: true,
          text: 'Number of Classes',
          font: { family: 'Poppins', size: 10 }
        }
      },
      y: {
        grid: { display: false },
        ticks: {
          autoSkip: false,
          font: { family: 'Poppins', size: 10 }
        }
      }
    }
  }
}

function renderCharts() {
  destroyCharts()

  if (userChartCanvas.value && userTotal.value) {
    userChart = new Chart(userChartCanvas.value, {
      type: 'doughnut',
      data: { labels: ['Faculty', 'Students'], datasets: [{ data: [dashboard.value.user_distribution.faculty, dashboard.value.user_distribution.students], backgroundColor: ['#15803d', '#86efac'], borderColor: '#ffffff', borderWidth: 4, hoverBackgroundColor: ['#166534', '#4ade80'], hoverOffset: 5 }] },
      options: doughnutOptions(userTotal.value)
    })
  }

if (genderChartCanvas.value && genderTotal.value) {
  genderChart = new Chart(genderChartCanvas.value, {
    type: 'pie',
    data: {
      labels: ['Male', 'Female'],
      datasets: [{
        data: [
          dashboard.value.gender_distribution.male,
          dashboard.value.gender_distribution.female
        ],
        backgroundColor: ['#15803d', '#86efac'],
        borderColor: '#ffffff',
        borderWidth: 4,
        hoverBackgroundColor: ['#166534', '#4ade80'],
        hoverOffset: 5
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      resizeDelay: 100,
      layout: {
        padding: 8
      },
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          callbacks: {
            label(context: any) {
              const value = Number(context.raw || 0)
              const percentage = genderTotal.value
                ? Math.round((value / genderTotal.value) * 100)
                : 0

              return `${context.label}: ${value} (${percentage}%)`
            }
          }
        }
      }
    }
  })
}

  if (strandChartCanvas.value && dashboard.value.classes_by_strand.length) {
    strandChart = new Chart(strandChartCanvas.value, {
      type: 'bar',
      data: { labels: dashboard.value.classes_by_strand.map(item => item.strand), datasets: [{ label: 'Classes', data: dashboard.value.classes_by_strand.map(item => item.total), backgroundColor: '#15803d', hoverBackgroundColor: '#166534', borderRadius: 6, maxBarThickness: 55 }] },
      options: horizontalBarOptions()
    })
  }

  if (gradeChartCanvas.value && classGradeTotal.value) {
    gradeChart = new Chart(gradeChartCanvas.value, {
      type: 'polarArea',
      data: {
        labels: dashboard.value.classes_by_grade.map(item => item.grade),
        datasets: [{
          label: 'Classes',
          data: dashboard.value.classes_by_grade.map(item => item.total),
          backgroundColor: ['#15803d', '#86efac'],
          borderColor: '#ffffff',
          borderWidth: 3
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        resizeDelay: 100,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              usePointStyle: true,
              boxWidth: 8,
              boxHeight: 8,
              padding: 16,
              font: { family: 'Poppins', size: 10 }
            }
          },
          tooltip: {
            callbacks: {
              label(context: any) {
                return `${context.label}: ${context.raw} classes`
              }
            }
          }
        },
        scales: {
          r: {
            beginAtZero: true,
            ticks: {
              precision: 0,
              stepSize: 1,
              backdropColor: 'transparent',
              font: { family: 'Poppins', size: 9 }
            },
            grid: { color: '#dcfce7' },
            angleLines: { color: '#dcfce7' }
          }
        }
      }
    })
  }
}

onMounted(fetchDashboard)
onBeforeUnmount(destroyCharts)
</script>

<style scoped>
* {
  box-sizing: border-box;
}

.dashboard-page {
  width: 100%;
  min-height: calc(100vh - 70px);
  padding: 22px 28px 32px;
  background: #f8fafc;
  color: #0f172a;
  font-family: 'Poppins', sans-serif;
}

.page-header {
  margin-bottom: 22px;
}

.page-header h1 {
  margin: 0;
  font-size: 25px;
  font-weight: 800;
  letter-spacing: -.02em;
}

.page-header p {
  margin: 5px 0 0;
  color: #64748b;
  font-size: 12px;
}

.analytics-shell {
  padding: 26px 28px;
  border: 1px solid #dfe7ef;
  border-radius: 15px;
  background: #fff;
  box-shadow: 0 2px 8px rgba(15, 23, 42, .03);
}

.analytics-header {
  padding-bottom: 20px;
  border-bottom: 1px solid #edf2f7;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 15px;
}

.analytics-header h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 800;
}

.analytics-header p {
  margin: 5px 0 0;
  color: #64748b;
  font-size: 11px;
}

.analytics-header > svg,
.chart-header > svg {
  color: #16a34a;
  flex-shrink: 0;
}

.summary-grid {
  margin: 22px 0;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
}

.summary-card {
  min-height: 100px;
  padding: 17px 20px;
  border: 1px solid #dfe7ef;
  border-radius: 12px;
  background: #fff;
  display: flex;
  align-items: center;
  gap: 15px;
}

.card-icon {
  width: 48px;
  height: 48px;
  border-radius: 11px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  background: #eaf9ef;
  color: #16a34a;
}

.card-content {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.card-content span {
  color: #64748b;
  font-size: 11px;
  font-weight: 600;
}

.card-content strong {
  color: #0f172a;
  font-size: 27px;
  line-height: 1;
  font-weight: 800;
}

.analytics-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
  margin-bottom: 14px;
}

.chart-card {
  min-width: 0;
  padding: 20px;
  border: 1px solid #dfe7ef;
  border-radius: 12px;
  background: #fff;
}

.chart-header {
  margin-bottom: 16px;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 14px;
}

.chart-header h3 {
  margin: 0;
  font-size: 14px;
  font-weight: 800;
}

.chart-header p {
  margin: 4px 0 0;
  color: #64748b;
  font-size: 10px;
  line-height: 1.45;
}

.gender-chart-layout {
  min-height: 250px;
  display: grid;
  grid-template-columns: minmax(180px, 1fr) minmax(180px, 1fr);
  align-items: center;
  gap: 22px;
}

.pie-container {
  position: relative;
  width: 100%;
  max-width: 230px;
  height: 230px;
  margin: 0 auto;
}

.pie-container canvas {
  width: 100% !important;
  height: 100% !important;
}

.gender-summary {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.gender-row,
.gender-total {
  padding: 12px 13px;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.gender-row {
  border: 1px solid #e2e8f0;
  background: #f8fafc;
}

.gender-total {
  border: 1px solid #bbf7d0;
  background: #f0fdf4;
}

.gender-label,
.gender-value {
  display: flex;
  align-items: center;
}

.gender-label {
  gap: 8px;
  color: #334155;
  font-size: 11px;
  font-weight: 700;
}

.gender-value {
  gap: 9px;
}

.gender-dot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
}

.gender-dot.male {
  background: #16a34a;
}

.gender-dot.female {
  background: #86efac;
}

.gender-value strong {
  font-size: 17px;
}

.gender-value span {
  min-width: 42px;
  padding: 3px 6px;
  border-radius: 999px;
  background: #e2e8f0;
  color: #475569;
  font-size: 9px;
  font-weight: 700;
  text-align: center;
}

.gender-total span {
  color: #166534;
  font-size: 11px;
  font-weight: 700;
}

.gender-total strong {
  color: #15803d;
  font-size: 18px;
}

.bar-chart-container {
  position: relative;
  width: 100%;
  overflow-x: auto;
}

.side-chart {
  height: 280px;
}

.grade-chart {
  height: 320px;
}

.full-chart-card {
  margin-top: 0;
}

.empty-chart {
  min-height: 230px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  color: #94a3b8;
  text-align: center;
}

.empty-chart strong {
  color: #64748b;
  font-size: 12px;
}

.empty-chart span {
  font-size: 10px;
}

.notification {
  margin-bottom: 18px;
  padding: 13px 16px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  gap: 9px;
  font-size: 12px;
  font-weight: 600;
}

.notification.error {
  border: 1px solid #fecaca;
  background: #fef2f2;
  color: #dc2626;
}

.loading-state {
  min-height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  color: #64748b;
  font-size: 12px;
}

.spinner {
  animation: spin .8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media(max-width: 1100px) {
  .summary-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .analytics-grid {
    grid-template-columns: 1fr;
  }

  .side-chart {
    height: 320px;
  }
}

@media(max-width: 760px) {
  .dashboard-page {
    padding: 18px;
  }

  .analytics-shell {
    padding: 20px;
  }

  .summary-grid {
    grid-template-columns: 1fr;
  }

  .gender-chart-layout {
    grid-template-columns: 1fr;
  }

  .gender-summary {
    width: 100%;
  }

  .pie-container {
    height: 220px;
  }
}

@media(max-width: 480px) {
  .dashboard-page {
    padding: 12px;
  }

  .analytics-shell,
  .chart-card {
    padding: 15px;
  }

  .analytics-header {
    align-items: flex-start;
  }

  .grade-chart,
  .side-chart {
    height: 290px;
  }
}
</style>
