<template>
  <div class="class-page">

    <div class="page-header">
      <div>
        <h1>Class Management</h1>
        <p>
          Create classes and manage students under each grade and section.
        </p>
      </div>

      <button
        class="create-class-btn"
        @click="openCreateClassModal"
      >
        + Add Class
      </button>
    </div>


    <!-- SUMMARY -->
    <div class="stats">

      <div class="stat-card">
        <span>Total Classes</span>
        <strong>{{ classes.length }}</strong>
      </div>

      <div class="stat-card">
        <span>Total Students</span>
        <strong>{{ totalStudents }}</strong>
      </div>

    </div>


    <!-- SEARCH -->
    <div class="toolbar">

      <input
        v-model="search"
        type="text"
        placeholder="Search grade, section, or student..."
      >

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

      <p>
        Create your first class to start adding students.
      </p>
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
              {{ schoolClass.students.length }}
              student(s)
            </small>
          </div>


          <div class="class-actions">

            <button
              class="edit-btn"
              @click="openEditClassModal(schoolClass)"
            >
              Edit
            </button>

            <button
              class="delete-btn"
              @click="deleteClass(schoolClass)"
            >
              Delete
            </button>

          </div>

        </div>


        <!-- ADD STUDENT -->
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
            Add
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
                @click="
                  openEditStudentModal(
                    schoolClass,
                    student
                  )
                "
              >
                Edit
              </button>

              <button
                class="student-delete"
                @click="
                  removeStudent(
                    schoolClass,
                    student
                  )
                "
              >
                Remove
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

          <label>
            Grade
          </label>

          <input
            v-model="classForm.grade"
            type="text"
            placeholder="Example: Grade 11"
          >

        </div>


        <div class="form-group">

          <label>
            Section
          </label>

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
            {{
              savingClass
                ? 'Saving...'
                : 'Save'
            }}
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

        <h2>
          Edit Student
        </h2>


        <div class="form-group">

          <label>
            Student Name
          </label>

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
            {{
              savingStudent
                ? 'Saving...'
                : 'Save'
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
  onMounted,
  reactive,
  ref
} from 'vue'

import api from '../services/api'


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

  loading.value = true

  errorMessage.value = ''


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
          schoolClass.students = []
        }

        schoolClass.students.sort(
          (a, b) =>
            a.student_name.localeCompare(
              b.student_name,
              undefined,
              {
                sensitivity: 'base'
              }
            )
        )

      }
    )


  } catch (error: any) {

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

  } finally {

    loading.value = false

  }

}


// ==========================================
// CREATE CLASS
// ==========================================

function openCreateClassModal() {

  editingClass.value = null

  classForm.grade = ''
  classForm.section = ''

  modalError.value = ''

  showClassModal.value = true

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


  modalError.value = ''

  showClassModal.value = true

}


// ==========================================
// CLOSE CLASS MODAL
// ==========================================

function closeClassModal() {

  if (savingClass.value) {
    return
  }


  showClassModal.value = false

  editingClass.value = null

  modalError.value = ''

}


// ==========================================
// SAVE CLASS
// ==========================================

async function saveClass() {

  modalError.value = ''


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


  savingClass.value = true


  try {

    const payload = {
      grade,
      section
    }


    if (editingClass.value) {

      await api.put(
        `/faculty/classes/${editingClass.value.id}`,
        payload
      )

    } else {

      await api.post(
        '/faculty/classes',
        payload
      )

    }


    showClassModal.value = false

    editingClass.value = null


    await fetchClasses()


  } catch (error: any) {

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

  } finally {

    savingClass.value = false

  }

}


// ==========================================
// DELETE CLASS
// ==========================================

async function deleteClass(
  schoolClass: SchoolClass
) {

  const confirmed =
    window.confirm(
      `Delete ${schoolClass.grade} - ${schoolClass.section}?\n\nAll students inside this class will also be removed.`
    )


  if (!confirmed) {
    return
  }


  try {

    await api.delete(
      `/faculty/classes/${schoolClass.id}`
    )


    await fetchClasses()


  } catch (error: any) {

    console.error(
      'DELETE CLASS ERROR:',
      error
    )


    alert(
      error.response
        ?.data
        ?.message
      ||
      'Failed to delete class.'
    )

  }

}


