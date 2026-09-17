<template>
  <div class="class-details-page">

    <!-- ==========================================
         TOP BAR
    =========================================== -->
    <div class="details-topbar">
      <button
        type="button"
        class="back-btn"
        @click="goBack"
      >
        <ArrowLeft :size="17" />
        Back to My Classes
      </button>
    </div>

    <!-- ==========================================
         LOADING
    =========================================== -->
    <div
      v-if="loading"
      class="loading-state"
    >
      <LoaderCircle
        :size="30"
        class="spinner"
      />
      <span>
        Loading class details...
      </span>
    </div>

    <!-- ==========================================
         ERROR
    =========================================== -->
    <div
      v-else-if="errorMessage"
      class="error-state"
    >
      <div class="error-icon">
        <CircleAlert :size="30" />
      </div>

      <h3>
        Unable to load class
      </h3>

      <p>
        {{ errorMessage }}
      </p>

      <button
        type="button"
        class="retry-btn"
        @click="loadPage"
      >
        Try Again
      </button>
    </div>

    <!-- ==========================================
         CONTENT
    =========================================== -->
    <template v-else-if="schoolClass">

      <!-- CLASS HEADER -->
      <div class="class-header-card">
        <div class="class-header-left">

          <div class="subject-icon">
            <BookOpenText :size="25" />
          </div>

          <div class="class-heading">
            <div class="heading-label">
              CLASS DETAILS
            </div>

            <h1>
              {{
                schoolClass.subject?.name ||
                'Unnamed Subject'
              }}
            </h1>

            <p>
              {{ schoolClass.grade }}
              <span>•</span>

              {{
                schoolClass.strand?.name ||
                'No Strand'
              }}

              <span>•</span>

              {{
                schoolClass.section_data?.section ||
                schoolClass.section ||
                'No Section'
              }}
            </p>
          </div>
        </div>

        <div class="class-header-meta">

          <div class="academic-badge">
            <CalendarDays :size="15" />
            {{
              schoolClass.school_year?.year ||
              'No School Year'
            }}
          </div>

          <div class="academic-badge">
            <Layers3 :size="15" />
            {{
              schoolClass.semester ||
              'No Semester'
            }}
          </div>

        </div>
      </div>

      <!-- ==========================================
           TABS
      =========================================== -->
      <div class="tabs-wrapper">

        <button
          type="button"
          class="tab-btn"
          :class="{
            active:
              activeTab === 'overview'
          }"
          @click="changeTab('overview')"
        >
          <LayoutDashboard :size="17" />
          Overview
        </button>

        <button
          type="button"
          class="tab-btn"
          :class="{
            active:
              activeTab === 'students'
          }"
          @click="changeTab('students')"
        >
          <Users :size="17" />
          Students
        </button>

        <button
          type="button"
          class="tab-btn"
          :class="{
            active:
              activeTab === 'assessments'
          }"
          @click="changeTab('assessments')"
        >
          <ClipboardList :size="17" />
          Assessments
        </button>

      </div>

      <!-- ==========================================
           OVERVIEW
      =========================================== -->
      <div
        v-if="activeTab === 'overview'"
        class="overview-content"
      >

        <div class="stats-grid">

          <div class="stat-card">
            <div class="stat-icon">
              <Users :size="22" />
            </div>

            <div class="stat-content">
              <span class="stat-label">
                Total Students
              </span>

              <strong>
                {{ students.length }}
              </strong>

              <p>
                Students enrolled in this class
              </p>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon">
              <ClipboardList :size="22" />
            </div>

            <div class="stat-content">
              <span class="stat-label">
                Assessments
              </span>

              <strong>
                {{ assessments.length }}
              </strong>

              <p>
                Assessments assigned to this class
              </p>
            </div>
          </div>

        </div>

        <div class="information-card">

          <div class="information-header">
            <div>
              <h2>
                Class Information
              </h2>

              <p>
                Academic information and details
                for this class.
              </p>
            </div>

            <div class="info-header-icon">
              <School :size="21" />
            </div>
          </div>

          <div class="information-grid">

            <div class="info-item">
              <div class="info-icon">
                <BookOpenText :size="18" />
              </div>

              <div>
                <span>Subject</span>
                <strong>
                  {{
                    schoolClass.subject?.name ||
                    'Not Available'
                  }}
                </strong>
              </div>
            </div>

            <div class="info-item">
              <div class="info-icon">
                <GraduationCap :size="18" />
              </div>

              <div>
                <span>Grade Level</span>
                <strong>
                  {{ schoolClass.grade }}
                </strong>
              </div>
            </div>

            <div class="info-item">
              <div class="info-icon">
                <Network :size="18" />
              </div>

              <div>
                <span>Strand</span>
                <strong>
                  {{
                    schoolClass.strand?.name ||
                    'Not Available'
                  }}
                </strong>
              </div>
            </div>

            <div class="info-item">
              <div class="info-icon">
                <UsersRound :size="18" />
              </div>

              <div>
                <span>Section</span>
                <strong>
                  {{
                    schoolClass.section_data?.section ||
                    schoolClass.section ||
                    'Not Available'
                  }}
                </strong>
              </div>
            </div>

            <div class="info-item">
              <div class="info-icon">
                <CalendarDays :size="18" />
              </div>

              <div>
                <span>School Year</span>
                <strong>
                  {{
                    schoolClass.school_year?.year ||
                    'Not Available'
                  }}
                </strong>
              </div>
            </div>

            <div class="info-item">
              <div class="info-icon">
                <Layers3 :size="18" />
              </div>

              <div>
                <span>Semester</span>
                <strong>
                  {{
                    schoolClass.semester ||
                    'Not Available'
                  }}
                </strong>
              </div>
            </div>

          </div>
        </div>
      </div>

      <!-- ==========================================
           STUDENTS
      =========================================== -->
      <div
        v-if="activeTab === 'students'"
        class="students-content"
      >

        <div class="students-header">
          <div>
            <h2>
              Students
            </h2>

            <p>
              Official students enrolled in this
              class.
            </p>
          </div>

          <div class="student-count">
            <Users :size="16" />
            <strong>
              {{ students.length }}
            </strong>
            Students
          </div>
        </div>

        <div class="student-toolbar">
          <div class="student-search">
            <Search :size="17" />

            <input
              v-model="studentSearch"
              type="text"
              placeholder="Search student..."
            >
          </div>
        </div>

        <div
          v-if="studentsLoading"
          class="students-loading"
        >
          <LoaderCircle
            :size="25"
            class="spinner"
          />

          <span>
            Loading students...
          </span>
        </div>

        <div
          v-else-if="filteredStudents.length"
          class="student-list-card"
        >

          <div class="student-table-header">
            <span>#</span>
            <span>Student</span>
            <span>LRN</span>
            <span>Status</span>
          </div>

          <div
            v-for="(
              enrollment,
              index
            ) in filteredStudents"
            :key="enrollment.id"
            class="student-row"
          >
            <span class="student-number">
              {{ index + 1 }}
            </span>

            <div class="student-profile">
              <div class="student-avatar">
                {{
                  getStudentName(enrollment)
                    .charAt(0)
                    .toUpperCase()
                }}
              </div>

              <div>
                <strong>
                  {{
                    getStudentName(
                      enrollment
                    )
                  }}
                </strong>

                <span>
                  {{
                    enrollment.student
                      ?.email ||
                    'No email'
                  }}
                </span>
              </div>
            </div>

            <span class="student-lrn">
              {{
                enrollment.student?.lrn ||
                'No LRN'
              }}
            </span>

            <span
              class="student-status"
              :class="
                enrollment.student?.status ||
                'active'
              "
            >
              {{
                enrollment.student?.status ||
                'active'
              }}
            </span>
          </div>
        </div>

        <div
          v-else
          class="students-empty"
        >
          <div class="students-empty-icon">
            <Users :size="36" />
          </div>

          <h3>
            {{
              studentSearch
                ? 'No students found'
                : 'No students enrolled'
            }}
          </h3>

          <p>
            {{
              studentSearch
                ? 'Try another student name.'
                : 'Students assigned to this class will appear here automatically.'
            }}
          </p>
        </div>

      </div>

      <!-- ==========================================
           ASSESSMENTS
      =========================================== -->
      <div
        v-if="activeTab === 'assessments'"
        class="assessments-content"
      >

        <!-- HEADER -->
        <div class="assessment-header">

          <div>
            <h2>
              Class Assessments
            </h2>

            <p>
              Quizzes and examinations assigned
              to this class.
            </p>
          </div>

          <div class="assessment-header-actions">

            <div class="assessment-count">
              <ClipboardList :size="16" />

              <strong>
                {{ assessments.length }}
              </strong>

              Assessments
            </div>

            <button
              type="button"
              class="create-assessment-btn"
              @click="createAssessment"
            >
              <Plus :size="17" />
              Create Assessment
            </button>

          </div>
        </div>

        <!-- LOADING -->
        <div
          v-if="assessmentsLoading"
          class="assessments-loading"
        >
          <LoaderCircle
            :size="25"
            class="spinner"
          />

          <span>
            Loading assessments...
          </span>
        </div>

        <!-- ASSESSMENT LIST -->
        <div
          v-else-if="assessments.length"
          class="assessment-list"
        >
          <div
            v-for="assessment in assessments"
            :key="assessment.id"
            class="assessment-card"
          >

            <!-- TOP -->
            <div class="assessment-card-top">

              <div class="assessment-title-wrap">

                <div class="assessment-badges">

                  <span
                    class="assessment-kind"
                    :class="
                      assessment.assessment_type
                    "
                  >
                    {{
                      assessment.assessment_type ===
                        'quiz'
                        ? 'Quiz'
                        : 'Examination'
                    }}
                  </span>

                  <span
                    class="status-badge"
                    :class="
                      normalizeStatus(
                        assessment.status
                      )
                    "
                  >
                    {{
                      statusLabel(
                        assessment.status
                      )
                    }}
                  </span>

                </div>

                <h3>
                  {{ assessment.title }}
                </h3>

                <p
                  v-if="assessment.description"
                >
                  {{ assessment.description }}
                </p>
              </div>

              <!-- ACTION BUTTONS -->
              <div class="assessment-actions">

                <!-- VIEW -->
                <button
                  type="button"
                  class="assessment-action-btn view"
                  title="View assessment"
                  :disabled="
                    viewingAssessmentLoading
                  "
                  @click="
                    viewAssessment(
                      assessment
                    )
                  "
                >
                  <Eye :size="14" />
                  View
                </button>

                <!-- EDIT -->
                <button
                  v-if="
                    normalizeStatus(
                      assessment.status
                    ) === 'draft'
                  "
                  type="button"
                  class="assessment-action-btn edit"
                  title="Edit assessment"
                  @click="
                    editAssessment(
                      assessment
                    )
                  "
                >
                  <Pencil :size="14" />
                  Edit
                </button>

                <!-- PUBLISH -->
                <button
                  v-if="normalizeStatus(assessment.status) === 'draft'"
                  type="button"
                  class="assessment-action-btn publish"
                  title="Publish assessment"
                  :disabled="publishingAssessmentId === assessment.id"
                  @click="publishAssessment(assessment)"
                >
                  <ClipboardList :size="14" />
                  {{ publishingAssessmentId === assessment.id ? 'Publishing...' : 'Publish' }}
                </button>

                <!-- START EXAM -->
                <button
                  v-else-if="normalizeStatus(assessment.status) === 'published'"
                  type="button"
                  class="assessment-action-btn start"
                  title="Open faculty lobby"
                  @click="startAssessment(assessment)"
                >
                  <Play :size="14" />
                  Start Exam
                </button>

                <!-- MONITOR -->
                <button
                  v-else-if="
                    normalizeStatus(
                      assessment.status
                    ) === 'started'
                  "
                  type="button"
                  class="assessment-action-btn monitor"
                  title="Open live monitoring"
                  @click="
                    monitorAssessment(
                      assessment
                    )
                  "
                >
                  <Activity :size="14" />
                  Monitor
                </button>

                <!-- START AGAIN -->
                <button
                  v-if="normalizeStatus(assessment.status) === 'finished'"
                  type="button"
                  class="assessment-action-btn restart"
                  title="Start this assessment again"
                  :disabled="restartingAssessmentId === assessment.id"
                  @click="startAgainAssessment(assessment)"
                >
                  <RotateCcw :size="14" />
                  {{ restartingAssessmentId === assessment.id ? 'Preparing...' : 'Start Again' }}
                </button>

                <!-- DELETE -->
                <button
                  v-if="
                    normalizeStatus(assessment.status) === 'draft' ||
                    normalizeStatus(assessment.status) === 'finished'
                  "
                  type="button"
                  class="assessment-action-btn delete"
                  title="Delete assessment"
                  @click="
                    openDeleteAssessment(
                      assessment
                    )
                  "
                >
                  <Trash2 :size="14" />
                  Delete
                </button>

              </div>
            </div>

            <!-- INFO -->
            <div class="assessment-info-grid">

              <div class="assessment-info-item">
                <Clock3 :size="15" />
                <div>
                  <span>Duration</span>
                  <strong>
                    {{ assessment.duration }}
                    Minutes
                  </strong>
                </div>
              </div>

              <div class="assessment-info-item">
                <ListChecks :size="15" />
                <div>
                  <span>Questions</span>
                  <strong>
                    {{
                      assessment.questions_count ??
                      assessment.questions?.length ??
                      0
                    }}
                  </strong>
                </div>
              </div>

              <div class="assessment-info-item">
                <Target :size="15" />
                <div>
                  <span>Passing</span>
                  <strong>
                    {{ assessment.passing }}%
                  </strong>
                </div>
              </div>

              <div class="assessment-info-item">
                <CalendarDays :size="15" />
                <div>
                  <span>Created</span>
                  <strong>
                    {{
                      formatDate(
                        assessment.created_at
                      )
                    }}
                  </strong>
                </div>
              </div>

            </div>
          </div>
        </div>

        <!-- EMPTY -->
        <div
          v-else
          class="assessments-empty"
        >
          <div class="assessments-empty-icon">
            <ClipboardList :size="38" />
          </div>

          <h3>
            No assessments yet
          </h3>

          <p>
            Create your first quiz or examination
            for this class.
          </p>

          <button
            type="button"
            class="create-empty-assessment-btn"
            @click="createAssessment"
          >
            <Plus :size="16" />
            Create Assessment
          </button>
        </div>

      </div>

    </template>

    <!-- ==========================================
         VIEW ASSESSMENT MODAL
    =========================================== -->
    <div
      v-if="
        showAssessmentView &&
        viewingAssessment
      "
      class="modal-overlay"
      @click.self="closeAssessmentView"
    >
      <div class="assessment-view-modal">

        <div class="assessment-view-header">

          <div>
            <span
              class="assessment-view-type"
            >
              {{
                viewingAssessment
                  .assessment_type === 'quiz'
                  ? 'Quiz'
                  : 'Examination'
              }}
            </span>

            <h2>
              {{ viewingAssessment.title }}
            </h2>

            <p>
              {{
                viewingAssessment.description ||
                'No description'
              }}
            </p>
          </div>

          <button
            type="button"
            class="assessment-view-close"
            @click="closeAssessmentView"
          >
            <X :size="18" />
          </button>
        </div>

        <div class="assessment-view-info">

          <div>
            <span>Duration</span>
            <strong>
              {{
                viewingAssessment.duration
              }}
              Minutes
            </strong>
          </div>

          <div>
            <span>Passing</span>
            <strong>
              {{
                viewingAssessment.passing
              }}%
            </strong>
          </div>

          <div>
            <span>Questions</span>
            <strong>
              {{
                viewingAssessment.questions
                  ?.length || 0
              }}
            </strong>
          </div>

          <div>
            <span>Access Code</span>
            <strong>
              {{
                viewingAssessment.access_code ||
                'N/A'
              }}
            </strong>
          </div>

        </div>

        <div class="assessment-question-list">

          <h3>
            Questions
          </h3>

          <div
            v-if="
              !viewingAssessment.questions ||
              viewingAssessment.questions
                .length === 0
            "
            class="assessment-question-empty"
          >
            No questions available.
          </div>

          <div
            v-for="(
              questionItem,
              index
            ) in viewingAssessment.questions"
            :key="
              questionItem.id || index
            "
            class="assessment-question"
          >

            <div class="assessment-question-top">
              <strong>
                Question {{ index + 1 }}
              </strong>

              <span>
                {{
                  questionItem.points || 0
                }}
                pt
              </span>
            </div>

            <p>
              {{
                questionItem.question
              }}
            </p>

            <div
              v-if="
                questionItem.competency
              "
              class="question-competency"
            >
              <strong>
                Competency:
              </strong>

              {{
                questionItem.competency
              }}
            </div>

            <div
              v-if="
                questionItem.options &&
                questionItem.options.length
              "
              class="assessment-options"
            >
              <div
                v-for="(
                  option,
                  optionIndex
                ) in questionItem.options"
                :key="
                typeof option === 'string'
                  ? optionIndex
                  : option.id ?? optionIndex">
                <strong>
                  {{
                    String.fromCharCode(
                      65 + optionIndex
                    )
                  }}.
                </strong>

                {{
                  getOptionText(
                    option
                  )
                }}
              </div>
            </div>

            <div class="assessment-answer">
              Correct Answer:

              <strong>
                {{
                  questionItem.answer ||
                  'Not Available'
                }}
              </strong>
            </div>

          </div>
        </div>

      </div>
    </div>

    <!-- ==========================================
         START AGAIN MODAL
    =========================================== -->
    <div
      v-if="assessmentToRestart"
      class="modal-overlay"
      @click.self="closeRestartAssessment"
    >
      <div class="delete-assessment-modal">
        <div class="restart-assessment-icon">
          <RotateCcw :size="30" />
        </div>

        <h2>
          Start Assessment Again?
        </h2>

        <p>
          <strong>{{ assessmentToRestart.title }}</strong>
          will be made available again with a new access code.
          Previous student records and results will be kept.
        </p>

        <div class="modal-actions">
          <button
            type="button"
            class="cancel-btn"
            :disabled="restartingAssessmentId !== null"
            @click="closeRestartAssessment"
          >
            Cancel
          </button>

          <button
            type="button"
            class="confirm-restart-assessment"
            :disabled="restartingAssessmentId !== null"
            @click="confirmRestartAssessment"
          >
            <LoaderCircle
              v-if="restartingAssessmentId !== null"
              :size="16"
              class="spinner"
            />

            <RotateCcw
              v-else
              :size="16"
            />

            {{
              restartingAssessmentId !== null
                ? 'Preparing...'
                : 'Start Again'
            }}
          </button>
        </div>
      </div>
    </div>

    <!-- ==========================================
         DELETE ASSESSMENT MODAL
    =========================================== -->
    <div
      v-if="assessmentToDelete"
      class="modal-overlay"
      @click.self="
        closeDeleteAssessment
      "
    >
      <div class="delete-assessment-modal">

        <div class="delete-assessment-icon">
          <Trash2 :size="30" />
        </div>

        <h2>
          Delete Assessment?
        </h2>

        <p>
          Are you sure you want to delete

          <strong>
            {{
              assessmentToDelete.title
            }}
          </strong>?

          This action cannot be undone.
        </p>

        <div class="modal-actions">

          <button
            type="button"
            class="cancel-btn"
            :disabled="
              deletingAssessment
            "
            @click="
              closeDeleteAssessment
            "
          >
            Cancel
          </button>

          <button
            type="button"
            class="confirm-assessment-delete"
            :disabled="
              deletingAssessment
            "
            @click="
              confirmDeleteAssessment
            "
          >
            <LoaderCircle
              v-if="
                deletingAssessment
              "
              :size="16"
              class="spinner"
            />

            <Trash2
              v-else
              :size="16"
            />

            {{
              deletingAssessment
                ? 'Deleting...'
                : 'Delete'
            }}
          </button>

        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import {
  computed,
  onMounted,
  ref
} from 'vue'

