<template>
  <div class="faculty-page">

    <!-- HEADER -->
    <div class="page-header">
      <div>
        <h1>Faculty Management</h1>
        <p>
          Manage faculty accounts registered in I-SPAS.
        </p>
      </div>

      <button
        class="add-btn"
        @click="openAddModal"
      >
        + Add Faculty
      </button>
    </div>

    <!-- MAIN TABLE SECTION -->
    <div class="table-section">

      <div class="table-header">
        <div>
          <h2>Faculty Accounts</h2>
          <p>
            View and manage registered faculty users.
          </p>
        </div>

        <div class="search-wrapper">
          <input
            v-model="search"
            type="text"
            placeholder="Search faculty..."
          />
        </div>
      </div>


      <!-- LOADING -->
      <div
        v-if="loading"
        class="state-message"
      >
        Loading faculty accounts...
      </div>


      <!-- ERROR -->
      <div
        v-else-if="errorMessage"
        class="error-box"
      >
        <span>
          {{ errorMessage }}
        </span>

        <button @click="fetchFaculty">
          Try Again
        </button>
      </div>


      <!-- TABLE -->
      <div
        v-else
        class="table-container"
      >
        <table>

          <thead>
            <tr>
              <th>Faculty</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Date Created</th>
              <th class="actions-heading">
                Actions
              </th>
            </tr>
          </thead>


          <tbody>

            <tr
              v-for="item in filteredFaculty"
              :key="item.id"
            >

              <!-- FACULTY -->
              <td>
                <div class="faculty-info">

                  <div class="avatar">
                    {{
                      getInitials(
                        item.name
                      )
                    }}
                  </div>

                  <div>
                    <strong>
                      {{ item.name }}
                    </strong>
                  </div>

                </div>
              </td>


              <!-- EMAIL -->
              <td>
                {{ item.email }}
              </td>


              <!-- ROLE -->
              <td>
                <span class="role-badge">
                  {{ item.role }}
                </span>
              </td>

              <td>
                <span
                  class="status-badge"
                  :class="
                    item.status === 'active'
                      ? 'status-active'
                      : 'status-inactive'
                  "
                >
                  {{ item.status }}
                </span>
              </td>

              <!-- CREATED -->
              <td>
                {{
                  formatDate(
                    item.created_at
                  )
                }}
              </td>


              <!-- ACTIONS -->
              <td>
                <div class="action-buttons">

                  <button
                    class="edit-btn"
                    @click="openEditModal(item)"
                  >
                    Edit
                  </button>

                  <button
                    class="status-btn"
                    :class="
                      item.status === 'active'
                        ? 'deactivate-btn'
                        : 'activate-btn'
                    "
                    @click="toggleFacultyStatus(item)"
                  >
                    {{
                      item.status === 'active'
                        ? 'Deactivate'
                        : 'Activate'
                    }}
                  </button>

                  <button
                    class="delete-btn"
                    @click="confirmDelete(item)"
                  >
                    Delete
                  </button>

                </div>
              </td>

            </tr>


            <!-- EMPTY -->
            <tr
              v-if="
                filteredFaculty.length === 0
              "
            >
              <td
                colspan="5"
                class="empty"
              >
                No faculty accounts found.
              </td>
            </tr>

          </tbody>

        </table>
      </div>

    </div>


    <!-- ========================================
         ADD / EDIT MODAL
    ========================================= -->
    <div
      v-if="showModal"
      class="modal-overlay"
      @click.self="closeModal"
    >

      <div class="modal">

        <div class="modal-header">

          <div>
            <h2>
              {{
                editingFaculty
                  ? 'Edit Faculty'
                  : 'Add Faculty'
              }}
            </h2>

            <p>
              {{
                editingFaculty
                  ? 'Update the faculty account information.'
                  : 'Create a new faculty account.'
              }}
            </p>
          </div>

          <button
            class="close-btn"
            @click="closeModal"
          >
            ×
          </button>

        </div>


        <form
          @submit.prevent="saveFaculty"
        >

          <!-- NAME -->
          <div class="input-group">

            <label>
              Full Name
            </label>

            <input
              v-model="form.name"
              type="text"
              placeholder="Enter faculty name"
              required
            />

            <small
              v-if="formErrors.name"
              class="field-error"
            >
              {{ formErrors.name }}
            </small>

          </div>


          <!-- EMAIL -->
          <div class="input-group">

            <label>
              Email Address
            </label>

            <input
              v-model="form.email"
              type="email"
              placeholder="Enter faculty email"
              required
            />

            <small
              v-if="formErrors.email"
              class="field-error"
            >
              {{ formErrors.email }}
            </small>

          </div>


          <!-- PASSWORD -->
          <div class="input-group">

            <label>
              Password
              <span v-if="editingFaculty">
                (Optional)
              </span>
            </label>

            <div class="password-wrapper">

              <input
                v-model="form.password"
                :type="
                  showPassword
                    ? 'text'
                    : 'password'
                "
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
                @click="
                  showPassword =
                    !showPassword
                "
              >
                {{
                  showPassword
                    ? 'Hide'
                    : 'Show'
                }}
              </button>

            </div>

            <small
              v-if="formErrors.password"
              class="field-error"
            >
              {{ formErrors.password }}
            </small>

          </div>


          <!-- GENERAL FORM ERROR -->
          <div
            v-if="formErrorMessage"
            class="form-error"
          >
            {{ formErrorMessage }}
          </div>


          <!-- BUTTONS -->
          <div class="modal-actions">

            <button
              type="button"
              class="cancel-btn"
              @click="closeModal"
            >
              Cancel
            </button>

            <button
              type="submit"
              class="save-btn"
              :disabled="saving"
            >
              {{
                saving
                  ? 'Saving...'
                  : editingFaculty
                    ? 'Update Faculty'
                    : 'Create Faculty'
              }}
            </button>

          </div>

        </form>

      </div>

    </div>


    <!-- ========================================
         DELETE CONFIRMATION
    ========================================= -->
    <div
      v-if="facultyToDelete"
      class="modal-overlay"
      @click.self="
        facultyToDelete = null
      "
    >

      <div class="delete-modal">

        <div class="delete-icon">
          ⚠️
        </div>

        <h2>
          Delete Faculty?
        </h2>

        <p>
          Are you sure you want to delete
          <strong>
            {{ facultyToDelete.name }}
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
              facultyToDelete = null
            "
          >
            Cancel
          </button>

          <button
            class="confirm-delete-btn"
            :disabled="deleting"
            @click="deleteFaculty"
          >
            {{
              deleting
                ? 'Deleting...'
                : 'Delete Faculty'
            }}
          </button>

        </div>

      </div>

    </div>


    <!-- SUCCESS MESSAGE -->
    <div
      v-if="successMessage"
      class="success-toast"
    >
      {{ successMessage }}
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

