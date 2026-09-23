<template>
  <div class="section-page">
    <div class="page-header">
      <div>
        <h1>Manage Section</h1>
        <p>
          Create and manage grade and section records based on the available Senior High School strands.
        </p>
      </div>
      <button
        class="add-btn"
        @click="openAddModal"
      >
        <Plus :size="18" />
        Add Section
      </button>
    </div>
    <div
      v-if="successMessage"
      class="notification success"
    >
      <CircleCheckBig :size="20" />
      <span>{{ successMessage }}</span>
    </div>
    <div
      v-if="errorMessage"
      class="notification error"
    >
      <CircleAlert :size="20" />
      <span>{{ errorMessage }}</span>
    </div>
    <div class="table-card">
      <div
        v-if="loading"
        class="loading-state"
      >
        <LoaderCircle
          :size="28"
          class="spinner"
        />
        <span>Loading sections...</span>
      </div>
      <div
        v-else
        class="table-wrapper"
      >
        <table>
          <thead>
            <tr>
              <th class="number-column">#</th>
              <th>Grade</th>
              <th>Strand</th>
              <th>Section</th>
              <th class="actions-column">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(section, index) in sections"
              :key="section.id"
            >
              <td class="number-cell">
                {{ index + 1 }}
              </td>
              <td>
                <span class="grade-badge">
                  {{ section.grade }}
                </span>
              </td>
              <td>
                <strong>
                  {{
                    section.strand?.name ||
                    'N/A'
                  }}
                </strong>
              </td>
              <td>
                {{ section.section }}
              </td>
              <td>
                <div class="action-buttons">
                  <button
                    class="action-btn edit"
                    title="Edit Section"
                    @click="openEditModal(section)"
                  >
                    <Pencil :size="16" />
                    Edit
                  </button>
                  <button
                    class="action-btn delete"
                    title="Delete Section"
                    @click="openDeleteDialog(section)"
                  >
                    <Trash2 :size="16" />
                    Delete
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="sections.length === 0">
              <td
                colspan="5"
                class="empty-state"
              >
                <PanelsTopLeft :size="42" />
                <strong>
                  No sections found
                </strong>
                <p>
                  Add a section to get started.
                </p>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- ADD / EDIT MODAL -->
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
                editingSection
                  ? 'Edit Section'
                  : 'Add Section'
              }}
            </h2>
            <p>
              {{
                editingSection
                  ? 'Update the grade, strand, and section information.'
                  : 'Add a grade and section under an existing strand.'
              }}
            </p>
          </div>
          <button
            class="close-btn"
            title="Close"
            @click="closeModal"
          >
            <X :size="20" />
          </button>
        </div>
        <form
          class="modal-form"
          @submit.prevent="saveSection"
        >
          <div class="form-group">
            <label>
              Grade
            </label>
            <select
              v-model="form.grade"
              :disabled="saving"
            >
              <option value="">
                Select Grade
              </option>
              <option value="Grade 11">
                Grade 11
              </option>
              <option value="Grade 12">
                Grade 12
              </option>
            </select>
            <span
              v-if="formErrors.grade"
              class="field-error"
            >
              {{ formErrors.grade }}
            </span>
          </div>
          <div class="form-group">
            <label>
              Strand
            </label>
            <select
              v-model="form.strand_id"
              :disabled="saving || loadingStrands"
            >
              <option value="">
                {{
                  loadingStrands
                    ? 'Loading strands...'
                    : 'Select Strand'
                }}
              </option>
              <option
                v-for="strand in strands"
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
            <small
              v-if="
                !loadingStrands &&
                strands.length === 0
              "
              class="strand-warning"
            >
              No strands are available. Add a strand first in Manage Strand.
            </small>
          </div>
          <div class="form-group">
            <label>
              Section
            </label>
            <input
              v-model="form.section"
              type="text"
              placeholder="Example: St. Joseph"
              maxlength="100"
              :disabled="saving"
            />
            <span
              v-if="formErrors.section"
              class="field-error"
            >
              {{ formErrors.section }}
            </span>
          </div>
          <div
            v-if="formErrorMessage"
            class="form-error-message"
          >
            <CircleAlert :size="18" />
            <span>
              {{ formErrorMessage }}
            </span>
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
              :disabled="
                saving ||
                loadingStrands ||
                strands.length === 0
              "
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
                    : editingSection
                      ? 'Update Section'
                      : 'Add Section'
                }}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- DELETE CONFIRMATION -->
    <div
      v-if="sectionToDelete"
      class="modal-overlay"
      @click.self="
        sectionToDelete = null
      "
    >
      <div class="delete-card">
        <div class="delete-icon">
          <Trash2 :size="30" />
        </div>
        <h2>
          Delete Section?
        </h2>
        <p>
          Are you sure you want to delete
          <strong>
            {{ sectionToDelete.section }}
          </strong>
          under
          <strong>
            {{
              sectionToDelete.strand?.name ||
              'this strand'
            }}
          </strong>?
        </p>
        <p class="warning-text">
          This action cannot be undone.
        </p>
        <div class="modal-actions">
          <button
            class="cancel-btn"
            :disabled="deleting"
            @click="
              sectionToDelete = null
            "
          >
            Cancel
          </button>
          <button
            class="delete-confirm-btn"
            :disabled="deleting"
            @click="deleteSection"
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
                  : 'Delete Section'
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
  CircleAlert,
  CircleCheckBig,
  LoaderCircle,
  PanelsTopLeft,
  Pencil,
  Plus,
  Save,
  Trash2,
  X
} from '@lucide/vue'
import api from '../../services/api'

