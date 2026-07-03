<template>
  <div class="analysis-detail-page">

   
    <div class="page-header">
      <div>
        <button class="back-btn" @click="$router.back()">
          ← Back
        </button>

        <h1>Item Analysis</h1>
        <p>{{ exam.title }} • {{ exam.course }}</p>
      </div>

      <button class="export-btn" @click="exportCSV">
        ⬇ Export Analysis
      </button>
    </div>

  
    <div class="summary-grid">
      <div class="summary-card">
        <small>Total Questions</small>
        <h2>{{ totalQuestions }}</h2>
      </div>

      <div class="summary-card">
        <small>Average Success</small>
        <h2>{{ averageSuccess }}%</h2>
      </div>

      <div class="summary-card">
        <small>Hard Items</small>
        <h2>{{ hardItems }}</h2>
      </div>

      <div class="summary-card">
        <small>Needs Review</small>
        <h2>{{ needsReview }}</h2>
      </div>
    </div>

    
    <div class="filter-panel">
      <div class="filter-buttons">
        <button
          v-for="filter in filters"
          :key="filter"
          :class="{ active: selectedFilter === filter }"
          @click="selectedFilter = filter"
        >
          {{ filter }}
        </button>
      </div>

      <div class="filter-controls">
        <input
          v-model="search"
          type="text"
          placeholder="Search question..."
        >

        <select v-model="sortBy">
          <option value="number">Question Number</option>
          <option value="lowest">Lowest Success</option>
          <option value="highest">Highest Success</option>
          <option value="difficulty">Difficulty</option>
        </select>
      </div>
    </div>

        <!-- DIFFICULTY DISTRIBUTION -->
    <div class="distribution-card">
      <h2>Difficulty Distribution</h2>

      <div
        v-for="item in difficultyDistribution"
        :key="item.label"
        class="distribution-row"
      >
        <div class="distribution-label">
          <span>{{ item.label }}</span>
          <strong>{{ item.count }}</strong>
        </div>

        <div class="distribution-bar">
          <div
            class="distribution-fill"
            :class="item.className"
            :style="{ width: item.percent + '%' }"
          ></div>
        </div>
      </div>
    </div>

    
    <div class="questions-list">
      <div
        v-for="item in filteredItems"
        :key="item.id"
        class="question-card"
      >
        <div class="question-top">
          <div>
            <span class="question-number">Q{{ item.number }}</span>

            <h2>{{ item.question }}</h2>

            <p>{{ item.type }}</p>
          </div>

          <span
            class="difficulty-badge"
            :class="item.difficultyClass"
          >
            {{ item.difficulty }}
          </span>
        </div>

        <div class="analysis-grid">
          <div>
            <small>Success Rate</small>
            <strong>{{ item.successRate }}%</strong>
          </div>

          <div>
            <small>Students Correct</small>
            <strong>{{ item.correct }} / {{ item.total }}</strong>
          </div>

          <div>
            <small>Wrong Answers</small>
            <strong>{{ item.wrong }}</strong>
          </div>

          <div>
            <small>Discrimination</small>
            <strong>{{ item.discrimination }}</strong>
          </div>
        </div>

        <div class="success-section">
          <div class="success-label">
            <span>Success Rate</span>
            <strong>{{ item.successRate }}%</strong>
          </div>

          <div class="success-bar">
            <div
              class="success-fill"
              :class="item.difficultyClass"
              :style="{ width: item.successRate + '%' }"
            ></div>
          </div>
        </div>

        <div class="wrong-answer">
          <small>Most Common Wrong Answer</small>
          <p>{{ item.commonWrongAnswer }}</p>
        </div>

        <div
          class="recommendation"
          :class="item.recommendationClass"
        >
          <strong>{{ item.recommendationTitle }}</strong>
          <p>{{ item.recommendation }}</p>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

const exam = ref({
  id: 1,
  title: 'Quiz 1 - Data Structures',
  course: 'BSIT 3A'
})

