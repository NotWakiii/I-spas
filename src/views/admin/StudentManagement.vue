<template>
  <div class="student-page">

    <!-- ==========================================
         PAGE HEADER
    =========================================== -->
    <div class="page-header">
      <div>
        <h1>Manage Students</h1>
        <p>
          Create and manage student accounts within the
          Senior High School department.
        </p>
      </div>

      <div class="header-actions">
        <button
          class="import-btn"
          @click="openImportModal"
        >
          <FileSpreadsheet :size="18" />
          Import Excel
        </button>

        <button
          class="add-btn"
          @click="openAddModal"
        >
          <UserPlus :size="18" />
          Add Student
        </button>
      </div>
    </div>

    <!-- ==========================================
         NOTIFICATIONS
    =========================================== -->
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

    <!-- ==========================================
         BULK ACTIONS
    =========================================== -->
    <div
      v-if="selectedStudents.length"
      class="bulk-actions"
    >
      <div class="bulk-info">
        <strong>
          {{ selectedStudents.length }}
        </strong>

        <span>
          {{
            selectedStudents.length === 1
              ? 'student selected'
              : 'students selected'
          }}
        </span>
      </div>

      <div class="bulk-buttons">
        <button
          class="bulk-btn active"
          :disabled="bulkUpdating"
          @click="bulkUpdateStatus('active')"
        >
          <CircleCheckBig :size="16" />
          Mark Active
        </button>

        <button
          class="bulk-btn inactive"
          :disabled="bulkUpdating"
          @click="bulkUpdateStatus('inactive')"
        >
          <LoaderCircle
            v-if="bulkUpdating"
            :size="16"
            class="spinner"
          />

          <CircleAlert
            v-else
            :size="16"
          />

          Mark Inactive
        </button>
      </div>
    </div>

    <!-- ==========================================
         STUDENT TABLE
    =========================================== -->
    <div class="table-card">

      <div
        v-if="loading"
        class="loading-state"
      >
        <LoaderCircle
          :size="28"
          class="spinner"
        />

        <span>
          Loading students...
        </span>
      </div>

      <div
        v-else
        class="table-wrapper"
      >
        <table>
          <thead>
            <tr>

              <!-- SELECT ALL -->
              <th class="select-all-column">
                <label class="select-all-label">
                  <input
                    ref="selectAllCheckbox"
                    type="checkbox"
                    :checked="allStudentsSelected"
                    @change="toggleSelectAll"
                  />

                  <span>Select All</span>
                </label>
              </th>

              <!-- NUMBER -->
              <th class="number-column">
                #
              </th>

              <th>LRN</th>
              <th>Name</th>
              <th>Sex</th>
              <th>Email</th>
              <th>Status</th>
              <th>Date</th>

              <th class="actions-column">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>

            <tr
              v-for="(student, index) in students"
              :key="student.id"
              :class="{
                'selected-row':
                  selectedStudents.includes(student.id)
              }"
            >

              <!-- CHECKBOX -->
              <td class="checkbox-column">
                <input
                  v-model="selectedStudents"
                  type="checkbox"
                  :value="student.id"
                />
              </td>

              <!-- NUMBER -->
              <td class="number-cell">
                {{ index + 1 }}
              </td>

              <!-- LRN -->
              <td>
                <span class="lrn-value">
                  {{ student.lrn }}
                </span>
              </td>

              <!-- NAME -->
              <td>
                <div class="student-info">

                  <div class="student-avatar">
                    {{ getInitials(student.name) }}
                  </div>

                  <strong>
                    {{ student.name }}
                  </strong>

                </div>
              </td>

              <!-- SEX -->
              <td>
                {{ student.sex }}
              </td>

              <!-- EMAIL -->
              <td>
                {{ student.email }}
              </td>

              <!-- STATUS -->
              <td>
                <span
                  class="status-badge"
                  :class="
                    student.status === 'active'
                      ? 'active'
                      : 'inactive'
                  "
                >
                  {{
                    student.status === 'active'
                      ? 'Active'
                      : 'Inactive'
                  }}
                </span>
              </td>

              <!-- DATE -->
              <td>
                {{ formatDate(student.created_at) }}
              </td>

              <!-- ACTIONS -->
              <td>
                <div class="action-buttons">

                  <button
                    class="action-btn edit"
                    @click="openEditModal(student)"
                  >
                    <Pencil :size="15" />
                    Edit
                  </button>

                  <button
                    class="action-btn delete"
                    @click="openDeleteDialog(student)"
                  >
                    <Trash2 :size="15" />
                    Delete
                  </button>

                </div>
              </td>

            </tr>

            <!-- EMPTY STATE -->
            <tr v-if="students.length === 0">
              <td
                colspan="9"
                class="empty-state"
              >
                <Users :size="42" />

                <strong>
                  No students found
                </strong>

                <p>
                  Add your first student account
                  to get started.
                </p>
              </td>
            </tr>

          </tbody>
        </table>
      </div>
    </div>


    <!-- ==========================================
         IMPORT STUDENTS MODAL
    =========================================== -->
    <div
      v-if="showImportModal"
      class="modal-overlay"
      @click.self="closeImportModal"
    >
      <div class="modal-card import-modal">

        <div class="modal-header">
          <div>
            <h2>
              Import Students
            </h2>

            <p>
              Upload multiple student accounts
              using an Excel or CSV file.
            </p>
          </div>

          <button
            class="close-btn"
            :disabled="importing"
            @click="closeImportModal"
          >
            <X :size="20" />
          </button>
        </div>


        <!-- IMPORT GUIDE -->
        <div class="import-guide">

          <div class="guide-title">
            <CircleAlert :size="18" />

            <strong>
              Excel Format Guide
            </strong>
          </div>

          <p>
            Your file must use these exact columns
            in the first row:
          </p>

          <div class="column-preview">
            <span>LRN</span>
            <span>Name</span>
            <span>Sex</span>
            <span>Email</span>
          </div>

          <ul>
            <li>
              Do not rename the column headers.
            </li>

            <li>
              LRN must contain numbers only.
            </li>

            <li>
              Sex must be Male or Female.
            </li>

            <li>
              Email must contain a valid email address.
            </li>

            <li>
              Use one student per row.
            </li>

            <li>
              Do not add blank rows above the headers.
            </li>

            <li>
              Strand, grade, section, subject, and class
              are not required in Student Management.
            </li>
          </ul>


          <!-- EXAMPLE -->
          <div class="example-table-wrapper">

            <table class="example-table">
              <thead>
                <tr>
                  <th>LRN</th>
                  <th>Name</th>
                  <th>Sex</th>
                  <th>Email</th>
                </tr>
              </thead>

              <tbody>
                <tr>
                  <td>123456789001</td>
                  <td>Juan Dela Cruz</td>
                  <td>Male</td>
                  <td>juan@gmail.com</td>
                </tr>
              </tbody>
            </table>

          </div>


          <!-- GUIDE BUTTONS -->
          <div class="guide-actions">

            <button
              type="button"
              class="guide-btn"
              @click="downloadTemplate"
            >
              <Download :size="16" />
              Download CSV Template
            </button>

            <button
              type="button"
              class="guide-btn"
              @click="copyChatGPTPrompt"
            >
              <Copy :size="16" />

              {{
                promptCopied
                  ? 'Prompt Copied!'
                  : 'Copy ChatGPT Prompt'
              }}
            </button>

          </div>

        </div>


        <!-- FILE UPLOAD -->
        <div class="file-upload-box">

          <FileSpreadsheet :size="40" />

          <strong>
            Select Excel File
          </strong>

          <span>
            Accepted: .xlsx, .xls, .csv
          </span>

          <input
            type="file"
            accept=".xlsx,.xls,.csv"
            :disabled="importing"
            @change="handleImportFile"
          />

          <p v-if="importFile">
            Selected: {{ importFile.name }}
          </p>

        </div>


        <!-- IMPORT ERROR -->
        <div
          v-if="importError"
          class="form-error-message import-message"
        >
          <CircleAlert :size="18" />
          <span>{{ importError }}</span>
        </div>


        <!-- IMPORT RESULT -->
        <div
          v-if="importResult"
          class="import-result"
        >
          <strong>
            Import Complete
          </strong>

          <span>
            Imported:
            {{ importResult.imported ?? 0 }}
          </span>

          <span>
            Skipped:
            {{ importResult.skipped ?? 0 }}
          </span>

          <span
            v-if="importResult.failed !== undefined"
          >
            Failed:
            {{ importResult.failed }}
          </span>
        </div>


        <!-- IMPORT ACTIONS -->
        <div class="modal-actions">

          <button
            type="button"
            class="cancel-btn"
            :disabled="importing"
            @click="closeImportModal"
          >
            Cancel
          </button>

          <button
            type="button"
            class="save-btn"
            :disabled="importing || !importFile"
            @click="importStudents"
          >
            <LoaderCircle
              v-if="importing"
              :size="17"
              class="spinner"
            />

            <FileSpreadsheet
              v-else
              :size="17"
            />

            {{
              importing
                ? 'Importing...'
                : 'Import Students'
            }}
          </button>

        </div>

      </div>
    </div>


    <!-- ==========================================
         ADD / EDIT STUDENT MODAL
    =========================================== -->
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
                editingStudent
                  ? 'Edit Student'
                  : 'Add Student'
              }}
            </h2>

            <p>
              {{
                editingStudent
                  ? 'Update the student account information.'
                  : 'Enter the information for the new student account.'
              }}
            </p>

          </div>

          <button
            class="close-btn"
            :disabled="saving"
            @click="closeModal"
          >
            <X :size="20" />
          </button>

        </div>


        <form
          class="modal-form"
          @submit.prevent="saveStudent"
        >

          <!-- LRN + SEX -->
          <div class="form-row">

            <div class="form-group">

              <label>
                LRN
              </label>

              <input
                v-model="form.lrn"
                type="text"
                inputmode="numeric"
                maxlength="20"
                placeholder="Enter LRN"
                :disabled="saving"
                @input="cleanLRN"
              />

              <span
                v-if="formErrors.lrn"
                class="field-error"
              >
                {{ formErrors.lrn }}
              </span>

            </div>


            <div class="form-group">

              <label>
                Sex
              </label>

              <select
                v-model="form.sex"
                :disabled="saving"
              >
                <option value="">
                  Select Sex
                </option>

                <option value="Male">
                  Male
                </option>

                <option value="Female">
                  Female
                </option>
              </select>

              <span
                v-if="formErrors.sex"
                class="field-error"
              >
                {{ formErrors.sex }}
              </span>

            </div>

          </div>


          <!-- NAME -->
          <div class="form-group">

            <label>
              Student Name
            </label>

            <input
              v-model="form.name"
              type="text"
              placeholder="Enter complete student name"
              :disabled="saving"
            />

            <span
              v-if="formErrors.name"
              class="field-error"
            >
              {{ formErrors.name }}
            </span>

          </div>


          <!-- EMAIL -->
          <div class="form-group">

            <label>
              Email Address
            </label>

            <input
              v-model="form.email"
              type="email"
              placeholder="Enter email address"
              :disabled="saving"
            />

            <span
              v-if="formErrors.email"
              class="field-error"
            >
              {{ formErrors.email }}
            </span>

          </div>


          <!-- FORM ERROR -->
          <div
            v-if="formErrorMessage"
            class="form-error-message"
          >
            <CircleAlert :size="18" />
            <span>{{ formErrorMessage }}</span>
          </div>


          <!-- ACTIONS -->
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

              {{
                saving
                  ? 'Saving...'
                  : editingStudent
                    ? 'Update Student'
                    : 'Add Student'
              }}

            </button>

          </div>

        </form>

      </div>
    </div>


    <!-- ==========================================
         DELETE STUDENT MODAL
    =========================================== -->
    <div
      v-if="studentToDelete"
      class="modal-overlay"
      @click.self="closeDeleteDialog"
    >
      <div class="delete-card">

        <div class="delete-icon">
          <Trash2 :size="30" />
        </div>

        <h2>
          Delete Student?
        </h2>

        <p>
          Are you sure you want to delete
          <strong>
            {{ studentToDelete.name }}
          </strong>?
        </p>

        <div class="student-delete-details">

          <span>
            LRN:
            {{ studentToDelete.lrn }}
          </span>

          <span>
            {{ studentToDelete.email }}
          </span>

        </div>

        <p class="warning-text">
          This will permanently remove the
          student's account.
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
            @click="deleteStudent"
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

            {{
              deleting
                ? 'Deleting...'
                : 'Delete Student'
            }}

          </button>

        </div>

      </div>
    </div>

  </div>