import {
  useRoute,
  useRouter
} from 'vue-router'

import {
  Activity,
  ArrowLeft,
  BookOpenText,
  CalendarDays,
  CircleAlert,
  ClipboardList,
  Clock3,
  Eye,
  GraduationCap,
  Layers3,
  LayoutDashboard,
  ListChecks,
  LoaderCircle,
  Network,
  Pencil,
  Play,
  Plus,
  RotateCcw,
  School,
  Search,
  Target,
  Trash2,
  Users,
  UsersRound,
  X
} from '@lucide/vue'

import api from '../services/api'

// ==========================================
// TYPES
// ==========================================

interface SchoolYear {
  id: number
  year: string
  status?: string
}

interface Strand {
  id: number
  name: string
}

interface SectionData {
  id: number
  grade: string
  strand_id: number
  section: string
}

interface Subject {
  id: number
  name: string
}

interface SchoolClass {
  id: number
  faculty_id: number
  school_year_id: number
  semester: string
  grade: string
  strand_id: number
  section_id: number
  subject_id: number
  section?: string
  school_year?: SchoolYear
  strand?: Strand
  section_data?: SectionData
  subject?: Subject
  students_count?: number
  exams_count?: number
}

interface StudentUser {
  id: number
  lrn?: string | null
  name: string
  email?: string | null
  sex?: string | null
  status?: string | null
  strand_id?: number | null
  section_id?: number | null
  strand?: Strand
  section?: SectionData
}

