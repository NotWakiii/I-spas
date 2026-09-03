<template>
  <div class="dashboard">

    <!-- ===========================================
         HEADER
    ============================================ -->
    <div class="dashboard-header">
      <div>
        <h1>Admin Dashboard</h1>

        <p>
          Welcome back! Monitor and manage the I-SPAS system.
        </p>
      </div>

      <div class="admin-badge">
        Administrator
      </div>
    </div>


    <!-- ===========================================
         STATISTICS
    ============================================ -->
    <div class="stats">

      <div class="card">
        <div>
          <span>Total Faculty</span>

          <h2>
            {{ dashboard.total_faculty }}
          </h2>
        </div>
      </div>


      <div class="card">
        <div>
          <span>Total Exams</span>

          <h2>
            {{ dashboard.total_exams }}
          </h2>
        </div>
      </div>


      <div class="card">
        <div>
          <span>Total Examinees</span>

          <h2>
            {{ dashboard.total_examinees }}
          </h2>
        </div>
      </div>


      <div class="card">
        <div>
          <span>Submitted Results</span>

          <h2>
            {{ dashboard.submitted_results }}
          </h2>
        </div>
      </div>

    </div>


    <!-- ===========================================
         LOADING
    ============================================ -->
    <div
      v-if="loading"
      class="system-section loading"
    >
      Loading dashboard...
    </div>


    <!-- ===========================================
         ERROR
    ============================================ -->
    <div
      v-else-if="errorMessage"
      class="error-box"
    >
      {{ errorMessage }}

      <button @click="fetchDashboard">
        Try Again
      </button>
    </div>


    <!-- ===========================================
         SYSTEM OVERVIEW
    ============================================ -->
    <template v-else>

      <div class="system-section">

        <div class="section-header">
          <div>
            <h2>
              System Overview
            </h2>

            <p>
              Quick overview of the I-SPAS system.
            </p>
          </div>
        </div>


        <div class="overview-grid">

          <!-- FACULTY -->
          <div class="overview-card">

            <div class="overview-content">

              <span>
                Registered Faculty
              </span>

              <h3>
                {{ dashboard.total_faculty }}
              </h3>

              <p>
                Faculty accounts registered in the system.
              </p>

            </div>

          </div>


          <!-- EXAMS -->
          <div class="overview-card">
            <div class="overview-content">

              <span>
                Examinations
              </span>

              <h3>
                {{ dashboard.total_exams }}
              </h3>

              <p>
                Total examinations created by faculty.
              </p>

            </div>

          </div>


          <!-- EXAMINEES -->
          <div class="overview-card">
            <div class="overview-content">

              <span>
                Examinees
              </span>

              <h3>
                {{ dashboard.total_examinees }}
              </h3>

              <p>
                Total examination sessions recorded.
              </p>

            </div>

          </div>


          <!-- RESULTS -->
          <div class="overview-card">
            <div class="overview-content">

              <span>
                Submitted Results
              </span>

              <h3>
                {{ dashboard.submitted_results }}
              </h3>

              <p>
                Completed examination submissions.
              </p>

            </div>

          </div>

        </div>

      </div>

    </template>

  </div>
</template>


<script setup lang="ts">

import {
  onMounted,
  ref
} from 'vue'

import {
  useRouter
} from 'vue-router'

import api from '../../services/api'


const router = useRouter()


// ===========================================
// DASHBOARD DATA
// ===========================================

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


// ===========================================
// FETCH ADMIN DASHBOARD
// ===========================================

async function fetchDashboard() {

  loading.value = true

  errorMessage.value = ''

  try {

    const response =
      await api.get(
        '/admin/dashboard'
      )


    dashboard.value = {
      total_faculty:
        Number(
          response.data.data
            ?.total_faculty || 0
        ),

      total_exams:
        Number(
          response.data.data
            ?.total_exams || 0
        ),

      total_examinees:
        Number(
          response.data.data
            ?.total_examinees || 0
        ),

      submitted_results:
        Number(
          response.data.data
            ?.submitted_results || 0
        )
    }


  } catch (error: any) {

    console.error(
      'ADMIN DASHBOARD ERROR:',
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
        'You are not authorized to access the Admin Dashboard.'

    } else {

      errorMessage.value =
        'Failed to load dashboard data.'
    }

  } finally {

    loading.value = false
  }
}


// ===========================================
// QUICK ACTIONS
// ===========================================

