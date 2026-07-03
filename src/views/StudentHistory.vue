<template>
  <div class="history-page">

    
    <div class="page-header">
      <div>
        <h1>Student History</h1>
        <p>Search a student name to view all exam records.</p>
      </div>
    </div>

    
    <div class="filter-card">

      <input
        v-model="search"
        type="text"
        placeholder="Search student name..."
      >

      <select v-model="selectedSubject">
        <option>All Subjects</option>
        <option
          v-for="subject in subjects"
          :key="subject"
        >
          {{ subject }}
        </option>
      </select>

      <select v-model="selectedExamType">
        <option>All Exam Types</option>
        <option>Quiz</option>
        <option>Midterm</option>
        <option>Final</option>
      </select>

    </div>

    
    <div
      v-if="search.trim() !== '' && filteredHistory.length"
      class="summary-card"
    >
      <h2>{{ searchedStudentName }}</h2>

      <div class="summary-grid">
        <div>
          <small>Total Exams Taken</small>
          <strong>{{ studentSummary.total }}</strong>
        </div>

        <div>
          <small>Average Score</small>
          <strong>{{ studentSummary.average }}%</strong>
        </div>

        <div>
          <small>Highest Score</small>
          <strong>{{ studentSummary.highest }}%</strong>
        </div>

        <div>
          <small>Lowest Score</small>
          <strong>{{ studentSummary.lowest }}%</strong>
        </div>
      </div>
    </div>

    
    <div class="table-card">
      <table>
        <thead>
          <tr>
            <th>Student Name</th>
            <th>Subject</th>
            <th>Examination</th>
            <th>Score</th>
            <th>Date & Time</th>
          </tr>
        </thead>

        <tbody>
          <tr
            v-for="record in filteredHistory"
            :key="record.id"
          >
            <td>{{ record.studentName }}</td>
            <td>{{ record.subject }}</td>
            <td>{{ record.exam }}</td>
            <td>
              <strong>
                {{ record.score }} / {{ record.totalItems }}
                ({{ record.percentage }}%)
              </strong>
            </td>
            <td>{{ record.dateTime }}</td>
          </tr>
        </tbody>
      </table>

      <div
        v-if="filteredHistory.length === 0"
        class="empty"
      >
        No student history found.
      </div>
    </div>

  </div>
</template>


<script setup lang="ts">
import { ref, computed } from 'vue'

const search = ref('')
const selectedSubject = ref('All Subjects')
const selectedExamType = ref('All Exam Types')

const history = ref([
  {
    id: 1,
    studentName: 'Juan Dela Cruz',
    subject: 'App Dev 2',
    exam: 'Midterm',
    examType: 'Midterm',
    score: 17,
    totalItems: 20,
    percentage: 85,
    dateTime: 'July 3, 2026 • 10:42:15 AM'
  },
  {
    id: 2,
    studentName: 'Juan Dela Cruz',
    subject: 'Networking',
    exam: 'Quiz 1',
    examType: 'Quiz',
    score: 19,
    totalItems: 20,
    percentage: 95,
    dateTime: 'July 1, 2026 • 8:15:42 AM'
  },
  {
    id: 3,
    studentName: 'Juan Dela Cruz',
    subject: 'Data Structures',
    exam: 'Final Exam',
    examType: 'Final',
    score: 42,
    totalItems: 50,
    percentage: 84,
    dateTime: 'June 28, 2026 • 2:34:18 PM'
  },
  {
    id: 4,
    studentName: 'Maria Santos',
    subject: 'App Dev 2',
    exam: 'Midterm',
    examType: 'Midterm',
    score: 18,
    totalItems: 20,
    percentage: 90,
    dateTime: 'July 3, 2026 • 10:50:03 AM'
  },
  {
    id: 5,
    studentName: 'Carlos Reyes',
    subject: 'Networking',
    exam: 'Quiz 1',
    examType: 'Quiz',
    score: 14,
    totalItems: 20,
    percentage: 70,
    dateTime: 'July 1, 2026 • 8:22:11 AM'
  }
])

const subjects = computed(() => {
  return [...new Set(history.value.map(item => item.subject))]
})

const filteredHistory = computed(() => {
  return history.value.filter(record => {
    const matchName =
      record.studentName
        .toLowerCase()
        .includes(search.value.toLowerCase())

    const matchSubject =
      selectedSubject.value === 'All Subjects' ||
      record.subject === selectedSubject.value

    const matchExamType =
      selectedExamType.value === 'All Exam Types' ||
      record.examType === selectedExamType.value

    return matchName && matchSubject && matchExamType
  })
})

const searchedStudentName = computed(() => {
  return filteredHistory.value[0]?.studentName || ''
})

const studentSummary = computed(() => {
  const records = filteredHistory.value

  if (!records.length) {
    return {
      total: 0,
      average: 0,
      highest: 0,
      lowest: 0
    }
  }

  const scores = records.map(record => record.percentage)

  const total = records.length
  const average = Math.round(
    scores.reduce((sum, score) => sum + score, 0) / total
  )

  const highest = Math.max(...scores)
  const lowest = Math.min(...scores)

  return {
    total,
    average,
    highest,
    lowest
  }
})
</script>

<style scoped>
.history-page{
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

.summary-card{
  background:white;
  padding:22px;
  border-radius:18px;
  margin-bottom:25px;
  box-shadow:0 8px 20px rgba(0,0,0,.06);
}

.summary-card h2{
  color:#112244;
  margin-bottom:18px;
}

.summary-grid{
  display:grid;
  grid-template-columns:repeat(4,1fr);
  gap:15px;
}

.summary-grid div{
  background:#f8fafc;
  padding:16px;
  border-radius:12px;
}

.summary-grid small{
  display:block;
  color:#777;
  margin-bottom:8px;
}

.summary-grid strong{
  color:#112244;
  font-size:20px;
}

.table-card{
  background:white;
  border-radius:18px;
  overflow:hidden;
  box-shadow:0 8px 20px rgba(0,0,0,.06);
}

table{
  width:100%;
  border-collapse:collapse;
}

thead{
  background:#112244;
  color:white;
}

th,
td{
  padding:17px;
  text-align:left;
  border-bottom:1px solid #eee;
}

tbody tr:hover{
  background:#f8fafc;
}

td strong{
  color:#112244;
}

.empty{
  text-align:center;
  padding:40px;
  color:#777;
}

@media(max-width:900px){
  .filter-card{
    flex-direction:column;
  }

  .summary-grid{
    grid-template-columns:repeat(2,1fr);
  }

  .table-card{
    overflow-x:auto;
  }

  table{
    min-width:800px;
  }
}

@media(max-width:500px){
  .history-page{
    padding:18px;
  }

  .summary-grid{
    grid-template-columns:1fr;
  }

  .page-header h1{
    font-size:28px;
  }
}
</style>