<template>
  <div class="faculty-page">
    <!-- HEADER -->
    <div class="page-header">
      <div>
        <h1>Faculty Management</h1>
        <p>Manage faculty accounts registered in I-SPAS.</p>
      </div>
      <button class="add-btn" @click="openAddModal">
        <UserPlus :size="18" />
        <span>Add Faculty</span>
      </button>
    </div>

    <!-- MAIN TABLE SECTION -->
    <div class="table-section">
      <div class="table-header">
        <div>
          <h2>Faculty Accounts</h2>
          <p>View and manage registered faculty users.</p>
        </div>
        <div class="search-wrapper">
          <Search :size="17" />
          <input
            v-model="search"
            type="text"
            placeholder="Search faculty..."
          />
        </div>
      </div>

      <!-- LOADING -->
      <div v-if="loading" class="state-message">
        <LoaderCircle :size="28" class="spinner-icon" />
        <span>Loading faculty accounts...</span>
      </div>

      <!-- ERROR -->
      <div v-else-if="errorMessage" class="error-box">
        <div class="error-content">
          <TriangleAlert :size="19" />
          <span>{{ errorMessage }}</span>
        </div>
        <button @click="fetchFaculty">
          <RefreshCw :size="15" />
          <span>Try Again</span>
        </button>
      </div>

      <!-- TABLE -->
      <div v-else class="table-container">
        <table>
          <thead>
            <tr>
              <th>Faculty</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Date Created</th>
              <th class="actions-heading">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in filteredFaculty" :key="item.id">
              <!-- FACULTY -->
              <td>
                <div class="faculty-info">
                  <div class="avatar">
                    {{ getInitials(item.name) }}
                  </div>
                  <div>
                    <strong>{{ item.name }}</strong>
                  </div>
                </div>
              </td>

              <!-- EMAIL -->
              <td>
                <div class="table-icon-value">
                  <Mail :size="14" />
                  <span>{{ item.email }}</span>
                </div>
              </td>

              <!-- ROLE -->
              <td>
                <span class="role-badge">
                  <UserRound :size="13" />
                  {{ item.role }}
                </span>
              </td>

              <!-- STATUS -->
              <td>
                <span
                  class="status-badge"
                  :class="item.status === 'active' ? 'status-active' : 'status-inactive'"
                >
                  <CircleCheck v-if="item.status === 'active'" :size="13" />
                  <CircleOff v-else :size="13" />
                  {{ item.status }}
                </span>
              </td>

              <!-- CREATED -->
              <td>
                <div class="table-icon-value created-date">
                  <CalendarDays :size="14" />
                  <span>{{ formatDate(item.created_at) }}</span>
                </div>
              </td>

              <!-- ACTIONS -->
              <td>
                <div class="action-buttons">
                  <button
                    class="edit-btn"
                    title="Edit Faculty"
                    @click="openEditModal(item)"
                  >
                    <Pencil :size="15" />
                    <span>Edit</span>
                  </button>
                  <button
                    class="status-btn"
                    :class="item.status === 'active' ? 'deactivate-btn' : 'activate-btn'"
                    :title="item.status === 'active' ? 'Deactivate Faculty' : 'Activate Faculty'"
                    @click="toggleFacultyStatus(item)"
                  >
                    <UserX v-if="item.status === 'active'" :size="15" />
                    <UserCheck v-else :size="15" />
                    <span>
                      {{ item.status === 'active' ? 'Deactivate' : 'Activate' }}
                    </span>
                  </button>
                  <button
                    class="delete-btn"
                    title="Delete Faculty"
                    @click="confirmDelete(item)"
                  >
                    <Trash2 :size="15" />
                    <span>Delete</span>
                  </button>
                </div>
              </td>
            </tr>

            <!-- EMPTY -->
            <tr v-if="filteredFaculty.length === 0">
              <td colspan="6" class="empty">
                <div class="empty-content">
                  <div class="empty-icon">
                    <UsersRound :size="36" />
                  </div>
                  <strong>No faculty accounts found</strong>
                  <p>Try changing your search or add a faculty account.</p>
                </div>
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
      <div class="modal">
        <div class="modal-header">
          <div class="modal-title-wrap">
            <div class="modal-icon">
              <Pencil v-if="editingFaculty" :size="21" />
              <UserPlus v-else :size="21" />
            </div>
            <div>
              <h2>{{ editingFaculty ? 'Edit Faculty' : 'Add Faculty' }}</h2>
              <p>
                {{
                  editingFaculty
                    ? 'Update the faculty account information.'
                    : 'Create a new faculty account.'
                }}
              </p>
            </div>
          </div>
          <button
            class="close-btn"
            title="Close"
            aria-label="Close"
            @click="closeModal"
          >
            <X :size="20" />
          </button>
        </div>

        <form @submit.prevent="saveFaculty">
          <!-- NAME -->
          <div class="input-group">
            <label>Full Name</label>
            <div class="input-wrapper">
              <UserRound :size="17" />
              <input
                v-model="form.name"
                type="text"
                placeholder="Enter faculty name"
                required
              />
            </div>
            <small v-if="formErrors.name" class="field-error">
              {{ formErrors.name }}
            </small>
          </div>

          <!-- EMAIL -->
          <div class="input-group">
            <label>Email Address</label>
            <div class="input-wrapper">
              <Mail :size="17" />
              <input
                v-model="form.email"
                type="email"
                placeholder="Enter faculty email"
                required
              />
            </div>
            <small v-if="formErrors.email" class="field-error">
              {{ formErrors.email }}
            </small>
          </div>

          <!-- PASSWORD -->
          <div class="input-group">
            <label>
              Password
              <span v-if="editingFaculty">(Optional)</span>
            </label>
            <div class="password-wrapper">
              <LockKeyhole :size="17" class="password-left-icon" />
              <input
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                :placeholder="
                  editingFaculty
                    ? 'Leave blank to keep current password'
                    : 'Enter password'
                "
                :required="!editingFaculty"
              />
              <button
                type="button"
                class="eye-btn"
                :aria-label="showPassword ? 'Hide password' : 'Show password'"
                @click="showPassword = !showPassword"
              >
                <EyeOff v-if="showPassword" :size="19" />
                <Eye v-else :size="19" />
              </button>
            </div>
            <small v-if="formErrors.password" class="field-error">
              {{ formErrors.password }}
            </small>
          </div>

          <!-- GENERAL FORM ERROR -->
          <div v-if="formErrorMessage" class="form-error">
            <TriangleAlert :size="17" />
            <span>{{ formErrorMessage }}</span>
          </div>

          <!-- BUTTONS -->
          <div class="modal-actions">
            <button
              type="button"
              class="cancel-btn"
              @click="closeModal"
            >
              <X :size="16" />
              <span>Cancel</span>
            </button>
            <button
              type="submit"
              class="save-btn"
              :disabled="saving"
            >
              <LoaderCircle
                v-if="saving"
                :size="17"
                class="spinner-icon"
              />
              <Save v-else :size="17" />
              <span>
                {{
                  saving
                    ? 'Saving...'
                    : editingFaculty
                      ? 'Update Faculty'
                      : 'Create Faculty'
                }}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- DELETE CONFIRMATION -->
    <div
      v-if="facultyToDelete"
      class="modal-overlay"
      @click.self="facultyToDelete = null"
    >
      <div class="delete-modal">
        <div class="delete-icon">
          <TriangleAlert :size="34" />
        </div>
        <h2>Delete Faculty?</h2>
        <p>
          Are you sure you want to delete
          <strong>{{ facultyToDelete.name }}</strong>?
        </p>
        <p class="warning-text">This action cannot be undone.</p>
        <div class="modal-actions">
          <button
            class="cancel-btn"
            :disabled="deleting"
            @click="facultyToDelete = null"
          >
            <X :size="16" />
            <span>Cancel</span>
          </button>
          <button
            class="confirm-delete-btn"
            :disabled="deleting"
            @click="deleteFaculty"
          >
            <LoaderCircle
              v-if="deleting"
              :size="17"
              class="spinner-icon"
            />
            <Trash2 v-else :size="17" />
            <span>{{ deleting ? 'Deleting...' : 'Delete Faculty' }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- SUCCESS MESSAGE -->
    <div v-if="successMessage" class="success-toast">
      <CircleCheck :size="18" />
      <span>{{ successMessage }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import api from '../../services/api'
import {
  UserPlus,
  Search,
  LoaderCircle,
  TriangleAlert,
  RefreshCw,
  Mail,
  UserRound,
  CircleCheck,
  CircleOff,
  CalendarDays,
  Pencil,
  UserX,
  UserCheck,
  Trash2,
  UsersRound,
  X,
  LockKeyhole,
  Eye,
  EyeOff,
  Save
} from '@lucide/vue'

interface Faculty {
  id: number
  name: string
  email: string
  role: string
  status: string
  created_at: string | null
}

const faculty = ref<Faculty[]>([])
const loading = ref(false)
const saving = ref(false)
const deleting = ref(false)
const search = ref('')
const errorMessage = ref('')
const formErrorMessage = ref('')
const successMessage = ref('')
const showModal = ref(false)
const showPassword = ref(false)
const editingFaculty = ref<Faculty | null>(null)
const facultyToDelete = ref<Faculty | null>(null)

const form = reactive({
  name: '',
  email: '',
  password: ''
})

const formErrors = reactive({
  name: '',
  email: '',
  password: ''
})

const filteredFaculty = computed(() => {
  const keyword = search.value.trim().toLowerCase()
  if (!keyword) return faculty.value
  return faculty.value.filter(item => {
    return (
      item.name.toLowerCase().includes(keyword) ||
      item.email.toLowerCase().includes(keyword)
    )
  })
})

async function fetchFaculty() {
  loading.value = true
  errorMessage.value = ''
  try {
    const response = await api.get('/admin/faculty')
    faculty.value = response.data.data || []
  } catch (error: any) {
    console.error('FACULTY FETCH ERROR:', error)
    if (error.response?.status === 401) {
      errorMessage.value = 'Your session has expired.'
    } else if (error.response?.status === 403) {
      errorMessage.value = 'Administrator access required.'
    } else {
      errorMessage.value = 'Failed to load faculty accounts.'
    }
  } finally {
    loading.value = false
  }
}

function openAddModal() {
  editingFaculty.value = null
  resetForm()
  showModal.value = true
}

function openEditModal(item: Faculty) {
  editingFaculty.value = item
  resetErrors()
  form.name = item.name
  form.email = item.email
  form.password = ''
  showPassword.value = false
  showModal.value = true
}

function closeModal() {
  if (saving.value) return
  showModal.value = false
  editingFaculty.value = null
  resetForm()
}

async function saveFaculty() {
  resetErrors()
  formErrorMessage.value = ''
  if (!form.name.trim() || !form.email.trim()) {
    formErrorMessage.value = 'Name and email are required.'
    return
  }
  if (!editingFaculty.value && !form.password) {
    formErrors.password = 'Password is required.'
    return
  }
  saving.value = true
  try {
    const payload: any = {
      name: form.name.trim(),
      email: form.email.trim()
    }
    if (form.password) {
      payload.password = form.password
    }
    if (editingFaculty.value) {
      await api.put(
        `/admin/faculty/${editingFaculty.value.id}`,
        payload
      )
      showSuccess('Faculty account updated successfully.')
    } else {
      await api.post('/admin/faculty', payload)
      showSuccess('Faculty account created successfully.')
    }
    closeModal()
    await fetchFaculty()
  } catch (error: any) {
    console.error('FACULTY SAVE ERROR:', error)
    if (error.response?.status === 422) {
      const errors = error.response.data.errors || {}
      formErrors.name = errors.name?.[0] || ''
      formErrors.email = errors.email?.[0] || ''
      formErrors.password = errors.password?.[0] || ''
      formErrorMessage.value = 'Please check the information you entered.'
    } else if (error.response?.status === 403) {
      formErrorMessage.value = 'Administrator access required.'
    } else {
      formErrorMessage.value = 'Failed to save faculty account.'
    }
  } finally {
    saving.value = false
  }
}

function confirmDelete(item: Faculty) {
  facultyToDelete.value = item
}

async function deleteFaculty() {
  if (!facultyToDelete.value) return
  deleting.value = true
  try {
    await api.delete(
      `/admin/faculty/${facultyToDelete.value.id}`
    )
    facultyToDelete.value = null
    showSuccess('Faculty account deleted successfully.')
    await fetchFaculty()
  } catch (error: any) {
    console.error('FACULTY DELETE ERROR:', error)
    errorMessage.value =
      error.response?.data?.message ||
      'Failed to delete faculty account.'
  } finally {
    deleting.value = false
  }
}

function resetForm() {
  form.name = ''
  form.email = ''
  form.password = ''
  showPassword.value = false
  formErrorMessage.value = ''
  resetErrors()
}

function resetErrors() {
  formErrors.name = ''
  formErrors.email = ''
  formErrors.password = ''
}

function showSuccess(message: string) {
  successMessage.value = message
  window.setTimeout(() => {
    successMessage.value = ''
  }, 3000)
}

function getInitials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(word => word.charAt(0).toUpperCase())
    .join('')
}

function formatDate(date: string | null) {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('en-PH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

async function toggleFacultyStatus(item: Faculty) {
  try {
    const newStatus =
      item.status === 'active'
        ? 'inactive'
        : 'active'
    await api.patch(
      `/admin/faculty/${item.id}/status`,
      {
        status: newStatus
      }
    )
    showSuccess(
      newStatus === 'active'
        ? 'Faculty account activated successfully.'
        : 'Faculty account deactivated successfully.'
    )
    await fetchFaculty()
  } catch (error: any) {
    console.error('FACULTY STATUS ERROR:', error)
    errorMessage.value =
      error.response?.data?.message ||
      'Failed to update faculty status.'
  }
}

onMounted(() => {
  fetchFaculty()
})
</script>

<style scoped>
* {
  box-sizing: border-box;
}

.faculty-page {
  min-height: 100vh;
  padding: 28px;
  background: #f4fbf6;
  font-family: 'Poppins', sans-serif;
  color: #0f172a;
}

/* HEADER */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  margin-bottom: 22px;
}

.page-header h1 {
  margin: 0;
  font-size: 28px;
  font-weight: 800;
}

.page-header p {
  margin-top: 6px;
  color: #64748b;
  font-size: 14px;
}

.add-btn {
  border: none;
  background: #16a34a;
  color: white;
  padding: 11px 18px;
  border-radius: 9px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  font-weight: 700;
  cursor: pointer;
  transition: .2s;
}

.add-btn:hover {
  background: #15803d;
  transform: translateY(-1px);
}

/* TABLE SECTION */
.table-section {
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  padding: 24px;
  box-shadow: 0 5px 18px rgba(15, 23, 42, .04);
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  margin-bottom: 20px;
}

.table-header h2 {
  margin: 0;
  font-size: 20px;
}

.table-header p {
  margin-top: 5px;
  color: #64748b;
  font-size: 13px;
}

/* SEARCH */
.search-wrapper {
  position: relative;
}

.search-wrapper > svg {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
  pointer-events: none;
}

.search-wrapper input {
  width: 260px;
  height: 42px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  padding: 0 13px 0 38px;
  outline: none;
  font-size: 13px;
}

.search-wrapper input:focus {
  border-color: #16a34a;
  box-shadow: 0 0 0 3px rgba(22, 163, 74, .10);
}

/* TABLE */
.table-container {
  overflow-x: auto;
}

table {
  width: 100%;
  min-width: 950px;
  border-collapse: collapse;
}

th {
  padding: 13px;
  background: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
  color: #475569;
  font-size: 12px;
  font-weight: 700;
  text-align: left;
}

td {
  padding: 14px 13px;
  border-bottom: 1px solid #f1f5f9;
  color: #334155;
  font-size: 13px;
  vertical-align: middle;
}

tbody tr:hover {
  background: #f8fff9;
}

/* FACULTY */
.faculty-info {
  display: flex;
  align-items: center;
  gap: 11px;
}

.faculty-info strong {
  display: block;
  color: #0f172a;
}

.avatar {
  width: 40px;
  height: 40px;
  min-width: 40px;
  border-radius: 50%;
  background: #dcfce7;
  color: #15803d;
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: 800;
}

/* TABLE VALUES */
.table-icon-value {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.table-icon-value svg {
  color: #94a3b8;
  flex-shrink: 0;
}

.created-date {
  white-space: nowrap;
}

/* ROLE */
.role-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 10px;
  border-radius: 20px;
  background: #dcfce7;
  color: #15803d;
  font-size: 11px;
  font-weight: 700;
  text-transform: capitalize;
}

/* STATUS */
.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 10px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 700;
  text-transform: capitalize;
}

.status-active {
  background: #dcfce7;
  color: #15803d;
}

.status-inactive {
  background: #fee2e2;
  color: #dc2626;
}

/* ACTIONS */
.actions-heading {
  text-align: center;
}

.action-buttons {
  display: flex;
  justify-content: center;
  gap: 7px;
}

.edit-btn,
.status-btn,
.delete-btn {
  border: none;
  padding: 7px 10px;
  border-radius: 6px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
}

.edit-btn {
  background: #eff6ff;
  color: #2563eb;
}

.edit-btn:hover {
  background: #dbeafe;
}

.delete-btn {
  background: #fef2f2;
  color: #dc2626;
}

.delete-btn:hover {
  background: #fee2e2;
}

.activate-btn {
  background: #dcfce7;
  color: #15803d;
}

.deactivate-btn {
  background: #fff7ed;
  color: #ea580c;
}

.activate-btn:hover {
  background: #bbf7d0;
}

.deactivate-btn:hover {
  background: #ffedd5;
}

/* EMPTY */
.empty {
  padding: 45px;
}

.empty-content {
  text-align: center;
  color: #64748b;
}

.empty-icon {
  width: 65px;
  height: 65px;
  margin: 0 auto 12px;
  border-radius: 50%;
  background: #f0fdf4;
  color: #16a34a;
  display: flex;
  align-items: center;
  justify-content: center;
}

.empty-content strong {
  display: block;
  color: #334155;
  margin-bottom: 4px;
}

.empty-content p {
  margin: 0;
  font-size: 11px;
}

/* MODAL */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, .55);
  backdrop-filter: blur(4px);
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
  z-index: 9999;
}

