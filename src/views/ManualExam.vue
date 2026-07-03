<template>
  <div class="manual-page">
    <button class="back-btn" @click="$router.push('/faculty/create-exam')">
      ← Back to Selection
    </button>

    <div class="page-header">
      <h1>Manual Exam Creation</h1>
      <p>Create your exam manually by adding questions.</p>
    </div>

    <div class="top-grid">
      <div class="card">
        <h2>Exam Details</h2>

        <div class="form-group">
          <label>Exam Title</label>
          <input v-model="examTitle" type="text" placeholder="Midterm Examination">
        </div>

        <div class="form-group">
          <label>Description</label>
          <textarea v-model="description" placeholder="Enter description..."></textarea>
        </div>

        <div class="two-column">
          <div class="form-group">
            <label>Duration (minutes)</label>
            <input type="number" v-model="duration">
          </div>

          <div class="form-group">
            <label>Course</label>
            <input type="text" v-model="course" placeholder="BSIT 3A">
          </div>
        </div>
      </div>

      <div class="card">
        <h2>Exam Summary</h2>

        <div class="summary-box">
          <div>
            <span>Total Questions</span>
            <h1>{{ questions.length }}</h1>
          </div>

          <div>
            <span>Total Points</span>
            <h1>{{ totalPoints }}</h1>
          </div>
        </div>

        <button class="create-btn" @click="openCreatePopup">
          Create Exam
        </button>
      </div>
    </div>

    <div class="card">
      <h2>Add Question</h2>

      <div class="form-group">
        <label>Question Type</label>
        <select v-model="questionType">
          <option>Multiple Choice</option>
          <option>True or False</option>
          <option>Identification</option>
          <option>Essay</option>
        </select>
      </div>

      <div class="form-group">
        <label>Question</label>
        <textarea v-model="question" placeholder="Enter question..."></textarea>
      </div>

      <div v-if="questionType==='Multiple Choice'">
        <div class="option" v-for="(option,index) in options" :key="index">
          <input v-model="options[index]" :placeholder="'Option '+(index+1)">
        </div>

        <div class="form-group">
          <label>Correct Answer</label>
          <select v-model="answer">
            <option disabled value="">Select Correct Answer</option>
            <option v-for="(option,index) in options" :key="index" :value="option">
              {{ option || 'Option '+(index+1) }}
            </option>
          </select>
        </div>
      </div>

      <div v-if="questionType==='True or False'" class="form-group">
        <label>Correct Answer</label>
        <select v-model="answer">
          <option>True</option>
          <option>False</option>
        </select>
      </div>

      <div v-if="questionType==='Identification'" class="form-group">
        <label>Correct Answer</label>
        <input v-model="answer" placeholder="Correct Answer">
      </div>

      <div class="two-column">
        <div class="form-group">
          <label>Time Limit (seconds)</label>
          <input type="number" v-model="timeLimit">
        </div>

        <div class="form-group">
          <label>Points</label>
          <input type="number" v-model="points">
        </div>
      </div>

      <button class="add-btn" @click="addQuestion">
        + Add Question
      </button>
    </div>

    <div class="card">
      <h2>Questions Added</h2>

      <div v-if="questions.length===0" class="empty">
        No questions added yet.
      </div>

      <div class="question-item" v-for="(item,index) in questions" :key="index">
        <h3>Question {{ index+1 }}</h3>
        <p>{{ item.question }}</p>
        <small>{{ item.type }} • {{ item.points }} pts</small>
      </div>
    </div>

    <!-- CREATE EXAM POPUP -->
    <div v-if="showCreatePopup" class="popup-overlay">
      <div class="popup-card">
        <div class="popup-icon">✓</div>

        <h2>Create Examination?</h2>

        <p>
          This exam will be saved as a draft. You can still edit it later.
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

const questionType = ref('Multiple Choice')
const question = ref('')
const answer = ref('')
const points = ref(1)
const timeLimit = ref(30)
const options = ref(['', '', '', ''])

const questions = ref<any[]>([])
const showCreatePopup = ref(false)

const totalPoints = computed(() => {
  return questions.value.reduce((sum, item) => sum + item.points, 0)
})

function addQuestion() {
  if (!question.value.trim()) {
    alert('Please enter a question.')
    return
  }

  if (questionType.value !== 'Essay' && !answer.value.trim()) {
    alert('Please enter/select the correct answer.')
    return
  }

  questions.value.push({
    type: questionType.value,
    question: question.value,
    answer: answer.value,
    options: [...options.value],
    points: Number(points.value),
    time: Number(timeLimit.value)
  })

  question.value = ''
  answer.value = ''
  options.value = ['', '', '', '']
  points.value = 1
  timeLimit.value = 30
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
    alert('Please add at least one question.')
    return
  }

  showCreatePopup.value = true
}

function stillEdit() {
  showCreatePopup.value = false
}

function confirmCreateExam() {
  showCreatePopup.value = false

  // Laravel later:
  // axios.post('/api/exams', { exam details + questions })

  alert('Exam created successfully! Later this will be saved to Laravel.')

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

.manual-page{
    padding:35px;
    background:#f7f9fc;
    min-height:100vh;
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

.back-btn{
    background:white;
    border:none;
    padding:12px 18px;
    border-radius:10px;
    cursor:pointer;
    margin-bottom:25px;
    box-shadow:0 5px 15px rgba(0,0,0,.08);
    transition:.3s;
}

.back-btn:hover{
    background:#00c853;
    color:white;
}

.top-grid{
    display:grid;
    grid-template-columns:2fr 1fr;
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

.form-group input,
.form-group textarea,
.form-group select,
.option input{
    width:100%;
    padding:13px 15px;
    border:1px solid #d9dce2;
    border-radius:10px;
    outline:none;
    transition:.25s;
    font-size:15px;
}

.form-group input:focus,
.form-group textarea:focus,
.form-group select:focus,
.option input:focus{
    border-color:#00c853;
}

.form-group textarea{
    resize:none;
    min-height:110px;
}

.two-column{
    display:grid;
    grid-template-columns:1fr 1fr;
    gap:20px;
}

.summary-box{
    display:flex;
    flex-direction:column;
    gap:25px;
    margin-bottom:25px;
}

.summary-box span{
    color:#6b7280;
    font-size:14px;
}

.summary-box h1{
    color:#00c853;
    font-size:38px;
}

.create-btn,
.add-btn{
    width:100%;
    height:50px;
    border:none;
    background:#00c853;
    color:white;
    border-radius:10px;
    cursor:pointer;
    font-size:16px;
    font-weight:600;
    transition:.3s;
}

.create-btn:hover,
.add-btn:hover{
    background:#00b34a;
}

.option{
    margin-bottom:12px;
}

.question-item{
    padding:18px;
    border:1px solid #ececec;
    border-radius:12px;
    margin-bottom:15px;
    transition:.25s;
}

.question-item:hover{
    border-color:#00c853;
    transform:translateY(-2px);
}

.question-item h3{
    color:#112244;
    margin-bottom:8px;
}

.question-item p{
    color:#444;
    margin-bottom:8px;
}

.question-item small{
    color:#6b7280;
}

.empty{
    text-align:center;
    color:#888;
    padding:35px;
}

/* POPUP */
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
    .top-grid{
        grid-template-columns:1fr;
    }

    .two-column{
        grid-template-columns:1fr;
    }

    .manual-page{
        padding:20px;
    }

    .page-header h1{
        font-size:28px;
    }

    .popup-buttons{
        flex-direction:column;
    }
}
</style>