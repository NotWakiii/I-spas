<template>
  <div class="dashboard">
    <!-- HEADER -->
    <div class="dashboard-header">
      <div>
        <h1>Admin Dashboard</h1>
        <p>Welcome back! Monitor and manage the I-SPAS system.</p>
      </div>
      <div class="admin-badge">
        <ShieldCheck :size="17" />
        <span>Administrator</span>
      </div>
    </div>

    <!-- STATISTICS -->
    <div class="stats">
      <div class="card">
        <div>
          <span>Total Faculty</span>
          <h2>{{ dashboard.total_faculty }}</h2>
        </div>
        <div class="card-icon">
          <Users :size="26" />
        </div>
      </div>
      <div class="card">
        <div>
          <span>Total Exams</span>
          <h2>{{ dashboard.total_exams }}</h2>
        </div>
        <div class="card-icon">
          <ClipboardList :size="26" />
        </div>
      </div>
      <div class="card">
        <div>
          <span>Total Examinees</span>
          <h2>{{ dashboard.total_examinees }}</h2>
        </div>
        <div class="card-icon">
          <GraduationCap :size="26" />
        </div>
      </div>
      <div class="card">
        <div>
          <span>Submitted Results</span>
          <h2>{{ dashboard.submitted_results }}</h2>
        </div>
        <div class="card-icon">
          <FileCheck2 :size="26" />
        </div>
      </div>
    </div>

    <!-- LOADING -->
    <div v-if="loading" class="system-section loading">
      <LoaderCircle :size="28" class="spinner-icon" />
      <span>Loading dashboard...</span>
    </div>

    <!-- ERROR -->
    <div v-else-if="errorMessage" class="error-box">
      <div class="error-content">
        <TriangleAlert :size="21" />
        <span>{{ errorMessage }}</span>
      </div>
      <button @click="fetchDashboard">
        <RefreshCw :size="16" />
        <span>Try Again</span>
      </button>
    </div>

    <!-- SYSTEM OVERVIEW -->
    <template v-else>
      <div class="system-section">
        <div class="section-header">
          <div>
            <h2>System Overview</h2>
            <p>Quick overview of the I-SPAS system.</p>
          </div>
        </div>
        <div class="overview-grid">
          <!-- FACULTY -->
          <div class="overview-card">
            <div class="overview-icon">
              <Users :size="27" />
            </div>
            <div class="overview-content">
              <span>Registered Faculty</span>
              <h3>{{ dashboard.total_faculty }}</h3>
              <p>Faculty accounts registered in the system.</p>
            </div>
          </div>

          <!-- EXAMS -->
          <div class="overview-card">
            <div class="overview-icon">
              <ClipboardList :size="27" />
            </div>
            <div class="overview-content">
              <span>Examinations</span>
              <h3>{{ dashboard.total_exams }}</h3>
              <p>Total examinations created by faculty.</p>
            </div>
          </div>

          <!-- EXAMINEES -->
          <div class="overview-card">
            <div class="overview-icon">
              <GraduationCap :size="27" />
            </div>
            <div class="overview-content">
              <span>Examinees</span>
              <h3>{{ dashboard.total_examinees }}</h3>
              <p>Total examination sessions recorded.</p>
            </div>
          </div>

          <!-- RESULTS -->
          <div class="overview-card">
            <div class="overview-icon">
              <FileCheck2 :size="27" />
            </div>
            <div class="overview-content">
              <span>Submitted Results</span>
              <h3>{{ dashboard.submitted_results }}</h3>
              <p>Completed examination submissions.</p>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import api from '../../services/api'
import {
  ShieldCheck,
  Users,
  ClipboardList,
  GraduationCap,
  FileCheck2,
  LoaderCircle,
  TriangleAlert,
  RefreshCw
} from '@lucide/vue'

interface DashboardData {
  total_faculty: number
  total_exams: number
  total_examinees: number
  submitted_results: number
}

const dashboard = ref<DashboardData>({
  total_faculty: 0,
  total_exams: 0,
  total_examinees: 0,
  submitted_results: 0
})

const loading = ref(false)
const errorMessage = ref('')

async function fetchDashboard() {
  loading.value = true
  errorMessage.value = ''
  try {
    const response = await api.get('/admin/dashboard')
    dashboard.value = {
      total_faculty: Number(response.data.data?.total_faculty || 0),
      total_exams: Number(response.data.data?.total_exams || 0),
      total_examinees: Number(response.data.data?.total_examinees || 0),
      submitted_results: Number(response.data.data?.submitted_results || 0)
    }
  } catch (error: any) {
    console.error('ADMIN DASHBOARD ERROR:', error)
    if (error.response?.status === 401) {
      errorMessage.value = 'Your session has expired. Please login again.'
    } else if (error.response?.status === 403) {
      errorMessage.value = 'You are not authorized to access the Admin Dashboard.'
    } else {
      errorMessage.value = 'Failed to load dashboard data.'
    }
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchDashboard()
})
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.dashboard {
  padding: 28px;
  background: #f4fbf6;
  min-height: 100vh;
  font-family: 'Poppins', sans-serif;
  color: #0f172a;
}

