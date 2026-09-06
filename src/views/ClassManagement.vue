<template>
  <div class="class-page">
    <div class="page-header">
      <div>
        <h1>Class Management</h1>
        <p>Create classes and manage students under each grade and section.</p>
      </div>
      <button
        class="create-class-btn"
        @click="openCreateClassModal"
      >
        <Plus :size="17" />
        <span>Add Class</span>
      </button>
    </div>
    <div class="stats">
      <div class="stat-card">
        <div>
          <span>Total Classes</span>
          <strong>{{ classes.length }}</strong>
        </div>
        <div class="stat-icon">
          <GraduationCap :size="25" />
        </div>
      </div>
      <div class="stat-card">
        <div>
          <span>Total Students</span>
          <strong>{{ totalStudents }}</strong>
        </div>
        <div class="stat-icon">
          <Users :size="25" />
        </div>
      </div>
    </div>
    <!-- SEARCH -->
    <div class="toolbar">
      <div class="search-box">
        <Search :size="18" />
        <input
          v-model="search"
          type="text"
          placeholder="Search grade, section, or student..."
        >
      </div>
    </div>
    <!-- LOADING -->
    <div
      v-if="loading"
      class="state-message"
    >
      Loading classes...
    </div>
    <!-- ERROR -->
    <div
      v-else-if="errorMessage"
      class="error-box"
    >
      {{ errorMessage }}
      <button @click="fetchClasses">
        Try Again
      </button>
    </div>
    <!-- EMPTY -->
    <div
      v-else-if="filteredClasses.length === 0"
      class="empty-state"
    >
      <h3>No classes found</h3>
      <p>Create your first class to start adding students.</p>
    </div>
    <!-- CLASS CARDS -->
    <div
      v-else
      class="class-grid"
    >
      <div
        v-for="schoolClass in filteredClasses"
        :key="schoolClass.id"
        class="class-card"
      >
        <div class="class-card-header">
          <div>
            <span class="grade">
              {{ schoolClass.grade }}
            </span>
            <h2>
              {{ schoolClass.section }}
            </h2>
            <small>
              {{ schoolClass.students.length }} student(s)
            </small>
          </div>
          <div class="class-actions">
            <button
              class="edit-btn"
              title="Edit Class"
              @click="openEditClassModal(schoolClass)"
            >
              <Pencil :size="14" />
              <span>Edit</span>
            </button>
            <button
              class="delete-btn"
              title="Delete Class"
              @click="deleteClass(schoolClass)"
            >
              <Trash2 :size="14" />
              <span>Delete</span>
            </button>
          </div>
        </div>
        <!-- ADD SINGLE STUDENT -->
        <div class="student-add">
          <input
            v-model="newStudentNames[schoolClass.id]"
            type="text"
            placeholder="Enter student name"
            @keyup.enter="addStudent(schoolClass)"
          >
          <button
            @click="addStudent(schoolClass)"
          >
            <UserPlus :size="16" />
            <span>Add</span>
          </button>
        </div>
        <!-- BULK ADD STUDENTS -->
        <div class="bulk-student-add">
          <div class="bulk-header">
            <div>
              <strong class="bulk-title">
                <ClipboardPaste :size="16" />
                <span>Paste Student List</span>
              </strong>
              <small>
                One student name per line
              </small>
            </div>
            <span
              v-if="getBulkStudentCount(schoolClass.id) > 0"
              class="bulk-count"
            >
              {{ getBulkStudentCount(schoolClass.id) }} student(s)
            </span>
          </div>
          <textarea
            v-model="bulkStudentNames[schoolClass.id]"
            placeholder="Paste student names here..."
          ></textarea>
          <button
            class="bulk-add-btn"
            :disabled="
              bulkAddingClassId === schoolClass.id ||
              getBulkStudentCount(schoolClass.id) === 0
            "
            @click="addStudentList(schoolClass)"
          >
            {{
              bulkAddingClassId === schoolClass.id
                ? 'Adding Students...'
                : `Add ${getBulkStudentCount(schoolClass.id)} Students`
            }}
          </button>
        </div>
        <!-- STUDENTS -->
        <div class="student-list">
          <div
            v-if="schoolClass.students.length === 0"
            class="no-students"
          >
            No students added yet.
          </div>
          <div
            v-for="student in schoolClass.students"
            :key="student.id"
            class="student-row"
          >
            <div class="student-info">
              <div class="avatar">
                {{
                  student.student_name
                    .charAt(0)
                    .toUpperCase()
                }}
              </div>
              <span>
                {{ student.student_name }}
              </span>
            </div>
            <div class="student-actions">
              <button
                class="student-edit"
                title="Edit Student"
                @click="
                  openEditStudentModal(
                    schoolClass,
                    student
                  )
                "
              >
                <Pencil :size="13" />
                <span>Edit</span>
              </button>
              <button
                class="student-delete"
                title="Remove Student"
                @click="
                  removeStudent(
                    schoolClass,
                    student
                  )
                "
              >
                <Trash2 :size="13" />
                <span>Remove</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- ==========================================
         CREATE / EDIT CLASS MODAL
    =========================================== -->
    <div
      v-if="showClassModal"
      class="modal-overlay"
      @click.self="closeClassModal"
    >
      <div class="modal">
        <h2>
          {{
            editingClass
              ? 'Edit Class'
              : 'Add Class'
          }}
        </h2>
        <div class="form-group">
          <label>Grade</label>
          <input
            v-model="classForm.grade"
            type="text"
            placeholder="Example: Grade 11"
          >
        </div>
        <div class="form-group">
          <label>Section</label>
          <input
            v-model="classForm.section"
            type="text"
            placeholder="Example: STEM A"
          >
        </div>
        <div
          v-if="modalError"
          class="modal-error"
        >
          {{ modalError }}
        </div>
        <div class="modal-actions">
          <button
            class="cancel-btn"
            :disabled="savingClass"
            @click="closeClassModal"
          >
            Cancel
          </button>
          <button
            class="save-btn"
            :disabled="savingClass"
            @click="saveClass"
          >
            <Save
              v-if="!savingClass"
              :size="16"
            />
            <span>
              {{ savingClass ? 'Saving...' : 'Save' }}
            </span>
          </button>
        </div>
      </div>
    </div>
    <!-- ==========================================
         EDIT STUDENT MODAL
    =========================================== -->
    <div
      v-if="showStudentModal"
      class="modal-overlay"
      @click.self="closeStudentModal"
    >
      <div class="modal">
        <h2>Edit Student</h2>
        <div class="form-group">
          <label>Student Name</label>
          <input
            v-model="studentForm.student_name"
            type="text"
            placeholder="Enter student name"
          >
        </div>
        <div
          v-if="studentModalError"
          class="modal-error"
        >
          {{ studentModalError }}
        </div>
        <div class="modal-actions">
          <button
            class="cancel-btn"
            :disabled="savingStudent"
            @click="closeStudentModal"
          >
            Cancel
          </button>
          <button
            class="save-btn"
            :disabled="savingStudent"
            @click="updateStudent"
          >
            <Save
              v-if="!savingStudent"
              :size="16"
            />
            <span>
              {{ savingStudent ? 'Saving...' : 'Save' }}
            </span>
          </button>
        </div>
      </div>
    </div>
    <!-- ==========================================
         CONFIRMATION DIALOG
    =========================================== -->
    <div
      v-if="showConfirmDialog"
      class="modal-overlay"
      @click.self="closeConfirmDialog"
    >
      <div class="confirm-modal">
        <div
          class="confirm-icon"
          :class="confirmDialog.type"
        >
          <Trash2
            v-if="
              confirmDialog.type === 'delete' ||
              confirmDialog.type === 'remove'
            "
            :size="30"
          />
          <Users
            v-else
            :size="30"
          />
        </div>
        <h2>
          {{ confirmDialog.title }}
        </h2>
        <p>
          {{ confirmDialog.message }}
        </p>
        <div class="confirm-actions">
          <button
            class="confirm-cancel-btn"
            :disabled="confirmationLoading"
            @click="closeConfirmDialog"
          >
            Cancel
          </button>
          <button
            class="confirm-action-btn"
            :class="confirmDialog.type"
            :disabled="confirmationLoading"
            @click="executeConfirmAction"
          >
            <span>
              {{
                confirmationLoading
                  ? 'Processing...'
                  : confirmDialog.confirmText
              }}
            </span>
          </button>
        </div>
      </div>
    </div>
    <!-- ==========================================
         SYSTEM NOTIFICATION
    =========================================== -->
    <Transition name="notification">
      <div
        v-if="notification.show"
        class="notification-container"
        :class="notification.type"
      >
        <div class="notification-icon">
          <CircleCheckBig
            v-if="notification.type === 'success'"
            :size="20"
          />
          <CircleAlert
            v-else-if="notification.type === 'error'"
            :size="20"
          />
          <Info
            v-else
            :size="20"
          />
        </div>
        <div class="notification-content">
          <strong>
            {{ notification.title }}
          </strong>
          <p>
            {{ notification.message }}
          </p>
        </div>
        <button
          type="button"
          class="notification-close"
          @click="closeNotification"
        >
          <X :size="17" />
        </button>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import {
  computed,
  onMounted,
  reactive,
  ref
} from 'vue'
import api from '../services/api'
import {
  Plus,
  Pencil,
  Trash2,
  UserPlus,
  Users,
  GraduationCap,
  Search,
  ClipboardPaste,
  Save,
  X,
  CircleCheckBig,
  CircleAlert,
  Info
} from '@lucide/vue'

