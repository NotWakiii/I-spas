<template>
  <div class="dashboard">
    <!-- ================= HEADER ================= -->
    <div class="dashboard-header">
      <div>
        <h1>Faculty Dashboard</h1>
        <p>Welcome back! Manage your examinations and quizzes.</p>
      </div>
      <button class="new-exam-btn" @click="goToCreateExam">
        <Plus :size="18" />
        <span>New Exam</span>
      </button>
    </div>
    <!-- ================= STATS ================= -->
    <div class="stats">
      <div class="card">
        <div class="stat-icon">
          <FileText :size="22" />
        </div>
        <div>
          <span>Total Exams</span>
          <h2>{{ totalExams }}</h2>
        </div>
      </div>
      <div class="card">
        <div class="stat-icon">
          <Send :size="22" />
        </div>
        <div>
          <span>Published</span>
          <h2>{{ totalPublished }}</h2>
        </div>
      </div>
      <div class="card">
        <div class="stat-icon">
          <FilePenLine :size="22" />
        </div>
        <div>
          <span>Drafts</span>
          <h2>{{ totalDrafts }}</h2>
        </div>
      </div>
      <div class="card">
        <div class="stat-icon">
          <CircleCheckBig :size="22" />
        </div>
        <div>
          <span>Exam Finished</span>
          <h2>{{ totalFinished }}</h2>
        </div>
      </div>
    </div>
    <!-- ================= EXAM SECTION ================= -->
    <div class="exam-section">
      <div class="exam-header">
        <div>
          <h2>Examinations</h2>
          <p>View and manage all examinations.</p>
        </div>
        <div class="filters">
          <div class="search-box">
            <Search :size="17" />
            <input
              v-model="search"
              type="text"
              placeholder="Search examination..."
            >
          </div>
          <select v-model="selectedSubject">
            <option value="All Subjects">
              All Subjects
            </option>
            <option
              v-for="subject in subjects"
              :key="subject"
              :value="subject"
            >
              {{ subject }}
            </option>
          </select>
        </div>
      </div>
      <!-- ================= EXAM CARDS ================= -->
      <div v-if="filteredExams.length">
        <div
          v-for="exam in filteredExams"
          :key="exam.id"
          class="exam-card"
        >
          <div class="exam-title">
            <div>
              <h3>{{ exam.title }}</h3>
              <span
                class="badge"
                :class="{
                  published: exam.status === 'Published',
                  draft: exam.status === 'Draft',
                  finished: exam.status === 'Finished',
                  started: exam.status === 'Started'
                }"
              >
                {{ exam.status }}
              </span>
            </div>
            <div class="buttons">
              <button
                class="edit"
                @click="editExam(exam.id)"
              >
                <Pencil :size="15" />
                <span>Edit</span>
              </button>
              <button
                class="preview"
                @click="previewExam(exam)"
              >
                <Eye :size="15" />
                <span>Preview</span>
              </button>
              <button
                v-if="exam.status === 'Draft'"
                class="publish-btn"
                @click="publishExam(exam)"
              >
                <Send :size="15" />
                <span>Publish</span>
              </button>
              <button
                v-else-if="exam.status === 'Published'"
                class="start-btn"
                @click="startExam(exam)"
              >
                <Play :size="15" />
                <span>Start Exam</span>
              </button>
              <button
                v-else-if="exam.status === 'Finished'"
                class="start-btn"
                @click="startAgain(exam)"
              >
                <RotateCcw :size="15" />
                <span>Start Again</span>
              </button>
              <button
                class="delete"
                @click="deleteExam(exam)"
              >
                <Trash2 :size="15" />
                <span>Delete</span>
              </button>
            </div>
          </div>
          <!-- ================= EXAM INFO ================= -->
          <div class="exam-info">
            <div>
              <GraduationCap :size="18" class="info-icon" />
              <small>Grade</small>
              <strong>{{ exam.grade }}</strong>
            </div>
            <div>
              <Layers3 :size="18" class="info-icon" />
              <small>Section</small>
              <strong>{{ exam.section }}</strong>
            </div>
            <div>
              <BookOpen :size="18" class="info-icon" />
              <small>Subject</small>
              <strong>{{ exam.subject }}</strong>
            </div>
            <div>
              <Clock3 :size="18" class="info-icon" />
              <small>Duration</small>
              <strong>{{ exam.duration }} mins</strong>
            </div>
            <div>
              <ListChecks :size="18" class="info-icon" />
              <small>Questions</small>
              <strong>{{ exam.items }}</strong>
            </div>
            <div>
              <Target :size="18" class="info-icon" />
              <small>Points</small>
              <strong>{{ exam.points }}</strong>
            </div>
            <div>
              <CircleCheckBig :size="18" class="info-icon" />
              <small>Passing</small>
              <strong>{{ exam.passing }}%</strong>
            </div>
            <div>
              <Users :size="18" class="info-icon" />
              <small>Students</small>
              <strong>{{ exam.students }}</strong>
            </div>
            <div>
              <CalendarDays :size="18" class="info-icon" />
              <small>Created</small>
              <strong>{{ exam.created }}</strong>
            </div>
          </div>
        </div>
      </div>
      <div v-else class="empty">
        <FileSearch :size="45" />
        <h2>No examinations found</h2>
        <p>Try another search or subject.</p>
      </div>
    </div>
    <!-- ================= PREVIEW POPUP ================= -->
    <div
      v-if="showPreview"
      class="preview-overlay"
      @click.self="closePreview"
    >
      <div class="preview-modal">
        <div class="preview-header">
          <div>
            <h2>{{ selectedExam.title }}</h2>
            <p>Student Preview</p>
          </div>
          <button class="close-btn" @click="closePreview">
            <X :size="16" />
            <span>Close</span>
          </button>
        </div>
        <div class="preview-info">
          <div>
            <Clock3 :size="18" class="info-icon" />
            <small>Duration</small>
            <strong>{{ selectedExam.duration }} mins</strong>
          </div>
          <div>
            <ListChecks :size="18" class="info-icon" />
            <small>Questions</small>
            <strong>{{ selectedExam.questions.length }}</strong>
          </div>
          <div>
            <Target :size="18" class="info-icon" />
            <small>Passing</small>
            <strong>{{ selectedExam.passing }}%</strong>
          </div>
        </div>
        <div
          v-for="(questionItem, index) in selectedExam.questions"
          :key="questionItem.id"
          v-show="previewQuestion === index + 1"
          class="question-preview"
        >
          <h3>Question {{ index + 1 }}</h3>
          <p>{{ questionItem.question }}</p>
          <div
            v-if="questionItem.question_type === 'multiple_choice'"
          >
            <div
              v-for="option in questionItem.options"
              :key="option.id"
              class="option"
            >
              {{ option.option_text }}
            </div>
          </div>
          <div v-else class="option">
            Answer:
            {{ questionItem.answer || 'No answer provided' }}
          </div>
        </div>
        <div class="preview-footer">
          <button
            class="nav-btn"
            :disabled="previewQuestion <= 1"
            @click="previousQuestion"
          >
            <ChevronLeft :size="17" />
            <span>Previous</span>
          </button>
          <span>
            Question {{ previewQuestion }}
            of {{ selectedExam.items }}
          </span>
          <button
            class="nav-btn"
            :disabled="
              previewQuestion >=
              selectedExam.questions.length
            "
            @click="nextQuestion"
          >
            <span>Next</span>
            <ChevronRight :size="17" />
          </button>
        </div>
      </div>
    </div>
    <!-- ================= START EXAM DIALOG ================= -->
    <div
      v-if="showStartDialog"
      class="dialog-overlay"
    >
      <div class="dialog">
        <div class="dialog-icon">
          <Play :size="45" />
        </div>
        <h2>Start Examination?</h2>
        <p>
          Are you sure you want to start this examination?
          <br><br>
          You will be redirected to the Monitoring Lobby where students
          can join using the generated access code.
        </p>
        <div
          v-if="selectedStartExam"
          class="dialog-info"
        >
          <div>
            <FileText :size="18" class="info-icon" />
            <small>Examination</small>
            <strong>{{ selectedStartExam.title }}</strong>
          </div>
          <div>
            <GraduationCap :size="18" class="info-icon" />
            <small>Grade</small>
            <strong>{{ selectedStartExam.grade }}</strong>
          </div>
          <div>
            <Layers3 :size="18" class="info-icon" />
            <small>Section</small>
            <strong>{{ selectedStartExam.section }}</strong>
          </div>
          <div>
            <BookOpen :size="18" class="info-icon" />
            <small>Subject</small>
            <strong>{{ selectedStartExam.subject }}</strong>
          </div>
          <div>
            <Clock3 :size="18" class="info-icon" />
            <small>Duration</small>
            <strong>{{ selectedStartExam.duration }} mins</strong>
          </div>
          <div>
            <ListChecks :size="18" class="info-icon" />
            <small>Questions</small>
            <strong>{{ selectedStartExam.items }}</strong>
          </div>
        </div>
        <div class="dialog-buttons">
          <button
            class="cancel-btn"
            @click="cancelStartExam"
          >
            <X :size="17" />
            <span>Cancel</span>
          </button>
          <button
            class="start-btn"
            @click="confirmStartExam"
          >
            <Play :size="17" />
            <span>Start Exam</span>
          </button>
        </div>
      </div>
    </div>
    <!-- ================= ACTION CONFIRMATION ================= -->
    <div
      v-if="showActionDialog"
      class="dialog-overlay"
      @click.self="closeActionDialog"
    >
      <div class="dialog action-dialog">
        <div
          class="action-dialog-icon"
          :class="actionDialogType"
        >
          <Send
            v-if="actionDialogType === 'publish'"
            :size="34"
          />
          <RotateCcw
            v-else-if="actionDialogType === 'restart'"
            :size="34"
          />
          <Trash2
            v-else
            :size="34"
          />
        </div>
        <h2>{{ actionDialogTitle }}</h2>
        <p>{{ actionDialogMessage }}</p>
        <div
          v-if="selectedActionExam"
          class="action-exam-info"
        >
          <strong>{{ selectedActionExam.title }}</strong>
          <span>
            Grade {{ selectedActionExam.grade }}
            • {{ selectedActionExam.section }}
            • {{ selectedActionExam.subject }}
          </span>
        </div>
        <div class="dialog-buttons">
          <button
            class="cancel-btn"
            :disabled="processingAction"
            @click="closeActionDialog"
          >
            <X :size="17" />
            <span>Cancel</span>
          </button>
          <button
            class="action-confirm-btn"
            :class="actionDialogType"
            :disabled="processingAction"
            @click="confirmAction"
          >
            <LoaderCircle
              v-if="processingAction"
              :size="17"
              class="spin"
            />
            <Send
              v-else-if="actionDialogType === 'publish'"
              :size="17"
            />
            <RotateCcw
              v-else-if="actionDialogType === 'restart'"
              :size="17"
            />
            <Trash2
              v-else
              :size="17"
            />
            <span>
              {{
                processingAction
                  ? 'Processing...'
                  : actionConfirmText
              }}
            </span>
          </button>
        </div>
      </div>
    </div>
    <!-- ================= SYSTEM NOTIFICATION ================= -->
    <Transition name="notification">
      <div
        v-if="notification.show"
        class="notification-container"
        :class="notification.type"
      >
        <div class="notification-icon">
          <CircleCheckBig
            v-if="notification.type === 'success'"
            :size="20"
          />
          <CircleAlert
            v-else-if="notification.type === 'error'"
            :size="20"
          />
          <Info
            v-else
            :size="20"
          />
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
          <X :size="17" />
        </button>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import {
  ref,
  computed,
  onMounted
} from 'vue'
import {
  useRouter
} from 'vue-router'
import api from '../services/api'
import {
  Plus,
  FileText,
  Send,
  FilePenLine,
  CircleCheckBig,
  Search,
  Pencil,
  Eye,
  Play,
  RotateCcw,
  Trash2,
  Clock3,
  ListChecks,
  Target,
  Users,
  CalendarDays,
  GraduationCap,
  BookOpen,
  Layers3,
  X,
  ChevronLeft,
  ChevronRight,
  FileSearch,
  CircleAlert,
  Info,
  LoaderCircle
} from '@lucide/vue'

