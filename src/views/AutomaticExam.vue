<template>
  <div class="automatic-page">
    <button class="back-btn" @click="$router.push('/faculty/create-exam')">
      ← Back to Selection
    </button>

    <div class="page-header">
      <h1>Automatic Exam Generation</h1>
      <p>Generate draft questions by pasting questions with answers or uploading learning materials.</p>
    </div>

    <div class="top-grid">
      <div class="card">
        <h2>Exam Details</h2>

        <div class="form-group">
          <label>Exam Title</label>
          <input v-model="examTitle" type="text" placeholder="e.g. Midterm Examination">
        </div>

        <div class="form-group">
          <label>Description</label>
          <textarea v-model="description" placeholder="Brief description of the exam"></textarea>
        </div>

        <div class="two-column">
          <div class="form-group">
            <label>Duration (minutes)</label>
            <input v-model="duration" type="number">
          </div>

          <div class="form-group">
            <label>Course</label>
            <input v-model="course" type="text" placeholder="Computer Science 101">
          </div>
        </div>
      </div>

      <div class="card summary">
        <h2>Draft Summary</h2>

        <div class="summary-box">
          <div>
            <span>Questions Generated</span>
            <h1>{{ questions.length }}</h1>
          </div>

          <div>
            <span>Detected Answers</span>
            <h1>{{ detectedAnswers }}</h1>
          </div>

          <div>
            <span>Missing Answers</span>
            <h1 class="warning-text">{{ missingAnswers }}</h1>
          </div>
        </div>

        <button class="create-btn" @click="openCreatePopup">
          Create Exam
        </button>
      </div>
    </div>

    <div class="card method-card">
      <h2>Generation Method</h2>

      <div class="tabs">
        <button :class="{ active: activeMethod === 'paste' }" @click="activeMethod = 'paste'">
          Paste Questions
        </button>

        <button :class="{ active: activeMethod === 'upload' }" @click="activeMethod = 'upload'">
          Upload File
        </button>
      </div>

      <div v-if="activeMethod === 'paste'" class="method-content">
        <div class="format-box">
          <strong>Accepted Format:</strong>
          <p>
            Multiple Choice questions can be pasted directly with A-D choices and Answer key.
            You may also add section labels like <b>True or False</b> and <b>Identification</b>.
          </p>
        </div>

        <textarea
          v-model="rawText"
          class="paste-area"
          placeholder="Paste questions with answers here..."
        ></textarea>

        <button class="generate-btn" @click="generateFromText">
          Generate Draft Questions
        </button>
      </div>

      <div v-if="activeMethod === 'upload'" class="method-content">
        <div class="drop-area">
          <div class="upload-icon">📄</div>

          <h3>Upload PDF, DOCX, PPTX or TXT</h3>

          <p>Later Laravel will extract text from the uploaded file and generate questions.</p>

          <input
            type="file"
            accept=".pdf,.docx,.pptx,.txt"
            @change="handleFileUpload"
          >

          <div v-if="selectedFile" class="file-selected">
            Selected File: <strong>{{ selectedFile.name }}</strong>
          </div>
        </div>

        <button class="generate-btn" @click="generateFromUpload">
          Generate From Uploaded File
        </button>
      </div>
    </div>

    <div class="card">
      <div class="question-header">
        <h2>Generated Draft Questions</h2>

        <button class="add-question-btn" @click="addBlankQuestion">
          + Add Question
        </button>
      </div>

      <div v-if="questions.length === 0" class="empty">
        No generated questions yet.
      </div>

      <div
        v-for="(question,index) in questions"
        :key="question.id"
        class="question-card"
      >
        <div class="question-card-header">
          <h3>Question {{ index + 1 }}</h3>

          <button class="delete-btn" @click="deleteQuestion(index)">
            Delete
          </button>
        </div>

        <div class="form-group">
          <label>Question Type</label>
          <select v-model="question.type" @change="normalizeQuestion(question)">
            <option>Multiple Choice</option>
            <option>True or False</option>
            <option>Identification</option>
            <option>Essay</option>
          </select>
        </div>

        <div class="form-group">
          <label>Question</label>
          <textarea v-model="question.question"></textarea>
        </div>

        <div v-if="question.type === 'Multiple Choice'" class="two-column">
          <div class="form-group">
            <label>Option A</label>
            <input v-model="question.options[0]">
          </div>

          <div class="form-group">
            <label>Option B</label>
            <input v-model="question.options[1]">
          </div>

          <div class="form-group">
            <label>Option C</label>
            <input v-model="question.options[2]">
          </div>

          <div class="form-group">
            <label>Option D</label>
            <input v-model="question.options[3]">
          </div>
        </div>

        <div class="three-column">
          <div class="form-group">
            <label>Correct Answer</label>

            <select
              v-if="question.type === 'Multiple Choice'"
              v-model="question.answer"
            >
              <option value="">Select answer</option>
              <option>A</option>
              <option>B</option>
              <option>C</option>
              <option>D</option>
            </select>

            <select
              v-else-if="question.type === 'True or False'"
              v-model="question.answer"
            >
              <option value="">Select answer</option>
              <option>True</option>
              <option>False</option>
            </select>

            <input
              v-else
              v-model="question.answer"
              placeholder="Correct answer"
            >
          </div>

          <div class="form-group">
            <label>Points</label>
            <input type="number" v-model="question.points">
          </div>

          <div class="form-group">
            <label>Time Limit (sec)</label>
            <input type="number" v-model="question.time">
          </div>
        </div>

        <div v-if="!question.answer" class="warning-box">
          ⚠ No answer detected for this question.
        </div>
      </div>
    </div>

    <div v-if="showCreatePopup" class="popup-overlay">
      <div class="popup-card">
        <div class="popup-icon">✓</div>

        <h2>Create Examination?</h2>

        <p>
          This examination will be saved as a draft.
          You can still edit it later before publishing.
        </p>

        <div class="popup-buttons">
          <button class="cancel-btn" @click="stillEdit">
            Still Edit
          </button>

          <button class="confirm-btn" @click="confirmCreateExam">
            Create Exam
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const examTitle = ref('')
const description = ref('')
const duration = ref(60)
const course = ref('')

