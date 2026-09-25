<template>
  <div class="test-bank-page">
    <div class="page-header">
      <div>
        <h1>Test Bank</h1>
        <p>Manage and reuse questions for your assessments.</p>
      </div>
      <button class="primary-btn" @click="openAddModal">
        <Plus :size="18" />
        <span>Add Question</span>
      </button>
    </div>

    <div class="stats-card">
      <div>
        <span>Total Questions</span>
        <strong>{{ filteredQuestions.length }}</strong>
      </div>
      <small v-if="filteredQuestions.length !== questions.length">
        {{ questions.length }} total question(s) in your Test Bank
      </small>
    </div>

    <div class="filters-card">
      <div class="filter-group">
        <label>Class</label>
        <select v-model="classFilter">
          <option value="">All Classes</option>
          <option v-for="item in classes" :key="item.id" :value="String(item.id)">
            {{ classLabel(item) }}
          </option>
        </select>
      </div>
      <div class="filter-group">
        <label>Question Type</label>
        <select v-model="typeFilter">
          <option value="">All Types</option>
          <option value="multiple_choice">Multiple Choice</option>
          <option value="true_false">True or False</option>
          <option value="identification">Identification</option>
        </select>
      </div>
      <div class="filter-group search-group">
        <label>Search</label>
        <div class="search-box">
          <Search :size="17" />
          <input v-model="searchText" type="text" placeholder="Search question or competency...">
        </div>
      </div>
    </div>

    <div v-if="loading" class="state-card">
      <LoaderCircle :size="30" class="spin" />
      <p>Loading Test Bank...</p>
    </div>

    <div v-else-if="filteredQuestions.length === 0" class="state-card">
      <BookOpen :size="42" />
      <h3>{{ questions.length === 0 ? 'Your Test Bank is empty' : 'No questions found' }}</h3>
      <p>{{ questions.length === 0 ? 'Add questions manually or save questions from an assessment.' : 'Try changing your filters or search.' }}</p>
      <button v-if="questions.length === 0" class="primary-btn compact" @click="openAddModal">
        <Plus :size="17" />
        <span>Add Question</span>
      </button>
    </div>

    <div v-else class="question-list">
      <article v-for="(item, index) in filteredQuestions" :key="item.id" class="question-card">
        <div class="question-header">
          <div class="question-number">
            <span>Question {{ index + 1 }}</span>
            <div class="badges">
              <span class="type-badge">{{ typeLabel(item.question_type) }}</span>
              <span class="points-badge">{{ item.points }} pt{{ Number(item.points) === 1 ? '' : 's' }}</span>
              <span class="performance-percentage" :class="{empty: !item.statistics?.total_answers}">
                {{ item.statistics?.total_answers ? `${item.statistics.correct_percentage}% Correct`: 'No responses' }}
              </span>
              <span class="status-badge" :class="item.is_active ? 'enabled' : 'disabled'">
                {{ item.is_active ? 'Enabled' : 'Disabled' }}
              </span>
            </div>
          </div>
          <div class="actions">
            <button class="edit-btn" @click="openEditModal(item)">
              <Pencil :size="15" />
              <span>Edit</span>
            </button>
            <button
              class="status-btn"
              :class="item.is_active ? 'disable' : 'enable'"
              :disabled="togglingId === item.id"
              @click="toggleQuestionStatus(item)"
            >
              <LoaderCircle v-if="togglingId === item.id" :size="15" class="spin" />
              <CircleOff v-else-if="item.is_active" :size="15" />
              <CircleCheckBig v-else :size="15" />
              <span>
                {{ togglingId === item.id ? 'Updating...' : item.is_active ? 'Disable' : 'Enable' }}
              </span>
            </button>
          </div>
        </div>

        <h3 class="question-text">{{ item.question }}</h3>
        <p v-if="item.competency" class="competency">
          <strong>Competency:</strong> {{ item.competency }}
        </p>

        <div v-if="item.question_type === 'multiple_choice'" class="options-grid">
          <div v-for="(option, optionIndex) in item.options || []" :key="option.id || optionIndex"
            class="option-preview" :class="{ correct: option.is_correct }">
            <span>{{ String.fromCharCode(65 + optionIndex) }}.</span>
            <p>{{ option.option_text }}</p>
            <CircleCheckBig v-if="option.is_correct" :size="16" />
          </div>
        </div>

        <div v-else-if="item.question_type === 'true_false'" class="options-grid">
          <div v-for="(option, optionIndex) in item.options || []" :key="option.id || optionIndex"
            class="option-preview" :class="{ correct: option.is_correct }">
            <span>{{ optionIndex + 1 }}.</span>
            <p>{{ option.option_text }}</p>
            <CircleCheckBig v-if="option.is_correct" :size="16" />
          </div>
        </div>

        <div v-else class="answer-box">
          <span>Correct Answer</span>
          <strong>{{ item.answer || 'Not provided' }}</strong>
        </div>

        <div class="question-footer">
          <span><BookOpen :size="14" /> {{ questionClassLabel(item) }}</span>
        </div>
      </article>
    </div>

    <div v-if="showQuestionModal" class="modal-overlay" @click.self="closeQuestionModal">
      <div class="modal-card question-modal">
        <div class="modal-header">
          <div>
            <h2>{{ editingQuestion ? 'Edit Question' : 'Add Question' }}</h2>
            <p>{{ editingQuestion ? 'Update this Test Bank question.' : 'Create a reusable question for your Test Bank.' }}</p>
          </div>
          <button class="icon-btn" :disabled="saving" @click="closeQuestionModal">
            <X :size="20" />
          </button>
        </div>

        <div class="form-grid">
          <div class="form-group">
            <label>Subject</label>
            <select v-model.number="form.subject_id" @change="handleSubjectChange">
              <option :value="0" disabled>Select Subject</option>
              <option v-for="subject in taughtSubjects" :key="subject.id" :value="subject.id">
                {{ subject.name }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label>Question Type</label>
            <select v-model="form.question_type" @change="resetFormForType">
              <option value="multiple_choice">Multiple Choice</option>
              <option value="true_false">True or False</option>
              <option value="identification">Identification</option>
            </select>
          </div>
        </div>

        <div class="form-group">
          <label>Assign to Classes</label>
          <div v-if="!form.subject_id" class="class-assignment-empty">Select a subject first.</div>
          <div v-else-if="availableClassesForForm.length === 0" class="class-assignment-empty">No classes found for this subject.</div>
          <div v-else class="class-assignment-list">
            <label v-for="item in availableClassesForForm" :key="item.id" class="class-check">
              <input v-model="form.class_ids" type="checkbox" :value="item.id">
              <span>{{ classLabel(item) }}</span>
            </label>
          </div>
          <small v-if="form.class_ids.length" class="selected-class-count">
            {{ form.class_ids.length }} class{{ form.class_ids.length === 1 ? '' : 'es' }} selected
          </small>
        </div>

        <div class="form-group">
          <label>Question</label>
          <textarea v-model="form.question" placeholder="Enter question..."></textarea>
        </div>

        <div class="form-group">
          <label>Competency <span>(Optional)</span></label>
          <input v-model="form.competency" type="text" placeholder="Enter learning competency">
        </div>

        <template v-if="form.question_type === 'multiple_choice'">
          <div class="form-group">
            <label>Choices</label>
            <div v-for="(_, index) in form.options" :key="index" class="choice-row">
              <span>{{ String.fromCharCode(65 + index) }}.</span>
              <input v-model="form.options[index]" type="text" :placeholder="`Option ${index + 1}`">
            </div>
          </div>
          <div class="form-group">
            <label>Correct Answer</label>
            <select v-model="form.answer">
              <option value="" disabled>Select Correct Answer</option>
              <option v-for="(option, index) in form.options" :key="index"
                :value="String.fromCharCode(65 + index)" :disabled="!option.trim()">
                {{ String.fromCharCode(65 + index) }}. {{ option || `Option ${index + 1}` }}
              </option>
            </select>
          </div>
        </template>

        <div v-else-if="form.question_type === 'true_false'" class="form-group">
          <label>Correct Answer</label>
          <select v-model="form.answer">
            <option value="" disabled>Select Correct Answer</option>
            <option value="True">True</option>
            <option value="False">False</option>
          </select>
        </div>

        <div v-else class="form-group">
          <label>Correct Answer</label>
          <input v-model="form.answer" type="text" placeholder="Enter correct answer">
        </div>

        <div class="form-group points-field">
          <label>Points</label>
          <input v-model.number="form.points" type="number" min="1">
        </div>

        <div class="modal-actions">
          <button class="secondary-btn" :disabled="saving" @click="closeQuestionModal">Cancel</button>
          <button class="primary-btn" :disabled="saving" @click="saveQuestion">
            <LoaderCircle v-if="saving" :size="17" class="spin" />
            <Save v-else :size="17" />
            <span>{{ saving ? 'Saving...' : editingQuestion ? 'Save Changes' : 'Add Question' }}</span>
          </button>
        </div>
      </div>
    </div>

    <Transition name="notification">
      <div v-if="notification.show" class="notification" :class="notification.type">
        <div class="notification-mark">{{ notification.type === 'success' ? '✓' : notification.type === 'error' ? '!' : 'i' }}</div>
        <div>
          <strong>{{ notification.title }}</strong>
          <p>{{ notification.message }}</p>
        </div>
        <button @click="closeNotification">×</button>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import api from '../services/api'
import { BookOpen, CircleCheckBig, CircleOff, LoaderCircle, Pencil, Plus, Save, Search, X } from '@lucide/vue'

interface Subject { id: number; name: string }
interface SchoolClass {
  id: number
  subject_id: number
  subject?: Subject
  grade_level?: string
  strand?: string | { id?: number; name?: string }
  section?: string | { id?: number; name?: string }
}
interface TestBankOption { id?: number; option_text: string; is_correct: boolean }
interface TestBankQuestion {
  id: number
  class_id?: number
  subject_id: number
  classes?: SchoolClass[]
  question: string
  question_type: 'multiple_choice' | 'true_false' | 'identification'
  competency?: string | null
  answer?: string | null
  points: number
  is_active: boolean
  statistics?: {
    total_answers: number
    correct_answers: number
    correct_percentage: number
  }
  subject?: Subject
  options?: TestBankOption[]
}
type NotificationType = 'success' | 'error' | 'info'

const questions = ref<TestBankQuestion[]>([])
const classes = ref<SchoolClass[]>([])
const loading = ref(false)
const saving = ref(false)
const classFilter = ref('')
const typeFilter = ref('')
const searchText = ref('')
const showQuestionModal = ref(false)
const editingQuestion = ref<TestBankQuestion | null>(null)
const togglingId = ref<number | null>(null)
const notification = ref({ show: false, type: 'success' as NotificationType, title: '', message: '' })
let notificationTimer: ReturnType<typeof setTimeout> | null = null

const form = reactive({
  class_ids: [] as number[],
  subject_id: 0,
  question: '',
  question_type: 'multiple_choice' as TestBankQuestion['question_type'],
  competency: '',
  answer: '',
  points: 1,
  options: ['', '', '', '']
})

const taughtSubjects = computed(() => {
  const map = new Map<number, Subject>()
  classes.value.forEach(item => {
    if (item.subject_id && item.subject) map.set(item.subject_id, item.subject)
  })
  return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name))
})

