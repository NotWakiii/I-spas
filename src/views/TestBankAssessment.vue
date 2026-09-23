<template>
  <div class="manual-page">
    <!-- BACK -->
    <button
      class="back-btn"
      @click="goBackToSelection"
    >
      <ArrowLeft :size="18" />
      <span>Back to Selection</span>
    </button>
    <!-- PAGE HEADER -->
    <div class="page-header">
      <h1>
        Test Bank
        {{
          assessmentType === 'quiz'
            ? 'Quiz'
            : 'Examination'
        }}
        Creation
      </h1>
      <p>
        Create your assessment using saved Test Bank questions or add questions manually.
      </p>
    </div>
    <!-- ==========================================
         TOP SECTION
    =========================================== -->
    <div class="top-grid">
      <!-- EXAM DETAILS -->
      <div class="card">
        <h2>Assessment Details</h2>

        <div class="form-group">
          <label>Assessment Type</label>

          <div class="assessment-type-options">
            <button
              type="button"
              class="assessment-type-card"
              :class="{
                active:
                  assessmentType === 'quiz'
              }"
              @click="assessmentType = 'quiz'"
            >
              <strong>Quiz</strong>
              <span>
                Short assessment without Item Analysis.
              </span>
            </button>

            <button
              type="button"
              class="assessment-type-card"
              :class="{
                active:
                  assessmentType === 'examination'
              }"
              @click="assessmentType = 'examination'"
            >
              <strong>Examination</strong>
              <span>
                Formal assessment with Item Analysis.
              </span>
            </button>
          </div>
        </div>

        <div class="form-group">
          <label>
            {{
              assessmentType === 'quiz'
                ? 'Quiz Title'
                : 'Examination Title'
            }}
          </label>

          <input
            v-model="examTitle"
            type="text"
            :placeholder="
              assessmentType === 'quiz'
                ? 'Quiz 1'
                : 'Midterm Examination'
            "
          >
        </div>
        <div class="form-group">
          <label>Description</label>
          <textarea
            v-model="description"
            placeholder="Enter description..."
          ></textarea>
        </div>
        <div class="form-group">
          <label>
            {{
              isClassLocked
                ? 'Assigned Class'
                : 'Assign to Classes'
            }}
          </label>
          <div
            v-if="loadingClasses"
            class="class-loading"
          >
            Loading classes...
          </div>
          <div
            v-else-if="visibleClasses.length > 0"
            class="class-selection-box"
          >
            <label
              v-for="schoolClass in visibleClasses"
              :key="schoolClass.id"
              class="class-checkbox-item"
              :class="{
                selected:
                  selectedClassIds.includes(
                    schoolClass.id
                  )
              }"
            >
              <input
                v-model="selectedClassIds"
                type="checkbox"
                :value="schoolClass.id"
                :disabled="isClassLocked"
              >
              <div class="class-checkbox-info">
                <strong>
                  {{
                    schoolClass.subject?.name ||
                    'No Subject'
                  }}
                </strong>

                <span>
                  {{ schoolClass.grade }}
                  •
                  {{
                    schoolClass.strand?.name ||
                    'No Strand'
                  }}
                  •
                  {{
                    schoolClass.section_data?.section ||
                    schoolClass.section ||
                    'No Section'
                  }}
                </span>

                <small>
                  {{
                    schoolClass.school_year?.year ||
                    'No School Year'
                  }}
                  •
                  {{
                    schoolClass.semester ||
                    'No Semester'
                  }}
                </small>
              </div>
            </label>
          </div>
          <p
            v-if="
              !loadingClasses &&
              classes.length === 0
            "
            class="class-warning"
          >
            No classes found. Create a class in Class Management first.
          </p>
          <p
            v-if="selectedClassIds.length > 0"
            class="selected-class-count"
          >
            {{ selectedClassIds.length }} class(es) selected
          </p>

          <p
            v-if="hasMixedSubjects"
            class="class-warning"
          >
            Selected classes must have the same subject.
          </p>

          <p
            v-if="isClassLocked"
            class="locked-class-note"
          >
            This assessment will be created for the class selected from Class Management.
          </p>
        </div>
        <div
          v-if="selectedSubject"
          class="selected-subject"
        >
          <div>
            <span>Subject</span>
            <strong>
              {{ selectedSubject }}
            </strong>
          </div>

          <small>
            Automatically based on the selected class.
          </small>
        </div>
        <div class="two-column">
          <div class="form-group">
            <label>Duration (minutes)</label>
            <input
              v-model.number="duration"
              type="number"
              min="1"
            >
          </div>
          <div class="form-group">
            <label>Passing Score (%)</label>
            <input
              v-model.number="passing"
              type="number"
              min="1"
              max="100"
            >
          </div>
        </div>
        <div class="violation-settings">
          <div class="violation-settings-header">
            <div>
              <h3>Violation Time Penalties</h3>
              <p>Optional. Leave blank or enter 0 if no time deduction is required.</p>
            </div>
          </div>

          <div class="violation-grid">
            <div class="form-group">
              <label>Tab Switch</label>
              <div class="penalty-input">
                <input
                  v-model.number="tabSwitchPenaltyMinutes"
                  type="number"
                  min="0"
                  step="1"
                  placeholder="0"
                >
                <span>min / violation</span>
              </div>
            </div>

            <div class="form-group">
              <label>Fullscreen Exit</label>
              <div class="penalty-input">
                <input
                  v-model.number="fullscreenExitPenaltyMinutes"
                  type="number"
                  min="0"
                  step="1"
                  placeholder="0"
                >
                <span>min / violation</span>
              </div>
            </div>

            <div class="form-group">
              <label>Copy Attempt</label>
              <div class="penalty-input">
                <input
                  v-model.number="copyAttemptPenaltyMinutes"
                  type="number"
                  min="0"
                  step="1"
                  placeholder="0"
                >
                <span>min / violation</span>
              </div>
            </div>

            <div class="form-group">
              <label>Paste Attempt</label>
              <div class="penalty-input">
                <input
                  v-model.number="pasteAttemptPenaltyMinutes"
                  type="number"
                  min="0"
                  step="1"
                  placeholder="0"
                >
                <span>min / violation</span>
              </div>
            </div>

            <div class="form-group">
              <label>Idle Violation</label>
              <div class="penalty-input">
                <input
                  v-model.number="idlePenaltyMinutes"
                  type="number"
                  min="0"
                  step="1"
                  placeholder="0"
                >
                <span>min / violation</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- EXAM SUMMARY -->
      <div class="card">
        <h2>Assessment Summary</h2>

        <div class="assessment-summary-info">
          <div>
            <span>Type</span>
            <strong>
              {{
                assessmentType === 'quiz'
                  ? 'Quiz'
                  : 'Examination'
              }}
            </strong>
          </div>

          <div>
            <span>Subject</span>
            <strong>
              {{
                selectedSubject ||
                'Not selected'
              }}
            </strong>
          </div>

          <div>
            <span>Item Analysis</span>
            <strong>
              {{
                assessmentType === 'examination'
                  ? 'Available'
                  : 'Not Available'
              }}
            </strong>
          </div>
        </div>

        <div class="summary-box">
          <div>
            <span>Total Questions</span>
            <h1>{{ questions.length }}</h1>
          </div>
          <div>
            <span>Total Points</span>
            <h1>{{ totalPoints }}</h1>
          </div>
        </div>
        <button
          class="create-btn"
          :disabled="creatingExam"
          @click="openCreatePopup"
        >
          <LoaderCircle
            v-if="creatingExam"
            :size="18"
            class="spin"
          />
          <CircleCheckBig
            v-else
            :size="18"
          />
          <span>
            {{
              creatingExam
                ? 'Creating...'
                : assessmentType === 'quiz'
                  ? 'Create Quiz'
                  : 'Create Examination'
            }}
          </span>
        </button>
      </div>
    </div>
    <!-- ==========================================
         ADD QUESTIONS
    =========================================== -->
    <div class="card add-question-card">
      <div class="questions-header">
        <div>
          <h2>Add Questions</h2>
          <p>Add a question manually or select saved questions from your Test Bank.</p>
        </div>
        <div class="add-question-actions">
          <button class="add-btn action-btn" @click="openQuestionModal">
            <Plus :size="18" />
            <span>Add Question</span>
          </button>
          <button
            class="add-btn bank-select-btn action-btn"
            :disabled="!selectedSubjectId || hasMixedSubjects"
            @click="openBankModal"
          >
            <BookOpenCheck :size="18" />
            <span>Add From Test Bank</span>
          </button>
        </div>
      </div>
    </div>
    <!-- ==========================================
         QUESTIONS ADDED
    =========================================== -->
    <div class="card">
      <div class="questions-header">
        <div>
          <h2>Questions Added</h2>
          <p>
            Review your questions before
            creating the assessment.
          </p>
        </div>
      </div>
      <div
        v-if="questions.length === 0"
        class="empty"
      >
        No questions added yet.
      </div>
      <div
        v-for="(item, index) in questions"
        :key="index"
        class="question-item"
      >
        <div class="question-top">
          <h3>
            Question {{ index + 1 }}
          </h3>
          <div class="question-actions">
            <button
              class="remove-btn"
              @click="openRemovePopup(index)"
            >
              <Trash2 :size="16" />
              <span>Remove</span>
            </button>
          </div>
        </div>
        <p class="question-text">
          {{ item.question }}
        </p>
        <p
          v-if="item.competency"
          class="competency-text"
        >
          <strong>Competency:</strong>
          {{ item.competency }}
        </p>
        <div
          v-if="
            item.type ===
            'Multiple Choice'
          "
          class="preview-options"
        >
          <div
            v-for="
              (
                option,
                optionIndex
              ) in item.options
            "
            :key="optionIndex"
            class="preview-option"
          >
            <span>
              {{
                String.fromCharCode(
                  65 +
                  optionIndex
                )
              }}.
            </span>
            {{ option }}
          </div>
        </div>
        <div class="question-meta">
          <span>
            {{ item.type }}
          </span>
          <span>
            {{ item.points }} pts
          </span>
          <span>
            {{ item.time }} sec
          </span>
          <span>
            Answer:
            {{ item.answer }}
          </span>
        </div>
      </div>
    </div>
    <!-- ==========================================
         TEST BANK MODAL
    =========================================== -->
    <!-- ==========================================
         MANUAL QUESTION POPUP
    =========================================== -->
    <div
      v-if="showQuestionModal"
      class="popup-overlay"
      @click.self="closeQuestionModal"
    >
      <div class="question-modal-card">
        <div class="question-modal-header">
          <div>
            <h2>Add Question</h2>
            <p>Enter the question details, then add it to the assessment.</p>
          </div>
          <button class="icon-btn" type="button" @click="closeQuestionModal">
            <X :size="20" />
          </button>
        </div>
        <div class="form-group">
          <label>Question Type</label>
          <select v-model="questionType" @change="resetAnswerForType">
            <option>Multiple Choice</option>
            <option>True or False</option>
            <option>Identification</option>
          </select>
        </div>
        <div class="form-group">
          <label>Question</label>
          <textarea v-model="question" placeholder="Enter question..."></textarea>
        </div>
        <div class="form-group">
          <label>
            Competency
            <span class="field-requirement">
              {{ assessmentType === 'examination' ? '(Required)' : '(Optional)' }}
            </span>
          </label>
          <input
            v-model="competency"
            type="text"
            :placeholder="assessmentType === 'examination' ? 'Enter learning competency' : 'Optional for quizzes'"
          >
        </div>
        <div v-if="questionType === 'Multiple Choice'">
          <label class="choices-label">Choices</label>
          <div v-for="(option, index) in options" :key="index" class="option">
            <input v-model="options[index]" :placeholder="'Option ' + (index + 1)">
          </div>
          <div class="form-group">
            <label>Correct Answer</label>
            <select v-model="answer">
              <option disabled value="">Select Correct Answer</option>
              <option
                v-for="(option, index) in options"
                :key="index"
                :value="String.fromCharCode(65 + index)"
                :disabled="!option.trim()"
              >
                {{ String.fromCharCode(65 + index) }}. {{ option || 'Option ' + (index + 1) }}
              </option>
            </select>
          </div>
        </div>
        <div v-if="questionType === 'True or False'" class="form-group">
          <label>Correct Answer</label>
          <select v-model="answer">
            <option disabled value="">Select Correct Answer</option>
            <option value="True">True</option>
            <option value="False">False</option>
          </select>
        </div>
        <div v-if="questionType === 'Identification'" class="form-group">
          <label>Correct Answer</label>
          <input v-model="answer" type="text" placeholder="Correct Answer">
        </div>
        <div class="two-column">
          <div class="form-group">
            <label>Time Limit (seconds)</label>
            <input v-model.number="timeLimit" type="number" min="1">
          </div>
          <div class="form-group">
            <label>Points</label>
            <input v-model.number="points" type="number" min="1">
          </div>
        </div>
        <div class="question-modal-footer">
          <button class="cancel-btn" type="button" @click="closeQuestionModal">Cancel</button>
          <button class="confirm-btn" type="button" @click="addQuestion">
            <Plus :size="17" />
            Add Question
          </button>
        </div>
      </div>
    </div>
    <div
      v-if="showBankModal"
      class="popup-overlay"
      @click.self="closeBankModal"
    >
      <div class="test-bank-modal">
        <div class="test-bank-modal-header">
          <div>
            <h2>Add From Test Bank</h2>
            <p>Select enabled questions for {{ selectedSubject }}.</p>
          </div>
          <button class="icon-btn" @click="closeBankModal"><X :size="20" /></button>
        </div>
        <div class="test-bank-filters">
          <div class="test-bank-search">
            <Search :size="17" />
            <input v-model="bankSearch" type="text" placeholder="Search question or competency...">
          </div>
          <select v-model="bankTypeFilter">
            <option value="">All Types</option>
            <option value="multiple_choice">Multiple Choice</option>
            <option value="true_false">True or False</option>
            <option value="identification">Identification</option>
          </select>
        </div>
        <div v-if="bankLoading" class="bank-state"><LoaderCircle :size="26" class="spin" /><span>Loading questions...</span></div>
        <div v-else-if="filteredBankQuestions.length === 0" class="bank-state"><BookOpenCheck :size="32" /><span>No enabled Test Bank questions available.</span></div>
        <div v-else class="test-bank-list">
          <label
            v-for="bankQuestion in filteredBankQuestions"
            :key="bankQuestion.id"
            class="test-bank-question"
            :class="{ selected: selectedBankIds.has(bankQuestion.id) }"
          >
            <input type="checkbox" :checked="selectedBankIds.has(bankQuestion.id)" @change="toggleBankQuestion(bankQuestion.id)">
            <div class="test-bank-question-content">
              <div class="test-bank-question-tags">
                <span>{{ bankTypeLabel(bankQuestion.question_type) }}</span>
                <span>{{ bankQuestion.points }} pt{{ Number(bankQuestion.points) === 1 ? '' : 's' }}</span>
              </div>
              <strong>{{ bankQuestion.question }}</strong>
              <small v-if="bankQuestion.competency">{{ bankQuestion.competency }}</small>
            </div>
          </label>
        </div>
        <div class="test-bank-modal-footer">
          <span>{{ selectedBankIds.size }} selected</span>
          <div>
            <button class="cancel-btn" @click="closeBankModal">Cancel</button>
            <button class="confirm-btn" :disabled="selectedBankIds.size === 0" @click="addSelectedBankQuestions"><Plus :size="17" /> Add Selected</button>
          </div>
        </div>
      </div>
    </div>
    <!-- ==========================================
         CREATE EXAM POPUP
    =========================================== -->
    <div
      v-if="showCreatePopup"
      class="popup-overlay"
      @click.self="stillEdit"
    >
      <div class="popup-card">
        <div class="popup-icon">
          <CircleCheckBig :size="38" />
        </div>
        <h2>
          Create
          {{
            assessmentType === 'quiz'
              ? 'Quiz'
              : 'Examination'
          }}?
        </h2>

        <p>
          This assessment will be saved as a
          draft. You can still edit it later.
        </p>
        <div class="popup-summary">
          <div>
            <span>Type</span>
            <strong>
              {{
                assessmentType === 'quiz'
                  ? 'Quiz'
                  : 'Examination'
              }}
            </strong>
          </div>

          <div>
            <span>Assessment</span>
            <strong>
              {{ examTitle }}
            </strong>
          </div>
          <div>
            <span>Subject</span>
            <strong>
              {{
                selectedSubject ||
                'Not selected'
              }}
            </strong>
          </div>
          <div>
            <span>Class</span>
            <strong>
              {{ selectedClassLabel }}
            </strong>
          </div>
          <div>
            <span>Questions</span>
            <strong>
              {{ questions.length }}
            </strong>
          </div>

          <div>
            <span>Item Analysis</span>
            <strong>
              {{
                assessmentType === 'examination'
                  ? 'Available'
                  : 'Not Available'
              }}
            </strong>
          </div>
        </div>
        <div class="popup-buttons">
          <button
            class="cancel-btn"
            :disabled="creatingExam"
            @click="stillEdit"
          >
            Still Edit
          </button>
          <button
            class="confirm-btn"
            :disabled="creatingExam"
            @click="confirmCreateExam"
          >
            {{
              creatingExam
                ? 'Creating...'
                : assessmentType === 'quiz'
                  ? 'Create Quiz'
                  : 'Create Examination'
            }}
          </button>
        </div>
      </div>
    </div>
    <!-- ==========================================
         REMOVE QUESTION POPUP
    =========================================== -->
    <div
      v-if="showRemovePopup"
      class="popup-overlay"
      @click.self="closeRemovePopup"
    >
      <div class="popup-card remove-popup-card">
        <div class="remove-popup-icon">
          <Trash2 :size="32" />
        </div>
        <h2>Remove Question?</h2>
        <p>
          Are you sure you want to remove
          Question {{ pendingRemoveIndex + 1 }}?
          This action cannot be undone.
        </p>
        <div class="popup-buttons">
          <button
            class="cancel-btn"
            @click="closeRemovePopup"
          >
            Cancel
          </button>
          <button
            class="delete-confirm-btn"
            @click="confirmRemoveQuestion"
          >
            Remove
          </button>
        </div>
      </div>
    </div>
    <!-- ==========================================
         SYSTEM NOTIFICATION
    =========================================== -->
    <Transition name="notification">
      <div
        v-if="notification.show"
        class="notification-container"
        :class="notification.type"
      >
        <div class="notification-icon">
          <span
            v-if="
              notification.type ===
              'success'
            "
          >
            ✓
          </span>
          <span
            v-else-if="
              notification.type ===
              'error'
            "
          >
            !
          </span>
          <span v-else>
            i
          </span>
        </div>
        <div class="notification-content">
          <strong>
            {{ notification.title }}
          </strong>
          <p>
            {{ notification.message }}
          </p>
        </div>
        <button
          type="button"
          class="notification-close"
          @click="closeNotification"
        >
          ×
        </button>
      </div>
    </Transition>
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
import api from '../services/api'
import {
  ArrowLeft,
  Plus,
  Trash2,
  CircleCheckBig,
  LoaderCircle,
  BookOpenCheck,
  Search,
  X
} from '@lucide/vue'