</template>


<script setup lang="ts">

import {
  computed,
  nextTick,
  reactive,
  ref,
  watch,
  onMounted
} from 'vue'

import {
  CircleAlert,
  CircleCheckBig,
  Copy,
  Download,
  FileSpreadsheet,
  LoaderCircle,
  Pencil,
  Save,
  Trash2,
  UserPlus,
  Users,
  X
} from '@lucide/vue'

import api from '../../services/api'


/* ==========================================
   INTERFACES
========================================== */

interface Student {
  id: number
  lrn: string
  name: string
  sex: string
  email: string
  role: string
  status: string
  created_at?: string
}


/* ==========================================
   STUDENTS
========================================== */

const students =
  ref<Student[]>([])


/* ==========================================
   LOADING STATES
========================================== */

const loading =
  ref(false)

const saving =
  ref(false)

const deleting =
  ref(false)

const bulkUpdating =
  ref(false)

const importing =
  ref(false)


/* ==========================================
   MODALS
========================================== */

const showModal =
  ref(false)

const showImportModal =
  ref(false)

const editingStudent =
  ref<Student | null>(null)

const studentToDelete =
  ref<Student | null>(null)


/* ==========================================
   MESSAGES
========================================== */

const successMessage =
  ref('')

const errorMessage =
  ref('')

