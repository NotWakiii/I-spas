<template>
  <div class="automatic-page">

    <button
      class="back-btn"
      @click="$router.push('/faculty/create-exam')"
    >
      ← Back to Selection
    </button>

    <div class="page-header">
      <h1>Automatic Exam Generation</h1>
      <p>
        Generate draft questions by pasting questions with answers.
      </p>
    </div>

    <!-- ==========================================
         EXAM DETAILS + SUMMARY
    =========================================== -->
    <div class="top-grid">

      <!-- EXAM DETAILS -->
      <div class="card">
        <h2>Exam Details</h2>

        <div class="form-group">
          <label>Exam Title</label>

          <input
            v-model="examTitle"
            type="text"
            placeholder="e.g. Midterm Examination"
          >
        </div>

        <div class="form-group">
          <label>Description</label>

          <textarea
            v-model="description"
            placeholder="Brief description of the exam"
          ></textarea>
        </div>

        <!-- CLASS -->
        <div class="form-group">
          <label>Assign to Classes</label>

          <div
            v-if="loadingClasses"
            class="class-loading"
          >
            Loading classes...
          </div>

          <div
            v-else-if="classes.length > 0"
            class="class-selection-box"
          >
            <label
              v-for="schoolClass in classes"
              :key="schoolClass.id"
              class="class-checkbox-item"
              :class="{
                selected: selectedClassIds.includes(schoolClass.id)
              }"
            >
              <input
                v-model="selectedClassIds"
                type="checkbox"
                :value="schoolClass.id"
              >

              <div class="class-checkbox-info">
                <strong>
                  Grade {{ schoolClass.grade }}
                </strong>

                <span>
                  {{ schoolClass.section }}
                </span>
              </div>
            </label>
          </div>

          <p
            v-if="
              !loadingClasses &&
              classes.length === 0
            "
            class="class-warning"
          >
            No classes found. Create a class in Class Management first.
          </p>

          <p
            v-if="selectedClassIds.length > 0"
            class="selected-class-count"
          >
            {{ selectedClassIds.length }}
            class(es) selected
          </p>
        </div>

        <!-- SUBJECT -->
        <div class="form-group">
          <label>Subject</label>

          <input
            v-model="subject"
            type="text"
            placeholder="e.g. Basic Accounting"
          >
        </div>

        <div class="two-column">

          <div class="form-group">
            <label>Duration (minutes)</label>

            <input
              v-model="duration"
              type="number"
              min="1"
            >
          </div>

          <div class="form-group">
            <label>Passing Score (%)</label>

            <input
              v-model="passing"
              type="number"
              min="1"
              max="100"
            >
          </div>

        </div>
      </div>

      <!-- DRAFT SUMMARY -->
      <div class="card summary">
        <h2>Draft Summary</h2>

        <div class="summary-box">

          <div>
            <span>Questions Generated</span>
            <h1>{{ questions.length }}</h1>
          </div>

          <div>
            <span>Total Points</span>
            <h1>{{ totalPoints }}</h1>
          </div>

          <div>
            <span>Detected Answers</span>
            <h1>{{ detectedAnswers }}</h1>
          </div>

          <div>
            <span>Missing Answers</span>

            <h1 class="warning-text">
              {{ missingAnswers }}
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
         GENERATION METHOD
    =========================================== -->
    <div class="card method-card">
      <h2>Generation Method</h2>

      <div class="tabs">
        <button class="active">
          Paste Questions
        </button>
      </div>

      <div class="method-content">

        <div class="format-box">
          <strong>Accepted Format:</strong>

          <p>
            Multiple Choice questions can be pasted directly
            with A-D choices and Answer key. You may also add
            section labels like <b>True or False</b>,
            <b>Identification</b>, and <b>Essay</b>.
          </p>

          <p>
            You may also add a competency before a question
            using:
            <b>Competency: Your competency here</b>.
          </p>
        </div>

        <textarea
          v-model="rawText"
          class="paste-area"
          placeholder="Paste questions with answers here..."
        ></textarea>

        <button
          class="generate-btn"
          @click="generateFromText"
        >
          Generate Draft Questions
        </button>

      </div>
    </div>

    <!-- ==========================================
         GENERATED QUESTIONS
    =========================================== -->
    <div class="card">

      <div class="question-header">

        <div>
          <h2>Generated Draft Questions</h2>

          <p
            v-if="questions.length > 0"
            class="question-summary-text"
          >
            {{ questions.length }}
            question(s) •
            {{ totalPoints }}
            total point(s)
          </p>
        </div>

        <button
          class="add-question-btn"
          @click="addBlankQuestion"
        >
          + Add Question
        </button>

      </div>

      <!-- EMPTY -->
      <div
        v-if="questions.length === 0"
        class="empty"
      >
        No generated questions yet.
      </div>

      <!-- QUESTIONS -->
      <div
        v-for="(question, index) in questions"
        :key="question.id"
        class="question-card"
      >

        <div class="question-card-header">

          <h3>
            Question {{ index + 1 }}
          </h3>

          <button
            class="delete-btn"
            @click="deleteQuestion(index)"
          >
            Delete
          </button>

        </div>

        <!-- COMPETENCY -->
        <div class="form-group">
          <label>Competency</label>

          <input
            v-model="question.competency"
            type="text"
            placeholder="Enter learning competency"
          >
        </div>

        <!-- QUESTION TYPE -->
        <div class="form-group">
          <label>Question Type</label>

          <select
            v-model="question.type"
            @change="normalizeQuestion(question)"
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
          <label>Question</label>

          <textarea
            v-model="question.question"
          ></textarea>
        </div>

        <!-- MULTIPLE CHOICE OPTIONS -->
        <div
          v-if="question.type === 'Multiple Choice'"
          class="two-column"
        >

          <div class="form-group">
            <label>Option A</label>

            <input
              v-model="question.options[0]"
            >
          </div>

          <div class="form-group">
            <label>Option B</label>

            <input
              v-model="question.options[1]"
            >
          </div>

          <div class="form-group">
            <label>Option C</label>

            <input
              v-model="question.options[2]"
            >
          </div>

          <div class="form-group">
            <label>Option D</label>

            <input
              v-model="question.options[3]"
            >
          </div>

        </div>

        <!-- ANSWER / POINTS / TIME -->
        <div class="three-column">

          <div class="form-group">
            <label>Correct Answer</label>

            <!-- MC -->
            <select
              v-if="
                question.type ===
                'Multiple Choice'
              "
              v-model="question.answer"
            >
              <option value="">
                Select answer
              </option>

              <option>A</option>
              <option>B</option>
              <option>C</option>
              <option>D</option>
            </select>

            <!-- TRUE / FALSE -->
            <select
              v-else-if="
                question.type ===
                'True or False'
              "
              v-model="question.answer"
            >
              <option value="">
                Select answer
              </option>

              <option>True</option>
              <option>False</option>
            </select>

            <!-- IDENTIFICATION / ESSAY -->
            <input
              v-else
              v-model="question.answer"
              placeholder="Correct answer"
            >
          </div>

          <div class="form-group">
            <label>Points</label>

            <input
              v-model.number="question.points"
              type="number"
              min="0"
            >
          </div>

          <div class="form-group">
            <label>Time Limit (sec)</label>

            <input
              v-model.number="question.time"
              type="number"
              min="1"
            >
          </div>

        </div>

        <div
          v-if="!question.answer"
          class="warning-box"
        >
          ⚠ No answer detected for this question.
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

        <h2>Create Examination?</h2>

        <p>
          This examination will be saved as a draft.
          You can still edit it later before publishing.
        </p>

        <div class="confirmation-summary">

          <div>
            <span>Classes</span>

            <strong>
              {{ selectedClassLabel }}
            </strong>
          </div>

          <div>
            <span>Subject</span>

            <strong>
              {{ subject }}
            </strong>
          </div>

          <div>
            <span>Questions</span>

            <strong>
              {{ questions.length }}
            </strong>
          </div>

          <div>
            <span>Total Points</span>

            <strong>
              {{ totalPoints }}
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

