<template>
  <div
    class="exam-page"
    @copy.prevent="handleBlockedAction('copy_attempt')"
    @cut.prevent="handleBlockedAction('cut_attempt')"
    @paste.prevent="handleBlockedAction('paste_attempt')"
    @contextmenu.prevent="handleBlockedAction('right_click')"
  >
    <div v-if="loading" class="state-screen">
      <div class="state-card">
        <div class="loader"></div>
        <h2>Preparing Examination</h2>
        <p>Loading your questions and examination details...</p>
      </div>
    </div>

    <div v-else-if="errorMessage" class="state-screen">
      <div class="state-card error-state">
        <div class="state-icon">⚠</div>
        <h2>Unable to Load Examination</h2>
        <p>{{ errorMessage }}</p>

        <button class="primary-btn" type="button" @click="loadExam">
          Try Again
        </button>

        <button class="text-btn" type="button" @click="goBackToLobby">
          Return to Lobby
        </button>
      </div>
    </div>

    <template v-else>
      <header class="exam-header">
        <div class="exam-brand">
          <img
            src="../../assets/logo.png"
            alt="I-SPAS Logo"
            class="header-logo"
          >

          <div>
            <p class="portal-label">I-SPAS STUDENT EXAMINATION</p>
            <h1>{{ exam.title }}</h1>
            <span>{{ exam.course }}</span>
          </div>
        </div>

        <div class="header-status">
          <div
            class="connection-status"
            :class="{ disconnected: !isConnected }"
          >
            <span class="connection-dot"></span>
            {{ isConnected ? 'Connected' : 'Disconnected' }}
          </div>

          <div
            class="timer-card"
            :class="{ urgent: remainingSeconds <= 300 }"
          >
            <small>Time Remaining</small>
            <strong>{{ formattedTime }}</strong>
          </div>
        </div>
      </header>

      <div class="progress-header">
        <div class="progress-details">
          <span>
            Question {{ currentQuestionIndex + 1 }}
            of {{ questions.length }}
          </span>

          <strong>{{ answeredCount }} answered</strong>
        </div>

        <div class="main-progress">
          <div
            class="main-progress-fill"
            :style="{ width: `${progressPercentage}%` }"
          ></div>
        </div>
      </div>

      <main class="exam-layout">
        <section class="question-section">
          <div class="question-card">
            <div class="question-header question-info-row">
              <span class="question-number">
                Question {{ currentQuestionIndex + 1 }}
              </span>

              <span class="question-type">
                {{ displayQuestionType(currentQuestion?.question_type) }}
              </span>

              <span class="question-detail-badge">
                {{ currentQuestion?.points || 1 }}
                {{ Number(currentQuestion?.points || 1) === 1 ? 'point' : 'points' }}
              </span>

              <span
                v-if="currentQuestion?.time_limit"
                class="question-detail-badge"
              >
                ⏱ {{ currentQuestion.time_limit }}s
              </span>
            </div>

            <div v-if="currentQuestion" class="question-content">
              <h2>{{ currentQuestion.question }}</h2>

              <div
                v-if="currentQuestion.question_type === 'multiple_choice'"
                class="answer-options"
              >
                <label
                  v-for="(option, optionIndex) in currentQuestion.options"
                  :key="option.id"
                  class="answer-option"
                  :class="{
                    selected:
                      answers[currentQuestion.id] === option.option_text
                  }"
                >
                  <input
                    v-model="answers[currentQuestion.id]"
                    type="radio"
                    :disabled="autoSubmitting || submitting"
                    :name="`question-${currentQuestion.id}`"
                    :value="option.option_text"
                    @change="saveCurrentAnswer"
                  >

                  <span class="option-letter">
                    {{ optionLetter(optionIndex) }}
                  </span>

                  <span class="option-text">
                    {{ option.option_text }}
                  </span>

                  <span class="selected-icon">✓</span>
                </label>
              </div>

              <div
                v-else-if="currentQuestion.question_type === 'true_false'"
                class="answer-options true-false-options"
              >
                <label
                  class="answer-option"
                  :class="{
                    selected:
                      answers[currentQuestion.id] === 'True'
                  }"
                >
                  <input
                    v-model="answers[currentQuestion.id]"
                    type="radio"
                    :disabled="autoSubmitting || submitting"
                    :name="`question-${currentQuestion.id}`"
                    value="True"
                    @change="saveCurrentAnswer"
                  >

                  <span class="option-letter true-option">T</span>
                  <span class="option-text">True</span>
                  <span class="selected-icon">✓</span>
                </label>

                <label
                  class="answer-option"
                  :class="{
                    selected:
                      answers[currentQuestion.id] === 'False'
                  }"
                >
                  <input
                    v-model="answers[currentQuestion.id]"
                    type="radio"
                    :disabled="autoSubmitting || submitting"
                    :name="`question-${currentQuestion.id}`"
                    value="False"
                    @change="saveCurrentAnswer"
                  >

                  <span class="option-letter false-option">F</span>
                  <span class="option-text">False</span>
                  <span class="selected-icon">✓</span>
                </label>
              </div>

              <div
                v-else-if="currentQuestion.question_type === 'identification'"
                class="text-answer"
              >
                <label>Your Answer</label>

                <input
                  v-model="answers[currentQuestion.id]"
                  type="text"
                  :disabled="autoSubmitting || submitting"
                  autocomplete="off"
                  placeholder="Type your answer here..."
                  @blur="saveCurrentAnswer"
                  @input="saveAnswersLocally"
                >

                <small>Check your spelling before proceeding.</small>
              </div>

              <div
                v-else-if="currentQuestion.question_type === 'essay'"
                class="text-answer"
              >
                <label>Your Answer</label>

                <textarea
                  v-model="answers[currentQuestion.id]"
                  :disabled="autoSubmitting || submitting"
                  placeholder="Write your answer here..."
                  @blur="saveCurrentAnswer"
                  @input="saveAnswersLocally"
                ></textarea>

                <div class="essay-footer">
                  <small>Your response is automatically saved.</small>
                  <span>
                    {{ String(answers[currentQuestion.id] || '').length }}
                    characters
                  </span>
                </div>
              </div>

              <div v-else class="unsupported-question">
                This question type is currently unavailable.
              </div>
            </div>

            <div class="saving-status">
              <span v-if="savingAnswer">
                <span class="small-spinner"></span>
                Saving answer...
              </span>

              <span v-else-if="lastSavedMessage" class="saved">
                ✓ {{ lastSavedMessage }}
              </span>

              <span v-else>
                Answers are saved automatically.
              </span>
            </div>
          </div>

          <div class="navigation-buttons">
            <button
              class="secondary-btn"
              type="button"
              :disabled="currentQuestionIndex === 0 || autoSubmitting || submitting"
              @click="previousQuestion"
            >
              ← Previous
            </button>

            <button
              v-if="currentQuestionIndex < questions.length - 1"
              class="primary-btn"
              type="button"
              :disabled="autoSubmitting || submitting"
              @click="nextQuestion"
            >
              Next Question →
            </button>

            <button
              v-else
              class="submit-btn"
              type="button"
              @click="openSubmitDialog"
            >
              Submit Examination
            </button>
          </div>
        </section>

        <aside class="exam-sidebar">
          <div class="sidebar-card student-profile">
            <div class="profile-avatar">{{ studentInitials }}</div>

            <div>
              <strong>{{ studentName }}</strong>
              <span>{{ studentSection }}</span>
            </div>
          </div>

          <div class="sidebar-card">
            <div class="sidebar-title">
              <h3>Exam Monitoring</h3>
              <span class="monitoring-badge">Active</span>
            </div>

            <div class="monitoring-list">
              <div>
                <span>Tab switches</span>
                <strong :class="{ warning: violationCounts.tab_switch > 0 }">
                  {{ violationCounts.tab_switch }}
                </strong>
              </div>

              <div>
                <span>Copy attempts</span>
                <strong :class="{ warning: violationCounts.copy_attempt > 0 }">
                  {{ violationCounts.copy_attempt }}
                </strong>
              </div>

              <div>
                <span>Paste attempts</span>
                <strong :class="{ warning: violationCounts.paste_attempt > 0 }">
                  {{ violationCounts.paste_attempt }}
                </strong>
              </div>

              <div>
                <span>Fullscreen exits</span>
                <strong :class="{ warning: violationCounts.fullscreen_exit > 0 }">
                  {{ violationCounts.fullscreen_exit }}
                </strong>
              </div>

              <div>
                <span>Idle time</span>
                <strong :class="{ warning: idleSeconds >= 30 }">
                  {{ idleSeconds }}s
                </strong>
              </div>
            </div>
          </div>

          <div class="sidebar-card">
            <div class="sidebar-title">
              <h3>Question Navigator</h3>
              <span>{{ answeredCount }}/{{ questions.length }}</span>
            </div>

            <div class="question-navigator">
              <button
                v-for="(_, index) in questions"
                :key="index"
                type="button"
                :class="{
                  current: currentQuestionIndex === index,
                  answered: isQuestionAnswered(index)
                }"
                @click="goToQuestion(index)"
              >
                {{ index + 1 }}
              </button>
            </div>
          </div>

          <button
            class="sidebar-submit-btn"
            type="button"
            @click="openSubmitDialog"
          >
            Submit Examination
          </button>
        </aside>
      </main>

      <transition name="alert">
        <div v-if="securityWarning" class="security-warning">
          <div class="warning-icon">⚠</div>

          <div>
            <strong>Activity Recorded</strong>
            <p>{{ securityWarning }}</p>
          </div>

          <button type="button" @click="securityWarning = ''">✕</button>
        </div>
      </transition>

      <div v-if="showFullscreenPrompt" class="modal-overlay">
        <div class="modal-card">
          <div class="modal-icon">⛶</div>

          <h2>Enter Fullscreen Mode</h2>

          <p>
            Fullscreen mode is required during the examination.
            Exiting fullscreen will be recorded.
          </p>

          <button
            class="primary-btn full-btn"
            type="button"
            @click="enterFullscreen"
          >
            Enter Fullscreen
          </button>
        </div>
      </div>

      <div
        v-if="showSubmitDialog"
        class="modal-overlay"
        @click.self="closeSubmitDialog"
      >
        <div class="modal-card">
          <div class="modal-icon submit-icon">✓</div>

          <h2>Submit Examination?</h2>

          <p>
            Review your progress before submitting. You cannot change
            your answers after submission.
          </p>

          <div class="submit-summary">
            <div>
              <small>Answered</small>
              <strong>{{ answeredCount }}</strong>
            </div>

            <div>
              <small>Unanswered</small>
              <strong>{{ unansweredCount }}</strong>
            </div>

            <div>
              <small>Time Remaining</small>
              <strong>{{ formattedTime }}</strong>
            </div>
          </div>

          <div v-if="unansweredCount > 0" class="unanswered-warning">
            You still have {{ unansweredCount }}
            unanswered
            {{ unansweredCount === 1 ? 'question' : 'questions' }}.
          </div>

          <div class="modal-actions">
            <button
              class="secondary-btn"
              type="button"
              :disabled="submitting"
              @click="closeSubmitDialog"
            >
              Continue Exam
            </button>

            <button
              class="submit-btn"
              type="button"
              :disabled="submitting"
              @click="confirmSubmitExam"
            >
              {{ submitting ? 'Submitting...' : 'Submit Now' }}
            </button>
          </div>
        </div>
      </div>

      <div v-if="autoSubmitting" class="modal-overlay">
        <div class="modal-card">
          <div class="loader"></div>
          <h2>{{ automaticSubmitTitle }}</h2>
          <p>{{ automaticSubmitMessage }}</p>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import {
  computed,
  onMounted,
  onUnmounted,
  ref,
} from 'vue'