const router =
  useRouter()

// ===========================================
// TYPES
// ===========================================

type NotificationType =
  'success' |
  'error' |
  'info'

type ActionDialogType =
  'publish' |
  'restart' |
  'delete'

// ===========================================
// SEARCH & FILTER
// ===========================================

const search =
  ref('')

const selectedSubject =
  ref(
    'All Subjects'
  )

// ===========================================
// NOTIFICATION
// ===========================================

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

// ===========================================
// PREVIEW POPUP
// ===========================================

const showPreview =
  ref(false)

const previewQuestion =
  ref(1)

const selectedExam =
  ref({
    id: 0,
    title: '',
    grade: '',
    section: '',
    subject: '',
    status: '',
    duration: 0,
    items: 0,
    points: 0,
    passing: 0,
    students: '',
    questions: [] as any[],
    created: ''
  })

// ===========================================
// START EXAM POPUP
// ===========================================

const showStartDialog =
  ref(false)

const selectedStartExam =
  ref<any>(null)

// ===========================================
// ACTION DIALOG
// ===========================================

const showActionDialog =
  ref(false)

const selectedActionExam =
  ref<any>(null)

const actionDialogType =
  ref<ActionDialogType>(
    'publish'
  )

const processingAction =
  ref(false)

const actionDialogTitle =
  computed(() => {
    if (
      actionDialogType.value ===
      'publish'
    ) {
      return 'Publish Examination?'
    }

    if (
      actionDialogType.value ===
      'restart'
    ) {
      return 'Start Examination Again?'
    }

    return 'Delete Examination?'
  })