const route =
  useRoute()

const router =
  useRouter()

// ==========================================
// TYPES
// ==========================================

interface ManualQuestion {
  type: string
  question: string
  competency: string
  answer: string
  options: string[]
  points: number
  time: number
  test_bank_question_id?: number | null
  source?: 'manual' | 'test_bank'
  testBankSaved?: boolean
  testBankAdding?: boolean
}

interface TestBankOption {
  option_text: string
  is_correct: boolean
}

interface TestBankQuestion {
  id: number
  subject_id: number
  question: string
  question_type: 'multiple_choice' | 'true_false' | 'identification'
  competency?: string | null
  answer?: string | null
  points: number
  is_active: boolean | number
  options?: TestBankOption[]
}

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
}

type NotificationType =
  'success' |
  'error' |
  'info'

// ==========================================
// EXAM DETAILS
// ==========================================

const assessmentType =
  ref<
    'quiz' |
    'examination'
  >('examination')

const examTitle =
  ref('')

const description =
  ref('')

const classes =
  ref<SchoolClass[]>([])

const selectedClassIds =
  ref<number[]>([])

const loadingClasses =
  ref(false)

const sourceClassId =
  computed(() => {
    const id =
      Number(
        route.query.class_id
      )

    return (
      Number.isInteger(id) &&
      id > 0
    )
      ? id
      : null
  })