interface SchoolClass {
  id: number
  grade: string
  section: string
}


interface ExamQuestion {
  id: number
  type: string
  competency: string
  question: string
  options: string[]
  answer: string
  points: number
  time: number
}


// ==========================================
// EXAM DETAILS
// ==========================================

const passing =
  ref(50)

const creatingExam =
  ref(false)

const examTitle =
  ref('')

const description =
  ref('')

const duration =
  ref(60)

const subject =
  ref('')


// ==========================================
// CLASSES
// ==========================================

const classes =
  ref<SchoolClass[]>([])

const selectedClassIds =
  ref<number[]>([])

const loadingClasses =
  ref(false)


// ==========================================
// GENERATION
// ==========================================

const rawText =
  ref('')

const showCreatePopup =
  ref(false)

const questions =
  ref<ExamQuestion[]>([])


// ==========================================
// SUMMARY
// ==========================================

const detectedAnswers =
  computed(() => {

    return questions.value.filter(
      question =>
        question.answer &&
        String(
          question.answer
        ).trim() !== ''
    ).length

  })


const missingAnswers =
  computed(() => {

    return questions.value.filter(
      question =>
        !question.answer ||
        String(
          question.answer
        ).trim() === ''
    ).length

  })


const totalPoints =
  computed(() => {

    return questions.value.reduce(
      (sum, item) =>
        sum +
        Number(
          item.points || 0
        ),
      0
    )

  })


