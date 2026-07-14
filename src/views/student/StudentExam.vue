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
            <div class="question-header">
              <div>
                <span class="question-number">
                  Question {{ currentQuestionIndex + 1 }}
                </span>

                <span class="question-type">
                  {{ displayQuestionType(currentQuestion?.question_type) }}
                </span>
              </div>

              <div class="question-meta">
                <span>
                  {{ currentQuestion?.points || 1 }}
                  {{ Number(currentQuestion?.points || 1) === 1 ? 'point' : 'points' }}
                </span>

                <span v-if="currentQuestion?.time_limit">
                  ⏱ {{ currentQuestion.time_limit }} seconds
                </span>
              </div>
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
              :disabled="currentQuestionIndex === 0"
              @click="previousQuestion"
            >
              ← Previous
            </button>

            <button
              v-if="currentQuestionIndex < questions.length - 1"
              class="primary-btn"
              type="button"
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
          <h2>Time Is Up</h2>
          <p>Your examination is being submitted automatically.</p>
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

  window.addEventListener('blur', handleWindowBlur)
  window.addEventListener('online', handleOnline)
  window.addEventListener('offline', handleOffline)
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

  window.removeEventListener('blur', handleWindowBlur)
  window.removeEventListener('online', handleOnline)
  window.removeEventListener('offline', handleOffline)
}

function cleanupIntervals() {
  if (examTimerInterval) {
    clearInterval(examTimerInterval)
  }

  if (idleInterval) {
    clearInterval(idleInterval)
  }

  if (heartbeatInterval) {
    clearInterval(heartbeatInterval)
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

  await loadExam()

  heartbeatInterval = setInterval(() => {
    sendLiveStatus()
  }, 3000)
})

onUnmounted(() => {
  cleanupIntervals()
  removeEventListeners()

  window.removeEventListener(
    'beforeunload',
    handleBeforeUnload
  )
})
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap');

*{
  margin:0;
  padding:0;
  box-sizing:border-box;
  font-family:'Poppins',sans-serif;
}

.exam-page{
  min-height:100vh;
  background:#f3f7f5;
  color:#0f172a;
  user-select:none;
  -webkit-user-select:none;
}

.state-screen{
  min-height:100vh;
  padding:24px;
  display:flex;
  justify-content:center;
  align-items:center;
  background:#064e3b;
}

.state-card,
.modal-card{
  width:min(100%,500px);
  padding:34px;
  border-radius:23px;
  text-align:center;
  background:#ffffff;
  box-shadow:0 28px 70px rgba(0,0,0,.32);
}

.state-card h2,
.modal-card h2{
  margin-bottom:10px;
}

.state-card p,
.modal-card p{
  color:#64748b;
  line-height:1.7;
  font-size:13px;
}

.loader{
  width:52px;
  height:52px;
  margin:0 auto 20px;
  border:5px solid #dcfce7;
  border-top-color:#16a34a;
  border-radius:50%;
  animation:spin .8s linear infinite;
}

.exam-header{
  position:sticky;
  top:0;
  z-index:100;
  min-height:84px;
  padding:14px 28px;
  display:flex;
  justify-content:space-between;
  align-items:center;
  gap:22px;
  background:#ffffff;
  border-bottom:1px solid #dfe8e3;
}

.exam-brand{
  min-width:0;
  display:flex;
  align-items:center;
  gap:15px;
}

.header-logo{
  width:58px;
  height:58px;
  padding:5px;
  object-fit:contain;
  border-radius:15px;
  background:#f0fdf4;
}

.portal-label{
  color:#16a34a;
  font-size:10px;
  font-weight:800;
  letter-spacing:1.5px;
}

.exam-brand h1{
  max-width:620px;
  overflow:hidden;
  text-overflow:ellipsis;
  white-space:nowrap;
  font-size:22px;
}

.exam-brand span{
  color:#64748b;
  font-size:12px;
}

.header-status{
  display:flex;
  align-items:center;
  gap:14px;
}

.connection-status{
  min-width:112px;
  padding:9px 13px;
  display:flex;
  justify-content:center;
  align-items:center;
  gap:8px;
  border-radius:999px;
  background:#dcfce7;
  color:#15803d;
  font-size:11px;
  font-weight:800;
}

.connection-status.disconnected{
  background:#fee2e2;
  color:#b91c1c;
}

.connection-dot{
  width:9px;
  height:9px;
  border-radius:50%;
  background:currentColor;
}

.timer-card{
  min-width:150px;
  padding:10px 16px;
  text-align:center;
  border-radius:13px;
  background:#0f172a;
  color:#ffffff;
}

.timer-card small{
  display:block;
  font-size:9px;
  color:#cbd5e1;
}

.timer-card strong{
  font-size:22px;
}

.timer-card.urgent{
  background:#dc2626;
}

.progress-header{
  padding:15px 28px;
  background:#ffffff;
  border-bottom:1px solid #e2e8f0;
}