const isClassLocked =
  computed(() =>
    sourceClassId.value !== null
  )

const visibleClasses =
  computed(() => {
    if (!sourceClassId.value) {
      return classes.value
    }

    return classes.value.filter(
      schoolClass =>
        schoolClass.id ===
        sourceClassId.value
    )
  })

const selectedClasses =
  computed(() => {
    return classes.value.filter(
      schoolClass =>
        selectedClassIds.value.includes(
          schoolClass.id
        )
    )
  })

const selectedSubjectIds =
  computed(() => {
    return [
      ...new Set(
        selectedClasses.value.map(
          schoolClass =>
            schoolClass.subject_id
        )
      )
    ]
  })

const hasMixedSubjects =
  computed(() =>
    selectedSubjectIds.value.length > 1
  )

const selectedSubject =
  computed(() => {
    if (
      selectedClasses.value.length === 0
    ) {
      return ''
    }

    return (
      selectedClasses.value[0]
        ?.subject?.name ||
      ''
    )
  })

const selectedSubjectId =
  computed(() => {
    if (selectedSubjectIds.value.length !== 1) return null
    return selectedSubjectIds.value[0] || null
  })

const duration =
  ref(60)

const passing =
  ref(75)

const tabSwitchPenaltyMinutes =
  ref<number | null>(null)

const fullscreenExitPenaltyMinutes =
  ref<number | null>(null)

const copyAttemptPenaltyMinutes =
  ref<number | null>(null)

const pasteAttemptPenaltyMinutes =
  ref<number | null>(null)

const idlePenaltyMinutes =
  ref<number | null>(null)

const selectedClassLabel =
  computed(() => {
    if (
      selectedClasses.value.length === 0
    ) {
      return 'Not selected'
    }

    return selectedClasses.value
      .map(
        schoolClass => {
          const subject =
            schoolClass.subject?.name ||
            'No Subject'

          const grade =
            schoolClass.grade

          const strand =
            schoolClass.strand?.name ||
            ''

          const section =
            schoolClass.section_data?.section ||
            schoolClass.section ||
            ''

          return [
            subject,
            grade,
            strand,
            section
          ]
            .filter(Boolean)
            .join(' • ')
        }
      )
      .join(', ')
  })

// ==========================================
// NOTIFICATION
// ==========================================

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

function closeNotification() {
  notification.value.show =
    false

  if (notificationTimer) {
    clearTimeout(
      notificationTimer
    )

    notificationTimer =
      null
  }
}

// ==========================================
// LOAD FACULTY CLASSES
// ==========================================

