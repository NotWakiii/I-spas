<template>
  <div class="create-page">
    <!-- HEADER -->
    <div class="page-header">
      <h1>How would you like to get started?</h1>
      <p>Choose to Continue</p>
    </div>
    <!-- OPTIONS -->
    <div class="cards">
      <!-- MANUAL EXAM -->
      <div
        class="card"
        @click="$router.push('/faculty/manual-exam')"
      >
        <div class="circle">
          <PencilLine :size="36" />
        </div>
        <h2>Create</h2>
        <span>
          Manually create an assessment
        </span>
      </div>
      <!-- AUTOMATIC EXAM -->
      <div
        class="card"
        @click="$router.push('/faculty/automatic-exam')"
      >
        <div class="circle">
          <Sparkles :size="36" />
        </div>
        <h2>Create</h2>
        <span>
          Automatic generated questions via upload
        </span>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import {
  PencilLine,
  Sparkles
} from '@lucide/vue'
</script>
<style scoped>
/* ==========================================
   PAGE
========================================== */
.create-page {
  min-height: calc(100vh - 80px);
  padding: 60px 30px;
  text-align: center;
  background: #f8fafc;
  box-sizing: border-box;
}
/* ==========================================
   HEADER
========================================== */
.page-header {
  margin-bottom: 60px;
}
.create-page h1 {
  font-size: 42px;
  color: #1a1818;
  margin-bottom: 15px;
  font-weight: 700;
}
.create-page p {
  color: #009944;
  font-size: 22px;
  margin: 0;
  font-weight: 500;
}
/* ==========================================
   CARDS
========================================== */
.cards {
  display: flex;
  justify-content: center;
  align-items: stretch;
  gap: 35px;
  flex-wrap: wrap;
}
.card {
  width: 320px;
  min-height: 250px;
  background: white;
  border-radius: 18px;
  padding: 40px;
  cursor: pointer;
  transition: .3s;
  box-shadow:
    0 10px 30px
    rgba(0, 0, 0, .10);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 1px solid transparent;
}
.card:hover {
  transform: translateY(-10px);
  box-shadow:
    0 16px 35px
    rgba(0, 0, 0, .13);
  border-color: #bbf7d0;
}
/* ==========================================
   ICON
========================================== */
.circle {
  width: 80px;
  height: 80px;
  margin: 0 auto 20px;
  border-radius: 50%;
  background: #dff9e8;
  color: #16a34a;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: .3s;
}
.card:hover .circle {
  background: #16a34a;
  color: white;
  transform: scale(1.05);
}
/* ==========================================
   CARD TEXT
========================================== */
.card h2 {
  color: #112244;
  margin-bottom: 10px;
  font-size: 24px;
  font-weight: 700;
}
.card span {
  color: #666;
  font-size: 15px;
  line-height: 1.6;
  max-width: 240px;
}
/* ==========================================
   TABLET
========================================== */
@media (max-width: 900px) {
  .create-page {
    padding: 45px 25px;
  }
  .create-page h1 {
    font-size: 36px;
  }
  .cards {
    gap: 25px;
  }
}
/* ==========================================
   MOBILE
========================================== */
@media (max-width: 600px) {
  .create-page {
    padding: 35px 18px;
  }
  .page-header {
    margin-bottom: 35px;
  }
  .create-page h1 {
    font-size: 30px;
    line-height: 1.25;
  }
  .create-page p {
    font-size: 18px;
  }
  .cards {
    flex-direction: column;
    align-items: center;
    gap: 20px;
  }
  .card {
    width: 100%;
    max-width: 360px;
    min-height: 220px;
    padding: 30px;
  }
  .circle {
    width: 72px;
    height: 72px;
  }
}
</style>