// ==========================================
// ADD STUDENT
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

    alert(
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


  } catch (error: any) {

    console.error(
      'ADD STUDENT ERROR:',
      error
    )


    alert(
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


  studentModalError.value = ''

  showStudentModal.value = true

}


// ==========================================
// CLOSE STUDENT MODAL
// ==========================================

function closeStudentModal() {

  if (savingStudent.value) {
    return
  }


  showStudentModal.value = false

  selectedClass.value = null

  selectedStudent.value = null

  studentForm.student_name = ''

  studentModalError.value = ''

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


  savingStudent.value = true

  studentModalError.value = ''


  try {

    await api.put(
      `/faculty/classes/${selectedClass.value.id}/students/${selectedStudent.value.id}`,
      {
        student_name:
          studentName
      }
    )


    showStudentModal.value = false

    await fetchClasses()


  } catch (error: any) {

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

  } finally {

    savingStudent.value = false

  }

}


// ==========================================
// REMOVE STUDENT
// ==========================================

async function removeStudent(
  schoolClass: SchoolClass,
  student: ClassStudent
) {

  const confirmed =
    window.confirm(
      `Remove ${student.student_name} from ${schoolClass.grade} - ${schoolClass.section}?`
    )


  if (!confirmed) {
    return
  }


  try {

    await api.delete(
      `/faculty/classes/${schoolClass.id}/students/${student.id}`
    )


    await fetchClasses()


  } catch (error: any) {

    console.error(
      'REMOVE STUDENT ERROR:',
      error
    )


    alert(
      error.response
        ?.data
        ?.message
      ||
      'Failed to remove student.'
    )

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

  padding: 28px;

  background: #f4fbf6;

  font-family:
    'Poppins',
    sans-serif;

  color: #0f172a;
}


/* HEADER */

.page-header {
  margin-bottom: 22px;

  display: flex;

  justify-content:
    space-between;

  align-items: center;

  gap: 15px;
}


.page-header h1 {
  margin: 0;

  font-size: 28px;

  font-weight: 800;
}


.page-header p {
  margin-top: 6px;

  color: #64748b;

  font-size: 13px;
}


.create-class-btn {
  border: none;

  padding:
    11px 17px;

  border-radius: 8px;

  background: #16a34a;

  color: white;

  font-size: 12px;

  font-weight: 700;

  cursor: pointer;
}


/* STATS */

.stats {
  margin-bottom: 20px;

  display: grid;

  grid-template-columns:
    repeat(2, 1fr);

  gap: 15px;
}


.stat-card {
  padding: 18px;

  background: white;

  border:
    1px solid #bbf7d0;

  border-radius: 12px;
}


.stat-card span {
  color: #64748b;

  font-size: 12px;
}


.stat-card strong {
  display: block;

  margin-top: 7px;

  color: #15803d;

  font-size: 26px;
}


/* TOOLBAR */

.toolbar {
  margin-bottom: 20px;
}


.toolbar input {
  width: 100%;

  max-width: 430px;

  height: 44px;

  padding:
    0 13px;

  border:
    1px solid #cbd5e1;

  border-radius: 8px;

  background: white;

  outline: none;
}


.toolbar input:focus {
  border-color: #16a34a;

  box-shadow:
    0 0 0 3px
    rgba(22,163,74,.08);
}


/* CLASS GRID */

.class-grid {
  display: grid;

  grid-template-columns:
    repeat(
      2,
      minmax(0,1fr)
    );

  gap: 18px;
}


.class-card {
  padding: 20px;

  background: white;

  border:
    1px solid #e2e8f0;

  border-radius: 14px;

  box-shadow:
    0 5px 18px
    rgba(15,23,42,.04);
}


.class-card-header {
  margin-bottom: 18px;

  display: flex;

  justify-content:
    space-between;

  gap: 15px;
}


.grade {
  color: #16a34a;

  font-size: 11px;

  font-weight: 700;
}


.class-card h2 {
  margin:
    3px 0 5px;

  font-size: 20px;
}


.class-card small {
  color: #64748b;

  font-size: 10px;
}


.class-actions {
  display: flex;

  gap: 7px;
}


.edit-btn,
.delete-btn {
  border: none;

  padding:
    7px 10px;

  border-radius: 6px;

  font-size: 10px;

  font-weight: 700;

  cursor: pointer;
}


.edit-btn {
  background: #dcfce7;

  color: #15803d;
}


.delete-btn {
  background: #fee2e2;

  color: #dc2626;
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

  padding:
    0 11px;

  border:
    1px solid #cbd5e1;

  border-radius: 7px;

  outline: none;
}


.student-add input:focus {
  border-color: #16a34a;
}


.student-add button {
  border: none;

  padding:
    0 16px;

  border-radius: 7px;

  background: #16a34a;

  color: white;

  font-size: 11px;

  font-weight: 700;

  cursor: pointer;
}


/* STUDENTS */

.student-list {
  max-height: 310px;

  overflow-y: auto;
}


.student-row {
  padding:
    10px 4px;

  display: flex;

  justify-content:
    space-between;

  align-items: center;

  gap: 12px;

  border-bottom:
    1px solid #f1f5f9;
}


.student-info {
  min-width: 0;

  display: flex;

  align-items: center;

  gap: 9px;
}


.avatar {
  width: 33px;

  height: 33px;

  min-width: 33px;

  display: flex;

  align-items: center;

  justify-content: center;

  border-radius: 50%;

  background: #dcfce7;

  color: #15803d;

  font-size: 11px;

  font-weight: 800;
}


.student-info span {
  overflow: hidden;

  color: #334155;

  font-size: 12px;

  text-overflow: ellipsis;

  white-space: nowrap;
}


.student-actions {
  display: flex;

  gap: 5px;
}


.student-edit,
.student-delete {
  border: none;

  padding:
    5px 8px;

  border-radius: 5px;

  font-size: 9px;

  font-weight: 700;

  cursor: pointer;
}


.student-edit {
  background: #f1f5f9;

  color: #475569;
}


.student-delete {
  background: #fef2f2;

  color: #dc2626;
}


.no-students {
  padding: 20px;

  color: #94a3b8;

  font-size: 11px;

  text-align: center;
}


/* STATES */

.state-message,
.empty-state {
  padding: 50px;

  background: white;

  border-radius: 12px;

  color: #64748b;

  text-align: center;
}


.empty-state h3 {
  margin-bottom: 5px;

  color: #334155;
}


.empty-state p {
  font-size: 12px;
}


.error-box {
  padding: 16px;

  display: flex;

  justify-content:
    space-between;

  align-items: center;

  background: #fef2f2;

  border:
    1px solid #fecaca;

  border-radius: 9px;

  color: #dc2626;

  font-size: 12px;
}


.error-box button {
  border: none;

  padding:
    7px 11px;

  border-radius: 6px;

  background: #dc2626;

  color: white;

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

  background:
    rgba(15,23,42,.55);

  backdrop-filter:
    blur(5px);
}


.modal {
  width: 430px;

  max-width: 100%;

  padding: 25px;

  background: white;

  border-radius: 14px;

  box-shadow:
    0 20px 55px
    rgba(0,0,0,.25);
}


.modal h2 {
  margin:
    0 0 20px;

  font-size: 20px;
}


.form-group {
  margin-bottom: 15px;
}


.form-group label {
  display: block;

  margin-bottom: 6px;

  color: #475569;

  font-size: 11px;

  font-weight: 700;
}


.form-group input {
  width: 100%;

  height: 42px;

  padding:
    0 11px;

  border:
    1px solid #cbd5e1;

  border-radius: 7px;

  outline: none;
}


.form-group input:focus {
  border-color: #16a34a;
}


.modal-error {
  margin-bottom: 15px;

  padding: 10px;

  background: #fef2f2;

  border-radius: 6px;

  color: #dc2626;

  font-size: 11px;
}


.modal-actions {
  margin-top: 20px;

  display: flex;

  gap: 10px;
}


.cancel-btn,
.save-btn {
  flex: 1;

  border: none;

  padding: 11px;

  border-radius: 7px;

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


.cancel-btn:disabled,
.save-btn:disabled {
  opacity: .6;

  cursor: not-allowed;
}


/* RESPONSIVE */

@media(max-width: 900px) {

  .class-grid {
    grid-template-columns:
      1fr;
  }

}


@media(max-width: 600px) {

  .class-page {
    padding: 18px;
  }


  .page-header {
    align-items:
      flex-start;

    flex-direction:
      column;
  }


  .create-class-btn {
    width: 100%;
  }


  .stats {
    grid-template-columns:
      1fr;
  }


  .student-row {
    align-items:
      flex-start;
  }


  .student-actions {
    flex-direction:
      column;
  }

}

</style>
