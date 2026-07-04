<template>

<div class="dashboard">

 

    <div class="dashboard-header">

        <div>

            <h1>

                Faculty Dashboard

            </h1>

            <p>

                Welcome back! Manage your examinations and quizzes.

            </p>

        </div>

        <button
            class="new-exam-btn"
            @click="goToCreateExam"
        >

            + New Exam

        </button>

    </div>

 

    <div class="stats">

        <div class="card">

            <div>

                <span>Total Exams</span>

                <h2>{{ totalExams }}</h2>

            </div>

            <div class="emoji">

                🕮

            </div>

        </div>

        <div class="card">

            <div>

                <span>Published</span>

                <h2>{{ totalPublished }}</h2>

            </div>

            <div class="emoji">

                🗹

            </div>

        </div>

        <div class="card">

            <div>

                <span>Drafts</span>

                <h2>{{ totalDrafts }}</h2>

            </div>

            <div class="emoji">

                🗐

            </div>

        </div>

        <div class="card">

            <div>

                <span>Students</span>

                <h2>{{ totalStudents }}</h2>

            </div>

            <div class="emoji">

                👤

            </div>

        </div>

    </div>

  

    <div class="exam-section">

        <div class="exam-header">

            <div>

                <h2>

                    Examinations

                </h2>

                <p>

                    View and manage all examinations.

                </p>

            </div>

            <div class="filters">

                <input
                    v-model="search"
                    type="text"
                    placeholder="Search examination..."
                >

                <select
                    v-model="selectedCourse"
                >

                    <option>

                        All Courses

                    </option>

                    <option
                        v-for="course in courses"
                        :key="course"
                    >

                        {{ course }}

                    </option>

                </select>

            </div>

        </div>

        <!-- ===========================================
             EXAM CARDS
        ============================================ -->

        <div
            v-if="filteredExams.length"
        >

            <div

                v-for="exam in filteredExams"

                :key="exam.id"

                class="exam-card"

            >

                

                <div class="exam-title">

                    <div>

                        <h3>

                            {{ exam.title }}

                        </h3>

                        <span

                            class="badge"

                            :class="exam.status === 'Published'
                                ? 'published'
                                : 'draft'"

                        >

                            {{ exam.status }}

                        </span>

                    </div>

                    <div class="buttons">

                        <button

                            class="edit"

                            @click="editExam(exam.id)"

                        >

                            ✏ Edit

                        </button>

                        <button

                            class="preview"

                            @click="previewExam(exam)"

                        >

                            👁 Preview

                        </button>

                        <!-- Draft -->

                       <button
  v-if="exam.status === 'Draft'"
  class="publish-btn"
  @click="publishExam(exam)"
>
  📢 Publish
</button>

<button
  v-else-if="exam.status === 'Published'"
  class="start-btn"
  @click="startExam(exam)"
>
  ▶ Start Exam
</button>

<button
  v-else-if="exam.status === 'Finished'"
  class="start-btn"
  @click="startAgain(exam)"
>
  🔁 Start Again
</button>

                        <button

                            class="delete"

                            @click="deleteExam(exam.id)"

                        >

                            🗑 Delete

                        </button>

                    </div>

                </div>

                <!-- ===========================================
                     EXAM DETAILS
                ============================================ -->

                <div class="exam-info">

                    <div>

                        <small>

                            Course

                        </small>

                        <strong>

                            {{ exam.course }}

                        </strong>

                    </div>

                    <div>

                        <small>

                            Duration

                        </small>

                        <strong>

                            {{ exam.duration }} mins

                        </strong>

                    </div>

                    <div>

                        <small>

                            Questions

                        </small>

                        <strong>

                            {{ exam.items }}

                        </strong>

                    </div>

                    <div>

                        <small>

                            Points

                        </small>

                        <strong>

                            {{ exam.points }}

                        </strong>

                    </div>

                    <div>

                        <small>

                            Passing

                        </small>

                        <strong>

                            {{ exam.passing }}%

                        </strong>

                    </div>

                    <div>

                        <small>

                            Students

                        </small>

                        <strong>

                            {{ exam.students }}

                        </strong>

                    </div>

                    <div>

                        <small>

                            Created

                        </small>

                        <strong>

                            {{ exam.created }}

                        </strong>

                    </div>

                </div>

            </div>

        </div>

        <!-- EMPTY -->

        <div

            v-else

            class="empty"

        >

            <h2>

                📂 No examinations found

            </h2>

            <p>

                Try another search or course.

            </p>

        </div>

    </div>

  <!-- ===========================================
     PREVIEW POPUP
