<template>
  <div class="student-results-page">

    <!-- ==========================================
         LOADING SCREEN
    =========================================== -->

    <div
      v-if="loading"
      class="state-screen"
    >
      <div class="state-card">

        <div class="loader"></div>

        <h2>
          Loading Examination Results
        </h2>

        <p>
          Please wait while your result and ranking
          are being prepared.
        </p>

      </div>
    </div>


    <!-- ==========================================
         ERROR SCREEN
    =========================================== -->

    <div
      v-else-if="errorMessage"
      class="state-screen"
    >
      <div class="state-card error-card">

        <div class="state-icon">
          ⚠️
        </div>

        <h2>
          Unable to Load Results
        </h2>

        <p>
          {{ errorMessage }}
        </p>

   <button
  type="button"
  class="retry-btn"
  @click="loadResults()"
>
  Try Again
</button>

      </div>
    </div>


    <!-- ==========================================
         RESULTS CONTENT
    =========================================== -->

    <template v-else>

      <header class="results-header">

        <div class="header-brand">

          <div class="logo-wrapper">

            <img
              src="../../assets/logo.png"
              alt="I-SPAS Logo"
              class="header-logo"
            >

          </div>

          <div class="header-text">

            <span>
              I-SPAS STUDENT PORTAL
            </span>

            <h1>
              Examination Results
            </h1>

          </div>

        </div>

        <div class="live-badge">

          <span class="live-dot"></span>

          LIVE

        </div>

      </header>


      <main class="results-content">

        <!-- ==========================================
             TAB NAVIGATION
        =========================================== -->

        <div class="result-tabs">

          <button
            type="button"
            class="tab-button"
            :class="{
              active:
                activeTab === 'leaderboard'
            }"
            @click="activeTab = 'leaderboard'"
          >

            <span class="tab-icon">
              🏆
            </span>

            Top 5

          </button>

          <button
            type="button"
            class="tab-button"
            :class="{
              active:
                activeTab === 'score'
            }"
            @click="activeTab = 'score'"
          >

            <span class="tab-icon">
              🔒
            </span>

            My Score

            <span class="private-label">
              PRIVATE
            </span>

          </button>

        </div>


        <!-- ==========================================
             MY SCORE TAB
        =========================================== -->

        <section
          v-if="activeTab === 'score'"
          class="score-tab"
        >

          <!-- PRIVATE RESULT CARD -->

          <div
            class="private-result-card"
            :class="
              result.result_status.toLowerCase()
            "
          >

            <div class="score-ring-wrapper">

              <div
                class="score-ring"
                :style="{
                  '--score-angle':
                    `${safePercentage * 3.6}deg`
                }"
              >

                <div class="score-ring-inner">

                  <strong>
                    {{ formatPercentage(result.percentage) }}%
                  </strong>

                  <span>
                    Score
                  </span>

                </div>

              </div>

            </div>

            <div class="private-result-info">

              <span class="private-result-label">

                PRIVATE RESULT

                <span>
                  🔒
                </span>

              </span>

              <h2>
                {{ result.student_name }}
              </h2>

              <p>
                {{ result.exam_title }}
              </p>

              <div
                class="result-badge"
                :class="
                  result.result_status.toLowerCase()
                "
              >

                {{
                  result.result_status === 'Passed'
                    ? '✓ PASSED'
                    : '✕ FAILED'
                }}

              </div>

            </div>

            <div class="result-decoration"></div>

          </div>


          <!-- RESULT STATISTICS -->

          <div class="score-statistics">

            <div class="score-stat-card time-stat">

              <div class="score-stat-icon">
                ◷
              </div>

              <strong>
                {{ formattedMinutes }}
              </strong>

              <span>
                Time
              </span>

            </div>

            <div class="score-stat-card questions-stat">

              <div class="score-stat-icon">
                ▣
              </div>

              <strong>
                {{ result.total_questions }}
              </strong>

              <span>
                Total Questions
              </span>

            </div>

            <div class="score-stat-card correct-stat">

              <div class="score-stat-icon">
                ✓
              </div>

              <strong>
                {{ result.correct_answers }}
              </strong>

              <span>
                Correct
              </span>

            </div>

            <div class="score-stat-card wrong-stat">

              <div class="score-stat-icon">
                ✕
              </div>

              <strong>
                {{ result.wrong_answers }}
              </strong>

              <span>
                Wrong
              </span>

            </div>

          </div>


          <!-- ACCURACY CARD -->

          <div class="accuracy-card">

            <div class="accuracy-header">

              <div>

                <span class="accuracy-icon">
                  ↗
                </span>

                <strong>
                  Overall Accuracy
                </strong>

              </div>

              <div class="accuracy-values">

                <strong>
                  {{ formatPercentage(result.percentage) }}%
                </strong>

                <span>
                  Threshold
                  {{ formatPercentage(result.passing) }}%
                </span>

              </div>

            </div>

            <div class="accuracy-progress">

              <div
                class="accuracy-progress-fill"
                :style="{
                  width:
                    `${safePercentage}%`
                }"
              ></div>

            </div>

          </div>


          <!-- SCORE DETAILS -->

          <div class="score-details-card">

            <div class="score-details-heading">

              <div>

                <span>
                  SCORE DETAILS
                </span>

                <h3>
                  Your Examination Summary
                </h3>

              </div>

              <div class="personal-rank">

                Rank

                <strong>
                  {{
                    result.leaderboard_available && result.rank
                      ? `#${result.rank}`
                      : 'Pending'
                  }}
                </strong>

              </div>

            </div>

            <div class="score-details-grid">

              <div class="score-detail-item">

                <span>
                  Actual Score
                </span>

                <strong>
                  {{ result.score }}
                  /
                  {{ result.total_points }}
                </strong>

              </div>

              <div class="score-detail-item">

                <span>
                  Percentage
                </span>

                <strong>
                  {{ formatPercentage(result.percentage) }}%
                </strong>

              </div>

              <div class="score-detail-item">

                <span>
                  Passing Score
                </span>

                <strong>
                  {{ formatPercentage(result.passing) }}%
                </strong>

              </div>

              <div class="score-detail-item">

                <span>
                  Time Taken
                </span>

                <strong>
                  {{ formattedTimeSpent }}
                </strong>

              </div>

            </div>

          </div>


          <!-- RESULT MESSAGE -->

          <div
            class="result-message-card"
            :class="
              result.result_status.toLowerCase()
            "
          >

            <div class="message-icon">

              {{
                result.result_status === 'Passed'
                  ? '🎉'
                  : '📘'
              }}

            </div>

            <div>

              <h3>

                {{
                  result.result_status === 'Passed'
                    ? 'Congratulations! You passed.'
                    : 'Examination completed.'
                }}

              </h3>

              <p v-if="result.result_status === 'Passed'">

                You earned

                <strong>
                  {{ result.score }}
                  out of
                  {{ result.total_points }}
                  points
                </strong>

                with an overall percentage of

                <strong>
                  {{ formatPercentage(result.percentage) }}%
                </strong>.

              </p>

              <p v-else>

                You earned

                <strong>
                  {{ result.score }}
                  out of
                  {{ result.total_points }}
                  points
                </strong>.

                The required passing percentage was

                <strong>
                  {{ formatPercentage(result.passing) }}%
                </strong>.

              </p>

            </div>

          </div>

        </section>


        <!-- ==========================================
             TOP 5 TAB
        =========================================== -->

        <section
          v-else
          class="leaderboard-tab"
        >

          <!-- LEADERBOARD TITLE -->

          <div class="leaderboard-heading-card">

            <div class="leaderboard-heading-icon">
              🏆
            </div>

            <div>

              <span>
                EXAMINATION RANKINGS
              </span>

              <h2>
                Top 5 Students
              </h2>

              <p>
                {{ result.exam_title }}
              </p>

            </div>

            <div class="leaderboard-decoration"></div>

          </div>


          <div
            v-if="!result.leaderboard_available"
            class="ranking-locked-card"
          >
            <div class="ranking-locked-icon">
              🔒
            </div>

            <h3>
              Top 5 ranking is not available yet
            </h3>

            <p>
              Your personal score is ready. The leaderboard will appear
              after the professor ends the examination or after every
              student has submitted.
            </p>

            <button
              type="button"
              class="view-score-btn"
              @click="activeTab = 'score'"
            >
              View My Score
            </button>
          </div>

          <!-- EMPTY LEADERBOARD -->

          <div
            v-else-if="leaderboard.length === 0"
            class="empty-leaderboard"
          >

            <div class="empty-icon">
              🏆
            </div>

            <h3>
              No rankings available yet
            </h3>

            <p>
              Student rankings will appear after
              submitted examinations are recorded.
            </p>

          </div>


          <!-- TOP 5 LIST -->

          <div
            v-else
            class="leaderboard-list"
          >

            <div
              v-for="student in leaderboard"
              :key="student.session_id"
              class="leaderboard-item"
              :class="{
                first:
                  student.rank === 1,

                second:
                  student.rank === 2,

                third:
                  student.rank === 3,

                current:
                  student.session_id ===
                  result.session_id
              }"
            >

              <div class="rank-number">

                <span v-if="student.rank === 1">
                  🥇
                </span>

                <span v-else-if="student.rank === 2">
                  🥈
                </span>

                <span v-else-if="student.rank === 3">
                  🥉
                </span>

                <strong v-else>
                  {{ student.rank }}
                </strong>

              </div>

              <div class="student-avatar">

                {{ getInitials(student.student_name) }}

              </div>

              <div class="leaderboard-student-info">

                <div class="student-name-line">

                  <strong>
                    {{ student.student_name }}
                  </strong>

                  <span
                    v-if="
                      student.session_id ===
                      result.session_id
                    "
                    class="you-label"
                  >
                    YOU
                  </span>

                </div>

                <div class="leaderboard-student-details">

                  <span>
                    {{ student.score }}
                    /
                    {{ student.total_points }}
                    points
                  </span>

                  <span>
                    {{ formatTimeSpent(student.time_spent) }}
                  </span>

                </div>

              </div>

              <div class="leaderboard-score">

                <div class="leaderboard-score-line">

                  <span></span>

                  <strong>
                    {{ formatPercentage(student.percentage) }}%
                  </strong>

                </div>

                <div class="leaderboard-progress">

                  <div
                    class="leaderboard-progress-fill"
                    :style="{
                      width:
                        `${clampPercentage(
                          student.percentage
                        )}%`
                    }"
                  ></div>

                </div>

              </div>

            </div>

          </div>


          <!-- CURRENT STUDENT RANK -->

          <div
            v-if="result.leaderboard_available && showOwnRankingSeparately"
            class="current-student-ranking"
          >

            <div class="current-rank-icon">
              🔒
            </div>

            <div class="current-rank-info">

              <div>

                <strong>
                  {{ result.student_name }}
                </strong>

                <span>
                  YOU
                </span>

              </div>

              <p>
                View your private result in
                the My Score tab
              </p>

            </div>

            <div class="current-rank-score">

              <small>
                Rank
              </small>

              <strong>
                #{{ result.rank }}
              </strong>

              <span>
                {{ formatPercentage(result.percentage) }}%
              </span>

            </div>

          </div>

        </section>


        <!-- ==========================================
             RETURN BUTTON
        =========================================== -->

        <div class="result-actions">

          <button
            type="button"
            class="finish-btn"
            @click="finishSession"
          >
            Finish and Return Home
          </button>

        </div>

      </main>

    </template>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '../../services/api'