const search = ref('')
const selectedFilter = ref('All Questions')
const sortBy = ref('number')

const filters = [
  'All Questions',
  'Easy',
  'Medium',
  'Hard',
  'Very Hard',
  'Needs Review'
]

const items = ref([
  {
    id: 1,
    number: 1,
    question: 'What does HTML stand for?',
    type: 'Multiple Choice',
    successRate: 92,
    correct: 46,
    wrong: 4,
    total: 50,
    discrimination: 0.78,
    commonWrongAnswer: 'B. Home Tool Markup Language'
  },
  {
    id: 2,
    number: 2,
    question: 'Which data structure uses FIFO?',
    type: 'Multiple Choice',
    successRate: 64,
    correct: 32,
    wrong: 18,
    total: 50,
    discrimination: 0.51,
    commonWrongAnswer: 'Stack'
  },
  {
    id: 3,
    number: 3,
    question: 'What is the time complexity of binary search?',
    type: 'Multiple Choice',
    successRate: 41,
    correct: 21,
    wrong: 29,
    total: 50,
    discrimination: 0.33,
    commonWrongAnswer: 'O(n)'
  },
  {
    id: 4,
    number: 4,
    question: 'Which traversal visits the root first?',
    type: 'Multiple Choice',
    successRate: 18,
    correct: 9,
    wrong: 41,
    total: 50,
    discrimination: 0.18,
    commonWrongAnswer: 'Inorder Traversal'
  },
  {
    id: 5,
    number: 5,
    question: 'Which tag creates a paragraph in HTML?',
    type: 'Multiple Choice',
    successRate: 96,
    correct: 48,
    wrong: 2,
    total: 50,
    discrimination: 0.82,
    commonWrongAnswer: '<div>'
  }
])
// ===========================================
// COMPUTED ITEM ANALYSIS
// ===========================================

const analyzedItems = computed(() => {

  return items.value.map(item => {

    let difficulty = ''
    let difficultyClass = ''

    let recommendationTitle = ''
    let recommendation = ''
    let recommendationClass = ''

    if (item.successRate >= 90) {

      difficulty = 'Easy'
      difficultyClass = 'easy'

      recommendationTitle = 'Excellent Question'
      recommendation =
        'Students clearly understood this concept. Keep this question.'

      recommendationClass = 'excellent'

    }

    else if (item.successRate >= 75) {

      difficulty = 'Medium'
      difficultyClass = 'medium'

      recommendationTitle = 'Good Question'
      recommendation =
        'Question performs well. Minor improvements may be considered.'

      recommendationClass = 'good'

    }

    else if (item.successRate >= 50) {

      difficulty = 'Hard'
      difficultyClass = 'hard'

      recommendationTitle = 'Needs Review'
      recommendation =
        'A noticeable number of students answered incorrectly. Review the wording or lesson coverage.'

      recommendationClass = 'review'

    }

    else {

      difficulty = 'Very Hard'
      difficultyClass = 'very-hard'

      recommendationTitle = 'Replace Question'
      recommendation =
        'Very low success rate. Consider revising or replacing this question.'

      recommendationClass = 'replace'

    }

    return {

      ...item,

      difficulty,

      difficultyClass,

      recommendationTitle,

      recommendation,

      recommendationClass

    }

  })

})



const totalQuestions = computed(() => analyzedItems.value.length)

const averageSuccess = computed(() => {

  const total = analyzedItems.value.reduce(

    (sum, item) => sum + item.successRate,

    0

  )

  return Math.round(total / analyzedItems.value.length)

})

const hardItems = computed(() =>

  analyzedItems.value.filter(

    item =>

      item.difficulty === 'Hard' ||

      item.difficulty === 'Very Hard'

  ).length

)

const needsReview = computed(() =>

  analyzedItems.value.filter(

    item =>

      item.recommendationTitle !== 'Excellent Question'

  ).length

)