const actionDialogMessage =
  computed(() => {
    if (
      actionDialogType.value ===
      'publish'
    ) {
      return 'Once published, students will be able to access the examination using its access code.'
    }

    if (
      actionDialogType.value ===
      'restart'
    ) {
      return 'The examination will become available again and a new access code will be generated for remedial or late students.'
    }

    return 'Are you sure you want to permanently delete this examination? This action cannot be undone.'
  })

const actionConfirmText =
  computed(() => {
    if (
      actionDialogType.value ===
      'publish'
    ) {
      return 'Publish'
    }

    if (
      actionDialogType.value ===
      'restart'
    ) {
      return 'Start Again'
    }

    return 'Delete'
  })

function openActionDialog(
  type: ActionDialogType,
  exam: any
) {
  actionDialogType.value =
    type

  selectedActionExam.value =
    exam

  showActionDialog.value =
    true
}

function closeActionDialog() {
  if (
    processingAction.value
  ) {
    return
  }

  showActionDialog.value =
    false

  selectedActionExam.value =
    null
}

// ===========================================
// EXAMS
// ===========================================

const exams =
  ref<any[]>([])

const loading =
  ref(false)

// ===========================================
// FETCH EXAMS
// ===========================================

async function fetchExams() {
  loading.value =
    true

  try {
    const response =
      await api.get(
        '/exams'
      )

    exams.value =
      response.data.data.map(
        (exam: any) => {
          const questions =
            exam.questions || []

          return {
            id:
              exam.id,
            title:
              exam.title,
            grade:
              exam.grade ||
              'No Grade',
            section:
              exam.section ||
              'No Section',
            subject:
              exam.subject ||
              'No Subject',
            status:
              exam.status ===
                'draft'
                ? 'Draft'
                : exam.status ===
                    'published'
                  ? 'Published'
                  : exam.status ===
                      'started'
                    ? 'Started'
                    : exam.status ===
                        'finished'
                      ? 'Finished'
                      : exam.status,
            duration:
              exam.duration,
            items:
              questions.length,
            points:
              questions.reduce(
                (
                  sum: number,
                  questionItem: any
                ) =>
                  sum +
                  Number(
                    questionItem.points ||
                    0
                  ),
                0
              ),
            passing:
              exam.passing || 0,
            students:
              '0 / 0',
            created:
              new Date(
                exam.created_at
              )
                .toLocaleDateString(),
            questions
          }
        }
      )
  }
  catch (error) {
    console.error(
      error
    )

    showNotification(
      'error',
      'Unable to Load Exams',
      'Failed to load examinations. Please try again.'
    )
  }
  finally {
    loading.value =
      false
  }
}

