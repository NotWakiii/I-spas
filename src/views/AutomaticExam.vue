<template>
  <div class="automatic-page">
    <button
      class="back-btn"
      @click="goBackToSelection"
    >
      ← Back to Selection
    </button>

    <div class="page-header">
      <h1>
        Automatic
        {{
          assessmentType === 'quiz'
            ? 'Quiz'
            : 'Examination'
        }}
        Generation
      </h1>

      <p>
        Generate draft questions by pasting
        questions with answers.
      </p>
    </div>

    <!-- ==========================================
         ASSESSMENT DETAILS + SUMMARY
    =========================================== -->
    <div class="top-grid">
      <div class="card">
        <h2>Assessment Details</h2>

        <!-- TYPE -->
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
              @click="
                assessmentType = 'quiz'
              "
            >
              <strong>Quiz</strong>

              <span>
                Short assessment without
                Item Analysis.
              </span>
            </button>

            <button
              type="button"
              class="assessment-type-card"
              :class="{
                active:
                  assessmentType ===
                  'examination'
              }"
              @click="
                assessmentType =
                  'examination'
              "
            >
              <strong>Examination</strong>

              <span>
                Formal assessment with
                competency-based Item Analysis.
              </span>
            </button>
          </div>
        </div>

        <!-- TITLE -->
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
                ? 'e.g. Quiz 1'
                : 'e.g. Midterm Examination'
            "
          >
        </div>

        <!-- DESCRIPTION -->
        <div class="form-group">
          <label>Description</label>

          <textarea
            v-model="description"
            placeholder="Brief description of the assessment"
          ></textarea>
        </div>

        <!-- CLASSES -->
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
                    schoolClass
                      .section_data
                      ?.section ||
                    schoolClass.section ||
                    'No Section'
                  }}
                </span>

                <small>
                  {{
                    schoolClass
                      .school_year
                      ?.year ||
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
            No classes found. Create a class
            in Class Management first.
          </p>

          <template
            v-if="
              selectedClassIds.length > 0
            "
          >
            <p class="selected-class-count">
              {{
                selectedClassIds.length
              }}
              class(es) selected
            </p>

            <p
              v-if="hasMixedSubjects"
              class="class-warning"
            >
              Selected classes must have the
              same subject.
            </p>

            <p
              v-if="isClassLocked"
              class="locked-class-note"
            >
              This assessment will be created
              for the class selected from
              Class Management.
            </p>
          </template>
        </div>

        <!-- AUTO SUBJECT -->
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
            Automatically based on the
            selected class.
          </small>
        </div>

        <!-- DURATION / PASSING -->
        <div class="two-column">
          <div class="form-group">
            <label>
              Duration (minutes)
            </label>
            <input
              v-model.number="duration"
              type="number"
              min="1"
            >
          </div>

          <div class="form-group">
            <label>
              Passing Score (%)
            </label>
            <input
              v-model.number="passing"
              type="number"
              min="1"
              max="100"
            >
          </div>
        </div>

        <!-- VIOLATION TIME PENALTIES -->
        <div class="penalty-section">
          <div class="penalty-heading">
            <div>
              <h3>Violation Time Penalties</h3>
              <p>
                Optional. Enter how many minutes will be deducted
                for each violation. Leave blank or enter 0 for no deduction.
              </p>
            </div>
          </div>

          <div class="penalty-grid">
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

      <!-- SUMMARY -->
      <div class="card summary">
        <h2>Draft Summary</h2>

        <div class="assessment-summary-info">
          <div>
            <span>Type</span>

            <strong>
              {{
                assessmentType ===
                'quiz'
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
                assessmentType ===
                'examination'
                  ? 'Available'
                  : 'Not Available'
              }}
            </strong>
          </div>
        </div>

        <div class="summary-box">
          <div>
            <span>
              Questions Generated
            </span>

            <h1>
              {{ questions.length }}
            </h1>
          </div>

          <div>
            <span>Total Points</span>

            <h1>
              {{ totalPoints }}
            </h1>
          </div>

          <div>
            <span>
              Detected Answers
            </span>

            <h1>
              {{ detectedAnswers }}
            </h1>
          </div>

          <div>
            <span>
              Missing Answers
            </span>

            <h1 class="warning-text">
              {{ missingAnswers }}
            </h1>
          </div>
        </div>

        <button
          v-if="questions.length > 0"
          class="test-bank-all-btn"
          :disabled="addingAllToTestBank || hasMixedSubjects || !selectedSubjectId"
          @click="addAllQuestionsToTestBank"
        >
          {{ addingAllToTestBank ? 'Adding to Test Bank...' : 'Add All Questions to Test Bank' }}
        </button>

        <button
          class="create-btn"
          :disabled="creatingExam"
          @click="openCreatePopup"
        >
          {{
            creatingExam
              ? 'Creating...'
              : assessmentType ===
                  'quiz'
                ? 'Create Quiz'
                : 'Create Examination'
          }}
        </button>
      </div>
    </div>

    <!-- ==========================================
         GENERATION METHOD
    =========================================== -->
    <div class="card method-card">
      <div class="method-header">
        <h2>Generation Method</h2>

        <button
          class="how-to-btn"
          type="button"
          @click="
            showHowToPopup = true
          "
        >
          How to Use
        </button>
      </div>

      <div class="tabs">
        <button class="active">
          Paste Questions
        </button>
      </div>

      <div class="method-content">
        <div class="format-box">
          <strong>
            Accepted Format:
          </strong>

          <p>
            Multiple Choice questions can be
            pasted directly with A-D choices
            and an Answer key. You may also
            add section labels such as
            <b>True or False</b>
            and
            <b>Identification</b>.
          </p>

          <p
            v-if="
              assessmentType ===
              'examination'
            "
          >
            <b>Competency is required for
            examination questions.</b>
            Add it before or after each
            question using:
            <b>
              Competency: Your competency
              here
            </b>.
          </p>

          <p v-else>
            Competency is optional for
            quizzes because quizzes do not
            include Item Analysis.
          </p>
        </div>

        <textarea
          v-model="rawText"
          class="paste-area"
          placeholder="Paste questions with answers here..."
        ></textarea>

        <button
          class="generate-btn"
          @click="generateFromText"
        >
          Generate Draft Questions
        </button>
      </div>
    </div>

    <!-- HOW TO USE -->
    <div
      v-if="showHowToPopup"
      class="popup-overlay"
      @click.self="
        showHowToPopup = false
      "
    >
      <div class="how-to-popup-card">
        <button
          class="how-to-close-btn"
          type="button"
          @click="
            showHowToPopup = false
          "
        >
          ×
        </button>

        <h2>
          How to Format Questions
        </h2>

        <p class="how-to-description">
          For better question detection,
          follow this format when pasting
          your questions.
        </p>

        <div class="format-example">
          <pre>1. Who founded the Katipunan?

A. José Rizal
B. Andrés Bonifacio
C. Emilio Aguinaldo
D. Apolinario Mabini

Answer: B
Competency: Identifies significant historical figures and explains their contributions to Philippine history.

2. In what year was Philippine independence proclaimed?

A. 1896
B. 1897
C. 1898
D. 1899

Answer: C
Competency: Identifies significant events and dates in Philippine history.</pre>
        </div>

        <div class="format-tips">
          <p>
            <strong>Tips:</strong>
          </p>

          <p>
            • Start every question with a
            number such as
            <strong>1.</strong>,
            <strong>2.</strong>,
            <strong>3.</strong>
          </p>

          <p>
            • Use
            <strong>A</strong>,
            <strong>B</strong>,
            <strong>C</strong>,
            and
            <strong>D</strong>
            for Multiple Choice options.
          </p>

          <p>
            • Write the correct answer using
            <strong>Answer: B</strong>.
          </p>

          <p>
            • For examinations, write
            <strong>
              Competency: ...
            </strong>
            for every question.
          </p>

          <p>
            • For quizzes, competency is
            optional.
          </p>

          <p>
            • Put the competency after the
            answer for clearer question
            grouping.
          </p>
        </div>
      </div>
    </div>

    <!-- ==========================================
         GENERATED QUESTIONS
    =========================================== -->
    <div class="card">
      <div class="question-header">
        <div>
          <h2>
            Generated Draft Questions
          </h2>

          <p
            v-if="questions.length > 0"
            class="question-summary-text"
          >
            {{ questions.length }}
            question(s) •
            {{ totalPoints }}
            total point(s)
          </p>
        </div>

        <button
          class="add-question-btn"
          @click="addBlankQuestion"
        >
          + Add Question
        </button>
      </div>

      <div
        v-if="questions.length === 0"
        class="empty"
      >
        No generated questions yet.
      </div>

      <div
        v-for="(
          questionItem,
          index
        ) in questions"
        :key="questionItem.id"
        class="question-card"
      >
        <div class="question-card-header">
          <h3>
            Question {{ index + 1 }}
          </h3>

          <div class="question-actions">
            <button
              class="test-bank-btn"
              :class="{ saved: isQuestionInTestBank(questionItem) }"
              :disabled="isQuestionInTestBank(questionItem) || isQuestionAdding(questionItem)"
              @click="addQuestionToTestBank(questionItem)"
            >
              {{ isQuestionInTestBank(questionItem) ? '✓ In Test Bank' : isQuestionAdding(questionItem) ? 'Adding...' : 'Add to Test Bank' }}
            </button>

            <button
              class="delete-btn"
              @click="deleteQuestion(index)"
            >
              Delete
            </button>
          </div>
        </div>

        <!-- COMPETENCY -->
        <div class="form-group">
          <label>
            Competency

            <span
              class="field-requirement"
            >
              {{
                assessmentType ===
                'examination'
                  ? '(Required)'
                  : '(Optional)'
              }}
            </span>
          </label>

          <input
            v-model="
              questionItem.competency
            "
            type="text"
            :placeholder="
              assessmentType ===
              'examination'
                ? 'Enter learning competency'
                : 'Optional for quizzes'
            "
          >
        </div>

        <!-- QUESTION TYPE -->
        <div class="form-group">
          <label>
            Question Type
          </label>

          <select
            v-model="questionItem.type"
            @change="
              normalizeQuestion(
                questionItem
              )
            "
          >
            <option>
              Multiple Choice
            </option>

            <option>
              True or False
            </option>

            <option>
              Identification
            </option>
          </select>
        </div>

        <!-- QUESTION -->
        <div class="form-group">
          <label>Question</label>

          <textarea
            v-model="
              questionItem.question
            "
            placeholder="Enter question"
          ></textarea>
        </div>

        <!-- MCQ -->
        <div
          v-if="
            questionItem.type ===
            'Multiple Choice'
          "
          class="two-column"
        >
          <div class="form-group">
            <label>Option A</label>

            <input
              v-model="
                questionItem.options[0]
              "
              placeholder="Option A"
            >
          </div>

          <div class="form-group">
            <label>Option B</label>

            <input
              v-model="
                questionItem.options[1]
              "
              placeholder="Option B"
            >
          </div>

          <div class="form-group">
            <label>Option C</label>

            <input
              v-model="
                questionItem.options[2]
              "
              placeholder="Option C"
            >
          </div>

          <div class="form-group">
            <label>Option D</label>

            <input
              v-model="
                questionItem.options[3]
              "
              placeholder="Option D"
            >
          </div>
        </div>

        <!-- ANSWER / POINTS / TIME -->
        <div class="three-column">
          <div class="form-group">
            <label>
              Correct Answer
            </label>

            <select
              v-if="
                questionItem.type ===
                'Multiple Choice'
              "
              v-model="
                questionItem.answer
              "
            >
              <option value="">
                Select answer
              </option>

              <option>A</option>
              <option>B</option>
              <option>C</option>
              <option>D</option>
            </select>

            <select
              v-else-if="
                questionItem.type ===
                'True or False'
              "
              v-model="
                questionItem.answer
              "
            >
              <option value="">
                Select answer
              </option>

              <option>True</option>
              <option>False</option>
            </select>

            <input
              v-else
              v-model="
                questionItem.answer
              "
              type="text"
              placeholder="Enter correct answer"
            >
          </div>

          <div class="form-group">
            <label>Points</label>

            <input
              v-model.number="
                questionItem.points
              "
              type="number"
              min="1"
            >
          </div>

          <div class="form-group">
            <label>
              Time Limit (sec)
            </label>

            <input
              v-model.number="
                questionItem.time
              "
              type="number"
              min="1"
            >
          </div>
        </div>

        <div
          v-if="
            !String(
              questionItem.answer
            ).trim()
          "
          class="warning-box"
        >
          ⚠ No answer detected for this
          question.
        </div>

        <div
          v-if="
            assessmentType ===
              'examination' &&
            !questionItem
              .competency
              .trim()
          "
          class="competency-warning"
        >
          ⚠ Competency is required because
          Item Analysis is enabled for
          examinations.
        </div>
      </div>
    </div>

    <!-- ==========================================
         CREATE POPUP
    =========================================== -->
    <div
      v-if="showCreatePopup"
      class="popup-overlay"
      @click.self="stillEdit"
    >
      <div class="popup-card">
        <div class="popup-icon">
          ✓
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
          This assessment will be saved
          as a draft. You can still edit
          it before publishing.
        </p>

        <div class="confirmation-summary">
          <div>
            <span>Type</span>

            <strong>
              {{
                assessmentType ===
                'quiz'
                  ? 'Quiz'
                  : 'Examination'
              }}
            </strong>
          </div>

          <div>
            <span>Classes</span>

            <strong>
              {{ selectedClassLabel }}
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
            <span>Questions</span>

            <strong>
              {{ questions.length }}
            </strong>
          </div>

          <div>
            <span>Total Points</span>

            <strong>
              {{ totalPoints }}
            </strong>
          </div>

          <div>
            <span>Item Analysis</span>

            <strong>
              {{
                assessmentType ===
                'examination'
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
            @click="
              confirmCreateExam
            "
          >
            {{
              creatingExam
                ? 'Creating...'
                : assessmentType ===
                    'quiz'
                  ? 'Create Quiz'
                  : 'Create Examination'
            }}
          </button>
        </div>
      </div>
    </div>

    <!-- NOTIFICATION -->
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

const route =
  useRoute()

const router =
  useRouter()

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
}

interface ExamQuestion {
  id: number
  type: string
  competency: string
  question: string
  options: string[]
  answer: string
  points: number
  time: number
}

// ==========================================
// ASSESSMENT DETAILS
// ==========================================

const assessmentType =
  ref<
    'quiz' |
    'examination'
  >('examination')

const passing =
  ref(50)

const creatingExam =
  ref(false)

const examTitle =
  ref('')

const description =
  ref('')

const duration =
  ref(60)

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

function minutesToSeconds(
  value: number | null
) {
  const minutes =
    Number(value || 0)

  if (minutes <= 0) {
    return null
  }

  return Math.round(
    minutes * 60
  )
}

// ==========================================
// CLASSES
// ==========================================

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
        selectedClassIds.value
          .includes(
            schoolClass.id
          )
    )
  })