const filteredQuestions = computed(() => {
  const search = searchText.value.trim().toLowerCase()
  return questions.value.filter(item => {
    if (classFilter.value && !(item.classes || []).some(c => c.id === Number(classFilter.value))) return false
    if (typeFilter.value && item.question_type !== typeFilter.value) return false
    if (search) {
      const haystack = `${item.question} ${item.competency || ''} ${item.subject?.name || ''} ${questionClassLabel(item)}`.toLowerCase()
      if (!haystack.includes(search)) return false
    }
    return true
  })
})

function classLabel(item: SchoolClass) {
  const subject = item.subject?.name || 'Unknown Subject'
  const grade = item.grade_level || ''
  const strand =
    typeof item.strand === 'object'
      ? item.strand?.name || ''
      : item.strand || ''
  const section =
    typeof item.section === 'object'
      ? item.section?.name || ''
      : item.section || ''

  return [subject, grade, strand, section]
    .filter(Boolean)
    .join(' - ')
}

function questionClassLabel(item: TestBankQuestion) {
  const assigned = item.classes || []
  if (!assigned.length) return item.subject?.name || 'No assigned classes'
  return assigned.map(classLabel).join(' • ')
}

const availableClassesForForm = computed(() =>
  classes.value.filter(item => item.subject_id === form.subject_id)
)