// ===========================================
// DIFFICULTY CHART
// ===========================================

const difficultyDistribution = computed(() => {

  const easy = analyzedItems.value.filter(i => i.difficulty === 'Easy').length

  const medium = analyzedItems.value.filter(i => i.difficulty === 'Medium').length

  const hard = analyzedItems.value.filter(i => i.difficulty === 'Hard').length

  const veryHard = analyzedItems.value.filter(i => i.difficulty === 'Very Hard').length

  const total = analyzedItems.value.length

  return [

    {
      label: 'Easy',
      count: easy,
      percent: easy / total * 100,
      className: 'easy'
    },

    {
      label: 'Medium',
      count: medium,
      percent: medium / total * 100,
      className: 'medium'
    },

    {
      label: 'Hard',
      count: hard,
      percent: hard / total * 100,
      className: 'hard'
    },

    {
      label: 'Very Hard',
      count: veryHard,
      percent: veryHard / total * 100,
      className: 'very-hard'
    }

  ]

})

// ===========================================
// FILTER + SEARCH + SORT
// ===========================================

const filteredItems = computed(() => {

  let result = [...analyzedItems.value]

  if (selectedFilter.value !== 'All Questions') {

    if (selectedFilter.value === 'Needs Review') {

      result = result.filter(
        item => item.recommendationTitle !== 'Excellent Question'
      )

    } else {

      result = result.filter(
        item => item.difficulty === selectedFilter.value
      )

    }

  }

  if (search.value.trim() !== '') {

    result = result.filter(
      item =>
        item.question
          .toLowerCase()
          .includes(search.value.toLowerCase())
    )

  }

  if (sortBy.value === 'number') {

    result.sort((a, b) => a.number - b.number)

  }

  if (sortBy.value === 'lowest') {

    result.sort((a, b) => a.successRate - b.successRate)

  }

  if (sortBy.value === 'highest') {

    result.sort((a, b) => b.successRate - a.successRate)

  }

  if (sortBy.value === 'difficulty') {

    const order: Record<string, number> = {
      'Very Hard': 1,
      'Hard': 2,
      'Medium': 3,
      'Easy': 4
    }

   result.sort((a, b) => {
  return (order[a.difficulty as keyof typeof order] || 99) -
         (order[b.difficulty as keyof typeof order] || 99)
})

  }

  return result

})

// ===========================================
// EXPORT CSV
// ===========================================

function exportCSV() {

  const headers = [
    'Question Number',
    'Question',
    'Type',
    'Success Rate',
    'Correct',
    'Wrong',
    'Difficulty',
    'Discrimination',
    'Most Common Wrong Answer',
    'Recommendation'
  ]

  const rows = analyzedItems.value.map(item => [
    item.number,
    `"${item.question}"`,
    item.type,
    item.successRate + '%',
    item.correct,
    item.wrong,
    item.difficulty,
    item.discrimination,
    `"${item.commonWrongAnswer}"`,
    `"${item.recommendationTitle}: ${item.recommendation}"`
  ])

  const csv = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n')

  const blob = new Blob(
    [csv],
    { type: 'text/csv;charset=utf-8;' }
  )

  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')

  link.href = url

  link.download = 'Item_Analysis_Report.csv'

  link.click()

  URL.revokeObjectURL(url)

}
</script>

<style scoped>

/* ==========================================
   GLOBAL
========================================== */

*{

    margin:0;

    padding:0;

    box-sizing:border-box;

}

.analysis-detail-page{

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

    align-items:flex-start;

    gap:20px;

    margin-bottom:30px;

}

.back-btn{

    border:none;

    background:#eef2ff;

    color:#1e40af;

    padding:10px 18px;

    border-radius:10px;

    cursor:pointer;

    font-weight:600;

    margin-bottom:18px;

    transition:.25s;

}

.back-btn:hover{

    background:#dbeafe;

}

