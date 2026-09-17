<template>
  <div class="dashboard-page">
    <div class="page-header">
      <div>
        <h1>Admin Dashboard</h1>
        <p>View the current student population and school account analytics.</p>
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
            <p>Simple descriptive graphs based on current registered accounts.</p>
          </div>
          <BarChart3 :size="23" />
        </div>

        <div class="summary-grid">
          <div class="summary-card">
            <div class="card-icon"><UsersRound :size="24" /></div>
            <div class="card-content">
              <span>Total Faculty</span>
              <strong>{{ dashboard.cards.faculty }}</strong>
            </div>
          </div>

          <div class="summary-card">
            <div class="card-icon"><GraduationCap :size="24" /></div>
            <div class="card-content">
              <span>Total Students</span>
              <strong>{{ dashboard.cards.students }}</strong>
            </div>
          </div>

          <div class="summary-card">
            <div class="card-icon"><BookOpenText :size="24" /></div>
            <div class="card-content">
              <span>Total Strands</span>
              <strong>{{ dashboard.cards.strands }}</strong>
            </div>
          </div>

          <div class="summary-card">
            <div class="card-icon"><School :size="24" /></div>
            <div class="card-content">
              <span>Total Sections</span>
              <strong>{{ dashboard.cards.sections }}</strong>
            </div>
          </div>
        </div>

        <div class="analytics-grid">
          <div class="chart-card">
            <div class="chart-header">
              <div>
                <h3>Student Gender Distribution</h3>
                <p>Distribution of male and female students.</p>
              </div>
              <Users :size="21" />
            </div>

            <div v-if="dashboard.cards.students === 0" class="empty-chart">
              <Users :size="38" />
              <strong>No student data available</strong>
              <span>Add student accounts to display this graph.</span>
            </div>

            <div v-else class="gender-chart-layout">
              <div class="pie-container">
                <canvas ref="genderChartCanvas"></canvas>
              </div>

              <div class="gender-summary">
                <div class="gender-row">
                  <div class="gender-label">
                    <span class="gender-dot male"></span>
                    <span>Male</span>
                  </div>
                  <div class="gender-value">
                    <strong>{{ dashboard.gender_distribution.male }}</strong>
                    <span>{{ malePercentage }}%</span>
                  </div>
                </div>

                <div class="gender-row">
                  <div class="gender-label">
                    <span class="gender-dot female"></span>
                    <span>Female</span>
                  </div>
                  <div class="gender-value">
                    <strong>{{ dashboard.gender_distribution.female }}</strong>
                    <span>{{ femalePercentage }}%</span>
                  </div>
                </div>

                <div class="gender-total">
                  <span>Total Students</span>
                  <strong>{{ dashboard.cards.students }}</strong>
                </div>
              </div>
            </div>
          </div>

          <div class="chart-card">
            <div class="chart-header">
              <div>
                <h3>Total Students by Strand</h3>
                <p>Current student population grouped by strand.</p>
              </div>
              <ChartNoAxesColumnIncreasing :size="21" />
            </div>

            <div v-if="dashboard.students_by_strand.length === 0" class="empty-chart">
              <ChartNoAxesColumnIncreasing :size="38" />
              <strong>No strand data available</strong>
              <span>Add strands and students to display this graph.</span>
            </div>

            <div v-else class="bar-chart-container side-chart">
              <canvas ref="strandTotalCanvas"></canvas>
            </div>
          </div>
        </div>

        <div class="chart-card full-chart-card">
          <div class="chart-header">
            <div>
              <h3>Students by Strand and Grade Level</h3>
              <p>Male and female distribution for Grade 11 and Grade 12 in each strand.</p>
            </div>
            <ChartColumnBig :size="21" />
          </div>

          <div v-if="dashboard.students_by_strand_grade.length === 0" class="empty-chart">
            <ChartColumnBig :size="38" />
            <strong>No strand data available</strong>
            <span>Add strands and students to display this graph.</span>
          </div>

          <div v-else class="bar-chart-container grade-chart">
            <canvas ref="strandGradeCanvas"></canvas>
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
  BarChart3,
  BookOpenText,
  ChartColumnBig,
  ChartNoAxesColumnIncreasing,
  CircleAlert,
  GraduationCap,
  LoaderCircle,
  School,
  Users,
  UsersRound
} from '@lucide/vue'
import api from '../../services/api'