import api from '../../services/api'


// ==========================================
// TYPES
// ==========================================

interface Faculty {
  id: number
  name: string
  email: string
  role: string
  status: string
  created_at: string | null
}


// ==========================================
// STATE
// ==========================================

const faculty =
  ref<Faculty[]>([])

const loading =
  ref(false)

const saving =
  ref(false)

const deleting =
  ref(false)

const search =
  ref('')

const errorMessage =
  ref('')

const formErrorMessage =
  ref('')

const successMessage =
  ref('')

const showModal =
  ref(false)

const showPassword =
  ref(false)

const editingFaculty =
  ref<Faculty | null>(null)

const facultyToDelete =
  ref<Faculty | null>(null)


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


// ==========================================
// FILTER
// ==========================================

const filteredFaculty =
  computed(() => {

    const keyword =
      search.value
        .trim()
        .toLowerCase()

    if (!keyword) {
      return faculty.value
    }

    return faculty.value.filter(
      item => {

        return (
          item.name
            .toLowerCase()
            .includes(keyword)
          ||
          item.email
            .toLowerCase()
            .includes(keyword)
        )

      }
    )

  })


// ==========================================
// FETCH FACULTY
// ==========================================

async function fetchFaculty() {

  loading.value = true

  errorMessage.value = ''

  try {

    const response =
      await api.get(
        '/admin/faculty'
      )

    faculty.value =
      response.data.data || []

  } catch (error: any) {

    console.error(
      'FACULTY FETCH ERROR:',
      error
    )

    if (
      error.response?.status === 401
    ) {

      errorMessage.value =
        'Your session has expired.'

    } else if (
      error.response?.status === 403
    ) {

      errorMessage.value =
        'Administrator access required.'

    } else {

      errorMessage.value =
        'Failed to load faculty accounts.'
    }

  } finally {

    loading.value = false

  }

}


