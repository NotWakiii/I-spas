<template>
  <div class="automatic-page">
    <button
      class="back-btn"
      @click="$router.push('/faculty/create-exam')"
    >
      ← Back to Selection
    </button>
    <div class="page-header">
      <h1>Automatic Exam Generation</h1>
      <p>
        Generate draft questions by pasting questions with answers.
      </p>
    </div>
    <!-- ==========================================
         EXAM DETAILS + SUMMARY
    =========================================== -->
    <div class="top-grid">
      <div class="card">
        <h2>Exam Details</h2>
        <div class="form-group">
          <label>Exam Title</label>
          <input
            v-model="examTitle"
            type="text"
            placeholder="e.g. Midterm Examination"
          >
        </div>
        <div class="form-group">
          <label>Description</label>
          <textarea
            v-model="description"
            placeholder="Brief description of the exam"
          ></textarea>
        </div>
        <div class="form-group">
          <label>Assign to Classes</label>
          <div
            v-if="loadingClasses"
            class="class-loading"
          >
            Loading classes...
          </div>
          <div
            v-else-if="classes.length > 0"
            class="class-selection-box"
          >
            <label
              v-for="schoolClass in classes"
              :key="schoolClass.id"
              class="class-checkbox-item"
              :class="{
                selected: selectedClassIds.includes(schoolClass.id)
              }"
            >
              <input
                v-model="selectedClassIds"
                type="checkbox"
                :value="schoolClass.id"
              >
              <div class="class-checkbox-info">
                <strong>
                  Grade {{ schoolClass.grade }}
                </strong>
                <span>
                  {{ schoolClass.section }}
                </span>
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
        </div>
        <div class="form-group">
          <label>Subject</label>
          <input
            v-model="subject"
            type="text"
            placeholder="e.g. Basic Accounting"
          >
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
      </div>
      <div class="card summary">
        <h2>Draft Summary</h2>
        <div class="summary-box">
          <div>
            <span>Questions Generated</span>
            <h1>{{ questions.length }}</h1>
          </div>
          <div>
            <span>Total Points</span>
            <h1>{{ totalPoints }}</h1>
          </div>
          <div>
            <span>Detected Answers</span>
            <h1>{{ detectedAnswers }}</h1>
          </div>
          <div>
            <span>Missing Answers</span>
            <h1 class="warning-text">
              {{ missingAnswers }}
            </h1>
          </div>
        </div>
        <button
          class="create-btn"
          :disabled="creatingExam"
          @click="openCreatePopup"
        >
          {{
            creatingExam
              ? 'Creating...'
              : 'Create Exam'
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
          @click="showHowToPopup = true"
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
          <strong>Accepted Format:</strong>
          <p>
            Multiple Choice questions can be pasted directly
            with A-D choices and an Answer key. You may also add
            section labels such as <b>True or False</b> and
            <b>Identification</b>.
          </p>
          <p>
            You may add a competency before the question or after
            the answer using:
            <b>Competency: Your competency here</b>.
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
    <div
      v-if="showHowToPopup"
      class="popup-overlay"
      @click.self="showHowToPopup = false"
    >
      <div class="how-to-popup-card">
        <button
          class="how-to-close-btn"
          type="button"
          @click="showHowToPopup = false"
        >
          ×
        </button>
        <h2>How to Format Questions</h2>
        <p class="how-to-description">
          For better question detection, follow this format when pasting your questions.
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
          <p><strong>Tips:</strong></p>
          <p>• Start every question with a number such as <strong>1.</strong>, <strong>2.</strong>, <strong>3.</strong></p>
          <p>• Use <strong>A</strong>, <strong>B</strong>, <strong>C</strong>, and <strong>D</strong> for Multiple Choice options.</p>
          <p>• Write the correct answer using <strong>Answer: B</strong></p>
          <p>• Write the competency using <strong>Competency: ...</strong>.</p>
          <p>• Put the competency after the answer for clearer question grouping.</p>
          <p>• Avoid placing unrelated text between questions.</p>
          <p>• Make sure the question numbers are part of the text so they can be copied when I copy the questions.</p>
        </div>
      </div>
    </div>
    <!-- ==========================================
         GENERATED QUESTIONS
    =========================================== -->
    <div class="card">
      <div class="question-header">
        <div>
          <h2>Generated Draft Questions</h2>
          <p
            v-if="questions.length > 0"
            class="question-summary-text"
          >
            {{ questions.length }} question(s) •
            {{ totalPoints }} total point(s)
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
        v-for="(questionItem, index) in questions"
        :key="questionItem.id"
        class="question-card"
      >
        <div class="question-card-header">
          <h3>
            Question {{ index + 1 }}
          </h3>
          <button
            class="delete-btn"
            @click="deleteQuestion(index)"
          >
            Delete
          </button>
        </div>
        <div class="form-group">
          <label>Competency</label>
          <input
            v-model="questionItem.competency"
            type="text"
            placeholder="Enter learning competency"
          >
        </div>
        <div class="form-group">
          <label>Question Type</label>
          <select
            v-model="questionItem.type"
            @change="normalizeQuestion(questionItem)"
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
        <div class="form-group">
          <label>Question</label>
          <textarea
            v-model="questionItem.question"
            placeholder="Enter question"
          ></textarea>
        </div>
        <!-- MULTIPLE CHOICE OPTIONS -->
        <div
          v-if="questionItem.type === 'Multiple Choice'"
          class="two-column"
        >
          <div class="form-group">
            <label>Option A</label>
            <input
              v-model="questionItem.options[0]"
              placeholder="Option A"
            >
          </div>
          <div class="form-group">
            <label>Option B</label>
            <input
              v-model="questionItem.options[1]"
              placeholder="Option B"
            >
          </div>
          <div class="form-group">
            <label>Option C</label>
            <input
              v-model="questionItem.options[2]"
              placeholder="Option C"
            >
          </div>
          <div class="form-group">
            <label>Option D</label>
            <input
              v-model="questionItem.options[3]"
              placeholder="Option D"
            >
          </div>
        </div>
        <!-- ANSWER / POINTS / TIME -->
        <div class="three-column">
          <div class="form-group">
            <label>Correct Answer</label>
            <select
              v-if="
                questionItem.type ===
                'Multiple Choice'
              "
              v-model="questionItem.answer"
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
              v-model="questionItem.answer"
            >
              <option value="">
                Select answer
              </option>
              <option>True</option>
              <option>False</option>
            </select>
            <input
              v-else-if="
                questionItem.type ===
                'Identification'
              "
              v-model="questionItem.answer"
              type="text"
              placeholder="Enter correct answer"
            >
          </div>
          <div class="form-group">
            <label>Points</label>
            <input
              v-model.number="questionItem.points"
              type="number"
              min="1"
            >
          </div>
          <div class="form-group">
            <label>Time Limit (sec)</label>
            <input
              v-model.number="questionItem.time"
              type="number"
              min="1"
            >
          </div>
        </div>
        <div
          v-if="!questionItem.answer.trim()"
          class="warning-box"
        >
          ⚠ No answer detected for this question.
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
          ✓
        </div>
        <h2>Create Examination?</h2>
        <p>
          This examination will be saved as a draft.
          You can still edit it later before publishing.
        </p>
        <div class="confirmation-summary">
          <div>
            <span>Classes</span>
            <strong>
              {{ selectedClassLabel }}
            </strong>
          </div>
          <div>
            <span>Subject</span>
            <strong>
              {{ subject }}
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
                : 'Create Exam'
            }}
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
          <span v-if="notification.type === 'success'">✓</span>
          <span v-else-if="notification.type === 'error'">!</span>
          <span v-else>i</span>
        </div>
        <div class="notification-content">
          <strong>{{ notification.title }}</strong>
          <p>{{ notification.message }}</p>
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
  useRouter
} from 'vue-router'
import api from '../services/api'