const selectedClassLabel =
  computed(() => {

    if (
      selectedClassIds.value.length === 0
    ) {
      return 'Not selected'
    }

    const selected =
      classes.value.filter(
        schoolClass =>
          selectedClassIds.value.includes(
            schoolClass.id
          )
      )

    return selected
      .map(
        schoolClass =>
          `${schoolClass.grade} - ${schoolClass.section}`
      )
      .join(', ')

  })


// ==========================================
// FETCH CLASSES
// ==========================================

async function fetchClasses() {

  loadingClasses.value = true

  try {

    const response =
      await api.get(
        '/faculty/classes'
      )

    console.log(
      'AUTOMATIC EXAM CLASSES:',
      response.data
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
      error.response?.data ||
      error
    )

    classes.value = []

  } finally {

    loadingClasses.value = false

  }

}


// ==========================================
// GENERATE FROM TEXT
// ==========================================

function generateFromText() {

  if (!rawText.value.trim()) {

    alert(
      'Please paste questions first.'
    )

    return
  }


  const parsed =
    parseQuestions(
      rawText.value
    )


  if (parsed.length === 0) {

    alert(
      'No valid questions detected.'
    )

    return
  }


  questions.value =
    parsed


  alert(
    `${parsed.length} questions generated successfully.`
  )

}


// ==========================================
// PARSE QUESTIONS
// ==========================================

