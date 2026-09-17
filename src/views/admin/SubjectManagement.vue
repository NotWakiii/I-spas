<template>
  <div class="subject-page">
    <div class="page-header">
      <div>
        <h1>Manage Subjects</h1>
        <p>Create and manage the available subjects within the Senior High School department.</p>
      </div>
      <button class="add-btn" @click="openAddModal">
        <Plus :size="18" />
        Add Subject
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
        <span>Loading subjects...</span>
      </div>
      <div v-else class="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Subject Name</th>
              <th class="actions-column">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="subject in subjects" :key="subject.id">
              <td>
                <strong>{{ subject.name }}</strong>
              </td>
              <td>
                <div class="action-buttons">
                  <button
                    class="action-btn edit"
                    @click="openEditModal(subject)"
                  >
                    <Pencil :size="16" />
                    Edit
                  </button>
                  <button
                    class="action-btn delete"
                    @click="openDeleteDialog(subject)"
                  >
                    <Trash2 :size="16" />
                    Delete
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="subjects.length === 0">
              <td colspan="2" class="empty-state">
                <BookOpenText :size="42" />
                <strong>No subjects found</strong>
                <p>Add a subject to get started.</p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
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
              {{
                editingSubject
                  ? 'Edit Subject'
                  : 'Add Subject'
              }}
            </h2>
            <p>
              {{
                editingSubject
                  ? 'Update the subject information.'
                  : 'Add a new Senior High School subject.'
              }}
            </p>
          </div>
          <button
            class="close-btn"
            @click="closeModal"
          >
            <X :size="20" />
          </button>
        </div>
        <form
          class="modal-form"
          @submit.prevent="saveSubject"
        >
          <div class="form-group">
            <label>Subject Name</label>
            <input
              v-model="form.name"
              type="text"
              placeholder="Example: General Mathematics"
              maxlength="150"
              :disabled="saving"
            />
            <span
              v-if="formErrors.name"
              class="field-error"
            >
              {{ formErrors.name }}
            </span>
          </div>
          <div
            v-if="formErrorMessage"
            class="form-error-message"
          >
            <CircleAlert :size="18" />
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
              <Save
                v-else
                :size="17"
              />
              <span>
                {{
                  saving
                    ? 'Saving...'
                    : editingSubject
                      ? 'Update Subject'
                      : 'Add Subject'
                }}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
    <div
      v-if="subjectToDelete"
      class="modal-overlay"
      @click.self="subjectToDelete = null"
    >
      <div class="delete-card">
        <div class="delete-icon">
          <Trash2 :size="30" />
        </div>
        <h2>Delete Subject?</h2>
        <p>
          Are you sure you want to delete
          <strong>{{ subjectToDelete.name }}</strong>?
        </p>
        <p class="warning-text">
          This action cannot be undone.
        </p>
        <div class="modal-actions">
          <button
            class="cancel-btn"
            :disabled="deleting"
            @click="subjectToDelete = null"
          >
            Cancel
          </button>
          <button
            class="delete-confirm-btn"
            :disabled="deleting"
            @click="deleteSubject"
          >
            <LoaderCircle
              v-if="deleting"
              :size="17"
              class="spinner"
            />
            <Trash2
              v-else
              :size="17"
            />
            <span>
              {{
                deleting
                  ? 'Deleting...'
                  : 'Delete Subject'
              }}
            </span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  onMounted,
  reactive,
  ref
} from 'vue'
import {
  BookOpenText,
  CircleAlert,
  CircleCheckBig,
  LoaderCircle,
  Pencil,
  Plus,
  Save,
  Trash2,
  X
} from '@lucide/vue'
import api from '../../services/api'

interface Subject {
  id: number
  name: string
  created_at?: string
  updated_at?: string
}

const subjects = ref<Subject[]>([])
const loading = ref(false)
const saving = ref(false)
const deleting = ref(false)
const showModal = ref(false)
const editingSubject = ref<Subject | null>(null)
const subjectToDelete = ref<Subject | null>(null)
const successMessage = ref('')
const errorMessage = ref('')
const formErrorMessage = ref('')

const form = reactive({
  name: ''
})

const formErrors = reactive({
  name: ''
})

function clearMessages() {
  successMessage.value = ''
  errorMessage.value = ''
  formErrorMessage.value = ''
}