import { useRouter } from 'vue-router'
import api from '../../services/api'

interface ExamOption {
  id: number
  option_text: string
}

interface ExamQuestion {
  id: number
  exam_id: number
  question: string
  question_type: string
  points: number
  time_limit?: number | null
  options: ExamOption[]
}

interface StoredSession {
  id: number
  exam_id: number
  student_name: string
  status: string
}

interface StoredExam {
  id: number
  title?: string
  course?: string
  duration?: number
  passing?: number
}

interface ViolationCounts {
  tab_switch: number
  copy_attempt: number
  paste_attempt: number
  cut_attempt: number
  right_click: number
  fullscreen_exit: number
  idle: number
}

type BlockedActivity =
  | 'copy_attempt'
  | 'paste_attempt'
  | 'cut_attempt'
  | 'right_click'

const router = useRouter()

const loading = ref(true)
const errorMessage = ref('')
const savingAnswer = ref(false)
const submitting = ref(false)
const autoSubmitting = ref(false)
const automaticSubmitTitle = ref('Time Is Up')
const automaticSubmitMessage = ref(
  'Your examination is being submitted automatically.'
)
const showSubmitDialog = ref(false)
const showFullscreenPrompt = ref(false)
const securityWarning = ref('')
const lastSavedMessage = ref('')
const isConnected = ref(navigator.onLine)

const exam = ref({
  id: 0,
  title: '',
  course: '',
  duration: 0,
  passing: 75,
})

const session = ref<StoredSession | null>(null)
const studentName = ref('')
const studentSection = ref('')
const questions = ref<ExamQuestion[]>([])
const currentQuestionIndex = ref(0)
const answers = ref<Record<number, string>>({})
const remainingSeconds = ref(0)
const idleSeconds = ref(0)

const violationCounts = ref<ViolationCounts>({
  tab_switch: 0,
  copy_attempt: 0,
  paste_attempt: 0,
  cut_attempt: 0,
  right_click: 0,
  fullscreen_exit: 0,
  idle: 0,
})




let examTimerInterval:
  ReturnType<typeof setInterval> | null = null

let idleInterval:
  ReturnType<typeof setInterval> | null = null

let heartbeatInterval:
  ReturnType<typeof setInterval> | null = null

let warningTimeout:
  ReturnType<typeof setTimeout> | null = null

let lastActivityTime = Date.now()
let examSubmitted = false
let fullscreenActivated = false
let statusUpdating = false
let examStatusChecking = false

let examStatusInterval:
  ReturnType<typeof setInterval> | null = null

const submittingExam = ref(false)




const currentQuestion = computed(() => {
  return questions.value[currentQuestionIndex.value] || null
})

const formattedTime = computed(() => {
  const minutes = Math.floor(remainingSeconds.value / 60)
  const seconds = remainingSeconds.value % 60

  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
})

