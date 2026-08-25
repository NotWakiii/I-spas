<template>
  <div class="manual-page">

    <!-- BACK -->
    <button
      class="back-btn"
      @click="$router.push('/faculty/create-exam')"
    >
      ← Back to Selection
    </button>


    <!-- PAGE HEADER -->
    <div class="page-header">

      <h1>
        Manual Exam Creation
      </h1>

      <p>
        Create your exam manually by adding questions.
      </p>

    </div>


    <!-- ==========================================
         TOP SECTION
    =========================================== -->
    <div class="top-grid">

      <!-- EXAM DETAILS -->
      <div class="card">

        <h2>
          Exam Details
        </h2>


        <!-- TITLE -->
        <div class="form-group">

          <label>
            Exam Title
          </label>

          <input
            v-model="examTitle"
            type="text"
            placeholder="Midterm Examination"
          >

        </div>


        <!-- DESCRIPTION -->
        <div class="form-group">

          <label>
            Description
          </label>

          <textarea
            v-model="description"
            placeholder="Enter description..."
          ></textarea>

        </div>


        <!-- CLASS -->
        <div class="form-group">

          <label>
            Class
          </label>

          <select
            v-model="selectedClassId"
            :disabled="loadingClasses"
          >

            <option
              disabled
              value=""
            >
              {{
                loadingClasses
                  ? 'Loading classes...'
                  : 'Select Class'
              }}
            </option>

            <option
              v-for="schoolClass in classes"
              :key="schoolClass.id"
              :value="schoolClass.id"
            >
              {{ schoolClass.grade }} - {{ schoolClass.section }}
            </option>

          </select>

          <p
            v-if="!loadingClasses && classes.length === 0"
            class="class-warning"
          >
            No classes found. Create a class in Class Management first.
          </p>

        </div>


        <!-- SUBJECT -->
        <div class="form-group">

          <label>
            Subject
          </label>

          <input
            v-model="subject"
            type="text"
            placeholder="Enter subject"
          >

        </div>


        <!-- DURATION / PASSING -->
        <div class="two-column">

          <div class="form-group">

            <label>
              Duration (minutes)
            </label>

            <input
              v-model="duration"
              type="number"
              min="1"
            >

          </div>


          <div class="form-group">

            <label>
              Passing Score (%)
            </label>

            <input
              v-model="passing"
              type="number"
              min="1"
              max="100"
            >

          </div>

        </div>

      </div>


      <!-- EXAM SUMMARY -->
      <div class="card">

        <h2>
          Exam Summary
        </h2>


        <div class="summary-box">

          <div>

            <span>
              Total Questions
            </span>

            <h1>
              {{ questions.length }}
            </h1>

          </div>


          <div>

            <span>
              Total Points
            </span>

            <h1>
              {{ totalPoints }}
            </h1>

          </div>

        </div>


        <button
          class="create-btn"
          :disabled="creatingExam"
          @click="openCreatePopup"
        >
          {{
            creatingExam
              ? 'Creating...'
              : 'Create Exam'
          }}
        </button>

      </div>

    </div>


    <!-- ==========================================
         ADD QUESTION
    =========================================== -->
    <div class="card">

      <h2>
        Add Question
      </h2>


      <!-- QUESTION TYPE -->
      <div class="form-group">

        <label>
          Question Type
        </label>

        <select
          v-model="questionType"
          @change="resetAnswerForType"
        >

          <option>
            Multiple Choice
          </option>

          <option>
            True or False
          </option>

          <option>
            Identification
          </option>

          <option>
            Essay
          </option>

        </select>

      </div>


      <!-- QUESTION -->
      <div class="form-group">

        <label>
          Question
        </label>

        <textarea
          v-model="question"
          placeholder="Enter question..."
        ></textarea>

      </div>


      <!-- COMPETENCY -->
      <div class="form-group">

        <label>
          Competency
        </label>

        <input
          v-model="competency"
          type="text"
          placeholder="Enter learning competency"
        >

      </div>


      <!-- ======================================
           MULTIPLE CHOICE
      ======================================= -->
      <div
        v-if="
          questionType ===
          'Multiple Choice'
        "
      >

        <label class="choices-label">
          Choices
        </label>


        <div
          class="option"
          v-for="(
            option,
            index
          ) in options"
          :key="index"
        >

          <input
            v-model="
              options[index]
            "
            :placeholder="
              'Option ' +
              (index + 1)
            "
          >

        </div>


        <div class="form-group">

          <label>
            Correct Answer
          </label>

          <select
            v-model="answer"
          >

            <option
              disabled
              value=""
            >
              Select Correct Answer
            </option>

            <option
              v-for="(
                option,
                index
              ) in options"
              :key="index"
              :value="option"
              :disabled="
                !option.trim()
              "
            >
              {{
                option ||
                'Option ' +
                (index + 1)
              }}
            </option>

          </select>

        </div>

      </div>


      <!-- ======================================
           TRUE OR FALSE
      ======================================= -->
      <div
        v-if="
          questionType ===
          'True or False'
        "
        class="form-group"
      >

        <label>
          Correct Answer
        </label>

        <select
          v-model="answer"
        >

          <option
            disabled
            value=""
          >
            Select Correct Answer
          </option>

          <option value="True">
            True
          </option>

          <option value="False">
            False
          </option>

        </select>

      </div>


      <!-- ======================================
           IDENTIFICATION
      ======================================= -->
      <div
        v-if="
          questionType ===
          'Identification'
        "
        class="form-group"
      >

        <label>
          Correct Answer
        </label>

        <input
          v-model="answer"
          placeholder="Correct Answer"
        >

      </div>


      <!-- ======================================
           ESSAY
      ======================================= -->
      <div
        v-if="
          questionType ===
          'Essay'
        "
        class="essay-note"
      >
        Essay questions do not require
        a predefined correct answer.
      </div>


      <!-- TIME / POINTS -->
      <div class="two-column">

        <div class="form-group">

          <label>
            Time Limit (seconds)
          </label>

          <input
            v-model="timeLimit"
            type="number"
            min="1"
          >

        </div>


        <div class="form-group">

          <label>
            Points
          </label>

          <input
            v-model="points"
            type="number"
            min="1"
          >

        </div>

      </div>


      <!-- ADD QUESTION -->
      <button
        class="add-btn"
        @click="addQuestion"
      >
        + Add Question
      </button>

    </div>


    <!-- ==========================================
         QUESTIONS ADDED
    =========================================== -->
    <div class="card">

      <div class="questions-header">

        <div>

          <h2>
            Questions Added
          </h2>

          <p>
            Review your questions before
            creating the examination.
          </p>

        </div>

      </div>


      <!-- EMPTY -->
      <div
        v-if="
          questions.length === 0
        "
        class="empty"
      >
        No questions added yet.
      </div>


      <!-- QUESTIONS -->
      <div
        v-for="(
          item,
          index
        ) in questions"
        :key="index"
        class="question-item"
      >

        <div class="question-top">

          <h3>
            Question {{ index + 1 }}
          </h3>

          <button
            class="remove-btn"
            @click="
              removeQuestion(index)
            "
          >
            Remove
          </button>

        </div>


        <p class="question-text">
          {{ item.question }}
        </p>


        <p class="competency-text">

          <strong>
            Competency:
          </strong>

          {{ item.competency }}

        </p>


        <!-- OPTIONS -->
        <div
          v-if="
            item.type ===
            'Multiple Choice'
          "
          class="preview-options"
        >

          <div
            v-for="(
              option,
              optionIndex
            ) in item.options"
            :key="optionIndex"
            class="preview-option"
          >

            <span>
              {{
                String.fromCharCode(
                  65 + optionIndex
                )
              }}.
            </span>

            {{ option }}

          </div>

        </div>


        <div class="question-meta">

          <span>
            {{ item.type }}
          </span>

          <span>
            {{ item.points }} pts
          </span>

          <span>
            {{ item.time }} sec
          </span>

          <span
            v-if="
              item.type !==
              'Essay'
            "
          >
            Answer:
            {{ item.answer }}
          </span>

        </div>

      </div>

    </div>


    <!-- ==========================================
         CREATE EXAM POPUP
    =========================================== -->
    <div
      v-if="showCreatePopup"
      class="popup-overlay"
      @click.self="stillEdit"
    >

      <div class="popup-card">

        <div class="popup-icon">
          ✓
        </div>


        <h2>
          Create Examination?
        </h2>


        <p>
          This exam will be saved as a
          draft. You can still edit it later.
        </p>


        <div class="popup-summary">

          <div>
            <span>Exam</span>
            <strong>
              {{ examTitle }}
            </strong>
          </div>

          <div>
            <span>Subject</span>
            <strong>
              {{ subject }}
            </strong>
          </div>

          <div>
            <span>Class</span>

            <strong>
              {{ selectedClassLabel }}
            </strong>
          </div>

          <div>
            <span>Questions</span>
            <strong>
              {{ questions.length }}
            </strong>
          </div>

        </div>


        <div class="popup-buttons">

          <button
            class="cancel-btn"
            :disabled="creatingExam"
            @click="stillEdit"
          >
            Still Edit
          </button>


          <button
            class="confirm-btn"
            :disabled="creatingExam"
            @click="confirmCreateExam"
          >
            {{
              creatingExam
                ? 'Creating...'
                : 'Create Exam'
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
  ref
} from 'vue'

import {
  useRouter
} from 'vue-router'

import api from '../services/api'


const router =
  useRouter()


// ==========================================
// TYPES
// ==========================================

interface ManualQuestion {
  type: string
  question: string
  competency: string
  answer: string
  options: string[]
  points: number
  time: number
}

const selectedClassLabel =
  computed(() => {

    const schoolClass =
      classes.value.find(
        item =>
          item.id ===
          Number(
            selectedClassId.value
          )
      )

    if (!schoolClass) {
      return 'Not selected'
    }

    return `${schoolClass.grade} - ${schoolClass.section}`

  })

// ==========================================
// EXAM DETAILS
// ==========================================

const examTitle =
  ref('')

const description =
  ref('')

interface SchoolClass {
  id: number
  grade: string
  section: string
}

const classes =
  ref<SchoolClass[]>([])

const selectedClassId =
  ref<number | ''>('')

const loadingClasses =
  ref(false)

const subject =
  ref('')

const duration =
  ref(60)

const passing =
  ref(75)


  // ==========================================
// LOAD FACULTY CLASSES
// ==========================================

async function fetchClasses() {

  loadingClasses.value = true

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

  } catch (error: any) {

    console.error(
      'LOAD CLASSES ERROR:',
      error
    )

    classes.value = []

    alert(
      error.response?.data?.message ||
      'Failed to load classes.'
    )

  } finally {

    loadingClasses.value = false

  }

}
// ==========================================
// QUESTION FORM
// ==========================================