=========================================== -->

<div
    v-if="showPreview"
    class="preview-overlay"
    @click.self="closePreview"
>

    <div class="preview-modal">

        

        <div class="preview-header">

            <div>

                <h2>

                    {{ selectedExam.title }}

                </h2>

                <p>

                    Student Preview

                </p>

            </div>

            <button
                class="close-btn"
                @click="closePreview"
            >

                ✕

            </button>

        </div>

        

        <div class="preview-info">

            <div>

                <small>

                    Course

                </small>

                <strong>

                    {{ selectedExam.course }}

                </strong>

            </div>

            <div>

                <small>

                    Duration

                </small>

                <strong>

                    {{ selectedExam.duration }} mins

                </strong>

            </div>

            <div>

                <small>

                    Questions

                </small>

                <strong>

                   {{ selectedExam.questions.length }}

                </strong>

            </div>

            <div>

                <small>

                    Passing

                </small>

                <strong>

                    {{ selectedExam.passing }}%

                </strong>

            </div>

        </div>

        

<div
  v-for="(question,index) in selectedExam.questions"
  :key="question.id"
  v-show="previewQuestion === index + 1"
  class="question-preview"
>
  <h3>
    Question {{ index + 1 }}
  </h3>

  <p>
    {{ question.question }}
  </p>

  <div
    v-if="question.question_type === 'multiple_choice'"
  >
    <div
      v-for="option in question.options"
      :key="option.id"
      class="option"
    >
      ○ {{ option.option_text }}
    </div>
  </div>

  <div
    v-else
    class="option"
  >
    Answer: {{ question.answer || 'No answer provided' }}
  </div>
</div>

        

        <div class="preview-footer">

            <button
                @click="previousQuestion"
            >

                ← Previous

            </button>

            <span>

                Question {{ previewQuestion }}

                of

                {{ selectedExam.items }}

            </span>

            <button
                @click="nextQuestion"
            >

                Next →

            </button>

        </div>

    </div>

</div>

<!-- ===========================================
     START EXAM CONFIRMATION POPUP
=========================================== -->

<div
    v-if="showStartDialog"
    class="dialog-overlay"
>

    <div class="dialog">

        

        <div class="dialog-icon">

            ▶

        </div>

        

        <h2>

            Start Examination?

        </h2>

        

        <p>

            Are you sure you want to start this examination?

            <br><br>

            You will be redirected to the Monitoring Lobby where students
            can join using the generated access code.

        </p>

        

        <div
            v-if="selectedStartExam"
            class="dialog-info"
        >

            <div>

                <small>

                    Examination

                </small>

                <strong>

                    {{ selectedStartExam.title }}

                </strong>

            </div>

            <div>

                <small>

                    Course

                </small>

                <strong>

                    {{ selectedStartExam.course }}

                </strong>

            </div>

            <div>

                <small>

                    Duration

                </small>

                <strong>

                    {{ selectedStartExam.duration }} mins

                </strong>

            </div>

            <div>

                <small>

                    Questions

                </small>

                <strong>

                    {{ selectedStartExam.items }}

                </strong>

            </div>

        </div>

        

        <div class="dialog-buttons">

            <button
                class="cancel-btn"
                @click="cancelStartExam"
            >

                Cancel

            </button>

            <button
                class="start-btn"
                @click="confirmStartExam"
            >

                Start Exam

            </button>

        </div>

    </div>
 </div>
</div>

</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import api from '../services/api'
import { onMounted } from 'vue'


const router = useRouter()

// ===========================================
// SEARCH & FILTER
// ===========================================

const search = ref('')

const selectedCourse = ref('All Courses')

// ===========================================
// PREVIEW POPUP
// ===========================================

const showPreview = ref(false)

const previewQuestion = ref(1)

const selectedExam = ref({

    id:0,

    title:'',

    course:'',

    status:'',

    duration:0,

    items:0,

    points:0,

    passing:0,

    students:'',

    questions: [] as any[],

    created:''

    

})

// ===========================================
// START EXAM POPUP
// ===========================================

const showStartDialog = ref(false)