const answeredCount = computed(() =>
  questions.value.filter((question) =>
    String(answers.value[question.id] ?? '').trim() !== ''
  ).length
)

const unansweredCount = computed(() =>
  Math.max(questions.value.length - answeredCount.value, 0)
)

const progressPercentage = computed(() => {
  if (!questions.value.length) return 0

  return Math.round(
    (answeredCount.value / questions.value.length) * 100
  )
})

const studentInitials = computed(() => {
  const parts = studentName.value
    .trim()
    .split(/\s+/)
    .filter(Boolean)

  if (!parts.length) return 'ST'

  return parts
    .map((part) => part.charAt(0))
    .join('')
    .slice(0, 2)
    .toUpperCase()
})

function readStoredData(): boolean {
  const storedSession =
    localStorage.getItem('student_session')

  const storedExam =
    localStorage.getItem('student_exam')

  if (!storedSession || !storedExam) {
    router.replace('/student')
    return false
  }

  try {
    session.value =
      JSON.parse(storedSession) as StoredSession

    const examData =
      JSON.parse(storedExam) as StoredExam

    exam.value = {
      id:
        Number(examData.id) ||
        Number(session.value.exam_id),
      title:
        examData.title ||
        'Untitled Examination',
      course:
        examData.course ||
        'No Course',
      duration:
        Number(examData.duration || 0),
      passing:
        Number(examData.passing || 75),
    }

    studentName.value =
      localStorage.getItem('student_name') ||
      session.value.student_name ||
      'Student'

    studentSection.value =
      localStorage.getItem('student_section') ||
      ''

    return true
  } catch (error) {
    console.error('Invalid student data:', error)
    clearStudentStorage()
    router.replace('/student')
    return false
  }
}

function clearStudentStorage() {
  localStorage.removeItem('student_session')
  localStorage.removeItem('student_exam')
  localStorage.removeItem('student_name')
  localStorage.removeItem('student_section')
  localStorage.removeItem('student_access_code')
  localStorage.removeItem('student_answers')
  localStorage.removeItem('exam_remaining_seconds')
}

function loadSavedAnswers() {
  const saved =
    localStorage.getItem('student_answers')

  if (!saved) return

  try {
    answers.value =
      JSON.parse(saved) as Record<number, string>
  } catch (error) {
    console.error('Unable to restore answers:', error)
  }
}

function saveAnswersLocally() {
  localStorage.setItem(
    'student_answers',
    JSON.stringify(answers.value)
  )
}

function restoreRemainingTime() {
  const savedTime =
    Number(
      localStorage.getItem('exam_remaining_seconds')
    )

  if (savedTime > 0) {
    remainingSeconds.value = savedTime
    return
  }

  remainingSeconds.value =
    exam.value.duration * 60
}

async function loadExam() {
  loading.value = true
  errorMessage.value = ''

  if (!readStoredData()) {
    loading.value = false
    return
  }

  try {
    const response = await api.get(
      `/exam-questions/${exam.value.id}`
    )

    const questionData =
      Array.isArray(response.data?.data)
        ? response.data.data
        : []

    questions.value = questionData.map(
      (question: ExamQuestion) => ({
        ...question,
        points: Number(question.points || 1),
        options: Array.isArray(question.options)
          ? question.options
          : [],
      })
    )

    const returnedExam = response.data?.exam

    if (returnedExam) {
      exam.value = {
        id: Number(returnedExam.id),
        title:
          returnedExam.title ||
          exam.value.title,
        course:
          returnedExam.course ||
          exam.value.course,
        duration:
          Number(
            returnedExam.duration ||
            exam.value.duration
          ),
        passing:
          Number(
            returnedExam.passing ||
            exam.value.passing
          ),
      }
    }

    if (!questions.value.length) {
      errorMessage.value =
        'No examination questions were found.'
      return
    }

    loadSavedAnswers()
    restoreRemainingTime()
    startExamTimer()
    startIdleMonitor()

    showFullscreenPrompt.value =
      !isFullscreenActive()

    await sendLiveStatus()
  } catch (error: unknown) {
    console.error('LOAD EXAM ERROR:', error)

    const apiError = error as {
      response?: {
        data?: {
          message?: string
        }
      }
    }

    errorMessage.value =
      apiError.response?.data?.message ||
      'Unable to load the examination.'
  } finally {
    loading.value = false
  }
}

function displayQuestionType(type?: string): string {
  const value = String(type || '').toLowerCase()

  if (value === 'multiple_choice') return 'Multiple Choice'
  if (value === 'true_false') return 'True or False'
  if (value === 'identification') return 'Identification'
  if (value === 'essay') return 'Essay'

  return 'Question'
}

function optionLetter(index: number): string {
  return String.fromCharCode(65 + index)
}

function isQuestionAnswered(index: number): boolean {
  const question = questions.value[index]

  if (!question) return false

  return String(
    answers.value[question.id] ?? ''
  ).trim() !== ''
}

function goToQuestion(index: number) {
  if (
    index < 0 ||
    index >= questions.value.length
  ) {
    return
  }

  currentQuestionIndex.value = index
  resetActivityTimer()
  sendLiveStatus()

  window.scrollTo({
    top: 0,
    behavior: 'smooth',
  })
}

function previousQuestion() {
  if (currentQuestionIndex.value > 0) {
    goToQuestion(currentQuestionIndex.value - 1)
  }
}

function nextQuestion() {
  if (
    currentQuestionIndex.value <
    questions.value.length - 1
  ) {
    goToQuestion(currentQuestionIndex.value + 1)
  }
}

async function saveCurrentAnswer() {
  const question = currentQuestion.value

  if (!question || !session.value) return

  const answer =
    String(answers.value[question.id] ?? '').trim()

  saveAnswersLocally()
  resetActivityTimer()

  if (!answer) return

  savingAnswer.value = true
  lastSavedMessage.value = ''

  try {
    await api.post('/save-answer', {
      exam_session_id: session.value.id,
      question_id: question.id,
      answer,
    })

    lastSavedMessage.value = 'Answer saved'
    await sendLiveStatus()

    setTimeout(() => {
      lastSavedMessage.value = ''
    }, 2000)
  } catch (error) {
    console.error('SAVE ANSWER ERROR:', error)

    lastSavedMessage.value =
      'Saved locally. Waiting for connection.'
  } finally {
    savingAnswer.value = false
  }
}

function startExamTimer() {
  if (examTimerInterval) {
    clearInterval(examTimerInterval)
  }

  examTimerInterval = setInterval(() => {
    if (
      remainingSeconds.value > 0 &&
      !examSubmitted
    ) {
      remainingSeconds.value -= 1

      localStorage.setItem(
        'exam_remaining_seconds',
        String(remainingSeconds.value)
      )

      if (remainingSeconds.value % 5 === 0) {
        sendLiveStatus()
      }

      return
    }

    if (
      remainingSeconds.value <= 0 &&
      !examSubmitted
    ) {
      autoSubmitExam()
    }
  }, 1000)
}

function openSubmitDialog() {
  showSubmitDialog.value = true
}

function closeSubmitDialog() {
  if (!submitting.value) {
    showSubmitDialog.value = false
  }
}