const formErrorMessage =
  ref('')


/* ==========================================
   IMPORT
========================================== */

const importFile =
  ref<File | null>(null)

const importError =
  ref('')

const importResult =
  ref<any>(null)

const promptCopied =
  ref(false)


/* ==========================================
   BULK SELECTION
========================================== */

const selectedStudents =
  ref<number[]>([])

const selectAllCheckbox =
  ref<HTMLInputElement | null>(null)


/* ==========================================
   FORM
========================================== */

const form = reactive({
  lrn: '',
  name: '',
  sex: '',
  email: ''
})


const formErrors = reactive({
  lrn: '',
  name: '',
  sex: '',
  email: ''
})


/* ==========================================
   SELECT ALL COMPUTED
========================================== */

const allStudentsSelected =
  computed(() => {

    return (
      students.value.length > 0 &&
      selectedStudents.value.length ===
        students.value.length
    )

  })


const someStudentsSelected =
  computed(() => {

    return (
      selectedStudents.value.length > 0 &&
      selectedStudents.value.length <
        students.value.length
    )

  })


/* ==========================================
   CHECKBOX INDETERMINATE
========================================== */

watch(
  [
    allStudentsSelected,
    someStudentsSelected
  ],

  async () => {

    await nextTick()

    if (selectAllCheckbox.value) {

      selectAllCheckbox.value.indeterminate =
        someStudentsSelected.value

    }

  },

  {
    immediate: true
  }
)