const router = useRouter()

const loading = ref(true)
const errorMessage = ref('')

const activeTab = ref<'score' | 'leaderboard'>('score')

const result = ref({
  session_id: 0,
  exam_id: 0,
  student_name: '',
  exam_title: '',
  score: 0,
  total_points: 0,
  total_questions: 0,
  correct_answers: 0,
  wrong_answers: 0,
  percentage: 0,
  passing: 75,
  rank: null as number | null,
  leaderboard_available: false,
  result_status: 'Failed',
  time_spent: 0
})

const leaderboard = ref<any[]>([])

let resultRefreshInterval:
  ReturnType<typeof setInterval> | null = null

const safePercentage = computed(() => {
  const value = Number(result.value.percentage || 0)

  if (value < 0) return 0
  if (value > 100) return 100

  return value
})

const formattedMinutes = computed(() => {

    const totalSeconds =
        Math.max(
            Number(result.value.time_spent || 0),
            0
        )

    const minutes =
        Math.floor(
            totalSeconds / 60
        )

    const seconds =
        totalSeconds % 60

    if (minutes > 0) {

        return `${minutes}m ${seconds}s`

    }

    return `${seconds}s`

})

const formattedTimeSpent = computed(() => {
  return formatTimeSpent(result.value.time_spent)
})

