<template>
  <div class="results-page">

    <div class="page-header">
      <div>
        <h1>Exam Results</h1>
        <p>{{ exam.title }}</p>
      </div>

      <div class="header-buttons">
        <button class="analysis-btn" @click="goToItemAnalysis">
          📊 Item Analysis
        </button>

        <button class="export-btn" @click="exportCSV">
          ⬇ Export Results
        </button>
      </div>
    </div>

    <div class="stats">
      <div class="card">
        <div>
          <small>Total Students</small>
          <h2>{{ totalStudents }}</h2>
        </div>
        <div class="icon blue">🏆</div>
      </div>

      <div class="card">
        <div>
          <small>Average Score</small>
          <h2 class="blue-text">{{ averageScore }}%</h2>
        </div>
        <div class="icon light-blue">📊</div>
      </div>

      <div class="card">
        <div>
          <small>Pass Rate</small>
          <h2 class="green-text">{{ passRate }}%</h2>
        </div>
        <div class="icon green">✅</div>
      </div>

      <div class="card">
        <div>
          <small>Highest Score</small>
          <h2 class="purple-text">{{ highestScore }}%</h2>
        </div>
        <div class="icon purple">🏅</div>
      </div>
    </div>

    <div class="results-table">
      <table>
        <thead>
          <tr>
            <th>Rank</th>
            <th>Student</th>
            <th>Score</th>
            <th>Correct</th>
            <th>Wrong</th>
            <th>Time Spent</th>
            <th>Performance</th>
            <th>Submitted</th>
          </tr>
        </thead>

        <tbody>
          <tr
            v-for="(student,index) in rankedStudents"
            :key="student.id"
          >
            <td class="rank">
              <span v-if="index===0" class="gold">🥇</span>
              <span v-else-if="index===1" class="silver">🥈</span>
              <span v-else-if="index===2" class="bronze">🥉</span>
              <span v-else class="rank-number">{{ index + 1 }}</span>
            </td>

            <td>{{ student.name }}</td>

            <td>
              <strong>{{ student.score }}%</strong>
              <br>
              <small>{{ student.correct }}/{{ exam.totalQuestions }}</small>
            </td>

            <td class="correct">✔ {{ student.correct }}</td>
            <td class="wrong">✖ {{ student.wrong }}</td>
            <td>{{ student.timeSpent }}</td>

            <td>
              <span class="badge" :class="student.performanceClass">
                {{ student.performance }}
              </span>
            </td>

            <td>{{ student.submitted }}</td>
          </tr>
        </tbody>
      </table>

      <div v-if="rankedStudents.length === 0" class="empty-results">
        No submitted results yet.
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import api from '../services/api'

const router = useRouter()
const route = useRoute()

const exam = ref({
    id: 0,
    title: '',
    totalQuestions: 0,
    passingScore: 75
})

const students = ref<any[]>([])

async function fetchResults() {
    try {

        const examId = route.params.id

        const response = await api.get(`/exams/${examId}/results`)

        exam.value = {
            id: response.data.exam.id,
            title: response.data.exam.title,
            totalQuestions: response.data.exam.questions_count ?? 0,
            passingScore: response.data.exam.passing ?? 75
        }

        students.value = response.data.data.map((student:any) => {

            let performance = 'Excellent'
            let performanceClass = 'excellent'

            if (student.percentage < 90) {
                performance = 'Very Good'
                performanceClass = 'very-good'
            }

            if (student.percentage < 80) {
                performance = 'Good'
                performanceClass = 'good'
            }

            if (student.percentage < 70) {
                performance = 'Fair'
                performanceClass = 'fair'
            }

            if (student.percentage < 60) {
                performance = 'Failed'
                performanceClass = 'failed'
            }

            return {
                id: student.id,
                name: student.student_name,
                score: Number(student.percentage),
                correct: student.correct,
                wrong: student.wrong,
                timeSpent: student.time_spent
                    ? `${student.time_spent} sec`
                    : '-',
                submitted: student.submitted_at
                    ? new Date(student.submitted_at).toLocaleTimeString()
                    : '-',
                performance,
                performanceClass
            }

        })

    } catch (error) {

        console.error(error)

        alert('Failed to load exam results.')

    }
}

const rankedStudents = computed(() => {
    return [...students.value].sort((a, b) => b.score - a.score)
})

const totalStudents = computed(() => students.value.length)

const highestScore = computed(() => {
    if (students.value.length === 0) return 0
    return Math.max(...students.value.map(s => s.score))
})

const averageScore = computed(() => {
    if (students.value.length === 0) return 0

    const total = students.value.reduce(
        (sum, s) => sum + s.score,
        0
    )

    return Number((total / students.value.length).toFixed(1))
})

const passRate = computed(() => {

    if (students.value.length === 0) return 0

    const passed = students.value.filter(
        s => s.score >= exam.value.passingScore
    ).length

    return Math.round(
        (passed / students.value.length) * 100
    )

})

function goToItemAnalysis() {
    router.push(`/faculty/item-analysis/${exam.value.id}`)
}