function clearFormErrors() {
  formErrors.name = ''
}

function resetForm() {
  form.name = ''
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

async function fetchSubjects() {
  loading.value = true
  errorMessage.value = ''

  try {
    const response =
      await api.get('/admin/subjects')

    subjects.value =
      Array.isArray(response.data?.data)
        ? response.data.data
        : []
  } catch (error: any) {
    console.error(
      'SUBJECT FETCH ERROR:',
      error
    )

    showError(
      error.response?.data?.message ||
      'Failed to load subjects.'
    )
  } finally {
    loading.value = false
  }
}

function openAddModal() {
  clearMessages()
  editingSubject.value = null
  resetForm()
  showModal.value = true
}

function openEditModal(
  subject: Subject
) {
  clearMessages()
  clearFormErrors()

  editingSubject.value = subject
  form.name = subject.name
  showModal.value = true
}

function closeModal() {
  if (saving.value) {
    return
  }

  showModal.value = false
  editingSubject.value = null
  resetForm()
}

function validateForm() {
  clearFormErrors()

  let valid = true

  if (!form.name.trim()) {
    formErrors.name =
      'Subject name is required.'

    valid = false
  }

  if (
    form.name.trim().length > 150
  ) {
    formErrors.name =
      'Subject name must not exceed 150 characters.'

    valid = false
  }

  return valid
}

async function saveSubject() {
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
      name: form.name.trim()
    }

    if (editingSubject.value) {
      await api.put(
        `/admin/subjects/${editingSubject.value.id}`,
        payload
      )

      showSuccess(
        'Subject updated successfully.'
      )
    } else {
      await api.post(
        '/admin/subjects',
        payload
      )

      showSuccess(
        'Subject added successfully.'
      )
    }

    showModal.value = false
    editingSubject.value = null

    resetForm()

    await fetchSubjects()
  } catch (error: any) {
    console.error(
      'SUBJECT SAVE ERROR:',
      error
    )

    if (
      error.response?.status === 422
    ) {
      const errors =
        error.response?.data?.errors

      if (errors?.name?.[0]) {
        formErrors.name =
          errors.name[0]
      }

      formErrorMessage.value =
        error.response?.data?.message ||
        'Please check the information you entered.'
    } else {
      formErrorMessage.value =
        error.response?.data?.message ||
        'Failed to save subject.'
    }
  } finally {
    saving.value = false
  }
}

function openDeleteDialog(
  subject: Subject
) {
  clearMessages()
  subjectToDelete.value = subject
}

async function deleteSubject() {
  if (
    deleting.value ||
    !subjectToDelete.value
  ) {
    return
  }

  deleting.value = true

  const id =
    subjectToDelete.value.id

  const subjectName =
    subjectToDelete.value.name

  try {
    await api.delete(
      `/admin/subjects/${id}`
    )

    subjectToDelete.value = null

    showSuccess(
      `Subject ${subjectName} deleted successfully.`
    )

    await fetchSubjects()
  } catch (error: any) {
    console.error(
      'SUBJECT DELETE ERROR:',
      error
    )

    showError(
      error.response?.data?.message ||
      'Failed to delete subject.'
    )
  } finally {
    deleting.value = false
  }
}

onMounted(() => {
  fetchSubjects()
})
</script>

<style scoped>
* {
  box-sizing: border-box;
}

.subject-page {
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
  width: 220px;
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
.delete-card {
  width: 440px;
  max-width: 100%;
  border-radius: 16px;
  background: #ffffff;
  box-shadow: 0 20px 55px rgba(0, 0, 0, .23);
}

.modal-card {
  padding: 26px;
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

.form-group input:focus {
  border-color: #16a34a;
  box-shadow: 0 0 0 3px rgba(22, 163, 74, .10);
}

.form-group input:disabled {
  background: #f8fafc;
  cursor: not-allowed;
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

.modal-actions {
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

.delete-card {
  padding: 30px;
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
  .subject-page {
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
  .subject-page {
    padding: 16px 12px;
  }

  .page-header h1 {
    font-size: 21px;
  }

  .modal-card,
  .delete-card {
    padding: 22px;
  }

  .modal-actions {
    flex-direction: column;
  }
}
</style>
