<template>
  <div class="school-year-page">
    <div class="page-header">
      <div>
        <h1>School Year Management</h1>
        <p>
          Add and manage school years used in I-SPAS.
        </p>
      </div>
      <button
        class="add-btn"
        @click="openAddModal"
      >
        <Plus :size="18" />
        Add School Year
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
        <span>Loading school years...</span>
      </div>

      <div
        v-else
        class="table-wrapper"
      >
        <table>
          <thead>
            <tr>
              <th class="number-column">#</th>
              <th>Year</th>
              <th>Status</th>
              <th class="actions-column">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            <tr
              v-for="(schoolYear, index) in schoolYears"
              :key="schoolYear.id"
            >
              <td class="number-cell">
                {{ index + 1 }}
              </td>
              <td>
                <strong>
                  {{ schoolYear.year }}
                </strong>
              </td>

              <td>
                <span
                  class="status-badge"
                  :class="schoolYear.status"
                >
                  {{
                    formatStatus(
                      schoolYear.status
                    )
                  }}
                </span>
              </td>

              <td>
                <div class="action-buttons">
                  <button
                    class="action-btn edit"
                    title="Edit School Year"
                    @click="
                      openEditModal(
                        schoolYear
                      )
                    "
                  >
                    <Pencil :size="16" />
                    Edit
                  </button>

                  <button
                    class="action-btn delete"
                    title="Delete School Year"
                    @click="
                      openDeleteDialog(
                        schoolYear
                      )
                    "
                  >
                    <Trash2 :size="16" />
                    Delete
                  </button>
                </div>
              </td>
            </tr>

            <tr
              v-if="schoolYears.length === 0"
            >
              <td
                colspan="4"
                class="empty-state"
              >
                <CalendarDays :size="42" />
                <strong>
                  No school years found
                </strong>
                <p>
                  Add a school year to get
                  started.
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
                editingSchoolYear
                  ? 'Edit School Year'
                  : 'Add School Year'
              }}
            </h2>

            <p>
              {{
                editingSchoolYear
                  ? 'Update the school year information.'
                  : 'Create a new school year for the system.'
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
          @submit.prevent="saveSchoolYear"
        >
          <div class="form-group">
            <label>
              School Year
            </label>

            <input
              v-model="form.year"
              type="text"
              placeholder="Example: 2026-2027"
              maxlength="9"
              :disabled="saving"
            />

            <span
              v-if="formErrors.year"
              class="field-error"
            >
              {{ formErrors.year }}
            </span>
          </div>

          <div class="form-group">
            <label>
              Status
            </label>

            <select
              v-model="form.status"
              :disabled="saving"
            >
              <option value="active">
                Active
              </option>

              <option value="inactive">
                Inactive
              </option>
            </select>

            <span
              v-if="formErrors.status"
              class="field-error"
            >
              {{ formErrors.status }}
            </span>

            <small class="status-note">
              Setting this school year as
              Active will automatically
              deactivate the currently
              active school year.
            </small>
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
                    : editingSchoolYear
                      ? 'Update School Year'
                      : 'Add School Year'
                }}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- DELETE CONFIRMATION -->
    <div
      v-if="schoolYearToDelete"
      class="modal-overlay"
      @click.self="
        schoolYearToDelete = null
      "
    >
      <div class="delete-card">
        <div class="delete-icon">
          <Trash2 :size="30" />
        </div>

        <h2>
          Delete School Year?
        </h2>

        <p>
          Are you sure you want to delete
          <strong>
            {{ schoolYearToDelete.year }}
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
              schoolYearToDelete = null
            "
          >
            Cancel
          </button>

          <button
            class="delete-confirm-btn"
            :disabled="deleting"
            @click="deleteSchoolYear"
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
                  : 'Delete School Year'
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
  CalendarDays,
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

interface SchoolYear {
  id: number
  year: string
  status: 'active' | 'inactive'
  created_at?: string
  updated_at?: string
}

const schoolYears =
  ref<SchoolYear[]>([])

const loading =
  ref(false)

const saving =
  ref(false)

const deleting =
  ref(false)

const showModal =
  ref(false)

const editingSchoolYear =
  ref<SchoolYear | null>(null)

const schoolYearToDelete =
  ref<SchoolYear | null>(null)

const successMessage =
  ref('')

const errorMessage =
  ref('')

const formErrorMessage =
  ref('')

const form = reactive({
  year: '',
  status: 'inactive'
})

const formErrors = reactive({
  year: '',
  status: ''
})

function formatStatus(
  status: string
) {
  return status
    .charAt(0)
    .toUpperCase()
    +
    status.slice(1)
}

function clearMessages() {
  successMessage.value = ''
  errorMessage.value = ''
  formErrorMessage.value = ''
}

function clearFormErrors() {
  formErrors.year = ''
  formErrors.status = ''
}