const activeMethod = ref<'paste' | 'upload'>('paste')
const rawText = ref('')
const selectedFile = ref<File | null>(null)

const showCreatePopup = ref(false)

const questions = ref<any[]>([])

const detectedAnswers = computed(() => {
  return questions.value.filter(q => q.answer && String(q.answer).trim() !== '').length
})

const missingAnswers = computed(() => {
  return questions.value.filter(q => !q.answer || String(q.answer).trim() === '').length
})

const totalPoints = computed(() => {
  return questions.value.reduce(
    (sum, item) => sum + Number(item.points || 0),
    0
  )
})

function generateFromText() {
  if (!rawText.value.trim()) {
    alert('Please paste questions first.')
    return
  }

  const parsed = parseQuestions(rawText.value)

  if (parsed.length === 0) {
    alert('No valid questions detected.')
    return
  }

  questions.value = parsed

  alert(`${parsed.length} questions generated successfully.`)
}

function parseQuestions(text: string) {
  const lines = text
    .replace(/\r/g, '')
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean)

  const blocks: { type: string; lines: string[] }[] = []

  let currentType = 'Multiple Choice'
  let currentBlock: string[] = []

  lines.forEach(line => {
    if (/^true\s*or\s*false$/i.test(line)) {
      currentType = 'True or False'
      currentBlock = []
      return
    }

    if (/^identification$/i.test(line)) {
      currentType = 'Identification'
      currentBlock = []
      return
    }

    if (/^essay$/i.test(line)) {
      currentType = 'Essay'
      currentBlock = []
      return
    }

    currentBlock.push(line)

    if (/^(answer|ans|correct answer|correct|key)\s*[:\-]\s*/i.test(line)) {
      blocks.push({
        type: currentType,
        lines: [...currentBlock]
      })

      currentBlock = []
    }
  })

  if (currentBlock.length > 0) {
    blocks.push({
      type: currentType,
      lines: [...currentBlock]
    })
  }

  return blocks
    .map((block, index) => {
      const options = ['', '', '', '']
      let answer = ''
      const questionLines: string[] = []

      block.lines.forEach(line => {
        const optionMatch = line.match(/^([A-Da-d])[\.\)\:]\s*(.+)$/)

        if (optionMatch && optionMatch.length >= 3) {
          const letter = optionMatch[1]!.toUpperCase()
          const value = optionMatch[2]!
          const optionIndex = letter.charCodeAt(0) - 65

          options[optionIndex] = value
          return
        }

        const answerMatch = line.match(
          /^(answer|ans|correct answer|correct|key)\s*[:\-]\s*(.+)$/i
        )

        if (answerMatch && answerMatch.length >= 3) {
          answer = answerMatch[2]!.trim()
          return
        }

        questionLines.push(
          line.replace(/^(Q?\d+[\.\)]|QUESTION\s*\d+[\.\:]?)\s*/i, '')
        )
      })

      const hasOptions = options.some(option => option.trim() !== '')

      let finalType = block.type

      if (hasOptions) {
        finalType = 'Multiple Choice'
        answer = answer.toUpperCase()
      }

      else if (
        answer.toLowerCase() === 'true' ||
        answer.toLowerCase() === 'false'
      ) {
        finalType = 'True or False'
        answer =
          answer.toLowerCase() === 'true'
            ? 'True'
            : 'False'
      }

      else if (answer.trim() !== '') {
        finalType = 'Identification'
      }

      else {
        finalType = 'Essay'
      }

      return {
        id: Date.now() + index,
        type: finalType,
        question: questionLines.join(' ').trim(),
        options,
        answer,
        points: 1,
        time: 30
      }
    })
    .filter(item => item.question.trim() !== '')
}