const selectedSubjectIds =
  computed(() => {
    return [
      ...new Set(
        selectedClasses.value
          .map(
            schoolClass =>
              schoolClass.subject_id
          )
      )
    ]
  })

const selectedSubjectId =
  computed<number | null>(() => {
    if (selectedSubjectIds.value.length !== 1) {
      return null
    }

    return selectedSubjectIds.value[0] ?? null
  })

const hasMixedSubjects =
  computed(() => {
    return (
      selectedSubjectIds.value
        .length > 1
    )
  })

const selectedSubject =
  computed(() => {
    if (
      selectedClasses.value
        .length === 0
    ) {
      return ''
    }

    return (
      selectedClasses.value[0]
        ?.subject?.name ||
      ''
    )
  })

const selectedClassLabel =
  computed(() => {
    if (
      selectedClasses.value
        .length === 0
    ) {
      return 'Not selected'
    }

    return selectedClasses.value
      .map(
        schoolClass => {
          const subject =
            schoolClass.subject
              ?.name ||
            'No Subject'

          const grade =
            schoolClass.grade

          const strand =
            schoolClass.strand
              ?.name ||
            ''

          const section =
            schoolClass
              .section_data
              ?.section ||
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
// GENERATION
// ==========================================

const rawText =
  ref('')

const showCreatePopup =
  ref(false)

const showHowToPopup =
  ref(false)

type NotificationType =
  'success' |
  'error' |
  'info'

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

const questions =
  ref<ExamQuestion[]>([])

const testBankSavedIds = ref<Set<number>>(new Set())
const testBankAddingIds = ref<Set<number>>(new Set())
const addingAllToTestBank = ref(false)

function questionTypeForApi(type: string) {
  if (type === 'Multiple Choice') return 'multiple_choice'
  if (type === 'True or False') return 'true_false'
  return 'identification'
}

function buildTestBankOptions(question: ExamQuestion) {
  if (question.type === 'Multiple Choice') {
    return question.options.map((option, index) => ({
      option_text: String(option || '').trim(),
      is_correct: question.answer === String.fromCharCode(65 + index)
    }))
  }

  if (question.type === 'True or False') {
    return ['True', 'False'].map(option => ({
      option_text: option,
      is_correct: question.answer === option
    }))
  }

  return []
}

function buildTestBankQuestion(question: ExamQuestion) {
  return {
    question: question.question.trim(),
    question_type: questionTypeForApi(question.type),
    competency: question.competency.trim() || null,
    answer: String(question.answer || '').trim() || null,
    points: Number(question.points || 1),
    options: buildTestBankOptions(question)
  }
}

function isQuestionInTestBank(question: ExamQuestion) {
  return testBankSavedIds.value.has(question.id)
}

function isQuestionAdding(question: ExamQuestion) {
  return testBankAddingIds.value.has(question.id)
}

function validateTestBankQuestion(question: ExamQuestion): string | null {
  if (!selectedSubjectId.value) return 'Please select a class with a subject first.'
  if (!question.question.trim()) return 'Please enter the question text first.'
  if (!String(question.answer || '').trim()) return 'Please provide the correct answer first.'

  if (question.type === 'Multiple Choice') {
    if (question.options.length !== 4 || question.options.some(option => !String(option || '').trim())) {
      return 'Please complete all four Multiple Choice options first.'
    }
    if (!['A', 'B', 'C', 'D'].includes(question.answer)) {
      return 'Please select the correct Multiple Choice answer first.'
    }
  }

  return null
}

async function addQuestionToTestBank(question: ExamQuestion) {
  if (isQuestionInTestBank(question) || isQuestionAdding(question)) return

  const errorMessage = validateTestBankQuestion(question)
  if (errorMessage) {
    showNotification('error', 'Cannot Add to Test Bank', errorMessage)
    return
  }

  testBankAddingIds.value = new Set([...testBankAddingIds.value, question.id])

  try {
    const response = await api.post('/faculty/test-bank', {
      subject_id: selectedSubjectId.value,
      ...buildTestBankQuestion(question)
    })

    testBankSavedIds.value = new Set([...testBankSavedIds.value, question.id])
    showNotification(
      'success',
      response.data?.already_exists ? 'Already in Test Bank' : 'Added to Test Bank',
      response.data?.message || 'Question added to Test Bank successfully.'
    )
  } catch (error: any) {
    showNotification(
      'error',
      'Test Bank Error',
      error.response?.data?.message || 'Failed to add the question to Test Bank.'
    )
  } finally {
    const next = new Set(testBankAddingIds.value)
    next.delete(question.id)
    testBankAddingIds.value = next
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
    showNotification('error', 'No Questions Available', 'Please generate or add at least one question first.')
    return
  }

  const invalidQuestion = questions.value.find(question => validateTestBankQuestion(question))
  if (invalidQuestion) {
    const questionNumber = questions.value.indexOf(invalidQuestion) + 1
    showNotification(
      'error',
      'Incomplete Question',
      `Question ${questionNumber}: ${validateTestBankQuestion(invalidQuestion)}`
    )
    return
  }

  addingAllToTestBank.value = true

  try {
    const response = await api.post('/faculty/test-bank/bulk', {
      subject_id: selectedSubjectId.value,
      questions: questions.value.map(buildTestBankQuestion)
    })

    testBankSavedIds.value = new Set(questions.value.map(question => question.id))
    showNotification(
      'success',
      'Test Bank Updated',
      response.data?.message || `${questions.value.length} question(s) added to Test Bank.`
    )
  } catch (error: any) {
    showNotification(
      'error',
      'Test Bank Error',
      error.response?.data?.message || 'Failed to add questions to Test Bank.'
    )
  } finally {
    addingAllToTestBank.value = false
  }
}

// ==========================================
// SUMMARY
// ==========================================

const detectedAnswers =
  computed(() => {
    return questions.value.filter(
      question =>
        question.answer &&
        String(
          question.answer
        ).trim() !== ''
    ).length
  })

const missingAnswers =
  computed(() => {
    return questions.value.filter(
      question =>
        !question.answer ||
        String(
          question.answer
        ).trim() === ''
    ).length
  })

const totalPoints =
  computed(() => {
    return questions.value.reduce(
      (sum, item) =>
        sum +
        Number(
          item.points || 0
        ),
      0
    )
  })

// ==========================================
// FETCH CLASSES
// ==========================================

async function fetchClasses() {
  loadingClasses.value = true

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
      error.response?.data ||
      error
    )

    classes.value = []

    showNotification(
      'error',
      'Unable to Load Classes',
      'Failed to load your classes.'
    )
  }
  finally {
    loadingClasses.value =
      false
  }
}

// ==========================================
// GENERATE FROM TEXT
// ==========================================

function generateFromText() {
  if (!rawText.value.trim()) {
    showNotification(
      'error',
      'Questions Required',
      'Please paste questions first.'
    )

    return
  }

  const parsed =
    parseQuestions(
      rawText.value
    )

  if (parsed.length === 0) {
    showNotification(
      'error',
      'No Questions Detected',
      'No valid questions were detected. Please check the question format and try again.'
    )

    return
  }

  questions.value =
    parsed

  testBankSavedIds.value = new Set()
  testBankAddingIds.value = new Set()

  showNotification(
    'success',
    'Questions Generated',
    `${parsed.length} question${parsed.length === 1 ? '' : 's'} generated successfully.`
  )
}

// ==========================================
// PARSER
// ==========================================

function parseQuestions(
  text: string
): ExamQuestion[] {
  interface ParsedQuestion {
    type: string
    competency: string
    questionLines: string[]
    options: string[]
    answer: string
  }

  const lines = text
    .replace(/\r/g, '')
    .split('\n')
    .map(line =>
      line.trim()
    )
    .filter(Boolean)

  const parsedQuestions:
    ExamQuestion[] =
      []

  let currentType =
    'Multiple Choice'

  let pendingCompetency =
    ''

  let currentQuestion:
    ParsedQuestion |
    null =
      null

  const createQuestion =
    (): ParsedQuestion => ({
      type:
        currentType,

      competency:
        pendingCompetency,

      questionLines: [],

      options:
        ['', '', '', ''],

      answer:
        ''
    })

  const saveQuestion = (
    question:
      ParsedQuestion
  ) => {
    const questionText =
      question
        .questionLines
        .join(' ')
        .trim()

    if (!questionText) {
      return
    }

    const hasOptions =
      question.options.some(
        option =>
          option.trim() !== ''
      )

    let finalType =
      question.type

    let finalAnswer =
      question.answer.trim()

    if (hasOptions) {
      finalType =
        'Multiple Choice'

      finalAnswer =
        finalAnswer
          .toUpperCase()
    }
    else if (
      finalAnswer
        .toLowerCase() ===
        'true'
      ||
      finalAnswer
        .toLowerCase() ===
        'false'
    ) {
      finalType =
        'True or False'

      finalAnswer =
        finalAnswer
          .toLowerCase() ===
          'true'
          ? 'True'
          : 'False'
    }
    else {
      finalType =
        question.type ===
          'True or False'
          ? 'True or False'
          : 'Identification'
    }

    parsedQuestions.push({
      id:
        Date.now() +
        parsedQuestions.length,

      type:
        finalType,

      competency:
        question
          .competency
          .trim(),

      question:
        questionText,

      options:
        question.options,

      answer:
        finalAnswer,

      points:
        1,

      time:
        30
    })
  }

  for (const line of lines) {
    if (
      /^multiple\s*choice$/i
        .test(line)
    ) {
      if (
        currentQuestion !==
        null
      ) {
        saveQuestion(
          currentQuestion
        )

        currentQuestion =
          null
      }

      currentType =
        'Multiple Choice'

      continue
    }

    if (
      /^true\s*or\s*false$/i
        .test(line)
    ) {
      if (
        currentQuestion !==
        null
      ) {
        saveQuestion(
          currentQuestion
        )

        currentQuestion =
          null
      }

      currentType =
        'True or False'

      continue
    }

    if (
      /^identification$/i
        .test(line)
    ) {
      if (
        currentQuestion !==
        null
      ) {
        saveQuestion(
          currentQuestion
        )

        currentQuestion =
          null
      }

      currentType =
        'Identification'

      continue
    }

    const competencyMatch =
      line.match(
        /^competenc(?:y|ies)\s*[:\-]\s*(.+)$/i
      )

    if (
      competencyMatch &&
      competencyMatch[1]
    ) {
      const competency =
        competencyMatch[1]
          .trim()

      if (
        currentQuestion !==
        null
      ) {
        currentQuestion
          .competency =
          competency
      }
      else {
        pendingCompetency =
          competency
      }

      continue
    }

    const questionMatch =
      line.match(
        /^(?:Q\s*)?(\d+)[\.\)]\s*(.+)$/i
      )

    if (
      questionMatch &&
      questionMatch[2]
    ) {
      if (
        currentQuestion !==
        null
      ) {
        saveQuestion(
          currentQuestion
        )
      }

      currentQuestion =
        createQuestion()

      pendingCompetency =
        ''

      currentQuestion
        .questionLines
        .push(
          questionMatch[2]
            .trim()
        )

      continue
    }

    if (
      currentQuestion ===
      null
    ) {
      currentQuestion =
        createQuestion()

      pendingCompetency =
        ''
    }

    const optionMatch =
      line.match(
        /^([A-Da-d])[\.\)\:]\s*(.+)$/
      )

    if (
      optionMatch &&
      optionMatch[1] &&
      optionMatch[2]
    ) {
      const letter =
        optionMatch[1]
          .toUpperCase()

      const value =
        optionMatch[2]
          .trim()

      const optionIndex =
        letter
          .charCodeAt(0) -
        65

      currentQuestion
        .options[
          optionIndex
        ] =
        value

      continue
    }

    const answerMatch =
      line.match(
        /^(answer|ans|correct answer|correct|key)\s*[:\-]\s*(.+)$/i
      )

    if (
      answerMatch &&
      answerMatch[2]
    ) {
      currentQuestion.answer =
        answerMatch[2]
          .trim()

      continue
    }

    currentQuestion
      .questionLines
      .push(line)
  }

  if (
    currentQuestion !==
    null
  ) {
    saveQuestion(
      currentQuestion
    )
  }

  return parsedQuestions.filter(
    item =>
      item.question.trim() !==
      ''
  )
}