interface Strand {
  id: number
  name: string
  description?: string | null
}

interface Section {
  id: number
  grade: string
  strand_id: number
  section: string
  strand?: Strand | null
  created_at?: string
  updated_at?: string
}

const sections =
  ref<Section[]>([])

const strands =
  ref<Strand[]>([])

const loading =
  ref(false)

const loadingStrands =
  ref(false)

const saving =
  ref(false)

const deleting =
  ref(false)

const showModal =
  ref(false)

const editingSection =
  ref<Section | null>(null)

const sectionToDelete =
  ref<Section | null>(null)

const successMessage =
  ref('')

const errorMessage =
  ref('')

const formErrorMessage =
  ref('')

const form = reactive({
  grade: '',
  strand_id: '' as number | '',
  section: ''
})

const formErrors = reactive({
  grade: '',
  strand_id: '',
  section: ''
})

function clearMessages() {
  successMessage.value = ''
  errorMessage.value = ''
  formErrorMessage.value = ''
}

function clearFormErrors() {
  formErrors.grade = ''
  formErrors.strand_id = ''
  formErrors.section = ''
}

function resetForm() {
  form.grade = ''
  form.strand_id = ''
  form.section = ''
  clearFormErrors()
  formErrorMessage.value = ''
}

function showSuccess(
  message: string
) {
  successMessage.value = message

  window.setTimeout(() => {
    successMessage.value = ''
  }, 3500)
}

function showError(
  message: string
) {
  errorMessage.value = message

  window.setTimeout(() => {
    errorMessage.value = ''
  }, 4000)
}

async function fetchSections() {
  loading.value = true
  errorMessage.value = ''

  try {
    const response =
      await api.get(
        '/admin/sections'
      )

    sections.value =
      Array.isArray(
        response.data?.data
      )
        ? response.data.data
        : []

  } catch (error: any) {
    console.error(
      'SECTION FETCH ERROR:',
      error
    )

    showError(
      error.response?.data?.message ||
      'Failed to load sections.'
    )

  } finally {
    loading.value = false
  }
}

async function fetchStrands() {
  loadingStrands.value = true

  try {
    const response =
      await api.get(
        '/admin/strands'
      )

    strands.value =
      Array.isArray(
        response.data?.data
      )
        ? response.data.data
        : []

  } catch (error: any) {
    console.error(
      'STRAND FETCH ERROR:',
      error
    )

    strands.value = []

    showError(
      error.response?.data?.message ||
      'Failed to load available strands.'
    )

  } finally {
    loadingStrands.value = false
  }
}

function openAddModal() {
  clearMessages()
  editingSection.value = null
  resetForm()
  showModal.value = true
}

function openEditModal(
  section: Section
) {
  clearMessages()
  clearFormErrors()

  editingSection.value =
    section

  form.grade =
    section.grade

  form.strand_id =
    section.strand_id

  form.section =
    section.section

  showModal.value = true
}

function closeModal() {
  if (saving.value) {
    return
  }

  showModal.value = false
  editingSection.value = null
  resetForm()
}