interface ClassStudent {
  id: number
  class_id: number
  student_name: string
  created_at?: string
  updated_at?: string
}

interface SchoolClass {
  id: number
  faculty_id: number
  grade: string
  section: string
  students: ClassStudent[]
  created_at?: string
  updated_at?: string
}

type NotificationType =
  'success' |
  'error' |
  'info'

type ConfirmType =
  'delete' |
  'remove' |
  'add'

type ConfirmAction =
  'delete-class' |
  'remove-student' |
  'bulk-add' |
  null

const classes =
  ref<SchoolClass[]>([])

const loading =
  ref(false)

const errorMessage =
  ref('')

const search =
  ref('')

const newStudentNames =
  reactive<Record<number, string>>({})

const bulkStudentNames =
  reactive<Record<number, string>>({})

const bulkAddingClassId =
  ref<number | null>(null)

// ==========================================
// NOTIFICATION
// ==========================================

const notification =
  ref({
    show: false,
    type:
      'success' as NotificationType,
    title: '',
    message: ''
  })

let notificationTimer:
  ReturnType<typeof setTimeout> |
  null =
  null

function showNotification(
  type: NotificationType,
  title: string,
  message: string
) {
  if (notificationTimer) {
    clearTimeout(
      notificationTimer
    )
  }

  notification.value = {
    show: true,
    type,
    title,
    message
  }

  notificationTimer =
    setTimeout(() => {
      notification.value.show =
        false
    }, 4000)
}