async function fetchClasses() {
  loadingClasses.value =
    true

  try {
    const response =
      await api.get(
        '/faculty/classes'
      )

    classes.value =
      Array.isArray(
        response.data?.data
      )
        ? response.data.data
        : []

    if (sourceClassId.value) {
      const classExists =
        classes.value.some(
          schoolClass =>
            schoolClass.id ===
            sourceClassId.value
        )

      if (classExists) {
        selectedClassIds.value = [
          sourceClassId.value
        ]
      }
      else {
        selectedClassIds.value = []

        showNotification(
          'error',
          'Class Not Found',
          'The selected class is not available in your Class Management.'
        )
      }
    }
  }
  catch (error: any) {
    console.error(
      'LOAD CLASSES ERROR:',
      error
    )

    classes.value = []

    showNotification(
      'error',
      'Unable to Load Classes',
      error.response
        ?.data
        ?.message ||
      'Failed to load classes.'
    )
  }
  finally {
    loadingClasses.value =
      false
  }
}

// ==========================================
// QUESTION FORM
// ==========================================

const questionType =
  ref('Multiple Choice')

const question =
  ref('')

const competency =
  ref('')

const answer =
  ref('')

const points =
  ref(1)

const timeLimit =
  ref(30)

const options =
  ref([
    '',
    '',
    '',
    ''
  ])

// ==========================================
// QUESTIONS
// ==========================================

const questions =
  ref<ManualQuestion[]>([])

const showQuestionModal = ref(false)

const showBankModal = ref(false)
const bankLoading = ref(false)
const bankQuestions = ref<TestBankQuestion[]>([])
const bankSearch = ref('')
const bankTypeFilter = ref('')
const selectedBankIds = ref<Set<number>>(new Set())

const addedBankIds = computed(() =>
  new Set(questions.value.map(item => item.test_bank_question_id).filter(Boolean))
)

const filteredBankQuestions = computed(() => {
  const search = bankSearch.value.trim().toLowerCase()
  return bankQuestions.value.filter(item => {
    if (addedBankIds.value.has(item.id)) return false
    if (bankTypeFilter.value && item.question_type !== bankTypeFilter.value) return false
    if (!search) return true
    return `${item.question} ${item.competency || ''}`.toLowerCase().includes(search)
  })
})

const addingAllToTestBank = ref(false)

// ==========================================
// SELECT FROM TEST BANK
// ==========================================
function bankTypeLabel(type: TestBankQuestion['question_type']) {
  if (type === 'multiple_choice') return 'Multiple Choice'
  if (type === 'true_false') return 'True or False'
  return 'Identification'
}

async function fetchBankQuestions() {
  if (!selectedSubjectId.value || selectedClassIds.value.length === 0) return

  bankLoading.value = true

  try {
    const requests = selectedClassIds.value.map(classId =>
      api.get('/faculty/test-bank', {
        params: {
          class_id: classId
        }
      })
    )

    const responses = await Promise.all(requests)

    const questionMap = new Map<number, TestBankQuestion>()

    responses.forEach(response => {
      const data = Array.isArray(response.data?.data)
        ? response.data.data
        : []

      data.forEach((item: TestBankQuestion) => {
        if (item.is_active === true || item.is_active === 1) {
          questionMap.set(item.id, item)
        }
      })
    })

    bankQuestions.value = Array.from(questionMap.values())
  } catch (error: any) {
    bankQuestions.value = []
    showNotification(
      'error',
      'Test Bank Error',
      error.response?.data?.message ||
        'Failed to load Test Bank questions for the selected class.'
    )
  } finally {
    bankLoading.value = false
  }
}

async function openBankModal() {
  if (!selectedSubjectId.value) {
    showNotification('error', 'Subject Required', 'Select a class with a subject first.')
    return
  }
  if (hasMixedSubjects.value) {
    showNotification('error', 'Different Subjects Selected', 'All selected classes must belong to the same subject.')
    return
  }
  bankSearch.value = ''
  bankTypeFilter.value = ''
  selectedBankIds.value = new Set()
  showBankModal.value = true
  await fetchBankQuestions()
}

function closeBankModal() {
  showBankModal.value = false
  selectedBankIds.value = new Set()
}

function toggleBankQuestion(id: number) {
  const next = new Set(selectedBankIds.value)
  next.has(id) ? next.delete(id) : next.add(id)
  selectedBankIds.value = next
}

function normalizeBankQuestion(item: TestBankQuestion): ManualQuestion {
  const bankOptions = item.options || []
  const options = bankOptions.map(option => String(option.option_text || '').trim())
  let answer = String(item.answer || '').trim()
  if (item.question_type === 'multiple_choice') {
    const correctIndex = bankOptions.findIndex(option => Boolean(option.is_correct))
    if (correctIndex >= 0) answer = String.fromCharCode(65 + correctIndex)
  } else if (item.question_type === 'true_false') {
    const correct = bankOptions.find(option => Boolean(option.is_correct))
    if (correct) answer = correct.option_text
  }
  return {
    type: bankTypeLabel(item.question_type),
    question: item.question,
    competency: item.competency || '',
    answer,
    options: item.question_type === 'multiple_choice' ? options : [],
    points: Number(item.points || 1),
    time: 30,
    test_bank_question_id: item.id,
    source: 'test_bank'
  }
}

function addSelectedBankQuestions() {
  const selected = bankQuestions.value.filter(item => selectedBankIds.value.has(item.id) && !addedBankIds.value.has(item.id))
  questions.value.push(...selected.map(normalizeBankQuestion))
  closeBankModal()
  showNotification('success', 'Questions Added', `${selected.length} Test Bank question${selected.length === 1 ? '' : 's'} added.`)
}

// ==========================================
// TEST BANK
// ==========================================

function questionTypeForApi(type: string) {
  if (type === 'Multiple Choice') return 'multiple_choice'
  if (type === 'True or False') return 'true_false'
  return 'identification'
}

function buildTestBankOptions(item: ManualQuestion) {
  if (item.type === 'Multiple Choice') {
    return item.options.map((option, index) => ({
      option_text: String(option || '').trim(),
      is_correct: item.answer === String.fromCharCode(65 + index)
    }))
  }
  if (item.type === 'True or False') {
    return ['True', 'False'].map(option => ({
      option_text: option,
      is_correct: item.answer === option
    }))
  }
  return []
}

function buildTestBankQuestion(item: ManualQuestion) {
  return {
    question: item.question.trim(),
    question_type: questionTypeForApi(item.type),
    competency: item.competency.trim() || null,
    answer: String(item.answer || '').trim() || null,
    points: Number(item.points || 1),
    options: buildTestBankOptions(item)
  }
}

function validateTestBankQuestion(item: ManualQuestion): string | null {
  if (!selectedSubjectId.value) return 'Please select a class with a subject first.'
  if (!item.question.trim()) return 'Please enter the question text first.'
  if (!String(item.answer || '').trim()) return 'Please provide the correct answer first.'
  if (item.type === 'Multiple Choice') {
    if (item.options.length !== 4 || item.options.some(option => !String(option || '').trim())) {
      return 'Please complete all four Multiple Choice options first.'
    }
    if (!['A', 'B', 'C', 'D'].includes(item.answer)) return 'Please select the correct Multiple Choice answer first.'
  }
  return null
}

async function addQuestionToTestBank(item: ManualQuestion) {
  if (item.testBankSaved || item.testBankAdding) return
  const errorMessage = validateTestBankQuestion(item)
  if (errorMessage) {
    showNotification('error', 'Cannot Add to Test Bank', errorMessage)
    return
  }
  item.testBankAdding = true
  try {
    const response = await api.post('/faculty/test-bank', {
      subject_id: selectedSubjectId.value,
      class_ids: selectedClassIds.value,
      ...buildTestBankQuestion(item)
    })
    item.testBankSaved = true
    showNotification(
      'success',
      response.data?.already_exists ? 'Already in Test Bank' : 'Added to Test Bank',
      response.data?.message || 'Question added to Test Bank successfully.'
    )
  } catch (error: any) {
    showNotification('error', 'Test Bank Error', error.response?.data?.message || 'Failed to add the question to Test Bank.')
  } finally {
    item.testBankAdding = false
  }
}