async function saveAllAnsweredQuestions() {
  if (!session.value) return

  const requests = questions.value
    .filter((question) =>
      String(
        answers.value[question.id] ?? ''
      ).trim() !== ''
    )
    .map((question) =>
      api.post('/save-answer', {
        exam_session_id: session.value?.id,
        question_id: question.id,
        answer: String(
          answers.value[question.id]
        ).trim(),
      })
    )

  if (requests.length) {
    await Promise.allSettled(requests)
  }
}

async function confirmSubmitExam() {
  if (!session.value || submitting.value) return

  submitting.value = true

  try {
    await saveAllAnsweredQuestions()

    const response = await api.post(
      `/submit-exam/${session.value.id}`
    )

    examSubmitted = true

    localStorage.setItem(
      'student_result',
      JSON.stringify(
        response.data?.data ||
        response.data
      )
    )

    cleanupIntervals()
    localStorage.removeItem('student_answers')
    localStorage.removeItem('exam_remaining_seconds')

    router.replace('/student/results')
  } catch (error: unknown) {
    console.error('SUBMIT EXAM ERROR:', error)

    const apiError = error as {
      response?: {
        data?: {
          message?: string
        }
      }
    }

    showSecurityWarning(
      apiError.response?.data?.message ||
      'Unable to submit the examination.'
    )
  } finally {
    submitting.value = false
    showSubmitDialog.value = false
  }
}

async function autoSubmitExam() {
  if (
    examSubmitted ||
    autoSubmitting.value ||
    !session.value
  ) {
    return
  }

  autoSubmitting.value = true
  automaticSubmitTitle.value = 'Time Is Up'
  automaticSubmitMessage.value =
    'Your examination is being submitted automatically.'

  try {
    await saveAllAnsweredQuestions()

    const response = await api.post(
      `/submit-exam/${session.value.id}`
    )

    examSubmitted = true

    localStorage.setItem(
      'student_result',
      JSON.stringify(
        response.data?.data ||
        response.data
      )
    )

    cleanupIntervals()
    localStorage.removeItem('student_answers')
    localStorage.removeItem('exam_remaining_seconds')

    router.replace('/student/results')
  } catch (error) {
    console.error('AUTO SUBMIT ERROR:', error)
    autoSubmitting.value = false

    showSecurityWarning(
      'Automatic submission failed. Please submit manually.'
    )
  }
}


async function checkExamStatus() {
  if (
    !session.value ||
    !exam.value.id ||
    examSubmitted ||
    autoSubmitting.value ||
    examStatusChecking
  ) {
    return
  }

  examStatusChecking = true

  try {
    const response = await api.get(
      `/student/exams/${exam.value.id}/status`,
      {
        params: {
          session_id: session.value.id,
          timestamp: Date.now(),
        },

        headers: {
          'Cache-Control': 'no-cache',
          Pragma: 'no-cache',
        },
      }
    )

    const examStatus = String(
      response.data?.data?.status || ''
    ).toLowerCase()

    const sessionStatus = String(
      response.data?.data?.session_status || ''
    ).toLowerCase()

    if (
      examStatus === 'finished' ||
      sessionStatus === 'submitted'
    ) {
      await handleFacultyEndedExam()
    }
  } catch (error) {
    console.error(
      'EXAM STATUS CHECK ERROR:',
      error
    )
  } finally {
    examStatusChecking = false
  }
}

async function handleFacultyEndedExam() {
  if (
    examSubmitted ||
    autoSubmitting.value
  ) {
    return
  }

  autoSubmitting.value = true
  automaticSubmitTitle.value =
    'Examination Ended'
  automaticSubmitMessage.value =
    'The professor ended the examination. Opening your result now.'

  examSubmitted = true
  cleanupIntervals()

  localStorage.removeItem('student_answers')
  localStorage.removeItem(
    'exam_remaining_seconds'
  )

  await new Promise((resolve) => {
    setTimeout(resolve, 900)
  })

  router.replace('/student/results')
}

function handleBlockedAction(
  activity: BlockedActivity
) {
  violationCounts.value[activity] += 1

  const messages: Record<BlockedActivity, string> = {
    copy_attempt:
      'Copying is disabled during the examination.',
    paste_attempt:
      'Pasting is disabled during the examination.',
    cut_attempt:
      'Cutting text is disabled during the examination.',
    right_click:
      'Right-click is disabled during the examination.',
  }

  const message = messages[activity]

  showSecurityWarning(message)
  sendMonitoringLog(activity, message)
  resetActivityTimer()
}

async function sendLiveStatus() {
  if (
    !session.value ||
    examSubmitted ||
    statusUpdating
  ) {
    return
  }

  statusUpdating = true

  try {
    const response = await api.post(
      '/student-session-status',
      {
        exam_session_id: session.value.id,

        current_question:
          currentQuestionIndex.value + 1,

        progress:
          progressPercentage.value,

        idle_seconds:
          idleSeconds.value,

        time_remaining:
          remainingSeconds.value,
      }
    )

    console.log(
      'LIVE STATUS SAVED:',
      response.data
    )
  } catch (error: unknown) {
    console.error(
      'LIVE STATUS UPDATE ERROR:',
      error
    )
  } finally {
    statusUpdating = false
  }
}

async function sendMonitoringLog(
  activity: string,
  details: string
) {
  if (!session.value) return

  try {
    await api.post('/monitor-log', {
      exam_session_id: session.value.id,
      activity,
      details,
      idle_seconds: idleSeconds.value,
    })

    await sendLiveStatus()
  } catch (error) {
    console.error(
      'MONITOR LOG ERROR:',
      error
    )
  }
}

function showSecurityWarning(message: string) {
  securityWarning.value = message

  if (warningTimeout) {
    clearTimeout(warningTimeout)
  }

  warningTimeout = setTimeout(() => {
    securityWarning.value = ''
  }, 4000)
}

function handleVisibilityChange() {
  if (
    document.hidden &&
    !examSubmitted &&
    !loading.value
  ) {
    violationCounts.value.tab_switch += 1

    const message =
      'You switched tabs or minimized the browser. This activity was recorded.'

    showSecurityWarning(message)
    sendMonitoringLog('tab_switch', message)
  }

  resetActivityTimer()
}

function handleWindowBlur() {
  if (
    document.hidden ||
    examSubmitted ||
    loading.value
  ) {
    return
  }

  violationCounts.value.tab_switch += 1

  const message =
    'The examination window lost focus. This activity was recorded.'

  showSecurityWarning(message)
  sendMonitoringLog('tab_switch', message)
}

function resetActivityTimer() {
  lastActivityTime = Date.now()
  idleSeconds.value = 0
}

function startIdleMonitor() {
  if (idleInterval) {
    clearInterval(idleInterval)
  }

  lastActivityTime = Date.now()

  idleInterval = setInterval(() => {
    const elapsed = Math.floor(
      (Date.now() - lastActivityTime) / 1000
    )

    idleSeconds.value = elapsed

    if (elapsed % 5 === 0) {
      sendLiveStatus()
    }

    if (
      elapsed === 30 &&
      !examSubmitted
    ) {
      violationCounts.value.idle += 1

      const message =
        'You have been inactive for 30 seconds.'

      showSecurityWarning(message)
      sendMonitoringLog('idle', message)
    }

    if (
      elapsed > 30 &&
      elapsed % 30 === 0 &&
      !examSubmitted
    ) {
      sendMonitoringLog(
        'idle',
        `Student has been idle for ${elapsed} seconds.`
      )
    }
  }, 1000)
}