// ===========================================
// ON MOUNT
// ===========================================

onMounted(() => {
  fetchExams()
})

// ===========================================
// SUBJECTS
// ===========================================

const subjects =
  computed(() => {
    return [
      ...new Set(
        exams.value
          .map(
            exam =>
              exam.subject
          )
          .filter(Boolean)
      )
    ]
  })

// ===========================================
// FILTERED EXAMS
// ===========================================

const filteredExams =
  computed(() => {
    const keyword =
      search.value
        .trim()
        .toLowerCase()

    return exams.value.filter(
      exam => {
        const subjectMatch =
          selectedSubject.value ===
            'All Subjects'
          ||
          exam.subject ===
            selectedSubject.value

        const searchMatch =
          !keyword
          ||
          String(
            exam.title || ''
          )
            .toLowerCase()
            .includes(keyword)
          ||
          String(
            exam.grade || ''
          )
            .toLowerCase()
            .includes(keyword)
          ||
          String(
            exam.section || ''
          )
            .toLowerCase()
            .includes(keyword)
          ||
          String(
            exam.subject || ''
          )
            .toLowerCase()
            .includes(keyword)

        return (
          subjectMatch &&
          searchMatch
        )
      }
    )
  })

// ===========================================
// STATISTICS
// ===========================================