const showOwnRankingSeparately = computed(() => {
  return !leaderboard.value.some(
    student =>
      student.session_id ===
      result.value.session_id
  )
})

function clampPercentage(value: number) {
  value = Number(value)

  if (value < 0) return 0
  if (value > 100) return 100

  return value
}

function formatPercentage(value: number) {
  return Math.round(Number(value))
}

function formatTimeSpent(seconds: number) {
  seconds = Number(seconds)

  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60

  return `${mins}m ${secs}s`
}

function getInitials(name: string) {
  if (!name) return '--'

  return name
    .split(' ')
    .map(word => word.charAt(0))
    .join('')
    .substring(0, 2)
    .toUpperCase()
}

async function loadResults(
  silent: boolean = false
) {
  if (!silent) {
    loading.value = true
  }

  errorMessage.value = ''

  try {
    const sessionText =
      localStorage.getItem('student_session')

    if (!sessionText) {
      router.replace('/student')
      return
    }

    const session =
      JSON.parse(sessionText)

    const response = await api.get(
      `/student-results/${session.id}`,
      {
        params: {
          timestamp: Date.now(),
        },
      }
    )

    const data = response.data?.data

    if (!data) {
      throw new Error(
        'No result information was returned.'
      )
    }

    result.value = {
      session_id:
        Number(data.session_id),

      exam_id:
        Number(data.exam_id),

      student_name:
        data.student_name ||
        'Student',

      exam_title:
        data.exam_title ||
        'Examination',

      score:
        Number(data.score || 0),

      total_points:
        Number(data.total_points || 0),

      total_questions:
        Number(data.total_questions || 0),

      correct_answers:
        Number(data.correct_answers || 0),

      wrong_answers:
        Number(data.wrong_answers || 0),

      percentage:
        Number(data.percentage || 0),

      passing:
        Number(data.passing || 75),

      rank:
        data.rank === null ||
        data.rank === undefined
          ? null
          : Number(data.rank),

      leaderboard_available:
        Boolean(data.leaderboard_available),

      result_status:
        data.result_status === 'Passed'
          ? 'Passed'
          : 'Failed',

      time_spent:
        Number(data.time_spent || 0),
    }

    localStorage.setItem(
      'student_result',
      JSON.stringify(result.value)
    )

    if (result.value.leaderboard_available) {
      const leaderboardResponse =
        await api.get(
          `/student-leaderboard/${result.value.exam_id}`,
          {
            params: {
              timestamp: Date.now(),
            },
          }
        )

      leaderboard.value =
        Array.isArray(
          leaderboardResponse.data?.data
        )
          ? leaderboardResponse.data.data
          : []

      if (resultRefreshInterval) {
        clearInterval(resultRefreshInterval)
        resultRefreshInterval = null
      }
    } else {
      leaderboard.value = []
      activeTab.value = 'score'
    }
  } catch (error: unknown) {
    console.error(
      'STUDENT RESULTS ERROR:',
      error
    )

    if (!silent) {
      const apiError =
        error as {
          response?: {
            data?: {
              message?: string
            }
          }
        }

      errorMessage.value =
        apiError.response?.data?.message ||
        'Unable to load examination results.'
    }
  } finally {
    if (!silent) {
      loading.value = false
    }
  }
}

