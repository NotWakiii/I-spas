<template>
  <div class="strand-page">
    <div class="page-header">
      <div>
        <h1>Manage Strand</h1>
        <p>
          Create and manage the available strands within the Senior High School department.
        </p>
      </div>
      <button
        class="add-btn"
        @click="openAddModal"
      >
        <Plus :size="18" />
        Add Strand
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
        <span>Loading strands...</span>
      </div>

      <div
        v-else
        class="table-wrapper"
      >
        <table>
          <thead>
            <tr>
              <th class="number-column">#</th>
              <th>Strand</th>
              <th>Description</th>
              <th class="actions-column">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            <tr
              v-for="(strand, index) in strands"
              :key="strand.id"
            >
              <td class="number-column">
                {{ index + 1 }}
              </td>
              <td>
                <strong>
                  {{ strand.name }}
                </strong>
              </td>

              <td class="description-cell">
                {{
                  strand.description ||
                  'No description'
                }}
              </td>

              <td>
                <div class="action-buttons">
                  <button
                    class="action-btn edit"
                    @click="openEditModal(strand)"
                  >
                    <Pencil :size="16" />
                    Edit
                  </button>

                  <button
                    class="action-btn delete"
                    @click="openDeleteDialog(strand)"
                  >
                    <Trash2 :size="16" />
                    Delete
                  </button>
                </div>
              </td>
            </tr>

            <tr v-if="strands.length === 0">
              <td
                colspan="4"
                class="empty-state"
              >
                <Layers3 :size="42" />
                <strong>
                  No strands found
                </strong>
                <p>
                  Add a strand to get started.
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
                editingStrand
                  ? 'Edit Strand'
                  : 'Add Strand'
              }}
            </h2>
            <p>
              {{
                editingStrand
                  ? 'Update the strand information.'
                  : 'Create a new strand for the Senior High School department.'
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
          @submit.prevent="saveStrand"
        >
          <div class="form-group">
            <label>
              Strand
            </label>

            <input
              v-model="form.name"
              type="text"
              placeholder="Example: STEM"
              maxlength="50"
              :disabled="saving"
            />

            <span
              v-if="formErrors.name"
              class="field-error"
            >
              {{ formErrors.name }}
            </span>
          </div>

          <div class="form-group">
            <label>
              Description
            </label>

            <textarea
              v-model="form.description"
              placeholder="Example: Science, Technology, Engineering, and Mathematics"
              maxlength="255"
              :disabled="saving"
            ></textarea>

            <div class="description-footer">
              <span
                v-if="formErrors.description"
                class="field-error"
              >
                {{ formErrors.description }}
              </span>

              <small>
                {{ form.description.length }}/255
              </small>
            </div>
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
                    : editingStrand
                      ? 'Update Strand'
                      : 'Add Strand'
                }}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- DELETE MODAL -->
    <div
      v-if="strandToDelete"
      class="modal-overlay"
      @click.self="
        strandToDelete = null
      "
    >
      <div class="delete-card">
        <div class="delete-icon">
          <Trash2 :size="30" />
        </div>

        <h2>
          Delete Strand?
        </h2>

        <p>
          Are you sure you want to delete
          <strong>
            {{ strandToDelete.name }}
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
              strandToDelete = null
            "
          >
            Cancel
          </button>

          <button
            class="delete-confirm-btn"
            :disabled="deleting"
            @click="deleteStrand"
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
                  : 'Delete Strand'
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
  Layers3,
  LoaderCircle,
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
  description: string | null
  created_at?: string
  updated_at?: string
}

const strands =
  ref<Strand[]>([])

const loading =
  ref(false)

const saving =
  ref(false)

const deleting =
  ref(false)

const showModal =
  ref(false)

const editingStrand =
  ref<Strand | null>(null)

const strandToDelete =
  ref<Strand | null>(null)

const successMessage =
  ref('')

const errorMessage =
  ref('')

const formErrorMessage =
  ref('')

const form = reactive({
  name: '',
  description: ''
})

const formErrors = reactive({
  name: '',
  description: ''
})

function clearMessages() {
  successMessage.value = ''
  errorMessage.value = ''
  formErrorMessage.value = ''
}

function clearFormErrors() {
  formErrors.name = ''
  formErrors.description = ''
}