const questionType =
  ref('Multiple Choice')

const question =
  ref('')

const competency =
  ref('')

const answer =
  ref('')

const points =
  ref(1)

const timeLimit =
  ref(30)

const options =
  ref([
    '',
    '',
    '',
    ''
  ])


// ==========================================
// QUESTIONS
// ==========================================

const questions =
  ref<ManualQuestion[]>([])


// ==========================================
// CREATE STATE
// ==========================================

const showCreatePopup =
  ref(false)

const creatingExam =
  ref(false)


// ==========================================
// TOTAL POINTS
// ==========================================

const totalPoints =
  computed(() => {

    return questions.value.reduce(
      (
        sum,
        item
      ) => {

        return (
          sum +
          Number(
            item.points || 0
          )
        )

      },
      0
    )

  })


// ==========================================
// RESET ANSWER WHEN TYPE CHANGES
// ==========================================

function resetAnswerForType() {

  answer.value = ''

  if (
    questionType.value !==
    'Multiple Choice'
  ) {

    options.value = [
      '',
      '',
      '',
      ''
    ]

  }

}


// ==========================================
// ADD QUESTION
// ==========================================

function addQuestion() {

  if (
    !question.value.trim()
  ) {

    alert(
      'Please enter a question.'
    )

    return
  }


  if (
    !competency.value.trim()
  ) {

    alert(
      'Please enter the competency.'
    )

    return
  }


  if (
    Number(points.value) < 1
  ) {

    alert(
      'Points must be at least 1.'
    )

    return
  }


  if (
    Number(timeLimit.value) < 1
  ) {

    alert(
      'Time limit must be at least 1 second.'
    )

    return
  }


  // MULTIPLE CHOICE VALIDATION
  if (
    questionType.value ===
    'Multiple Choice'
  ) {

    const hasEmptyOption =
      options.value.some(
        option =>
          !option.trim()
      )


    if (hasEmptyOption) {

      alert(
        'Please complete all choices.'
      )

      return
    }


    const duplicateOptions =
      new Set(
        options.value.map(
          option =>
            option
              .trim()
              .toLowerCase()
        )
      )


    if (
      duplicateOptions.size !==
      options.value.length
    ) {

      alert(
        'Multiple choice options must be unique.'
      )

      return
    }


    if (
      !answer.value.trim()
    ) {

      alert(
        'Please select the correct answer.'
      )

      return
    }

  }


  // TRUE/FALSE + IDENTIFICATION
  if (
    questionType.value !==
      'Essay'
    &&
    !answer.value.trim()
  ) {

    alert(
      'Please enter/select the correct answer.'
    )

    return
  }


  questions.value.push({

    type:
      questionType.value,

    question:
      question.value.trim(),

    competency:
      competency.value.trim(),

    answer:
      questionType.value ===
      'Essay'
        ? ''
        : answer.value.trim(),

    options:
      questionType.value ===
      'Multiple Choice'
        ? options.value.map(
            option =>
              option.trim()
          )
        : [],

    points:
      Number(
        points.value
      ),

    time:
      Number(
        timeLimit.value
      )

  })


  resetQuestionForm()

}