async function addAllQuestionsToTestBank() {
  if (addingAllToTestBank.value) return
  if (!selectedSubjectId.value) {
    showNotification('error', 'Subject Required', 'Please select a class with a subject first.')
    return
  }
  if (hasMixedSubjects.value) {
    showNotification('error', 'Different Subjects Selected', 'All selected classes must belong to the same subject.')
    return
  }
  if (questions.value.length === 0) {
    showNotification('error', 'No Questions Available', 'Please add at least one question first.')
    return
  }
  const invalidQuestion = questions.value.find(item => validateTestBankQuestion(item))
  if (invalidQuestion) {
    const questionNumber = questions.value.indexOf(invalidQuestion) + 1
    showNotification('error', 'Incomplete Question', `Question ${questionNumber}: ${validateTestBankQuestion(invalidQuestion)}`)
    return
  }
  addingAllToTestBank.value = true
  try {
    const response = await api.post('/faculty/test-bank/bulk', {
      subject_id: selectedSubjectId.value,
      class_ids: selectedClassIds.value,
      questions: questions.value.map(buildTestBankQuestion)
    })
    questions.value.forEach(item => { item.testBankSaved = true })
    showNotification('success', 'Test Bank Updated', response.data?.message || `${questions.value.length} question(s) added to Test Bank.`)
  } catch (error: any) {
    showNotification('error', 'Test Bank Error', error.response?.data?.message || 'Failed to add questions to Test Bank.')
  } finally {
    addingAllToTestBank.value = false
  }
}

// ==========================================
// CREATE STATE
// ==========================================

const showCreatePopup =
  ref(false)

const creatingExam =
  ref(false)

// ==========================================
// REMOVE STATE
// ==========================================

const showRemovePopup =
  ref(false)

const pendingRemoveIndex =
  ref(-1)

// ==========================================
// TOTAL POINTS
// ==========================================

const totalPoints =
  computed(() => {
    return questions.value.reduce(
      (
        sum,
        item
      ) => {
        return (
          sum +
          Number(
            item.points || 0
          )
        )
      },
      0
    )
  })

// ==========================================
// MANUAL QUESTION POPUP
// ==========================================

function openQuestionModal() {
  resetQuestionForm()
  showQuestionModal.value = true
}

function closeQuestionModal() {
  showQuestionModal.value = false
  resetQuestionForm()
}

// ==========================================
// RESET ANSWER WHEN TYPE CHANGES
// ==========================================

function resetAnswerForType() {
  answer.value =
    ''

  if (
    questionType.value !==
    'Multiple Choice'
  ) {
    options.value = [
      '',
      '',
      '',
      ''
    ]
  }
}

// ==========================================
// ADD QUESTION
// ==========================================

function addQuestion() {
  if (
    !question.value.trim()
  ) {
    showNotification(
      'error',
      'Question Required',
      'Please enter a question.'
    )
    return
  }

  if (
    assessmentType.value ===
      'examination'
    &&
    !competency.value.trim()
  ) {
    showNotification(
      'error',
      'Competency Required',
      'Competency is required for examination questions because Item Analysis is enabled.'
    )
    return
  }

  if (
    Number(
      points.value
    ) < 1
  ) {
    showNotification(
      'error',
      'Invalid Points',
      'Points must be at least 1.'
    )
    return
  }

  if (
    Number(
      timeLimit.value
    ) < 1
  ) {
    showNotification(
      'error',
      'Invalid Time Limit',
      'Time limit must be at least 1 second.'
    )
    return
  }

  if (
    questionType.value ===
    'Multiple Choice'
  ) {
    const hasEmptyOption =
      options.value.some(
        option =>
          !option.trim()
      )

    if (hasEmptyOption) {
      showNotification(
        'error',
        'Incomplete Choices',
        'Please complete all choices.'
      )
      return
    }

    const normalizedOptions =
      options.value.map(
        option =>
          option
            .trim()
            .toLowerCase()
      )

    const duplicateOptions =
      new Set(
        normalizedOptions
      )

    if (
      duplicateOptions.size !==
      options.value.length
    ) {
      showNotification(
        'error',
        'Duplicate Choices',
        'Multiple choice options must be unique.'
      )
      return
    }
  }

  if (
    !answer.value.trim()
  ) {
    showNotification(
      'error',
      'Correct Answer Required',
      questionType.value ===
        'Multiple Choice'
        ? 'Please select the correct answer.'
        : 'Please enter or select the correct answer.'
    )
    return
  }

  questions.value.push({
    type:
      questionType.value,
    question:
      question.value.trim(),
    competency:
      competency.value.trim(),
    answer:
      answer.value.trim(),
    options:
      questionType.value ===
        'Multiple Choice'
        ? options.value.map(
            option =>
              option.trim()
          )
        : [],
    points:
      Number(
        points.value
      ),
    time:
      Number(
        timeLimit.value
      ),
    testBankSaved: false,
    testBankAdding: false
  })

  resetQuestionForm()
  showQuestionModal.value = false

  showNotification(
    'success',
    'Question Added',
    `Question ${questions.value.length} added successfully.`
  )
}

// ==========================================
// RESET QUESTION FORM
// ==========================================

function resetQuestionForm() {
  question.value =
    ''

  competency.value =
    ''

  answer.value =
    ''

  options.value = [
    '',
    '',
    '',
    ''
  ]

  points.value =
    1

  timeLimit.value =
    30
}

// ==========================================
// REMOVE QUESTION
// ==========================================

function openRemovePopup(
  index: number
) {
  pendingRemoveIndex.value =
    index

  showRemovePopup.value =
    true
}

function closeRemovePopup() {
  showRemovePopup.value =
    false

  pendingRemoveIndex.value =
    -1
}

function confirmRemoveQuestion() {
  if (
    pendingRemoveIndex.value < 0
  ) {
    return
  }

  const removedQuestionNumber =
    pendingRemoveIndex.value + 1

  questions.value.splice(
    pendingRemoveIndex.value,
    1
  )

  closeRemovePopup()

  showNotification(
    'success',
    'Question Removed',
    `Question ${removedQuestionNumber} was removed successfully.`
  )
}

// ==========================================
// OPEN CREATE POPUP
// ==========================================

function openCreatePopup() {
  const assessmentName =
    assessmentType.value ===
      'quiz'
      ? 'Quiz'
      : 'Examination'

  if (
    !examTitle.value.trim()
  ) {
    showNotification(
      'error',
      `${assessmentName} Title Required`,
      `Please enter a ${assessmentName.toLowerCase()} title.`
    )
    return
  }

  if (
    selectedClassIds.value.length ===
    0
  ) {
    showNotification(
      'error',
      'Class Required',
      'Please select at least one class.'
    )
    return
  }

  if (hasMixedSubjects.value) {
    showNotification(
      'error',
      'Different Subjects Selected',
      'All selected classes must belong to the same subject.'
    )
    return
  }

  if (!selectedSubject.value) {
    showNotification(
      'error',
      'Subject Not Found',
      'The selected class does not have a subject assigned.'
    )
    return
  }

  if (
    Number(
      duration.value
    ) < 1
  ) {
    showNotification(
      'error',
      'Invalid Duration',
      'Duration must be at least 1 minute.'
    )
    return
  }

  if (
    Number(
      passing.value
    ) < 1
    ||
    Number(
      passing.value
    ) > 100
  ) {
    showNotification(
      'error',
      'Invalid Passing Score',
      'Passing score must be between 1 and 100.'
    )
    return
  }

  if (
    questions.value.length ===
    0
  ) {
    showNotification(
      'error',
      'No Questions Available',
      'Please add at least one question.'
    )
    return
  }

  if (
    assessmentType.value ===
    'examination'
  ) {
    const hasMissingCompetency =
      questions.value.some(
        item =>
          !item.competency.trim()
      )

    if (hasMissingCompetency) {
      showNotification(
        'error',
        'Competency Required',
        'Every examination question must have a competency because Item Analysis is enabled.'
      )
      return
    }
  }

  showCreatePopup.value =
    true
}

// ==========================================
// STILL EDIT
// ==========================================