// ==========================================
// ADD FACULTY
// ==========================================

function openAddModal() {

  editingFaculty.value = null

  resetForm()

  showModal.value = true

}


// ==========================================
// EDIT FACULTY
// ==========================================

function openEditModal(
  item: Faculty
) {

  editingFaculty.value = item

  resetErrors()

  form.name =
    item.name

  form.email =
    item.email

  form.password = ''

  showPassword.value = false

  showModal.value = true

}


// ==========================================
// CLOSE MODAL
// ==========================================

function closeModal() {

  if (saving.value) {
    return
  }

  showModal.value = false

  editingFaculty.value = null

  resetForm()

}


// ==========================================
// SAVE FACULTY
// ==========================================

async function saveFaculty() {

  resetErrors()

  formErrorMessage.value = ''

  if (
    !form.name.trim() ||
    !form.email.trim()
  ) {

    formErrorMessage.value =
      'Name and email are required.'

    return
  }


  if (
    !editingFaculty.value &&
    !form.password
  ) {

    formErrors.password =
      'Password is required.'

    return
  }


  saving.value = true

  try {

    const payload: any = {
      name:
        form.name.trim(),

      email:
        form.email.trim()
    }


    /*
     * For editing:
     * only send password when admin
     * entered a new one.
     */
    if (form.password) {

      payload.password =
        form.password

    }


    if (editingFaculty.value) {

      await api.put(
        `/admin/faculty/${editingFaculty.value.id}`,
        payload
      )

      showSuccess(
        'Faculty account updated successfully.'
      )

    } else {

      await api.post(
        '/admin/faculty',
        payload
      )

      showSuccess(
        'Faculty account created successfully.'
      )

    }


    closeModal()

    await fetchFaculty()


  } catch (error: any) {

    console.error(
      'FACULTY SAVE ERROR:',
      error
    )


    if (
      error.response?.status === 422
    ) {

      const errors =
        error.response.data.errors || {}


      formErrors.name =
        errors.name?.[0] || ''

      formErrors.email =
        errors.email?.[0] || ''

      formErrors.password =
        errors.password?.[0] || ''


      formErrorMessage.value =
        'Please check the information you entered.'

    } else if (
      error.response?.status === 403
    ) {

      formErrorMessage.value =
        'Administrator access required.'

    } else {

      formErrorMessage.value =
        'Failed to save faculty account.'
    }


  } finally {

    saving.value = false

  }

}


// ==========================================
// DELETE
// ==========================================

function confirmDelete(
  item: Faculty
) {

  facultyToDelete.value =
    item

}


async function deleteFaculty() {

  if (!facultyToDelete.value) {
    return
  }


  deleting.value = true


  try {

    await api.delete(
      `/admin/faculty/${facultyToDelete.value.id}`
    )


    facultyToDelete.value = null


    showSuccess(
      'Faculty account deleted successfully.'
    )


    await fetchFaculty()


  } catch (error: any) {

    console.error(
      'FACULTY DELETE ERROR:',
      error
    )

    errorMessage.value =
      error.response?.data?.message
      ||
      'Failed to delete faculty account.'

  } finally {

    deleting.value = false

  }

}


// ==========================================
// HELPERS
// ==========================================

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


function showSuccess(
  message: string
) {

  successMessage.value =
    message

  window.setTimeout(() => {

    successMessage.value = ''

  }, 3000)

}


function getInitials(
  name: string
) {

  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(word =>
      word.charAt(0)
        .toUpperCase()
    )
    .join('')

}


function formatDate(
  date: string | null
) {

  if (!date) {
    return '—'
  }

  return new Date(
    date
  ).toLocaleDateString(
    'en-PH',
    {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }
  )

}
async function toggleFacultyStatus(
  item: Faculty
) {
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

    console.error(
      'FACULTY STATUS ERROR:',
      error
    )

    errorMessage.value =
      error.response?.data?.message
      ||
      'Failed to update faculty status.'
  }
}

// ==========================================
// MOUNT
// ==========================================

onMounted(() => {

  fetchFaculty()

})

</script>


<style scoped>

* {
  box-sizing: border-box;
}


/* ==========================================
   PAGE
========================================== */

.faculty-page {
  min-height: 100vh;

  padding: 28px;

  background: #f4fbf6;

  font-family:
    'Poppins',
    sans-serif;

  color: #0f172a;
}


/* ==========================================
   HEADER
========================================== */