// ==========================================
// RESET QUESTION FORM
// ==========================================

function resetQuestionForm() {

  question.value = ''

  competency.value = ''

  answer.value = ''

  options.value = [
    '',
    '',
    '',
    ''
  ]

  points.value = 1

  timeLimit.value = 30

}


// ==========================================
// REMOVE QUESTION
// ==========================================

function removeQuestion(
  index: number
) {

  const confirmed =
    window.confirm(
      `Remove Question ${index + 1}?`
    )


  if (!confirmed) {
    return
  }


  questions.value.splice(
    index,
    1
  )

}


// ==========================================
// OPEN CREATE POPUP
// ==========================================

function openCreatePopup() {

  if (
    !examTitle.value.trim()
  ) {

    alert(
      'Please enter exam title.'
    )

    return
  }
  if (
    !selectedClassId.value
  ) {

    alert(
      'Please select a class.'
    )

    return
  }

  if (
    !subject.value.trim()
  ) {

    alert(
      'Please enter subject.'
    )

    return
  }


  if (
    Number(duration.value) < 1
  ) {

    alert(
      'Duration must be at least 1 minute.'
    )

    return
  }


  if (
    Number(passing.value) < 1
    ||
    Number(passing.value) > 100
  ) {

    alert(
      'Passing score must be between 1 and 100.'
    )

    return
  }


  if (
    questions.value.length === 0
  ) {

    alert(
      'Please add at least one question.'
    )

    return
  }


  showCreatePopup.value =
    true

}