function isFullscreenActive(): boolean {
  return Boolean(
    document.fullscreenElement ||
    (
      document as Document & {
        webkitFullscreenElement?: Element
      }
    ).webkitFullscreenElement
  )
}

async function enterFullscreen() {
  const documentElement =
    document.documentElement as HTMLElement & {
      webkitRequestFullscreen?: () => Promise<void>
    }

  try {
    if (documentElement.requestFullscreen) {
      await documentElement.requestFullscreen()
    } else if (
      documentElement.webkitRequestFullscreen
    ) {
      await documentElement.webkitRequestFullscreen()
    }

    fullscreenActivated = true
    showFullscreenPrompt.value = false
  } catch (error) {
    console.error('FULLSCREEN ERROR:', error)

    showFullscreenPrompt.value = false

    showSecurityWarning(
      'Fullscreen could not be started. Keep the examination page open.'
    )
  }
}

function handleFullscreenChange() {
  const fullscreenNow = isFullscreenActive()

  if (fullscreenNow) {
    fullscreenActivated = true
    showFullscreenPrompt.value = false
    return
  }

  if (
    fullscreenActivated &&
    !examSubmitted &&
    !loading.value
  ) {
    violationCounts.value.fullscreen_exit += 1

    const message =
      'You exited fullscreen mode. This activity was recorded.'

    showSecurityWarning(message)
    sendMonitoringLog('fullscreen_exit', message)
    showFullscreenPrompt.value = true
  }
}

function handleOnline() {
  isConnected.value = true
  showSecurityWarning('Connection restored.')
}

function handleOffline() {
  isConnected.value = false

  showSecurityWarning(
    'Connection lost. Answers will remain stored on this device.'
  )
}

function goBackToLobby() {
  router.replace('/student/lobby')
}

function registerEventListeners() {

  document.addEventListener(
    'visibilitychange',
    handleVisibilityChange
  )

  document.addEventListener(
    'fullscreenchange',
    handleFullscreenChange
  )

  document.addEventListener(
    'webkitfullscreenchange',
    handleFullscreenChange
  )

  document.addEventListener(
    'mousemove',
    resetActivityTimer
  )

  document.addEventListener(
    'mousedown',
    resetActivityTimer
  )

  document.addEventListener(
    'keydown',
    resetActivityTimer
  )

  document.addEventListener(
    'touchstart',
    resetActivityTimer
  )

  window.addEventListener(
    'online',
    handleOnline
  )

  window.addEventListener(
    'offline',
    handleOffline
  )

}

function removeEventListeners() {

  document.removeEventListener(
    'visibilitychange',
    handleVisibilityChange
  )

  document.removeEventListener(
    'fullscreenchange',
    handleFullscreenChange
  )

  document.removeEventListener(
    'webkitfullscreenchange',
    handleFullscreenChange
  )

  document.removeEventListener(
    'mousemove',
    resetActivityTimer
  )

  document.removeEventListener(
    'mousedown',
    resetActivityTimer
  )

  document.removeEventListener(
    'keydown',
    resetActivityTimer
  )

  document.removeEventListener(
    'touchstart',
    resetActivityTimer
  )

  window.removeEventListener(
    'online',
    handleOnline
  )

  window.removeEventListener(
    'offline',
    handleOffline
  )


}

function checkStatusAfterResume() {
  if (
    document.visibilityState === 'visible' &&
    !examSubmitted
  ) {
    checkExamStatus()
  }
}

function cleanupIntervals() {
  if (examTimerInterval) {
    clearInterval(examTimerInterval)
    examTimerInterval = null
  }

  if (idleInterval) {
    clearInterval(idleInterval)
    idleInterval = null
  }

  if (heartbeatInterval) {
    clearInterval(heartbeatInterval)
    heartbeatInterval = null
  }

  if (examStatusInterval) {
    clearInterval(examStatusInterval)
    examStatusInterval = null
  }

  if (warningTimeout) {
    clearTimeout(warningTimeout)
  }
}

function handleBeforeUnload(
  event: BeforeUnloadEvent
) {
  if (examSubmitted) return

  event.preventDefault()
  event.returnValue = ''
}

onMounted(async () => {
  registerEventListeners()

  window.addEventListener(
    'beforeunload',
    handleBeforeUnload
  )

  window.addEventListener(
    'pageshow',
    checkStatusAfterResume
  )

  window.addEventListener(
    'focus',
    checkStatusAfterResume
  )

  window.addEventListener(
    'online',
    checkStatusAfterResume
  )

  document.addEventListener(
    'visibilitychange',
    checkStatusAfterResume
  )

  await loadExam()
  await checkExamStatus()

  heartbeatInterval = setInterval(() => {
    sendLiveStatus()
  }, 3000)

  examStatusInterval = setInterval(() => {
    checkExamStatus()
  }, 1500)
})

onUnmounted(() => {
  cleanupIntervals()
  removeEventListeners()

  window.removeEventListener(
    'beforeunload',
    handleBeforeUnload
  )

  window.removeEventListener(
    'pageshow',
    checkStatusAfterResume
  )

  window.removeEventListener(
    'focus',
    checkStatusAfterResume
  )

  window.removeEventListener(
    'online',
    checkStatusAfterResume
  )

  document.removeEventListener(
    'visibilitychange',
    checkStatusAfterResume
  )
})







</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap');

/* ==========================================
   RESET
========================================== */

*{
    margin:0;
    padding:0;
    box-sizing:border-box;
    font-family:'Poppins',sans-serif;
}

button,
input,
textarea{
    font:inherit;
}

button,
label{
    -webkit-tap-highlight-color:transparent;
}

button{
    cursor:pointer;
}

img{
    display:block;
    max-width:100%;
}



/* ==========================================
   DOCUMENT SCROLLING
   The entire exam page scrolls as one document
========================================== */

:global(html){

    width:100%;

    min-height:100%;

    height:auto;

    overflow-x:hidden;

    overflow-y:auto;

    -webkit-text-size-adjust:100%;

}

:global(body){

    width:100%;

    min-height:100%;

    height:auto;

    margin:0;

    overflow-x:hidden;

    overflow-y:auto !important;

    -webkit-overflow-scrolling:touch;

}

:global(#app){

    width:100%;

    min-height:100vh;

    min-height:100dvh;

    height:auto;

    overflow:visible;

}


/* ==========================================
   FULL PAGE SCROLL
========================================== */

.exam-page{
    position:relative;
    width:100%;
    min-height:100vh;
    min-height:100dvh;
    height:auto;
    overflow-x:hidden;
    overflow-y:visible;
    color:#0f172a;
    background:#f3f8f5;
    -webkit-overflow-scrolling:touch;
    overscroll-behavior-y:auto;
}

.exam-page,
.exam-page *{
    scrollbar-width:thin;
    scrollbar-color:#94a3b8 #e2e8f0;
}

.exam-page::-webkit-scrollbar{
    width:8px;
}

.exam-page::-webkit-scrollbar-track{
    background:#e2e8f0;
}

.exam-page::-webkit-scrollbar-thumb{
    border-radius:999px;
    background:#94a3b8;
}

/* ==========================================
   LOADING / ERROR
========================================== */