const totalExams =
  computed(() =>
    exams.value.length
  )

const totalPublished =
  computed(() =>
    exams.value.filter(
      exam =>
        exam.status ===
        'Published'
    ).length
  )

const totalDrafts =
  computed(() =>
    exams.value.filter(
      exam =>
        exam.status ===
        'Draft'
    ).length
  )

const totalFinished =
  computed(() =>
    exams.value.filter(
      exam =>
        exam.status ===
        'Finished'
    ).length
  )

// ===========================================
// CREATE EXAM
// ===========================================

function goToCreateExam() {
  router.push(
    '/faculty/create-exam'
  )
}

// ===========================================
// EDIT EXAM
// ===========================================

function editExam(
  id: number
) {
  router.push(
    `/faculty/edit-exam/${id}`
  )
}

// ===========================================
// PREVIEW EXAM
// ===========================================

function previewExam(
  exam: any
) {
  selectedExam.value = {
    ...exam
  }

  previewQuestion.value =
    1

  showPreview.value =
    true
}

function closePreview() {
  showPreview.value =
    false
}

function nextQuestion() {
  if (
    previewQuestion.value <
    selectedExam.value
      .questions.length
  ) {
    previewQuestion.value++
  }
}

function previousQuestion() {
  if (
    previewQuestion.value >
    1
  ) {
    previewQuestion.value--
  }
}

// ===========================================
// PUBLISH EXAM
// ===========================================

function publishExam(
  exam: any
) {
  openActionDialog(
    'publish',
    exam
  )
}

// ===========================================
// START EXAM
// ===========================================

function startExam(
  exam: any
) {
  selectedStartExam.value =
    exam

  showStartDialog.value =
    true
}

function confirmStartExam() {
  if (
    !selectedStartExam.value
  ) {
    return
  }

  const examId =
    selectedStartExam.value.id

  showStartDialog.value =
    false

  selectedStartExam.value =
    null

  router.push(
    `/faculty/lobby/${examId}`
  )
}

function cancelStartExam() {
  showStartDialog.value =
    false

  selectedStartExam.value =
    null
}

// ===========================================
// START AGAIN
// ===========================================

function startAgain(
  exam: any
) {
  openActionDialog(
    'restart',
    exam
  )
}

// ===========================================
// DELETE EXAM
// ===========================================

function deleteExam(
  exam: any
) {
  openActionDialog(
    'delete',
    exam
  )
}

// ===========================================
// CONFIRM ACTION
// ===========================================

