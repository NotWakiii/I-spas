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
import MyClasses from '../views/MyClasses.vue'
import ClassDetails from '../views/ClassDetails.vue'
import ItemAnalysisHub from '../views/ItemAnalysisHub.vue'
import ItemAnalysis from '../views/ItemAnalysis.vue'
import Feedback from '../views/Feedback.vue'
import TestBank from '../views/TestBank.vue'
import TestBankAssessment from '../views/TestBankAssessment.vue'

// Student views
import StudentLogin from '../views/student/StudentLogin.vue'
import StudentDashboard from '../views/student/StudentDashboard.vue'
import StudentLobby from '../views/student/StudentLobby.vue'
import StudentExam from '../views/student/StudentExam.vue'
import StudentResults from '../views/student/StudentResults.vue'
import StudentClassDetails from '../views/student/StudentClassDetails.vue'
import StudentJoinExam from '../views/student/StudentJoinExam.vue'

// Admin views
import AdminLayout from '../layouts/AdminLayout.vue'
import AdminLogin from '../views/admin/AdminLogin.vue'
import DashboardAdmin from '../views/admin/DashboardAdmin.vue'
import FacultyManagement from '../views/admin/FacultyManagement.vue'
import ExaminationOverview from '../views/admin/ExaminationOverview.vue'
import ResultsOverview from '../views/admin/ResultsOverview.vue'
import AuditLogs from '../views/admin/AuditLogs.vue'
import SchoolYearManagement from '../views/admin/SchoolYearManagement.vue'
import StrandManagement from '../views/admin/StrandManagement.vue'
import SectionManagement from '../views/admin/SectionManagement.vue'
import SubjectManagement from '../views/admin/SubjectManagement.vue'
import CurriculumManagement from '../views/admin/CurriculumManagement.vue'
import StudentManagement from '../views/admin/StudentManagement.vue'

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
      redirect: '/student/login',
    },
    {
      path: '/student/login',
      name: 'StudentLogin',
      component: StudentLogin,
      meta: {
        guestOnly: true,
        guestRole: 'student',
      },
    },
    {
      path: '/student/dashboard',
      name: 'StudentDashboard',
      component: StudentDashboard,
      meta: {
        requiresAuth: true,
        role: 'student',
      },
    },
    {
      path: '/student/lobby',
      name: 'StudentLobby',
      component: StudentLobby,
      meta: {
        requiresAuth: true,
        role: 'student',
      },
    },
    {
      path: '/student/exam',
      name: 'StudentExam',
      component: StudentExam,
      meta: {
        requiresAuth: true,
        role: 'student',
      },
    },
    {
      path: '/student/results',
      name: 'StudentResults',
      component: StudentResults,
      meta: {
        requiresAuth: true,
        role: 'student',
      },
    },
    {
      path: '/student/classes/:id',
      name: 'StudentClassDetails',
      component: StudentClassDetails,
      meta: {
        requiresAuth: true,
        role: 'student',
      },
    },
    {
      path: '/student/classes/:id/join',
      name: 'StudentJoinExam',
      component: StudentJoinExam,
      meta: {
        requiresAuth: true,
        role: 'student',
      },
    },
    {
      path: '/student/results/:examId',
      name: 'StudentExamResult',
      component: StudentResults,
      meta: {
        requiresAuth: true,
        role: 'student',
      },
    },

    // FACULTY ROUTES
    {
      path: '/faculty',
      component: FacultyLayout,
      meta: {
        requiresAuth: true,
        role: 'faculty',
      },
      children: [
        {
          path: '',
          redirect: '/faculty/dashboard',
        },
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
        {
          path: 'classes',
          name: 'MyClasses',
          component: MyClasses,
        },
        {
          path: 'classes/:id',
          name: 'ClassDetails',
          component: ClassDetails,
        },
        {
          path: 'feedback',
          name: 'Feedback',
          component: Feedback,
        },
        {
          path: 'test-bank',
          name: 'TestBank',
          component: TestBank,
        },
        {
          path: 'test-bank-exam',
          name: 'TestBankAssessment',
          component: TestBankAssessment,
        }
      ],
    },

    // ADMIN ROUTES
    {
      path: '/admin/login',
      name: 'AdminLogin',
      component: AdminLogin,
      meta: {
        guestOnly: true,
        guestRole: 'admin',
      },
    },
    {
      path: '/admin',
      component: AdminLayout,
      meta: {
        requiresAuth: true,
        role: 'admin',
      },
      children: [
        {
          path: '',
          redirect: '/admin/dashboard',
        },
        {
          path: 'dashboard',
          name: 'AdminDashboard',
          component: DashboardAdmin,
        },
        {
          path: 'faculty',
          name: 'FacultyManagement',
          component: FacultyManagement,
        },
        {
          path: 'exams',
          name: 'ExaminationOverview',
          component: ExaminationOverview,
        },
        {
          path: 'results',
          name: 'AdminResultsOverview',
          component: ResultsOverview,
        },
        {
          path: 'audit-logs',
          name: 'AdminAuditLogs',
          component: AuditLogs,
        },
        {
          path: 'school-years',
          name: 'SchoolYearManagement',
          component: SchoolYearManagement,
        },
        {
          path: 'strands',
          name: 'StrandManagement',
          component: StrandManagement,
        },
        {
          path: 'sections',
          name: 'SectionManagement',
          component: SectionManagement,
        },
        {
          path: 'subjects',
          name: 'SubjectManagement',
          component: SubjectManagement,
        },
        {
          path: 'curriculum',
          name: 'CurriculumManagement',
          component: CurriculumManagement,
        },
        {
          path: 'students',
          name: 'StudentManagement',
          component: StudentManagement,
        },
      ],
    },
  ],
})

router.beforeEach((to) => {
  const token = localStorage.getItem('token')
  const role = localStorage.getItem('role')

  // Guest-only pages
  if (to.meta.guestOnly && token) {
    if (role === 'admin') return '/admin/dashboard'
    if (role === 'faculty') return '/faculty/dashboard'
    if (role === 'student') return '/student/dashboard'
  }

  // Protected pages
  if (to.meta.requiresAuth) {
    if (!token) {
      if (to.meta.role === 'admin') return '/admin/login'
      if (to.meta.role === 'student') return '/student/login'
      return '/'
    }

    // Prevent one role from accessing another role's pages
    if (to.meta.role && role !== to.meta.role) {
      if (role === 'admin') return '/admin/dashboard'
      if (role === 'faculty') return '/faculty/dashboard'
      if (role === 'student') return '/student/dashboard'

      localStorage.removeItem('token')
      localStorage.removeItem('role')
      return '/'
    }
  }

  return true
})

export default router