.page-header h1{

    color:#112244;

    font-size:38px;

    margin-bottom:8px;

}

.page-header p{

    color:#666;

}

.export-btn{

    border:none;

    background:#16a34a;

    color:white;

    padding:14px 22px;

    border-radius:12px;

    cursor:pointer;

    font-weight:600;

    transition:.25s;

}

.export-btn:hover{

    background:#15803d;

}

/* ==========================================
   SUMMARY
========================================== */

.summary-grid{

    display:grid;

    grid-template-columns:repeat(4,1fr);

    gap:20px;

    margin-bottom:30px;

}

.summary-card{

    background:white;

    border-radius:18px;

    padding:24px;

    box-shadow:0 8px 25px rgba(0,0,0,.06);

}

.summary-card small{

    color:#666;

}

.summary-card h2{

    margin-top:10px;

    font-size:34px;

    color:#112244;

}

/* ==========================================
   FILTER PANEL
========================================== */

.filter-panel{

    background:white;

    border-radius:18px;

    padding:24px;

    box-shadow:0 8px 25px rgba(0,0,0,.06);

    margin-bottom:30px;

}

.filter-buttons{

    display:flex;

    flex-wrap:wrap;

    gap:12px;

    margin-bottom:20px;

}

.filter-buttons button{

    border:none;

    background:#eef2f7;

    color:#555;

    padding:12px 20px;

    border-radius:999px;

    cursor:pointer;

    transition:.25s;

    font-weight:600;

}

.filter-buttons button:hover{

    background:#dbeafe;

}

.filter-buttons button.active{

    background:#16a34a;

    color:white;

}

.filter-controls{

    display:flex;

    gap:15px;

}

.filter-controls input{

    flex:1;

    padding:14px;

    border:1px solid #ddd;

    border-radius:10px;

    outline:none;

}

.filter-controls select{

    width:240px;

    padding:14px;

    border:1px solid #ddd;

    border-radius:10px;

    outline:none;

}

/* ==========================================
   DIFFICULTY DISTRIBUTION
========================================== */

.distribution-card{

    background:white;

    border-radius:18px;

    padding:24px;

    box-shadow:0 8px 25px rgba(0,0,0,.06);

    margin-bottom:30px;

}

.distribution-card h2{

    color:#112244;

    margin-bottom:20px;

}

.distribution-row{

    margin-bottom:18px;

}

.distribution-label{

    display:flex;

    justify-content:space-between;

    margin-bottom:8px;

}

.distribution-bar{

    width:100%;

    height:10px;

    background:#edf2f7;

    border-radius:999px;

    overflow:hidden;

}

.distribution-fill{

    height:100%;

    border-radius:999px;

}

.distribution-fill.easy{

    background:#22c55e;

}

.distribution-fill.medium{

    background:#facc15;

}

.distribution-fill.hard{

    background:#fb923c;

}

.distribution-fill.very-hard{

    background:#ef4444;

}

/* ==========================================
   QUESTION LIST
========================================== */

.questions-list{

    display:flex;

    flex-direction:column;

    gap:24px;

}

/* ==========================================
   QUESTION CARD
========================================== */

.question-card{

    background:white;

    border-radius:20px;

    padding:28px;

    box-shadow:0 8px 25px rgba(0,0,0,.06);

    border:1px solid #eef2f7;

    transition:.25s;

}

.question-card:hover{

    transform:translateY(-3px);

    box-shadow:0 14px 35px rgba(0,0,0,.08);

}

/* ==========================================
   QUESTION HEADER
========================================== */

.question-top{

    display:flex;

    justify-content:space-between;

    gap:20px;

    margin-bottom:24px;

}

.question-number{

    display:inline-block;

    background:#eef2ff;

    color:#1d4ed8;

    padding:7px 14px;

    border-radius:999px;

    font-weight:700;

    margin-bottom:12px;

}

.question-top h2{

    color:#112244;

    font-size:22px;

    margin-bottom:8px;

}

