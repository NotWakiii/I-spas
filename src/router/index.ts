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

import ItemAnalysisHub from '../views/ItemAnalysisHub.vue'
import ItemAnalysis from '../views/ItemAnalysis.vue'

import StudentDashboard from '../views/student/StudentDashboard.vue'
import StudentLobby from '../views/student/StudentLobby.vue'
import StudentExam from '../views/student/StudentExam.vue'
import StudentResults from '../views/student/StudentResults.vue'

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
      ],
    },
  ],
})

export default router