.state-screen{
    min-height:100vh;
    min-height:100dvh;
    padding:
        max(24px,env(safe-area-inset-top))
        20px
        max(24px,env(safe-area-inset-bottom));
    display:flex;
    align-items:center;
    justify-content:center;
    background:#f3f8f5;
}

.state-card{
    width:min(100%,430px);
    padding:32px;
    border:1px solid #dbe5df;
    border-radius:22px;
    background:#ffffff;
    text-align:center;
    box-shadow:0 18px 45px rgba(15,23,42,.12);
}

.state-card h2{
    margin:12px 0 8px;
    font-size:22px;
}

.state-card p{
    color:#64748b;
    font-size:12px;
    line-height:1.7;
}

.state-icon{
    font-size:42px;
}

.loader,
.small-spinner{
    border-radius:50%;
    animation:spin .75s linear infinite;
}

.loader{
    width:48px;
    height:48px;
    margin:0 auto 18px;
    border:4px solid #dcfce7;
    border-top-color:#16a34a;
}

.small-spinner{
    width:14px;
    height:14px;
    display:inline-block;
    border:2px solid #d1fae5;
    border-top-color:#16a34a;
    vertical-align:middle;
}

/* ==========================================
   HEADER
========================================== */

.exam-header{
    width:100%;
    padding:
        max(14px,env(safe-area-inset-top))
        clamp(18px,3vw,34px)
        14px;
    display:flex;
    align-items:center;
    justify-content:space-between;
    gap:20px;
    border-bottom:1px solid #dbe5df;
    background:#ffffff;
}

.exam-brand{
    min-width:0;
    display:flex;
    align-items:center;
    gap:14px;
}

.header-logo{
    flex:0 0 54px;
    width:54px;
    height:54px;
    padding:5px;
    object-fit:contain;
    border-radius:14px;
    background:#f0fdf4;
}

.exam-brand > div{
    min-width:0;
}

.portal-label{
    margin-bottom:2px;
    overflow:hidden;
    color:#16a34a;
    font-size:9px;
    font-weight:800;
    letter-spacing:1.2px;
    text-overflow:ellipsis;
    white-space:nowrap;
}

.exam-brand h1{
    max-width:680px;
    overflow:hidden;
    font-size:clamp(18px,2.1vw,26px);
    line-height:1.18;
    font-weight:800;
    text-overflow:ellipsis;
    white-space:nowrap;
}

.exam-brand span{
    display:block;
    margin-top:4px;
    color:#64748b;
    font-size:11px;
}

.header-status{
    flex:0 0 auto;
    display:flex;
    align-items:center;
    gap:12px;
}

.connection-status{
    min-width:128px;
    min-height:42px;
    padding:9px 16px;
    display:flex;
    align-items:center;
    justify-content:center;
    gap:8px;
    border-radius:999px;
    background:#dcfce7;
    color:#15803d;
    font-size:11px;
    font-weight:800;
}

.connection-status.disconnected{
    background:#fee2e2;
    color:#dc2626;
}

.connection-dot{
    width:8px;
    height:8px;
    border-radius:50%;
    background:currentColor;
}

.timer-card{
    min-width:132px;
    min-height:58px;
    padding:8px 15px;
    display:flex;
    flex-direction:column;
    align-items:center;
    justify-content:center;
    border-radius:14px;
    background:#0f172a;
    color:#ffffff;
}

.timer-card small{
    font-size:8px;
    opacity:.75;
}

.timer-card strong{
    margin-top:1px;
    font-size:23px;
    line-height:1.1;
}

.timer-card.urgent{
    background:#b91c1c;
}

/* ==========================================
   PROGRESS
========================================== */

.progress-header{
    width:100%;
    padding:12px clamp(18px,3vw,34px) 13px;
    border-bottom:1px solid #dbe5df;
    background:#ffffff;
}

.progress-details{
    margin-bottom:8px;
    display:flex;
    align-items:center;
    justify-content:space-between;
    gap:12px;
    color:#64748b;
    font-size:10px;
}

.progress-details strong{
    color:#15803d;
}

.main-progress{
    width:100%;
    height:7px;
    overflow:hidden;
    border-radius:999px;
    background:#e2e8f0;
}

.main-progress-fill{
    height:100%;
    border-radius:inherit;
    background:#16a34a;
    transition:width .25s ease;
}

/* ==========================================
   MAIN LAYOUT
========================================== */

.exam-layout{
    width:min(100%,1160px);
    margin:0 auto;
    padding:20px 20px 34px;
    display:grid;
    grid-template-columns:minmax(0,1fr) 270px;
    align-items:start;
    gap:16px;
}

.question-section{
    min-width:0;
    overflow:visible;
}

.question-card{
    min-width:0;
    padding:22px;
    border:1px solid #dbe5df;
    border-radius:20px;
    background:#ffffff;
    box-shadow:0 8px 24px rgba(15,23,42,.04);
}

/* ==========================================
   QUESTION DETAILS
   Two compact vertical rows, never horizontal scroll
========================================== */

.question-header,
.question-info-row{
    width:100%;
    padding-bottom:15px;
    display:grid;
    grid-template-columns:auto auto 1fr auto auto;
    align-items:center;
    gap:8px;
    border-bottom:1px solid #e2e8f0;
}

.question-number,
.question-type,
.question-detail-badge{
    width:max-content;
    max-width:100%;
    padding:7px 11px;
    border-radius:999px;
    font-size:9px;
    font-weight:800;
    line-height:1.2;
    white-space:nowrap;
}

.question-number{
    color:#15803d;
    background:#dcfce7;
}

.question-type{
    color:#2563eb;
    background:#eff6ff;
}

.question-detail-badge{
    color:#64748b;
    background:#f8fafc;
}

.question-header .question-detail-badge:first-of-type{
    grid-column:4;
}

/* ==========================================
   QUESTION CONTENT
========================================== */

.question-content{
    margin-top:20px;
}

.question-content h2{
    margin-bottom:22px;
    overflow-wrap:anywhere;
    font-size:clamp(23px,2.8vw,32px);
    line-height:1.27;
    font-weight:800;
}

.answer-options{
    display:flex;
    flex-direction:column;
    gap:9px;
}

.answer-option{
    position:relative;
    width:100%;
    min-height:58px;
    padding:9px 13px;
    display:flex;
    align-items:center;
    gap:12px;
    border:2px solid #dbe4e8;
    border-radius:14px;
    background:#f8fafc;
    cursor:pointer;
    transition:
        border-color .18s ease,
        background .18s ease,
        transform .18s ease;
}

.answer-option:hover{
    border-color:#86efac;
    transform:translateY(-1px);
}

.answer-option.selected{
    border-color:#16a34a;
    background:#f0fdf4;
}

.answer-option input{
    position:absolute;
    opacity:0;
    pointer-events:none;
}

.option-letter{
    flex:0 0 38px;
    width:38px;
    height:38px;
    display:flex;
    align-items:center;
    justify-content:center;
    border:1px solid #cbd5e1;
    border-radius:11px;
    background:#ffffff;
    font-size:13px;
    font-weight:800;
}

.answer-option.selected .option-letter{
    border-color:#16a34a;
    background:#16a34a;
    color:#ffffff;
}

.option-text{
    min-width:0;
    flex:1;
    overflow-wrap:anywhere;
    font-size:13px;
    line-height:1.4;
}

