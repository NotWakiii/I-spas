<template>
  <div class="classes-page">
    <div class="page-header">
      <div>
        <h1>My Classes</h1>
        <p>Manage your classes, students, and assessments.</p>
      </div>
      <button class="create-btn" @click="openCreateModal">
        <Plus :size="18" />
        Create Class
      </button>
    </div>
    <div v-if="successMessage" class="notification success">
      <CircleCheckBig :size="19" />
      <span>{{ successMessage }}</span>
    </div>
    <div v-if="errorMessage" class="notification error">
      <CircleAlert :size="19" />
      <span>{{ errorMessage }}</span>
    </div>
    <div class="filters">
      <div class="search-wrapper">
        <Search :size="17" />
        <input
          v-model="search"
          type="text"
          placeholder="Search class or subject..."
        />
      </div>
      <select v-model="schoolYearFilter">
        <option value="" disabled>Select School Year</option>
        <option
          v-for="year in schoolYears"
          :key="year.id"
          :value="year.id"
        >
          {{ year.year }}
        </option>
      </select>
      <select v-model="semesterFilter">
        <option value="">All Semesters</option>
        <option value="1st Semester">1st Semester</option>
        <option value="2nd Semester">2nd Semester</option>
        <option value="3rd Semester">3rd Semester</option>
      </select>
    </div>
    <div v-if="loading" class="loading-state">
      <LoaderCircle :size="30" class="spinner" />
      <span>Loading classes...</span>
    </div>
    <div v-else-if="filteredClasses.length" class="class-grid">
      <div
        v-for="item in filteredClasses"
        :key="item.id"
        class="class-card"
        @click="openClass(item)"
      >
        <div class="class-card-top">
          <div class="subject-icon">
            <BookOpenText :size="23" />
          </div>
          <div class="card-actions" @click.stop>
            <button
              class="icon-btn"
              title="Edit class"
              @click="openEditModal(item)"
            >
              <Pencil :size="16" />
            </button>
            <button
              class="icon-btn delete"
              title="Delete class"
              @click="openDeleteDialog(item)"
            >
              <Trash2 :size="16" />
            </button>
          </div>
        </div>
        <div class="class-main">
          <h3>{{ item.subject?.name || 'Unnamed Subject' }}</h3>
          <p>
            {{ item.grade }} •
            {{ item.strand?.name || 'No Strand' }} •
            {{ item.section_data?.section || item.section || 'No Section' }}
          </p>
        </div>
        <div class="academic-info">
          <span>
            <CalendarDays :size="14" />
            {{ item.school_year?.year || 'No School Year' }}
          </span>
          <span>
            <Layers3 :size="14" />
            {{ item.semester || 'No Semester' }}
          </span>
        </div>
        <div class="class-code-box" @click.stop>
          <div class="class-code-content">
            <span class="class-code-label">Class Code</span>
            <strong>{{ item.class_code || 'No code' }}</strong>
          </div>

          <button
            v-if="item.class_code"
            type="button"
            class="copy-code-btn"
            @click="copyClassCode(item.class_code)"
          >
            Copy
          </button>
        </div>
        <div class="card-divider"></div>
        <button class="open-class-btn">
          Open Class
          <ChevronRight :size="17" />
        </button>
      </div>
    </div>
    <div v-else class="empty-state">
      <div class="empty-icon">
        <School :size="40" />
      </div>
      <h3>No classes found</h3>
      <p v-if="search || schoolYearFilter || semesterFilter">
        Try changing your search or filters.
      </p>
      <p v-else>
        Create your first class to start managing students and assessments.
      </p>
      <button
        v-if="!search && !schoolYearFilter && !semesterFilter"
        class="create-empty-btn"
        @click="openCreateModal"
      >
        <Plus :size="17" />
        Create Class
      </button>
    </div>
    <div
      v-if="showModal"
      class="modal-overlay"
      @click.self="closeModal"
    >
      <div class="modal-card">
        <div class="modal-header">
          <div>
            <h2>
              {{ editingClass ? 'Edit Class' : 'Create Class' }}
            </h2>
            <p>
              {{
                editingClass
                  ? 'Update the academic information for this class.'
                  : 'Set up a new class using the academic records configured by the administrator.'
              }}
            </p>
          </div>
          <button class="close-btn" @click="closeModal">
            <X :size="20" />
          </button>
        </div>
        <form class="class-form" @submit.prevent="saveClass">
          <div class="form-row">
            <div class="form-group">
              <label>School Year</label>
              <select v-model="form.school_year_id">
                <option value="">Select School Year</option>
                <option
                  v-for="year in schoolYears"
                  :key="year.id"
                  :value="year.id"
                >
                  {{ year.year }}
                  {{ year.status === 'active' ? ' - Active' : '' }}
                </option>
              </select>
              <span
                v-if="formErrors.school_year_id"
                class="field-error"
              >
                {{ formErrors.school_year_id }}
              </span>
            </div>
            <div class="form-group">
              <label>Semester</label>
              <select v-model="form.semester">
                <option value="">Select Semester</option>
                <option value="1st Semester">1st Semester</option>
                <option value="2nd Semester">2nd Semester</option>
                <option value="3rd Semester">3rd Semester</option>
              </select>
              <span
                v-if="formErrors.semester"
                class="field-error"
              >
                {{ formErrors.semester }}
              </span>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Grade Level</label>
              <select
                v-model="form.grade"
                @change="handleGradeChange"
              >
                <option value="">Select Grade Level</option>
                <option value="Grade 11">Grade 11</option>
                <option value="Grade 12">Grade 12</option>
              </select>
              <span
                v-if="formErrors.grade"
                class="field-error"
              >
                {{ formErrors.grade }}
              </span>
            </div>
            <div class="form-group">
              <label>Strand</label>
              <select
                v-model="form.strand_id"
                :disabled="!form.grade"
                @change="handleStrandChange"
              >
                <option value="">Select Strand</option>
                <option
                  v-for="strand in availableStrands"
                  :key="strand.id"
                  :value="strand.id"
                >
                  {{ strand.name }}
                </option>
              </select>
              <span
                v-if="formErrors.strand_id"
                class="field-error"
              >
                {{ formErrors.strand_id }}
              </span>
            </div>
          </div>
          <div class="form-row">
            <div class="form-group">
              <label>Section</label>
              <select
                v-model="form.section_id"
                :disabled="!form.grade || !form.strand_id"
              >
                <option value="">Select Section</option>
                <option
                  v-for="section in availableSections"
                  :key="section.id"
                  :value="section.id"
                >
                  {{ section.section }}
                </option>
              </select>
              <span
                v-if="formErrors.section_id"
                class="field-error"
              >
                {{ formErrors.section_id }}
              </span>
            </div>
            <div class="form-group">
              <label>Subject</label>
              <select
                v-model="form.subject_id"
                :disabled="!form.grade || !form.strand_id"
              >
                <option value="">Select Subject</option>
                <option
                  v-for="subject in availableSubjects"
                  :key="subject.id"
                  :value="subject.id"
                >
                  {{ subject.name }}
                </option>
              </select>
              <span
                v-if="formErrors.subject_id"
                class="field-error"
              >
                {{ formErrors.subject_id }}
              </span>
            </div>
          </div>
          <div
            v-if="
              form.grade &&
              form.strand_id &&
              availableSubjects.length === 0
            "
            class="info-message"
          >
            <CircleAlert :size="17" />
            <span>
              No subjects are configured in the curriculum for this grade and strand.
            </span>
          </div>
          <div
            v-if="
              form.grade &&
              form.strand_id &&
              availableSections.length === 0
            "
            class="info-message"
          >
            <CircleAlert :size="17" />
            <span>
              No sections are available for this grade and strand.
            </span>
          </div>
          <div
            v-if="formErrorMessage"
            class="form-error-message"
          >
            <CircleAlert :size="17" />
            <span>{{ formErrorMessage }}</span>
          </div>
          <div class="modal-actions">
            <button
              type="button"
              class="cancel-btn"
              :disabled="saving"
              @click="closeModal"
            >
              Cancel
            </button>
            <button
              type="submit"
              class="save-btn"
              :disabled="saving"
            >
              <LoaderCircle
                v-if="saving"
                :size="17"
                class="spinner"
              />
              <Save v-else :size="17" />
              {{
                saving
                  ? 'Saving...'
                  : editingClass
                    ? 'Update Class'
                    : 'Create Class'
              }}
            </button>
          </div>
        </form>
      </div>
    </div>
    <div
      v-if="classToDelete"
      class="modal-overlay"
      @click.self="closeDeleteDialog"
    >
      <div class="delete-card">
        <div class="delete-icon">
          <Trash2 :size="30" />
        </div>
        <h2>Delete Class?</h2>
        <p>
          Are you sure you want to delete
          <strong>
            {{ classToDelete.subject?.name }}
          </strong>?
        </p>
        <div class="delete-details">
          {{ classToDelete.grade }}
          • {{ classToDelete.strand?.name }}
          •
          {{
            classToDelete.section_data?.section ||
            classToDelete.section
          }}
        </div>
        <p class="warning-text">
          Classes containing assessments cannot be deleted.
        </p>
        <div class="modal-actions">
          <button
            class="cancel-btn"
            :disabled="deleting"
            @click="closeDeleteDialog"
          >
            Cancel
          </button>
          <button
            class="delete-confirm-btn"
            :disabled="deleting"
            @click="deleteClass"
          >
            <LoaderCircle
              v-if="deleting"
              :size="17"
              class="spinner"
            />
            <Trash2 v-else :size="17" />
            {{ deleting ? 'Deleting...' : 'Delete Class' }}
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
  reactive,
  ref
} from 'vue'
import { useRouter } from 'vue-router'
import {
  BookOpenText,
  CalendarDays,
  ChevronRight,
  CircleAlert,
  CircleCheckBig,
  Layers3,
  LoaderCircle,
  Pencil,
  Plus,
  Save,
  School,
  Search,
  Trash2,
  X
} from '@lucide/vue'
import api from '../services/api'