// ==========================================
// STILL EDIT
// ==========================================

function stillEdit() {

  if (
    creatingExam.value
  ) {
    return
  }


  showCreatePopup.value =
    false

}


// ==========================================
// CREATE EXAM
// ==========================================

async function confirmCreateExam() {

  if (
    creatingExam.value
  ) {
    return
  }


  creatingExam.value =
    true


  try {

    const payload = {

      title:
        examTitle.value.trim(),

      description:
        description.value.trim(),

      class_id:
        Number(
          selectedClassId.value
        ),

      subject:
        subject.value.trim(),

      duration:
        Number(
          duration.value
        ),

      passing:
        Number(
          passing.value
        ),

      questions:
        questions.value

    }


    console.log(
      'MANUAL EXAM PAYLOAD:',
      payload
    )


    await api.post(
      '/exams',
      payload
    )


    showCreatePopup.value =
      false


    alert(
      'Exam created successfully!'
    )


    await router.push(
      '/faculty/dashboard'
    )

  } catch (error: any) {

  console.error(
    'MANUAL EXAM ERROR:',
    error
  )

  console.error(
    'SERVER RESPONSE:',
    error.response?.data
  )

  const validationErrors =
    error.response?.data?.errors

  if (validationErrors) {

    const firstError =
      Object.values(validationErrors)
        .flat()[0]

    alert(
      String(
        firstError ||
        'Please check the exam information.'
      )
    )

  } else {

    alert(
      error.response?.data?.message ||
      'Failed to create exam.'
    )

  }

} finally {

  creatingExam.value = false

}

}
onMounted(() => {
  fetchClasses()
})
</script>


<style scoped>

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family:
    'Poppins',
    sans-serif;
}


/* ==========================================
   PAGE
========================================== */

.manual-page {
  padding: 35px;

  background: #f7f9fc;

  min-height: 100vh;
}