function finishSession() {

  localStorage.removeItem('student_session')
  localStorage.removeItem('student_exam')
  localStorage.removeItem('student_name')
  localStorage.removeItem('student_section')
  localStorage.removeItem('student_access_code')
  localStorage.removeItem('student_answers')
  localStorage.removeItem('exam_remaining_seconds')
  localStorage.removeItem('student_result')

  router.replace('/student')

}

onMounted(async () => {
  await loadResults()

  resultRefreshInterval = setInterval(() => {
    if (!result.value.leaderboard_available) {
      loadResults(true)
    }
  }, 5000)
})

onUnmounted(() => {
  if (resultRefreshInterval) {
    clearInterval(resultRefreshInterval)
    resultRefreshInterval = null
  }
})
</script>

<style scoped>

/* ==========================================
   GLOBAL
========================================== */

*{

    margin:0;

    padding:0;

    box-sizing:border-box;

    font-family:'Poppins',sans-serif;

}

.student-results-page{

    min-height:100vh;

    background:

        linear-gradient(

            180deg,

            #dff6e7 0%,

            #edf8f1 45%,

            #f6faf7 100%

        );

    color:#10203a;

}

button{

    font-family:inherit;

}


/* ==========================================
   LOADING AND ERROR SCREEN
========================================== */

.state-screen{

    min-height:100vh;

    padding:24px;

    display:flex;

    align-items:center;

    justify-content:center;

    background:

        linear-gradient(

            135deg,

            #dff6e7,

            #9edcaf

        );

}

.state-card{

    width:min(100%,430px);

    padding:36px;

    border-radius:28px;

    background:#ffffff;

    text-align:center;

    box-shadow:

        0 24px 55px

        rgba(15,23,42,.18);

}

.state-card h2{

    margin-bottom:10px;

    color:#0f172a;

    font-size:24px;

}

.state-card p{

    color:#64748b;

    font-size:13px;

    line-height:1.7;

}

.state-icon{

    margin-bottom:15px;

    font-size:48px;

}

.loader{

    width:52px;

    height:52px;

    margin:0 auto 20px;

    border:5px solid #dcfce7;

    border-top-color:#16a34a;

    border-radius:50%;

    animation:spin .8s linear infinite;

}

.retry-btn{

    margin-top:22px;

    padding:13px 24px;

    border:none;

    border-radius:12px;

    background:#16a34a;

    color:#ffffff;

    font-weight:700;

    cursor:pointer;

}


/* ==========================================
   HEADER
========================================== */

.results-header{

    width:min(100%,1100px);

    margin:0 auto;

    padding:18px 28px;

    display:flex;

    align-items:center;

    justify-content:space-between;

    gap:20px;

}

.header-brand{

    display:flex;

    align-items:center;

    gap:12px;

}

.logo-wrapper{

    width:48px;

    height:48px;

    padding:6px;

    display:flex;

    align-items:center;

    justify-content:center;

    border-radius:50%;

    background:#ecfdf3;

    border:1px solid #86efac;

}

.header-logo{

    width:100%;

    height:100%;

    object-fit:contain;

}

.header-text span{

    display:block;

    margin-bottom:2px;

    color:#16a34a;

    font-size:9px;

    font-weight:800;

    letter-spacing:1px;

}

.header-text h1{

    color:#10203a;

    font-size:18px;

    font-weight:800;

}

.live-badge{

    padding:7px 12px;

    display:flex;

    align-items:center;

    gap:7px;

    border-radius:999px;

    background:#dcfce7;

    color:#15803d;

    font-size:9px;

    font-weight:800;

}

.live-dot{

    width:7px;

    height:7px;

    border-radius:50%;

    background:#16a34a;

    box-shadow:

        0 0 0 4px

        rgba(22,163,74,.12);

}


/* ==========================================
   MAIN CONTENT
========================================== */

.results-content{

    width:min(100%,1100px);

    margin:0 auto;

    padding:0 28px 40px;

}


/* ==========================================
   TAB NAVIGATION
========================================== */

.result-tabs{

    padding:6px;

    display:grid;

    grid-template-columns:1fr 1fr;

    gap:6px;

    border-radius:20px;

    background:rgba(255,255,255,.64);

    backdrop-filter:blur(16px);

    -webkit-backdrop-filter:blur(16px);

    box-shadow:

        0 10px 25px

        rgba(15,23,42,.06);

}

.tab-button{

    min-height:48px;

    padding:10px 16px;

    border:none;

    border-radius:16px;

    display:flex;

    align-items:center;

    justify-content:center;

    gap:8px;

    background:transparent;

    color:#16a34a;

    font-size:12px;

    font-weight:800;

    cursor:pointer;

    transition:.25s;

}

.tab-button.active{

    background:#ffffff;

    box-shadow:

        0 8px 20px

        rgba(15,23,42,.10);

}

.tab-icon{

    font-size:15px;

}

.private-label{

    padding:3px 6px;

    border-radius:999px;

    background:#dcfce7;

    color:#15803d;

    font-size:7px;

    font-weight:800;

}


/* ==========================================
   SCORE TAB
========================================== */

.score-tab{

    margin-top:18px;

    display:flex;

    flex-direction:column;

    gap:16px;

}