const router =
  useRouter()

// ==========================================
// TYPES
// ==========================================

interface SchoolClass {
  id: number
  grade: string
  section: string
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
// EXAM DETAILS
// ==========================================

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

const subject =
  ref('')

// ==========================================
// CLASSES
// ==========================================

const classes =
  ref<SchoolClass[]>([])

const selectedClassIds =
  ref<number[]>([])

const loadingClasses =
  ref(false)

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
    type: 'success' as NotificationType,
    title: '',
    message: ''
  })

let notificationTimer:
  ReturnType<typeof setTimeout> |
  null = null

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

const selectedClassLabel =
  computed(() => {
    if (
      selectedClassIds.value.length === 0
    ) {
      return 'Not selected'
    }

    const selected =
      classes.value.filter(
        schoolClass =>
          selectedClassIds.value.includes(
            schoolClass.id
          )
      )

    return selected
      .map(
        schoolClass =>
          `${schoolClass.grade} - ${schoolClass.section}`
      )
      .join(', ')
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

    console.log(
      'AUTOMATIC EXAM CLASSES:',
      response.data
    )

    classes.value =
      Array.isArray(
        response.data?.data
      )
        ? response.data.data
        : []
  }
  catch (error: any) {
    console.error(
      'LOAD CLASSES ERROR:',
      error.response?.data ||
      error
    )

    classes.value = []
  }
  finally {
    loadingClasses.value = false
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

  showNotification(
    'success',
    'Questions Generated',
    `${parsed.length} question${parsed.length === 1 ? '' : 's'} generated successfully.`
  )
}

// ==========================================
// PARSE QUESTIONS
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
    .map(line => line.trim())
    .filter(Boolean)

  const parsedQuestions: ExamQuestion[] = []

  let currentType = 'Multiple Choice'
  let pendingCompetency = ''
  let currentQuestion: ParsedQuestion | null = null

  const createQuestion = (): ParsedQuestion => ({
    type: currentType,
    competency: pendingCompetency,
    questionLines: [],
    options: ['', '', '', ''],
    answer: ''
  })

  const saveQuestion = (
    question: ParsedQuestion
  ) => {
    const questionText =
      question.questionLines
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
        finalAnswer.toUpperCase()
    }
    else if (
      finalAnswer.toLowerCase() === 'true'
      ||
      finalAnswer.toLowerCase() === 'false'
    ) {
      finalType =
        'True or False'

      finalAnswer =
        finalAnswer.toLowerCase() === 'true'
          ? 'True'
          : 'False'
    }
    else {
      finalType =
        question.type === 'True or False'
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
        question.competency.trim()
        ||
        'Unassigned Competency',
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
      /^multiple\s*choice$/i.test(line)
    ) {
      if (currentQuestion !== null) {
        saveQuestion(currentQuestion)
        currentQuestion = null
      }

      currentType =
        'Multiple Choice'

      continue
    }

    if (
      /^true\s*or\s*false$/i.test(line)
    ) {
      if (currentQuestion !== null) {
        saveQuestion(currentQuestion)
        currentQuestion = null
      }

      currentType =
        'True or False'

      continue
    }

    if (
      /^identification$/i.test(line)
    ) {
      if (currentQuestion !== null) {
        saveQuestion(currentQuestion)
        currentQuestion = null
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
        competencyMatch[1].trim()

      if (currentQuestion !== null) {
        currentQuestion.competency =
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
      if (currentQuestion !== null) {
        saveQuestion(currentQuestion)
      }

      currentQuestion =
        createQuestion()

      pendingCompetency =
        ''

      currentQuestion.questionLines.push(
        questionMatch[2].trim()
      )

      continue
    }

    if (currentQuestion === null) {
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
        letter.charCodeAt(0) - 65

      currentQuestion.options[
        optionIndex
      ] = value

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
        answerMatch[2].trim()

      continue
    }

    currentQuestion.questionLines.push(
      line
    )
  }

  if (currentQuestion !== null) {
    saveQuestion(
      currentQuestion
    )
  }

  return parsedQuestions.filter(
    item =>
      item.question.trim() !== ''
  )
}

// ==========================================
// NORMALIZE QUESTION
// ==========================================

function normalizeQuestion(
  question: ExamQuestion
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
      question.answer = ''
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
      question.answer = ''
    }

    return
  }

  if (
    question.type ===
    'Identification'
  ) {
    question.options =
      ['', '', '', '']

    question.answer =
      String(
        question.answer || ''
      )
  }
}