const selectedStartExam = ref<any>(null)



const exams = ref<any[]>([])
const loading = ref(false)

async function fetchExams() {
  loading.value = true

  try {
    const response = await api.get('/exams')

   exams.value = response.data.data.map((exam:any) => {
  const questions = exam.questions || []

  return {
    id: exam.id,
    title: exam.title,
    course: exam.course || 'No Course',
   status:
  exam.status === 'draft'
    ? 'Draft'
    : exam.status === 'published'
    ? 'Published'
    : exam.status === 'started'
    ? 'Started'
    : exam.status === 'finished'
    ? 'Finished'
    : exam.status,
    duration: exam.duration,
    items: questions.length,
    points: questions.reduce(
      (sum:number, q:any) => sum + Number(q.points || 0),
      0
    ),
    passing: exam.passing || 0,
    students: '0 / 0',
    created: new Date(exam.created_at).toLocaleDateString(),
    questions: questions
  }
})
  } catch (error) {
    console.error(error)
    alert('Failed to load exams.')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchExams()
})



const courses = computed(() => {

    return [

        ...new Set(

            exams.value.map(

                exam => exam.course

            )

        )

    ]

})

async function startAgain(exam:any) {
  const confirmed = confirm(
    'Start this exam again?\n\nA new access code will be generated for remedial or late students.'
  )

  if (!confirmed) return

  try {
    await api.post(`/exams/${exam.id}/restart`)

    await fetchExams()

    alert('Exam is ready again with a new access code.')
  } catch (error) {
    console.error(error)
    alert('Failed to restart exam.')
  }
}


const filteredExams = computed(() => {

    return exams.value.filter(exam => {

        const courseMatch =

            selectedCourse.value === 'All Courses'

            ||

            exam.course === selectedCourse.value

        const searchMatch =

            exam.title

            .toLowerCase()

            .includes(

                search.value.toLowerCase()

            )

        return courseMatch && searchMatch

    })

})



const totalExams = computed(

() => exams.value.length

)

const totalPublished = computed(

() =>

exams.value.filter(

exam => exam.status === 'Published'

).length

)

const totalDrafts = computed(

() =>

exams.value.filter(

exam => exam.status === 'Draft'

).length

)

const totalStudents = computed(() => {

    let total = 0

    exams.value.forEach(exam => {

        const value = parseInt(

            String(exam.students)

            .split('/')[1] || '0'

        )

        total += value

    })

    return total

})



function goToCreateExam() {

    router.push('/faculty/create-exam')

}





function editExam(id:number){

    router.push(`/faculty/edit-exam/${id}`)

}


function previewExam(exam:any){

    selectedExam.value = { ...exam }

    previewQuestion.value = 1

    showPreview.value = true

}



function closePreview(){

    showPreview.value = false

}



function nextQuestion() {

    if (
        previewQuestion.value <
        selectedExam.value.questions.length
    ) {

        previewQuestion.value++

    }

}

function previousQuestion(){

    if(previewQuestion.value > 1){

        previewQuestion.value--

    }

}



async function publishExam(exam:any) {

  const confirmed = confirm(
    'Publish this examination?\n\nStudents will be able to join after publishing.'
  )

  if (!confirmed) return

  try {

    await api.post(`/exams/${exam.id}/publish`)

    exam.status = 'Published'

    alert('Exam published successfully!')

  }

  catch (error) {

    console.error(error)

    alert('Failed to publish examination.')

  }

}



function startExam(exam:any){

    router.push(`/faculty/lobby/${exam.id}`)

}



function confirmStartExam(){

    if(!selectedStartExam.value) return

    showStartDialog.value = false

    router.push(

        `/faculty/lobby/${selectedStartExam.value.id}`

    )

}



function cancelStartExam(){

    showStartDialog.value = false

    selectedStartExam.value = null

}



async function deleteExam(id:number) {
  const confirmed = confirm('Delete this examination?')

  if (!confirmed) return

  try {
    await api.delete(`/exams/${id}`)

    exams.value = exams.value.filter(exam => exam.id !== id)
  } catch (error) {
    alert('Failed to delete exam.')
  }
}



function duplicateExam(exam:any){

    const copy = {

        ...exam,

        id: Date.now(),

        title: exam.title + ' (Copy)',

        status: 'Draft',

        students: '0 / 0',

        created: new Date().toLocaleDateString()

    }

    exams.value.unshift(copy)

}