interface ClassStudent {
  id: number
  class_id: number
  student_id?: number
  student_name?: string
  student?: StudentUser | null
  created_at?: string
  updated_at?: string
}

interface AssessmentQuestionOption {
  id?: number
  option_text?: string
  text?: string
}

interface AssessmentQuestion {
  id?: number
  question: string
  competency?: string | null
  answer?: string | null
  points?: number
  time?: number
  question_type?: string
  type?: string
  options?: Array<
    AssessmentQuestionOption |
    string
  >
}

interface Assessment {
  id: number
  title: string
  description?: string | null
  assessment_type:
    | 'quiz'
    | 'examination'
  class_id?: number
  duration: number
  passing: number
  access_code?: string | null
  status: string
  questions_count?: number
  questions?: AssessmentQuestion[]
  created_at?: string | null
}

// ==========================================
// ROUTER
// ==========================================

const route =
  useRoute()

const router =
  useRouter()

const classId =
  computed(() =>
    String(
      route.params.id
    )
  )

// ==========================================
// PAGE STATE
// ==========================================

const schoolClass =
  ref<SchoolClass | null>(
    null
  )

const students =
  ref<ClassStudent[]>([])

const assessments =
  ref<Assessment[]>([])

const loading =
  ref(true)

const studentsLoading =
  ref(false)

const assessmentsLoading =
  ref(false)

const errorMessage =
  ref('')

const activeTab =
  ref<
    | 'overview'
    | 'students'
    | 'assessments'
  >('overview')

const studentSearch =
  ref('')

// ==========================================
// VIEW ASSESSMENT STATE
// ==========================================

const showAssessmentView =
  ref(false)

const viewingAssessment =
  ref<Assessment | null>(
    null
  )

const viewingAssessmentLoading =
  ref(false)

// ==========================================
// DELETE ASSESSMENT STATE
// ==========================================

const assessmentToDelete =
  ref<Assessment | null>(
    null
  )

const deletingAssessment =
  ref(false)

const publishingAssessmentId =
  ref<number | null>(null)

const assessmentToRestart =
  ref<Assessment | null>(null)

const restartingAssessmentId =
  ref<number | null>(null)

// ==========================================
// STUDENT SEARCH
// ==========================================