/* ==========================================
   PRIVATE RESULT CARD
========================================== */

.private-result-card{

    position:relative;

    min-height:170px;

    padding:24px;

    display:flex;

    align-items:center;

    gap:22px;

    overflow:hidden;

    border-radius:26px;

    color:#ffffff;

    box-shadow:

        0 18px 36px

        rgba(15,23,42,.15);

}

.private-result-card.passed{

    background:

        linear-gradient(

            135deg,

            #16a34a,

            #166534

        );

}

.private-result-card.failed{

    background:

        linear-gradient(

            135deg,

            #475569,

            #1e293b

        );

}

.score-ring-wrapper{

    position:relative;

    z-index:2;

    flex:0 0 auto;

}

.score-ring{

    width:115px;

    height:115px;

    padding:10px;

    display:flex;

    align-items:center;

    justify-content:center;

    border-radius:50%;

    background:

        conic-gradient(

            #ffffff var(--score-angle),

            rgba(255,255,255,.22) 0deg

        );

}

.score-ring-inner{

    width:100%;

    height:100%;

    display:flex;

    flex-direction:column;

    align-items:center;

    justify-content:center;

    border-radius:50%;

    background:#22a447;

    border:4px solid rgba(255,255,255,.9);

}

.private-result-card.failed
.score-ring-inner{

    background:#334155;

}

.score-ring-inner strong{

    font-size:25px;

    font-weight:800;

}

.score-ring-inner span{

    font-size:9px;

    opacity:.9;

}

.private-result-info{

    position:relative;

    z-index:2;

    min-width:0;

}

.private-result-label{

    display:flex;

    align-items:center;

    gap:6px;

    margin-bottom:5px;

    font-size:9px;

    font-weight:800;

    letter-spacing:1px;

}

.private-result-info h2{

    overflow:hidden;

    text-overflow:ellipsis;

    white-space:nowrap;

    font-size:25px;

    font-weight:800;

}

.private-result-info p{

    margin-top:3px;

    overflow:hidden;

    text-overflow:ellipsis;

    white-space:nowrap;

    font-size:11px;

    opacity:.85;

}

.result-badge{

    width:max-content;

    margin-top:12px;

    padding:6px 10px;

    border-radius:999px;

    background:rgba(255,255,255,.18);

    font-size:9px;

    font-weight:800;

}

.result-decoration{

    position:absolute;

    top:-50px;

    right:-40px;

    width:180px;

    height:180px;

    border-radius:50%;

    background:rgba(255,255,255,.10);

}


/* ==========================================
   SCORE STATISTICS
========================================== */

.score-statistics{

    display:grid;

    grid-template-columns:repeat(4,1fr);

    gap:12px;

}

.score-stat-card{

    min-height:108px;

    padding:15px 10px;

    display:flex;

    flex-direction:column;

    align-items:center;

    justify-content:center;

    border-radius:18px;

    text-align:center;

    background:#ffffff;

    box-shadow:

        0 10px 24px

        rgba(15,23,42,.05);

}

.score-stat-icon{

    margin-bottom:8px;

    font-size:18px;

}

.score-stat-card strong{

    color:#10203a;

    font-size:17px;

}

.score-stat-card span{

    margin-top:4px;

    color:#64748b;

    font-size:9px;

}

.time-stat{

    background:#f3f0ff;

}

.time-stat
.score-stat-icon{

    color:#7c3aed;

}

.questions-stat{

    background:#ecfeff;

}

.questions-stat
.score-stat-icon{

    color:#0891b2;

}

.correct-stat{

    background:#effdf4;

}

.correct-stat
.score-stat-icon{

    color:#16a34a;

}

.wrong-stat{

    background:#fff1f2;

}

.wrong-stat
.score-stat-icon{

    color:#ef4444;

}


/* ==========================================
   ACCURACY CARD
========================================== */

.accuracy-card{

    padding:18px;

    border-radius:18px;

    background:#ffffff;

    box-shadow:

        0 10px 24px

        rgba(15,23,42,.05);

}

.accuracy-header{

    display:flex;

    align-items:center;

    justify-content:space-between;

    gap:16px;

}

.accuracy-header > div:first-child{

    display:flex;

    align-items:center;

    gap:8px;

}

.accuracy-icon{

    color:#16a34a;

    font-size:17px;

}

.accuracy-header strong{

    font-size:11px;

}

.accuracy-values{

    display:flex;

    align-items:center;

    gap:10px;

}

.accuracy-values strong{

    color:#16a34a;

    font-size:11px;

}

.accuracy-values span{

    padding:4px 8px;

    border-radius:999px;

    background:#ecfdf3;

    color:#15803d;

    font-size:8px;

    font-weight:700;

}

.accuracy-progress{

    width:100%;

    height:8px;

    margin-top:12px;

    overflow:hidden;

    border-radius:999px;

    background:#e2e8f0;

}

.accuracy-progress-fill{

    height:100%;

    border-radius:999px;

    background:

        linear-gradient(

            90deg,

            #16a34a,

            #22c55e

        );

    transition:width .4s ease;

}


/* ==========================================
   SCORE DETAILS
========================================== */

.score-details-card{

    padding:22px;

    border-radius:22px;

    background:#ffffff;

    box-shadow:

        0 10px 24px

        rgba(15,23,42,.05);

}

.score-details-heading{

    margin-bottom:18px;

    display:flex;

    align-items:center;

    justify-content:space-between;

    gap:16px;

}