</script>

<style scoped>
*{
  margin:0;
  padding:0;
  box-sizing:border-box;
}

.dashboard{
  padding:28px;
  background:#f4fbf6;
  min-height:100vh;
  font-family:'Poppins',sans-serif;
  color:#0f172a;
}

.dashboard-header{
  display:flex;
  justify-content:space-between;
  align-items:center;
  margin-bottom:22px;
}

.dashboard-header h1{
  font-size:28px;
  font-weight:800;
  color:#0f172a;
}

.dashboard-header p{
  margin-top:6px;
  color:#64748b;
  font-size:14px;
}

.new-exam-btn{
  border:none;
  background:#16a34a;
  color:white;
  padding:13px 24px;
  border-radius:10px;
  font-weight:700;
  cursor:pointer;
}

/* TOP CARDS LIKE SCREENSHOT */
.stats{
  display:grid;
  grid-template-columns:repeat(4,1fr);
  gap:16px;
  margin-bottom:24px;
}

.card{
  background:rgb(252, 252, 252);
  border:1px solid #00d400;
  border-radius:10px;
  padding:17px 18px;
  min-height:74px;
  display:flex;
  align-items:center;
  justify-content:space-between;
  box-shadow:0 2px 6px rgba(10, 55, 160, 0.04);
}

.card span{
  display:block;
  color:#000000;
  font-size:17px;
  font-weight:500;
  margin-bottom:15px;
}

.card h2{
  color:#141414;
  font-size:22px;
  font-weight:800;
  line-height:1;
}

.emoji{
  width:50px;
  height:50px;
  border-radius:8px;
  background:#c9c8c871;
  display:flex;
  align-items:center;
  justify-content:center;
  font-size:40px;
}

/* EXAM SECTION */
.exam-section{
  background:white;
  border:1px solid #e2e8f0;
  border-radius:14px;
  padding:24px;
  box-shadow:0 5px 18px rgba(15,23,42,.04);
}

.exam-header{
  display:flex;
  justify-content:space-between;
  align-items:center;
  gap:16px;
  margin-bottom:22px;
}

.exam-header h2{
  font-size:20px;
  font-weight:800;
  color:#0f172a;
}

.exam-header p{
  color:#64748b;
  font-size:13px;
  margin-top:5px;
}

.filters{
  display:flex;
  gap:10px;
}

.filters input,
.filters select{
  height:40px;
  border:1px solid #cbd5e1;
  border-radius:8px;
  background:white;
  padding:0 12px;
  outline:none;
  font-size:13px;
}

.filters input{
  width:220px;
}

.filters input:focus,
.filters select:focus{
  border-color:#16a34a;
  box-shadow:0 0 0 3px rgba(22,163,74,.12);
}

/* EXAM CARDS */
.exam-card{
  position:relative;
  background:#fff;
  border:1px solid #e2e8f0;
  border-radius:12px;
  padding:20px;
  margin-bottom:16px;
  overflow:hidden;
  transition:.2s;
}

.exam-card::before{
  content:"";
  position:absolute;
  top:0;
  left:0;
  width:4px;
  height:100%;
  background:#f97316;
}

.exam-card:has(.published)::before{
  background:#16a34a;
}

.exam-card:hover{
  box-shadow:0 12px 25px rgba(15,23,42,.08);
}

.exam-title{
  display:flex;
  justify-content:space-between;
  align-items:flex-start;
  gap:16px;
  margin-bottom:18px;
}

.exam-title h3{
  font-size:17px;
  font-weight:800;
  color:#0f172a;
  margin-bottom:8px;
}

.badge{
  display:inline-flex;
  align-items:center;
  gap:6px;
  padding:5px 10px;
  border-radius:999px;
  font-size:12px;
  font-weight:700;
}

.badge::before{
  content:"";
  width:7px;
  height:7px;
  border-radius:50%;
  background:currentColor;
}

.draft{
  background:#fff7ed;
  color:#f97316;
}

.published{
  background:#dcfce7;
  color:#16a34a;
}

.buttons{
  display:flex;
  gap:8px;
  flex-wrap:wrap;
}

.buttons button{
  height:36px;
  padding:0 12px;
  border-radius:7px;
  border:1px solid #cbd5e1;
  background:white;
  color:#334155;
  font-size:12px;
  font-weight:700;
  cursor:pointer;
}