const filteredStudents =
  computed(() => {
    const search =
      studentSearch.value
        .trim()
        .toLowerCase()

    if (!search) {
      return students.value
    }

    return students.value.filter(
      enrollment => {
        const name =
          getStudentName(
            enrollment
          )
            .toLowerCase()

        const lrn =
          String(
            enrollment.student
              ?.lrn || ''
          )
            .toLowerCase()

        const email =
          String(
            enrollment.student
              ?.email || ''
          )
            .toLowerCase()

        return (
          name.includes(search) ||
          lrn.includes(search) ||
          email.includes(search)
        )
      }
    )
  })

// ==========================================
// HELPERS
// ==========================================

function getStudentName(enrollment: ClassStudent): string {
  const fullName =
    enrollment.student?.name ||
    enrollment.student_name ||
    ''

  if (!fullName.trim()) {
    return 'Unknown Student'
  }

  const parts = fullName.trim().split(/\s+/)

  if (parts.length === 1) {
    return parts[0] || 'Unknown Student'
  }

  const lastName = parts.pop()
  const firstMiddleName = parts.join(' ')

  return `${lastName}, ${firstMiddleName}`
}

function getOptionText(
  option:
    | AssessmentQuestionOption
    | string
): string {
  if (
    typeof option === 'string'
  ) {
    return option
  }

  return (
    option.option_text ||
    option.text ||
    ''
  )
}

function normalizeStatus(
  status?: string | null
): string {
  return String(
    status || 'draft'
  )
    .trim()
    .toLowerCase()
}

function statusLabel(
  status?: string | null
): string {
  const normalized =
    normalizeStatus(
      status
    )

  if (
    normalized === 'draft'
  ) {
    return 'Draft'
  }

  if (
    normalized === 'published'
  ) {
    return 'Lobby Ready'
  }

  if (
    normalized === 'started'
  ) {
    return 'Started'
  }

  if (
    normalized === 'finished'
  ) {
    return 'Finished'
  }

  return status || 'Draft'
}

function formatDate(
  value?: string | null
): string {
  if (!value) {
    return 'N/A'
  }

  const date =
    new Date(value)

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return 'N/A'
  }

  return date
    .toLocaleDateString(
      'en-PH',
      {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }
    )
}

// ==========================================
// FETCH CLASS
// ==========================================

async function fetchClass() {
  const response =
    await api.get(
      `/faculty/classes/${classId.value}`
    )

  schoolClass.value =
    response.data?.data ??
    null
}

// ==========================================
// FETCH STUDENTS
// ==========================================

async function fetchStudents() {
  studentsLoading.value =
    true

  try {
    const response =
      await api.get(
        `/faculty/classes/${classId.value}/students`
      )

    students.value =
      Array.isArray(
        response.data?.data
      )
        ? response.data.data
        : []
  }
  catch (error: any) {
    console.error(
      'STUDENTS LOAD ERROR:',
      error
    )

    students.value = []
  }
  finally {
    studentsLoading.value =
      false
  }
}

// ==========================================
// FETCH ASSESSMENTS
// ==========================================

async function fetchAssessments() {
  assessmentsLoading.value =
    true

  try {
    const response =
      await api.get(
        `/faculty/classes/${classId.value}/assessments`
      )

    assessments.value =
      Array.isArray(
        response.data?.data
      )
        ? response.data.data
        : []
  }
  catch (error: any) {
    console.error(
      'ASSESSMENTS LOAD ERROR:',
      error
    )

    assessments.value = []
  }
  finally {
    assessmentsLoading.value =
      false
  }
}

// ==========================================
// LOAD PAGE
// ==========================================

async function loadPage() {
  loading.value =
    true

  errorMessage.value =
    ''

  try {
    await Promise.all([
      fetchClass(),
      fetchStudents(),
      fetchAssessments()
    ])
  }
  catch (error: any) {
    console.error(
      'CLASS DETAILS LOAD ERROR:',
      error
    )

    errorMessage.value =
      error.response
        ?.data
        ?.message ||
      'Failed to load class details.'
  }
  finally {
    loading.value =
      false
  }
}

// ==========================================
// TABS
// ==========================================

function changeTab(
  tab:
    | 'overview'
    | 'students'
    | 'assessments'
) {
  activeTab.value =
    tab

  router.replace({
    query:
      tab === 'overview'
        ? {}
        : {
            tab
          }
  })
}

// ==========================================
// CREATE ASSESSMENT
// ==========================================

function createAssessment() {
  router.push({
    path:
      '/faculty/create-exam',
    query: {
      class_id:
        classId.value
    }
  })
}

// ==========================================
// VIEW ASSESSMENT
// ==========================================

async function viewAssessment(
  assessment: Assessment
) {
  if (
    viewingAssessmentLoading.value
  ) {
    return
  }

  viewingAssessmentLoading.value =
    true

  try {
    const response =
      await api.get(
        `/exams/${assessment.id}`
      )

    viewingAssessment.value =
      response.data?.data ??
      assessment

    showAssessmentView.value =
      true
  }
  catch (error: any) {
    console.error(
      'VIEW ASSESSMENT ERROR:',
      error
    )

    alert(
      error.response
        ?.data
        ?.message ||
      'Failed to load assessment.'
    )
  }
  finally {
    viewingAssessmentLoading.value =
      false
  }
}

function closeAssessmentView() {
  showAssessmentView.value =
    false

  viewingAssessment.value =
    null
}

// ==========================================
// EDIT ASSESSMENT
// ==========================================

function editAssessment(
  assessment: Assessment
) {
  router.push(
    `/faculty/edit-exam/${assessment.id}`
  )
}

// ==========================================
// PUBLISH ASSESSMENT
// Changes draft -> published.
// After success, the button becomes Start Exam.
// ==========================================

async function publishAssessment(
  assessment: Assessment
) {
  if (
    publishingAssessmentId.value !== null
  ) {
    return
  }

  publishingAssessmentId.value =
    assessment.id

  try {
    const response =
      await api.post(
        `/exams/${assessment.id}/publish`
      )

    assessment.status =
      response.data?.data?.status ||
      'published'

    alert(
      response.data?.message ||
      'Exam published successfully.'
    )

    await fetchAssessments()
  }
  catch (error: any) {
    console.error(
      'PUBLISH ASSESSMENT ERROR:',
      error
    )

    alert(
      error.response
        ?.data
        ?.message ||
      'Failed to publish assessment.'
    )
  }
  finally {
    publishingAssessmentId.value =
      null
  }
}

// ==========================================
// START ASSESSMENT
// IMPORTANT:
// This DOES NOT call /start.
// It only opens the faculty lobby.
// The lobby starts the exam.
// ==========================================

function startAssessment(
  assessment: Assessment
) {
  router.push(
    `/faculty/lobby/${assessment.id}`
  )
}

// ==========================================
// START AGAIN
// Keeps previous student records/results.
// Backend restart returns exam to published
// and generates a new access code.
// ==========================================

function startAgainAssessment(
  assessment: Assessment
) {
  assessmentToRestart.value =
    assessment
}

function closeRestartAssessment() {
  if (
    restartingAssessmentId.value !== null
  ) {
    return
  }

  assessmentToRestart.value =
    null
}

async function confirmRestartAssessment() {
  if (
    !assessmentToRestart.value ||
    restartingAssessmentId.value !== null
  ) {
    return
  }

  const assessment =
    assessmentToRestart.value

  restartingAssessmentId.value =
    assessment.id

  try {
    const response =
      await api.post(
        `/exams/${assessment.id}/restart`
      )

    assessment.status =
      response.data?.data?.status ||
      'published'

    assessmentToRestart.value =
      null

    alert(
      response.data?.message ||
      'Assessment is ready again with a new access code.'
    )

    await fetchAssessments()
  }
  catch (error: any) {
    console.error(
      'RESTART ASSESSMENT ERROR:',
      error
    )

    alert(
      error.response
        ?.data
        ?.message ||
      'Failed to start the assessment again.'
    )
  }
  finally {
    restartingAssessmentId.value =
      null
  }
}