function closeNotification() {
  notification.value.show =
    false

  if (notificationTimer) {
    clearTimeout(
      notificationTimer
    )

    notificationTimer =
      null
  }
}

// ==========================================
// CONFIRMATION DIALOG
// ==========================================

const showConfirmDialog =
  ref(false)

const confirmationLoading =
  ref(false)

const pendingConfirmAction =
  ref<ConfirmAction>(null)

const pendingClass =
  ref<SchoolClass | null>(null)

const pendingStudent =
  ref<ClassStudent | null>(null)

const pendingBulkNames =
  ref<string[]>([])

const pendingDuplicateCount =
  ref(0)

const confirmDialog =
  reactive({
    type:
      'delete' as ConfirmType,
    title: '',
    message: '',
    confirmText: ''
  })

function closeConfirmDialog() {
  if (
    confirmationLoading.value
  ) {
    return
  }

  showConfirmDialog.value =
    false

  pendingConfirmAction.value =
    null

  pendingClass.value =
    null

  pendingStudent.value =
    null

  pendingBulkNames.value =
    []

  pendingDuplicateCount.value =
    0
}

async function executeConfirmAction() {
  if (
    confirmationLoading.value
  ) {
    return
  }

  if (
    pendingConfirmAction.value ===
    'delete-class'
  ) {
    await confirmDeleteClass()
    return
  }

  if (
    pendingConfirmAction.value ===
    'remove-student'
  ) {
    await confirmRemoveStudent()
    return
  }

  if (
    pendingConfirmAction.value ===
    'bulk-add'
  ) {
    await confirmBulkAdd()
  }
}

// ==========================================
// CLASS MODAL
// ==========================================

const showClassModal =
  ref(false)

const editingClass =
  ref<SchoolClass | null>(null)

const savingClass =
  ref(false)

const modalError =
  ref('')

const classForm =
  reactive({
    grade: '',
    section: ''
  })

// ==========================================
// STUDENT MODAL
// ==========================================

const showStudentModal =
  ref(false)

const selectedClass =
  ref<SchoolClass | null>(null)

const selectedStudent =
  ref<ClassStudent | null>(null)

const savingStudent =
  ref(false)

const studentModalError =
  ref('')

const studentForm =
  reactive({
    student_name: ''
  })

// ==========================================
// TOTAL STUDENTS
// ==========================================

const totalStudents =
  computed(() => {
    return classes.value.reduce(
      (
        total,
        schoolClass
      ) =>
        total +
        schoolClass.students.length,
      0
    )
  })

// ==========================================
// FILTER
// ==========================================

const filteredClasses =
  computed(() => {
    const keyword =
      search.value
        .trim()
        .toLowerCase()

    if (!keyword) {
      return classes.value
    }

    return classes.value.filter(
      schoolClass => {
        const classMatch =
          schoolClass.grade
            .toLowerCase()
            .includes(keyword)
          ||
          schoolClass.section
            .toLowerCase()
            .includes(keyword)

        const studentMatch =
          schoolClass.students.some(
            student =>
              student.student_name
                .toLowerCase()
                .includes(keyword)
          )

        return (
          classMatch ||
          studentMatch
        )
      }
    )
  })

// ==========================================
// FETCH CLASSES
// ==========================================

async function fetchClasses() {
  loading.value =
    true

  errorMessage.value =
    ''

  try {
    const response =
      await api.get(
        '/faculty/classes'
      )

    classes.value =
      Array.isArray(
        response.data?.data
      )
        ? response.data.data
        : []

    classes.value.forEach(
      schoolClass => {
        if (
          !Array.isArray(
            schoolClass.students
          )
        ) {
          schoolClass.students =
            []
        }

        schoolClass.students.sort(
          (a, b) =>
            a.student_name.localeCompare(
              b.student_name,
              undefined,
              {
                sensitivity:
                  'base'
              }
            )
        )
      }
    )
  }
  catch (error: any) {
    console.error(
      'CLASS MANAGEMENT ERROR:',
      error
    )

    errorMessage.value =
      error.response
        ?.data
        ?.message
      ||
      'Failed to load classes.'
  }
  finally {
    loading.value =
      false
  }
}