function stillEdit() {
  if (
    creatingExam.value
  ) {
    return
  }

  showCreatePopup.value =
    false
}

// ==========================================
// CREATE EXAM
// ==========================================

async function confirmCreateExam() {
  if (
    creatingExam.value
  ) {
    return
  }

  creatingExam.value =
    true

  try {
    const payload = {
      title:
        examTitle.value.trim(),
      description:
        description.value.trim(),
      assessment_type:
        assessmentType.value,
      class_ids:
        selectedClassIds.value,
      duration:
        Number(
          duration.value
        ),
      passing:
        Number(
          passing.value
        ),
      tab_switch_penalty_seconds:
        Math.max(
          0,
          Number(
            tabSwitchPenaltyMinutes.value || 0
          ) * 60
        ),
      fullscreen_exit_penalty_seconds:
        Math.max(
          0,
          Number(
            fullscreenExitPenaltyMinutes.value || 0
          ) * 60
        ),
      copy_attempt_penalty_seconds:
        Math.max(
          0,
          Number(
            copyAttemptPenaltyMinutes.value || 0
          ) * 60
        ),
      paste_attempt_penalty_seconds:
        Math.max(
          0,
          Number(
            pasteAttemptPenaltyMinutes.value || 0
          ) * 60
        ),
      idle_penalty_seconds:
        Math.max(
          0,
          Number(
            idlePenaltyMinutes.value || 0
          ) * 60
        ),
      questions:
        questions.value.map(
          questionItem => ({
            test_bank_question_id:
              questionItem.test_bank_question_id || null,
            type:
              questionItem.type,
            competency:
              questionItem
                .competency
                .trim(),
            question:
              questionItem
                .question
                .trim(),
            options:
              questionItem.type ===
                'Multiple Choice'
                ? questionItem
                    .options
                    .map(
                      option =>
                        option.trim()
                    )
                : [],
            answer:
              questionItem
                .answer
                .trim(),
            points:
              Number(
                questionItem.points
              ),
            time:
              Number(
                questionItem.time
              )
          })
        )
    }

    console.log(
      'TEST BANK ASSESSMENT PAYLOAD:',
      payload
    )

    await api.post(
      '/exams',
      payload
    )

    showCreatePopup.value =
      false

    const typeLabel =
      assessmentType.value ===
        'quiz'
        ? 'Quiz'
        : 'Examination'

    showNotification(
      'success',
      `${typeLabel} Created`,
      `${selectedClassIds.value.length} ${typeLabel.toLowerCase()}${selectedClassIds.value.length === 1 ? '' : 's'} created successfully!`
    )

    await new Promise(
      resolve =>
        setTimeout(
          resolve,
          1200
        )
    )

    if (sourceClassId.value) {
      await router.push({
        path:
          `/faculty/classes/${sourceClassId.value}`,
        query: {
          tab: 'assessments'
        }
      })
    }
    else {
      await router.push(
        '/faculty/dashboard'
      )
    }
  }
  catch (error: any) {
    console.error(
      'MANUAL ASSESSMENT ERROR:',
      error
    )

    console.error(
      'SERVER RESPONSE:',
      error.response?.data
    )

    const validationErrors =
      error.response
        ?.data
        ?.errors

    if (validationErrors) {
      const firstError =
        Object.values(
          validationErrors
        )
          .flat()[0]

      showNotification(
        'error',
        'Validation Error',
        String(
          firstError ||
          'Please check the exam information.'
        )
      )
    }
    else {
      showNotification(
        'error',
        'Creation Failed',
        error.response
          ?.data
          ?.message ||
        'Failed to create assessment.'
      )
    }
  }
  finally {
    creatingExam.value =
      false
  }
}

// ==========================================
// BACK TO SELECTION
// ==========================================

function goBackToSelection() {
  router.push({
    path:
      '/faculty/create-exam',
    query:
      sourceClassId.value
        ? {
            class_id:
              String(
                sourceClassId.value
              )
          }
        : {}
  })
}

// ==========================================
// MOUNT
// ==========================================

onMounted(() => {
  fetchClasses()
})
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family:
    'Poppins',
    sans-serif;
}

/* ==========================================
   PAGE
========================================== */

.manual-page {
  padding: 35px;
  background: #f7f9fc;
  min-height: 100vh;
}

/* ==========================================
   HEADER
========================================== */

.page-header {
  margin-bottom: 30px;
}

.page-header h1 {
  color: #112244;
  font-size: 34px;
  margin-bottom: 8px;
}

.page-header p {
  color: #6b7280;
}

/* ==========================================
   BACK BUTTON
========================================== */

.back-btn {
  background: white;
  border: none;
  padding: 12px 18px;
  border-radius: 10px;
  cursor: pointer;
  margin-bottom: 25px;
  box-shadow:
    0 5px 15px
    rgba(0, 0, 0, .08);
  transition: .3s;
}

.back-btn:hover {
  background: #00c853;
  color: white;
}

/* ==========================================
   TOP GRID
========================================== */

.top-grid {
  display: grid;
  grid-template-columns:
    2fr 1fr;
  gap: 25px;
  margin-bottom: 25px;
}

/* ==========================================
   CARD
========================================== */

.card {
  background: white;
  border-radius: 18px;
  padding: 25px;
  box-shadow:
    0 5px 18px
    rgba(0, 0, 0, .08);
  margin-bottom: 25px;
}

.card h2 {
  color: #112244;
  margin-bottom: 20px;
}

/* ==========================================
   ASSESSMENT TYPE
========================================== */

.assessment-type-options {
  display: grid;
  grid-template-columns:
    1fr 1fr;
  gap: 12px;
}

.assessment-type-card {
  min-height: 90px;
  padding: 14px;
  border:
    1px solid #dbe3dd;
  border-radius: 12px;
  background: white;
  text-align: left;
  cursor: pointer;
  transition: .2s;
}

.assessment-type-card strong {
  display: block;
  margin-bottom: 5px;
  color: #17231c;
  font-size: 14px;
}

.assessment-type-card span {
  color: #64748b;
  font-size: 11px;
  line-height: 1.5;
}

.assessment-type-card:hover {
  border-color: #86efac;
}

.assessment-type-card.active {
  border-color: #16a34a;
  background: #f0fdf4;
}

.assessment-type-card.active strong {
  color: #15803d;
}

.class-warning {
  margin-top: 7px;
  color: #dc2626;
  font-size: 12px;
}

/* ==========================================
   FORM
========================================== */

.form-group {
  margin-bottom: 18px;
}

.form-group label,
.choices-label {
  display: block;
  font-weight: 600;
  margin-bottom: 8px;
  color: #374151;
}

.field-requirement {
  margin-left: 4px;
  color: #94a3b8;
  font-size: 11px;
  font-weight: 500;
}

.form-group input,
.form-group textarea,
.form-group select,
.option input {
  width: 100%;
  padding: 13px 15px;
  border:
    1px solid #d9dce2;
  border-radius: 10px;
  outline: none;
  transition: .25s;
  font-size: 15px;
  background: white;
}

.form-group input:focus,
.form-group textarea:focus,
.form-group select:focus,
.option input:focus {
  border-color: #00c853;
  box-shadow:
    0 0 0 3px
    rgba(0, 200, 83, .08);
}

.form-group textarea {
  resize: vertical;
  min-height: 110px;
}

/* ==========================================
   TWO COLUMN
========================================== */

.two-column {
  display: grid;
  grid-template-columns:
    1fr 1fr;
  gap: 20px;
}

/* ==========================================
   VIOLATION PENALTIES
========================================== */

.violation-settings {
  margin-top: 4px;
  padding: 18px;
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  background: #f8fafc;
}

.violation-settings-header {
  margin-bottom: 16px;
}

.violation-settings-header h3 {
  margin-bottom: 4px;
  color: #112244;
  font-size: 16px;
}

.violation-settings-header p {
  color: #64748b;
  font-size: 12px;
  line-height: 1.5;
}

.violation-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 14px;
}