// ==========================================
// MONITOR ASSESSMENT
// ==========================================

function monitorAssessment(
  assessment: Assessment
) {
  router.push(
    `/faculty/monitoring/${assessment.id}`
  )
}

// ==========================================
// DELETE ASSESSMENT
// ==========================================

function openDeleteAssessment(
  assessment: Assessment
) {
  assessmentToDelete.value =
    assessment
}

function closeDeleteAssessment() {
  if (
    deletingAssessment.value
  ) {
    return
  }

  assessmentToDelete.value =
    null
}

async function confirmDeleteAssessment() {
  if (
    !assessmentToDelete.value ||
    deletingAssessment.value
  ) {
    return
  }

  deletingAssessment.value =
    true

  try {
    const deletingId =
      assessmentToDelete
        .value
        .id

    await api.delete(
      `/exams/${deletingId}`
    )

    assessments.value =
      assessments.value.filter(
        assessment =>
          assessment.id !==
          deletingId
      )

    assessmentToDelete.value =
      null

    await fetchClass()
  }
  catch (error: any) {
    console.error(
      'DELETE ASSESSMENT ERROR:',
      error
    )

    alert(
      error.response
        ?.data
        ?.message ||
      'Failed to delete assessment.'
    )
  }
  finally {
    deletingAssessment.value =
      false
  }
}

// ==========================================
// BACK
// ==========================================

function goBack() {
  router.push(
    '/faculty/classes'
  )
}

// ==========================================
// MOUNT
// ==========================================

onMounted(() => {
  const requestedTab =
    String(
      route.query.tab ||
      ''
    )

  if (
    requestedTab ===
      'students' ||
    requestedTab ===
      'assessments'
  ) {
    activeTab.value =
      requestedTab
  }

  loadPage()
})
</script>

<style scoped>
* {
  box-sizing:
    border-box;
}

.class-details-page {
  width:
    100%;

  min-height:
    calc(100vh - 70px);

  padding:
    28px;

  background:
    #f7faf8;

  color:
    #0f172a;

  font-family:
    'Poppins',
    sans-serif;
}

/* ==========================================
   TOP BAR
========================================== */

.details-topbar {
  margin-bottom:
    18px;

  display:
    flex;

  align-items:
    center;
}

.back-btn {
  min-height:
    38px;

  padding:
    0 13px;

  border:
    1px solid #dbe3eb;

  border-radius:
    8px;

  display:
    inline-flex;

  align-items:
    center;

  justify-content:
    center;

  gap:
    7px;

  background:
    #fff;

  color:
    #475569;

  font-family:
    inherit;

  font-size:
    10px;

  font-weight:
    700;

  cursor:
    pointer;

  transition:
    .18s ease;
}

.back-btn:hover {
  border-color:
    #86efac;

  background:
    #f0fdf4;

  color:
    #15803d;
}

/* ==========================================
   LOADING / ERROR
========================================== */

.loading-state,
.error-state {
  min-height:
    260px;

  padding:
    30px;

  border:
    1px solid #e2e8f0;

  border-radius:
    14px;

  background:
    #fff;

  display:
    flex;

  flex-direction:
    column;

  align-items:
    center;

  justify-content:
    center;

  gap:
    10px;

  text-align:
    center;
}

.loading-state {
  color:
    #64748b;

  font-size:
    11px;
}

.error-icon {
  width:
    58px;

  height:
    58px;

  border-radius:
    50%;

  display:
    flex;

  align-items:
    center;

  justify-content:
    center;

  background:
    #fee2e2;

  color:
    #dc2626;
}

.error-state h3 {
  margin:
    4px 0 0;

  font-size:
    15px;
}

.error-state p {
  margin:
    0;

  color:
    #64748b;

  font-size:
    10px;
}

.retry-btn {
  margin-top:
    5px;

  min-height:
    36px;

  padding:
    0 14px;

  border:
    none;

  border-radius:
    8px;

  background:
    #16a34a;

  color:
    #fff;

  font-family:
    inherit;

  font-size:
    10px;

  font-weight:
    700;

  cursor:
    pointer;
}

/* ==========================================
   CLASS HEADER
========================================== */

.class-header-card {
  padding:
    22px;

  border:
    1px solid #e1e8e4;

  border-radius:
    14px;

  display:
    flex;

  align-items:
    center;

  justify-content:
    space-between;

  gap:
    20px;

  background:
    #fff;

  box-shadow:
    0 4px 15px
    rgba(15, 23, 42, .035);
}

.class-header-left {
  min-width:
    0;

  display:
    flex;

  align-items:
    center;

  gap:
    15px;
}

.subject-icon {
  width:
    49px;

  height:
    49px;

  flex-shrink:
    0;

  border-radius:
    12px;

  display:
    flex;

  align-items:
    center;

  justify-content:
    center;

  background:
    #e8f8ee;

  color:
    #00a843;
}

.class-heading {
  min-width:
    0;
}

.heading-label {
  margin-bottom:
    3px;

  color:
    #16a34a;

  font-size:
    8px;

  font-weight:
    800;

  letter-spacing:
    .8px;
}

.class-heading h1 {
  margin:
    0;

  color:
    #0f172a;

  font-size:
    20px;

  font-weight:
    800;

  line-height:
    1.3;
}

.class-heading p {
  margin:
    6px 0 0;

  color:
    #64748b;

  font-size:
    10px;
}

.class-heading p span {
  margin:
    0 4px;

  color:
    #cbd5e1;
}

.class-header-meta {
  display:
    flex;

  flex-wrap:
    wrap;

  justify-content:
    flex-end;

  gap:
    7px;
}

.academic-badge {
  padding:
    7px 9px;

  border-radius:
    7px;

  display:
    inline-flex;

  align-items:
    center;

  gap:
    5px;

  background:
    #f0fdf4;

  color:
    #166534;

  font-size:
    9px;

  font-weight:
    600;
}

/* ==========================================
   TABS
========================================== */

.tabs-wrapper {
  margin-top:
    17px;

  padding:
    5px;

  border:
    1px solid #e2e8f0;

  border-radius:
    11px;

  display:
    inline-flex;

  gap:
    4px;

  background:
    #fff;
}

.tab-btn {
  min-height:
    37px;

  padding:
    0 14px;

  border:
    none;

  border-radius:
    8px;

  display:
    flex;

  align-items:
    center;

  justify-content:
    center;

  gap:
    6px;

  background:
    transparent;

  color:
    #64748b;

  font-family:
    inherit;

  font-size:
    10px;

  font-weight:
    700;

  cursor:
    pointer;

  transition:
    .18s ease;
}

.tab-btn:hover {
  background:
    #f8fafc;

  color:
    #15803d;
}

.tab-btn.active {
  background:
    #e8f8ee;

  color:
    #15803d;
}

/* ==========================================
   COMMON TAB CONTENT
========================================== */

.overview-content,
.students-content,
.assessments-content {
  margin-top:
    18px;
}

/* ==========================================
   OVERVIEW STATS
========================================== */

.stats-grid {
  margin-bottom:
    17px;

  display:
    grid;

  grid-template-columns:
    repeat(
      2,
      minmax(0, 1fr)
    );

  gap:
    14px;
}

.stat-card {
  padding:
    18px;

  border:
    1px solid #e1e8e4;

  border-radius:
    13px;

  display:
    flex;

  align-items:
    center;

  gap:
    13px;

  background:
    #fff;

  box-shadow:
    0 4px 15px
    rgba(15, 23, 42, .03);
}

.stat-icon {
  width:
    43px;

  height:
    43px;

  flex-shrink:
    0;

  border-radius:
    11px;

  display:
    flex;

  align-items:
    center;

  justify-content:
    center;

  background:
    #e8f8ee;

  color:
    #16a34a;
}

.stat-content {
  display:
    flex;

  flex-direction:
    column;
}

.stat-label {
  color:
    #64748b;

  font-size:
    9px;

  font-weight:
    600;
}