// ==========================================
// CREATE CLASS
// ==========================================

function openCreateClassModal() {
  editingClass.value =
    null

  classForm.grade =
    ''

  classForm.section =
    ''

  modalError.value =
    ''

  showClassModal.value =
    true
}

// ==========================================
// EDIT CLASS
// ==========================================

function openEditClassModal(
  schoolClass: SchoolClass
) {
  editingClass.value =
    schoolClass

  classForm.grade =
    schoolClass.grade

  classForm.section =
    schoolClass.section

  modalError.value =
    ''

  showClassModal.value =
    true
}

// ==========================================
// CLOSE CLASS MODAL
// ==========================================

function closeClassModal() {
  if (
    savingClass.value
  ) {
    return
  }

  showClassModal.value =
    false

  editingClass.value =
    null

  modalError.value =
    ''
}

// ==========================================
// SAVE CLASS
// ==========================================

async function saveClass() {
  modalError.value =
    ''

  const grade =
    classForm.grade.trim()

  const section =
    classForm.section.trim()

  if (!grade) {
    modalError.value =
      'Please enter grade.'
    return
  }

  if (!section) {
    modalError.value =
      'Please enter section.'
    return
  }

  savingClass.value =
    true

  const isEditing =
    !!editingClass.value

  try {
    const payload = {
      grade,
      section
    }

    if (
      editingClass.value
    ) {
      await api.put(
        `/faculty/classes/${editingClass.value.id}`,
        payload
      )
    }
    else {
      await api.post(
        '/faculty/classes',
        payload
      )
    }

    showClassModal.value =
      false

    editingClass.value =
      null

    await fetchClasses()

    showNotification(
      'success',
      isEditing
        ? 'Class Updated'
        : 'Class Created',
      isEditing
        ? 'The class was updated successfully.'
        : 'The class was created successfully.'
    )
  }
  catch (error: any) {
    console.error(
      'SAVE CLASS ERROR:',
      error
    )

    modalError.value =
      error.response
        ?.data
        ?.message
      ||
      'Failed to save class.'
  }
  finally {
    savingClass.value =
      false
  }
}

// ==========================================
// DELETE CLASS
// ==========================================

function deleteClass(
  schoolClass: SchoolClass
) {
  pendingClass.value =
    schoolClass

  pendingConfirmAction.value =
    'delete-class'

  confirmDialog.type =
    'delete'

  confirmDialog.title =
    'Delete Class?'

  confirmDialog.message =
    `Are you sure you want to delete ${schoolClass.grade} - ${schoolClass.section}? All students inside this class will also be removed.`

  confirmDialog.confirmText =
    'Delete Class'

  showConfirmDialog.value =
    true
}

async function confirmDeleteClass() {
  if (
    !pendingClass.value
  ) {
    return
  }

  confirmationLoading.value =
    true

  const schoolClass =
    pendingClass.value

  try {
    await api.delete(
      `/faculty/classes/${schoolClass.id}`
    )

    showConfirmDialog.value =
      false

    pendingClass.value =
      null

    pendingConfirmAction.value =
      null

    await fetchClasses()

    showNotification(
      'success',
      'Class Deleted',
      `${schoolClass.grade} - ${schoolClass.section} was deleted successfully.`
    )
  }
  catch (error: any) {
    console.error(
      'DELETE CLASS ERROR:',
      error
    )

    showConfirmDialog.value =
      false

    showNotification(
      'error',
      'Delete Failed',
      error.response
        ?.data
        ?.message
      ||
      'Failed to delete class.'
    )
  }
  finally {
    confirmationLoading.value =
      false
  }
}

// ==========================================
// BULK STUDENT COUNT
// ==========================================

function getBulkStudentCount(
  classId: number
): number {
  const text =
    bulkStudentNames[classId] ||
    ''

  return new Set(
    text
      .split(/\r?\n/)
      .map(
        name =>
          name.trim()
      )
      .filter(Boolean)
  ).size
}

// ==========================================
// BULK ADD STUDENTS
// ==========================================

async function addStudentList(
  schoolClass: SchoolClass
) {
  const rawText =
    bulkStudentNames[
      schoolClass.id
    ] || ''

  const pastedNames =
    rawText
      .split(/\r?\n/)
      .map(
        name =>
          name.trim()
      )
      .filter(Boolean)

  const uniqueNames =
    [
      ...new Set(
        pastedNames
      )
    ]

  if (
    uniqueNames.length ===
    0
  ) {
    showNotification(
      'error',
      'Student List Required',
      'Please paste at least one student name.'
    )
    return
  }

  const existingNames =
    new Set(
      schoolClass.students.map(
        student =>
          student.student_name
            .trim()
            .toLowerCase()
      )
    )

  const namesToAdd =
    uniqueNames.filter(
      name =>
        !existingNames.has(
          name.toLowerCase()
        )
    )

  const duplicateCount =
    uniqueNames.length -
    namesToAdd.length

  if (
    namesToAdd.length ===
    0
  ) {
    showNotification(
      'info',
      'Students Already Added',
      'All pasted students are already in this class.'
    )
    return
  }

  pendingClass.value =
    schoolClass

  pendingBulkNames.value =
    namesToAdd

  pendingDuplicateCount.value =
    duplicateCount

  pendingConfirmAction.value =
    'bulk-add'

  confirmDialog.type =
    'add'

  confirmDialog.title =
    'Add Students?'

  confirmDialog.message =
    `Add ${namesToAdd.length} student(s) to ${schoolClass.grade} - ${schoolClass.section}?`

  confirmDialog.confirmText =
    `Add ${namesToAdd.length} Students`

  showConfirmDialog.value =
    true
}