interface SchoolYear {
  id: number
  year: string
  status: string
}
interface Strand {
  id: number
  name: string
}
interface Section {
  id: number
  grade: string
  strand_id: number
  section: string
}
interface Subject {
  id: number
  name: string
}
interface Curriculum {
  id: number
  grade: string
  strand_id: number
  strand?: Strand
  subjects: Subject[]
}
interface SchoolClass {
  id: number
  faculty_id: number
  class_code: string | null
  school_year_id: number
  semester: string
  grade: string
  strand_id: number
  section_id: number
  subject_id: number
  section: string
  school_year?: SchoolYear
  strand?: Strand
  section_data?: Section
  subject?: Subject
  students_count?: number
  exams_count?: number
}
const router = useRouter()
const classes = ref<SchoolClass[]>([])
const schoolYears = ref<SchoolYear[]>([])
const strands = ref<Strand[]>([])
const sections = ref<Section[]>([])
const curricula = ref<Curriculum[]>([])
const loading = ref(true)
const saving = ref(false)
const deleting = ref(false)
const showModal = ref(false)
const editingClass = ref<SchoolClass | null>(null)
const classToDelete = ref<SchoolClass | null>(null)
const search = ref('')
const schoolYearFilter = ref<number | ''>('')
const semesterFilter = ref('')
const successMessage = ref('')
const errorMessage = ref('')
const formErrorMessage = ref('')
const form = reactive({
  school_year_id: '' as number | '',
  semester: '',
  grade: '',
  strand_id: '' as number | '',
  section_id: '' as number | '',
  subject_id: '' as number | ''
})
const formErrors = reactive({
  school_year_id: '',
  semester: '',
  grade: '',
  strand_id: '',
  section_id: '',
  subject_id: ''
})
const availableStrands = computed(() => {
  if (!form.grade) return []
  const ids = new Set(
    curricula.value
      .filter(item => item.grade === form.grade)
      .map(item => Number(item.strand_id))
  )
  return strands.value.filter(
    strand => ids.has(Number(strand.id))
  )
})
const availableSections = computed(() => {
  if (!form.grade || !form.strand_id) return []
  return sections.value.filter(section =>
    section.grade === form.grade &&
    Number(section.strand_id) ===
      Number(form.strand_id)
  )
})
const availableSubjects = computed(() => {
  if (!form.grade || !form.strand_id) return []
  const curriculum = curricula.value.find(item =>
    item.grade === form.grade &&
    Number(item.strand_id) ===
      Number(form.strand_id)
  )
  return curriculum?.subjects || []
})
const filteredClasses = computed(() => {
  const query = search.value
    .trim()
    .toLowerCase()
  return classes.value.filter(item => {
    const text = [
      item.subject?.name,
      item.grade,
      item.strand?.name,
      item.section_data?.section,
      item.section,
      item.school_year?.year,
      item.semester
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()
    const matchesSearch =
      !query || text.includes(query)
    const matchesYear =
      !schoolYearFilter.value ||
      Number(item.school_year_id) ===
        Number(schoolYearFilter.value)
    const matchesSemester =
      !semesterFilter.value ||
      item.semester === semesterFilter.value
    return (
      matchesSearch &&
      matchesYear &&
      matchesSemester
    )
  })
})
function clearErrors() {
  formErrors.school_year_id = ''
  formErrors.semester = ''
  formErrors.grade = ''
  formErrors.strand_id = ''
  formErrors.section_id = ''
  formErrors.subject_id = ''
  formErrorMessage.value = ''
}
function resetForm() {
  form.school_year_id = ''
  form.semester = ''
  form.grade = ''
  form.strand_id = ''
  form.section_id = ''
  form.subject_id = ''
  clearErrors()
}
function showSuccess(message: string) {
  successMessage.value = message
  window.setTimeout(() => {
    successMessage.value = ''
  }, 3500)
}
function showError(message: string) {
  errorMessage.value = message
  window.setTimeout(() => {
    errorMessage.value = ''
  }, 4000)
}
async function fetchOptions() {
  const response = await api.get(
    '/faculty/classes/options'
  )
  const data = response.data?.data || {}
  schoolYears.value =
    data.school_years || []
  strands.value =
    data.strands || []
  sections.value =
    data.sections || []
  curricula.value =
    data.curricula || []

  const activeYear =
  schoolYears.value.find(
    year => year.status ==='active'
  )
  if (activeYear) {
    form.school_year_id = activeYear.id
  }
}
async function fetchClasses() {
  const response = await api.get(
    '/faculty/classes'
  )

  classes.value = Array.isArray(
    response.data?.data
  )
    ? response.data.data
    : []

  // Find a class under the active school year
  const activeClass = classes.value.find(
    item =>
      String(
        item.school_year?.status || ''
      ).toLowerCase() === 'active'
  )

  // Automatically filter My Classes
  // using the active school year and semester
  if (activeClass) {
    schoolYearFilter.value =
      Number(activeClass.school_year_id)

    semesterFilter.value =
      activeClass.semester || ''
  }
}
async function loadPage() {
  loading.value = true
  errorMessage.value = ''
  try {
    await Promise.all([
      fetchOptions(),
      fetchClasses()
    ])
  } catch (error: any) {
    console.error(
      'MY CLASSES LOAD ERROR:',
      error
    )
    showError(
      error.response?.data?.message ||
      'Failed to load your classes.'
    )
  } finally {
    loading.value = false
  }
}
function openCreateModal() {
  resetForm()
  editingClass.value = null
  const activeYear = schoolYears.value.find(
    year => year.status === 'active'
  )
  if (activeYear) {
    form.school_year_id = activeYear.id
  }
  showModal.value = true
}
function openEditModal(item: SchoolClass) {
  resetForm()
  editingClass.value = item
  form.school_year_id =
    item.school_year_id
  form.semester = item.semester
  form.grade = item.grade
  form.strand_id = item.strand_id
  form.section_id = item.section_id
  form.subject_id = item.subject_id
  showModal.value = true
}
function closeModal() {
  if (saving.value) return
  showModal.value = false
  editingClass.value = null
  resetForm()
}
function handleGradeChange() {
  form.strand_id = ''
  form.section_id = ''
  form.subject_id = ''
}
function handleStrandChange() {
  form.section_id = ''
  form.subject_id = ''
}
function validateForm() {
  clearErrors()
  let valid = true
  if (!form.school_year_id) {
    formErrors.school_year_id =
      'School year is required.'
    valid = false
  }
  if (!form.semester) {
    formErrors.semester =
      'Semester is required.'
    valid = false
  }
  if (!form.grade) {
    formErrors.grade =
      'Grade level is required.'
    valid = false
  }
  if (!form.strand_id) {
    formErrors.strand_id =
      'Strand is required.'
    valid = false
  }
  if (!form.section_id) {
    formErrors.section_id =
      'Section is required.'
    valid = false
  }
  if (!form.subject_id) {
    formErrors.subject_id =
      'Subject is required.'
    valid = false
  }
  return valid
}
async function saveClass() {
  if (!validateForm() || saving.value) return
  saving.value = true
  try {
    const payload = {
      school_year_id:
        Number(form.school_year_id),
      semester: form.semester,
      grade: form.grade,
      strand_id:
        Number(form.strand_id),
      section_id:
        Number(form.section_id),
      subject_id:
        Number(form.subject_id)
    }
    if (editingClass.value) {
      await api.put(
        `/faculty/classes/${editingClass.value.id}`,
        payload
      )
      showSuccess(
        'Class updated successfully.'
      )
    } else {
      await api.post(
        '/faculty/classes',
        payload
      )
      showSuccess(
        'Class created successfully.'
      )
    }
    showModal.value = false
    editingClass.value = null
    resetForm()
    await fetchClasses()
  } catch (error: any) {
    console.error(
      'CLASS SAVE ERROR:',
      error
    )
    if (
      error.response?.status === 422 &&
      error.response?.data?.errors
    ) {
      const errors =
        error.response.data.errors
      if (errors.school_year_id?.[0]) {
        formErrors.school_year_id =
          errors.school_year_id[0]
      }
      if (errors.semester?.[0]) {
        formErrors.semester =
          errors.semester[0]
      }
      if (errors.grade?.[0]) {
        formErrors.grade =
          errors.grade[0]
      }
      if (errors.strand_id?.[0]) {
        formErrors.strand_id =
          errors.strand_id[0]
      }
      if (errors.section_id?.[0]) {
        formErrors.section_id =
          errors.section_id[0]
      }
      if (errors.subject_id?.[0]) {
        formErrors.subject_id =
          errors.subject_id[0]
      }
    }
    formErrorMessage.value =
      error.response?.data?.message ||
      'Failed to save class.'
  } finally {
    saving.value = false
  }
}
async function copyClassCode(code: string) {
  if (!code) return

  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(code)
    } else {
      const textarea = document.createElement('textarea')

      textarea.value = code
      textarea.style.position = 'fixed'
      textarea.style.opacity = '0'

      document.body.appendChild(textarea)

      textarea.focus()
      textarea.select()

      document.execCommand('copy')

      document.body.removeChild(textarea)
    }

    showSuccess(`Class code ${code} copied.`)
  } catch (error) {
    console.error('COPY CLASS CODE ERROR:', error)
    showError('Failed to copy class code.')
  }
}
function openClass(item: SchoolClass) {
  router.push(`/faculty/classes/${item.id}`)
}
function openDeleteDialog(
  item: SchoolClass
) {
  classToDelete.value = item
}
function closeDeleteDialog() {
  if (deleting.value) return
  classToDelete.value = null
}
async function deleteClass() {
  if (
    !classToDelete.value ||
    deleting.value
  ) return
  deleting.value = true
  try {
    await api.delete(
      `/faculty/classes/${classToDelete.value.id}`
    )
    classToDelete.value = null
    showSuccess(
      'Class deleted successfully.'
    )
    await fetchClasses()
  } catch (error: any) {
    console.error(
      'CLASS DELETE ERROR:',
      error
    )
    showError(
      error.response?.data?.message ||
      'Failed to delete class.'
    )
  } finally {
    deleting.value = false
  }
}
onMounted(loadPage)
</script>