.progress-details{
  margin-bottom:9px;
  display:flex;
  justify-content:space-between;
  color:#64748b;
  font-size:12px;
}

.progress-details strong{
  color:#15803d;
}

.main-progress{
  height:10px;
  overflow:hidden;
  border-radius:999px;
  background:#e2e8f0;
}

.main-progress-fill{
  height:100%;
  background:#16a34a;
  transition:width .3s ease;
}

.exam-layout{
  width:min(100%,1500px);
  margin:0 auto;
  padding:26px 28px 34px;
  display:grid;
  grid-template-columns:minmax(0,1fr) 320px;
  gap:24px;
}

.question-card{
  min-height:500px;
  padding:28px;
  border:1px solid #e2e8f0;
  border-radius:22px;
  background:#ffffff;
}

.question-header{
  padding-bottom:20px;
  display:flex;
  justify-content:space-between;
  gap:20px;
  border-bottom:1px solid #e2e8f0;
}

.question-header > div:first-child{
  display:flex;
  flex-wrap:wrap;
  gap:10px;
}

.question-number,
.question-type{
  padding:8px 14px;
  border-radius:999px;
  font-size:11px;
  font-weight:800;
}

.question-number{
  background:#dcfce7;
  color:#15803d;
}

.question-type{
  background:#eff6ff;
  color:#1d4ed8;
}

.question-meta{
  display:flex;
  flex-wrap:wrap;
  gap:10px;
}

.question-meta span{
  padding:7px 11px;
  border-radius:9px;
  background:#f8fafc;
  color:#64748b;
  font-size:10px;
}

.question-content{
  padding:30px 0 18px;
}

.question-content h2{
  margin-bottom:28px;
  font-size:25px;
  line-height:1.55;
}

.answer-options{
  display:flex;
  flex-direction:column;
  gap:14px;
}

.answer-option{
  position:relative;
  min-height:64px;
  padding:13px 50px 13px 14px;
  display:flex;
  align-items:center;
  gap:15px;
  border:2px solid #e2e8f0;
  border-radius:15px;
  background:#f8fafc;
  cursor:pointer;
}

.answer-option.selected{
  border-color:#16a34a;
  background:#f0fdf4;
}

.answer-option input{
  position:absolute;
  opacity:0;
}

.option-letter{
  flex:0 0 39px;
  width:39px;
  height:39px;
  display:flex;
  justify-content:center;
  align-items:center;
  border-radius:11px;
  border:1px solid #cbd5e1;
  background:#fff;
  font-weight:800;
}

.answer-option.selected .option-letter{
  background:#16a34a;
  color:#fff;
}

.selected-icon{
  position:absolute;
  right:17px;
  opacity:0;
  color:#16a34a;
}

.answer-option.selected .selected-icon{
  opacity:1;
}

.true-false-options{
  display:grid;
  grid-template-columns:repeat(2,1fr);
}

.text-answer label{
  display:block;
  margin-bottom:10px;
  font-weight:700;
}

.text-answer input,
.text-answer textarea{
  width:100%;
  padding:15px 16px;
  border:1px solid #cbd5e1;
  border-radius:13px;
  outline:none;
  background:#f8fafc;
  user-select:text;
  -webkit-user-select:text;
}

.text-answer textarea{
  min-height:210px;
  resize:vertical;
}

.essay-footer{
  margin-top:8px;
  display:flex;
  justify-content:space-between;
  color:#64748b;
  font-size:10px;
}

.saving-status{
  min-height:24px;
  margin-top:20px;
  color:#94a3b8;
  font-size:11px;
}

.saved{
  color:#15803d;
  font-weight:700;
}

.navigation-buttons{
  margin-top:18px;
  display:flex;
  justify-content:space-between;
  gap:14px;
}

.primary-btn,
.secondary-btn,
.submit-btn{
  min-height:48px;
  padding:12px 22px;
  border:none;
  border-radius:11px;
  display:inline-flex;
  justify-content:center;
  align-items:center;
  font-size:13px;
  font-weight:800;
  cursor:pointer;
}

.primary-btn{
  background:#16a34a;
  color:#fff;
}

.secondary-btn{
  background:#e2e8f0;
  color:#334155;
}

.submit-btn{
  background:#dc2626;
  color:#fff;
}

.full-btn{
  width:100%;
  margin-top:22px;
}

.text-btn{
  margin-top:12px;
  border:none;
  background:transparent;
  color:#64748b;
  cursor:pointer;
}

.exam-sidebar{
  position:sticky;
  top:120px;
  display:flex;
  flex-direction:column;
  gap:16px;
}

.sidebar-card{
  padding:19px;
  border:1px solid #e2e8f0;
  border-radius:17px;
  background:#fff;
}

.student-profile{
  display:flex;
  align-items:center;
  gap:13px;
}