async function confirmBulkAdd() {
  if (
    !pendingClass.value ||
    pendingBulkNames.value.length ===
    0
  ) {
    return
  }

  confirmationLoading.value =
    true

  const schoolClass =
    pendingClass.value

  const namesToAdd =
    [...pendingBulkNames.value]

  const duplicateCount =
    pendingDuplicateCount.value

  bulkAddingClassId.value =
    schoolClass.id

  let addedCount =
    0

  let failedCount =
    0

  try {
    for (
      const studentName
      of namesToAdd
    ) {
      try {
        await api.post(
          `/faculty/classes/${schoolClass.id}/students`,
          {
            student_name:
              studentName
          }
        )

        addedCount++
      }
      catch (error) {
        failedCount++

        console.error(
          `Failed to add ${studentName}:`,
          error
        )
      }
    }

    bulkStudentNames[
      schoolClass.id
    ] = ''

    await fetchClasses()

    showConfirmDialog.value =
      false

    pendingConfirmAction.value =
      null

    pendingClass.value =
      null

    pendingBulkNames.value =
      []

    pendingDuplicateCount.value =
      0

    let message =
      `${addedCount} student(s) added successfully.`

    if (
      duplicateCount >
      0
    ) {
      message +=
        ` ${duplicateCount} duplicate student(s) skipped.`
    }

    if (
      failedCount >
      0
    ) {
      message +=
        ` ${failedCount} student(s) failed to add.`
    }

    showNotification(
      failedCount > 0
        ? 'info'
        : 'success',
      failedCount > 0
        ? 'Students Added with Warnings'
        : 'Students Added',
      message
    )
  }
  catch (error: any) {
    console.error(
      'BULK ADD STUDENTS ERROR:',
      error
    )

    showNotification(
      'error',
      'Unable to Add Students',
      'An error occurred while adding the students.'
    )
  }
  finally {
    bulkAddingClassId.value =
      null

    confirmationLoading.value =
      false
  }
}

// ==========================================
// ADD SINGLE STUDENT
// ==========================================

async function addStudent(
  schoolClass: SchoolClass
) {
  const studentName =
    (
      newStudentNames[
        schoolClass.id
      ] || ''
    ).trim()

  if (!studentName) {
    showNotification(
      'error',
      'Student Name Required',
      'Please enter student name.'
    )
    return
  }

  try {
    await api.post(
      `/faculty/classes/${schoolClass.id}/students`,
      {
        student_name:
          studentName
      }
    )

    newStudentNames[
      schoolClass.id
    ] = ''

    await fetchClasses()

    showNotification(
      'success',
      'Student Added',
      `${studentName} was added successfully.`
    )
  }
  catch (error: any) {
    console.error(
      'ADD STUDENT ERROR:',
      error
    )

    showNotification(
      'error',
      'Unable to Add Student',
      error.response
        ?.data
        ?.message
      ||
      'Failed to add student.'
    )
  }
}

// ==========================================
// EDIT STUDENT
// ==========================================

function openEditStudentModal(
  schoolClass: SchoolClass,
  student: ClassStudent
) {
  selectedClass.value =
    schoolClass

  selectedStudent.value =
    student

  studentForm.student_name =
    student.student_name

  studentModalError.value =
    ''

  showStudentModal.value =
    true
}

// ==========================================
// CLOSE STUDENT MODAL
// ==========================================

function closeStudentModal() {
  if (
    savingStudent.value
  ) {
    return
  }

  showStudentModal.value =
    false

  selectedClass.value =
    null

  selectedStudent.value =
    null

  studentForm.student_name =
    ''

  studentModalError.value =
    ''
}

// ==========================================
// UPDATE STUDENT
// ==========================================

async function updateStudent() {
  if (
    !selectedClass.value ||
    !selectedStudent.value
  ) {
    return
  }

  const studentName =
    studentForm.student_name.trim()

  if (!studentName) {
    studentModalError.value =
      'Please enter student name.'
    return
  }

  const oldName =
    selectedStudent.value.student_name

  savingStudent.value =
    true

  studentModalError.value =
    ''

  try {
    await api.put(
      `/faculty/classes/${selectedClass.value.id}/students/${selectedStudent.value.id}`,
      {
        student_name:
          studentName
      }
    )

    showStudentModal.value =
      false

    selectedClass.value =
      null

    selectedStudent.value =
      null

    await fetchClasses()

    showNotification(
      'success',
      'Student Updated',
      `${oldName} was updated successfully.`
    )
  }
  catch (error: any) {
    console.error(
      'UPDATE STUDENT ERROR:',
      error
    )

    studentModalError.value =
      error.response
        ?.data
        ?.message
      ||
      'Failed to update student.'
  }
  finally {
    savingStudent.value =
      false
  }
}

