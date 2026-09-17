<template>
  <div class="create-page">

    <!-- BACK BUTTON -->
    <div class="back-wrapper">
      <button
        v-if="classId"
        type="button"
        class="back-btn"
        @click="goBackToClass"
      >
        <ArrowLeft :size="18" />
        <span>Back to Assessments</span>
      </button>
    </div>

    <!-- HEADER -->
    <div class="page-header">
      <h1>
        How would you like to get started?
      </h1>

      <p>
        Choose to Continue
      </p>
    </div>

    <!-- OPTIONS -->
    <div class="cards">

      <!-- MANUAL -->
      <div
        class="card"
        @click="goManual"
      >
        <div class="circle">
          <PencilLine :size="36" />
        </div>

        <h2>Create</h2>

        <span>
          Manually create an assessment
        </span>
      </div>

      <!-- AUTOMATIC -->
      <div
        class="card"
        @click="goAutomatic"
      >
        <div class="circle">
          <Sparkles :size="36" />
        </div>

        <h2>Create</h2>

        <span>
          Automatically generate questions
          by pasting formatted questions
        </span>
      </div>
      <!-- TEST BANK -->
      <div
        class="card"
        @click="goTestBank"
      >
        <div class="circle">
          <BookOpenCheck :size="36" />
        </div>

        <h2>Test Bank</h2>

        <span>
          Create an assessment using
          saved questions from your Test Bank
        </span>
      </div>

    </div>
  </div>
</template>

<script setup lang="ts">
import {
  computed
} from 'vue'

import {
  useRoute,
  useRouter
} from 'vue-router'

import {
  ArrowLeft,
  PencilLine,
  Sparkles,
  BookOpenCheck
} from '@lucide/vue'

const route =
  useRoute()

const router =
  useRouter()

// ==========================================
// CLASS SOURCE
// ==========================================

const classId =
  computed(() => {
    const id =
      Number(
        route.query.class_id
      )

    return (
      Number.isInteger(id) &&
      id > 0
    )
      ? id
      : null
  })

// ==========================================
// BACK TO CLASS ASSESSMENTS
// ==========================================

function goBackToClass() {
  if (!classId.value) {
    return
  }

  router.push({
    path:
      `/faculty/classes/${classId.value}`,

    query: {
      tab: 'assessments'
    }
  })
}

// ==========================================
// MANUAL
// ==========================================

function goManual() {
  router.push({
    path:
      '/faculty/manual-exam',

    query:
      classId.value
        ? {
            class_id:
              String(
                classId.value
              )
          }
        : {}
  })
}

// ==========================================
// AUTOMATIC
// ==========================================

function goAutomatic() {
  router.push({
    path:
      '/faculty/automatic-exam',

    query:
      classId.value
        ? {
            class_id:
              String(
                classId.value
              )
          }
        : {}
  })
}
// ==========================================
// TEST BANK ASSESSMENT
// ==========================================

function goTestBank() {
  router.push({
    path: '/faculty/test-bank-exam',
    query: classId.value
      ? {
          class_id: String(classId.value)
        }
      : {}
  })
}
</script>

<style scoped>
/* ==========================================
   PAGE
========================================== */

.create-page {
  min-height:
    calc(100vh - 80px);

  padding:
    35px 30px 60px;

  text-align: center;

  background:
    #f8fafc;

  box-sizing:
    border-box;
}

/* ==========================================
   BACK BUTTON
========================================== */

.back-wrapper {
  width: 100%;
  max-width: 1000px;

  margin:
    0 auto 30px;

  display: flex;

  justify-content:
    flex-start;
}

.back-btn {
  padding:
    11px 16px;

  border:
    1px solid #e5e7eb;

  border-radius:
    10px;

  background:
    white;

  color:
    #374151;

  display:
    inline-flex;

  align-items:
    center;

  justify-content:
    center;

  gap:
    7px;

  font-family:
    inherit;

  font-size:
    13px;

  font-weight:
    600;

  cursor:
    pointer;

  box-shadow:
    0 4px 12px
    rgba(0, 0, 0, .06);

  transition:
    .2s ease;
}

.back-btn:hover {
  background:
    #16a34a;

  border-color:
    #16a34a;

  color:
    white;

  transform:
    translateX(-2px);
}

/* ==========================================
   HEADER
========================================== */

.page-header {
  margin-bottom:
    60px;
}

.create-page h1 {
  margin-bottom:
    15px;

  color:
    #1a1818;

  font-size:
    42px;

  font-weight:
    700;
}

.create-page p {
  margin:
    0;

  color:
    #009944;

  font-size:
    22px;

  font-weight:
    500;
}

/* ==========================================
   CARDS
========================================== */

.cards {
  display:
    flex;

  justify-content:
    center;

  align-items:
    stretch;

  gap:
    35px;

  flex-wrap:
    wrap;
}

.card {
  width:
    320px;

  min-height:
    250px;

  padding:
    40px;

  border:
    1px solid transparent;

  border-radius:
    18px;

  background:
    white;

  display:
    flex;

  flex-direction:
    column;

  align-items:
    center;

  justify-content:
    center;

  cursor:
    pointer;

  box-shadow:
    0 10px 30px
    rgba(0, 0, 0, .10);

  transition:
    .3s;
}

.card:hover {
  transform:
    translateY(-10px);

  box-shadow:
    0 16px 35px
    rgba(0, 0, 0, .13);

  border-color:
    #bbf7d0;
}

/* ==========================================
   ICON
========================================== */

.circle {
  width:
    80px;

  height:
    80px;

  margin:
    0 auto 20px;

  border-radius:
    50%;

  background:
    #dff9e8;

  color:
    #16a34a;

  display:
    flex;

  justify-content:
    center;

  align-items:
    center;

  transition:
    .3s;
}

.card:hover .circle {
  background:
    #16a34a;

  color:
    white;

  transform:
    scale(1.05);
}

/* ==========================================
   CARD TEXT
========================================== */

.card h2 {
  margin-bottom:
    10px;

  color:
    #112244;

  font-size:
    24px;

  font-weight:
    700;
}

.card span {
  max-width:
    240px;

  color:
    #666;

  font-size:
    15px;

  line-height:
    1.6;
}

/* ==========================================
   TABLET
========================================== */

@media (max-width: 900px) {

  .create-page {
    padding:
      30px 25px 45px;
  }

  .create-page h1 {
    font-size:
      36px;
  }

  .cards {
    gap:
      25px;
  }
}

/* ==========================================
   MOBILE
========================================== */

@media (max-width: 600px) {

  .create-page {
    padding:
      20px 18px 35px;
  }

  .back-wrapper {
    margin-bottom:
      25px;
  }

  .back-btn {
    width:
      100%;
  }

  .page-header {
    margin-bottom:
      35px;
  }

  .create-page h1 {
    font-size:
      30px;

    line-height:
      1.25;
  }

  .create-page p {
    font-size:
      18px;
  }

  .cards {
    flex-direction:
      column;

    align-items:
      center;

    gap:
      20px;
  }

  .card {
    width:
      100%;

    max-width:
      360px;

    min-height:
      220px;

    padding:
      30px;
  }

  .circle {
    width:
      72px;

    height:
      72px;
  }
}
</style>