.score-details-heading span{

    color:#16a34a;

    font-size:9px;

    font-weight:800;

    letter-spacing:1px;

}

.score-details-heading h3{

    margin-top:3px;

    font-size:17px;

}

.personal-rank{

    padding:8px 12px;

    border-radius:14px;

    background:#f0fdf4;

    color:#64748b;

    font-size:9px;

}

.personal-rank strong{

    display:block;

    margin-top:2px;

    color:#15803d;

    font-size:16px;

}

.score-details-grid{

    display:grid;

    grid-template-columns:repeat(4,1fr);

    gap:12px;

}

.score-detail-item{

    padding:15px;

    border-radius:15px;

    background:#f8fafc;

}

.score-detail-item span{

    display:block;

    margin-bottom:5px;

    color:#64748b;

    font-size:9px;

}

.score-detail-item strong{

    font-size:14px;

}


/* ==========================================
   RESULT MESSAGE
========================================== */

.result-message-card{

    padding:18px;

    display:flex;

    align-items:flex-start;

    gap:14px;

    border-radius:18px;

}

.result-message-card.passed{

    border:1px solid #86efac;

    background:#f0fdf4;

}

.result-message-card.failed{

    border:1px solid #fecaca;

    background:#fef2f2;

}

.message-icon{

    flex:0 0 44px;

    width:44px;

    height:44px;

    display:flex;

    align-items:center;

    justify-content:center;

    border-radius:50%;

    background:#ffffff;

    font-size:21px;

}

.result-message-card h3{

    margin-bottom:5px;

    font-size:14px;

}

.result-message-card p{

    color:#64748b;

    font-size:10px;

    line-height:1.7;

}


/* ==========================================
   LEADERBOARD TAB
========================================== */

.leaderboard-tab{

    margin-top:18px;

    display:flex;

    flex-direction:column;

    gap:14px;

}

.leaderboard-heading-card{

    position:relative;

    min-height:125px;

    padding:22px;

    display:flex;

    align-items:center;

    gap:16px;

    overflow:hidden;

    border-radius:24px;

    background:

        linear-gradient(

            135deg,

            #16a34a,

            #166534

        );

    color:#ffffff;

}

.leaderboard-heading-icon{

    position:relative;

    z-index:2;

    flex:0 0 55px;

    width:55px;

    height:55px;

    display:flex;

    align-items:center;

    justify-content:center;

    border-radius:16px;

    background:rgba(255,255,255,.18);

    font-size:27px;

}

.leaderboard-heading-card > div:nth-child(2){

    position:relative;

    z-index:2;

}

.leaderboard-heading-card span{

    font-size:9px;

    font-weight:800;

    letter-spacing:1px;

}

.leaderboard-heading-card h2{

    margin:3px 0;

    font-size:22px;

}

.leaderboard-heading-card p{

    font-size:10px;

    opacity:.86;

}

.leaderboard-decoration{

    position:absolute;

    top:-60px;

    right:-45px;

    width:180px;

    height:180px;

    border-radius:50%;

    background:rgba(255,255,255,.11);

}


/* ==========================================
   LEADERBOARD LIST
========================================== */

.leaderboard-list{

    display:flex;

    flex-direction:column;

    gap:11px;

}

.leaderboard-item{

    min-height:76px;

    padding:13px 16px;

    display:grid;

    grid-template-columns:38px 44px minmax(0,1fr) 140px;

    align-items:center;

    gap:12px;

    border:1px solid transparent;

    border-radius:18px;

    background:#ffffff;

    box-shadow:

        0 8px 20px

        rgba(15,23,42,.05);

}

.leaderboard-item.first{

    border-color:#facc15;

    background:#fffbeb;

}

.leaderboard-item.second{

    border-color:#cbd5e1;

}

.leaderboard-item.third{

    border-color:#fdba74;

}

.leaderboard-item.current{

    border-color:#16a34a;

    background:#f0fdf4;

}

.rank-number{

    text-align:center;

    font-size:19px;

}

.student-avatar{

    width:40px;

    height:40px;

    display:flex;

    align-items:center;

    justify-content:center;

    border-radius:50%;

    background:#ecfdf3;

    color:#15803d;

    font-size:11px;

    font-weight:800;

}

.leaderboard-student-info{

    min-width:0;

}

.student-name-line{

    display:flex;

    align-items:center;

    gap:7px;

}

.student-name-line strong{

    overflow:hidden;

    text-overflow:ellipsis;

    white-space:nowrap;

    font-size:12px;

}

.you-label{

    padding:3px 6px;

    border-radius:999px;

    background:#16a34a;

    color:#ffffff;

    font-size:7px;

    font-weight:800;

}

.leaderboard-student-details{

    margin-top:5px;

    display:flex;

    flex-wrap:wrap;

    gap:8px;

    color:#94a3b8;

    font-size:8px;

}

.leaderboard-score{

    min-width:0;

}

.leaderboard-score-line{

    display:flex;

    align-items:center;

    justify-content:flex-end;

    gap:10px;

}

.leaderboard-score-line > span{

    flex:1;

}

.leaderboard-score-line strong{

    color:#16a34a;

    font-size:12px;

}

.leaderboard-progress{

    width:100%;

    height:6px;

    margin-top:7px;

    overflow:hidden;

    border-radius:999px;

    background:#e2e8f0;

}