// ==========================================
// REMOVE STUDENT
// ==========================================

function removeStudent(
  schoolClass: SchoolClass,
  student: ClassStudent
) {
  pendingClass.value =
    schoolClass

  pendingStudent.value =
    student

  pendingConfirmAction.value =
    'remove-student'

  confirmDialog.type =
    'remove'

  confirmDialog.title =
    'Remove Student?'

  confirmDialog.message =
    `Are you sure you want to remove ${student.student_name} from ${schoolClass.grade} - ${schoolClass.section}?`

  confirmDialog.confirmText =
    'Remove Student'

  showConfirmDialog.value =
    true
}

async function confirmRemoveStudent() {
  if (
    !pendingClass.value ||
    !pendingStudent.value
  ) {
    return
  }

  confirmationLoading.value =
    true

  const schoolClass =
    pendingClass.value

  const student =
    pendingStudent.value

  try {
    await api.delete(
      `/faculty/classes/${schoolClass.id}/students/${student.id}`
    )

    showConfirmDialog.value =
      false

    pendingConfirmAction.value =
      null

    pendingClass.value =
      null

    pendingStudent.value =
      null

    await fetchClasses()

    showNotification(
      'success',
      'Student Removed',
      `${student.student_name} was removed successfully.`
    )
  }
  catch (error: any) {
    console.error(
      'REMOVE STUDENT ERROR:',
      error
    )

    showConfirmDialog.value =
      false

    showNotification(
      'error',
      'Remove Failed',
      error.response
        ?.data
        ?.message
      ||
      'Failed to remove student.'
    )
  }
  finally {
    confirmationLoading.value =
      false
  }
}

// ==========================================
// MOUNT
// ==========================================

onMounted(() => {
  fetchClasses()
})
</script>

<style scoped>
* {
  box-sizing: border-box;
}

.class-page {
  min-height: 100vh;
  padding: 32px 40px;
  background: #f8fafc;
  font-family: 'Inter', 'Poppins', sans-serif;
  color: #0f172a;
  -webkit-font-smoothing: antialiased;
}

/* HEADER */

.page-header {
  margin-bottom: 28px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 15px;
}

.page-header h1 {
  margin: 0;
  font-size: 26px;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.page-header p {
  margin-top: 5px;
  color: #64748b;
  font-size: 13px;
}

.create-class-btn {
  border: none;
  padding: 12px 20px;
  border-radius: 8px;
  background: #00c853;
  color: white;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: background .15s ease;
}

.create-class-btn:hover {
  background: #00a844;
}

/* STATS */

.stats {
  margin-bottom: 24px;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 14px;
}

.stat-card {
  padding: 20px 22px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  box-shadow: 0 1px 2px rgba(15,23,42,.03);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.stat-card span {
  color: #64748b;
  font-size: 12px;
  font-weight: 500;
}

.stat-card strong {
  display: block;
  margin-top: 8px;
  color: #0f172a;
  font-size: 26px;
  font-weight: 700;
  letter-spacing: -0.01em;
}

.stat-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  background: #e3f9e9;
  color: #00a844;
}

/* TOOLBAR */

.toolbar {
  margin-bottom: 22px;
}

.search-box {
  position: relative;
  width: 100%;
  max-width: 430px;
}

.search-box svg {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: #94a3b8;
  pointer-events: none;
}

.toolbar input {
  width: 100%;
  max-width: 430px;
  height: 42px;
  padding: 0 14px 0 42px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #f8fafc;
  outline: none;
  font-size: 13px;
  transition: border-color .15s ease, background .15s ease;
}

.toolbar input:focus {
  background: white;
  border-color: #00c853;
}

/* CLASS GRID */

.class-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0,1fr));
  gap: 16px;
}

.class-card {
  padding: 22px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 14px;
  transition: border-color .15s ease, box-shadow .15s ease;
}

.class-card:hover {
  border-color: #cbd5e1;
  box-shadow: 0 4px 14px rgba(15,23,42,.06);
}

.class-card-header {
  margin-bottom: 18px;
  display: flex;
  justify-content: space-between;
  gap: 15px;
}

.grade {
  color: #00a844;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: .03em;
}

.class-card h2 {
  margin: 4px 0 5px;
  font-size: 19px;
  font-weight: 700;
}

.class-card small {
  color: #94a3b8;
  font-size: 11px;
}

.class-actions {
  display: flex;
  gap: 8px;
}

.edit-btn,
.delete-btn {
  border: 1px solid #e2e8f0;
  padding: 7px 12px;
  border-radius: 6px;
  background: white;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  transition: background .15s ease, border-color .15s ease;
}

.edit-btn {
  color: #334155;
}

.edit-btn:hover {
  background: #f8fafc;
  border-color: #cbd5e1;
}