.page-header {
  display: flex;

  justify-content:
    space-between;

  align-items: center;

  gap: 20px;

  margin-bottom: 22px;
}


.page-header h1 {
  font-size: 28px;

  font-weight: 800;

  margin: 0;
}


.page-header p {
  color: #64748b;

  font-size: 14px;

  margin-top: 6px;
}


.add-btn {
  border: none;

  background: #16a34a;

  color: white;

  padding: 12px 20px;

  border-radius: 9px;

  font-weight: 700;

  cursor: pointer;

  transition: .2s;
}


.add-btn:hover {
  background: #15803d;

  transform:
    translateY(-1px);
}


/* ==========================================
   STAT
========================================== */

.stats {
  display: grid;

  grid-template-columns:
    minmax(220px, 300px);

  margin-bottom: 22px;
}


.stat-card {
  background: white;

  border:
    1px solid #00d400;

  border-radius: 10px;

  padding: 17px 18px;

  display: flex;

  justify-content:
    space-between;

  align-items: center;
}


.stat-card span {
  font-size: 15px;

  color: #475569;
}


.stat-card h2 {
  font-size: 25px;

  margin:
    8px 0 0;
}


.stat-icon {
  width: 50px;
  height: 50px;

  display: flex;

  align-items: center;

  justify-content: center;

  background: #dcfce7;

  border-radius: 9px;

  font-size: 27px;
}


/* ==========================================
   TABLE SECTION
========================================== */

.table-section {
  background: white;

  border:
    1px solid #e2e8f0;

  border-radius: 14px;

  padding: 24px;

  box-shadow:
    0 5px 18px
    rgba(15, 23, 42, .04);
}


.table-header {
  display: flex;

  justify-content:
    space-between;

  align-items: center;

  gap: 20px;

  margin-bottom: 20px;
}


.table-header h2 {
  font-size: 20px;

  margin: 0;
}


.table-header p {
  color: #64748b;

  font-size: 13px;

  margin-top: 5px;
}


.search-wrapper input {
  width: 260px;

  height: 42px;

  border:
    1px solid #cbd5e1;

  border-radius: 8px;

  padding:
    0 13px;

  outline: none;

  font-size: 13px;
}


.search-wrapper input:focus {
  border-color: #16a34a;

  box-shadow:
    0 0 0 3px
    rgba(22, 163, 74, .10);
}


/* ==========================================
   TABLE
========================================== */

.table-container {
  overflow-x: auto;
}


table {
  width: 100%;

  border-collapse:
    collapse;
}


th {
  background: #f8fafc;

  color: #475569;

  font-size: 12px;

  font-weight: 700;

  text-align: left;

  padding: 13px;

  border-bottom:
    1px solid #e2e8f0;
}


td {
  padding: 14px 13px;

  border-bottom:
    1px solid #f1f5f9;

  font-size: 13px;

  color: #334155;
}


tbody tr:hover {
  background: #f8fff9;
}


.faculty-info {
  display: flex;

  align-items: center;

  gap: 11px;
}


.faculty-info strong {
  display: block;

  color: #0f172a;

  margin-bottom: 3px;
}


.faculty-info small {
  color: #94a3b8;

  font-size: 10px;
}


.avatar {
  width: 40px;
  height: 40px;

  border-radius: 50%;

  background: #dcfce7;

  color: #15803d;

  display: flex;

  justify-content: center;

  align-items: center;

  font-weight: 800;
}


.role-badge {
  display: inline-block;

  padding:
    5px 10px;

  border-radius: 20px;

  background: #dcfce7;

  color: #15803d;

  font-size: 11px;

  font-weight: 700;

  text-transform:
    capitalize;
}


.actions-heading {
  text-align: center;
}


.action-buttons {
  display: flex;

  justify-content: center;

  gap: 8px;
}


.edit-btn,
.delete-btn {
  border: none;

  padding:
    7px 12px;

  border-radius: 6px;

  font-size: 11px;

  font-weight: 700;

  cursor: pointer;
}


.edit-btn {
  background: #eff6ff;

  color: #2563eb;
}


.delete-btn {
  background: #fef2f2;

  color: #dc2626;
}


.empty {
  text-align: center;

  color: #94a3b8;

  padding: 35px;
}


/* ==========================================
   MODAL
========================================== */