.stat-content strong {
  margin-top:
    1px;

  color:
    #0f172a;

  font-size:
    22px;

  font-weight:
    800;
}

.stat-content p {
  margin:
    2px 0 0;

  color:
    #94a3b8;

  font-size:
    8px;
}

/* ==========================================
   INFORMATION CARD
========================================== */

.information-card {
  border:
    1px solid #e1e8e4;

  border-radius:
    14px;

  background:
    #fff;

  box-shadow:
    0 4px 15px
    rgba(15, 23, 42, .03);

  overflow:
    hidden;
}

.information-header {
  padding:
    18px 20px;

  border-bottom:
    1px solid #eef2f0;

  display:
    flex;

  align-items:
    center;

  justify-content:
    space-between;

  gap:
    15px;
}

.information-header h2 {
  margin:
    0;

  color:
    #0f172a;

  font-size:
    14px;

  font-weight:
    800;
}

.information-header p {
  margin:
    4px 0 0;

  color:
    #94a3b8;

  font-size:
    9px;
}

.info-header-icon {
  width:
    38px;

  height:
    38px;

  flex-shrink:
    0;

  border-radius:
    9px;

  display:
    flex;

  align-items:
    center;

  justify-content:
    center;

  background:
    #f0fdf4;

  color:
    #16a34a;
}

.information-grid {
  padding:
    20px;

  display:
    grid;

  grid-template-columns:
    repeat(
      2,
      minmax(0, 1fr)
    );

  gap:
    13px;
}

.info-item {
  min-height:
    72px;

  padding:
    13px;

  border:
    1px solid #eef2f0;

  border-radius:
    10px;

  display:
    flex;

  align-items:
    center;

  gap:
    11px;

  background:
    #fbfdfc;
}

.info-icon {
  width:
    36px;

  height:
    36px;

  flex-shrink:
    0;

  border-radius:
    9px;

  display:
    flex;

  align-items:
    center;

  justify-content:
    center;

  background:
    #e8f8ee;

  color:
    #16a34a;
}

.info-item > div:last-child {
  min-width:
    0;

  display:
    flex;

  flex-direction:
    column;
}

.info-item span {
  margin-bottom:
    2px;

  color:
    #94a3b8;

  font-size:
    8px;

  font-weight:
    600;

  text-transform:
    uppercase;
}

.info-item strong {
  overflow:
    hidden;

  color:
    #334155;

  font-size:
    10px;

  font-weight:
    700;

  text-overflow:
    ellipsis;

  white-space:
    nowrap;
}

/* ==========================================
   STUDENTS
========================================== */

.students-header,
.assessment-header {
  margin-bottom:
    14px;

  display:
    flex;

  align-items:
    center;

  justify-content:
    space-between;

  gap:
    15px;
}

.students-header h2,
.assessment-header h2 {
  margin:
    0;

  color:
    #0f172a;

  font-size:
    16px;

  font-weight:
    800;
}

.students-header p,
.assessment-header p {
  margin:
    4px 0 0;

  color:
    #94a3b8;

  font-size:
    9px;
}

.student-count,
.assessment-count {
  display:
    flex;

  align-items:
    center;

  gap:
    5px;

  color:
    #64748b;

  font-size:
    9px;

  white-space:
    nowrap;
}

.student-count svg,
.assessment-count svg {
  color:
    #16a34a;
}

.student-count strong,
.assessment-count strong {
  color:
    #0f172a;

  font-size:
    11px;
}

.student-toolbar {
  margin-bottom:
    14px;

  padding:
    13px;

  border:
    1px solid #e2e8f0;

  border-radius:
    11px;

  display:
    flex;

  align-items:
    center;

  background:
    #fff;
}

.student-search {
  width:
    100%;

  max-width:
    430px;

  position:
    relative;
}

.student-search svg {
  position:
    absolute;

  top:
    50%;

  left:
    12px;

  color:
    #94a3b8;

  transform:
    translateY(-50%);
}

.student-search input {
  width:
    100%;

  height:
    39px;

  padding:
    0 12px 0 38px;

  border:
    1px solid #dbe3eb;

  border-radius:
    8px;

  outline:
    none;

  color:
    #334155;

  font-family:
    inherit;

  font-size:
    10px;
}

.student-search input:focus {
  border-color:
    #22c55e;

  box-shadow:
    0 0 0 3px
    rgba(34, 197, 94, .09);
}

.students-loading,
.assessments-loading {
  min-height:
    150px;

  border:
    1px solid #e2e8f0;

  border-radius:
    12px;

  display:
    flex;

  flex-direction:
    column;

  align-items:
    center;

  justify-content:
    center;

  gap:
    8px;

  background:
    #fff;

  color:
    #64748b;

  font-size:
    10px;
}

.student-list-card {
  border:
    1px solid #e1e8e4;

  border-radius:
    13px;

  background:
    #fff;

  overflow:
    hidden;

  box-shadow:
    0 4px 15px
    rgba(15, 23, 42, .03);
}

.student-table-header,
.student-row {
  display:
    grid;

  grid-template-columns:
    55px
    minmax(0, 1fr)
    180px
    110px;

  align-items:
    center;
}

.student-table-header {
  min-height:
    44px;

  padding:
    0 16px;

  background:
    #f8fafc;

  color:
    #94a3b8;

  font-size:
    8px;

  font-weight:
    800;

  text-transform:
    uppercase;

  letter-spacing:
    .4px;
}

.student-row {
  min-height:
    64px;

  padding:
    0 16px;

  border-top:
    1px solid #f1f5f9;
}

.student-number {
  color:
    #94a3b8;

  font-size:
    10px;

  font-weight:
    700;
}

.student-profile {
  min-width:
    0;

  display:
    flex;

  align-items:
    center;

  gap:
    10px;
}

.student-avatar {
  width:
    34px;

  height:
    34px;

  flex-shrink:
    0;

  border-radius:
    50%;

  display:
    flex;

  align-items:
    center;

  justify-content:
    center;

  background:
    #dcfce7;

  color:
    #15803d;

  font-size:
    11px;

  font-weight:
    800;
}

.student-profile > div:last-child {
  min-width:
    0;

  display:
    flex;

  flex-direction:
    column;
}

.student-profile strong {
  overflow:
    hidden;

  color:
    #334155;

  font-size:
    10px;

  text-overflow:
    ellipsis;

  white-space:
    nowrap;
}

.student-profile span {
  margin-top:
    2px;

  overflow:
    hidden;

  color:
    #94a3b8;

  font-size:
    8px;

  text-overflow:
    ellipsis;

  white-space:
    nowrap;
}

.student-lrn {
  color:
    #64748b;

  font-size:
    9px;
}

.student-status {
  width:
    fit-content;

  padding:
    4px 8px;

  border-radius:
    999px;

  background:
    #dcfce7;

  color:
    #166534;

  font-size:
    8px;

  font-weight:
    700;

  text-transform:
    capitalize;
}

.student-status.inactive {
  background:
    #f1f5f9;

  color:
    #64748b;
}

.students-empty,
.assessments-empty {
  min-height:
    230px;

  padding:
    30px;

  border:
    1px dashed #cbd5e1;

  border-radius:
    14px;

  display:
    flex;

  flex-direction:
    column;

  align-items:
    center;

  justify-content:
    center;

  background:
    #fff;

  text-align:
    center;
}

.students-empty-icon,
.assessments-empty-icon {
  width:
    64px;

  height:
    64px;

  margin-bottom:
    12px;

  border-radius:
    50%;

  display:
    flex;

  align-items:
    center;

  justify-content:
    center;

  background:
    #f0fdf4;

  color:
    #16a34a;
}

.students-empty h3,
.assessments-empty h3 {
  margin:
    0;

  color:
    #334155;

  font-size:
    14px;
}

.students-empty p,
.assessments-empty p {
  max-width:
    390px;

  margin:
    6px 0 0;

  color:
    #94a3b8;

  font-size:
    9px;

  line-height:
    1.6;
}

