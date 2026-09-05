<template>
  <div class="dashboard">
    <!-- ================= HEADER ================= -->
    <div class="dashboard-header">
      <div>
        <h1>Faculty Dashboard</h1>
        <p>
          Welcome back! Manage your examinations and quizzes.
        </p>
      </div>
      <button
        class="new-exam-btn"
        @click="goToCreateExam"
      >
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
          <h2>
            Examinations
          </h2>
          <p>
            View and manage all examinations.
          </p>
        </div>
        <!-- ================= FILTERS ================= -->
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
          <!-- ================= TITLE ================= -->
          <div class="exam-title">
            <div>
              <h3>
                {{ exam.title }}
              </h3>
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
            <!-- ================= ACTION BUTTONS ================= -->
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
                @click="deleteExam(exam.id)"
              >
                <Trash2 :size="15" />
                <span>Delete</span>
              </button>
            </div>
          </div>
          <!-- ================= EXAM INFO ================= -->
          <div class="exam-info">
            <div>
              <GraduationCap
                :size="18"
                class="info-icon"
              />
              <small>
                Grade
              </small>
              <strong>
                {{ exam.grade }}
              </strong>
            </div>
            <div>
              <Layers3
                :size="18"
                class="info-icon"
              />
              <small>
                Section
              </small>
              <strong>
                {{ exam.section }}
              </strong>
            </div>
            <div>
              <BookOpen
                :size="18"
                class="info-icon"
              />
              <small>
                Subject
              </small>
              <strong>
                {{ exam.subject }}
              </strong>
            </div>
            <div>
              <Clock3
                :size="18"
                class="info-icon"
              />
              <small>
                Duration
              </small>
              <strong>
                {{ exam.duration }} mins
              </strong>
            </div>
            <div>
              <ListChecks
                :size="18"
                class="info-icon"
              />
              <small>
                Questions
              </small>
              <strong>
                {{ exam.items }}
              </strong>
            </div>
            <div>
              <Target
                :size="18"
                class="info-icon"
              />
              <small>
                Points
              </small>
              <strong>
                {{ exam.points }}
              </strong>
            </div>
            <div>
              <CircleCheckBig
                :size="18"
                class="info-icon"
              />
              <small>
                Passing
              </small>
              <strong>
                {{ exam.passing }}%
              </strong>
            </div>
            <div>
              <Users
                :size="18"
                class="info-icon"
              />
              <small>
                Students
              </small>
              <strong>
                {{ exam.students }}
              </strong>
            </div>
            <div>
              <CalendarDays
                :size="18"
                class="info-icon"
              />
              <small>
                Created
              </small>
              <strong>
                {{ exam.created }}
              </strong>
            </div>
          </div>
        </div>
      </div>
      <!-- ================= EMPTY ================= -->
      <div
        v-else
        class="empty"
      >
        <FileSearch :size="45" />
        <h2>
          No examinations found
        </h2>
        <p>
          Try another search or subject.
        </p>
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
            <h2>
              {{ selectedExam.title }}
            </h2>
            <p>
              Student Preview
            </p>
          </div>
          <button
            class="close-btn"
            @click="closePreview"
          >
            <X :size="16" />
            <span>Close</span>
          </button>
        </div>
        <!-- ================= PREVIEW INFO ================= -->
        <div class="preview-info">
          <div>
            <Clock3
              :size="18"
              class="info-icon"
            />
            <small>
              Duration
            </small>
            <strong>
              {{ selectedExam.duration }} mins
            </strong>
          </div>
          <div>
            <ListChecks
              :size="18"
              class="info-icon"
            />
            <small>
              Questions
            </small>
            <strong>
              {{ selectedExam.questions.length }}
            </strong>
          </div>
          <div>
            <Target
              :size="18"
              class="info-icon"
            />
            <small>
              Passing
            </small>
            <strong>
              {{ selectedExam.passing }}%
            </strong>
          </div>
        </div>
        <!-- ================= QUESTIONS ================= -->
        <div
          v-for="(question, index) in selectedExam.questions"
          :key="question.id"
          v-show="previewQuestion === index + 1"
          class="question-preview"
        >
          <h3>
            Question {{ index + 1 }}
          </h3>
          <p>
            {{ question.question }}
          </p>
          <!-- MULTIPLE CHOICE -->
          <div
            v-if="question.question_type === 'multiple_choice'"
          >
            <div
              v-for="option in question.options"
              :key="option.id"
              class="option"
            >
              {{ option.option_text }}
            </div>
          </div>
          <!-- OTHER QUESTION TYPES -->
          <div
            v-else
            class="option"
          >
            Answer:
            {{ question.answer || 'No answer provided' }}
          </div>
        </div>
        <!-- ================= PREVIEW FOOTER ================= -->
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
            of
            {{ selectedExam.items }}
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
        <h2>
          Start Examination?
        </h2>
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
            <FileText
              :size="18"
              class="info-icon"
            />
            <small>
              Examination
            </small>
            <strong>
              {{ selectedStartExam.title }}
            </strong>
          </div>
          <div>
            <GraduationCap
              :size="18"
              class="info-icon"
            />
            <small>
              Grade
            </small>
            <strong>
              {{ selectedStartExam.grade }}
            </strong>
          </div>
          <div>
            <Layers3
              :size="18"
              class="info-icon"
            />
            <small>
              Section
            </small>
            <strong>
              {{ selectedStartExam.section }}
            </strong>
          </div>
          <div>
            <BookOpen
              :size="18"
              class="info-icon"
            />
            <small>
              Subject
            </small>
            <strong>
              {{ selectedStartExam.subject }}
            </strong>
          </div>
          <div>
            <Clock3
              :size="18"
              class="info-icon"
            />
            <small>
              Duration
            </small>
            <strong>
              {{ selectedStartExam.duration }} mins
            </strong>
          </div>
          <div>
            <ListChecks
              :size="18"
              class="info-icon"
            />
            <small>
              Questions
            </small>
            <strong>
              {{ selectedStartExam.items }}
            </strong>
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
  </div>