.profile-avatar{
  width:48px;
  height:48px;
  display:flex;
  justify-content:center;
  align-items:center;
  border-radius:50%;
  background:#dcfce7;
  color:#15803d;
  font-weight:800;
}

.student-profile strong{
  display:block;
}

.student-profile span{
  color:#64748b;
  font-size:11px;
}

.sidebar-title{
  margin-bottom:15px;
  display:flex;
  justify-content:space-between;
  align-items:center;
}

.monitoring-badge{
  padding:6px 10px;
  border-radius:999px;
  background:#dcfce7;
  color:#15803d;
  font-size:9px;
  font-weight:800;
}

.monitoring-list > div{
  padding:9px 0;
  display:flex;
  justify-content:space-between;
  border-bottom:1px solid #f1f5f9;
  color:#64748b;
  font-size:11px;
}

.warning{
  color:#dc2626;
}

.question-navigator{
  display:grid;
  grid-template-columns:repeat(5,1fr);
  gap:8px;
}

.question-navigator button{
  aspect-ratio:1;
  border:1px solid #cbd5e1;
  border-radius:9px;
  background:#f8fafc;
  cursor:pointer;
}

.question-navigator button.answered{
  background:#dcfce7;
  color:#15803d;
}

.question-navigator button.current{
  background:#16a34a;
  color:#fff;
}

.sidebar-submit-btn{
  width:100%;
  min-height:49px;
  border:none;
  border-radius:12px;
  background:#dc2626;
  color:#fff;
  font-weight:800;
  cursor:pointer;
}

.security-warning{
  position:fixed;
  right:22px;
  bottom:22px;
  z-index:1000;
  width:min(430px,calc(100% - 30px));
  padding:15px;
  display:flex;
  gap:12px;
  border:1px solid #fecaca;
  border-radius:14px;
  background:#fff;
  box-shadow:0 18px 45px rgba(0,0,0,.2);
}

.warning-icon{
  width:38px;
  height:38px;
  display:flex;
  justify-content:center;
  align-items:center;
  border-radius:50%;
  background:#fee2e2;
  color:#dc2626;
}

.security-warning button{
  margin-left:auto;
  border:none;
  background:transparent;
}

.modal-overlay{
  position:fixed;
  inset:0;
  z-index:2000;
  padding:20px;
  display:flex;
  justify-content:center;
  align-items:center;
  background:rgba(2,44,34,.8);
}

.modal-icon{
  width:68px;
  height:68px;
  margin:0 auto 17px;
  display:flex;
  justify-content:center;
  align-items:center;
  border-radius:50%;
  background:#dcfce7;
  color:#15803d;
  font-size:30px;
}

.submit-icon{
  background:#fee2e2;
  color:#dc2626;
}

.submit-summary{
  margin-top:23px;
  display:grid;
  grid-template-columns:repeat(3,1fr);
  gap:10px;
}

.submit-summary div{
  padding:13px 8px;
  border-radius:11px;
  background:#f8fafc;
}

.unanswered-warning{
  margin-top:15px;
  padding:11px;
  border:1px solid #fed7aa;
  border-radius:10px;
  background:#fff7ed;
  color:#c2410c;
}

.modal-actions{
  margin-top:23px;
  display:grid;
  grid-template-columns:1fr 1fr;
  gap:12px;
}

@keyframes spin{
  to{
    transform:rotate(360deg);
  }
}

@media(max-width:900px){
  .exam-header{
    position:relative;
    flex-direction:column;
    align-items:stretch;
  }

  .exam-layout{
    grid-template-columns:1fr;
  }

  .exam-sidebar{
    position:static;
    display:grid;
    grid-template-columns:repeat(2,1fr);
  }

  .student-profile,
  .sidebar-submit-btn{
    grid-column:1 / -1;
  }
}

@media(max-width:600px){
  .exam-header{
    padding:12px 14px;
  }

  .exam-brand h1{
    font-size:17px;
    white-space:normal;
  }

  .header-status{
    gap:8px;
  }

  .connection-status,
  .timer-card{
    flex:1;
    min-width:0;
  }

  .progress-header{
    padding:12px 14px;
  }

  .exam-layout{
    padding:14px;
  }

  .question-card{
    min-height:auto;
    padding:17px;
  }

  .question-header{
    flex-direction:column;
  }

  .question-content h2{
    font-size:19px;
  }

  .true-false-options{
    grid-template-columns:1fr;
  }

  .navigation-buttons{
    flex-direction:column-reverse;
  }

  .navigation-buttons button{
    width:100%;
  }

  .exam-sidebar{
    grid-template-columns:1fr;
  }

  .student-profile,
  .sidebar-submit-btn{
    grid-column:auto;
  }

  .question-navigator{
    grid-template-columns:repeat(6,1fr);
  }

  .submit-summary,
  .modal-actions{
    grid-template-columns:1fr;
  }

  .security-warning{
    left:12px;
    right:12px;
    bottom:12px;
    width:auto;
  }
}
</style>