.selected-icon{
    flex:0 0 auto;
    color:#16a34a;
    font-size:17px;
    font-weight:800;
    opacity:0;
}

.answer-option.selected .selected-icon{
    opacity:1;
}

.true-option{
    color:#15803d;
}

.false-option{
    color:#dc2626;
}

.text-answer{
    display:flex;
    flex-direction:column;
    gap:9px;
}

.text-answer label{
    font-size:12px;
    font-weight:700;
}

.text-answer input,
.text-answer textarea{
    width:100%;
    border:1px solid #cbd5e1;
    border-radius:12px;
    outline:none;
    background:#f8fafc;
    color:#0f172a;
    font-size:16px;
    -webkit-appearance:none;
    appearance:none;
}

.text-answer input{
    min-height:48px;
    padding:0 14px;
}

.text-answer textarea{
    min-height:170px;
    padding:14px;
    resize:vertical;
}

.text-answer input:focus,
.text-answer textarea:focus{
    border-color:#16a34a;
    background:#ffffff;
    box-shadow:0 0 0 4px rgba(22,163,74,.1);
}

.text-answer small,
.essay-footer,
.saving-status{
    color:#94a3b8;
    font-size:9px;
}

.essay-footer{
    display:flex;
    justify-content:space-between;
    gap:12px;
}

.unsupported-question{
    padding:20px;
    border-radius:12px;
    background:#fff7ed;
    color:#c2410c;
    font-size:12px;
}

.saving-status{
    min-height:18px;
    margin-top:14px;
}

.saving-status .saved{
    color:#15803d;
}

/* ==========================================
   NAVIGATION
   Sticky, not fixed: whole assessment page scrolls
========================================== */

.navigation-buttons{
    position:relative;
    bottom:auto;
    z-index:1;
    width:100%;
    margin-top:12px;
    padding:
        9px
        0
        max(9px,env(safe-area-inset-bottom));
    display:grid;
    grid-template-columns:repeat(2,minmax(0,1fr));
    gap:9px;
    background:linear-gradient(
        to top,
        #f3f8f5 72%,
        rgba(243,248,245,0)
    );
}

.primary-btn,
.secondary-btn,
.submit-btn,
.sidebar-submit-btn,
.text-btn{
    min-height:44px;
    padding:10px 15px;
    border:none;
    border-radius:11px;
    font-size:10px;
    font-weight:800;
}

.primary-btn,
.submit-btn,
.sidebar-submit-btn{
    background:#16a34a;
    color:#ffffff;
}

.primary-btn:hover,
.submit-btn:hover,
.sidebar-submit-btn:hover{
    background:#15803d;
}

.secondary-btn{
    background:#e8eef2;
    color:#64748b;
}

.text-btn{
    margin-top:8px;
    background:transparent;
    color:#64748b;
}

button:disabled{
    opacity:.55;
    cursor:not-allowed;
}

/* ==========================================
   SIDEBAR
========================================== */

.exam-sidebar{
    min-width:0;
    display:flex;
    flex-direction:column;
    gap:12px;
}

.sidebar-card{
    min-width:0;
    padding:15px;
    border:1px solid #dbe5df;
    border-radius:17px;
    background:#ffffff;
    box-shadow:0 8px 22px rgba(15,23,42,.035);
}

.student-profile{
    display:flex;
    align-items:center;
    gap:11px;
}

.profile-avatar{
    flex:0 0 40px;
    width:40px;
    height:40px;
    display:flex;
    align-items:center;
    justify-content:center;
    border-radius:50%;
    background:#dcfce7;
    color:#15803d;
    font-size:12px;
    font-weight:800;
}

.student-profile > div:last-child{
    min-width:0;
}

.student-profile strong{
    display:block;
    overflow:hidden;
    font-size:12px;
    text-overflow:ellipsis;
    white-space:nowrap;
}

.student-profile span{
    display:block;
    margin-top:2px;
    overflow:hidden;
    color:#64748b;
    font-size:9px;
    text-overflow:ellipsis;
    white-space:nowrap;
}

.sidebar-title{
    margin-bottom:12px;
    display:flex;
    align-items:center;
    justify-content:space-between;
    gap:10px;
}

.sidebar-title h3{
    font-size:13px;
}

.sidebar-title > span{
    font-size:10px;
}

.monitoring-badge{
    padding:5px 8px;
    border-radius:999px;
    background:#dcfce7;
    color:#15803d;
    font-size:8px !important;
    font-weight:800;
}

.monitoring-list{
    display:flex;
    flex-direction:column;
}

.monitoring-list > div{
    padding:8px 0;
    display:flex;
    align-items:center;
    justify-content:space-between;
    gap:12px;
    border-bottom:1px solid #eef2f7;
    color:#64748b;
    font-size:9px;
}

.monitoring-list > div:last-child{
    border-bottom:none;
}

.monitoring-list strong{
    color:#0f172a;
}

.monitoring-list strong.warning{
    color:#dc2626;
}

.question-navigator{
    display:grid;
    grid-template-columns:repeat(5,minmax(0,1fr));
    gap:6px;
}

.question-navigator button{
    aspect-ratio:1;
    min-width:0;
    border:1px solid #cbd5e1;
    border-radius:9px;
    background:#f8fafc;
    color:#334155;
    font-size:8px;
}

.question-navigator button.current{
    border-color:#16a34a;
    background:#16a34a;
    color:#ffffff;
}

.question-navigator button.answered:not(.current){
    border-color:#86efac;
    background:#f0fdf4;
    color:#15803d;
}

.sidebar-submit-btn{
    width:100%;
}

/* ==========================================
   WARNING / MODAL
========================================== */

.security-warning{
    position:fixed;
    right:18px;
    bottom:
        max(18px,env(safe-area-inset-bottom));
    z-index:2000;
    width:min(calc(100% - 36px),430px);
    padding:14px;
    display:flex;
    align-items:flex-start;
    gap:12px;
    border:1px solid #fecaca;
    border-radius:15px;
    background:#ffffff;
    box-shadow:0 16px 40px rgba(15,23,42,.2);
}

.warning-icon{
    flex:0 0 38px;
    width:38px;
    height:38px;
    display:flex;
    align-items:center;
    justify-content:center;
    border-radius:50%;
    background:#fee2e2;
}

.security-warning h3{
    margin-bottom:3px;
    color:#b91c1c;
    font-size:12px;
}

.security-warning p{
    color:#64748b;
    font-size:9px;
    line-height:1.5;
}

.modal-overlay{
    position:fixed;
    inset:0;
    z-index:3000;
    padding:
        max(16px,env(safe-area-inset-top))
        16px
        max(16px,env(safe-area-inset-bottom));
    display:flex;
    align-items:center;
    justify-content:center;
    overflow-y:auto;
    background:rgba(15,23,42,.64);
    backdrop-filter:blur(7px);
    -webkit-backdrop-filter:blur(7px);
}

.modal-card{
    width:min(100%,440px);
    max-height:calc(100dvh - 32px);
    padding:26px;
    overflow-y:auto;
    border-radius:20px;
    background:#ffffff;
    text-align:center;
    box-shadow:0 22px 55px rgba(15,23,42,.3);
}

.modal-icon,
.submit-icon{
    margin-bottom:10px;
    font-size:38px;
}

.modal-card h2{
    margin-bottom:7px;
    font-size:20px;
}