/* ==========================================
   HELPERS
========================================== */

function getInitials(
  name: string
) {

  if (!name) {
    return 'S'
  }

  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(word =>
      word
        .charAt(0)
        .toUpperCase()
    )
    .join('')

}


function formatDate(
  date?: string
) {

  if (!date) {
    return 'N/A'
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


function cleanLRN() {

  form.lrn =
    form.lrn.replace(
      /\D/g,
      ''
    )

}


/* ==========================================
   FORM RESET
========================================== */

function clearFormErrors() {

  formErrors.lrn = ''
  formErrors.name = ''
  formErrors.sex = ''
  formErrors.email = ''

}


function resetForm() {

  form.lrn = ''
  form.name = ''
  form.sex = ''
  form.email = ''

  formErrorMessage.value = ''

  clearFormErrors()

}


/* ==========================================
   NOTIFICATIONS
========================================== */

function showSuccess(
  message: string
) {

  successMessage.value =
    message

  window.setTimeout(
    () => {

      successMessage.value = ''

    },
    3500
  )

}


function showError(
  message: string
) {

  errorMessage.value =
    message

  window.setTimeout(
    () => {

      errorMessage.value = ''

    },
    4000
  )

}


/* ==========================================
   SELECT ALL
========================================== */

function toggleSelectAll(
  event: Event
) {

  const target =
    event.target as HTMLInputElement

  selectedStudents.value =
    target.checked
      ? students.value.map(
          student =>
            student.id
        )
      : []

}


/* ==========================================
   FETCH STUDENTS
========================================== */

async function fetchStudents() {

  loading.value = true

  try {

    const response =
      await api.get(
        '/admin/students'
      )

    students.value =
      Array.isArray(
        response.data?.data
      )
        ? response.data.data
        : []


    selectedStudents.value =
      selectedStudents.value.filter(
        id =>
          students.value.some(
            student =>
              student.id === id
          )
      )

  } catch (error: any) {

    console.error(
      'STUDENT FETCH ERROR:',
      error
    )

    showError(
      error.response?.data?.message ||
      'Failed to load students.'
    )

  } finally {

    loading.value = false

  }

}


/* ==========================================
   IMPORT CHATGPT PROMPT
========================================== */

const chatGPTPrompt = `
I need to prepare a student account list for import into the I-SPAS Student Management System.

Please clean and organize my student data using exactly these Excel columns and this exact order:

LRN | Name | Sex | Email

Follow these rules:

- Keep one student per row.
- LRN must contain numbers only and must not be changed.
- Name should contain the student's complete name.
- Sex must only be Male or Female.
- Email must be a valid email address.
- Do not add Strand, Grade, Section, Subject, or Class columns.
- Do not add extra columns.
- Do not change or invent missing student information.
- If information is missing or unclear, mark the cell as MISSING instead of guessing.
- Preserve leading zeros in LRN if there are any.
- Remove duplicate students only when they have the exact same LRN.

After cleaning the data, create an .xlsx Excel file that is ready to import into I-SPAS.

Do not add a title, explanation, merged cells, blank rows, or formatting above the column headers.

The first row must immediately contain the required column headers.
`


/* ==========================================
   IMPORT MODAL
========================================== */

function openImportModal() {

  importFile.value = null
  importError.value = ''
  importResult.value = null
  promptCopied.value = false

  showImportModal.value = true

}


function closeImportModal() {

  if (importing.value) {
    return
  }

  showImportModal.value = false

  importFile.value = null
  importError.value = ''
  importResult.value = null

}


function handleImportFile(
  event: Event
) {

  const input =
    event.target as HTMLInputElement

  importFile.value =
    input.files?.[0] || null

  importError.value = ''
  importResult.value = null

}


/* ==========================================
   COPY CHATGPT PROMPT
========================================== */

async function copyChatGPTPrompt() {

  try {

    await navigator.clipboard.writeText(
      chatGPTPrompt
    )

    promptCopied.value = true

    window.setTimeout(
      () => {

        promptCopied.value = false

      },
      2500
    )

  } catch {

    importError.value =
      'Unable to copy the prompt. Please allow clipboard access.'

  }

}


/* ==========================================
   DOWNLOAD CSV TEMPLATE
========================================== */

function downloadTemplate() {

  const csv =
    'LRN,Name,Sex,Email\n' +
    '123456789001,Juan Dela Cruz,Male,juan@gmail.com\n'

  const blob =
    new Blob(
      [csv],
      {
        type:
          'text/csv;charset=utf-8;'
      }
    )

  const url =
    URL.createObjectURL(blob)

  const link =
    document.createElement('a')

  link.href = url

  link.download =
    'I-SPAS_Student_Import_Template.csv'

  document.body.appendChild(
    link
  )

  link.click()

  document.body.removeChild(
    link
  )

  URL.revokeObjectURL(
    url
  )

}


/* ==========================================
   IMPORT STUDENTS
========================================== */

async function importStudents() {

  if (!importFile.value) {

    importError.value =
      'Please select an Excel or CSV file.'

    return

  }


  importing.value = true

  importError.value = ''

  importResult.value = null


  try {

    const formData =
      new FormData()

    formData.append(
      'file',
      importFile.value
    )


    const response =
      await api.post(
        '/admin/students/import',
        formData,
        {
          headers: {
            'Content-Type':
              'multipart/form-data'
          }
        }
      )


    importResult.value =
      response.data?.data ||
      response.data


    showSuccess(
      response.data?.message ||
      'Students imported successfully.'
    )


    await fetchStudents()

  } catch (error: any) {

    console.error(
      'STUDENT IMPORT ERROR:',
      error
    )

    importError.value =
      error.response?.data?.message ||
      'Failed to import students.'

  } finally {

    importing.value = false

  }

}


/* ==========================================
   ADD STUDENT
========================================== */

function openAddModal() {

  resetForm()

  editingStudent.value = null

  showModal.value = true

}


/* ==========================================
   EDIT STUDENT
========================================== */

function openEditModal(
  student: Student
) {

  resetForm()

  editingStudent.value =
    student

  form.lrn =
    student.lrn

  form.name =
    student.name

  form.sex =
    student.sex

  form.email =
    student.email

  showModal.value = true

}


/* ==========================================
   CLOSE ADD / EDIT MODAL
========================================== */

function closeModal() {

  if (saving.value) {
    return
  }

  showModal.value = false

  editingStudent.value = null

  resetForm()

}


/* ==========================================
   VALIDATION
========================================== */

function validateForm() {

  clearFormErrors()

  let valid = true


  if (!form.lrn.trim()) {

    formErrors.lrn =
      'LRN is required.'

    valid = false

  }


  if (!form.name.trim()) {

    formErrors.name =
      'Student name is required.'

    valid = false

  }


  if (!form.sex) {

    formErrors.sex =
      'Sex is required.'

    valid = false

  }


  if (!form.email.trim()) {

    formErrors.email =
      'Email address is required.'

    valid = false

  }


  return valid

}


/* ==========================================
   SAVE STUDENT
========================================== */

async function saveStudent() {

  if (
    saving.value ||
    !validateForm()
  ) {
    return
  }


  saving.value = true

  formErrorMessage.value = ''


  try {

    const payload = {

      lrn:
        form.lrn.trim(),

      name:
        form.name.trim(),

      sex:
        form.sex,

      email:
        form.email.trim()

    }


    if (editingStudent.value) {

      await api.put(
        `/admin/students/${editingStudent.value.id}`,
        payload
      )

      showSuccess(
        'Student updated successfully.'
      )

    } else {

      await api.post(
        '/admin/students',
        payload
      )

      showSuccess(
        'Student added successfully.'
      )

    }


    showModal.value = false

    editingStudent.value = null

    resetForm()

    await fetchStudents()

  } catch (error: any) {

    console.error(
      'STUDENT SAVE ERROR:',
      error
    )


    if (
      error.response?.status === 422
    ) {

      const errors =
        error.response?.data?.errors


      if (errors?.lrn?.[0]) {

        formErrors.lrn =
          errors.lrn[0]

      }


      if (errors?.name?.[0]) {

        formErrors.name =
          errors.name[0]

      }


      if (errors?.sex?.[0]) {

        formErrors.sex =
          errors.sex[0]

      }


      if (errors?.email?.[0]) {

        formErrors.email =
          errors.email[0]

      }


      formErrorMessage.value =
        error.response?.data?.message ||
        'Please check the information you entered.'

    } else {

      formErrorMessage.value =
        error.response?.data?.message ||
        'Failed to save student.'

    }

  } finally {

    saving.value = false

  }

}


/* ==========================================
   BULK STATUS UPDATE
========================================== */

async function bulkUpdateStatus(
  status: 'active' | 'inactive'
) {

  if (
    !selectedStudents.value.length ||
    bulkUpdating.value
  ) {
    return
  }


  bulkUpdating.value = true


  try {

    const count =
      selectedStudents.value.length


    await api.put(
      '/admin/students/bulk-status',
      {
        student_ids:
          selectedStudents.value,

        status
      }
    )


    showSuccess(
      `${count} ${
        count === 1
          ? 'student'
          : 'students'
      } marked as ${status}.`
    )


    selectedStudents.value = []

    await fetchStudents()

  } catch (error: any) {

    console.error(
      'BULK STATUS ERROR:',
      error
    )


    showError(
      error.response?.data?.message ||
      'Failed to update student status.'
    )

  } finally {

    bulkUpdating.value = false

  }

}


/* ==========================================
   DELETE DIALOG
========================================== */

function openDeleteDialog(
  student: Student
) {

  studentToDelete.value =
    student

}


function closeDeleteDialog() {

  if (deleting.value) {
    return
  }

  studentToDelete.value =
    null

}


/* ==========================================
   DELETE STUDENT
========================================== */

async function deleteStudent() {

  if (
    !studentToDelete.value ||
    deleting.value
  ) {
    return
  }


  deleting.value = true


  try {

    await api.delete(
      `/admin/students/${studentToDelete.value.id}`
    )


    selectedStudents.value =
      selectedStudents.value.filter(
        id =>
          id !==
          studentToDelete.value?.id
      )


    studentToDelete.value = null


    showSuccess(
      'Student deleted successfully.'
    )


    await fetchStudents()

  } catch (error: any) {

    console.error(
      'STUDENT DELETE ERROR:',
      error
    )


    showError(
      error.response?.data?.message ||
      'Failed to delete student.'
    )

  } finally {

    deleting.value = false

  }

}


/* ==========================================
   ON MOUNT
========================================== */

onMounted(
  async () => {

    await fetchStudents()

  }
)

</script>

<style scoped>
* {
  box-sizing: border-box;
}

.student-page {
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
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: #16a34a;
  color: #fff;
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

.bulk-actions {
  margin-bottom: 14px;
  padding: 12px 15px;
  border: 1px solid #bbf7d0;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 15px;
  background: #f0fdf4;
}

.bulk-info {
  display: flex;
  align-items: center;
  gap: 5px;
  color: #166534;
  font-size: 11px;
}

.bulk-info strong {
  font-size: 13px;
}

.bulk-buttons {
  display: flex;
  gap: 8px;
}

.bulk-btn {
  min-height: 34px;
  padding: 0 11px;
  border: none;
  border-radius: 7px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-family: inherit;
  font-size: 10px;
  font-weight: 700;
  cursor: pointer;
}

.bulk-btn.active {
  background: #16a34a;
  color: #fff;
}

.bulk-btn.active:hover {
  background: #15803d;
}

.bulk-btn.inactive {
  background: #475569;
  color: #fff;
}

.bulk-btn.inactive:hover {
  background: #334155;
}

.bulk-btn:disabled {
  opacity: .6;
  cursor: not-allowed;
}

.table-card {
  overflow: hidden;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  background: #fff;
  box-shadow: 0 5px 20px rgba(15, 23, 42, .04);
}

.table-wrapper {
  width: 100%;
  overflow-x: auto;
}

table {
  width: 100%;
  min-width: 1050px;
  border-collapse: collapse;
}

thead {
  background: #f8fafc;
}

th {
  padding: 15px 16px;
  border-bottom: 1px solid #e2e8f0;
  color: #64748b;
  font-size: 10px;
  font-weight: 700;
  text-align: left;
  text-transform: uppercase;
}

td {
  padding: 16px;
  border-bottom: 1px solid #f1f5f9;
  color: #334155;
  font-size: 11px;
}

tbody tr:last-child td {
  border-bottom: none;
}

tbody tr:hover {
  background: #fafdfb;
}

.selected-row {
  background: #f0fdf4 !important;
}

.checkbox-column {
  width: 45px;
  padding-left: 16px;
  padding-right: 8px;
  text-align: center;
}

.checkbox-column input {
  width: 15px;
  height: 15px;
  accent-color: #16a34a;
  cursor: pointer;
}

.lrn-value {
  color: #166534;
  font-weight: 700;
}

.student-info {
  min-width: 160px;
  display: flex;
  align-items: center;
  gap: 9px;
}

.student-avatar {
  width: 34px;
  height: 34px;
  flex-shrink: 0;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #dcfce7;
  color: #15803d;
  font-size: 10px;
  font-weight: 800;
}

.student-info strong {
  font-size: 11px;
}
.number-column,
.number-cell {
  width: 55px;
  text-align: center;
}

.number-cell {
  color: #64748b;
  font-weight: 700;
}

.strand-badge {
  padding: 5px 8px;
  border-radius: 999px;
  display: inline-flex;
  background: #dcfce7;
  color: #15803d;
  font-size: 9px;
  font-weight: 700;
}

.section-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.section-info strong {
  font-size: 11px;
}

.section-info span {
  color: #94a3b8;
  font-size: 9px;
}

.status-badge {
  padding: 5px 9px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 9px;
  font-weight: 700;
}

.status-badge.active {
  background: #dcfce7;
  color: #15803d;
}

.status-badge.inactive {
  background: #f1f5f9;
  color: #64748b;
}

.actions-column {
  width: 170px;
}

.action-buttons {
  display: flex;
  gap: 7px;
}

.action-btn {
  min-height: 33px;
  padding: 0 10px;
  border: none;
  border-radius: 7px;
  display: flex;
  align-items: center;
  gap: 5px;
  font-family: inherit;
  font-size: 9px;
  font-weight: 700;
  cursor: pointer;
}

.action-btn.edit {
  background: #eff6ff;
  color: #2563eb;
}

.action-btn.delete {
  background: #fef2f2;
  color: #dc2626;
}

.loading-state,
.empty-state {
  padding: 55px 20px;
  color: #64748b;
  text-align: center;
}

.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.empty-state svg {
  margin-bottom: 10px;
  color: #94a3b8;
}

.empty-state strong {
  display: block;
}

.empty-state p {
  margin: 5px 0 0;
  font-size: 10px;
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
  width: 590px;
  max-width: 100%;
  max-height: calc(100vh - 40px);
  overflow-y: auto;
  border-radius: 16px;
  background: #fff;
  box-shadow: 0 20px 55px rgba(0, 0, 0, .23);
}

.modal-card {
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
  font-size: 19px;
}

.modal-header p {
  margin: 5px 0 0;
  color: #64748b;
  font-size: 11px;
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

.modal-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
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

.form-group input,
.form-group select {
  width: 100%;
  height: 43px;
  padding: 0 12px;
  border: 1px solid #cbd5e1;
  border-radius: 8px;
  outline: none;
  background: #fff;
  color: #0f172a;
  font-family: inherit;
  font-size: 12px;
}

.form-group input:focus,
.form-group select:focus {
  border-color: #16a34a;
  box-shadow: 0 0 0 3px rgba(22, 163, 74, .1);
}

.form-group select:disabled,
.form-group input:disabled {
  background: #f8fafc;
  cursor: not-allowed;
}

.field-error {
  color: #dc2626;
  font-size: 10px;
}

.info-message,
.form-error-message {
  padding: 11px 12px;
  border-radius: 8px;
  display: flex;
  align-items: flex-start;
  gap: 8px;
  font-size: 10px;
}

.info-message {
  border: 1px solid #fed7aa;
  background: #fff7ed;
  color: #c2410c;
}
.select-all-column {
  width: 95px;
}

.select-all-label {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  white-space: nowrap;
}

.select-all-label input {
  width: 15px;
  height: 15px;
  accent-color: #16a34a;
  cursor: pointer;
}
.form-error-message {
  border: 1px solid #fecaca;
  background: #fef2f2;
  color: #dc2626;
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
  display: flex;
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

.save-btn {
  background: #16a34a;
  color: #fff;
}

.delete-confirm-btn {
  background: #dc2626;
  color: #fff;
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
}

.student-delete-details {
  margin-top: 12px;
  padding: 10px;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: 3px;
  background: #f8fafc;
  color: #475569;
  font-size: 10px;
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


.header-actions {
  display: flex;
  gap: 10px;
}

.import-btn {
  min-height: 42px;
  padding: 0 17px;
  border: 1px solid #16a34a;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: #fff;
  color: #15803d;
  font-family: inherit;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
}

.import-btn:hover {
  background: #f0fdf4;
}

.import-modal {
  width: 760px;
}

.import-guide {
  margin-bottom: 18px;
  padding: 16px;
  border: 1px solid #bbf7d0;
  border-radius: 10px;
  background: #f0fdf4;
}

.guide-title {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #166534;
}

.import-guide p {
  margin: 8px 0;
  color: #475569;
  font-size: 11px;
}

.import-guide ul {
  margin: 10px 0 14px 18px;
  padding: 0;
  color: #475569;
  font-size: 10px;
  line-height: 1.7;
}

.column-preview {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.column-preview span {
  padding: 5px 8px;
  border-radius: 6px;
  background: #dcfce7;
  color: #166534;
  font-size: 9px;
  font-weight: 700;
}

.example-table-wrapper {
  width: 100%;
  overflow-x: auto;
}

.example-table {
  width: 100%;
  min-width: 650px;
  border-collapse: collapse;
  background: #fff;
}

.example-table th,
.example-table td {
  padding: 8px;
  border: 1px solid #d1fae5;
  font-size: 9px;
  text-align: left;
}

.example-table th {
  background: #ecfdf5;
  color: #166534;
}

.guide-actions {
  margin-top: 12px;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.guide-btn {
  min-height: 34px;
  padding: 0 11px;
  border: 1px solid #86efac;
  border-radius: 7px;
  display: flex;
  align-items: center;
  gap: 6px;
  background: #fff;
  color: #15803d;
  font-family: inherit;
  font-size: 10px;
  font-weight: 700;
  cursor: pointer;
}

.file-upload-box {
  min-height: 190px;
  padding: 25px;
  border: 2px dashed #86efac;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  text-align: center;
  background: #fafffb;
  color: #64748b;
}

.file-upload-box svg {
  color: #16a34a;
}

.file-upload-box strong {
  color: #0f172a;
}

.file-upload-box input {
  margin-top: 8px;
}

.file-upload-box p {
  margin: 0;
  color: #15803d;
  font-size: 10px;
  font-weight: 700;
}

.import-message {
  margin-top: 14px;
}

.import-result {
  margin-top: 14px;
  padding: 12px;
  border-radius: 9px;
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  background: #f0fdf4;
  color: #166534;
  font-size: 11px;
}

@media(max-width: 768px) {
  .student-page {
    padding: 20px 16px;
  }

  .page-header {
    align-items: stretch;
    flex-direction: column;
  }

  .header-actions {
    width: 100%;
    flex-direction: column;
  }

  .import-btn,
  .add-btn {
    width: 100%;
  }

  .guide-actions {
    flex-direction: column;
  }

  .guide-btn {
    width: 100%;
    justify-content: center;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .bulk-actions {
    align-items: stretch;
    flex-direction: column;
  }

  .bulk-buttons {
    width: 100%;
  }

  .bulk-btn {
    flex: 1;
  }
}

@media(max-width: 480px) {
  .student-page {
    padding: 16px 12px;
  }

  .modal-card,
  .delete-card {
    padding: 22px;
  }

  .modal-actions,
  .bulk-buttons {
    flex-direction: column;
  }
}
</style>