.violation-grid .form-group {
  margin-bottom: 0;
}

.penalty-input {
  display: flex;
  align-items: center;
  gap: 10px;
}

.penalty-input input {
  flex: 1;
  min-width: 0;
}

.penalty-input span {
  white-space: nowrap;
  color: #64748b;
  font-size: 11px;
  font-weight: 600;
}

/* ==========================================
   SUMMARY
========================================== */

.assessment-summary-info {
  margin-bottom: 20px;
  padding: 12px;
  border-radius: 10px;
  background: #f8fafc;
}

.assessment-summary-info > div {
  display: flex;
  justify-content:
    space-between;
  gap: 10px;
  padding: 7px 0;
  border-bottom:
    1px solid #e5e7eb;
}

.assessment-summary-info > div:last-child {
  border-bottom: none;
}

.assessment-summary-info span {
  color: #64748b;
  font-size: 11px;
}

.assessment-summary-info strong {
  color: #17231c;
  font-size: 11px;
  text-align: right;
}

.summary-box {
  display: flex;
  flex-direction: column;
  gap: 25px;
  margin-bottom: 25px;
}

.summary-box span {
  color: #6b7280;
  font-size: 14px;
}

.summary-box h1 {
  color: #00c853;
  font-size: 38px;
}

/* ==========================================
   BUTTONS
========================================== */

.create-btn,
.add-btn {
  width: 100%;
  height: 50px;
  border: none;
  background: #00c853;
  color: white;
  border-radius: 10px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 600;
  transition: .3s;
}

.create-btn:hover:not(:disabled),
.add-btn:hover:not(:disabled) {
  background: #00b34a;
}

.create-btn:disabled,
.add-btn:disabled {
  opacity: .6;
  cursor: not-allowed;
}

/* ==========================================
   OPTIONS
========================================== */

.option {
  margin-bottom: 12px;
}

/* ==========================================
   QUESTIONS HEADER
========================================== */

.questions-header {
  display: flex;
  justify-content:
    space-between;
  align-items: center;
  margin-bottom: 20px;
}

.questions-header h2 {
  margin-bottom: 5px;
}

.questions-header p {
  color: #6b7280;
  font-size: 13px;
}

/* ==========================================
   QUESTION ITEM
========================================== */

.question-item {
  padding: 18px;
  border:
    1px solid #ececec;
  border-radius: 12px;
  margin-bottom: 15px;
  transition: .25s;
}

.question-item:hover {
  border-color: #00c853;
  transform:
    translateY(-2px);
}

.question-top {
  display: flex;
  justify-content:
    space-between;
  align-items: center;
  gap: 15px;
  margin-bottom: 10px;
}

.question-item h3 {
  color: #112244;
}

.question-text {
  color: #444;
  line-height: 1.6;
  margin-bottom: 8px;
}

.competency-text {
  color: #4b5563;
  margin-bottom: 10px;
  font-size: 13px;
}

.competency-text strong {
  color: #166534;
}

/* ==========================================
   QUESTION META
========================================== */

.question-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
}

.question-meta span {
  padding: 5px 9px;
  background: #f3f4f6;
  border-radius: 20px;
  color: #4b5563;
  font-size: 11px;
  font-weight: 600;
}

/* ==========================================
   PREVIEW OPTIONS
========================================== */

.preview-options {
  display: grid;
  grid-template-columns:
    repeat(2, 1fr);
  gap: 7px;
  margin:
    12px 0;
}

.preview-option {
  padding:
    8px 10px;
  background: #f9fafb;
  border:
    1px solid #e5e7eb;
  border-radius: 7px;
  color: #4b5563;
  font-size: 12px;
}

.preview-option span {
  font-weight: 700;
  color: #15803d;
}

/* ==========================================
   REMOVE BUTTON
========================================== */

.remove-btn {
  border: none;
  padding:
    6px 10px;
  border-radius: 7px;
  background: #fee2e2;
  color: #dc2626;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
}

.remove-btn:hover {
  background: #fecaca;
}

/* ==========================================
   EMPTY
========================================== */

.empty {
  text-align: center;
  color: #888;
  padding: 35px;
}

/* ==========================================
   POPUP
========================================== */

.popup-overlay {
  position: fixed;
  inset: 0;
  background:
    rgba(0, 0, 0, .55);
  backdrop-filter:
    blur(5px);
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  z-index: 9999;
}

.popup-card {
  width: 450px;
  max-width: 95%;
  background: white;
  border-radius: 20px;
  padding: 35px;
  text-align: center;
  box-shadow:
    0 20px 45px
    rgba(0, 0, 0, .2);
}

.popup-icon {
  width: 75px;
  height: 75px;
  margin:
    0 auto 20px;
  border-radius: 50%;
  background: #00c853;
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;
}

.popup-card h2 {
  color: #112244;
  margin-bottom: 15px;
}

.popup-card > p {
  color: #666;
  line-height: 1.7;
}

/* ==========================================
   REMOVE POPUP
========================================== */

.remove-popup-icon {
  width: 70px;
  height: 70px;
  margin:
    0 auto 20px;
  border-radius: 50%;
  background: #fee2e2;
  color: #dc2626;
  display: flex;
  align-items: center;
  justify-content: center;
}

.delete-confirm-btn {
  flex: 1;
  border: none;
  padding: 14px;
  border-radius: 10px;
  background: #dc2626;
  color: white;
  cursor: pointer;
  font-weight: 600;
}

.delete-confirm-btn:hover {
  background: #b91c1c;
}

/* ==========================================
   POPUP SUMMARY
========================================== */

.popup-summary {
  margin-top: 20px;
  padding: 15px;
  background: #f9fafb;
  border-radius: 10px;
  text-align: left;
}

.popup-summary div {
  display: flex;
  justify-content:
    space-between;
  gap: 15px;
  padding:
    7px 0;
  border-bottom:
    1px solid #e5e7eb;
}

.popup-summary div:last-child {
  border-bottom: none;
}

.popup-summary span {
  color: #6b7280;
  font-size: 12px;
}

.popup-summary strong {
  color: #111827;
  font-size: 12px;
  text-align: right;
}

/* ==========================================
   POPUP BUTTONS
========================================== */

.popup-buttons {
  display: flex;
  gap: 15px;
  margin-top: 30px;
}

.cancel-btn,
.confirm-btn {
  flex: 1;
  border: none;
  padding: 14px;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 600;
}

.cancel-btn {
  background: #e5e7eb;
  color: #374151;
}

.confirm-btn {
  background: #16a34a;
  color: white;
}

.cancel-btn:disabled,
.confirm-btn:disabled {
  opacity: .6;
  cursor: not-allowed;
}

/* ==========================================
   CLASS SELECTION
========================================== */

.class-selection-box {
  display: grid;
  grid-template-columns:
    1fr 1fr;
  gap: 10px;
  max-height: 250px;
  overflow-y: auto;
  padding: 12px;
  border:
    1px solid #d9dce2;
  border-radius: 12px;
  background: #f8fafc;
}

.class-checkbox-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border:
    1px solid #e5e7eb;
  border-radius: 10px;
  background: white;
  cursor: pointer;
  transition: .2s;
}

.class-checkbox-item:hover {
  border-color: #00c853;
}

.class-checkbox-item.selected {
  border-color: #00c853;
  background: #f0fdf4;
}

.class-checkbox-item input {
  width: 18px;
  height: 18px;
  flex-shrink: 0;
  accent-color: #00c853;
}

.class-checkbox-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.class-checkbox-info strong {
  color: #112244;
  font-size: 14px;
}

.class-checkbox-info span {
  color: #64748b;
  font-size: 12px;
}

.class-checkbox-info small {
  color: #94a3b8;
  font-size: 10px;
}

.locked-class-note {
  margin-top: 8px;
  color: #64748b;
  font-size: 11px;
  line-height: 1.5;
}

.class-checkbox-item:has(
  input:disabled
) {
  cursor: default;
}