function normalizeQuestion(question: any) {
  if (question.type === 'Multiple Choice') {
    if (!question.options) {
      question.options = ['', '', '', '']
    }

    if (!['A', 'B', 'C', 'D'].includes(question.answer)) {
      question.answer = ''
    }
  }

  if (question.type === 'True or False') {
    question.options = ['', '', '', '']

    if (
      question.answer !== 'True' &&
      question.answer !== 'False'
    ) {
      question.answer = ''
    }
  }

  if (
    question.type === 'Identification' ||
    question.type === 'Essay'
  ) {
    question.options = ['', '', '', '']
  }
}

function handleFileUpload(event: Event) {
  const target = event.target as HTMLInputElement

  if (target.files && target.files.length > 0) {
    selectedFile.value = target.files[0]!
  }
}

function generateFromUpload() {
  if (!selectedFile.value) {
    alert('Please upload a file first.')
    return
  }

  questions.value = [
    {
      id: Date.now(),
      type: 'Multiple Choice',
      question: 'Sample generated question from uploaded file.',
      options: [
        'Sample Option A',
        'Sample Option B',
        'Sample Option C',
        'Sample Option D'
      ],
      answer: 'A',
      points: 1,
      time: 30
    }
  ]

  alert('Frontend demo only. Laravel will process uploaded files later.')
}

function addBlankQuestion() {
  questions.value.push({
    id: Date.now(),
    type: 'Multiple Choice',
    question: '',
    options: ['', '', '', ''],
    answer: '',
    points: 1,
    time: 30
  })
}

function deleteQuestion(index: number) {
  questions.value.splice(index, 1)
}

function openCreatePopup() {
  if (!examTitle.value.trim()) {
    alert('Please enter exam title.')
    return
  }

  if (!course.value.trim()) {
    alert('Please enter course.')
    return
  }

  if (questions.value.length === 0) {
    alert('Please generate or add at least one question.')
    return
  }

  showCreatePopup.value = true
}

function stillEdit() {
  showCreatePopup.value = false
}

function confirmCreateExam() {
  showCreatePopup.value = false

  alert('Generated exam created successfully! Later this will be saved to Laravel.')

  router.push('/faculty/dashboard')
}
</script>

<style scoped>
*{
  margin:0;
  padding:0;
  box-sizing:border-box;
  font-family:'Poppins',sans-serif;
}

.automatic-page{
  min-height:100vh;
  background:#f7f9fc;
  padding:35px;
}

.back-btn{
  background:white;
  border:none;
  padding:12px 18px;
  border-radius:10px;
  cursor:pointer;
  margin-bottom:25px;
  box-shadow:0 5px 15px rgba(0,0,0,.08);
}

.back-btn:hover{
  background:#00c853;
  color:white;
}

.page-header{
  margin-bottom:30px;
}

.page-header h1{
  color:#112244;
  font-size:34px;
  margin-bottom:8px;
}

.page-header p{
  color:#6b7280;
}

.top-grid{
  display:grid;
  grid-template-columns:2fr 1fr;
  gap:25px;
  margin-bottom:25px;
}

.method-grid{
  display:grid;
  grid-template-columns:1fr;
  gap:25px;
  margin-bottom:25px;
}

.card{
  background:white;
  border-radius:18px;
  padding:25px;
  box-shadow:0 5px 18px rgba(0,0,0,.08);
  margin-bottom:25px;
}

.card h2{
  color:#112244;
  margin-bottom:20px;
}

.form-group{
  margin-bottom:18px;
}

.form-group label{
  display:block;
  font-weight:600;
  margin-bottom:8px;
  color:#374151;
}

input,
textarea,
select{
  width:100%;
  padding:13px 15px;
  border:1px solid #d9dce2;
  border-radius:10px;
  outline:none;
  font-size:15px;
}