async function confirmAction() {
  if (
    !selectedActionExam.value ||
    processingAction.value
  ) {
    return
  }

  processingAction.value =
    true

  const exam =
    selectedActionExam.value

  const action =
    actionDialogType.value

  try {
    if (
      action ===
      'publish'
    ) {
      await api.post(
        `/exams/${exam.id}/publish`
      )

      exam.status =
        'Published'

      showActionDialog.value =
        false

      selectedActionExam.value =
        null

      showNotification(
        'success',
        'Exam Published',
        'The examination was published successfully.'
      )
    }
    else if (
      action ===
      'restart'
    ) {
      await api.post(
        `/exams/${exam.id}/restart`
      )

      showActionDialog.value =
        false

      selectedActionExam.value =
        null

      await fetchExams()

      showNotification(
        'success',
        'Exam Ready Again',
        'The examination is ready again with a new access code.'
      )
    }
    else {
      await api.delete(
        `/exams/${exam.id}`
      )

      exams.value =
        exams.value.filter(
          item =>
            item.id !==
            exam.id
        )

      showActionDialog.value =
        false

      selectedActionExam.value =
        null

      showNotification(
        'success',
        'Exam Deleted',
        'The examination was deleted successfully.'
      )
    }
  }
  catch (error: any) {
    console.error(
      error
    )

    if (
      action ===
      'publish'
    ) {
      showNotification(
        'error',
        'Publish Failed',
        error.response
          ?.data
          ?.message ||
        'Failed to publish examination.'
      )
    }
    else if (
      action ===
      'restart'
    ) {
      showNotification(
        'error',
        'Restart Failed',
        error.response
          ?.data
          ?.message ||
        'Failed to restart examination.'
      )
    }
    else {
      showNotification(
        'error',
        'Delete Failed',
        error.response
          ?.data
          ?.message ||
        'Failed to delete examination.'
      )
    }
  }
  finally {
    processingAction.value =
      false
  }
}
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.dashboard {
  padding: 32px 40px;
  background: #f8fafc;
  min-height: 100vh;
  font-family:
    "Segoe UI",
    Arial,
    Helvetica,
    sans-serif;
  color: #0f172a;
  -webkit-font-smoothing:
    antialiased;
}

.dashboard-header {
  display: flex;
  justify-content:
    space-between;
  align-items: center;
  gap: 20px;
  margin-bottom: 28px;
}

.dashboard-header h1 {
  font-size: 26px;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: #0f172a;
}

.dashboard-header p {
  margin-top: 5px;
  color: #64748b;
  font-size: 14px;
}

.new-exam-btn {
  border: none;
  background: #00c853;
  color: white;
  padding: 12px 22px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition:
    background .15s ease,
    transform .15s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
}

.new-exam-btn:hover {
  background: #00a845;
  transform:
    translateY(-1px);
}

.stats {
  display: grid;
  grid-template-columns:
    repeat(4, 1fr);
  gap: 14px;
  margin-bottom: 28px;
}

.card {
  background: #ffffff;
  border:
    1px solid #e2e8f0;
  border-radius: 12px;
  padding: 20px 22px;
  min-height: 90px;
  display: flex;
  align-items: center;
  gap: 16px;
  box-shadow:
    0 1px 2px
    rgba(15, 23, 42, .03);
}

.stat-icon {
  width: 44px;
  height: 44px;
  border-radius: 10px;
  background: #eaf9ef;
  color: #00b248;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.card span {
  display: block;
  color: #64748b;
  font-size: 13px;
  font-weight: 500;
  margin-bottom: 8px;
}

.card h2 {
  color: #0f172a;
  font-size: 26px;
  font-weight: 700;
  line-height: 1;
}

.exam-section {
  background: white;
  border:
    1px solid #e2e8f0;
  border-radius: 14px;
  padding: 26px;
  box-shadow:
    0 1px 3px
    rgba(15, 23, 42, .04);
}

.exam-header {
  display: flex;
  justify-content:
    space-between;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
  padding-bottom: 20px;
  border-bottom:
    1px solid #f1f5f9;
}

.exam-header h2 {
  font-size: 18px;
  font-weight: 700;
}

.exam-header p {
  color: #64748b;
  font-size: 13px;
  margin-top: 4px;
}

.filters {
  display: flex;
  gap: 10px;
}

.search-box {
  position: relative;
  display: flex;
  align-items: center;
}

.search-box svg {
  position: absolute;
  left: 12px;
  color: #94a3b8;
  pointer-events: none;
}

.filters input,
.filters select {
  height: 38px;
  border:
    1px solid #e2e8f0;
  border-radius: 8px;
  background: #f8fafc;
  padding: 0 12px;
  outline: none;
  font-size: 13px;
}

.search-box input {
  width: 230px;
  padding-left: 38px;
}

.exam-card {
  background: #fff;
  border:
    1px solid #e2e8f0;
  border-radius: 12px;
  padding: 20px 22px;
  margin-bottom: 14px;
}

.exam-card:hover {
  border-color: #cbd5e1;
  box-shadow:
    0 4px 14px
    rgba(15, 23, 42, .06);
}