function parseQuestions(
  text: string
): ExamQuestion[] {

  const lines =
    text
      .replace(/\r/g, '')
      .split('\n')
      .map(
        line =>
          line.trim()
      )
      .filter(Boolean)


  const blocks: {
    type: string
    competency: string
    lines: string[]
  }[] = []


  let currentType =
    'Multiple Choice'

  let currentBlock:
    string[] = []

  let currentCompetency =
    ''


  for (const line of lines) {

    // ======================================
    // COMPETENCY
    // ======================================

    const competencyMatch =
      line.match(
        /^competenc(?:y|ies)\s*[:\-]\s*(.+)$/i
      )


    if (competencyMatch) {

      if (
        currentBlock.length > 0
      ) {

        blocks.push({
          type:
            currentType,

          competency:
            currentCompetency,

          lines:
            [...currentBlock]
        })

        currentBlock = []
      }


      currentCompetency =
        competencyMatch[1]!
          .trim()

      continue
    }


    // ======================================
    // TRUE OR FALSE
    // ======================================

    if (
      /^true\s*or\s*false$/i
        .test(line)
    ) {

      if (
        currentBlock.length > 0
      ) {

        blocks.push({
          type:
            currentType,

          competency:
            currentCompetency,

          lines:
            [...currentBlock]
        })

        currentBlock = []
      }


      currentType =
        'True or False'

      continue
    }


    // ======================================
    // IDENTIFICATION
    // ======================================

    if (
      /^identification$/i
        .test(line)
    ) {

      if (
        currentBlock.length > 0
      ) {

        blocks.push({
          type:
            currentType,

          competency:
            currentCompetency,

          lines:
            [...currentBlock]
        })

        currentBlock = []
      }


      currentType =
        'Identification'

      continue
    }


    // ======================================
    // ESSAY
    // ======================================

    if (
      /^essay$/i
        .test(line)
    ) {

      if (
        currentBlock.length > 0
      ) {

        blocks.push({
          type:
            currentType,

          competency:
            currentCompetency,

          lines:
            [...currentBlock]
        })

        currentBlock = []
      }


      currentType =
        'Essay'

      continue
    }


    // ======================================
    // NORMAL CONTENT
    // ======================================

    currentBlock.push(line)


    if (
      /^(answer|ans|correct answer|correct|key)\s*[:\-]\s*/i
        .test(line)
    ) {

      blocks.push({
        type:
          currentType,

        competency:
          currentCompetency,

        lines:
          [...currentBlock]
      })

      currentBlock = []
    }

  }


  // Save unfinished final question
  if (
    currentBlock.length > 0
  ) {

    blocks.push({
      type:
        currentType,

      competency:
        currentCompetency,

      lines:
        [...currentBlock]
    })

  }


  return blocks
    .map(
      (
        block,
        index
      ): ExamQuestion => {

        const options =
          ['', '', '', '']

        let answer =
          ''

        const questionLines:
          string[] = []


        block.lines.forEach(
          line => {

            // ==============================
            // OPTIONS A-D
            // ==============================

            const optionMatch =
              line.match(
                /^([A-Da-d])[\.\)\:]\s*(.+)$/
              )


            if (
              optionMatch &&
              optionMatch.length >= 3
            ) {

              const letter =
                optionMatch[1]!
                  .toUpperCase()

              const value =
                optionMatch[2]!
                  .trim()

              const optionIndex =
                letter.charCodeAt(0)
                - 65

              options[
                optionIndex
              ] = value

              return
            }


            // ==============================
            // ANSWER
            // ==============================

            const answerMatch =
              line.match(
                /^(answer|ans|correct answer|correct|key)\s*[:\-]\s*(.+)$/i
              )


            if (
              answerMatch &&
              answerMatch.length >= 3
            ) {

              answer =
                answerMatch[2]!
                  .trim()

              return
            }


            // ==============================
            // QUESTION TEXT
            // ==============================

            questionLines.push(
              line.replace(
                /^(Q?\d+[\.\)]|QUESTION\s*\d+[\.\:]?)\s*/i,
                ''
              )
            )

          }
        )


        const hasOptions =
          options.some(
            option =>
              option.trim() !== ''
          )


        let finalType =
          block.type


        if (hasOptions) {

          finalType =
            'Multiple Choice'

          answer =
            answer.toUpperCase()

        } else if (
          answer.toLowerCase()
            === 'true'
          ||
          answer.toLowerCase()
            === 'false'
        ) {

          finalType =
            'True or False'

          answer =
            answer.toLowerCase()
              === 'true'
              ? 'True'
              : 'False'

        } else if (
          answer.trim() !== ''
        ) {

          finalType =
            'Identification'

        } else {

          finalType =
            'Essay'
        }


        return {

          id:
            Date.now() +
            index,

          type:
            finalType,

          competency:
            block.competency
              .trim()
            ||
            'Unassigned Competency',

          question:
            questionLines
              .join(' ')
              .trim(),

          options,

          answer,

          points:
            1,

          time:
            30
        }

      }
    )
    .filter(
      item =>
        item.question
          .trim() !== ''
    )

}


// ==========================================
// NORMALIZE QUESTION
// ==========================================

