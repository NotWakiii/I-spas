<template>
  <div class="curriculum-page">
    <div class="page-header">
      <div>
        <h1>Manage Curriculum</h1>
        <p>Assign available subjects to each Senior High School grade level and strand.</p>
      </div>
      <button class="add-btn" @click="openAddModal">
        <Plus :size="18" />
        Add Curriculum
      </button>
    </div>
    <div v-if="successMessage" class="notification success">
      <CircleCheckBig :size="20" />
      <span>{{ successMessage }}</span>
    </div>
    <div v-if="errorMessage" class="notification error">
      <CircleAlert :size="20" />
      <span>{{ errorMessage }}</span>
    </div>
    <div class="table-card">
      <div v-if="loading" class="loading-state">
        <LoaderCircle :size="28" class="spinner" />
        <span>Loading curricula...</span>
      </div>
      <div v-else class="table-wrapper">
        <table>
          <thead>
            <tr>
              <th class="number-column">#</th>
              <th>Grade Level</th>
              <th>Strand</th>
              <th>Subjects</th>
              <th class="actions-column">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(curriculum, index) in curricula"
              :key="curriculum.id"
            >
              <td class="number-cell">
                {{ index + 1 }}
              </td>
              <td>
                <span class="grade-badge">
                  {{ curriculum.grade }}
                </span>
              </td>
              <td>
                <strong>{{ curriculum.strand?.name || 'N/A' }}</strong>
              </td>
              <td>
                <div class="subject-count">
                  <BookOpenText :size="15" />
                  <span>
                    {{ curriculum.subjects?.length || 0 }}
                    {{ curriculum.subjects?.length === 1 ? 'Subject' : 'Subjects' }}
                  </span>
                </div>
              </td>
              <td>
                <div class="action-buttons">
                  <button class="action-btn view" @click="openViewModal(curriculum)">
                    <Eye :size="16" />
                    View
                  </button>
                  <button class="action-btn edit" @click="openEditModal(curriculum)">
                    <Pencil :size="16" />
                    Edit
                  </button>
                  <button class="action-btn delete" @click="openDeleteDialog(curriculum)">
                    <Trash2 :size="16" />
                    Delete
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="curricula.length === 0">
              <td colspan="5" class="empty-state">
                <BookMarked :size="42" />
                <strong>No curriculum found</strong>
                <p>Add a curriculum to assign subjects to a grade level and strand.</p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <div v-if="showModal" class="modal-overlay" @click.self="closeModal">
      <div class="modal-card">
        <div class="modal-header">
          <div>
            <h2>{{ editingCurriculum ? 'Edit Curriculum' : 'Add Curriculum' }}</h2>
            <p>
              {{
                editingCurriculum
                  ? 'Update the grade, strand, and assigned subjects.'
                  : 'Select a grade level, strand, and the subjects under this curriculum.'
              }}
            </p>
          </div>
          <button class="close-btn" @click="closeModal">
            <X :size="20" />
          </button>
        </div>
        <form class="modal-form" @submit.prevent="saveCurriculum">
          <div class="form-row">
            <div class="form-group">
              <label>Grade Level</label>
              <select v-model="form.grade" :disabled="saving">
                <option value="">Select Grade Level</option>
                <option value="Grade 11">Grade 11</option>
                <option value="Grade 12">Grade 12</option>
              </select>
              <span v-if="formErrors.grade" class="field-error">
                {{ formErrors.grade }}
              </span>
            </div>
            <div class="form-group">
              <label>Strand</label>
              <select v-model="form.strand_id" :disabled="saving || loadingReferences">
                <option value="">Select Strand</option>
                <option v-for="strand in strands" :key="strand.id" :value="strand.id">
                  {{ strand.name }}
                </option>
              </select>
              <span v-if="formErrors.strand_id" class="field-error">
                {{ formErrors.strand_id }}
              </span>
            </div>
          </div>
          <div class="form-group">
            <div class="subject-header">
              <div>
                <label>Select Subjects</label>
                <p>Choose all subjects that belong to this grade level and strand.</p>
              </div>
              <div v-if="subjects.length > 0" class="subject-tools">
                <button type="button" class="text-btn" :disabled="saving" @click="selectAllSubjects">
                  Select All
                </button>
                <button type="button" class="text-btn clear" :disabled="saving" @click="clearSubjects">
                  Clear
                </button>
              </div>
            </div>
            <div class="search-box">
              <Search :size="17" />
              <input
                v-model="subjectSearch"
                type="text"
                placeholder="Search subjects..."
                :disabled="saving"
              />
            </div>
            <div v-if="loadingReferences" class="subject-loading">
              <LoaderCircle :size="22" class="spinner" />
              <span>Loading subjects...</span>
            </div>
            <div v-else-if="subjects.length === 0" class="no-subjects">
              <BookOpenText :size="30" />
              <strong>No subjects available</strong>
              <span>Add subjects first in Manage Subjects.</span>
            </div>
            <div v-else class="subject-list">
              <label
                v-for="subject in filteredSubjects"
                :key="subject.id"
                class="subject-option"
                :class="{ selected: form.subject_ids.includes(subject.id) }"
              >
                <div class="checkbox-wrapper">
                  <input
                    v-model="form.subject_ids"
                    type="checkbox"
                    :value="subject.id"
                    :disabled="saving"
                  />
                  <span class="custom-checkbox">
                    <Check :size="14" />
                  </span>
                </div>
                <span class="subject-name">
                  {{ subject.name }}
                </span>
              </label>
              <div v-if="filteredSubjects.length === 0" class="search-empty">
                No subjects match your search.
              </div>
            </div>
            <div class="selected-summary">
              <span>
                {{ form.subject_ids.length }}
                {{ form.subject_ids.length === 1 ? 'subject selected' : 'subjects selected' }}
              </span>
            </div>
            <span v-if="formErrors.subject_ids" class="field-error">
              {{ formErrors.subject_ids }}
            </span>
          </div>
          <div v-if="formErrorMessage" class="form-error-message">
            <CircleAlert :size="18" />
            <span>{{ formErrorMessage }}</span>
          </div>
          <div class="modal-actions">
            <button type="button" class="cancel-btn" :disabled="saving" @click="closeModal">
              Cancel
            </button>
            <button type="submit" class="save-btn" :disabled="saving || loadingReferences">
              <LoaderCircle v-if="saving" :size="17" class="spinner" />
              <Save v-else :size="17" />
              <span>
                {{
                  saving
                    ? 'Saving...'
                    : editingCurriculum
                      ? 'Update Curriculum'
                      : 'Save Curriculum'
                }}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
    <div v-if="viewingCurriculum" class="modal-overlay" @click.self="closeViewModal">
      <div class="view-card">
        <div class="modal-header">
          <div>
            <h2>Curriculum Details</h2>
            <p>Subjects assigned to this grade level and strand.</p>
          </div>
          <button class="close-btn" @click="closeViewModal">
            <X :size="20" />
          </button>
        </div>
        <div class="curriculum-summary">
          <div class="summary-box">
            <span class="summary-label">Grade Level</span>
            <strong>{{ viewingCurriculum.grade }}</strong>
          </div>
          <div class="summary-box">
            <span class="summary-label">Strand</span>
            <strong>{{ viewingCurriculum.strand?.name || 'N/A' }}</strong>
          </div>
        </div>
        <div class="view-subject-section">
          <div class="view-subject-title">
            <div>
              <h3>Assigned Subjects</h3>
              <p>
                {{ viewingCurriculum.subjects?.length || 0 }}
                {{ viewingCurriculum.subjects?.length === 1 ? 'subject' : 'subjects' }}
              </p>
            </div>
            <BookOpenText :size="21" />
          </div>
          <div v-if="viewingCurriculum.subjects?.length" class="view-subject-list">
            <div
              v-for="(subject, index) in viewingCurriculum.subjects"
              :key="subject.id"
              class="view-subject-item"
            >
              <span class="subject-number">{{ index + 1 }}</span>
              <span>{{ subject.name }}</span>
            </div>
          </div>
          <div v-else class="no-assigned-subjects">
            No subjects assigned.
          </div>
        </div>
        <div class="view-actions">
          <button class="cancel-btn" @click="closeViewModal">
            Close
          </button>
          <button class="save-btn" @click="editFromView">
            <Pencil :size="17" />
            Edit Curriculum
          </button>
        </div>
      </div>
    </div>
    <div v-if="curriculumToDelete" class="modal-overlay" @click.self="closeDeleteDialog">
      <div class="delete-card">
        <div class="delete-icon">
          <Trash2 :size="30" />
        </div>
        <h2>Delete Curriculum?</h2>
        <p>
          Are you sure you want to delete the
          <strong>
            {{ curriculumToDelete.grade }}
            {{ curriculumToDelete.strand?.name }}
          </strong>
          curriculum?
        </p>
        <p class="warning-text">
          The subject assignments under this curriculum will also be removed.
        </p>
        <div class="modal-actions">
          <button class="cancel-btn" :disabled="deleting" @click="closeDeleteDialog">
            Cancel
          </button>
          <button class="delete-confirm-btn" :disabled="deleting" @click="deleteCurriculum">
            <LoaderCircle v-if="deleting" :size="17" class="spinner" />
            <Trash2 v-else :size="17" />
            <span>
              {{ deleting ? 'Deleting...' : 'Delete Curriculum' }}
            </span>
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
import {
  BookMarked,
  BookOpenText,
  Check,
  CircleAlert,
  CircleCheckBig,
  Eye,
  LoaderCircle,
  Pencil,
  Plus,
  Save,
  Search,
  Trash2,
  X
} from '@lucide/vue'
import api from '../../services/api'