.modal-card > p{
    color:#64748b;
    font-size:11px;
    line-height:1.65;
}

.submit-summary{
    margin:16px 0;
    display:grid;
    grid-template-columns:repeat(2,minmax(0,1fr));
    gap:9px;
}

.submit-summary > div{
    padding:12px;
    border-radius:11px;
    background:#f8fafc;
}

.submit-summary span{
    display:block;
    color:#64748b;
    font-size:8px;
}

.submit-summary strong{
    font-size:16px;
}

.unanswered-warning{
    margin-bottom:14px;
    padding:10px;
    border-radius:10px;
    background:#fff7ed;
    color:#c2410c;
    font-size:9px;
}

.modal-actions{
    display:grid;
    grid-template-columns:repeat(2,minmax(0,1fr));
    gap:9px;
}

/* ==========================================
   LAPTOP: SMALLER
========================================== */

@media(min-width:1100px){
    .exam-layout{
        width:min(100%,1120px);
        grid-template-columns:minmax(0,1fr) 250px;
        padding-top:18px;
    }

    .question-card{
        padding:19px;
    }

    .question-content h2{
        font-size:27px;
    }

    .answer-option{
        min-height:54px;
    }

    .sidebar-card{
        padding:13px;
    }
}

/* ==========================================
   IPAD LANDSCAPE / SMALL LAPTOP
========================================== */

@media(max-width:1099px) and (min-width:821px){
    .exam-header{
        padding-left:20px;
        padding-right:20px;
    }

    .exam-layout{
        width:min(100%,980px);
        grid-template-columns:minmax(0,1fr) 235px;
        padding:16px;
        gap:13px;
    }

    .question-card{
        padding:18px;
    }

    .question-content h2{
        font-size:24px;
    }

    .answer-option{
        min-height:52px;
        padding:8px 11px;
    }

    .option-letter{
        flex-basis:35px;
        width:35px;
        height:35px;
    }

    .sidebar-card{
        padding:12px;
    }
}

/* ==========================================
   IPAD PORTRAIT / TABLET
   Entire page remains vertically scrollable
========================================== */

@media(max-width:820px){
    .exam-header{
        padding-left:16px;
        padding-right:16px;
    }

    .exam-layout{
        width:min(100%,720px);
        padding:15px 14px 30px;
        grid-template-columns:1fr;
    }

    .question-card{
        padding:18px;
    }

    .question-content h2{
        font-size:24px;
    }

    .exam-sidebar{
        display:grid;
        grid-template-columns:repeat(2,minmax(0,1fr));
    }

    .student-profile{
        grid-column:1 / -1;
    }

    .sidebar-submit-btn{
        grid-column:1 / -1;
    }
}

/* ==========================================
   MOBILE / IOS SAFARI / ANDROID
========================================== */

@media(max-width:600px){
    .exam-header{
        padding:
            max(12px,env(safe-area-inset-top))
            12px
            12px;
        flex-direction:column;
        align-items:stretch;
        gap:13px;
    }

    .header-logo{
        flex-basis:48px;
        width:48px;
        height:48px;
    }

    .portal-label{
        font-size:8px;
    }

    .exam-brand h1{
        font-size:16px;
        white-space:normal;
    }

    .exam-brand span{
        font-size:10px;
    }

    .header-status{
        width:100%;
        display:grid;
        grid-template-columns:minmax(0,1fr) minmax(126px,.72fr);
        gap:9px;
    }

    .connection-status{
        min-width:0;
        min-height:50px;
        padding:9px;
        font-size:11px;
    }

    .timer-card{
        min-width:0;
        min-height:58px;
        padding:8px;
    }

    .timer-card strong{
        font-size:22px;
    }

    .progress-header{
        padding:11px 12px 12px;
    }

    .exam-layout{
        width:100%;
        padding:
            10px
            9px
            max(24px,env(safe-area-inset-bottom));
    }

    .question-card{
        padding:14px;
        border-radius:17px;
    }

    /* All question details stay in one horizontal line */
    .question-header,
    .question-info-row{
        width:100%;
        padding-bottom:11px;
        display:flex;
        align-items:center;
        justify-content:flex-start;
        flex-wrap:nowrap;
        gap:5px;
        overflow:hidden;
    }

    .question-number,
    .question-type,
    .question-detail-badge{
        width:auto;
        min-width:0;
        max-width:none;
        padding:6px 8px;
        display:inline-flex;
        align-items:center;
        justify-content:center;
        flex:0 1 auto;
        overflow:hidden;
        border-radius:999px;
        font-size:8px;
        line-height:1.1;
        text-overflow:ellipsis;
        white-space:nowrap;
    }

    .question-number{
        flex-shrink:0;
    }

    .question-type{
        max-width:110px;
    }

    .question-detail-badge{
        flex-shrink:1;
    }

    .question-header .question-detail-badge:first-of-type{
        grid-column:auto;
    }

    .question-content{
        margin-top:16px;
    }

    .question-content h2{
        margin-bottom:18px;
        font-size:clamp(20px,5.7vw,25px);
        line-height:1.24;
    }

    .answer-options{
        gap:8px;
    }

    .answer-option{
        min-height:56px;
        padding:8px 10px;
        gap:10px;
        border-radius:13px;
    }

    .option-letter{
        flex-basis:36px;
        width:36px;
        height:36px;
        border-radius:10px;
        font-size:12px;
    }

    .option-text{
        font-size:13px;
    }

    .saving-status{
        margin-top:12px;
    }

    .navigation-buttons{
        position:relative;
        bottom:auto;
        margin-top:10px;
        padding:
            8px
            0
            max(8px,env(safe-area-inset-bottom));
    }

    .navigation-buttons button{
        min-height:43px;
        padding:9px 7px;
        font-size:9px;
    }

    .exam-sidebar{
        display:flex;
        flex-direction:column;
    }

    .sidebar-card{
        padding:13px;
    }

    .question-navigator{
        grid-template-columns:repeat(5,minmax(0,1fr));
    }

    .security-warning{
        right:10px;
        bottom:max(10px,env(safe-area-inset-bottom));
        width:calc(100% - 20px);
    }
}

/* ==========================================
   VERY SMALL PHONES
========================================== */

@media(max-width:370px){
    .exam-header{
        padding-left:9px;
        padding-right:9px;
    }

    .exam-layout{
        padding-left:7px;
        padding-right:7px;
    }

    .question-card{
        padding:12px;
    }

    .question-content h2{
        font-size:19px;
    }

    .option-text{
        font-size:12px;
    }

    .question-number,
    .question-type,
    .question-detail-badge{
        font-size:8px;
    }
}

/* ==========================================
   REDUCED MOTION
========================================== */

@media(prefers-reduced-motion:reduce){
    *,
    *::before,
    *::after{
        animation-duration:.01ms !important;
        animation-iteration-count:1 !important;
        transition-duration:.01ms !important;
        scroll-behavior:auto !important;
    }
}

@keyframes spin{
    to{
        transform:rotate(360deg);
    }
}

/* ==========================================
   REMOVE NESTED PAGE SCROLL CONTAINERS
========================================== */

.exam-header,
.progress-header,
.exam-layout,
.question-section,
.question-card,
.question-content,
.exam-sidebar{

    max-height:none;

    overflow:visible;

}


</style>