function handleSubjectChange() {
  form.class_ids = []
}

function typeLabel(type: string) {
  if (type === 'multiple_choice') return 'Multiple Choice'
  if (type === 'true_false') return 'True or False'
  return 'Identification'
}

function showNotification(type: NotificationType, title: string, message: string) {
  if (notificationTimer) clearTimeout(notificationTimer)
  notification.value = { show: true, type, title, message }
  notificationTimer = setTimeout(() => notification.value.show = false, 4000)
}

function closeNotification() {
  notification.value.show = false
  if (notificationTimer) clearTimeout(notificationTimer)
  notificationTimer = null
}

async function fetchClasses() {
  try {
    const response = await api.get('/faculty/classes')
    classes.value = Array.isArray(response.data?.data) ? response.data.data : []
  } catch (error: any) {
    console.error('LOAD CLASSES ERROR:', error)
    classes.value = []
  }
}

async function fetchQuestions() {
  loading.value = true
  try {
    const response = await api.get('/faculty/test-bank', {
      params: classFilter.value ? { class_id: Number(classFilter.value) } : {}
    })
    questions.value = Array.isArray(response.data?.data) ? response.data.data : []
  } catch (error: any) {
    console.error('LOAD TEST BANK ERROR:', error)
    questions.value = []
    showNotification('error', 'Unable to Load Test Bank', error.response?.data?.message || 'Failed to load Test Bank questions.')
  } finally {
    loading.value = false
  }
}