/* ==========================================
   ASSESSMENT HEADER
========================================== */

.assessment-header-actions {
  display:
    flex;

  align-items:
    center;

  gap:
    10px;
}

.create-assessment-btn,
.create-empty-assessment-btn {
  min-height:
    38px;

  padding:
    0 14px;

  border:
    none;

  border-radius:
    9px;

  display:
    inline-flex;

  align-items:
    center;

  justify-content:
    center;

  gap:
    6px;

  background:
    #16a34a;

  color:
    #fff;

  font-family:
    inherit;

  font-size:
    10px;

  font-weight:
    700;

  cursor:
    pointer;

  transition:
    .18s ease;
}

.create-assessment-btn:hover,
.create-empty-assessment-btn:hover {
  background:
    #15803d;
}

.create-empty-assessment-btn {
  margin-top:
    14px;
}

/* ==========================================
   ASSESSMENT CARDS
========================================== */

.assessment-list {
  display:
    flex;

  flex-direction:
    column;

  gap:
    12px;
}

.assessment-card {
  padding:
    18px;

  border:
    1px solid #e2e8f0;

  border-radius:
    13px;

  background:
    #fff;

  box-shadow:
    0 3px 12px
    rgba(15, 23, 42, .03);

  transition:
    .18s ease;
}

.assessment-card:hover {
  border-color:
    #bbf7d0;

  box-shadow:
    0 6px 18px
    rgba(15, 23, 42, .05);
}

.assessment-card-top {
  display:
    flex;

  align-items:
    flex-start;

  justify-content:
    space-between;

  gap:
    16px;
}

.assessment-title-wrap {
  min-width:
    0;
}

.assessment-badges {
  margin-bottom:
    7px;

  display:
    flex;

  flex-wrap:
    wrap;

  align-items:
    center;

  gap:
    6px;
}

.assessment-kind,
.status-badge {
  padding:
    4px 8px;

  border-radius:
    999px;

  font-size:
    8px;

  font-weight:
    800;

  text-transform:
    uppercase;
}

.assessment-kind.quiz {
  background:
    #fef3c7;

  color:
    #92400e;
}

.assessment-kind.examination {
  background:
    #dbeafe;

  color:
    #1d4ed8;
}

.status-badge.draft {
  background:
    #f1f5f9;

  color:
    #475569;
}

.status-badge.published {
  background:
    #fef3c7;

  color:
    #92400e;
}

.status-badge.started {
  background:
    #dcfce7;

  color:
    #166534;
}

.status-badge.finished {
  background:
    #ede9fe;

  color:
    #6d28d9;
}

.assessment-title-wrap h3 {
  margin:
    0;

  color:
    #0f172a;

  font-size:
    14px;

  font-weight:
    800;
}

.assessment-title-wrap p {
  margin:
    5px 0 0;

  color:
    #94a3b8;

  font-size:
    9px;

  line-height:
    1.5;
}

/* ==========================================
   ASSESSMENT ACTIONS
========================================== */

.assessment-actions {
  display:
    flex;

  align-items:
    center;

  flex-wrap:
    wrap;

  justify-content:
    flex-end;

  gap:
    7px;
}

.assessment-action-btn {
  min-height:
    32px;

  padding:
    0 10px;

  border:
    1px solid #e2e8f0;

  border-radius:
    7px;

  display:
    inline-flex;

  align-items:
    center;

  justify-content:
    center;

  gap:
    5px;

  background:
    #fff;

  font-family:
    inherit;

  font-size:
    9px;

  font-weight:
    700;

  cursor:
    pointer;

  transition:
    .18s ease;
}

.assessment-action-btn:disabled {
  opacity:
    .55;

  cursor:
    not-allowed;
}

.assessment-action-btn.view {
  border-color:
    #bfdbfe;

  background:
    #eff6ff;

  color:
    #2563eb;
}

.assessment-action-btn.view:hover:not(:disabled) {
  background:
    #dbeafe;
}

.assessment-action-btn.edit {
  border-color:
    #fde68a;

  background:
    #fffbeb;

  color:
    #92400e;
}

.assessment-action-btn.edit:hover {
  background:
    #fef3c7;
}

.assessment-action-btn.publish {
  border-color: #86efac;
  background: #f0fdf4;
  color: #15803d;
}

.assessment-action-btn.publish:hover:not(:disabled) {
  border-color: #22c55e;
  background: #dcfce7;
}

.assessment-action-btn.start {
  border-color:
    #16a34a;

  background:
    #16a34a;

  color:
    #fff;
}

.assessment-action-btn.start:hover {
  background:
    #15803d;
}

.assessment-action-btn.monitor {
  border-color:
    #2563eb;

  background:
    #2563eb;

  color:
    #fff;
}

.assessment-action-btn.monitor:hover {
  background:
    #1d4ed8;
}

.assessment-action-btn.restart {
  border-color: #86efac;
  background: #f0fdf4;
  color: #15803d;
}

.assessment-action-btn.restart:hover:not(:disabled) {
  border-color: #22c55e;
  background: #dcfce7;
}

.restart-assessment-icon {
  width: 58px;
  height: 58px;
  margin: 0 auto 15px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #dcfce7;
  color: #15803d;
}

.confirm-restart-assessment {
  min-height: 40px;
  padding: 0 15px;
  border: none;
  border-radius: 8px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  background: #16a34a;
  color: #fff;
  font-family: inherit;
  font-size: 10px;
  font-weight: 700;
  cursor: pointer;
}

.confirm-restart-assessment:hover:not(:disabled) {
  background: #15803d;
}

.confirm-restart-assessment:disabled {
  opacity: .6;
  cursor: not-allowed;
}

.assessment-action-btn.delete {
  border-color:
    #fecaca;

  background:
    #fef2f2;

  color:
    #dc2626;
}

.assessment-action-btn.delete:hover {
  background:
    #fee2e2;
}

/* ==========================================
   ASSESSMENT INFO
========================================== */

.assessment-info-grid {
  margin-top:
    15px;

  display:
    grid;

  grid-template-columns:
    repeat(
      4,
      minmax(0, 1fr)
    );

  gap:
    9px;
}

.assessment-info-item {
  min-height:
    56px;

  padding:
    10px;

  border:
    1px solid #eef2f7;

  border-radius:
    9px;

  display:
    flex;

  align-items:
    center;

  gap:
    8px;

  background:
    #f8fafc;

  color:
    #16a34a;
}

.assessment-info-item > div {
  min-width:
    0;

  display:
    flex;

  flex-direction:
    column;
}

.assessment-info-item span {
  margin-bottom:
    2px;

  color:
    #94a3b8;

  font-size:
    7px;

  font-weight:
    700;

  text-transform:
    uppercase;
}

.assessment-info-item strong {
  overflow:
    hidden;

  color:
    #334155;

  font-size:
    9px;

  text-overflow:
    ellipsis;

  white-space:
    nowrap;
}

.access-code-row {
  margin-top:
    10px;

  padding:
    11px 12px;

  border:
    1px solid #dcfce7;

  border-radius:
    9px;

  display:
    flex;

  align-items:
    center;

  justify-content:
    space-between;

  gap:
    12px;

  background:
    #f0fdf4;
}

.access-code-row > div {
  display:
    flex;

  align-items:
    center;

  gap:
    8px;
}

.access-code-row span {
  color:
    #64748b;

  font-size:
    8px;

  font-weight:
    700;
}

.access-code-row strong {
  padding:
    5px 9px;

  border-radius:
    6px;

  background:
    #fff;

  color:
    #166534;

  font-size:
    11px;

  font-weight:
    800;

  letter-spacing:
    1px;
}

.access-code-row small {
  color:
    #94a3b8;

  font-size:
    8px;

  text-align:
    right;
}

/* ==========================================
   MODAL
========================================== */