function normalizeQuestion(
  question: ExamQuestion
) {

  if (
    question.type ===
    'Multiple Choice'
  ) {

    if (
      !Array.isArray(
        question.options
      )
    ) {

      question.options =
        ['', '', '', '']
    }


    if (
      ![
        'A',
        'B',
        'C',
        'D'
      ].includes(
        question.answer
      )
    ) {

      question.answer = ''
    }

  }


  if (
    question.type ===
    'True or False'
  ) {

    question.options =
      ['', '', '', '']


    if (
      question.answer !==
        'True'
      &&
      question.answer !==
        'False'
    ) {

      question.answer = ''
    }

  }


  if (
    question.type ===
      'Identification'
    ||
    question.type ===
      'Essay'
  ) {

    question.options =
      ['', '', '', '']

  }

}


// ==========================================
// ADD BLANK QUESTION
// ==========================================

function addBlankQuestion() {

  questions.value.push({

    id:
      Date.now(),

    type:
      'Multiple Choice',

    competency:
      '',

    question:
      '',

    options:
      [
        '',
        '',
        '',
        ''
      ],

    answer:
      '',

    points:
      1,

    time:
      30

  })

}


// ==========================================
// DELETE QUESTION
// ==========================================

function deleteQuestion(
  index: number
) {

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
    selectedClassIds.value.length === 0
  ) {

    alert(
      'Please select at least one class.'
    )

    return
  }


  if (
    !subject.value.trim()
  ) {

    alert(
      'Please enter the subject.'
    )

    return
  }


  if (
    Number(
      duration.value
    ) <= 0
  ) {

    alert(
      'Duration must be greater than 0.'
    )

    return
  }


  if (
    Number(
      passing.value
    ) < 1
    ||
    Number(
      passing.value
    ) > 100
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
      'Please generate or add at least one question.'
    )

    return
  }


  const hasEmptyQuestion =
    questions.value.some(
      question =>
        !question.question.trim()
    )


  if (hasEmptyQuestion) {

    alert(
      'Please complete all question texts.'
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


  showCreatePopup.value =
    false

  creatingExam.value =
    true


  try {

    await api.post(
      '/exams',
      {

        title:
          examTitle.value
            .trim(),

        description:
          description.value
            .trim(),

        class_ids:
          selectedClassIds.value,

        subject:
          subject.value
            .trim(),

        duration:
          Number(
            duration.value
          ),

        passing:
          Number(
            passing.value
          ),

        questions:
          questions.value.map(
            question => ({

              type:
                question.type,

              competency:
                question.competency
                  .trim(),

              question:
                question.question
                  .trim(),

              options:
                question.options,

              answer:
                question.answer,

              points:
                Number(
                  question.points
                ),

              time:
                Number(
                  question.time
                )

            })
          )

      }
    )


    alert(
      `${selectedClassIds.value.length} exam(s) created successfully!`
    )


    router.push(
      '/faculty/dashboard'
    )


  } catch (error: any) {

    console.error(
      'Create exam error:',
      error.response?.data ||
      error
    )


    alert(
      error.response
        ?.data
        ?.message
      ||
      'Failed to create generated exam.'
    )


  } finally {

    creatingExam.value =
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
  margin: 0;
  padding: 0;
  box-sizing: border-box;

  font-family:
    'Poppins',
    sans-serif;
}


.automatic-page {
  min-height: 100vh;

  padding: 35px;

  background: #f7f9fc;
}


/* ==========================================
   BACK BUTTON
========================================== */

.back-btn {
  margin-bottom: 25px;

  padding: 12px 18px;

  border: none;
  border-radius: 10px;

  background: white;

  box-shadow:
    0 5px 15px
    rgba(0, 0, 0, .08);

  cursor: pointer;
}


.back-btn:hover {
  background: #00c853;
  color: white;
}


/* ==========================================
   HEADER
========================================== */

.page-header {
  margin-bottom: 30px;
}


.page-header h1 {
  margin-bottom: 8px;

  color: #112244;

  font-size: 34px;
}


.page-header p {
  color: #6b7280;
}


/* ==========================================
   GRID
========================================== */

.top-grid {
  margin-bottom: 25px;

  display: grid;

  grid-template-columns:
    2fr 1fr;

  gap: 25px;
}


.two-column {
  display: grid;

  grid-template-columns:
    1fr 1fr;

  gap: 20px;
}


.three-column {
  display: grid;

  grid-template-columns:
    1fr 1fr 1fr;

  gap: 20px;
}


/* ==========================================
   CARD
========================================== */

.card {
  margin-bottom: 25px;

  padding: 25px;

  background: white;

  border-radius: 18px;

  box-shadow:
    0 5px 18px
    rgba(0, 0, 0, .08);
}


.card h2 {
  margin-bottom: 20px;

  color: #112244;
}


/* ==========================================
   FORMS
========================================== */

.form-group {
  margin-bottom: 18px;
}


.form-group label {
  display: block;

  margin-bottom: 8px;

  color: #374151;

  font-weight: 600;
}


input,
textarea,
select {
  width: 100%;

  padding: 13px 15px;

  border:
    1px solid #d9dce2;

  border-radius: 10px;

  outline: none;

  font-size: 15px;
}


input:focus,
textarea:focus,
select:focus {
  border-color: #00c853;
}


textarea {
  min-height: 100px;

  resize: none;
}


.class-warning {
  margin-top: 7px;

  color: #dc2626;

  font-size: 12px;
}


/* ==========================================
   SUMMARY
========================================== */

.summary-box {
  display: flex;

  flex-direction: column;

  gap: 20px;
}


.summary-box > div {
  padding-bottom: 12px;

  border-bottom:
    1px solid #f1f5f9;
}


.summary-box > div:last-child {
  border-bottom: none;
}


.summary-box span {
  color: #6b7280;

  font-size: 14px;
}


.summary-box h1 {
  margin-top: 3px;

  color: #00c853;

  font-size: 34px;
}


.warning-text {
  color: #f59e0b !important;
}


/* ==========================================
   GENERATION METHOD
========================================== */

.tabs {
  margin-bottom: 20px;

  display: flex;

  gap: 12px;
}


.tabs button {
  padding: 12px 20px;

  border: none;

  border-radius: 10px;

  background: #edf2f7;

  cursor: pointer;

  font-weight: 600;
}


.tabs button.active {
  background: #00c853;

  color: white;
}


.format-box {
  margin-bottom: 18px;

  padding: 18px;

  background: #f8fafc;

  border-left:
    5px solid #00c853;

  border-radius: 12px;

  color: #374151;

  line-height: 1.7;
}


.format-box p {
  margin-top: 8px;
}


.paste-area {
  min-height: 260px;

  margin-bottom: 15px;
}


/* ==========================================
   BUTTONS
========================================== */

.generate-btn,
.create-btn,
.add-question-btn {
  padding: 14px 22px;

  border: none;

  border-radius: 10px;

  background: #00c853;

  color: white;

  cursor: pointer;

  font-weight: 600;
}


.generate-btn:hover,
.create-btn:hover,
.add-question-btn:hover {
  background: #00b34a;
}


.create-btn {
  width: 100%;

  margin-top: 25px;
}


.create-btn:disabled,
.confirm-btn:disabled {
  opacity: .6;

  cursor: not-allowed;
}


/* ==========================================
   QUESTIONS
========================================== */

.question-header,
.question-card-header {
  margin-bottom: 20px;

  display: flex;

  justify-content:
    space-between;

  align-items: center;

  gap: 20px;
}


.question-summary-text {
  margin-top: -12px;

  color: #64748b;

  font-size: 12px;
}


.question-card {
  margin-bottom: 20px;

  padding: 22px;

  border:
    1px solid #ececec;

  border-radius: 16px;

  background: #fafafa;
}


.question-card h3 {
  color: #112244;
}


.delete-btn {
  padding: 10px 16px;

  border: none;

  border-radius: 10px;

  background: #fee2e2;

  color: #dc2626;

  cursor: pointer;

  font-weight: 600;
}


.delete-btn:hover {
  background: #fecaca;
}


.warning-box {
  margin-top: 10px;

  padding: 14px;

  background: #fff7ed;

  border-radius: 10px;

  color: #c2410c;

  font-weight: 600;
}


.empty {
  padding: 35px;

  color: #888;

  text-align: center;
}


/* ==========================================
   POPUP
========================================== */

.popup-overlay {
  position: fixed;

  inset: 0;

  z-index: 9999;

  display: flex;

  align-items: center;

  justify-content: center;

  background:
    rgba(0, 0, 0, .55);

  backdrop-filter:
    blur(5px);
}


.popup-card {
  width: 430px;

  max-width: 95%;

  padding: 35px;

  background: white;

  border-radius: 20px;

  box-shadow:
    0 20px 45px
    rgba(0, 0, 0, .2);

  text-align: center;
}


.popup-icon {
  width: 75px;

  height: 75px;

  margin:
    0 auto 20px;

  display: flex;

  align-items: center;

  justify-content: center;

  border-radius: 50%;

  background: #00c853;

  color: white;

  font-size: 34px;

  font-weight: 700;
}


.popup-card h2 {
  margin-bottom: 15px;

  color: #112244;
}


.popup-card p {
  color: #666;

  line-height: 1.7;
}


/* CONFIRMATION SUMMARY */

.confirmation-summary {
  margin-top: 20px;

  padding: 15px;

  background: #f8fafc;

  border-radius: 12px;

  text-align: left;
}


.confirmation-summary > div {
  padding: 8px 0;

  display: flex;

  justify-content:
    space-between;

  gap: 15px;

  border-bottom:
    1px solid #e5e7eb;
}


.confirmation-summary > div:last-child {
  border-bottom: none;
}


.confirmation-summary span {
  color: #64748b;

  font-size: 12px;
}


.confirmation-summary strong {
  color: #1e293b;

  font-size: 12px;

  text-align: right;
}


.popup-buttons {
  margin-top: 30px;

  display: flex;

  gap: 15px;
}


.cancel-btn,
.confirm-btn {
  flex: 1;

  padding: 14px;

  border: none;

  border-radius: 10px;

  cursor: pointer;

  font-weight: 600;
}


.cancel-btn {
  background: #e5e7eb;
}


.confirm-btn {
  background: #16a34a;

  color: white;
}

/* ==========================================
   MULTIPLE CLASS SELECTION
========================================== */

.class-selection-box {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;

  max-height: 250px;
  overflow-y: auto;

  padding: 12px;

  border: 1px solid #d9dce2;
  border-radius: 12px;

  background: #f8fafc;
}


.class-checkbox-item {
  display: flex;
  align-items: center;
  gap: 12px;

  padding: 12px;

  border: 1px solid #e5e7eb;
  border-radius: 10px;

  background: white;

  cursor: pointer;

  transition: .2s;
}


.class-checkbox-item:hover {
  border-color: #00c853;
}


.class-checkbox-item.selected {
  border-color: #00c853;
  background: #f0fdf4;
}


.class-checkbox-item input {
  width: 18px;
  height: 18px;

  flex-shrink: 0;

  accent-color: #00c853;
}


.class-checkbox-info {
  display: flex;
  flex-direction: column;

  gap: 2px;
}


.class-checkbox-info strong {
  color: #112244;

  font-size: 14px;
}


.class-checkbox-info span {
  color: #64748b;

  font-size: 12px;
}


.selected-class-count {
  margin-top: 8px;

  color: #16a34a;

  font-size: 12px;
  font-weight: 600;
}


.class-loading {
  padding: 14px;

  color: #64748b;

  border: 1px solid #e5e7eb;
  border-radius: 10px;

  background: #f8fafc;
}
/* ==========================================
   RESPONSIVE
========================================== */

@media (max-width: 900px) {

  .top-grid,
  .two-column,
  .three-column {
    grid-template-columns:
      1fr;
  }


  .automatic-page {
    padding: 20px;
  }


  .page-header h1 {
    font-size: 28px;
  }


  .question-header,
  .question-card-header,
  .popup-buttons {
    flex-direction: column;

    align-items: stretch;
  }


  .tabs {
    flex-direction: column;
  }


  .confirmation-summary > div {
    flex-direction: column;

    gap: 3px;
  }


  .confirmation-summary strong {
    text-align: left;
  }

}


@media (max-width: 600px) {

  .automatic-page {
    padding: 15px;
  }


  .card {
    padding: 18px;
  }


  .page-header h1 {
    font-size: 24px;
  }


  .popup-card {
    padding: 25px 20px;
  }

}

</style>