/* ==========================================
   HEADER
========================================== */

.page-header {
  margin-bottom: 30px;
}


.page-header h1 {
  color: #112244;

  font-size: 34px;

  margin-bottom: 8px;
}


.page-header p {
  color: #6b7280;
}


/* ==========================================
   BACK BUTTON
========================================== */

.back-btn {
  background: white;

  border: none;

  padding: 12px 18px;

  border-radius: 10px;

  cursor: pointer;

  margin-bottom: 25px;

  box-shadow:
    0 5px 15px
    rgba(0, 0, 0, .08);

  transition: .3s;
}


.back-btn:hover {
  background: #00c853;

  color: white;
}


/* ==========================================
   TOP GRID
========================================== */

.top-grid {
  display: grid;

  grid-template-columns:
    2fr 1fr;

  gap: 25px;

  margin-bottom: 25px;
}


/* ==========================================
   CARD
========================================== */

.card {
  background: white;

  border-radius: 18px;

  padding: 25px;

  box-shadow:
    0 5px 18px
    rgba(0, 0, 0, .08);

  margin-bottom: 25px;
}


.card h2 {
  color: #112244;

  margin-bottom: 20px;
}

.class-warning {
  margin-top: 7px;
  color: #dc2626;
  font-size: 12px;
}
/* ==========================================
   FORM
========================================== */

.form-group {
  margin-bottom: 18px;
}


.form-group label,
.choices-label {
  display: block;

  font-weight: 600;

  margin-bottom: 8px;

  color: #374151;
}


.form-group input,
.form-group textarea,
.form-group select,
.option input {
  width: 100%;

  padding: 13px 15px;

  border:
    1px solid #d9dce2;

  border-radius: 10px;

  outline: none;

  transition: .25s;

  font-size: 15px;

  background: white;
}


.form-group input:focus,
.form-group textarea:focus,
.form-group select:focus,
.option input:focus {
  border-color: #00c853;

  box-shadow:
    0 0 0 3px
    rgba(0, 200, 83, .08);
}


.form-group textarea {
  resize: vertical;

  min-height: 110px;
}


/* ==========================================
   TWO COLUMN
========================================== */

.two-column {
  display: grid;

  grid-template-columns:
    1fr 1fr;

  gap: 20px;
}


/* ==========================================
   SUMMARY
========================================== */

.summary-box {
  display: flex;

  flex-direction: column;

  gap: 25px;

  margin-bottom: 25px;
}


.summary-box span {
  color: #6b7280;

  font-size: 14px;
}


.summary-box h1 {
  color: #00c853;

  font-size: 38px;
}


/* ==========================================
   BUTTONS
========================================== */

.create-btn,
.add-btn {
  width: 100%;

  height: 50px;

  border: none;

  background: #00c853;

  color: white;

  border-radius: 10px;

  cursor: pointer;

  font-size: 16px;

  font-weight: 600;

  transition: .3s;
}


.create-btn:hover:not(:disabled),
.add-btn:hover:not(:disabled) {
  background: #00b34a;
}


.create-btn:disabled,
.add-btn:disabled {
  opacity: .6;

  cursor: not-allowed;
}


/* ==========================================
   OPTIONS
========================================== */

.option {
  margin-bottom: 12px;
}


/* ==========================================
   ESSAY NOTE
========================================== */

.essay-note {
  margin-bottom: 18px;

  padding: 13px 15px;

  background: #f0fdf4;

  border:
    1px solid #bbf7d0;

  color: #166534;

  border-radius: 10px;

  font-size: 13px;
}


/* ==========================================
   QUESTIONS HEADER
========================================== */

.questions-header {
  display: flex;

  justify-content:
    space-between;

  align-items: center;

  margin-bottom: 20px;
}


.questions-header h2 {
  margin-bottom: 5px;
}


.questions-header p {
  color: #6b7280;

  font-size: 13px;
}


/* ==========================================
   QUESTION ITEM
========================================== */

.question-item {
  padding: 18px;

  border:
    1px solid #ececec;

  border-radius: 12px;

  margin-bottom: 15px;

  transition: .25s;
}


.question-item:hover {
  border-color: #00c853;

  transform:
    translateY(-2px);
}


.question-top {
  display: flex;

  justify-content:
    space-between;

  align-items: center;

  gap: 15px;

  margin-bottom: 10px;
}