.modal {
  width: 480px;
  max-width: 100%;
  background: white;
  border-radius: 16px;
  padding: 26px;
  box-shadow: 0 20px 55px rgba(0, 0, 0, .25);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 15px;
  margin-bottom: 23px;
}

.modal-title-wrap {
  display: flex;
  align-items: center;
  gap: 11px;
}

.modal-icon {
  width: 42px;
  height: 42px;
  min-width: 42px;
  border-radius: 10px;
  background: #dcfce7;
  color: #15803d;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-header h2 {
  margin: 0;
  font-size: 21px;
}

.modal-header p {
  margin-top: 5px;
  color: #64748b;
  font-size: 12px;
}

.close-btn {
  width: 34px;
  height: 34px;
  min-width: 34px;
  border: none;
  border-radius: 8px;
  background: #f1f5f9;
  color: #64748b;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.close-btn:hover {
  background: #fee2e2;
  color: #dc2626;
}

/* INPUTS */
.input-group {
  margin-bottom: 17px;
}

.input-group label {
  display: block;
  margin-bottom: 7px;
  font-size: 13px;
  font-weight: 600;
}

.input-group label span {
  color: #94a3b8;
  font-weight: 400;
  font-size: 11px;
}

.input-wrapper,
.password-wrapper {
  position: relative;
}