.modal-overlay {
  position: fixed;

  inset: 0;

  background:
    rgba(15, 23, 42, .55);

  backdrop-filter:
    blur(4px);

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

  box-shadow:
    0 20px 55px
    rgba(0, 0, 0, .25);
}


.modal-header {
  display: flex;

  justify-content:
    space-between;

  align-items:
    flex-start;

  margin-bottom: 23px;
}


.modal-header h2 {
  font-size: 21px;

  margin: 0;
}


.modal-header p {
  color: #64748b;

  font-size: 12px;

  margin-top: 5px;
}


.close-btn {
  border: none;

  background: transparent;

  font-size: 28px;

  color: #64748b;

  cursor: pointer;
}


/* ==========================================
   INPUTS
========================================== */

.input-group {
  margin-bottom: 17px;
}


.input-group label {
  display: block;

  font-size: 13px;

  font-weight: 600;

  margin-bottom: 7px;
}


.input-group label span {
  color: #94a3b8;

  font-weight: 400;

  font-size: 11px;
}


.input-group input {
  width: 100%;

  height: 46px;

  border:
    1px solid #cbd5e1;

  border-radius: 8px;

  padding:
    0 13px;

  outline: none;

  font-size: 13px;
}


.input-group input:focus {
  border-color: #16a34a;

  box-shadow:
    0 0 0 3px
    rgba(22, 163, 74, .10);
}


.password-wrapper {
  position: relative;
}


.password-wrapper input {
  padding-right: 60px;
}


.eye-btn {
  position: absolute;

  right: 8px;

  top: 50%;

  transform:
    translateY(-50%);

  border: none;

  background: transparent;

  color: #16a34a;

  font-size: 11px;

  font-weight: 700;

  cursor: pointer;
}


.field-error {
  display: block;

  color: #dc2626;

  font-size: 11px;

  margin-top: 5px;
}


.form-error {
  background: #fef2f2;

  color: #dc2626;

  border:
    1px solid #fecaca;

  border-radius: 7px;

  padding: 10px;

  font-size: 12px;

  margin-bottom: 15px;
}


/* ==========================================
   MODAL ACTIONS
========================================== */

.modal-actions {
  display: flex;

  justify-content:
    flex-end;

  gap: 10px;

  margin-top: 22px;
}


.cancel-btn,
.save-btn,
.confirm-delete-btn {
  border: none;

  border-radius: 8px;

  padding:
    11px 17px;

  font-size: 12px;

  font-weight: 700;

  cursor: pointer;
}


.cancel-btn {
  background: #e2e8f0;

  color: #475569;
}


.save-btn {
  background: #16a34a;

  color: white;
}


.confirm-delete-btn {
  background: #dc2626;

  color: white;
}


button:disabled {
  opacity: .6;

  cursor: not-allowed;
}

.status-badge {
  display: inline-block;
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

.status-btn {
  border: none;
  padding: 7px 12px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
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
/* ==========================================
   DELETE MODAL
========================================== */

.delete-modal {
  width: 400px;

  max-width: 100%;

  background: white;

  border-radius: 16px;

  padding: 28px;

  text-align: center;
}


.delete-icon {
  font-size: 40px;

  margin-bottom: 12px;
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


/* ==========================================
   MESSAGES
========================================== */

.state-message {
  text-align: center;

  color: #64748b;

  padding: 30px;
}


.error-box {
  background: #fef2f2;

  border:
    1px solid #fecaca;

  color: #dc2626;

  padding: 14px;

  border-radius: 8px;

  display: flex;

  justify-content:
    space-between;

  align-items: center;
}


.error-box button {
  border: none;

  background: #dc2626;

  color: white;

  padding: 7px 12px;

  border-radius: 6px;

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

  font-size: 12px;

  font-weight: 600;

  box-shadow:
    0 10px 25px
    rgba(0, 0, 0, .18);

  z-index: 10000;
}


/* ==========================================
   RESPONSIVE
========================================== */

@media(max-width: 768px) {

  .faculty-page {
    padding: 18px;
  }


  .page-header,
  .table-header {
    flex-direction: column;

    align-items:
      stretch;
  }


  .add-btn,
  .search-wrapper input {
    width: 100%;
  }


  .stats {
    grid-template-columns: 1fr;
  }


  .modal-actions {
    flex-direction: column;
  }


  .cancel-btn,
  .save-btn,
  .confirm-delete-btn {
    width: 100%;
  }

}

</style>