.delete-btn {
  color: #b91c1c;
  border-color: #fecaca;
}

.delete-btn:hover {
  background: #fef2f2;
}

/* ADD STUDENT */

.student-add {
  margin-bottom: 15px;
  display: flex;
  gap: 8px;
}

.student-add input {
  flex: 1;
  min-width: 0;
  height: 40px;
  padding: 0 12px;
  border: 1px solid #e2e8f0;
  border-radius: 7px;
  outline: none;
  font-size: 13px;
  transition: border-color .15s ease;
}

.student-add input:focus {
  border-color: #00c853;
}

.student-add button {
  border: none;
  padding: 0 18px;
  border-radius: 7px;
  background: #00c853;
  color: white;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: background .15s ease;
}

.student-add button:hover {
  background: #00a844;
}

/* BULK ADD STUDENTS */

.bulk-student-add {
  margin-bottom: 18px;
  padding: 16px;
  border: 1px dashed #a7e8bc;
  border-radius: 10px;
  background: #f2fbf5;
}

.bulk-header {
  margin-bottom: 10px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 10px;
}

.bulk-header strong {
  display: block;
  color: #0f172a;
  font-size: 12px;
  font-weight: 700;
}

.bulk-header small {
  display: block;
  margin-top: 3px;
  color: #64748b;
  font-size: 10px;
}

.bulk-count {
  padding: 4px 10px;
  border-radius: 999px;
  background: #e3f9e9;
  color: #00a844;
  font-size: 10px;
  font-weight: 700;
}

.bulk-title {
  display: flex !important;
  align-items: center;
  gap: 7px;
}

.bulk-title svg {
  color: #00a844;
}

.bulk-student-add textarea {
  width: 100%;
  min-height: 125px;
  padding: 12px;
  border: 1px solid #cdefd9;
  border-radius: 8px;
  background: white;
  outline: none;
  resize: vertical;
  font-family: 'Inter', 'Poppins', sans-serif;
  font-size: 12px;
  line-height: 1.6;
  transition: border-color .15s ease;
}

.bulk-student-add textarea:focus {
  border-color: #00c853;
}

.bulk-add-btn {
  width: 100%;
  margin-top: 10px;
  padding: 11px 14px;
  border: none;
  border-radius: 7px;
  background: #0f172a;
  color: white;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: background .15s ease;
}

.bulk-add-btn:hover:not(:disabled) {
  background: #1e293b;
}

.bulk-add-btn:disabled {
  opacity: .55;
  cursor: not-allowed;
}

/* STUDENTS */

.student-list {
  max-height: 310px;
  overflow-y: auto;
}

.student-row {
  padding: 11px 4px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  border-bottom: 1px solid #f1f5f9;
}

.student-info {
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 10px;
}

.avatar {
  width: 33px;
  height: 33px;
  min-width: 33px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: #e3f9e9;
  color: #00a844;
  font-size: 12px;
  font-weight: 700;
}

.student-info span {
  overflow: hidden;
  color: #334155;
  font-size: 13px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.student-actions {
  display: flex;
  gap: 6px;
}

.student-edit,
.student-delete {
  border: 1px solid #e2e8f0;
  padding: 5px 10px;
  border-radius: 5px;
  background: white;
  font-size: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: background .15s ease;
}

.student-edit {
  color: #475569;
}

.student-edit:hover {
  background: #f8fafc;
}

.student-delete {
  color: #b91c1c;
  border-color: #fecaca;
}

.student-delete:hover {
  background: #fef2f2;
}

.no-students {
  padding: 22px;
  color: #94a3b8;
  font-size: 12px;
  text-align: center;
}

/* STATES */

.state-message,
.empty-state {
  padding: 56px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  color: #64748b;
  text-align: center;
}

.empty-state h3 {
  margin-bottom: 6px;
  color: #0f172a;
  font-size: 16px;
  font-weight: 700;
}

.empty-state p {
  font-size: 13px;
}

.error-box {
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 9px;
  color: #b91c1c;
  font-size: 12px;
}

.error-box button {
  border: none;
  padding: 8px 12px;
  border-radius: 6px;
  background: #b91c1c;
  color: white;
  font-weight: 600;
  cursor: pointer;
}

/* MODAL */

.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  padding: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(15,23,42,.5);
  backdrop-filter: blur(4px);
}

.modal {
  width: 430px;
  max-width: 100%;
  padding: 28px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 50px rgba(15,23,42,.2);
}

.modal h2 {
  margin: 0 0 20px;
  font-size: 19px;
  font-weight: 700;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 6px;
  color: #475569;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: .03em;
}

.form-group input {
  width: 100%;
  height: 42px;
  padding: 0 12px;
  border: 1px solid #e2e8f0;
  border-radius: 7px;
  outline: none;
  font-size: 13px;
  transition: border-color .15s ease;
}

.form-group input:focus {
  border-color: #00c853;
}

.modal-error {
  margin-bottom: 16px;
  padding: 11px;
  background: #fef2f2;
  border-radius: 6px;
  color: #b91c1c;
  font-size: 12px;
}