.question-top p{

    color:#777;

}

/* ==========================================
   DIFFICULTY BADGES
========================================== */

.difficulty-badge{

    height:max-content;

    padding:8px 16px;

    border-radius:999px;

    font-size:13px;

    font-weight:700;

    white-space:nowrap;

}

.difficulty-badge.easy{

    background:#dcfce7;

    color:#15803d;

}

.difficulty-badge.medium{

    background:#fef9c3;

    color:#a16207;

}

.difficulty-badge.hard{

    background:#ffedd5;

    color:#c2410c;

}

.difficulty-badge.very-hard{

    background:#fee2e2;

    color:#dc2626;

}

/* ==========================================
   ANALYSIS GRID
========================================== */

.analysis-grid{

    display:grid;

    grid-template-columns:repeat(4,1fr);

    gap:16px;

    margin-bottom:24px;

}

.analysis-grid div{

    background:#f8fafc;

    border-radius:14px;

    padding:16px;

}

.analysis-grid small{

    display:block;

    color:#777;

    margin-bottom:8px;

}

.analysis-grid strong{

    color:#112244;

}

/* ==========================================
   SUCCESS RATE
========================================== */

.success-section{

    margin-bottom:24px;

}

.success-label{

    display:flex;

    justify-content:space-between;

    margin-bottom:10px;

}

.success-label span{

    color:#555;

    font-weight:600;

}

.success-label strong{

    color:#112244;

}

.success-bar{

    height:12px;

    background:#edf2f7;

    border-radius:999px;

    overflow:hidden;

}

.success-fill{

    height:100%;

    border-radius:999px;

    transition:.4s;

}

.success-fill.easy{

    background:#22c55e;

}

.success-fill.medium{

    background:#facc15;

}

.success-fill.hard{

    background:#fb923c;

}

.success-fill.very-hard{

    background:#ef4444;

}

/* ==========================================
   WRONG ANSWER
========================================== */

.wrong-answer{

    background:#f8fafc;

    border-radius:14px;

    padding:18px;

    margin-bottom:20px;

}

.wrong-answer small{

    display:block;

    color:#777;

    margin-bottom:8px;

}

.wrong-answer p{

    color:#112244;

    font-weight:600;

}

/* ==========================================
   RECOMMENDATION
========================================== */

.recommendation{

    border-radius:14px;

    padding:18px;

    border-left:6px solid;

}

.recommendation strong{

    display:block;

    margin-bottom:8px;

}

.recommendation p{

    line-height:1.6;

}

.recommendation.excellent{

    background:#f0fdf4;

    border-color:#22c55e;

    color:#166534;

}

.recommendation.good{

    background:#eff6ff;

    border-color:#2563eb;

    color:#1d4ed8;

}

.recommendation.review{

    background:#fff7ed;

    border-color:#fb923c;

    color:#c2410c;

}

.recommendation.replace{

    background:#fef2f2;

    border-color:#ef4444;

    color:#b91c1c;

}

/* ==========================================
   RESPONSIVE
========================================== */

@media(max-width:1100px){

    .summary-grid{

        grid-template-columns:repeat(2,1fr);

    }

    .analysis-grid{

        grid-template-columns:repeat(2,1fr);

    }

}

@media(max-width:768px){

    .analysis-detail-page{

        padding:20px;

    }

    .page-header{

        flex-direction:column;

        align-items:flex-start;

    }

    .export-btn{

        width:100%;

    }

    .filter-controls{

        flex-direction:column;

    }

    .filter-controls select{

        width:100%;

    }

    .question-top{

        flex-direction:column;

    }

}

@media(max-width:500px){

    .summary-grid{

        grid-template-columns:1fr;

    }

    .analysis-grid{

        grid-template-columns:1fr;

    }

    .page-header h1{

        font-size:28px;

    }

    .question-top h2{

        font-size:18px;

    }

}

</style>