.leaderboard-progress-fill{

    height:100%;

    border-radius:999px;

    background:

        linear-gradient(

            90deg,

            #16a34a,

            #22c55e

        );

}


/* ==========================================
   EMPTY LEADERBOARD
========================================== */

.empty-leaderboard{

    padding:40px 20px;

    border-radius:20px;

    background:#ffffff;

    text-align:center;

}

.empty-icon{

    margin-bottom:10px;

    font-size:38px;

}

.empty-leaderboard h3{

    margin-bottom:5px;

    font-size:15px;

}

.empty-leaderboard p{

    color:#64748b;

    font-size:10px;

}


/* ==========================================
   CURRENT STUDENT RANK
========================================== */

.current-student-ranking{

    margin-top:10px;

    padding:16px;

    display:grid;

    grid-template-columns:40px minmax(0,1fr) auto;

    align-items:center;

    gap:12px;

    border:1px dashed #86efac;

    border-radius:18px;

    background:rgba(255,255,255,.75);

}

.current-rank-icon{

    width:40px;

    height:40px;

    display:flex;

    align-items:center;

    justify-content:center;

    border-radius:50%;

    background:#ecfdf3;

}

.current-rank-info > div{

    display:flex;

    align-items:center;

    gap:7px;

}

.current-rank-info strong{

    font-size:12px;

}

.current-rank-info span{

    padding:3px 6px;

    border-radius:999px;

    background:#16a34a;

    color:#ffffff;

    font-size:7px;

    font-weight:800;

}

.current-rank-info p{

    margin-top:4px;

    color:#64748b;

    font-size:8px;

}

.current-rank-score{

    text-align:right;

}

.current-rank-score small{

    display:block;

    color:#94a3b8;

    font-size:8px;

}

.current-rank-score strong{

    display:block;

    color:#15803d;

    font-size:17px;

}

.current-rank-score span{

    font-size:9px;

}


/* ==========================================
   RESULT ACTIONS
========================================== */

.result-actions{

    padding-top:18px;

    text-align:center;

}

.finish-btn{

    min-width:240px;

    padding:14px 22px;

    border:none;

    border-radius:14px;

    background:#10203a;

    color:#ffffff;

    font-size:11px;

    font-weight:800;

    cursor:pointer;

    transition:.25s;

}

.finish-btn:hover{

    transform:translateY(-2px);

    box-shadow:

        0 12px 24px

        rgba(15,23,42,.18);

}



/* ==========================================
   LOCKED RANKING
========================================== */

.ranking-locked-card{

    padding:36px 22px;

    border:1px dashed #86efac;

    border-radius:22px;

    background:#ffffff;

    text-align:center;

}

.ranking-locked-icon{

    width:58px;

    height:58px;

    margin:0 auto 14px;

    display:flex;

    align-items:center;

    justify-content:center;

    border-radius:50%;

    background:#dcfce7;

    font-size:25px;

}

.ranking-locked-card h3{

    margin-bottom:7px;

    color:#0f172a;

    font-size:17px;

}

.ranking-locked-card p{

    max-width:520px;

    margin:0 auto;

    color:#64748b;

    font-size:11px;

    line-height:1.7;

}

.view-score-btn{

    min-height:44px;

    margin-top:18px;

    padding:10px 20px;

    border:none;

    border-radius:11px;

    background:#16a34a;

    color:#ffffff;

    font-size:11px;

    font-weight:800;

    cursor:pointer;

}


/* ==========================================
   ANIMATION
========================================== */

@keyframes spin{

    to{

        transform:rotate(360deg);

    }

}


/* ==========================================
   LAPTOP AND TABLET
========================================== */

@media(max-width:900px){

    .score-details-grid{

        grid-template-columns:repeat(2,1fr);

    }

}


/* ==========================================
   IPAD AND SMALL TABLET
========================================== */

@media(max-width:700px){

    .results-header{

        padding:16px 18px;

    }

    .results-content{

        padding:0 18px 30px;

    }

    .score-statistics{

        grid-template-columns:repeat(2,1fr);

    }

    .leaderboard-item{

        grid-template-columns:35px 42px minmax(0,1fr) 110px;

    }

}


/* ==========================================
   MOBILE
========================================== */