function exportCSV() {

    const headers = [
        'Rank',
        'Student',
        'Score',
        'Correct',
        'Wrong',
        'Time Spent',
        'Performance',
        'Submitted'
    ]

    const rows = rankedStudents.value.map((student, index) => [

        index + 1,
        student.name,
        student.score + '%',
        student.correct,
        student.wrong,
        student.timeSpent,
        student.performance,
        student.submitted

    ])

    const csv = [
        headers.join(','),
        ...rows.map(r => r.join(','))
    ].join('\n')

    const blob = new Blob(
        [csv],
        {
            type: 'text/csv;charset=utf-8;'
        }
    )

    const url = URL.createObjectURL(blob)

    const link = document.createElement('a')

    link.href = url
    link.download = `${exam.value.title}_Results.csv`

    link.click()

    URL.revokeObjectURL(url)
}

onMounted(() => {
    fetchResults()
})
</script>

<style scoped>



*{

    margin:0;

    padding:0;

    box-sizing:border-box;

}

.results-page{

    min-height:100vh;

    background:#f5f7fb;

    padding:30px;

    font-family:'Poppins',sans-serif;

}

/* ==========================================
   HEADER
========================================== */

.page-header{

    display:flex;

    justify-content:space-between;

    align-items:center;

    margin-bottom:30px;

}

.page-header h1{

    color:#112244;

    font-size:36px;

    margin-bottom:8px;

}

.page-header p{

    color:#666;

    font-size:15px;

}

.header-buttons{

    display:flex;

    gap:15px;

}

.analysis-btn{

    border:none;

    background:#2563eb;

    color:white;

    padding:14px 22px;

    border-radius:10px;

    cursor:pointer;

    font-weight:600;

    transition:.25s;

}

.analysis-btn:hover{

    background:#1d4ed8;

}

.export-btn{

    border:none;

    background:#16a34a;

    color:white;

    padding:14px 22px;

    border-radius:10px;

    cursor:pointer;

    font-weight:600;

    transition:.25s;

}

.export-btn:hover{

    background:#15803d;

}

/* ==========================================
   STATS
========================================== */

.stats{

    display:grid;

    grid-template-columns:repeat(4,1fr);

    gap:20px;

    margin-bottom:30px;

}

.card{

    background:white;

    border-radius:18px;

    padding:25px;

    display:flex;

    justify-content:space-between;

    align-items:center;

    box-shadow:0 8px 20px rgba(0,0,0,.06);

}

.card small{

    color:#666;

}

.card h2{

    margin-top:10px;

    font-size:34px;

}

.icon{

    width:60px;

    height:60px;

    border-radius:16px;

    display:flex;

    justify-content:center;

    align-items:center;

    font-size:28px;

}

.blue{

    background:#dbeafe;

}

.light-blue{

    background:#e0f2fe;

}

.green{

    background:#dcfce7;

}

.purple{

    background:#ede9fe;

}

.blue-text{

    color:#2563eb;

}

.green-text{

    color:#16a34a;

}

.purple-text{

    color:#7c3aed;

}

/* ==========================================
   TABLE CONTAINER
========================================== */

.results-table{

    background:white;

    border-radius:18px;

    overflow:hidden;

    box-shadow:0 8px 20px rgba(0,0,0,.06);

}

/* ==========================================
   TABLE
========================================== */

table{

    width:100%;

    border-collapse:collapse;

}

thead{

    background:#112244;

    color:white;

}

thead th{

    padding:18px;

    text-align:left;

    font-size:14px;

    font-weight:600;

}

tbody td{

    padding:18px;

    border-bottom:1px solid #eeeeee;

    font-size:15px;

    color:#333;

}

tbody tr{

    transition:.25s;

}

tbody tr:hover{

    background:#f8fafc;

}

/* ==========================================
   RANK
========================================== */

.rank{

    font-size:22px;

    font-weight:700;

}

.rank-number{

    color:#666;

}

.gold{

    font-size:24px;

}

.silver{

    font-size:24px;

}

.bronze{

    font-size:24px;

}

/* ==========================================
   SCORE
========================================== */

.correct{

    color:#16a34a;

    font-weight:600;

}

.wrong{

    color:#dc2626;

    font-weight:600;

}

/* ==========================================
   PERFORMANCE BADGES
========================================== */

.badge{

    display:inline-block;

    padding:8px 14px;

    border-radius:999px;

    font-size:13px;

    font-weight:600;

}

.excellent{

    background:#dcfce7;

    color:#166534;

}

.very-good{

    background:#dbeafe;

    color:#1d4ed8;

}

.good{

    background:#fef9c3;

    color:#a16207;

}

.fair{

    background:#fed7aa;

    color:#c2410c;

}

.failed{

    background:#fee2e2;

    color:#dc2626;

}

.empty-results{
  text-align:center;
  padding:35px;
  color:#777;
}

/* ==========================================
   RESPONSIVE
========================================== */

@media(max-width:1200px){

.stats{

    grid-template-columns:repeat(2,1fr);

}

.results-table{

    overflow-x:auto;

}

table{

    min-width:950px;

}

}

@media(max-width:768px){

.results-page{

    padding:20px;

}

.page-header{

    flex-direction:column;

    align-items:flex-start;

    gap:20px;

}

.header-buttons{

    width:100%;

    flex-direction:column;

}

.header-buttons button{

    width:100%;

}

.stats{

    grid-template-columns:1fr;

}

.page-header h1{

    font-size:30px;

}

.card h2{

    font-size:28px;

}

}

@media(max-width:480px){

.results-page{

    padding:15px;

}

thead th{

    font-size:13px;

}

tbody td{

    font-size:13px;

    padding:14px;

}

}

</style>