</template>
<script setup lang="ts">
import {
  ref,
  computed,
  onMounted
} from 'vue'
import { useRouter } from 'vue-router'
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
  FileSearch
} from '@lucide/vue'
const router = useRouter()
// ===========================================
// SEARCH & FILTER
// ===========================================
const search = ref('')
const selectedSubject = ref(
  'All Subjects'
)
// ===========================================
// PREVIEW POPUP
// ===========================================
const showPreview = ref(false)
const previewQuestion = ref(1)
const selectedExam = ref({
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
  loading.value = true
  try {
    const response =
      await api.get('/exams')
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
              exam.status === 'draft'
                ? 'Draft'
                : exam.status === 'published'
                  ? 'Published'
                  : exam.status === 'started'
                    ? 'Started'
                    : exam.status === 'finished'
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
                  q: any
                ) =>
                  sum +
                  Number(
                    q.points || 0
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
  } catch (error) {
    console.error(error)
    alert(
      'Failed to load exams.'
    )
  } finally {
    loading.value = false
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
  previewQuestion.value = 1
  showPreview.value = true
}
function closePreview() {
  showPreview.value = false
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
    previewQuestion.value > 1
  ) {
    previewQuestion.value--
  }
}
// ===========================================
// PUBLISH EXAM
// ===========================================
async function publishExam(
  exam: any
) {
  const confirmed =
    confirm(
      'Publish this examination?\n\nStudents will be able to join after publishing.'
    )
  if (!confirmed) return
  try {
    await api.post(
      `/exams/${exam.id}/publish`
    )
    exam.status =
      'Published'
    alert(
      'Exam published successfully!'
    )
  } catch (error) {
    console.error(error)
    alert(
      'Failed to publish examination.'
    )
  }
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
  showStartDialog.value =
    false
  router.push(
    `/faculty/lobby/${selectedStartExam.value.id}`
  )
}
function cancelStartExam() {
  showStartDialog.value =
    false
  selectedStartExam.value =
    null
}
// ===========================================
// START EXAM AGAIN
// ===========================================
async function startAgain(
  exam: any
) {
  const confirmed =
    confirm(
      'Start this exam again?\n\nA new access code will be generated for remedial or late students.'
    )
  if (!confirmed) return
  try {
    await api.post(
      `/exams/${exam.id}/restart`
    )
    await fetchExams()
    alert(
      'Exam is ready again with a new access code.'
    )
  } catch (error) {
    console.error(error)
    alert(
      'Failed to restart exam.'
    )
  }
}
// ===========================================
// DELETE EXAM
// ===========================================
async function deleteExam(
  id: number
) {
  const confirmed =
    confirm(
      'Delete this examination?'
    )
  if (!confirmed) return
  try {
    await api.delete(
      `/exams/${id}`
    )
    exams.value =
      exams.value.filter(
        exam =>
          exam.id !== id
      )
  } catch (error) {
    console.error(error)
    alert(
      'Failed to delete exam.'
    )
  }
}
</script>
<style scoped>
/* ======================
   GLOBAL
====================== */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
/* ======================
   DASHBOARD
====================== */
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
/* ======================
   HEADER
====================== */
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
  letter-spacing:
    -0.02em;
  color: #0f172a;
}
.dashboard-header p {
  margin-top: 5px;
  color: #64748b;
  font-size: 14px;
}
/* ======================
   NEW EXAM BUTTON
====================== */
.new-exam-btn {
  border: none;
  background: #00c853;
  color: white;
  padding:
    12px 22px;
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
/* ======================
   TOP CARDS
====================== */
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
  padding:
    20px 22px;
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
  letter-spacing:
    -0.01em;
}
/* ======================
   EXAM SECTION
====================== */
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
  color: #0f172a;
}
.exam-header p {
  color: #64748b;
  font-size: 13px;
  margin-top: 4px;
}
/* ======================
   FILTERS
====================== */
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
  padding:
    0 12px;
  outline: none;
  font-size: 13px;
  color: #0f172a;
  transition:
    border-color .15s ease,
    background .15s ease;
}
.search-box input {
  width: 230px;
  padding-left:
    38px;
}
.filters input:focus,
.filters select:focus {
  background: white;
  border-color:
    #94a3b8;
}
/* ======================
   EXAM CARD
====================== */
.exam-card {
  position: relative;
  background: #fff;
  border:
    1px solid #e2e8f0;
  border-radius: 12px;
  padding:
    20px 22px;
  margin-bottom: 14px;
  transition:
    border-color .15s ease,
    box-shadow .15s ease;
}
.exam-card:hover {
  border-color:
    #cbd5e1;
  box-shadow:
    0 4px 14px
    rgba(15, 23, 42, .06);
}
/* ======================
   EXAM TITLE
====================== */
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
  color: #0f172a;
  margin-bottom: 8px;
}
/* ======================
   BADGES
====================== */
.badge {
  display: inline-flex;
  align-items: center;
  padding:
    4px 11px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing:
    .02em;
  text-transform:
    uppercase;
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
/* ======================
   ACTION BUTTONS
====================== */
.buttons {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.buttons button {
  height: 34px;
  padding:
    0 14px;
  border-radius: 7px;
  border:
    1px solid #e2e8f0;
  background: white;
  color: #334155;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition:
    background .15s ease,
    border-color .15s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}
.buttons button:hover {
  background: #f8fafc;
  border-color:
    #cbd5e1;
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
.delete:hover {
  background:
    #fef2f2 !important;
}
/* ======================
   EXAM INFO
====================== */
.exam-info {
  display: grid;
  grid-template-columns:
    repeat(
      auto-fit,
      minmax(115px, 1fr)
    );
  gap: 10px;
}
.exam-info div {
  background: #f8fafc;
  border-radius: 8px;
  padding:
    12px 10px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.info-icon {
  color: #00b248;
  margin-bottom: 7px;
}
.exam-info small {
  display: block;
  color: #94a3b8;
  font-size: 11px;
  font-weight: 500;
  margin-bottom: 6px;
  text-transform:
    uppercase;
  letter-spacing:
    .03em;
}
.exam-info strong {
  color: #0f172a;
  font-size: 13px;
  font-weight: 700;
}
/* ======================
   EMPTY
====================== */
.empty {
  text-align: center;
  padding:
    70px 20px;
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
  font-weight: 700;
  margin-bottom: 8px;
}
.empty p {
  font-size: 13px;
}
/* ======================
   MODAL OVERLAYS
====================== */
.preview-overlay,
.dialog-overlay{
  position:fixed;
  inset:0;
  background:rgba(15,23,42,.5);
  backdrop-filter:blur(4px);
  display:flex;
  justify-content:center;
  align-items:center;
  z-index:9999;
  padding:20px;
  overflow-y:auto;
  overflow-x:hidden;
}
/* ======================
   MODALS
====================== */
.preview-modal,
.dialog {
  background: white;
  border-radius: 16px;
  box-shadow:
    0 20px 50px
    rgba(15, 23, 42, .2);
}
/* ======================
   PREVIEW
====================== */
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
.preview-header h2 {
  font-size: 19px;
  font-weight: 700;
  color: #0f172a;
}
.preview-header p {
  color: #64748b;
  font-size: 13px;
  margin-top: 4px;
}
.close-btn {
  border:
    1px solid #e2e8f0;
  background: white;
  border-radius: 7px;
  padding:
    8px 14px;
  font-size: 12px;
  font-weight: 600;
  color: #334155;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}
.close-btn:hover {
  background: #f8fafc;
}
/* ======================
   PREVIEW INFO
====================== */
.preview-info {
  display: grid;
  grid-template-columns:
    repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 26px;
}
.preview-info div,
.dialog-info div {
  background: #f8fafc;
  border-radius: 9px;
  padding: 14px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.preview-info small,
.dialog-info small {
  display: block;
  color: #94a3b8;
  font-size: 11px;
  font-weight: 500;
  margin-bottom: 6px;
  text-transform:
    uppercase;
  letter-spacing:
    .03em;
}
.preview-info strong,
.dialog-info strong {
  color: #0f172a;
  font-size: 13px;
  font-weight: 700;
}
/* ======================
   QUESTION PREVIEW
====================== */
.question-preview h3 {
  color: #0f172a;
  font-size: 14px;
  font-weight: 700;
  text-transform:
    uppercase;
  letter-spacing:
    .03em;
  margin-bottom: 12px;
}
.question-preview p {
  font-size: 17px;
  font-weight: 600;
  margin-bottom: 18px;
  color: #0f172a;
}
.option {
  border:
    1px solid #e2e8f0;
  border-radius: 8px;
  padding:
    13px 16px;
  margin-bottom: 9px;
  font-size: 14px;
  color: #334155;
}
/* ======================
   PREVIEW FOOTER
====================== */
.preview-footer {
  margin-top: 26px;
  padding-top: 20px;
  border-top:
    1px solid #f1f5f9;
  display: flex;
  justify-content:
    space-between;
  align-items: center;
  gap: 10px;
}
.preview-footer span {
  font-size: 13px;
  color: #64748b;
  font-weight: 500;
}
.nav-btn {
  border:
    1px solid #e2e8f0;
  background: white;
  color: #334155;
  padding:
    10px 18px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 13px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}
.nav-btn:hover:not(:disabled) {
  background: #f8fafc;
}
.nav-btn:disabled {
  opacity: .45;
  cursor: not-allowed;
}
/* ======================
   START DIALOG
====================== */
.dialog{
  width:480px;
  max-width:95%;
  padding:32px;
  text-align:center;
  max-height:calc(100dvh - 40px);
  overflow-y:auto;
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
  font-weight: 700;
  color: #0f172a;
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
/* ======================
   DIALOG BUTTONS
====================== */
.dialog-buttons {
  display: flex;
  gap: 10px;
}
.cancel-btn,
.dialog .start-btn {
  flex: 1;
  height: 44px;
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
.cancel-btn:hover {
  background: #f8fafc;
}
.dialog .start-btn {
  border: none;
  background: #00c853;
  color: white;
}
.dialog .start-btn:hover {
  background: #00a845;
}
/* ======================
   RESPONSIVE
====================== */
@media (max-width: 1024px) {
  .dialog-overlay{
  align-items:flex-start;
  padding:12px;
  overflow-y:auto;
  -webkit-overflow-scrolling:touch;
  }
  .dialog{
    width:100%;
    max-width:520px;
    max-height:none;
    overflow:visible;
    margin:auto 0;
    padding:22px 16px;
  }
  .dialog-info{
    grid-template-columns:1fr;
  }
  .dialog-buttons{
    flex-direction:column;
    position:sticky;
    bottom:0;
    background:white;
    padding-top:10px;
  }
  .cancel-btn,
  .dialog .start-btn{
    width:100%;
    flex:none;
  }
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
  .search-box {
    width: 100%;
  }
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