.class-checkbox-item input:disabled {
  cursor: not-allowed;
  opacity: 1;
}

.selected-subject {
  margin-bottom: 18px;
  padding: 13px 15px;
  border:
    1px solid #dcfce7;
  border-radius: 10px;
  background: #f0fdf4;
}

.selected-subject > div {
  display: flex;
  justify-content:
    space-between;
  gap: 15px;
}

.selected-subject span {
  color: #64748b;
  font-size: 12px;
}

.selected-subject strong {
  color: #166534;
  font-size: 13px;
}

.selected-subject small {
  display: block;
  margin-top: 5px;
  color: #64748b;
  font-size: 10px;
}

.selected-class-count {
  margin-top: 8px;
  color: #16a34a;
  font-size: 12px;
  font-weight: 600;
}

.class-loading {
  padding: 14px;
  color: #64748b;
  border:
    1px solid #e5e7eb;
  border-radius: 10px;
  background: #f8fafc;
}

.back-btn,
.create-btn,
.add-btn,
.remove-btn,
.confirm-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

/* ==========================================
   SYSTEM NOTIFICATION
========================================== */

.notification-container {
  position: fixed;
  top: 25px;
  right: 25px;
  z-index: 10000;
  width: 390px;
  max-width:
    calc(100vw - 40px);
  padding:
    16px 45px
    16px 16px;
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
  font-size: 20px;
  font-weight: 700;
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
  font-size: 22px;
  line-height: 1;
}

.notification-close:hover {
  color: #334155;
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

/* ==========================================
   SPINNER
========================================== */

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

/* ==========================================
   RESPONSIVE
========================================== */

@media(max-width: 900px) {
  .top-grid {
    grid-template-columns:
      1fr;
  }

  .two-column {
    grid-template-columns:
      1fr;
  }

  .manual-page {
    padding: 20px;
  }

  .page-header h1 {
    font-size: 28px;
  }

  .popup-buttons {
    flex-direction:
      column;
  }

  .preview-options {
    grid-template-columns:
      1fr;
  }
}

@media(max-width: 600px) {
  .assessment-type-options {
    grid-template-columns:
      1fr;
  }

  .class-selection-box {
    grid-template-columns:
      1fr;
  }

  .manual-page {
    padding: 15px;
  }

  .card {
    padding: 18px;
  }

  .page-header h1 {
    font-size: 24px;
  }

  .popup-card {
    padding:
      25px 20px;
  }

  .notification-container {
    top: 15px;
    right: 15px;
    left: 15px;
    width: auto;
    max-width: none;
  }
}

@media (max-width: 700px) {
  .violation-grid {
    grid-template-columns: 1fr;
  }

  .penalty-input {
    align-items: stretch;
    flex-direction: column;
    gap: 6px;
  }

  .penalty-input span {
    white-space: normal;
  }
}


.question-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.test-bank-btn,
.test-bank-all-btn {
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
}

.test-bank-btn {
  padding: 6px 10px;
  background: #ecfdf5;
  color: #047857;
  border: 1px solid #a7f3d0;
  font-size: 11px;
}

.test-bank-btn:hover:not(:disabled) { background: #d1fae5; }
.test-bank-btn.saved { background: #f0fdf4; color: #15803d; }
.test-bank-btn:disabled,
.test-bank-all-btn:disabled { cursor: not-allowed; opacity: .65; }

.test-bank-all-btn {
  width: 100%;
  margin-bottom: 10px;
  padding: 12px 16px;
  background: white;
  color: #047857;
  border: 1px solid #10b981;
}

.test-bank-all-btn:hover:not(:disabled) { background: #ecfdf5; }


/* TEST BANK SELECTOR - follows Manual Assessment styling */
.add-question-card{padding:24px 25px}.add-question-card .questions-header{margin-bottom:0}.add-question-actions{display:flex;align-items:center;gap:10px;flex-wrap:wrap}.action-btn{width:auto;min-width:155px;padding:0 18px;display:flex;align-items:center;justify-content:center;gap:8px}.question-modal-card{width:min(650px,94vw);max-height:90vh;overflow:auto;background:#fff;border-radius:18px;padding:25px;box-shadow:0 20px 50px rgba(0,0,0,.2)}.question-modal-header{display:flex;align-items:flex-start;justify-content:space-between;gap:15px;margin-bottom:22px}.question-modal-header h2{margin:0;color:#112244}.question-modal-header p{margin:5px 0 0;color:#6b7280;font-size:13px}.question-modal-footer{display:flex;justify-content:flex-end;gap:10px;padding-top:18px;border-top:1px solid #e5e7eb}.question-modal-footer .confirm-btn{display:flex;align-items:center;gap:7px}@media(max-width:650px){.add-question-card .questions-header{align-items:stretch}.add-question-actions{width:100%;flex-direction:column}.action-btn{width:100%}.question-modal-card{padding:18px}.question-modal-footer{flex-direction:column-reverse}.question-modal-footer button{width:100%}}
.bank-select-btn{width:auto;margin:0}.test-bank-modal{width:min(820px,94vw);max-height:88vh;overflow:hidden;background:#fff;border-radius:18px;padding:24px;box-shadow:0 20px 50px rgba(0,0,0,.2);display:flex;flex-direction:column}.test-bank-modal-header{display:flex;align-items:flex-start;justify-content:space-between;gap:15px;margin-bottom:18px}.test-bank-modal-header h2{margin:0;color:#112244}.test-bank-modal-header p{margin:5px 0 0;color:#6b7280;font-size:13px}.icon-btn{border:0;background:#f1f5f9;width:38px;height:38px;border-radius:9px;display:grid;place-items:center;cursor:pointer}.test-bank-filters{display:grid;grid-template-columns:1fr 200px;gap:12px;margin-bottom:15px}.test-bank-search{position:relative}.test-bank-search svg{position:absolute;left:13px;top:50%;transform:translateY(-50%);color:#94a3b8}.test-bank-search input,.test-bank-filters select{width:100%;height:44px;border:1px solid #d9dce2;border-radius:10px;background:#fff;outline:0}.test-bank-search input{padding:0 14px 0 40px}.test-bank-filters select{padding:0 12px}.test-bank-search input:focus,.test-bank-filters select:focus{border-color:#00c853;box-shadow:0 0 0 3px rgba(0,200,83,.08)}.test-bank-list{display:grid;gap:9px;overflow:auto;max-height:430px;padding-right:4px}.test-bank-question{display:flex;gap:12px;padding:14px;border:1px solid #e5e7eb;border-radius:12px;cursor:pointer;transition:.2s}.test-bank-question:hover,.test-bank-question.selected{border-color:#86efac;background:#f0fdf4}.test-bank-question>input{margin-top:3px;accent-color:#00c853}.test-bank-question-content{display:flex;flex-direction:column;gap:5px;min-width:0}.test-bank-question-content strong{font-size:13px;color:#1f2937}.test-bank-question-content small{color:#64748b}.test-bank-question-tags{display:flex;gap:6px}.test-bank-question-tags span{font-size:10px;font-weight:700;color:#15803d;background:#dcfce7;border-radius:20px;padding:4px 8px}.bank-state{min-height:210px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:9px;color:#94a3b8}.test-bank-modal-footer{display:flex;align-items:center;justify-content:space-between;gap:12px;padding-top:16px;margin-top:16px;border-top:1px solid #e5e7eb}.test-bank-modal-footer>span{font-size:13px;color:#64748b}.test-bank-modal-footer>div{display:flex;gap:9px}.test-bank-modal-footer .confirm-btn{display:flex;align-items:center;gap:7px}.test-bank-modal-footer .confirm-btn:disabled{opacity:.55;cursor:not-allowed}@media(max-width:650px){.test-bank-filters{grid-template-columns:1fr}.test-bank-modal{padding:18px}.test-bank-modal-footer{align-items:stretch;flex-direction:column}.test-bank-modal-footer>div{width:100%}.test-bank-modal-footer button{flex:1}}
</style>