function resetForm() {
  form.name = ''
  form.description = ''
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

async function fetchStrands() {
  loading.value = true
  errorMessage.value = ''

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

    showError(
      error.response?.data?.message ||
      'Failed to load strands.'
    )

  } finally {
    loading.value = false
  }
}

function openAddModal() {
  clearMessages()
  editingStrand.value = null
  resetForm()
  showModal.value = true
}

function openEditModal(
  strand: Strand
) {
  clearMessages()
  clearFormErrors()

  editingStrand.value =
    strand

  form.name =
    strand.name

  form.description =
    strand.description || ''

  showModal.value = true
}

function closeModal() {
  if (saving.value) {
    return
  }

  showModal.value = false
  editingStrand.value = null
  resetForm()
}

function validateForm() {
  clearFormErrors()

  let valid = true

  if (!form.name.trim()) {
    formErrors.name =
      'Strand name is required.'

    valid = false
  }

  if (
    form.name.trim().length > 50
  ) {
    formErrors.name =
      'Strand name must not exceed 50 characters.'

    valid = false
  }

  if (
    form.description.length > 255
  ) {
    formErrors.description =
      'Description must not exceed 255 characters.'

    valid = false
  }

  return valid
}

async function saveStrand() {
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
      name:
        form.name.trim(),

      description:
        form.description.trim() ||
        null
    }

    if (editingStrand.value) {
      await api.put(
        `/admin/strands/${editingStrand.value.id}`,
        payload
      )

      showSuccess(
        'Strand updated successfully.'
      )

    } else {
      await api.post(
        '/admin/strands',
        payload
      )

      showSuccess(
        'Strand added successfully.'
      )
    }

    showModal.value = false
    editingStrand.value = null
    resetForm()

    await fetchStrands()

  } catch (error: any) {
    console.error(
      'STRAND SAVE ERROR:',
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

      if (
        errors?.description?.[0]
      ) {
        formErrors.description =
          errors.description[0]
      }

      formErrorMessage.value =
        error.response?.data?.message ||
        'Please check the information you entered.'

    } else {
      formErrorMessage.value =
        error.response?.data?.message ||
        'Failed to save strand.'
    }

  } finally {
    saving.value = false
  }
}

function openDeleteDialog(
  strand: Strand
) {
  clearMessages()

  strandToDelete.value =
    strand
}

async function deleteStrand() {
  if (
    deleting.value ||
    !strandToDelete.value
  ) {
    return
  }

  deleting.value = true

  const id =
    strandToDelete.value.id

  const name =
    strandToDelete.value.name

  try {
    await api.delete(
      `/admin/strands/${id}`
    )

    strandToDelete.value =
      null

    showSuccess(
      `Strand ${name} deleted successfully.`
    )

    await fetchStrands()

  } catch (error: any) {
    console.error(
      'STRAND DELETE ERROR:',
      error
    )

    showError(
      error.response?.data?.message ||
      'Failed to delete strand.'
    )

  } finally {
    deleting.value = false
  }
}

onMounted(() => {
  fetchStrands()
})
</script>

<style scoped>
* {
  box-sizing: border-box;
}

.strand-page {
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
.number-column,
.number-cell {
  width: 65px;
  text-align: center;
}

.number-cell {
  color: #64748b;
  font-weight: 700;
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

.description-cell {
  max-width: 500px;
  color: #64748b;
  line-height: 1.6;
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
.form-group textarea {
  width: 100%;
  padding: 11px 12px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  outline: none;
  background: #ffffff;
  color: #0f172a;
  font-family: inherit;
  font-size: 12px;
}

.form-group input {
  height: 43px;
}

.form-group textarea {
  min-height: 100px;
  resize: vertical;
  line-height: 1.6;
}

.form-group input:focus,
.form-group textarea:focus {
  border-color: #16a34a;
  box-shadow:
    0 0 0 3px
    rgba(22, 163, 74, .10);
}

.form-group input:disabled,
.form-group textarea:disabled {
  background: #f8fafc;
  cursor: not-allowed;
}

.description-footer {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
}

.description-footer small {
  margin-left: auto;
  color: #94a3b8;
  font-size: 9px;
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
  animation:
    spin .8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media(max-width: 768px) {
  .strand-page {
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
  .strand-page {
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