interface Strand {
  id: number
  name: string
  description?: string | null
}

interface Subject {
  id: number
  name: string
}

interface Curriculum {
  id: number
  grade: string
  strand_id: number
  strand?: Strand | null
  subjects?: Subject[]
  created_at?: string
  updated_at?: string
}

const curricula = ref<Curriculum[]>([])
const strands = ref<Strand[]>([])
const subjects = ref<Subject[]>([])
const loading = ref(false)
const loadingReferences = ref(false)
const saving = ref(false)
const deleting = ref(false)
const showModal = ref(false)
const editingCurriculum = ref<Curriculum | null>(null)
const viewingCurriculum = ref<Curriculum | null>(null)
const curriculumToDelete = ref<Curriculum | null>(null)
const successMessage = ref('')
const errorMessage = ref('')
const formErrorMessage = ref('')
const subjectSearch = ref('')

const form = reactive({
  grade: '',
  strand_id: '' as number | '',
  subject_ids: [] as number[]
})

const formErrors = reactive({
  grade: '',
  strand_id: '',
  subject_ids: ''
})

const filteredSubjects = computed(() => {
  const query = subjectSearch.value.trim().toLowerCase()

  if (!query) {
    return subjects.value
  }

  return subjects.value.filter(subject =>
    subject.name.toLowerCase().includes(query)
  )
})

