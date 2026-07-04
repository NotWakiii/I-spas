<template>
  <div class="analysis-page">

    <!-- HEADER -->
    <div class="page-header">
      <div>
        <h1>Item Analysis</h1>
        <p>Select an exam to view question performance analysis.</p>
      </div>
    </div>

    <!-- FILTERS -->
    <div class="filter-card">
      <input
        v-model="search"
        type="text"
        placeholder="Search exam..."
      >

      <select v-model="selectedCourse">
        <option>All Courses</option>
        <option
          v-for="course in courses"
          :key="course"
        >
          {{ course }}
        </option>
      </select>
    </div>

    <!-- EXAM LIST -->
    <div class="exam-grid">
      <div
        v-for="exam in filteredExams"
        :key="exam.id"
        class="exam-card"
      >
        <div class="exam-top">
          <div>
            <h2>{{ exam.title }}</h2>
            <p>{{ exam.course }}</p>
          </div>

          <span class="badge">
            {{ exam.type }}
          </span>
        </div>

        <div class="exam-stats">
          <div>
            <small>Questions</small>
            <strong>{{ exam.questions }}</strong>
          </div>

          <div>
            <small>Students</small>
            <strong>{{ exam.students }}</strong>
          </div>

          <div>
            <small>Avg. Success</small>
            <strong>{{ exam.success }}%</strong>
          </div>

          <div>
            <small>Hard Items</small>
            <strong>{{ exam.hardItems }}</strong>
          </div>
        </div>

        <button
          class="view-btn"
          @click="viewAnalysis(exam.id)"
        >
          View Analysis
        </button>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '../services/api'

const router = useRouter()

const search = ref('')
const selectedCourse = ref('All Courses')
const exams = ref<any[]>([])

async function fetchExams() {
  try {
    const response = await api.get('/exams')

    exams.value = response.data.data
      .filter((exam:any) => exam.status === 'finished')
      .map((exam:any) => {

        const questions = exam.questions || []

        return {
          id: exam.id,
          title: exam.title,
          course: exam.course || 'No Course',
          type: 'Finished',
          questions: questions.length,
          students: 0,
          success: 0,
          hardItems: 0
        }

      })

  } catch (error) {
    console.error(error)
    alert('Failed to load exams.')
  }
}

const courses = computed(() => {
  return [...new Set(exams.value.map(exam => exam.course))]
})

const filteredExams = computed(() => {
  return exams.value.filter(exam => {
    const matchCourse =
      selectedCourse.value === 'All Courses' ||
      exam.course === selectedCourse.value

    const matchSearch =
      exam.title.toLowerCase().includes(search.value.toLowerCase())

    return matchCourse && matchSearch
  })
})

function viewAnalysis(id: number) {
  router.push(`/faculty/item-analysis/${id}`)
}

onMounted(() => {
  fetchExams()
})
</script>

<style scoped>
.analysis-page{
  min-height:100vh;
  background:#f5f7fb;
  padding:30px;
  font-family:'Poppins',sans-serif;
}

.page-header{
  margin-bottom:25px;
}

.page-header h1{
  color:#112244;
  font-size:36px;
  margin-bottom:8px;
}

.page-header p{
  color:#666;
}

.filter-card{
  background:white;
  padding:20px;
  border-radius:16px;
  display:flex;
  gap:15px;
  margin-bottom:25px;
  box-shadow:0 8px 20px rgba(0,0,0,.06);
}

.filter-card input,
.filter-card select{
  padding:13px 15px;
  border:1px solid #ddd;
  border-radius:10px;
  outline:none;
}

.filter-card input{
  flex:1;
}

.exam-grid{
  display:grid;
  grid-template-columns:repeat(auto-fit,minmax(320px,1fr));
  gap:20px;
}

.exam-card{
  background:white;
  padding:22px;
  border-radius:18px;
  box-shadow:0 8px 20px rgba(0,0,0,.06);
}

.exam-top{
  display:flex;
  justify-content:space-between;
  gap:15px;
  margin-bottom:20px;
}

.exam-top h2{
  color:#112244;
  font-size:22px;
  margin-bottom:6px;
}

.exam-top p{
  color:#666;
}

.badge{
  background:#dcfce7;
  color:#15803d;
  padding:6px 14px;
  border-radius:999px;
  font-weight:600;
  height:max-content;
}

.exam-stats{
  display:grid;
  grid-template-columns:repeat(2,1fr);
  gap:15px;
  margin-bottom:20px;
}

.exam-stats div{
  background:#f8fafc;
  padding:14px;
  border-radius:12px;
}

.exam-stats small{
  display:block;
  color:#777;
  margin-bottom:6px;
}

.exam-stats strong{
  color:#112244;
}

.view-btn{
  width:100%;
  border:none;
  background:#16a34a;
  color:white;
  padding:14px;
  border-radius:12px;
  cursor:pointer;
  font-weight:600;
}

.view-btn:hover{
  background:#15803d;
}

@media(max-width:700px){
  .filter-card{
    flex-direction:column;
  }

  .exam-top{
    flex-direction:column;
  }
}
</style>