// ==========================================
// NORMALIZE QUESTION
// ==========================================

function normalizeQuestion(
  question:
    ExamQuestion
) {
  if (
    question.type ===
    'Multiple Choice'
  ) {
    if (
      !Array.isArray(
        question.options
      )
    ) {
      question.options =
        ['', '', '', '']
    }

    if (
      ![
        'A',
        'B',
        'C',
        'D'
      ].includes(
        question.answer
      )
    ) {
      question.answer =
        ''
    }

    return
  }

  if (
    question.type ===
    'True or False'
  ) {
    question.options =
      ['', '', '', '']

    if (
      question.answer !==
        'True'
      &&
      question.answer !==
        'False'
    ) {
      question.answer =
        ''
    }

    return
  }

  question.options =
    ['', '', '', '']

  question.answer =
    String(
      question.answer ||
      ''
    )
}

// ==========================================
// ADD QUESTION
// ==========================================

function addBlankQuestion() {
  questions.value.push({
    id:
      Date.now(),

    type:
      'Multiple Choice',

    competency:
      '',

    question:
      '',

    options:
      [
        '',
        '',
        '',
        ''
      ],

    answer:
      '',

    points:
      1,

    time:
      30
  })
}

function deleteQuestion(
  index: number
) {
  questions.value.splice(
    index,
    1
  )
}