function resetForm() {
  form.year = ''
  form.status = 'inactive'
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

async function fetchSchoolYears() {
  loading.value = true
  errorMessage.value = ''

  try {
    const response =
      await api.get(
        '/admin/school-years'
      )

    schoolYears.value =
      Array.isArray(
        response.data?.data
      )
        ? response.data.data
        : []

  } catch (error: any) {
    console.error(
      'SCHOOL YEAR FETCH ERROR:',
      error
    )

    if (
      error.response?.status === 401
    ) {
      showError(
        'Your session has expired.'
      )
    } else if (
      error.response?.status === 403
    ) {
      showError(
        'Administrator access required.'
      )
    } else {
      showError(
        error.response?.data?.message ||
        'Failed to load school years.'
      )
    }

  } finally {
    loading.value = false
  }
}

function openAddModal() {
  clearMessages()
  editingSchoolYear.value = null
  resetForm()
  showModal.value = true
}

function openEditModal(
  schoolYear: SchoolYear
) {
  clearMessages()
  clearFormErrors()

  editingSchoolYear.value =
    schoolYear

  form.year =
    schoolYear.year

  form.status =
    schoolYear.status

  showModal.value = true
}

function closeModal() {
  if (saving.value) {
    return
  }

  showModal.value = false
  editingSchoolYear.value = null
  resetForm()
}

function validateForm() {
  clearFormErrors()

  let valid = true

  const yearPattern =
    /^\d{4}-\d{4}$/

  if (!form.year.trim()) {
    formErrors.year =
      'School year is required.'

    valid = false
  } else if (
    !yearPattern.test(
      form.year.trim()
    )
  ) {
    formErrors.year =
      'Use the format YYYY-YYYY, for example 2026-2027.'

    valid = false
  } else {
    const parts =
      form.year
        .trim()
        .split('-')

    const startYear =
      Number(parts[0])

    const endYear =
      Number(parts[1])

    if (
      endYear !==
      startYear + 1
    ) {
      formErrors.year =
        'The ending year must be exactly one year after the starting year.'

      valid = false
    }
  }

  if (
    ![
      'active',
      'inactive'
    ].includes(
      form.status
    )
  ) {
    formErrors.status =
      'Please select a valid status.'

    valid = false
  }

  return valid
}

async function saveSchoolYear() {
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
      year:
        form.year.trim(),

      status:
        form.status
    }

    if (editingSchoolYear.value) {
      await api.put(
        `/admin/school-years/${editingSchoolYear.value.id}`,
        payload
      )

      showSuccess(
        'School year updated successfully.'
      )

    } else {
      await api.post(
        '/admin/school-years',
        payload
      )

      showSuccess(
        'School year added successfully.'
      )
    }

    showModal.value = false
    editingSchoolYear.value = null
    resetForm()

    await fetchSchoolYears()

  } catch (error: any) {
    console.error(
      'SCHOOL YEAR SAVE ERROR:',
      error
    )

    if (
      error.response?.status === 422
    ) {
      const errors =
        error.response?.data?.errors

      if (
        errors?.year?.[0]
      ) {
        formErrors.year =
          errors.year[0]
      }

      if (
        errors?.status?.[0]
      ) {
        formErrors.status =
          errors.status[0]
      }

      formErrorMessage.value =
        error.response?.data?.message ||
        'Please check the information you entered.'

    } else if (
      error.response?.status === 403
    ) {
      formErrorMessage.value =
        'Administrator access required.'

    } else {
      formErrorMessage.value =
        error.response?.data?.message ||
        'Failed to save school year.'
    }

  } finally {
    saving.value = false
  }
}

function openDeleteDialog(
  schoolYear: SchoolYear
) {
  clearMessages()

  schoolYearToDelete.value =
    schoolYear
}

async function deleteSchoolYear() {
  if (
    deleting.value ||
    !schoolYearToDelete.value
  ) {
    return
  }

  deleting.value = true

  const id =
    schoolYearToDelete.value.id

  const year =
    schoolYearToDelete.value.year

  try {
    await api.delete(
      `/admin/school-years/${id}`
    )

    schoolYearToDelete.value =
      null

    showSuccess(
      `School year ${year} deleted successfully.`
    )

    await fetchSchoolYears()

  } catch (error: any) {
    console.error(
      'SCHOOL YEAR DELETE ERROR:',
      error
    )

    showError(
      error.response?.data?.message ||
      'Failed to delete school year.'
    )

  } finally {
    deleting.value = false
  }
}

onMounted(() => {
  fetchSchoolYears()
})
</script>

<style scoped>
* {
  box-sizing: border-box;
}

.school-year-page {
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

.status-badge {
  min-width: 82px;
  padding: 6px 10px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: 700;
}

.status-badge.active {
  background: #dcfce7;
  color: #15803d;
}

.status-badge.inactive {
  background: #e2e8f0;
  color: #64748b;
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

.status-note {
  color: #64748b;
  font-size: 9px;
  line-height: 1.6;
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
.number-column,
.number-cell {
  width: 65px;
  text-align: center;
}

.number-cell {
  color: #64748b;
  font-weight: 700;
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
  .school-year-page {
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
  .school-year-page {
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