.input-wrapper > svg,
.password-left-icon {
  position: absolute;
  left: 13px;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
  pointer-events: none;
}

.input-group input {
  width: 100%;
  height: 46px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  padding: 0 13px 0 40px;
  outline: none;
  font-size: 13px;
}

.input-group input:focus {
  border-color: #16a34a;
  box-shadow: 0 0 0 3px rgba(22, 163, 74, .10);
}

.password-wrapper input {
  padding-right: 48px;
}

.eye-btn {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: #64748b;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.eye-btn:hover {
  background: #f0fdf4;
  color: #16a34a;
}

.field-error {
  display: block;
  margin-top: 5px;
  color: #dc2626;
  font-size: 11px;
}

.form-error {
  padding: 10px;
  margin-bottom: 15px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 7px;
  color: #dc2626;
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 12px;
}

/* MODAL ACTIONS */
.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 22px;
}

.cancel-btn,
.save-btn,
.confirm-delete-btn {
  border: none;
  border-radius: 8px;
  padding: 11px 17px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  font-size: 12px;
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
  color: white;
}

.save-btn:hover:not(:disabled) {
  background: #15803d;
}

.confirm-delete-btn {
  background: #dc2626;
  color: white;
}

.confirm-delete-btn:hover:not(:disabled) {
  background: #b91c1c;
}