.question-item h3 {
  color: #112244;
}


.question-text {
  color: #444;

  line-height: 1.6;

  margin-bottom: 8px;
}


.competency-text {
  color: #4b5563;

  margin-bottom: 10px;

  font-size: 13px;
}


.competency-text strong {
  color: #166534;
}


/* ==========================================
   QUESTION META
========================================== */

.question-meta {
  display: flex;

  flex-wrap: wrap;

  gap: 8px;

  margin-top: 12px;
}


.question-meta span {
  padding: 5px 9px;

  background: #f3f4f6;

  border-radius: 20px;

  color: #4b5563;

  font-size: 11px;

  font-weight: 600;
}


/* ==========================================
   PREVIEW OPTIONS
========================================== */

.preview-options {
  display: grid;

  grid-template-columns:
    repeat(2, 1fr);

  gap: 7px;

  margin:
    12px 0;
}


.preview-option {
  padding:
    8px 10px;

  background: #f9fafb;

  border:
    1px solid #e5e7eb;

  border-radius: 7px;

  color: #4b5563;

  font-size: 12px;
}


.preview-option span {
  font-weight: 700;

  color: #15803d;
}


/* ==========================================
   REMOVE BUTTON
========================================== */

.remove-btn {
  border: none;

  padding:
    6px 10px;

  border-radius: 7px;

  background: #fee2e2;

  color: #dc2626;

  font-size: 11px;

  font-weight: 700;

  cursor: pointer;
}


.remove-btn:hover {
  background: #fecaca;
}


/* ==========================================
   EMPTY
========================================== */

.empty {
  text-align: center;

  color: #888;

  padding: 35px;
}


/* ==========================================
   POPUP
========================================== */

.popup-overlay {
  position: fixed;

  inset: 0;

  background:
    rgba(0, 0, 0, .55);

  backdrop-filter:
    blur(5px);

  display: flex;

  justify-content: center;

  align-items: center;

  padding: 20px;

  z-index: 9999;
}


.popup-card {
  width: 450px;

  max-width: 95%;

  background: white;

  border-radius: 20px;

  padding: 35px;

  text-align: center;

  box-shadow:
    0 20px 45px
    rgba(0, 0, 0, .2);
}


.popup-icon {
  width: 75px;

  height: 75px;

  margin:
    0 auto 20px;

  border-radius: 50%;

  background: #00c853;

  color: white;

  display: flex;

  justify-content: center;

  align-items: center;

  font-size: 34px;

  font-weight: 700;
}


.popup-card h2 {
  color: #112244;

  margin-bottom: 15px;
}


.popup-card > p {
  color: #666;

  line-height: 1.7;
}


/* ==========================================
   POPUP SUMMARY
========================================== */

.popup-summary {
  margin-top: 20px;

  padding: 15px;

  background: #f9fafb;

  border-radius: 10px;

  text-align: left;
}


.popup-summary div {
  display: flex;

  justify-content:
    space-between;

  gap: 15px;

  padding:
    7px 0;

  border-bottom:
    1px solid #e5e7eb;
}


.popup-summary div:last-child {
  border-bottom: none;
}


.popup-summary span {
  color: #6b7280;

  font-size: 12px;
}


.popup-summary strong {
  color: #111827;

  font-size: 12px;

  text-align: right;
}


/* ==========================================
   POPUP BUTTONS
========================================== */

.popup-buttons {
  display: flex;

  gap: 15px;

  margin-top: 30px;
}


.cancel-btn,
.confirm-btn {
  flex: 1;

  border: none;

  padding: 14px;

  border-radius: 10px;

  cursor: pointer;

  font-weight: 600;
}


.cancel-btn {
  background: #e5e7eb;

  color: #374151;
}


.confirm-btn {
  background: #16a34a;

  color: white;
}


.cancel-btn:disabled,
.confirm-btn:disabled {
  opacity: .6;

  cursor: not-allowed;
}


/* ==========================================
   RESPONSIVE
========================================== */

@media(max-width: 900px) {

  .top-grid {
    grid-template-columns:
      1fr;
  }


  .two-column {
    grid-template-columns:
      1fr;
  }


  .manual-page {
    padding: 20px;
  }


  .page-header h1 {
    font-size: 28px;
  }


  .popup-buttons {
    flex-direction:
      column;
  }


  .preview-options {
    grid-template-columns:
      1fr;
  }

}

</style>