/* HEADER */
.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  margin-bottom: 22px;
}

.dashboard-header h1 {
  font-size: 28px;
  font-weight: 800;
  color: #0f172a;
}

.dashboard-header p {
  margin-top: 6px;
  color: #64748b;
  font-size: 14px;
}

.admin-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  background: #16a34a;
  color: white;
  padding: 10px 17px;
  border-radius: 9px;
  font-size: 13px;
  font-weight: 700;
  white-space: nowrap;
}

/* STATISTICS */
.stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}

.card {
  min-height: 105px;
  padding: 18px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 15px;
  background: #ffffff;
  border: 1px solid #bbf7d0;
  border-radius: 12px;
  box-shadow: 0 2px 6px rgba(10, 55, 160, .04);
  transition: transform .2s ease, box-shadow .2s ease, border-color .2s ease;
}

.card:hover {
  transform: translateY(-2px);
  border-color: #16a34a;
  box-shadow: 0 8px 20px rgba(15, 23, 42, .08);
}

.card span {
  display: block;
  color: #475569;
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 9px;
}

.card h2 {
  color: #0f172a;
  font-size: 25px;
  font-weight: 800;
  line-height: 1;
}

.card-icon {
  width: 50px;
  height: 50px;
  min-width: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #dcfce7;
  color: #15803d;
  border-radius: 11px;
}

/* SECTION */
.system-section {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 5px 18px rgba(15, 23, 42, .04);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 22px;
}

.section-header h2 {
  font-size: 20px;
  font-weight: 800;
  color: #0f172a;
}

.section-header p {
  color: #64748b;
  font-size: 13px;
  margin-top: 5px;
}

/* SYSTEM OVERVIEW */
.overview-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.overview-card {
  min-height: 125px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 18px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  transition: border-color .2s ease, box-shadow .2s ease, transform .2s ease;
}

.overview-card:hover {
  border-color: #16a34a;
  transform: translateY(-1px);
  box-shadow: 0 8px 20px rgba(15, 23, 42, .06);
}

.overview-icon {
  width: 58px;
  height: 58px;
  min-width: 58px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #dcfce7;
  color: #15803d;
  border-radius: 12px;
}

.overview-content span {
  font-size: 13px;
  color: #64748b;
}

.overview-content h3 {
  font-size: 24px;
  color: #0f172a;
  margin: 3px 0 4px;
}

.overview-content p {
  font-size: 12px;
  color: #64748b;
  line-height: 1.5;
}

/* LOADING */
.loading {
  min-height: 150px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  text-align: center;
  color: #64748b;
  font-size: 14px;
}

.spinner-icon {
  color: #16a34a;
  animation: spin .8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* ERROR */
.error-box {
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #dc2626;
  padding: 18px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 15px;
}

.error-content {
  display: flex;
  align-items: center;
  gap: 9px;
}

.error-content svg {
  flex-shrink: 0;
}

.error-box button {
  border: none;
  background: #dc2626;
  color: white;
  padding: 9px 15px;
  border-radius: 7px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
  transition: background .2s ease;
}

.error-box button:hover {
  background: #b91c1c;
}

/* LUCIDE */
.card-icon svg,
.overview-icon svg,
.admin-badge svg,
.error-box svg {
  flex-shrink: 0;
}

/* TABLET */
@media (max-width: 1024px) {
  .stats {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* MOBILE */
@media (max-width: 768px) {
  .dashboard {
    padding: 18px;
  }

  .dashboard-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 15px;
  }

  .stats,
  .overview-grid {
    grid-template-columns: 1fr;
  }

  .admin-badge {
    width: 100%;
  }

  .overview-card {
    align-items: center;
  }

  .error-box {
    flex-direction: column;
    align-items: stretch;
  }

  .error-box button {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .dashboard {
    padding: 16px;
  }

  .dashboard-header h1 {
    font-size: 25px;
  }

  .card {
    min-height: 95px;
  }

  .system-section {
    padding: 18px;
  }

  .overview-card {
    padding: 17px;
  }

  .overview-icon {
    width: 50px;
    height: 50px;
    min-width: 50px;
  }
}
</style>