// ===========================================
// MOUNT
// ===========================================

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


/* ===========================================
   DASHBOARD
=========================================== */

.dashboard {
  padding: 28px;
  background: #f4fbf6;
  min-height: 100vh;
  font-family: 'Poppins', sans-serif;
  color: #0f172a;
}


/* ===========================================
   HEADER
=========================================== */

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
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
  background: #16a34a;
  color: white;
  padding: 11px 20px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 700;
}


/* ===========================================
   STAT CARDS
=========================================== */

.stats {
  display: grid;
  grid-template-columns:
    repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 24px;
}


.card {
  background: rgb(252, 252, 252);
  border: 1px solid #00d400;
  border-radius: 10px;
  padding: 17px 18px;
  min-height: 74px;

  display: flex;
  align-items: center;
  justify-content: space-between;

  box-shadow:
    0 2px 6px
    rgba(10, 55, 160, 0.04);

  transition: 0.2s;
}


.card:hover {
  transform: translateY(-2px);

  box-shadow:
    0 8px 20px
    rgba(15, 23, 42, 0.08);
}


.card span {
  display: block;
  color: #000000;
  font-size: 17px;
  font-weight: 500;
  margin-bottom: 15px;
}


.card h2 {
  color: #141414;
  font-size: 22px;
  font-weight: 800;
  line-height: 1;
}


.emoji {
  width: 50px;
  height: 50px;
  border-radius: 8px;
  background: #c9c8c871;

  display: flex;
  align-items: center;
  justify-content: center;

  font-size: 34px;
}


/* ===========================================
   SECTION
=========================================== */

.system-section {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 24px;
  margin-bottom: 24px;

  box-shadow:
    0 5px 18px
    rgba(15, 23, 42, 0.04);
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


/* ===========================================
   SYSTEM OVERVIEW
=========================================== */

.overview-grid {
  display: grid;

  grid-template-columns:
    repeat(2, 1fr);

  gap: 16px;
}


.overview-card {
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 20px;

  display: flex;
  align-items: center;
  gap: 18px;

  transition: 0.2s;
}


.overview-card:hover {
  border-color: #16a34a;

  box-shadow:
    0 8px 20px
    rgba(15, 23, 42, 0.06);
}


.overview-icon {
  width: 58px;
  height: 58px;
  min-width: 58px;

  background: #dcfce7;
  border-radius: 12px;

  display: flex;
  align-items: center;
  justify-content: center;

  font-size: 28px;
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
}


/* ===========================================
   QUICK ACTIONS
=========================================== */

.quick-grid {
  display: grid;

  grid-template-columns:
    repeat(3, 1fr);

  gap: 16px;
}


.quick-card {
  width: 100%;

  border: 1px solid #e2e8f0;
  background: white;

  border-radius: 12px;
  padding: 20px;

  display: flex;
  align-items: center;
  gap: 15px;

  text-align: left;

  cursor: pointer;

  transition: 0.2s;
}


.quick-card:hover {
  border-color: #16a34a;

  transform:
    translateY(-2px);

  box-shadow:
    0 8px 20px
    rgba(15, 23, 42, 0.07);
}


.quick-icon {
  width: 50px;
  height: 50px;
  min-width: 50px;

  border-radius: 10px;

  background: #dcfce7;

  display: flex;
  align-items: center;
  justify-content: center;

  font-size: 24px;
}


.quick-card h3 {
  font-size: 14px;
  color: #0f172a;
  margin-bottom: 5px;
}


.quick-card p {
  font-size: 11px;
  color: #64748b;
  line-height: 1.5;
}


/* ===========================================
   LOADING / ERROR
=========================================== */

.loading {
  text-align: center;
  color: #64748b;
  font-size: 14px;
}


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


.error-box button {
  border: none;
  background: #dc2626;
  color: white;

  padding: 9px 15px;
  border-radius: 7px;

  font-weight: 700;
  cursor: pointer;
}


/* ===========================================
   RESPONSIVE
=========================================== */

@media (max-width: 1024px) {

  .stats {
    grid-template-columns:
      repeat(2, 1fr);
  }

  .quick-grid {
    grid-template-columns:
      1fr;
  }
}


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
  .overview-grid,
  .quick-grid {
    grid-template-columns:
      1fr;
  }


  .admin-badge {
    width: 100%;
    text-align: center;
  }


  .overview-card {
    align-items: flex-start;
  }

}

</style>