.publish,
.start{
  background:#16a34a !important;
  border-color:#16a34a !important;
  color:white !important;
}

.delete{
  color:#dc2626 !important;
  border-color:#fca5a5 !important;
}

.exam-info{
  display:grid;
  grid-template-columns:repeat(auto-fit,minmax(115px,1fr));
  gap:12px;
}

.exam-info div{
  background:#f8fafc;
  border-radius:9px;
  padding:13px 10px;
  text-align:center;
}

.exam-info small{
  display:block;
  color:#64748b;
  font-size:11px;
  margin-bottom:6px;
}

.exam-info strong{
  color:#020617;
  font-size:13px;
  font-weight:800;
}

/* EMPTY */
.empty{
  text-align:center;
  padding:60px 20px;
  color:#64748b;
}

.empty h2{
  color:#0f172a;
  margin-bottom:10px;
}

/* MODALS */
.preview-overlay,
.dialog-overlay{
  position:fixed;
  inset:0;
  background:rgba(15,23,42,.55);
  backdrop-filter:blur(6px);
  display:flex;
  justify-content:center;
  align-items:center;
  z-index:9999;
}

.preview-modal,
.dialog{
  background:white;
  border-radius:18px;
  box-shadow:0 20px 60px rgba(0,0,0,.25);
}

.preview-modal{
  width:900px;
  max-width:95%;
  max-height:90vh;
  overflow-y:auto;
  padding:28px;
}

.preview-header{
  display:flex;
  justify-content:space-between;
  align-items:center;
  margin-bottom:22px;
}

.close-btn{
  width:40px;
  height:40px;
  border:none;
  border-radius:50%;
  cursor:pointer;
}

.preview-info{
  display:grid;
  grid-template-columns:repeat(4,1fr);
  gap:14px;
  margin-bottom:24px;
}

.preview-info div,
.dialog-info div{
  background:#f8fafc;
  border-radius:10px;
  padding:14px;
  text-align:center;
}

.question-preview h3{
  color:#16a34a;
  margin-bottom:12px;
}

.question-preview p{
  font-size:17px;
  font-weight:600;
  margin-bottom:18px;
}

.option{
  border:1px solid #e2e8f0;
  border-radius:9px;
  padding:13px;
  margin-bottom:10px;
}

.preview-footer{
  margin-top:25px;
  display:flex;
  justify-content:space-between;
  align-items:center;
}

.preview-footer button,
.start-btn{
  border:none;
  background:#16a34a;
  color:white;
  padding:12px 20px;
  border-radius:8px;
  font-weight:700;
  cursor:pointer;
}

.dialog{
  width:500px;
  max-width:95%;
  padding:32px;
  text-align:center;
}

.dialog-icon{
  width:72px;
  height:72px;
  margin:0 auto 18px;
  border-radius:50%;
  background:#16a34a;
  color:white;
  display:flex;
  align-items:center;
  justify-content:center;
  font-size:28px;
}

.dialog p{
  color:#64748b;
  line-height:1.6;
  margin:14px 0 22px;
}

.dialog-info{
  display:grid;
  grid-template-columns:repeat(2,1fr);
  gap:12px;
  margin-bottom:24px;
}

.dialog-buttons{
  display:flex;
  gap:12px;
}

.cancel-btn,
.start-btn{
  flex:1;
}

.cancel-btn{
  border:none;
  background:#e5e7eb;
  padding:12px;
  border-radius:8px;
  font-weight:700;
  cursor:pointer;
}

/* RESPONSIVE */
@media(max-width:1024px){
  .stats{
    grid-template-columns:repeat(2,1fr);
  }

  .preview-info{
    grid-template-columns:repeat(2,1fr);
  }
}

@media(max-width:768px){
  .dashboard{
    padding:18px;
  }

  .dashboard-header,
  .exam-header,
  .exam-title{
    flex-direction:column;
    align-items:flex-start;
  }

  .filters{
    width:100%;
    flex-direction:column;
  }

  .filters input,
  .filters select{
    width:100%;
  }

  .buttons,
  .buttons button{
    width:100%;
  }

  .stats,
  .exam-info,
  .preview-info,
  .dialog-info{
    grid-template-columns:1fr;
  }

  .dialog-buttons{
    flex-direction:column;
  }
}
</style>