// ==========================================
// ADD BLANK QUESTION
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

// ==========================================
// DELETE QUESTION
// ==========================================

function deleteQuestion(
  index: number
) {
  questions.value.splice(
    index,
    1
  )
}

// ==========================================
// OPEN CREATE POPUP
// ==========================================

function openCreatePopup() {
  if (
    !examTitle.value.trim()
  ) {
showNotification(
  'error',
  'Exam Title Required',
  'Please enter an exam title.'
)
    return
  }

  if (
    selectedClassIds.value.length === 0
  ) {
    showNotification(
      'error',
      'Class Required',
      'Please select at least one class.'
    )
    return
  }

  if (
    !subject.value.trim()
  ) {
    showNotification(
      'error',
      'Subject Required',
      'Please enter the subject.'
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

  if (
    questions.value.length === 0
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
        !question.question.trim()
    )

  if (hasEmptyQuestion) {
    showNotification(
      'error',
      'Incomplete Questions',
      'Please complete all question texts.'
    )
    return
  }

  const hasEmptyCompetency =
    questions.value.some(
      question =>
        !question.competency.trim()
    )

  if (hasEmptyCompetency) {
    showNotification(
      'error',
      'Incomplete Questions',
      'Please complete the competency for all questions.'
    )
    return
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
          question.options.length !== 4
          ||
          question.options.some(
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

  if (invalidMultipleChoice) {
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

  if (duplicateMultipleChoice) {
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
      class_ids:
        selectedClassIds.value,
      subject:
        subject.value
          .trim(),
      duration:
        Number(
          duration.value
        ),
      passing:
        Number(
          passing.value
        ),
      questions:
        questions.value.map(
          question => ({
            type:
              question.type,
            competency:
              question.competency
                .trim(),
            question:
              question.question
                .trim(),
            options:
              question.type ===
                'Multiple Choice'
                ? question.options.map(
                    option =>
                      option.trim()
                  )
                : [],
            answer:
              question.answer
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
      'AUTOMATIC EXAM PAYLOAD:',
      payload
    )

    await api.post(
      '/exams',
      payload
    )

    showNotification(
      'success',
      'Exam Created',
      `${selectedClassIds.value.length} exam(s) created successfully!`
    )

    await new Promise(
      resolve =>
        setTimeout(resolve, 1200)
    )

    await router.push(
      '/faculty/dashboard'
    )
  }
  catch (error: any) {
    console.error(
      'CREATE EXAM ERROR:',
      error
    )

    console.error(
      'SERVER RESPONSE:',
      error.response?.data
    )

    const validationErrors =
      error.response?.data?.errors

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
          ?.message
        ||
        'Failed to create generated exam.'
      )
    }
  }
  finally {
    creatingExam.value =
      false
  }
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

/* ==========================================
   BACK BUTTON
========================================== */

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

/* ==========================================
   HEADER
========================================== */

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

/* ==========================================
   GRID
========================================== */

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

/* ==========================================
   CARD
========================================== */

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

/* ==========================================
   FORMS
========================================== */

.form-group {
  margin-bottom: 18px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  color: #374151;
  font-weight: 600;
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

.class-warning {
  margin-top: 7px;
  color: #dc2626;
  font-size: 12px;
}

/* ==========================================
   SUMMARY
========================================== */

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

/* ==========================================
   GENERATION METHOD
========================================== */

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

/* ==========================================
   BUTTONS
========================================== */

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

/* ==========================================
   QUESTIONS
========================================== */

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

.delete-btn:hover {
  background: #fecaca;
}

.warning-box {
  margin-top: 10px;
  padding: 14px;
  background: #fff7ed;
  border-radius: 10px;
  color: #c2410c;
  font-weight: 600;
}

.empty {
  padding: 35px;
  color: #888;
  text-align: center;
}

/* ==========================================
   POPUP
========================================== */

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

/* ==========================================
   MULTIPLE CLASS SELECTION
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

/* ==========================================
   RESPONSIVE
========================================== */

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

  .page-header h1 {
    font-size: 28px;
  }

  .question-header,
  .question-card-header,
  .popup-buttons {
    flex-direction: column;
    align-items: stretch;
  }

  .tabs {
    flex-direction: column;
  }

  .confirmation-summary > div {
    flex-direction: column;
    gap: 3px;
  }

  .confirmation-summary strong {
    text-align: left;
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
    padding: 25px 20px;
  }
}
.method-header {
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 15px;
}

.method-header h2 {
  margin-bottom: 0;
}

.how-to-btn {
  padding: 7px 12px;
  border: 1px solid #16a34a;
  border-radius: 8px;
  background: #f0fdf4;
  color: #16a34a;
  cursor: pointer;
  font-size: 12px;
  font-weight: 600;
  transition: .2s;
}

.how-to-btn:hover {
  background: #16a34a;
  color: white;
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
  box-shadow:
    0 20px 45px
    rgba(0, 0, 0, .2);
}

.how-to-popup-card h2 {
  margin-bottom: 10px;
  color: #112244;
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
  line-height: 1;
}

.how-to-close-btn:hover {
  background: #fee2e2;
  color: #dc2626;
}

.format-example {
  margin-bottom: 20px;
  padding: 18px;
  overflow-x: auto;
  border: 1px solid #e2e8f0;
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
  border-left: 4px solid #16a34a;
  border-radius: 10px;
  background: #f0fdf4;
}

.format-tips p {
  margin-bottom: 8px;
  color: #374151;
  font-size: 13px;
  line-height: 1.6;
}

.format-tips p:last-child {
  margin-bottom: 0;
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
  max-width: calc(100vw - 40px);
  padding: 16px 45px 16px 16px;
  display: flex;
  align-items: flex-start;
  gap: 14px;
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  background: white;
  box-shadow: 0 15px 35px rgba(0, 0, 0, .15);
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
  border-left: 5px solid #16a34a;
}
.notification-container.success .notification-icon {
  background: #dcfce7;
  color: #16a34a;
}
.notification-container.error {
  border-left: 5px solid #dc2626;
}
.notification-container.error .notification-icon {
  background: #fee2e2;
  color: #dc2626;
}
.notification-container.info {
  border-left: 5px solid #2563eb;
}
.notification-container.info .notification-icon {
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
  transition: opacity .25s ease, transform .25s ease;
}
.notification-enter-from,
.notification-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
@media (max-width: 600px) {
  .notification-container {
    top: 15px;
    right: 15px;
    left: 15px;
    width: auto;
    max-width: none;
  }
}
</style>