function clearMessages() {
  successMessage.value = ''
  errorMessage.value = ''
  formErrorMessage.value = ''
}

function clearFormErrors() {
  formErrors.grade = ''
  formErrors.strand_id = ''
  formErrors.subject_ids = ''
}

function resetForm() {
  form.grade = ''
  form.strand_id = ''
  form.subject_ids = []
  subjectSearch.value = ''
  clearFormErrors()
  formErrorMessage.value = ''
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

async function fetchCurricula() {
  loading.value = true
  errorMessage.value = ''

  try {
    const response =
      await api.get('/admin/curricula')

    curricula.value =
      Array.isArray(response.data?.data)
        ? response.data.data
        : []
  } catch (error: any) {
    console.error(
      'CURRICULUM FETCH ERROR:',
      error
    )

    showError(
      error.response?.data?.message ||
      'Failed to load curricula.'
    )
  } finally {
    loading.value = false
  }
}

async function fetchReferences() {
  loadingReferences.value = true

  try {
    const [
      strandResponse,
      subjectResponse
    ] = await Promise.all([
      api.get('/admin/strands'),
      api.get('/admin/subjects')
    ])

    strands.value =
      Array.isArray(strandResponse.data?.data)
        ? strandResponse.data.data
        : []

    subjects.value =
      Array.isArray(subjectResponse.data?.data)
        ? subjectResponse.data.data
        : []
  } catch (error: any) {
    console.error(
      'CURRICULUM REFERENCES ERROR:',
      error
    )

    showError(
      error.response?.data?.message ||
      'Failed to load strands or subjects.'
    )
  } finally {
    loadingReferences.value = false
  }
}

function openAddModal() {
  clearMessages()
  editingCurriculum.value = null
  resetForm()
  showModal.value = true
}

function openEditModal(
  curriculum: Curriculum
) {
  clearMessages()
  clearFormErrors()

  editingCurriculum.value = curriculum

  form.grade =
    curriculum.grade

  form.strand_id =
    curriculum.strand_id

  form.subject_ids =
    curriculum.subjects?.map(
      subject => subject.id
    ) || []

  subjectSearch.value = ''

  showModal.value = true
}

function closeModal() {
  if (saving.value) {
    return
  }

  showModal.value = false
  editingCurriculum.value = null
  resetForm()
}

function openViewModal(
  curriculum: Curriculum
) {
  clearMessages()
  viewingCurriculum.value = curriculum
}

function closeViewModal() {
  viewingCurriculum.value = null
}

function editFromView() {
  if (!viewingCurriculum.value) {
    return
  }

  const curriculum =
    viewingCurriculum.value

  closeViewModal()
  openEditModal(curriculum)
}

function openDeleteDialog(
  curriculum: Curriculum
) {
  clearMessages()
  curriculumToDelete.value = curriculum
}

function closeDeleteDialog() {
  if (deleting.value) {
    return
  }

  curriculumToDelete.value = null
}

function selectAllSubjects() {
  form.subject_ids =
    subjects.value.map(
      subject => subject.id
    )
}

function clearSubjects() {
  form.subject_ids = []
}

function validateForm() {
  clearFormErrors()

  let valid = true

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

  if (form.subject_ids.length === 0) {
    formErrors.subject_ids =
      'Select at least one subject.'

    valid = false
  }

  return valid
}

async function saveCurriculum() {
  if (saving.value) {
    return
  }

  clearMessages()

  if (!validateForm()) {
    return
  }

  saving.value = true
  formErrorMessage.value = ''

  try {
    const payload = {
      grade: form.grade,
      strand_id:
        Number(form.strand_id),
      subject_ids:
        form.subject_ids
    }

    if (editingCurriculum.value) {
      await api.put(
        `/admin/curricula/${editingCurriculum.value.id}`,
        payload
      )

      showSuccess(
        'Curriculum updated successfully.'
      )
    } else {
      await api.post(
        '/admin/curricula',
        payload
      )

      showSuccess(
        'Curriculum created successfully.'
      )
    }

    showModal.value = false
    editingCurriculum.value = null

    resetForm()

    await fetchCurricula()
  } catch (error: any) {
    console.error(
      'CURRICULUM SAVE ERROR:',
      error
    )

    if (
      error.response?.status === 422
    ) {
      const errors =
        error.response?.data?.errors

      if (errors?.grade?.[0]) {
        formErrors.grade =
          errors.grade[0]
      }

      if (errors?.strand_id?.[0]) {
        formErrors.strand_id =
          errors.strand_id[0]
      }

      if (errors?.subject_ids?.[0]) {
        formErrors.subject_ids =
          errors.subject_ids[0]
      }

      if (
        errors?.['subject_ids.0']?.[0]
      ) {
        formErrors.subject_ids =
          errors['subject_ids.0'][0]
      }

      formErrorMessage.value =
        error.response?.data?.message ||
        'Please check the information you entered.'
    } else {
      formErrorMessage.value =
        error.response?.data?.message ||
        'Failed to save curriculum.'
    }
  } finally {
    saving.value = false
  }
}

async function deleteCurriculum() {
  if (
    deleting.value ||
    !curriculumToDelete.value
  ) {
    return
  }

  deleting.value = true

  const id =
    curriculumToDelete.value.id

  try {
    await api.delete(
      `/admin/curricula/${id}`
    )

    curriculumToDelete.value = null

    showSuccess(
      'Curriculum deleted successfully.'
    )

    await fetchCurricula()
  } catch (error: any) {
    console.error(
      'CURRICULUM DELETE ERROR:',
      error
    )

    showError(
      error.response?.data?.message ||
      'Failed to delete curriculum.'
    )
  } finally {
    deleting.value = false
  }
}

onMounted(async () => {
  await Promise.all([
    fetchCurricula(),
    fetchReferences()
  ])
})
</script>

<style scoped>
* {
  box-sizing: border-box;
}

.curriculum-page {
  width: 100%;
  min-height: calc(100vh - 70px);
  padding: 28px;
  background: #f4fbf6;
  font-family: 'Poppins', sans-serif;
  color: #0f172a;
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
  color: #0f172a;
  font-size: 25px;
  font-weight: 800;
}

.page-header p {
  margin: 5px 0 0;
  color: #64748b;
  font-size: 12px;
}

.add-btn {
  min-height: 42px;
  padding: 0 17px;
  border: none;
  border-radius: 9px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: #16a34a;
  color: #ffffff;
  font-family: inherit;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
}

.add-btn:hover {
  background: #15803d;
}

.notification {
  margin-bottom: 18px;
  padding: 13px 16px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  gap: 9px;
  font-size: 12px;
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

.table-card {
  overflow: hidden;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  background: #ffffff;
  box-shadow: 0 5px 20px rgba(15, 23, 42, .04);
}

.table-wrapper {
  width: 100%;
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
}

thead {
  background: #f8fafc;
}

th {
  padding: 15px 20px;
  border-bottom: 1px solid #e2e8f0;
  color: #64748b;
  font-size: 11px;
  font-weight: 700;
  text-align: left;
  text-transform: uppercase;
  letter-spacing: .04em;
}

td {
  padding: 17px 20px;
  border-bottom: 1px solid #f1f5f9;
  color: #334155;
  font-size: 12px;
}

tbody tr:last-child td {
  border-bottom: none;
}

tbody tr:hover {
  background: #fafdfb;
}

.actions-column {
  width: 290px;
}

.grade-badge {
  padding: 6px 10px;
  border-radius: 999px;
  display: inline-flex;
  background: #dcfce7;
  color: #15803d;
  font-size: 10px;
  font-weight: 700;
}
.number-column,
.number-cell {
  width: 65px;
  text-align: center;
}

.number-cell {
  color: #64748b;
  font-weight: 700;
}

.subject-count {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #475569;
  font-size: 11px;
  font-weight: 600;
}

.action-buttons {
  display: flex;
  align-items: center;
  gap: 8px;
}

.action-btn {
  min-height: 34px;
  padding: 0 11px;
  border: none;
  border-radius: 7px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-family: inherit;
  font-size: 10px;
  font-weight: 700;
  cursor: pointer;
}

.action-btn.view {
  background: #f0fdf4;
  color: #15803d;
}

.action-btn.view:hover {
  background: #dcfce7;
}

.action-btn.edit {
  background: #eff6ff;
  color: #2563eb;
}

.action-btn.edit:hover {
  background: #dbeafe;
}

.action-btn.delete {
  background: #fef2f2;
  color: #dc2626;
}

.action-btn.delete:hover {
  background: #fee2e2;
}

.loading-state,
.empty-state {
  padding: 55px 20px;
  text-align: center;
  color: #64748b;
}

.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  font-size: 12px;
}

.empty-state svg {
  margin-bottom: 10px;
  color: #94a3b8;
}

.empty-state strong {
  display: block;
  margin-bottom: 5px;
  color: #334155;
}

.empty-state p {
  margin: 0;
  font-size: 11px;
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
  -webkit-backdrop-filter: blur(5px);
}

.modal-card,
.view-card,
.delete-card {
  width: 560px;
  max-width: 100%;
  max-height: calc(100vh - 40px);
  overflow-y: auto;
  border-radius: 16px;
  background: #ffffff;
  box-shadow: 0 20px 55px rgba(0, 0, 0, .23);
}

.modal-card,
.view-card {
  padding: 26px;
}

.delete-card {
  width: 440px;
  padding: 30px;
  text-align: center;
}

.modal-header {
  margin-bottom: 22px;
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
  font-size: 11px;
  line-height: 1.6;
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

.close-btn:hover {
  background: #fee2e2;
  color: #dc2626;
}

.modal-form {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 7px;
}

.form-group label {
  color: #334155;
  font-size: 11px;
  font-weight: 700;
}

.form-group select,
.form-group input {
  width: 100%;
  height: 43px;
  padding: 0 12px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  outline: none;
  background: #ffffff;
  color: #0f172a;
  font-family: inherit;
  font-size: 12px;
}

.form-group select:focus,
.form-group input:focus {
  border-color: #16a34a;
  box-shadow: 0 0 0 3px rgba(22, 163, 74, .10);
}

.subject-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 15px;
}

.subject-header p {
  margin: 3px 0 0;
  color: #64748b;
  font-size: 10px;
}

.subject-tools {
  display: flex;
  gap: 8px;
}

.text-btn {
  padding: 0;
  border: none;
  background: transparent;
  color: #16a34a;
  font-family: inherit;
  font-size: 10px;
  font-weight: 700;
  cursor: pointer;
}

.text-btn.clear {
  color: #64748b;
}

.search-box {
  position: relative;
  margin-top: 5px;
}

.search-box svg {
  position: absolute;
  top: 50%;
  left: 12px;
  color: #94a3b8;
  transform: translateY(-50%);
}

.search-box input {
  padding-left: 38px;
}

.subject-list {
  max-height: 260px;
  padding: 8px;
  overflow-y: auto;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  background: #f8fafc;
}

.subject-option {
  min-height: 43px;
  padding: 10px 11px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
}

.subject-option:hover {
  background: #f0fdf4;
}

.subject-option.selected {
  background: #ecfdf3;
}

.checkbox-wrapper {
  position: relative;
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}

.checkbox-wrapper input {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}

.custom-checkbox {
  width: 18px;
  height: 18px;
  border: 1.5px solid #cbd5e1;
  border-radius: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #ffffff;
  color: transparent;
}

.checkbox-wrapper input:checked + .custom-checkbox {
  border-color: #16a34a;
  background: #16a34a;
  color: #ffffff;
}

.subject-name {
  color: #334155;
  font-size: 11px;
  font-weight: 600;
}

.subject-loading,
.no-subjects {
  min-height: 120px;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 7px;
  color: #64748b;
  background: #f8fafc;
  font-size: 11px;
}

.no-subjects strong {
  color: #334155;
}

.no-subjects span {
  font-size: 10px;
}

.search-empty {
  padding: 25px 10px;
  color: #94a3b8;
  font-size: 10px;
  text-align: center;
}

.selected-summary {
  display: flex;
  justify-content: flex-end;
  color: #15803d;
  font-size: 10px;
  font-weight: 700;
}

.field-error {
  color: #dc2626;
  font-size: 10px;
  line-height: 1.5;
}

.form-error-message {
  padding: 11px 12px;
  border: 1px solid #fecaca;
  border-radius: 8px;
  display: flex;
  align-items: flex-start;
  gap: 8px;
  background: #fef2f2;
  color: #dc2626;
  font-size: 10px;
  line-height: 1.6;
}

.form-error-message svg {
  flex-shrink: 0;
}

.modal-actions,
.view-actions {
  margin-top: 5px;
  display: flex;
  gap: 10px;
}

.cancel-btn,
.save-btn,
.delete-confirm-btn {
  flex: 1;
  min-height: 41px;
  border: none;
  border-radius: 8px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  font-family: inherit;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
}

.cancel-btn {
  background: #e2e8f0;
  color: #475569;
}

.cancel-btn:hover:not(:disabled) {
  background: #cbd5e1;
}

.save-btn {
  background: #16a34a;
  color: #ffffff;
}

.save-btn:hover:not(:disabled) {
  background: #15803d;
}

.delete-confirm-btn {
  background: #dc2626;
  color: #ffffff;
}

.delete-confirm-btn:hover:not(:disabled) {
  background: #b91c1c;
}

.cancel-btn:disabled,
.save-btn:disabled,
.delete-confirm-btn:disabled {
  opacity: .6;
  cursor: not-allowed;
}

.curriculum-summary {
  margin-bottom: 20px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.summary-box {
  padding: 15px;
  border: 1px solid #dcfce7;
  border-radius: 10px;
  background: #f0fdf4;
}

.summary-label {
  margin-bottom: 5px;
  display: block;
  color: #64748b;
  font-size: 9px;
  font-weight: 700;
  text-transform: uppercase;
}

.summary-box strong {
  color: #166534;
  font-size: 13px;
}

.view-subject-section {
  margin-bottom: 20px;
}

.view-subject-title {
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.view-subject-title h3 {
  margin: 0;
  color: #0f172a;
  font-size: 13px;
}

.view-subject-title p {
  margin: 3px 0 0;
  color: #64748b;
  font-size: 10px;
}

.view-subject-title svg {
  color: #16a34a;
}

.view-subject-list {
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  overflow: hidden;
}

.view-subject-item {
  min-height: 44px;
  padding: 10px 13px;
  border-bottom: 1px solid #f1f5f9;
  display: flex;
  align-items: center;
  gap: 10px;
  color: #334155;
  font-size: 11px;
  font-weight: 600;
}

.view-subject-item:last-child {
  border-bottom: none;
}

.subject-number {
  width: 25px;
  height: 25px;
  flex-shrink: 0;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #dcfce7;
  color: #15803d;
  font-size: 9px;
  font-weight: 700;
}

.no-assigned-subjects {
  padding: 25px;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  color: #94a3b8;
  font-size: 11px;
  text-align: center;
}

.delete-icon {
  width: 64px;
  height: 64px;
  margin: 0 auto 15px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fee2e2;
  color: #dc2626;
}

.delete-card p {
  margin: 10px 0 0;
  color: #64748b;
  font-size: 12px;
  line-height: 1.6;
}

.warning-text {
  color: #dc2626 !important;
  font-size: 10px !important;
}

.spinner {
  animation: spin .8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media(max-width: 768px) {
  .curriculum-page {
    min-height: calc(100vh - 60px);
    padding: 20px 16px;
  }

  .page-header {
    align-items: stretch;
    flex-direction: column;
  }

  .add-btn {
    width: 100%;
  }

  .form-row,
  .curriculum-summary {
    grid-template-columns: 1fr;
  }

  th,
  td {
    padding: 14px;
  }

  .action-buttons {
    align-items: stretch;
    flex-direction: column;
  }

  .action-btn {
    width: 100%;
  }
}

@media(max-width: 480px) {
  .curriculum-page {
    padding: 16px 12px;
  }

  .page-header h1 {
    font-size: 21px;
  }

  .modal-card,
  .view-card,
  .delete-card {
    padding: 22px;
  }

  .modal-actions,
  .view-actions {
    flex-direction: column;
  }

  .subject-header {
    flex-direction: column;
  }
}
</style>