function resetForm() {
  form.class_ids = []
  form.subject_id = taughtSubjects.value.length === 1
  ? (taughtSubjects.value[0]?.id ?? 0)
  : 0
  form.question = ''
  form.question_type = 'multiple_choice'
  form.competency = ''
  form.answer = ''
  form.points = 1
  form.options = ['', '', '', '']
}

function openAddModal() {
  editingQuestion.value = null
  resetForm()
  showQuestionModal.value = true
}
async function toggleQuestionStatus(item: TestBankQuestion) {
  if (togglingId.value !== null) return

  togglingId.value = item.id

  try {
    const response = await api.patch(
      `/faculty/test-bank/${item.id}/status`,
      {
        is_active: !item.is_active
      }
    )

    item.is_active = response.data?.data?.is_active ?? !item.is_active

    showNotification(
      'success',
      item.is_active ? 'Question Enabled' : 'Question Disabled',
      item.is_active
        ? 'This question can now be used in new assessments.'
        : 'This question will no longer be available for new assessments.'
    )
  } catch (error: any) {
    console.error('UPDATE QUESTION STATUS ERROR:', error)

    showNotification(
      'error',
      'Update Failed',
      error.response?.data?.message || 'Failed to update question status.'
    )
  } finally {
    togglingId.value = null
  }
}
function openEditModal(item: TestBankQuestion) {
  editingQuestion.value = item
  form.subject_id = item.subject_id
  form.class_ids = (item.classes || []).map(c => c.id)
  form.question = item.question
  form.question_type = item.question_type
  form.competency = item.competency || ''
  form.points = Number(item.points || 1)
  if (item.question_type === 'multiple_choice') {
    const opts = item.options || []
    form.options = [0, 1, 2, 3].map(index => opts[index]?.option_text || '')
    const correctIndex = opts.findIndex(option => Boolean(option.is_correct))
    form.answer = correctIndex >= 0 ? String.fromCharCode(65 + correctIndex) : (item.answer || '')
  } else if (item.question_type === 'true_false') {
    form.options = ['', '', '', '']
    const correct = (item.options || []).find(option => Boolean(option.is_correct))
    form.answer = correct?.option_text || item.answer || ''
  } else {
    form.options = ['', '', '', '']
    form.answer = item.answer || ''
  }
  showQuestionModal.value = true
}

function closeQuestionModal() {
  if (saving.value) return
  showQuestionModal.value = false
  editingQuestion.value = null
}

function resetFormForType() {
  form.answer = ''
  form.options = ['', '', '', '']
}

function validateForm() {
  if (!form.subject_id) return 'Please select a subject.'
  if (form.class_ids.length === 0) return 'Please assign the question to at least one class.'
  if (!form.question.trim()) return 'Please enter a question.'
  if (Number(form.points) < 1) return 'Points must be at least 1.'
  if (!form.answer.trim()) return 'Please provide the correct answer.'
  if (form.question_type === 'multiple_choice') {
    if (form.options.some(option => !option.trim())) return 'Please complete all four choices.'
    const normalized = form.options.map(option => option.trim().toLowerCase())
    if (new Set(normalized).size !== normalized.length) return 'Multiple choice options must be unique.'
  }
  return ''
}