// ==========================================
// VALIDATION
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
    selectedClassIds.value
      .length === 0
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

  if (
    !selectedSubject.value
  ) {
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
    ) <= 0
  ) {
    showNotification(
      'error',
      'Invalid Duration',
      'Duration must be greater than 0.'
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

  const penaltyValues = [
    tabSwitchPenaltyMinutes.value,
    fullscreenExitPenaltyMinutes.value,
    copyAttemptPenaltyMinutes.value,
    pasteAttemptPenaltyMinutes.value,
    idlePenaltyMinutes.value
  ]

  if (
    penaltyValues.some(
      value =>
        Number(value || 0) < 0
    )
  ) {
    showNotification(
      'error',
      'Invalid Time Penalty',
      'Violation time penalties cannot be negative.'
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
      'Please generate or add at least one question.'
    )

    return
  }

  const hasEmptyQuestion =
    questions.value.some(
      question =>
        !question
          .question
          .trim()
    )

  if (hasEmptyQuestion) {
    showNotification(
      'error',
      'Incomplete Questions',
      'Please complete all question texts.'
    )

    return
  }

  /*
   * Competency is required
   * ONLY for examinations.
   */
  if (
    assessmentType.value ===
    'examination'
  ) {
    const hasEmptyCompetency =
      questions.value.some(
        question =>
          !question
            .competency
            .trim()
      )

    if (
      hasEmptyCompetency
    ) {
      showNotification(
        'error',
        'Competency Required',
        'Every examination question must have a competency because Item Analysis is enabled.'
      )

      return
    }
  }

  const hasMissingAnswer =
    questions.value.some(
      question =>
        !String(
          question.answer
        ).trim()
    )

  if (hasMissingAnswer) {
    showNotification(
      'error',
      'Incomplete Questions',
      'Please provide the correct answer for all questions.'
    )

    return
  }

  const invalidMultipleChoice =
    questions.value.some(
      question =>
        question.type ===
          'Multiple Choice'
        &&
        (
          question.options
            .length !== 4
          ||
          question.options
            .some(
              option =>
                !option.trim()
            )
          ||
          ![
            'A',
            'B',
            'C',
            'D'
          ].includes(
            question.answer
          )
        )
    )

  if (
    invalidMultipleChoice
  ) {
    showNotification(
      'error',
      'Invalid Multiple Choice Questions',
      'Please complete all Multiple Choice options and select the correct answer.'
    )

    return
  }

  const duplicateMultipleChoice =
    questions.value.some(
      question => {
        if (
          question.type !==
          'Multiple Choice'
        ) {
          return false
        }

        const normalized =
          question.options.map(
            option =>
              option
                .trim()
                .toLowerCase()
          )

        return (
          new Set(
            normalized
          ).size !==
          normalized.length
        )
      }
    )

  if (
    duplicateMultipleChoice
  ) {
    showNotification(
      'error',
      'Duplicate Options',
      'Multiple Choice options must be unique.'
    )

    return
  }

  const invalidPoints =
    questions.value.some(
      question =>
        Number(
          question.points
        ) < 1
    )

  if (invalidPoints) {
    showNotification(
      'error',
      'Invalid Points',
      'Points must be at least 1 for every question.'
    )

    return
  }

  const invalidTime =
    questions.value.some(
      question =>
        Number(
          question.time
        ) < 1
    )

  if (invalidTime) {
    showNotification(
      'error',
      'Invalid Time Limit',
      'Time limit must be at least 1 second for every question.'
    )

    return
  }

  showCreatePopup.value =
    true
}

// ==========================================
// POPUP
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
// CREATE ASSESSMENT
// ==========================================

async function confirmCreateExam() {
  if (
    creatingExam.value
  ) {
    return
  }

  showCreatePopup.value =
    false

  creatingExam.value =
    true

  try {
    const payload = {
      title:
        examTitle.value
          .trim(),

      description:
        description.value
          .trim(),

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
        minutesToSeconds(
          tabSwitchPenaltyMinutes.value
        ),

      fullscreen_exit_penalty_seconds:
        minutesToSeconds(
          fullscreenExitPenaltyMinutes.value
        ),

      copy_attempt_penalty_seconds:
        minutesToSeconds(
          copyAttemptPenaltyMinutes.value
        ),

      paste_attempt_penalty_seconds:
        minutesToSeconds(
          pasteAttemptPenaltyMinutes.value
        ),

      idle_penalty_seconds:
        minutesToSeconds(
          idlePenaltyMinutes.value
        ),

      questions:
        questions.value.map(
          question => ({
            type:
              question.type,

            competency:
              question
                .competency
                .trim(),

            question:
              question
                .question
                .trim(),

            options:
              question.type ===
                'Multiple Choice'
                ? question
                    .options
                    .map(
                      option =>
                        option.trim()
                    )
                : [],

            answer:
              question
                .answer
                .trim(),

            points:
              Number(
                question.points
              ),

            time:
              Number(
                question.time
              )
          })
        )
    }

    console.log(
      'AUTOMATIC ASSESSMENT PAYLOAD:',
      payload
    )

    await api.post(
      '/exams',
      payload
    )

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
      'CREATE ASSESSMENT ERROR:',
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
          'Please check the assessment information.'
        )
      )
    }
    else {
      showNotification(
        'error',
        'Creation Failed',
        error.response
          ?.data
          ?.message
        ||
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

.automatic-page {
  min-height: 100vh;
  padding: 35px;
  background: #f7f9fc;
}

.back-btn {
  margin-bottom: 25px;
  padding: 12px 18px;
  border: none;
  border-radius: 10px;
  background: white;
  box-shadow:
    0 5px 15px
    rgba(0, 0, 0, .08);
  cursor: pointer;
}

.back-btn:hover {
  background: #00c853;
  color: white;
}

.page-header {
  margin-bottom: 30px;
}

.page-header h1 {
  margin-bottom: 8px;
  color: #112244;
  font-size: 34px;
}

.page-header p {
  color: #6b7280;
}

.top-grid {
  margin-bottom: 25px;
  display: grid;
  grid-template-columns:
    2fr 1fr;
  gap: 25px;
}

.two-column {
  display: grid;
  grid-template-columns:
    1fr 1fr;
  gap: 20px;
}

.three-column {
  display: grid;
  grid-template-columns:
    1fr 1fr 1fr;
  gap: 20px;
}

.penalty-section {
  margin-top: 8px;
  padding: 18px;
  border: 1px solid #dbe3dd;
  border-radius: 14px;
  background: #f8fdf9;
}

.penalty-heading {
  margin-bottom: 16px;
}

.penalty-heading h3 {
  margin-bottom: 5px;
  color: #17351f;
  font-size: 16px;
}

.penalty-heading p {
  margin: 0;
  color: #64748b;
  font-size: 12px;
  line-height: 1.6;
}

.penalty-grid {
  display: grid;
  grid-template-columns:
    repeat(2, minmax(0, 1fr));
  gap: 12px 16px;
}

.penalty-grid .form-group {
  margin-bottom: 0;
}

.penalty-input {
  display: flex;
  align-items: center;
  gap: 10px;
}

.penalty-input input {
  min-width: 0;
}

.penalty-input span {
  flex: 0 0 auto;
  color: #64748b;
  font-size: 11px;
  white-space: nowrap;
}

.card {
  margin-bottom: 25px;
  padding: 25px;
  background: white;
  border-radius: 18px;
  box-shadow:
    0 5px 18px
    rgba(0, 0, 0, .08);
}

.card h2 {
  margin-bottom: 20px;
  color: #112244;
}

.form-group {
  margin-bottom: 18px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: #374151;
  font-weight: 600;
}

.field-requirement {
  margin-left: 4px;
  color: #94a3b8;
  font-size: 11px;
  font-weight: 500;
}

input,
textarea,
select {
  width: 100%;
  padding: 13px 15px;
  border:
    1px solid #d9dce2;
  border-radius: 10px;
  outline: none;
  font-size: 15px;
  background: white;
}

input:focus,
textarea:focus,
select:focus {
  border-color: #00c853;
  box-shadow:
    0 0 0 3px
    rgba(0, 200, 83, .08);
}

textarea {
  min-height: 100px;
  resize: vertical;
}

/* ASSESSMENT TYPE */

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

/* CLASS SELECTION */

.class-selection-box {
  display: grid;
  grid-template-columns:
    1fr 1fr;
  gap: 10px;
  max-height: 280px;
  overflow-y: auto;
  padding: 12px;
  border:
    1px solid #d9dce2;
  border-radius: 12px;
  background: #f8fafc;
}

.class-checkbox-item {
  display: flex;
  align-items: flex-start;
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
  margin-top: 2px;
  flex-shrink: 0;
  accent-color: #00c853;
}

.class-checkbox-info {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.class-checkbox-info strong {
  color: #112244;
  font-size: 13px;
}

.class-checkbox-info span {
  color: #64748b;
  font-size: 11px;
}

.class-checkbox-info small {
  color: #94a3b8;
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

.class-warning {
  margin-top: 7px;
  color: #dc2626;
  font-size: 12px;
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

/* SUBJECT */

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
  justify-content: space-between;
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

/* SUMMARY */

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
  gap: 20px;
}

.summary-box > div {
  padding-bottom: 12px;
  border-bottom:
    1px solid #f1f5f9;
}

.summary-box > div:last-child {
  border-bottom: none;
}

.summary-box span {
  color: #6b7280;
  font-size: 14px;
}

.summary-box h1 {
  margin-top: 3px;
  color: #00c853;
  font-size: 34px;
}

.warning-text {
  color: #f59e0b !important;
}

/* GENERATION */

.method-header {
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  justify-content:
    space-between;
  gap: 15px;
}

.method-header h2 {
  margin-bottom: 0;
}

.tabs {
  margin-bottom: 20px;
  display: flex;
  gap: 12px;
}

.tabs button {
  padding: 12px 20px;
  border: none;
  border-radius: 10px;
  background: #edf2f7;
  cursor: pointer;
  font-weight: 600;
}

.tabs button.active {
  background: #00c853;
  color: white;
}

.format-box {
  margin-bottom: 18px;
  padding: 18px;
  background: #f8fafc;
  border-left:
    5px solid #00c853;
  border-radius: 12px;
  color: #374151;
  line-height: 1.7;
}

.format-box p {
  margin-top: 8px;
}

.paste-area {
  min-height: 260px;
  margin-bottom: 15px;
}

/* BUTTONS */

.generate-btn,
.create-btn,
.add-question-btn {
  padding: 14px 22px;
  border: none;
  border-radius: 10px;
  background: #00c853;
  color: white;
  cursor: pointer;
  font-weight: 600;
}

.generate-btn:hover,
.create-btn:hover,
.add-question-btn:hover {
  background: #00b34a;
}

.create-btn {
  width: 100%;
  margin-top: 25px;
}

.create-btn:disabled,
.confirm-btn:disabled {
  opacity: .6;
  cursor: not-allowed;
}

/* QUESTIONS */

.question-header,
.question-card-header {
  margin-bottom: 20px;
  display: flex;
  justify-content:
    space-between;
  align-items: center;
  gap: 20px;
}

.question-summary-text {
  margin-top: -12px;
  color: #64748b;
  font-size: 12px;
}

.question-card {
  margin-bottom: 20px;
  padding: 22px;
  border:
    1px solid #ececec;
  border-radius: 16px;
  background: #fafafa;
}

.question-card h3 {
  color: #112244;
}

.delete-btn {
  padding: 10px 16px;
  border: none;
  border-radius: 10px;
  background: #fee2e2;
  color: #dc2626;
  cursor: pointer;
  font-weight: 600;
}

.warning-box,
.competency-warning {
  margin-top: 10px;
  padding: 14px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 600;
}

.warning-box {
  background: #fff7ed;
  color: #c2410c;
}

.competency-warning {
  background: #fef2f2;
  color: #dc2626;
}

.empty {
  padding: 35px;
  color: #888;
  text-align: center;
}

/* POPUP */

.popup-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background:
    rgba(0, 0, 0, .55);
  backdrop-filter:
    blur(5px);
}

.popup-card {
  width: 430px;
  max-width: 95%;
  padding: 35px;
  background: white;
  border-radius: 20px;
  box-shadow:
    0 20px 45px
    rgba(0, 0, 0, .2);
  text-align: center;
}

.popup-icon {
  width: 75px;
  height: 75px;
  margin:
    0 auto 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: #00c853;
  color: white;
  font-size: 34px;
  font-weight: 700;
}

.popup-card h2 {
  margin-bottom: 15px;
  color: #112244;
}

.popup-card p {
  color: #666;
  line-height: 1.7;
}

.confirmation-summary {
  margin-top: 20px;
  padding: 15px;
  background: #f8fafc;
  border-radius: 12px;
  text-align: left;
}

.confirmation-summary > div {
  padding: 8px 0;
  display: flex;
  justify-content:
    space-between;
  gap: 15px;
  border-bottom:
    1px solid #e5e7eb;
}

.confirmation-summary > div:last-child {
  border-bottom: none;
}

.confirmation-summary span {
  color: #64748b;
  font-size: 12px;
}

.confirmation-summary strong {
  color: #1e293b;
  font-size: 12px;
  text-align: right;
}

.popup-buttons {
  margin-top: 30px;
  display: flex;
  gap: 15px;
}

.cancel-btn,
.confirm-btn {
  flex: 1;
  padding: 14px;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 600;
}

.cancel-btn {
  background: #e5e7eb;
}

.confirm-btn {
  background: #16a34a;
  color: white;
}

/* HOW TO */

.how-to-btn {
  padding: 7px 12px;
  border:
    1px solid #16a34a;
  border-radius: 8px;
  background: #f0fdf4;
  color: #16a34a;
  cursor: pointer;
  font-size: 12px;
  font-weight: 600;
}

.how-to-popup-card {
  position: relative;
  width: 650px;
  max-width: 95%;
  max-height: 85vh;
  overflow-y: auto;
  padding: 32px;
  background: white;
  border-radius: 18px;
}

.how-to-description {
  margin-bottom: 18px;
  color: #64748b;
  line-height: 1.6;
}

.how-to-close-btn {
  position: absolute;
  top: 14px;
  right: 16px;
  width: 34px;
  height: 34px;
  border: none;
  border-radius: 50%;
  background: #f1f5f9;
  color: #334155;
  cursor: pointer;
  font-size: 22px;
}

.format-example {
  margin-bottom: 20px;
  padding: 18px;
  overflow-x: auto;
  border:
    1px solid #e2e8f0;
  border-radius: 12px;
  background: #f8fafc;
}

.format-example pre {
  margin: 0;
  white-space: pre-wrap;
  color: #334155;
  font-family: monospace;
  font-size: 13px;
  line-height: 1.7;
}

.format-tips {
  padding: 16px;
  border-left:
    4px solid #16a34a;
  border-radius: 10px;
  background: #f0fdf4;
}

.format-tips p {
  margin-bottom: 8px;
  color: #374151;
  font-size: 13px;
  line-height: 1.6;
}

/* NOTIFICATION */

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

/* RESPONSIVE */

@media (max-width: 900px) {
  .top-grid,
  .two-column,
  .three-column {
    grid-template-columns:
      1fr;
  }

  .automatic-page {
    padding: 20px;
  }

  .class-selection-box {
    grid-template-columns:
      1fr;
  }

  .page-header h1 {
    font-size: 28px;
  }

  .question-header,
  .question-card-header,
  .popup-buttons {
    flex-direction: column;
    align-items: stretch;
  }

  .confirmation-summary > div {
    flex-direction: column;
    gap: 3px;
  }

  .confirmation-summary strong {
    text-align: left;
  }
}

@media (max-width: 760px) {
  .penalty-grid {
    grid-template-columns:
      1fr;
  }

  .penalty-input {
    align-items: stretch;
    flex-direction: column;
    gap: 6px;
  }
}

@media (max-width: 600px) {
  .automatic-page {
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

  .assessment-type-options {
    grid-template-columns:
      1fr;
  }

  .notification-container {
    top: 15px;
    right: 15px;
    left: 15px;
    width: auto;
    max-width: none;
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
  padding: 8px 12px;
  background: #ecfdf5;
  color: #047857;
  border: 1px solid #a7f3d0;
}

.test-bank-btn:hover:not(:disabled) {
  background: #d1fae5;
}

.test-bank-btn.saved {
  background: #f0fdf4;
  color: #15803d;
}

.test-bank-btn:disabled,
.test-bank-all-btn:disabled {
  cursor: not-allowed;
  opacity: .65;
}

.test-bank-all-btn {
  width: 100%;
  margin-bottom: 10px;
  padding: 12px 16px;
  background: white;
  color: #047857;
  border: 1px solid #10b981;
}

.test-bank-all-btn:hover:not(:disabled) {
  background: #ecfdf5;
}

</style>