@media(max-width:520px){

    .student-results-page{

        min-height:100dvh;

    }

    .results-header{

        padding-top:

            max(

                14px,

                env(safe-area-inset-top)

            );

    }

    .header-text h1{

        font-size:15px;

    }

    .header-text span{

        font-size:7px;

    }

    .logo-wrapper{

        width:42px;

        height:42px;

    }

    .live-badge{

        padding:6px 9px;

        font-size:7px;

    }

    .results-content{

        padding:

            0

            14px

            max(

                24px,

                env(safe-area-inset-bottom)

            );

    }

    .result-tabs{

        border-radius:17px;

    }

    .tab-button{

        min-height:44px;

        padding:8px 10px;

        font-size:10px;

    }

    .private-result-card{

        min-height:150px;

        padding:18px;

        gap:15px;

        border-radius:22px;

    }

    .score-ring{

        width:94px;

        height:94px;

    }

    .score-ring-inner strong{

        font-size:20px;

    }

    .private-result-info h2{

        font-size:18px;

    }

    .private-result-info p{

        font-size:9px;

    }

    .score-statistics{

        grid-template-columns:repeat(4,1fr);

        gap:8px;

    }

    .score-stat-card{

        min-height:88px;

        padding:10px 5px;

        border-radius:14px;

    }

    .score-stat-icon{

        margin-bottom:5px;

        font-size:15px;

    }

    .score-stat-card strong{

        font-size:13px;

    }

    .score-stat-card span{

        font-size:7px;

    }

    .accuracy-card{

        padding:14px;

    }

    .accuracy-header{

        align-items:flex-start;

    }

    .accuracy-values{

        align-items:flex-end;

        flex-direction:column;

        gap:4px;

    }

    .score-details-card{

        padding:17px;

    }

    .score-details-heading h3{

        font-size:15px;

    }

    .score-details-grid{

        grid-template-columns:repeat(2,1fr);

    }

    .score-detail-item{

        padding:12px;

    }

    .leaderboard-heading-card{

        min-height:110px;

        padding:18px;

    }

    .leaderboard-heading-icon{

        width:48px;

        height:48px;

        flex-basis:48px;

        font-size:22px;

    }

    .leaderboard-heading-card h2{

        font-size:18px;

    }

    .leaderboard-item{

        min-height:70px;

        padding:11px;

        grid-template-columns:28px 38px minmax(0,1fr) 85px;

        gap:8px;

        border-radius:15px;

    }

    .rank-number{

        font-size:15px;

    }

    .student-avatar{

        width:36px;

        height:36px;

        font-size:9px;

    }

    .student-name-line strong{

        font-size:10px;

    }

    .leaderboard-student-details{

        display:none;

    }

    .leaderboard-score-line strong{

        font-size:10px;

    }

    .current-student-ranking{

        grid-template-columns:36px minmax(0,1fr) auto;

        padding:13px;

    }

    .finish-btn{

        width:100%;

        min-width:0;

    }

}


/* ==========================================
   VERY SMALL MOBILE
========================================== */

@media(max-width:375px){

    .results-header{

        padding-left:12px;

        padding-right:12px;

    }

    .results-content{

        padding-left:10px;

        padding-right:10px;

    }

    .header-text h1{

        font-size:14px;

    }

    .score-statistics{

        grid-template-columns:repeat(2,1fr);

    }

    .private-result-card{

        align-items:flex-start;

    }

    .score-ring{

        width:84px;

        height:84px;

    }

    .private-result-info h2{

        font-size:16px;

    }

    .leaderboard-item{

        grid-template-columns:26px 34px minmax(0,1fr) 72px;

    }

}

/* ==========================================
   RESPONSIVE IMPROVEMENTS
========================================== */

.student-results-page{
    width:100%;
    min-height:100dvh;
    overflow-x:hidden;
}

.results-header,
.results-content{
    width:min(100%,1180px);
}

.results-content{
    padding-bottom:max(32px,env(safe-area-inset-bottom));
}

.header-brand,
.header-text,
.private-result-info,
.leaderboard-student-info,
.student-name-line{
    min-width:0;
}

.score-tab{
    display:grid;
    grid-template-columns:minmax(320px,.82fr) minmax(0,1.18fr);
    align-items:start;
    gap:16px;
}

.private-result-card{
    grid-column:1 / -1;
}

.score-statistics{
    grid-column:1;
    grid-template-columns:repeat(2,minmax(0,1fr));
}

.accuracy-card{
    grid-column:1;
}

.score-details-card{
    grid-column:2;
    grid-row:2 / span 2;
    height:100%;
}

.score-details-grid{
    grid-template-columns:repeat(2,minmax(0,1fr));
}

.result-message-card{
    grid-column:1 / -1;
}

.leaderboard-list{
    display:grid;
    grid-template-columns:repeat(2,minmax(0,1fr));
    gap:12px;
}

.leaderboard-item{
    min-width:0;
    grid-template-columns:38px 44px minmax(0,1fr) 120px;
}

.leaderboard-item:first-child{
    grid-column:1 / -1;
}

@media(max-width:900px){
    .results-header,
    .results-content{
        width:min(100%,820px);
    }

    .score-tab{
        display:flex;
        flex-direction:column;
    }

    .score-statistics{
        width:100%;
        grid-template-columns:repeat(4,minmax(0,1fr));
    }

    .accuracy-card,
    .score-details-card,
    .result-message-card{
        width:100%;
    }

    .leaderboard-list{
        grid-template-columns:1fr;
    }

    .leaderboard-item:first-child{
        grid-column:auto;
    }
}

@media(max-width:600px){
    .results-header{
        padding:max(14px,env(safe-area-inset-top)) 14px 14px;
    }

    .results-content{
        width:100%;
        padding:0 12px max(26px,env(safe-area-inset-bottom));
    }

    .score-statistics{
        grid-template-columns:repeat(4,minmax(0,1fr));
        gap:8px;
    }

    .score-details-grid{
        grid-template-columns:repeat(2,minmax(0,1fr));
    }
}

@media(max-width:390px){
    .score-statistics{
        grid-template-columns:repeat(2,minmax(0,1fr));
    }

    .score-details-grid{
        grid-template-columns:1fr;
    }
}

@media(prefers-reduced-motion:reduce){
    *,
    *::before,
    *::after{
        animation-duration:.01ms !important;
        animation-iteration-count:1 !important;
        transition-duration:.01ms !important;
    }
}

</style>