function buildPayload() {
  let options: TestBankOption[] = []
  if (form.question_type === 'multiple_choice') {
    const correctIndex = form.answer.charCodeAt(0) - 65
    options = form.options.map((option, index) => ({
      option_text: option.trim(),
      is_correct: index === correctIndex
    }))
  } else if (form.question_type === 'true_false') {
    options = ['True', 'False'].map(option => ({
      option_text: option,
      is_correct: option === form.answer
    }))
  }
  return {
    class_ids: form.class_ids.map(Number),
    subject_id: form.subject_id,
    question: form.question.trim(),
    question_type: form.question_type,
    competency: form.competency.trim() || null,
    answer: form.answer.trim(),
    points: Number(form.points),
    options
  }
}

async function saveQuestion() {
  const validationMessage = validateForm()
  if (validationMessage) {
    showNotification('error', 'Incomplete Question', validationMessage)
    return
  }
  saving.value = true
  try {
    const payload = buildPayload()
    if (editingQuestion.value) {
      await api.put(`/faculty/test-bank/${editingQuestion.value.id}`, payload)
      showNotification('success', 'Question Updated', 'Test Bank question updated successfully.')
    } else {
      const response = await api.post('/faculty/test-bank', payload)
      showNotification(
        response.data?.already_exists ? 'info' : 'success',
        response.data?.already_exists ? 'Already in Test Bank' : 'Question Added',
        response.data?.message || 'Question added to Test Bank successfully.'
      )
    }
    showQuestionModal.value = false
    editingQuestion.value = null
    await fetchQuestions()
  } catch (error: any) {
    console.error('SAVE TEST BANK ERROR:', error)
    const errors = error.response?.data?.errors
    const firstError = errors ? Object.values(errors).flat()[0] : null
    showNotification('error', 'Save Failed', String(firstError || error.response?.data?.message || 'Failed to save question.'))
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  await Promise.all([fetchClasses(), fetchQuestions()])
})
</script>