<style scoped>
* {
  box-sizing: border-box;
}
.classes-page {
  width: 100%;
  min-height: calc(100vh - 70px);
  padding: 28px;
  background: #f7faf8;
  color: #0f172a;
  font-family: 'Poppins', sans-serif;
}
.page-header {
  margin-bottom: 22px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
}
.page-header h1 {
  margin: 0;
  font-size: 25px;
  font-weight: 800;
}
.page-header p {
  margin: 5px 0 0;
  color: #64748b;
  font-size: 12px;
}
.create-btn,
.create-empty-btn {
  min-height: 42px;
  padding: 0 17px;
  border: none;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  background: #00c853;
  color: #fff;
  font-family: inherit;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
}
.create-btn:hover,
.create-empty-btn:hover {
  background: #00b34a;
}
.notification {
  margin-bottom: 17px;
  padding: 12px 15px;
  border-radius: 9px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
  font-weight: 600;
}
.notification.success {
  border: 1px solid #bbf7d0;
  background: #f0fdf4;
  color: #15803d;
}
.notification.error {
  border: 1px solid #fecaca;
  background: #fef2f2;
  color: #dc2626;
}
.filters {
  margin-bottom: 20px;
  padding: 14px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  display: grid;
  grid-template-columns: minmax(230px, 1fr) 190px 190px;
  gap: 10px;
  background: #fff;
}
.search-wrapper {
  position: relative;
}
.search-wrapper svg {
  position: absolute;
  top: 50%;
  left: 12px;
  color: #94a3b8;
  transform: translateY(-50%);
}
.search-wrapper input,
.filters select {
  width: 100%;
  height: 40px;
  border: 1px solid #dbe3eb;
  border-radius: 8px;
  outline: none;
  background: #fff;
  color: #334155;
  font-family: inherit;
  font-size: 11px;
}
.search-wrapper input {
  padding: 0 12px 0 38px;
}
.filters select {
  padding: 0 10px;
}
.search-wrapper input:focus,
.filters select:focus {
  border-color: #22c55e;
  box-shadow: 0 0 0 3px rgba(34, 197, 94, .09);
}
.class-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 17px;
}
.class-card {
  padding: 19px;
  border: 1px solid #e1e8e4;
  border-radius: 14px;
  background: #fff;
  box-shadow: 0 4px 15px rgba(15, 23, 42, .035);
  cursor: pointer;
  transition:
    transform .18s ease,
    box-shadow .18s ease,
    border-color .18s ease;
}
.class-card:hover {
  border-color: #86efac;
  box-shadow: 0 10px 25px rgba(22, 163, 74, .08);
  transform: translateY(-2px);
}
.class-card-top {
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.subject-icon {
  width: 43px;
  height: 43px;
  border-radius: 11px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #e8f8ee;
  color: #00a843;
}
.card-actions {
  display: flex;
  gap: 5px;
}
.icon-btn {
  width: 31px;
  height: 31px;
  border: none;
  border-radius: 7px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f1f5f9;
  color: #475569;
  cursor: pointer;
}
.icon-btn:hover {
  background: #e8f8ee;
  color: #15803d;
}
.icon-btn.delete:hover {
  background: #fef2f2;
  color: #dc2626;
}
.class-main h3 {
  margin: 0;
  color: #0f172a;
  font-size: 14px;
  font-weight: 800;
}
.class-main p {
  margin: 6px 0 0;
  min-height: 34px;
  color: #64748b;
  font-size: 10px;
  line-height: 1.6;
}
.academic-info {
  margin-top: 14px;
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
}
.academic-info span {
  padding: 6px 8px;
  border-radius: 7px;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  background: #f0fdf4;
  color: #166534;
  font-size: 9px;
  font-weight: 600;
}
.class-code-box {
  margin-top: 12px;
  padding: 10px 11px;
  border: 1px dashed #86efac;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  background: #f0fdf4;
}

.class-code-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.class-code-label {
  color: #64748b;
  font-size: 8px;
  font-weight: 600;
  text-transform: uppercase;
}

.class-code-content strong {
  color: #15803d;
  font-size: 15px;
  font-weight: 800;
  letter-spacing: 2px;
}

.copy-code-btn {
  min-height: 30px;
  padding: 0 11px;
  border: 1px solid #bbf7d0;
  border-radius: 7px;
  background: #fff;
  color: #15803d;
  font-family: inherit;
  font-size: 9px;
  font-weight: 700;
  cursor: pointer;
}

.copy-code-btn:hover {
  background: #dcfce7;
}
.card-divider {
  height: 1px;
  margin: 16px 0;
  background: #eef2f0;
}
.class-stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}
.class-stats > div {
  display: flex;
  align-items: center;
  gap: 7px;
  color: #64748b;
}
.class-stats svg {
  color: #16a34a;
}
.class-stats span {
  display: flex;
  flex-direction: column;
  font-size: 8px;
}
.class-stats strong {
  color: #0f172a;
  font-size: 13px;
}
.open-class-btn {
  width: 100%;
  height: 37px;
  margin-top: 17px;
  border: none;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  background: #ecfdf3;
  color: #15803d;
  font-family: inherit;
  font-size: 10px;
  font-weight: 700;
  cursor: pointer;
}
.class-card:hover .open-class-btn {
  background: #dcfce7;
}
.loading-state,
.empty-state {
  min-height: 360px;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  background: #fff;
  color: #64748b;
}
.loading-state {
  flex-direction: row;
  gap: 9px;
  font-size: 11px;
}
.empty-icon {
  width: 66px;
  height: 66px;
  margin-bottom: 13px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f0fdf4;
  color: #16a34a;
}
.empty-state h3 {
  margin: 0;
  color: #0f172a;
  font-size: 15px;
}
.empty-state p {
  max-width: 390px;
  margin: 6px 0 16px;
  color: #94a3b8;
  font-size: 10px;
  text-align: center;
}
.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 10000;
  padding: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(15, 23, 42, .55);
  backdrop-filter: blur(5px);
}
.modal-card,
.delete-card {
  max-width: 100%;
  max-height: calc(100vh - 40px);
  overflow-y: auto;
  border-radius: 16px;
  background: #fff;
  box-shadow: 0 20px 55px rgba(0, 0, 0, .22);
}
.modal-card {
  width: 620px;
  padding: 26px;
}
.delete-card {
  width: 430px;
  padding: 30px;
  text-align: center;
}
.modal-header {
  margin-bottom: 21px;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 15px;
}
.modal-header h2,
.delete-card h2 {
  margin: 0;
  color: #0f172a;
  font-size: 19px;
}
.modal-header p {
  margin: 5px 0 0;
  color: #64748b;
  font-size: 10px;
  line-height: 1.5;
}
.close-btn {
  width: 34px;
  height: 34px;
  flex-shrink: 0;
  border: none;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f1f5f9;
  color: #475569;
  cursor: pointer;
}
.class-form {
  display: flex;
  flex-direction: column;
  gap: 15px;
}
.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 13px;
}
.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.form-group label {
  color: #334155;
  font-size: 10px;
  font-weight: 700;
}
.form-group select {
  width: 100%;
  height: 42px;
  padding: 0 11px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  outline: none;
  background: #fff;
  color: #0f172a;
  font-family: inherit;
  font-size: 11px;
}
.form-group select:focus {
  border-color: #16a34a;
  box-shadow: 0 0 0 3px rgba(22, 163, 74, .09);
}
.form-group select:disabled {
  background: #f8fafc;
  color: #94a3b8;
  cursor: not-allowed;
}
.field-error {
  color: #dc2626;
  font-size: 9px;
}
.info-message,
.form-error-message {
  padding: 10px 12px;
  border-radius: 8px;
  display: flex;
  align-items: flex-start;
  gap: 7px;
  font-size: 9px;
}
.info-message {
  border: 1px solid #fed7aa;
  background: #fff7ed;
  color: #c2410c;
}
.form-error-message {
  border: 1px solid #fecaca;
  background: #fef2f2;
  color: #dc2626;
}
.modal-actions {
  margin-top: 5px;
  display: flex;
  gap: 9px;
}
.cancel-btn,
.save-btn,
.delete-confirm-btn {
  flex: 1;
  min-height: 40px;
  border: none;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-family: inherit;
  font-size: 10px;
  font-weight: 700;
  cursor: pointer;
}
.cancel-btn {
  background: #e2e8f0;
  color: #475569;
}
.save-btn {
  background: #00c853;
  color: #fff;
}
.delete-confirm-btn {
  background: #dc2626;
  color: #fff;
}
.cancel-btn:disabled,
.save-btn:disabled,
.delete-confirm-btn:disabled {
  opacity: .6;
  cursor: not-allowed;
}
.delete-icon {
  width: 62px;
  height: 62px;
  margin: 0 auto 14px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fee2e2;
  color: #dc2626;
}
.delete-card p {
  margin: 9px 0 0;
  color: #64748b;
  font-size: 11px;
  line-height: 1.5;
}
.delete-details {
  margin-top: 11px;
  padding: 9px;
  border-radius: 8px;
  background: #f8fafc;
  color: #475569;
  font-size: 9px;
}
.warning-text {
  color: #dc2626 !important;
  font-size: 9px !important;
}
.spinner {
  animation: spin .8s linear infinite;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
@media(max-width: 1100px) {
  .class-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
@media(max-width: 760px) {
  .classes-page {
    padding: 20px 16px;
  }
  .page-header {
    align-items: stretch;
    flex-direction: column;
  }
  .filters {
    grid-template-columns: 1fr;
  }
  .class-grid {
    grid-template-columns: 1fr;
  }
  .form-row {
    grid-template-columns: 1fr;
  }
}
@media(max-width: 480px) {
  .classes-page {
    padding: 16px 12px;
  }
  .modal-card,
  .delete-card {
    padding: 21px;
  }
  .modal-actions {
    flex-direction: column;
  }
}
</style>