button:disabled {
  opacity: .6;
  cursor: not-allowed;
}

/* DELETE MODAL */
.delete-modal {
  width: 400px;
  max-width: 100%;
  background: white;
  border-radius: 16px;
  padding: 28px;
  text-align: center;
}

.delete-icon {
  width: 66px;
  height: 66px;
  margin: 0 auto 12px;
  border-radius: 50%;
  background: #fee2e2;
  color: #dc2626;
  display: flex;
  align-items: center;
  justify-content: center;
}

.delete-modal h2 {
  margin-bottom: 10px;
}

.delete-modal p {
  color: #64748b;
  font-size: 13px;
  line-height: 1.6;
}

.warning-text {
  color: #dc2626 !important;
  margin-top: 5px;
}

/* MESSAGES */
.state-message {
  min-height: 160px;
  padding: 30px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 10px;
  text-align: center;
  color: #64748b;
}

.spinner-icon {
  color: #16a34a;
  animation: spin .8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.error-box {
  padding: 14px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  color: #dc2626;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 15px;
}

.error-content {
  display: flex;
  align-items: center;
  gap: 8px;
}

.error-box button {
  border: none;
  background: #dc2626;
  color: white;
  padding: 7px 12px;
  border-radius: 6px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  cursor: pointer;
}

.success-toast {
  position: fixed;
  right: 25px;
  bottom: 25px;
  background: #15803d;
  color: white;
  padding: 13px 18px;
  border-radius: 9px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  font-weight: 600;
  box-shadow: 0 10px 25px rgba(0, 0, 0, .18);
  z-index: 10000;
}

/* LUCIDE */
.add-btn svg,
.search-wrapper svg,
.table-icon-value svg,
.role-badge svg,
.status-badge svg,
.action-buttons svg,
.modal svg,
.delete-modal svg,
.success-toast svg,
.error-box svg {
  flex-shrink: 0;
}

/* RESPONSIVE */
@media(max-width: 768px) {
  .faculty-page {
    padding: 18px;
  }

  .page-header,
  .table-header {
    flex-direction: column;
    align-items: stretch;
  }

  .add-btn,
  .search-wrapper,
  .search-wrapper input {
    width: 100%;
  }

  .action-buttons {
    flex-wrap: wrap;
  }

  .modal-actions {
    flex-direction: column;
  }

  .cancel-btn,
  .save-btn,
  .confirm-delete-btn {
    width: 100%;
  }

  .success-toast {
    left: 18px;
    right: 18px;
    bottom: 18px;
    justify-content: center;
  }
}
</style>