<style scoped>
* { box-sizing: border-box; font-family: 'Poppins', sans-serif; }
.test-bank-page { min-height: 100vh; padding: 30px; background: #f7f9fc; color: #17231c; }
.page-header { display: flex; align-items: center; justify-content: space-between; gap: 20px; margin-bottom: 20px; }
.page-header h1 { margin: 0 0 5px; color: #112244; font-size: 32px; }
.page-header p { margin: 0; color: #64748b; font-size: 14px; }
.primary-btn, .secondary-btn, .edit-btn, .status-btn, .icon-btn { display: inline-flex; align-items: center; justify-content: center; gap: 7px; border: 0; cursor: pointer; font-weight: 600; transition: .2s; }
.primary-btn { min-height: 44px; padding: 0 16px; border-radius: 10px; background: #00c853; color: white; }
.primary-btn:hover:not(:disabled) { background: #00b34a; }
.primary-btn.compact { margin-top: 10px; }
.primary-btn:disabled, .secondary-btn:disabled { opacity: .6; cursor: not-allowed; }
.stats-card, .filters-card, .question-card, .state-card { background: white; border-radius: 15px; box-shadow: 0 4px 16px rgba(0,0,0,.06); }
.stats-card { display: flex; align-items: center; justify-content: space-between; padding: 16px 20px; margin-bottom: 15px; border-left: 4px solid #00c853; }
.stats-card div { display: flex; align-items: center; gap: 12px; }
.stats-card span { color: #64748b; font-size: 13px; font-weight: 600; }
.stats-card strong { color: #00a844; font-size: 25px; }
.stats-card small { color: #94a3b8; }
.filters-card { display: grid; grid-template-columns: 1fr 1fr 1.6fr; gap: 14px; padding: 18px; margin-bottom: 18px; }
.filter-group label, .form-group label { display: block; margin-bottom: 6px; color: #374151; font-size: 12px; font-weight: 700; }
.form-group label span { color: #94a3b8; font-size: 10px; font-weight: 500; }
.filter-group select, .filter-group input, .form-group select, .form-group input, .form-group textarea { width: 100%; border: 1px solid #d9dce2; border-radius: 9px; outline: none; background: white; font-size: 13px; }
.filter-group select, .filter-group input { height: 42px; padding: 0 12px; }
.form-group select, .form-group input { height: 44px; padding: 0 12px; }
.form-group textarea { min-height: 90px; padding: 12px; resize: vertical; }
.filter-group select:focus, .filter-group input:focus, .form-group select:focus, .form-group input:focus, .form-group textarea:focus { border-color: #00c853; box-shadow: 0 0 0 3px rgba(0,200,83,.08); }
.search-box { position: relative; }
.search-box svg { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #94a3b8; }
.search-box input { padding-left: 38px; }
.state-card { min-height: 250px; padding: 35px; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; color: #94a3b8; }
.state-card h3 { margin: 10px 0 4px; color: #334155; }
.state-card p { margin: 0; color: #64748b; font-size: 13px; }
.question-list { display: grid; gap: 14px; }
.question-card { padding: 18px; border: 1px solid transparent; transition: .2s; }
.question-card:hover { border-color: #bbf7d0; }
.question-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 15px; margin-bottom: 12px; }
.question-number { display: flex; flex-wrap: wrap; align-items: center; gap: 10px; }
.question-number > span { color: #112244; font-size: 13px; font-weight: 700; }
.badges { display: flex; gap: 6px; }
.type-badge, .points-badge, .performance-percentage, .status-badge { padding: 4px 8px; border-radius: 20px; font-size: 10px; font-weight: 700; }
.type-badge { background: #dcfce7; color: #15803d; }
.performance-percentage { background: #dbeafe; color: #1d4ed8; }
.performance-percentage.empty { background: #f1f5f9; color: #64748b; }
.status-badge.enabled { background: #dcfce7; color: #15803d; }
.status-badge.disabled { background: #fee2e2; color: #dc2626; }
.points-badge { background: #f1f5f9; color: #475569; }
.actions { display: flex; gap: 7px; }
.edit-btn, .delete-btn { padding: 7px 10px; border-radius: 7px; font-size: 11px; }
.edit-btn { background: #ecfdf5; color: #15803d; }
.edit-btn:hover { background: #dcfce7; }
.status-btn { padding: 7px 10px; border: 0; border-radius: 7px; cursor: pointer; font-size: 11px; font-weight: 600; display: inline-flex; align-items: center; justify-content: center; gap: 7px; transition: .2s; }
.status-btn.disable { background: #fff7ed; color: #c2410c; }
.status-btn.disable:hover:not(:disabled) { background: #ffedd5; }
.status-btn.enable { background: #ecfdf5; color: #15803d; }
.status-btn.enable:hover:not(:disabled) { background: #dcfce7; }
.status-btn:disabled { opacity: .6; cursor: not-allowed; }
.question-text { margin: 0 0 8px; color: #273548; font-size: 16px; line-height: 1.55; }
.competency { margin: 0 0 12px; color: #64748b; font-size: 12px; }
.competency strong { color: #166534; }
.options-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 7px; margin-top: 10px; }
.option-preview { min-height: 39px; display: flex; align-items: center; gap: 7px; padding: 8px 10px; border: 1px solid #e5e7eb; border-radius: 8px; background: #f9fafb; color: #475569; font-size: 12px; }
.option-preview span { font-weight: 700; }
.option-preview p { flex: 1; margin: 0; }
.option-preview.correct { border-color: #86efac; background: #f0fdf4; color: #166534; }
.answer-box { display: flex; align-items: center; gap: 10px; margin-top: 10px; padding: 10px 12px; border-radius: 8px; background: #f0fdf4; }
.answer-box span { color: #64748b; font-size: 11px; }
.answer-box strong { color: #166534; font-size: 12px; }
.question-footer { margin-top: 13px; padding-top: 10px; border-top: 1px solid #f1f5f9; }
.question-footer span { display: inline-flex; align-items: center; gap: 5px; color: #64748b; font-size: 11px; font-weight: 600; }
.modal-overlay { position: fixed; inset: 0; z-index: 9999; display: flex; align-items: center; justify-content: center; padding: 20px; background: rgba(0,0,0,.5); backdrop-filter: blur(4px); }
.modal-card { width: 520px; max-width: 100%; max-height: 92vh; overflow-y: auto; padding: 22px; border-radius: 17px; background: white; box-shadow: 0 20px 50px rgba(0,0,0,.2); }
.question-modal { width: 650px; }
.modal-header { display: flex; justify-content: space-between; gap: 15px; margin-bottom: 18px; }
.modal-header h2, .delete-modal h2 { margin: 0 0 4px; color: #112244; font-size: 21px; }
.modal-header p, .delete-modal p { margin: 0; color: #64748b; font-size: 12px; line-height: 1.6; }
.icon-btn { width: 34px; height: 34px; flex-shrink: 0; border-radius: 8px; background: #f1f5f9; color: #64748b; }
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.form-group { margin-bottom: 13px; }
.class-assignment-list { display: grid; gap: 8px; max-height: 190px; overflow-y: auto; padding: 10px; border: 1px solid #d9dce2; border-radius: 9px; background: #f8fafc; }
.class-check { display: flex !important; align-items: center; gap: 9px; margin: 0 !important; padding: 9px 10px; border-radius: 8px; background: white; cursor: pointer; font-size: 12px !important; font-weight: 600 !important; }
.class-check:hover { background: #f0fdf4; }
.class-check input { width: 16px !important; height: 16px !important; flex: 0 0 16px; accent-color: #00c853; }
.class-assignment-empty { padding: 12px; border: 1px dashed #cbd5e1; border-radius: 9px; background: #f8fafc; color: #64748b; font-size: 12px; }
.selected-class-count { display: block; margin-top: 7px; color: #15803d; font-size: 11px; font-weight: 600; }
.choice-row { display: flex; align-items: center; gap: 8px; margin-bottom: 7px; }
.choice-row span { width: 20px; color: #15803d; font-size: 12px; font-weight: 700; }
.choice-row input { flex: 1; }
.points-field { max-width: 180px; }
.modal-actions { display: flex; justify-content: flex-end; gap: 9px; margin-top: 18px; }
.modal-actions.centered { justify-content: center; }
.secondary-btn, .danger-btn { min-height: 42px; padding: 0 15px; border-radius: 9px; }
.secondary-btn { background: #f1f5f9; color: #475569; }
.danger-btn { background: #dc2626; color: white; }
.danger-btn:hover:not(:disabled) { background: #b91c1c; }
.delete-modal { text-align: center; width: 420px; }
.danger-icon { width: 58px; height: 58px; display: flex; align-items: center; justify-content: center; margin: 0 auto 12px; border-radius: 50%; background: #fee2e2; color: #dc2626; }
.notification { position: fixed; right: 22px; top: 22px; z-index: 10000; width: min(390px, calc(100vw - 44px)); display: grid; grid-template-columns: 36px 1fr 24px; align-items: center; gap: 10px; padding: 13px; border-radius: 12px; background: white; box-shadow: 0 12px 30px rgba(0,0,0,.16); border-left: 4px solid #00c853; }
.notification.error { border-left-color: #dc2626; }
.notification.info { border-left-color: #2563eb; }
.notification-mark { width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; border-radius: 50%; background: #dcfce7; color: #15803d; font-weight: 800; }
.notification.error .notification-mark { background: #fee2e2; color: #dc2626; }
.notification.info .notification-mark { background: #dbeafe; color: #2563eb; }
.notification strong { display: block; color: #1e293b; font-size: 12px; }
.notification p { margin: 2px 0 0; color: #64748b; font-size: 11px; }
.notification > button { border: 0; background: transparent; color: #94a3b8; cursor: pointer; font-size: 20px; }
.spin { animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
.notification-enter-active, .notification-leave-active { transition: .25s; }
.notification-enter-from, .notification-leave-to { opacity: 0; transform: translateX(20px); }
@media (max-width: 850px) {
  .test-bank-page { padding: 20px; }
  .filters-card { grid-template-columns: 1fr 1fr; }
  .search-group { grid-column: 1 / -1; }
  .options-grid { grid-template-columns: 1fr; }
}
@media (max-width: 600px) {
  .test-bank-page { padding: 15px; }
  .page-header { align-items: stretch; flex-direction: column; }
  .page-header .primary-btn { width: 100%; }
  .filters-card, .form-grid { grid-template-columns: 1fr; }
  .search-group { grid-column: auto; }
  .stats-card { align-items: flex-start; flex-direction: column; gap: 4px; }
  .question-header { flex-direction: column; }
  .actions { width: 100%; }
  .actions button { flex: 1; }
  .modal-actions { flex-direction: column-reverse; }
  .modal-actions button { width: 100%; }
}
</style>