function validateForm() {
  clearFormErrors()

  let valid = true

  if (!form.grade) {
    formErrors.grade =
      'Grade is required.'

    valid = false
  }

  if (
    ![
      'Grade 11',
      'Grade 12'
    ].includes(
      form.grade
    )
  ) {
    formErrors.grade =
      'Please select a valid grade.'

    valid = false
  }

  if (!form.strand_id) {
    formErrors.strand_id =
      'Strand is required.'

    valid = false
  }

  if (!form.section.trim()) {
    formErrors.section =
      'Section name is required.'

    valid = false
  }

  if (
    form.section.trim().length > 100
  ) {
    formErrors.section =
      'Section name must not exceed 100 characters.'

    valid = false
  }

  return valid
}

async function saveSection() {
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
      grade:
        form.grade,

      strand_id:
        Number(form.strand_id),

      section:
        form.section.trim()
    }

    if (editingSection.value) {
      await api.put(
        `/admin/sections/${editingSection.value.id}`,
        payload
      )

      showSuccess(
        'Section updated successfully.'
      )

    } else {
      await api.post(
        '/admin/sections',
        payload
      )

      showSuccess(
        'Section added successfully.'
      )
    }

    showModal.value = false
    editingSection.value = null
    resetForm()

    await fetchSections()

  } catch (error: any) {
    console.error(
      'SECTION SAVE ERROR:',
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

      if (
        errors?.strand_id?.[0]
      ) {
        formErrors.strand_id =
          errors.strand_id[0]
      }

      if (
        errors?.section?.[0]
      ) {
        formErrors.section =
          errors.section[0]
      }

      formErrorMessage.value =
        error.response?.data?.message ||
        'Please check the information you entered.'

    } else {
      formErrorMessage.value =
        error.response?.data?.message ||
        'Failed to save section.'
    }

  } finally {
    saving.value = false
  }
}

function openDeleteDialog(
  section: Section
) {
  clearMessages()

  sectionToDelete.value =
    section
}

async function deleteSection() {
  if (
    deleting.value ||
    !sectionToDelete.value
  ) {
    return
  }

  deleting.value = true

  const id =
    sectionToDelete.value.id

  const sectionName =
    sectionToDelete.value.section

  try {
    await api.delete(
      `/admin/sections/${id}`
    )

    sectionToDelete.value =
      null

    showSuccess(
      `Section ${sectionName} deleted successfully.`
    )

    await fetchSections()

  } catch (error: any) {
    console.error(
      'SECTION DELETE ERROR:',
      error
    )

    showError(
      error.response?.data?.message ||
      'Failed to delete section.'
    )

  } finally {
    deleting.value = false
  }
}

onMounted(async () => {
  await Promise.all([
    fetchSections(),
    fetchStrands()
  ])
})
</script>

<style scoped>
* {
  box-sizing: border-box;
}

.section-page {
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
.number-column,
.number-cell {
  width: 65px;
  text-align: center;
}

.number-cell {
  color: #64748b;
  font-weight: 700;
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
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  transition:
    background .2s ease,
    transform .2s ease;
}

.add-btn:hover {
  background: #15803d;
  transform: translateY(-1px);
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
  box-shadow:
    0 5px 20px
    rgba(15, 23, 42, .04);
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

.grade-badge {
  min-width: 75px;
  padding: 6px 10px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: #dcfce7;
  color: #15803d;
  font-size: 10px;
  font-weight: 700;
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
  font-size: 10px;
  font-weight: 700;
  cursor: pointer;
  transition: background .2s ease;
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
  background:
    rgba(15, 23, 42, .55);
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
}

.modal-card,
.delete-card {
  width: 440px;
  max-width: 100%;
  border-radius: 16px;
  background: #ffffff;
  box-shadow:
    0 20px 55px
    rgba(0, 0, 0, .23);
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

.form-group input,
.form-group select {
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
  transition:
    border-color .2s ease,
    box-shadow .2s ease;
}

.form-group input:focus,
.form-group select:focus {
  border-color: #16a34a;
  box-shadow:
    0 0 0 3px
    rgba(22, 163, 74, .10);
}

.form-group input:disabled,
.form-group select:disabled {
  background: #f8fafc;
  cursor: not-allowed;
}

.field-error {
  color: #dc2626;
  font-size: 10px;
  line-height: 1.5;
}

.strand-warning {
  color: #d97706;
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
  animation:
    spin .8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media(max-width: 768px) {
  .section-page {
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
  .section-page {
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
