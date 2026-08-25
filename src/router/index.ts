import { createRouter, createWebHistory } from 'vue-router'

import HomeView from '../views/HomeView.vue'

import FacultyLayout from '../layouts/FacultyLayout.vue'

import DashboardFaculty from '../views/DashboardFaculty.vue'
import CreateExam from '../views/CreateExam.vue'
import ManualExam from '../views/ManualExam.vue'
import AutomaticExam from '../views/AutomaticExam.vue'
import EditExam from '../views/EditExam.vue'
import Lobby from '../views/Lobby.vue'
import Monitoring from '../views/Monitoring.vue'
import Results from '../views/Results.vue'
import StudentHistory from '../views/StudentHistory.vue'
import ExamResults from '../views/ExamResults.vue'
import StudentScores from '../views/StudentScores.vue'

import ItemAnalysisHub from '../views/ItemAnalysisHub.vue'
import ItemAnalysis from '../views/ItemAnalysis.vue'

//student views
import StudentDashboard from '../views/student/StudentDashboard.vue'
import StudentLobby from '../views/student/StudentLobby.vue'
import StudentExam from '../views/student/StudentExam.vue'
import StudentResults from '../views/student/StudentResults.vue'

//admin views
import AdminLayout
  from '../layouts/AdminLayout.vue'

import AdminLogin
  from '../views/admin/AdminLogin.vue'

import DashboardAdmin
  from '../views/admin/DashboardAdmin.vue'

import FacultyManagement
  from '../views/admin/FacultyManagement.vue'

import ExaminationOverview
  from '../views/admin/ExaminationOverview.vue'

import ResultsOverview
  from '../views/admin/ResultsOverview.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),

  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },

    // STUDENT ROUTES
    {
      path: '/student',
      name: 'StudentDashboard',
      component: StudentDashboard,
    },
    {
      path: '/student/lobby',
      name: 'StudentLobby',
      component: StudentLobby,
    },
    {
      path: '/student/exam',
      name: 'StudentExam',
      component: StudentExam,
    },
    {
      path: '/student/results',
      name: 'StudentResults',
      component: StudentResults,
    },

    // FACULTY ROUTES
    {
      path: '/faculty',
      component: FacultyLayout,

      meta: {
        requiresAuth: true,
        role: 'faculty'
      },
      children: [
        {
          path: 'dashboard',
          name: 'DashboardFaculty',
          component: DashboardFaculty,
        },
        {
          path: 'create-exam',
          name: 'CreateExam',
          component: CreateExam,
        },
        {
          path: 'manual-exam',
          name: 'ManualExam',
          component: ManualExam,
        },
        {
          path: 'automatic-exam',
          name: 'AutomaticExam',
          component: AutomaticExam,
        },
        {
          path: 'edit-exam/:id',
          name: 'EditExam',
          component: EditExam,
        },
        {
          path: 'lobby/:id',
          name: 'Lobby',
          component: Lobby,
        },
        {
          path: 'monitoring/:id',
          name: 'Monitoring',
          component: Monitoring,
        },
        {
          path: 'results/:id',
          name: 'Results',
          component: Results,
        },
        {
          path: 'item-analysis',
          name: 'ItemAnalysisHub',
          component: ItemAnalysisHub,
        },
        {
          path: 'item-analysis/:id',
          name: 'ItemAnalysis',
          component: ItemAnalysis,
        },
        {
          path: 'student-history',
          name: 'StudentHistory',
          component: StudentHistory,
        },
        {
          path: 'exam-results',
          name: 'ExamResults',
          component: ExamResults,
        },
        {
          path: 'exam-results/:examId',
          name: 'StudentScores',
          component: StudentScores,
        },
      ],
    },
    //Admin Routes
    {
      path: '/admin/login',
      name: 'AdminLogin',
      component: AdminLogin,

      meta: {
        guestOnly: true
      }
    },

    {
      path: '/admin',
      component: AdminLayout,

      meta: {
        requiresAuth: true,
        role: 'admin'
      },

      children: [

        {
          path: '',
          redirect: '/admin/dashboard'
        },

        {
          path: 'dashboard',
          name: 'AdminDashboard',
          component: DashboardAdmin
        },

        {
          path: 'faculty',
          name: 'FacultyManagement',
          component: FacultyManagement
        },

        {
          path: 'exams',
          name: 'ExaminationOverview',
          component: ExaminationOverview
        },

        {
          path: 'results',
          name: 'AdminResultsOverview',
          component: ResultsOverview
        }

      ]
    },
  ],
})
router.beforeEach((to) => {
  const token =
    localStorage.getItem('token')

  const role =
    localStorage.getItem('role')

  // =========================
  // PROTECTED ROUTES
  // =========================
  if (to.meta.requiresAuth) {

    if (!token) {

      if (to.meta.role === 'admin') {
        return '/admin/login'
      }

      return '/'
    }

    // ADMIN ONLY
    if (
      to.meta.role === 'admin' &&
      role !== 'admin'
    ) {

      if (role === 'faculty') {
        return '/faculty/dashboard'
      }

      return '/admin/login'
    }

    // FACULTY ONLY
    if (
      to.meta.role === 'faculty' &&
      role !== 'faculty'
    ) {

      if (role === 'admin') {
        return '/admin/dashboard-admin'
      }

      return '/'
    }
  }

  // Already logged-in admin
  // should not return to admin login
  if (
    to.meta.guestOnly &&
    token &&
    role === 'admin'
  ) {
    return '/admin/dashboard-admin'
  }

  return true
})
export default router