interface DashboardCards {
  faculty: number
  students: number
  strands: number
  sections: number
}
interface GenderDistribution {
  male: number
  female: number
}
interface StrandGradeData {
  strand_id: number
  strand: string
  grade: string
  label: string
  male: number
  female: number
  total: number
}
interface StrandTotalData {
  strand_id: number
  strand: string
  total: number
}
interface DashboardData {
  cards: DashboardCards
  gender_distribution: GenderDistribution
  students_by_strand_grade: StrandGradeData[]
  students_by_strand: StrandTotalData[]
}
const loading = ref(true)
const errorMessage = ref('')
const genderChartCanvas = ref<HTMLCanvasElement | null>(null)
const strandGradeCanvas = ref<HTMLCanvasElement | null>(null)
const strandTotalCanvas = ref<HTMLCanvasElement | null>(null)
let genderChart: Chart | null = null
let strandGradeChart: Chart | null = null
let strandTotalChart: Chart | null = null
const dashboard = ref<DashboardData>({
  cards: {
    faculty: 0,
    students: 0,
    strands: 0,
    sections: 0
  },
  gender_distribution: {
    male: 0,
    female: 0
  },
  students_by_strand_grade: [],
  students_by_strand: []
})
const genderTotal = computed(() =>
  dashboard.value.gender_distribution.male +
  dashboard.value.gender_distribution.female
)
const malePercentage = computed(() => {
  if (!genderTotal.value) return 0
  return Math.round(
    (dashboard.value.gender_distribution.male / genderTotal.value) * 100
  )
})
const femalePercentage = computed(() => {
  if (!genderTotal.value) return 0
  return Math.round(
    (dashboard.value.gender_distribution.female / genderTotal.value) * 100
  )
})
async function fetchDashboard() {
  loading.value = true
  errorMessage.value = ''
  try {
    const response = await api.get('/admin/dashboard')
    if (response.data?.success && response.data?.data) {
      dashboard.value = response.data.data
    }
  } catch (error: any) {
    console.error('DASHBOARD ERROR:', error)
    errorMessage.value =
      error.response?.data?.message ||
      'Failed to load dashboard information.'
  } finally {
    loading.value = false
    await nextTick()
    renderCharts()
  }
}
function destroyCharts() {
  if (genderChart) {
    genderChart.destroy()
    genderChart = null
  }
  if (strandGradeChart) {
    strandGradeChart.destroy()
    strandGradeChart = null
  }
  if (strandTotalChart) {
    strandTotalChart.destroy()
    strandTotalChart = null
  }
}
function renderCharts() {
  destroyCharts()
  renderGenderChart()
  renderStrandGradeChart()
  renderStrandTotalChart()
}
function renderGenderChart() {
  if (!genderChartCanvas.value || genderTotal.value === 0) return
  genderChart = new Chart(genderChartCanvas.value, {
    type: 'doughnut',
    data: {
      labels: ['Male', 'Female'],
      datasets: [
        {
          data: [
            dashboard.value.gender_distribution.male,
            dashboard.value.gender_distribution.female
          ],
          backgroundColor: [
            '#15803d',
            '#86efac'
          ],
          borderColor: '#ffffff',
          borderWidth: 4,
          hoverBackgroundColor: [
            '#166534',
            '#4ade80'
          ],
          hoverOffset: 5
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      resizeDelay: 100,
      cutout: '68%',
      layout: {
        padding: 8
      },
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          callbacks: {
            label(context) {
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
function renderStrandGradeChart() {
  if (
    !strandGradeCanvas.value ||
    dashboard.value.students_by_strand_grade.length === 0
  ) return
  const labels = dashboard.value.students_by_strand_grade.map(
    item => item.label
  )
  const maleData = dashboard.value.students_by_strand_grade.map(
    item => item.male
  )
  const femaleData = dashboard.value.students_by_strand_grade.map(
    item => item.female
  )
  strandGradeChart = new Chart(strandGradeCanvas.value, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: 'Male',
          data: maleData,
          backgroundColor: '#15803d',
          hoverBackgroundColor: '#166534',
          borderRadius: 5,
          maxBarThickness: 35
        },
        {
          label: 'Female',
          data: femaleData,
          backgroundColor: '#86efac',
          hoverBackgroundColor: '#4ade80',
          borderRadius: 5,
          maxBarThickness: 35
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      resizeDelay: 100,
      interaction: {
        mode: 'index',
        intersect: false
      },
      plugins: {
        legend: {
          position: 'top',
          labels: {
            usePointStyle: true,
            boxWidth: 8,
            boxHeight: 8,
            padding: 18,
            font: {
              family: 'Poppins',
              size: 11
            }
          }
        },
        tooltip: {
          callbacks: {
            footer(items) {
              const index = items[0]?.dataIndex
              if (index === undefined) return ''
              const item =
                dashboard.value.students_by_strand_grade[index]
              return `Total: ${item.total}`
            }
          }
        }
      },
      scales: {
        x: {
          grid: {
            display: false
          },
          ticks: {
            autoSkip: false,
            maxRotation: 45,
            minRotation: 0,
            font: {
              family: 'Poppins',
              size: 10
            }
          }
        },
        y: {
          beginAtZero: true,
          ticks: {
            precision: 0,
            stepSize: 1,
            font: {
              family: 'Poppins',
              size: 10
            }
          },
          grid: {
            color: '#ecfdf5'
          },
          title: {
            display: true,
            text: 'Number of Students',
            font: {
              family: 'Poppins',
              size: 10
            }
          }
        }
      }
    }
  })
}
function renderStrandTotalChart() {
  if (
    !strandTotalCanvas.value ||
    dashboard.value.students_by_strand.length === 0
  ) return
  const labels = dashboard.value.students_by_strand.map(
    item => item.strand
  )
  const totals = dashboard.value.students_by_strand.map(
    item => item.total
  )
  const greenColors = [
    '#14532d',
    '#166534',
    '#15803d',
    '#16a34a',
    '#22c55e',
    '#4ade80',
    '#86efac',
    '#bbf7d0'
  ]
  strandTotalChart = new Chart(strandTotalCanvas.value, {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: 'Total Students',
          data: totals,
          backgroundColor: labels.map(
            (_, index) =>
              greenColors[index % greenColors.length]
          ),
          hoverBackgroundColor: '#15803d',
          borderRadius: 6,
          maxBarThickness: 55
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      resizeDelay: 100,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          callbacks: {
            label(context) {
              return `Total Students: ${context.raw}`
            }
          }
        }
      },
      scales: {
        x: {
          grid: {
            display: false
          },
          ticks: {
            autoSkip: false,
            maxRotation: 45,
            minRotation: 0,
            font: {
              family: 'Poppins',
              size: 10
            }
          }
        },
        y: {
          beginAtZero: true,
          ticks: {
            precision: 0,
            stepSize: 1,
            font: {
              family: 'Poppins',
              size: 10
            }
          },
          grid: {
            color: '#ecfdf5'
          },
          title: {
            display: true,
            text: 'Number of Students',
            font: {
              family: 'Poppins',
              size: 10
            }
          }
        }
      }
    }
  })
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
  grid-template-columns: minmax(0, 1.8fr) minmax(320px, .9fr);
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
  grid-template-columns: minmax(0, 1fr) minmax(190px, 260px);
  align-items: center;
  gap: 22px;
}

.pie-container {
  position: relative;
  width: 100%;
  max-width: 255px;
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
  height: 260px;
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