.modal-overlay {
  position:
    fixed;

  inset:
    0;

  z-index:
    9999;

  padding:
    20px;

  display:
    flex;

  align-items:
    center;

  justify-content:
    center;

  background:
    rgba(15, 23, 42, .48);

  backdrop-filter:
    blur(4px);
}

/* ==========================================
   VIEW ASSESSMENT MODAL
========================================== */

.assessment-view-modal {
  width:
    min(
      760px,
      95vw
    );

  max-height:
    88vh;

  overflow-y:
    auto;

  padding:
    24px;

  border-radius:
    16px;

  background:
    #fff;

  box-shadow:
    0 22px 60px
    rgba(15, 23, 42, .18);
}

.assessment-view-header {
  padding-bottom:
    17px;

  border-bottom:
    1px solid #e2e8f0;

  display:
    flex;

  justify-content:
    space-between;

  align-items:
    flex-start;

  gap:
    15px;
}

.assessment-view-type {
  display:
    inline-flex;

  margin-bottom:
    5px;

  color:
    #16a34a;

  font-size:
    9px;

  font-weight:
    800;

  text-transform:
    uppercase;

  letter-spacing:
    .5px;
}

.assessment-view-header h2 {
  margin:
    0;

  color:
    #0f172a;

  font-size:
    19px;
}

.assessment-view-header p {
  margin:
    5px 0 0;

  color:
    #64748b;

  font-size:
    11px;
}

.assessment-view-close {
  width:
    34px;

  height:
    34px;

  flex-shrink:
    0;

  border:
    none;

  border-radius:
    8px;

  display:
    flex;

  align-items:
    center;

  justify-content:
    center;

  background:
    #f1f5f9;

  color:
    #64748b;

  cursor:
    pointer;
}

.assessment-view-info {
  margin:
    18px 0;

  display:
    grid;

  grid-template-columns:
    repeat(
      4,
      minmax(0, 1fr)
    );

  gap:
    10px;
}

.assessment-view-info > div {
  padding:
    12px;

  border:
    1px solid #e2e8f0;

  border-radius:
    9px;

  display:
    flex;

  flex-direction:
    column;

  gap:
    4px;

  background:
    #f8fafc;
}

.assessment-view-info span {
  color:
    #94a3b8;

  font-size:
    8px;

  text-transform:
    uppercase;
}

.assessment-view-info strong {
  color:
    #0f172a;

  font-size:
    10px;
}

.assessment-question-list h3 {
  margin:
    0 0 12px;

  color:
    #0f172a;

  font-size:
    14px;
}

.assessment-question-empty {
  padding:
    30px;

  border:
    1px dashed #cbd5e1;

  border-radius:
    10px;

  color:
    #94a3b8;

  font-size:
    10px;

  text-align:
    center;
}

.assessment-question {
  margin-bottom:
    10px;

  padding:
    14px;

  border:
    1px solid #e2e8f0;

  border-radius:
    10px;
}

.assessment-question-top {
  margin-bottom:
    8px;

  display:
    flex;

  justify-content:
    space-between;

  color:
    #16a34a;

  font-size:
    10px;
}

.assessment-question p {
  margin:
    0 0 10px;

  color:
    #334155;

  font-size:
    11px;

  line-height:
    1.6;
}

.question-competency {
  margin:
    0 0 10px;

  color:
    #64748b;

  font-size:
    9px;

  line-height:
    1.5;
}

.assessment-options {
  display:
    grid;

  grid-template-columns:
    repeat(
      2,
      minmax(0, 1fr)
    );

  gap:
    7px;
}

.assessment-options > div {
  padding:
    8px 10px;

  border-radius:
    7px;

  background:
    #f8fafc;

  color:
    #475569;

  font-size:
    10px;
}

.assessment-answer {
  margin-top:
    10px;

  color:
    #64748b;

  font-size:
    10px;
}

/* ==========================================
   DELETE MODAL
========================================== */

.delete-assessment-modal {
  width:
    min(
      420px,
      95vw
    );

  padding:
    28px;

  border-radius:
    16px;

  background:
    #fff;

  text-align:
    center;

  box-shadow:
    0 22px 60px
    rgba(15, 23, 42, .18);
}

.delete-assessment-icon {
  width:
    60px;

  height:
    60px;

  margin:
    0 auto 15px;

  border-radius:
    50%;

  display:
    flex;

  align-items:
    center;

  justify-content:
    center;

  background:
    #fee2e2;

  color:
    #dc2626;
}

.delete-assessment-modal h2 {
  margin:
    0 0 10px;

  color:
    #0f172a;

  font-size:
    18px;
}

.delete-assessment-modal p {
  margin:
    0;

  color:
    #64748b;

  font-size:
    11px;

  line-height:
    1.7;
}

.modal-actions {
  margin-top:
    22px;

  display:
    flex;

  gap:
    10px;
}

.cancel-btn,
.confirm-assessment-delete {
  flex:
    1;

  min-height:
    40px;

  border-radius:
    8px;

  display:
    flex;

  align-items:
    center;

  justify-content:
    center;

  gap:
    6px;

  font-family:
    inherit;

  font-size:
    10px;

  font-weight:
    700;

  cursor:
    pointer;
}

.cancel-btn {
  border:
    1px solid #e2e8f0;

  background:
    #fff;

  color:
    #475569;
}

.confirm-assessment-delete {
  border:
    none;

  background:
    #dc2626;

  color:
    #fff;
}

.confirm-assessment-delete:hover:not(:disabled) {
  background:
    #b91c1c;
}

.cancel-btn:disabled,
.confirm-assessment-delete:disabled {
  opacity:
    .6;

  cursor:
    not-allowed;
}

/* ==========================================
   SPINNER
========================================== */

.spinner {
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

/* ==========================================
   RESPONSIVE
========================================== */

@media (
  max-width: 900px
) {
  .assessment-info-grid {
    grid-template-columns:
      repeat(
        2,
        minmax(0, 1fr)
      );
  }

  .assessment-view-info {
    grid-template-columns:
      repeat(
        2,
        minmax(0, 1fr)
      );
  }

  .student-table-header,
  .student-row {
    grid-template-columns:
      45px
      minmax(0, 1fr)
      130px
      90px;
  }
}

@media (
  max-width: 720px
) {
  .class-details-page {
    padding:
      18px;
  }

  .class-header-card,
  .students-header,
  .assessment-header,
  .assessment-card-top {
    align-items:
      flex-start;

    flex-direction:
      column;
  }

  .class-header-meta {
    justify-content:
      flex-start;
  }

  .tabs-wrapper {
    width:
      100%;

    display:
      grid;

    grid-template-columns:
      repeat(
        3,
        1fr
      );
  }

  .stats-grid,
  .information-grid {
    grid-template-columns:
      1fr;
  }

  .assessment-header-actions {
    width:
      100%;

    align-items:
      stretch;

    flex-direction:
      column;
  }

  .create-assessment-btn {
    width:
      100%;
  }

  .assessment-actions {
    width:
      100%;

    justify-content:
      flex-start;
  }

  .assessment-action-btn {
    flex:
      1;

    min-width:
      90px;
  }

  .access-code-row {
    align-items:
      flex-start;

    flex-direction:
      column;
  }

  .access-code-row small {
    text-align:
      left;
  }

  .student-table-header {
    display:
      none;
  }

  .student-row {
    padding:
      14px;

    grid-template-columns:
      36px
      minmax(0, 1fr);

    gap:
      8px;
  }

  .student-lrn,
  .student-status {
    grid-column:
      2;
  }

  .assessment-options {
    grid-template-columns:
      1fr;
  }
}

@media (
  max-width: 520px
) {
  .class-details-page {
    padding:
      14px;
  }

  .class-header-card {
    padding:
      17px;
  }

  .tabs-wrapper {
    overflow-x:
      auto;

    display:
      flex;
  }

  .tab-btn {
    flex:
      1;

    min-width:
      100px;
  }

  .assessment-info-grid,
  .assessment-view-info {
    grid-template-columns:
      1fr;
  }

  .modal-actions {
    flex-direction:
      column;
  }
}
</style>
