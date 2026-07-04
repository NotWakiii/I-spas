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

// ==========================================
// ITEM ANALYSIS
// ==========================================

import ItemAnalysisHub from '../views/ItemAnalysisHub.vue'
import ItemAnalysis from '../views/ItemAnalysis.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),

  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },

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

        // ==========================================
        // EXAM LOBBY
        // ==========================================

        {
          path: 'lobby/:id',
          name: 'Lobby',
          component: Lobby,
        },

        // ==========================================
        // REAL-TIME MONITORING
        // ==========================================

        {
          path: 'monitoring/:id',
          name: 'Monitoring',
          component: Monitoring,
        },

        // ==========================================
        // EXAM RESULTS
        // ==========================================

              {
        path: 'results/:id',
        name: 'Results',
        component: Results,
         },

        // ==========================================
        // ITEM ANALYSIS HUB
        // (Shows all analyzed exams)
        // ==========================================

        {
          path: 'item-analysis',
          name: 'ItemAnalysisHub',
          component: ItemAnalysisHub,
        },

        {
  path: 'student-history',
  name: 'StudentHistory',
  component: StudentHistory,
},

       

        {
          path: 'item-analysis/:id',
          name: 'ItemAnalysis',
          component: ItemAnalysis,
        },

      ],
    },
  ],
})

export default router