.modal-actions {
  margin-top: 22px;
  display: flex;
  gap: 10px;
}

.cancel-btn,
.save-btn {
  flex: 1;
  border: none;
  height: 44px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
}

.cancel-btn {
  background: #f1f5f9;
  color: #475569;
}

.cancel-btn:hover:not(:disabled) {
  background: #e2e8f0;
}

.save-btn {
  background: #00c853;
  color: white;
}

.save-btn:hover:not(:disabled) {
  background: #00a844;
}

.cancel-btn:disabled,
.save-btn:disabled {
  opacity: .6;
  cursor: not-allowed;
}

/* CONFIRMATION DIALOG */

.confirm-modal {
  width: 440px;
  max-width: 100%;
  padding: 30px;
  background: white;
  border-radius: 16px;
  text-align: center;
  box-shadow: 0 20px 50px rgba(15,23,42,.2);
}

.confirm-icon {
  width: 68px;
  height: 68px;
  margin: 0 auto 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.confirm-icon.delete,
.confirm-icon.remove {
  background: #fee2e2;
  color: #dc2626;
}

.confirm-icon.add {
  background: #dcfce7;
  color: #16a34a;
}

.confirm-modal h2 {
  margin: 0 0 12px;
  color: #0f172a;
  font-size: 20px;
  font-weight: 700;
}

.confirm-modal p {
  margin: 0;
  color: #64748b;
  font-size: 13px;
  line-height: 1.6;
}

.confirm-actions {
  margin-top: 25px;
  display: flex;
  gap: 10px;
}

.confirm-cancel-btn,
.confirm-action-btn {
  flex: 1;
  min-height: 44px;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}

.confirm-cancel-btn {
  background: #f1f5f9;
  color: #475569;
}

.confirm-cancel-btn:hover:not(:disabled) {
  background: #e2e8f0;
}

.confirm-action-btn.delete,
.confirm-action-btn.remove {
  background: #dc2626;
  color: #ffffff !important;
}

.confirm-action-btn.delete span,
.confirm-action-btn.remove span {
  color: #ffffff !important;
}

.confirm-action-btn.delete:hover:not(:disabled),
.confirm-action-btn.remove:hover:not(:disabled) {
  background: #b91c1c;
  color: #ffffff !important;
}

.confirm-action-btn.add {
  background: #16a34a;
  color: #ffffff !important;
}

.confirm-action-btn.add:hover:not(:disabled) {
  background: #15803d;
}

.confirm-cancel-btn:disabled,
.confirm-action-btn:disabled {
  opacity: .6;
  cursor: not-allowed;
}

/* SYSTEM NOTIFICATION */

.notification-container {
  position: fixed;
  top: 25px;
  right: 25px;
  z-index: 10000;
  width: 390px;
  max-width: calc(100vw - 40px);
  padding: 16px 45px 16px 16px;
  display: flex;
  align-items: flex-start;
  gap: 14px;
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  background: white;
  box-shadow: 0 15px 35px rgba(0,0,0,.15);
}

.notification-icon {
  width: 38px;
  height: 38px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.notification-content {
  flex: 1;
}

.notification-content strong {
  display: block;
  margin-bottom: 3px;
  color: #1e293b;
  font-size: 14px;
}

.notification-content p {
  margin: 0;
  color: #64748b;
  font-size: 13px;
  line-height: 1.5;
}

.notification-container.success {
  border-left: 5px solid #16a34a;
}

.notification-container.success .notification-icon {
  background: #dcfce7;
  color: #16a34a;
}

.notification-container.error {
  border-left: 5px solid #dc2626;
}

.notification-container.error .notification-icon {
  background: #fee2e2;
  color: #dc2626;
}

.notification-container.info {
  border-left: 5px solid #2563eb;
}

.notification-container.info .notification-icon {
  background: #dbeafe;
  color: #2563eb;
}

.notification-close {
  position: absolute;
  top: 10px;
  right: 12px;
  border: none;
  background: transparent;
  color: #94a3b8;
  cursor: pointer;
}

.notification-close:hover {
  color: #334155;
}

.notification-enter-active,
.notification-leave-active {
  transition:
    opacity .25s ease,
    transform .25s ease;
}

.notification-enter-from,
.notification-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

/* LUCIDE ICON ALIGNMENT */

.create-class-btn,
.edit-btn,
.delete-btn,
.student-edit,
.student-delete,
.student-add button,
.save-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
}

/* RESPONSIVE */

@media(max-width: 900px) {
  .class-grid {
    grid-template-columns: 1fr;
  }
}

@media(max-width: 600px) {
  .class-page {
    padding: 18px;
  }

  .page-header {
    align-items: flex-start;
    flex-direction: column;
  }

  .create-class-btn {
    width: 100%;
  }

  .stats {
    grid-template-columns: 1fr;
  }

  .student-row {
    align-items: flex-start;
  }

  .student-actions {
    flex-direction: column;
  }

  .confirm-actions {
    flex-direction: column;
  }

  .notification-container {
    top: 15px;
    right: 15px;
    left: 15px;
    width: auto;
    max-width: none;
  }
}
</style>