input:focus,
textarea:focus,
select:focus{
  border-color:#00c853;
}

textarea{
  resize:none;
  min-height:100px;
}

.two-column{
  display:grid;
  grid-template-columns:1fr 1fr;
  gap:20px;
}

.three-column{
  display:grid;
  grid-template-columns:1fr 1fr 1fr;
  gap:20px;
}

.summary-box{
  display:flex;
  flex-direction:column;
  gap:20px;
}

.summary-box span{
  color:#6b7280;
  font-size:14px;
}

.summary-box h1{
  color:#00c853;
  font-size:34px;
}

.warning-text{
  color:#f59e0b !important;
}

.tabs{
  display:flex;
  gap:12px;
  margin-bottom:20px;
}

.tabs button{
  border:none;
  background:#edf2f7;
  padding:12px 20px;
  border-radius:10px;
  cursor:pointer;
  font-weight:600;
}

.tabs button.active{
  background:#00c853;
  color:white;
}

.format-box{
  background:#f8fafc;
  border-left:5px solid #00c853;
  padding:18px;
  border-radius:12px;
  margin-bottom:18px;
  color:#374151;
  line-height:1.7;
}

.paste-area{
  min-height:260px;
  margin-bottom:15px;
}

.drop-area{
  border:2px dashed #b8d5ff;
  border-radius:16px;
  padding:45px;
  text-align:center;
  background:#f8fbff;
}

.upload-icon{
  font-size:50px;
  margin-bottom:15px;
}

.drop-area h3{
  color:#112244;
  margin-bottom:10px;
}

.drop-area p{
  color:#666;
  margin-bottom:15px;
}

.file-selected{
  margin-top:15px;
  color:#112244;
}

.generate-btn,
.create-btn,
.add-question-btn{
  border:none;
  background:#00c853;
  color:white;
  padding:14px 22px;
  border-radius:10px;
  cursor:pointer;
  font-weight:600;
}

.generate-btn:hover,
.create-btn:hover,
.add-question-btn:hover{
  background:#00b34a;
}

.create-btn{
  width:100%;
  margin-top:25px;
}

.question-header,
.question-card-header{
  display:flex;
  justify-content:space-between;
  align-items:center;
  gap:20px;
  margin-bottom:20px;
}

.question-card{
  border:1px solid #ececec;
  border-radius:16px;
  padding:22px;
  margin-bottom:20px;
  background:#fafafa;
}

.question-card h3{
  color:#112244;
}

.delete-btn{
  border:none;
  background:#fee2e2;
  color:#dc2626;
  padding:10px 16px;
  border-radius:10px;
  cursor:pointer;
  font-weight:600;
}

.delete-btn:hover{
  background:#fecaca;
}

.warning-box{
  background:#fff7ed;
  color:#c2410c;
  padding:14px;
  border-radius:10px;
  margin-top:10px;
  font-weight:600;
}

.empty{
  text-align:center;
  color:#888;
  padding:35px;
}

.popup-overlay{
  position:fixed;
  inset:0;
  background:rgba(0,0,0,.55);
  backdrop-filter:blur(5px);
  display:flex;
  justify-content:center;
  align-items:center;
  z-index:9999;
}

.popup-card{
  width:430px;
  max-width:95%;
  background:white;
  border-radius:20px;
  padding:35px;
  text-align:center;
  box-shadow:0 20px 45px rgba(0,0,0,.2);
}

.popup-icon{
  width:75px;
  height:75px;
  margin:0 auto 20px;
  border-radius:50%;
  background:#00c853;
  color:white;
  display:flex;
  justify-content:center;
  align-items:center;
  font-size:34px;
  font-weight:700;
}

.popup-card h2{
  color:#112244;
  margin-bottom:15px;
}

.popup-card p{
  color:#666;
  line-height:1.7;
}

.popup-buttons{
  display:flex;
  gap:15px;
  margin-top:30px;
}

.cancel-btn,
.confirm-btn{
  flex:1;
  border:none;
  padding:14px;
  border-radius:10px;
  cursor:pointer;
  font-weight:600;
}

.cancel-btn{
  background:#e5e7eb;
}

.confirm-btn{
  background:#16a34a;
  color:white;
}

@media(max-width:900px){
  .top-grid,
  .two-column,
  .three-column{
    grid-template-columns:1fr;
  }

  .automatic-page{
    padding:20px;
  }

  .page-header h1{
    font-size:28px;
  }

  .question-header,
  .question-card-header,
  .popup-buttons{
    flex-direction:column;
    align-items:stretch;
  }

  .tabs{
    flex-direction:column;
  }
}
</style>