.exam-title {
  display: flex;
  justify-content:
    space-between;
  align-items:
    flex-start;
  gap: 16px;
  margin-bottom: 18px;
  padding-bottom: 16px;
  border-bottom:
    1px solid #f1f5f9;
}

.exam-title h3 {
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 8px;
}

.badge {
  display: inline-flex;
  padding: 4px 11px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
}

.draft {
  background: #fef3e7;
  color: #c2540a;
}

.published {
  background: #e7f5ec;
  color: #0f7a3d;
}

.finished {
  background: #e8eefc;
  color: #334ca1;
}

.started {
  background: #e0f2fe;
  color: #0369a1;
}

.buttons {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.buttons button {
  height: 34px;
  padding: 0 14px;
  border-radius: 7px;
  border:
    1px solid #e2e8f0;
  background: white;
  color: #334155;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
}

.publish-btn,
.start-btn {
  background:
    #00c853 !important;
  border-color:
    #00c853 !important;
  color:
    white !important;
}

.publish-btn:hover,
.start-btn:hover {
  background:
    #00a845 !important;
}

.delete {
  color:
    #b91c1c !important;
  border-color:
    #fecaca !important;
}

.exam-info {
  display: grid;
  grid-template-columns:
    repeat(
      auto-fit,
      minmax(115px, 1fr)
    );
  gap: 10px;
}

.exam-info div,
.preview-info div,
.dialog-info div {
  background: #f8fafc;
  border-radius: 8px;
  padding: 12px 10px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.info-icon {
  color: #00b248;
  margin-bottom: 7px;
}

.exam-info small,
.preview-info small,
.dialog-info small {
  color: #94a3b8;
  font-size: 11px;
  margin-bottom: 6px;
  text-transform: uppercase;
}

.exam-info strong,
.preview-info strong,
.dialog-info strong {
  color: #0f172a;
  font-size: 13px;
}

.empty {
  text-align: center;
  padding: 70px 20px;
  color: #94a3b8;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.empty svg {
  color: #cbd5e1;
  margin-bottom: 15px;
}

.empty h2 {
  color: #334155;
  font-size: 16px;
  margin-bottom: 8px;
}

.preview-overlay,
.dialog-overlay {
  position: fixed;
  inset: 0;
  background:
    rgba(15, 23, 42, .5);
  backdrop-filter:
    blur(4px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  padding: 20px;
  overflow-y: auto;
}

.preview-modal,
.dialog {
  background: white;
  border-radius: 16px;
  box-shadow:
    0 20px 50px
    rgba(15, 23, 42, .2);
}

.preview-modal {
  width: 900px;
  max-width: 95%;
  max-height: 90vh;
  overflow-y: auto;
  padding: 28px;
}

.preview-header {
  display: flex;
  justify-content:
    space-between;
  align-items:
    flex-start;
  margin-bottom: 22px;
  padding-bottom: 18px;
  border-bottom:
    1px solid #f1f5f9;
}

.close-btn {
  border:
    1px solid #e2e8f0;
  background: white;
  border-radius: 7px;
  padding: 8px 14px;
  cursor: pointer;
  display: flex;
  gap: 6px;
}

.preview-info {
  display: grid;
  grid-template-columns:
    repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 26px;
}

.question-preview h3 {
  font-size: 14px;
  margin-bottom: 12px;
}

.question-preview p {
  font-size: 17px;
  font-weight: 600;
  margin-bottom: 18px;
}

.option {
  border:
    1px solid #e2e8f0;
  border-radius: 8px;
  padding: 13px 16px;
  margin-bottom: 9px;
  font-size: 14px;
}

.preview-footer {
  margin-top: 26px;
  padding-top: 20px;
  border-top:
    1px solid #f1f5f9;
  display: flex;
  justify-content:
    space-between;
  align-items: center;
}

.nav-btn {
  border:
    1px solid #e2e8f0;
  background: white;
  padding: 10px 18px;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
}

.nav-btn:disabled {
  opacity: .45;
  cursor: not-allowed;
}

.dialog {
  width: 480px;
  max-width: 95%;
  padding: 32px;
  text-align: center;
}

.dialog-icon {
  width: 70px;
  height: 70px;
  margin:
    0 auto 15px;
  border-radius: 50%;
  background: #eaf9ef;
  color: #00b248;
  display: flex;
  align-items: center;
  justify-content: center;
}

.dialog h2 {
  font-size: 19px;
}

.dialog p {
  color: #64748b;
  font-size: 13px;
  line-height: 1.6;
  margin:
    14px 0 22px;
}

.dialog-info {
  display: grid;
  grid-template-columns:
    repeat(2, 1fr);
  gap: 10px;
  margin-bottom: 24px;
}

.dialog-buttons {
  display: flex;
  gap: 10px;
}

.cancel-btn,
.dialog .start-btn,
.action-confirm-btn {
  flex: 1;
  min-height: 44px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
}

.cancel-btn {
  border:
    1px solid #e2e8f0;
  background: white;
  color: #334155;
}

.dialog .start-btn {
  border: none;
  background: #00c853;
  color: white;
}

/* ======================
   ACTION CONFIRMATION
====================== */

.action-dialog-icon {
  width: 70px;
  height: 70px;
  margin:
    0 auto 15px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-dialog-icon.publish,
.action-dialog-icon.restart {
  background: #eaf9ef;
  color: #00b248;
}

.action-dialog-icon.delete {
  background: #fee2e2;
  color: #dc2626;
}

.action-exam-info {
  margin-bottom: 24px;
  padding: 14px;
  border:
    1px solid #e2e8f0;
  border-radius: 10px;
  background: #f8fafc;
}

.action-exam-info strong {
  display: block;
  color: #0f172a;
  font-size: 14px;
  margin-bottom: 5px;
}

.action-exam-info span {
  color: #64748b;
  font-size: 12px;
}

.action-confirm-btn {
  border: none;
  color: white;
}

.action-confirm-btn.publish,
.action-confirm-btn.restart {
  background: #00c853;
}

.action-confirm-btn.publish:hover,
.action-confirm-btn.restart:hover {
  background: #00a845;
}

.action-confirm-btn.delete {
  background: #dc2626;
  color: #ffffff !important;
}

.action-confirm-btn.delete:hover {
  background: #b91c1c;
  color: #ffffff !important;
}

.action-confirm-btn.delete span,
.action-confirm-btn.delete svg {
  color: #ffffff !important;
  stroke: #ffffff !important;
}

.action-confirm-btn:disabled,
.cancel-btn:disabled {
  opacity: .6;
  cursor: not-allowed;
}

/* ======================
   NOTIFICATION
====================== */

.notification-container {
  position: fixed;
  top: 25px;
  right: 25px;
  z-index: 10000;
  width: 390px;
  max-width:
    calc(100vw - 40px);
  padding:
    16px 45px 16px 16px;
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

/* ======================
   RESPONSIVE
====================== */

@media (max-width: 1024px) {
  .stats {
    grid-template-columns:
      repeat(2, 1fr);
  }

  .preview-info {
    grid-template-columns:
      repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .dashboard {
    padding: 18px;
  }

  .dashboard-header,
  .exam-header,
  .exam-title {
    flex-direction: column;
    align-items:
      flex-start;
  }

  .new-exam-btn {
    width: 100%;
  }

  .filters {
    width: 100%;
    flex-direction:
      column;
  }

  .search-box,
  .search-box input,
  .filters select {
    width: 100%;
  }

  .buttons {
    width: 100%;
  }

  .buttons button {
    flex: 1;
    min-width: 120px;
  }

  .stats,
  .exam-info,
  .preview-info,
  .dialog-info {
    grid-template-columns:
      1fr;
  }

  .dialog-buttons {
    flex-direction:
      column;
  }

  .preview-footer {
    flex-wrap: wrap;
  }

  .notification-container {
    top: 15px;
    right: 15px;
    left: 15px;
    width: auto;
    max-width: none;
  }
}

@media (max-width: 480px) {
  .dashboard {
    padding: 12px;
  }

  .exam-section {
    padding: 16px;
  }

  .stats {
    gap: 10px;
  }

  .card {
    padding: 16px;
  }

  .buttons button {
    width: 100%;
    min-width: 100%;
  }

  .preview-modal,
  .dialog {
    padding: 20px;
  }

  .preview-footer {
    justify-content: center;
  }
}
</style>
