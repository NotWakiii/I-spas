<template>
  <div class="layout">

    <!-- ================= MOBILE OVERLAY ================= -->
    <div
      v-if="showMobileMenu"
      class="mobile-overlay"
      @click="closeMobileMenu"
    ></div>

    <!-- ================= SIDEBAR ================= -->
    <aside
      class="sidebar"
      :class="{ 'sidebar-open': showMobileMenu }"
    >

      <!-- Logo -->
      <div class="logo-section">

        <img
          src="@/assets/logo.png"
          alt="I-SPAS Logo"
          class="logo"
        />

        <div class="logo-text">
          <h2>I-SPAS</h2>
          <p>Faculty Portal</p>
        </div>

        <!-- Mobile Close Button -->
        <button
          class="close-drawer-btn"
          type="button"
          aria-label="Close menu"
          @click="closeMobileMenu"
        >
          <X :size="20" />
        </button>

      </div>


      <!-- ================= NAVIGATION ================= -->
      <nav class="menu">

        <!-- Dashboard -->
        <RouterLink
          to="/faculty/dashboard"
          @click="closeMobileMenu"
        >
          <LayoutDashboard
            :size="20"
            :stroke-width="2"
          />

          <span>
            Dashboard
          </span>
        </RouterLink>


        <!-- Create Exam -->
        <RouterLink
          to="/faculty/create-exam"
          @click="closeMobileMenu"
        >
          <FilePlus2
            :size="20"
            :stroke-width="2"
          />

          <span>
            Create Exam
          </span>
        </RouterLink>


        <!-- Class Management -->
        <RouterLink
          to="/faculty/classes"
          @click="closeMobileMenu"
        >
          <Users
            :size="20"
            :stroke-width="2"
          />

          <span>
            Class Management
          </span>
        </RouterLink>


        <!-- Exam Results -->
        <RouterLink
          to="/faculty/exam-results"
          @click="closeMobileMenu"
        >
          <ClipboardCheck
            :size="20"
            :stroke-width="2"
          />

          <span>
            Exam Results
          </span>
        </RouterLink>


        <!-- Item Analysis -->
        <RouterLink
          to="/faculty/item-analysis"
          @click="closeMobileMenu"
        >
          <BarChart3
            :size="20"
            :stroke-width="2"
          />

          <span>
            Item Analysis
          </span>
        </RouterLink>


        <!-- Student History -->
        <RouterLink
          to="/faculty/student-history"
          @click="closeMobileMenu"
        >
          <History
            :size="20"
            :stroke-width="2"
          />

          <span>
            Students History
          </span>
        </RouterLink>

      </nav>


      <!-- ================= LOGOUT ================= -->
      <div class="bottom">

        <button
          class="logout-btn"
          type="button"
          @click="openLogoutDialog"
        >
          <LogOut
            :size="19"
            :stroke-width="2"
          />

          <span>
            Logout
          </span>
        </button>

      </div>

    </aside>


    <!-- ================= MAIN ================= -->
    <div class="main">

      <!-- Navbar -->
      <header class="navbar">

        <div class="navbar-left">

          <!-- Mobile Menu -->
          <button
            class="hamburger-btn"
            type="button"
            aria-label="Open menu"
            @click="showMobileMenu = true"
          >
            <Menu
              :size="27"
              :stroke-width="2"
            />
          </button>

          <h1>
            I-SPAS
          </h1>

        </div>


        <!-- About -->
        <button
          class="about-btn"
          type="button"
        >
          <Info
            :size="17"
            :stroke-width="2"
          />

          <span>
            About Us
          </span>
        </button>

      </header>


      <!-- ================= PAGE CONTENT ================= -->
      <main class="content">
        <RouterView />

      </main>

    </div>

  </div>


  <!-- ================= LOGOUT DIALOG ================= -->
  <div
    v-if="showLogoutDialog"
    class="dialog-overlay"
    @click.self="cancelLogout"
  >

    <div class="dialog">

      <div class="dialog-icon">
        <LogOut
          :size="52"
          :stroke-width="1.8"
        />
      </div>

      <h2>
        Logout
      </h2>

      <p>
        Are you sure you want to logout from the Faculty Portal?
      </p>


      <div class="dialog-buttons">

        <button
          class="cancel-btn"
          type="button"
          @click="cancelLogout"
        >
          Cancel
        </button>


        <button
          class="start-btn"
          type="button"
          @click="confirmLogout"
        >
          <LogOut
            :size="17"
            :stroke-width="2"
          />

          <span>
            Logout
          </span>
        </button>

      </div>

    </div>

  </div>

</template>


<script setup lang="ts">

import { ref } from 'vue'
import { useRouter } from 'vue-router'
import api from '../services/api'

import {
  LayoutDashboard,
  FilePlus2,
  Users,
  ClipboardCheck,
  BarChart3,
  History,
  LogOut,
  Menu,
  X,
  Info
} from '@lucide/vue'


const router = useRouter()


const showLogoutDialog = ref(false)

const showMobileMenu = ref(false)



// ==========================================
// OPEN LOGOUT DIALOG
// ==========================================

function openLogoutDialog() {

  showLogoutDialog.value = true

}



// ==========================================
// CANCEL LOGOUT
// ==========================================

function cancelLogout() {

  showLogoutDialog.value = false

}



// ==========================================
// CLOSE MOBILE MENU
// ==========================================

function closeMobileMenu() {

  showMobileMenu.value = false

}



// ==========================================
// CONFIRM LOGOUT
// ==========================================

async function confirmLogout() {

  showLogoutDialog.value = false


  try {

    const token =
      localStorage.getItem('token')


    if (token) {

      await api.post('/logout')

    }

  } catch (error) {

    console.log(
      'Logout API failed, continuing logout.'
    )

  } finally {

    // Clear login data
    localStorage.removeItem('token')

    localStorage.removeItem('user')

    localStorage.removeItem('role')


    // Faculty → main login
    await router.replace('/')

  }

}

</script>


<style scoped>

/* ======================
   GLOBAL
====================== */

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;

  /*
   * Local system fonts only.
   * No Google Fonts request required.
   */
  font-family:
    "Segoe UI",
    Arial,
    Helvetica,
    sans-serif;
}


/* ======================
   LAYOUT
====================== */

.layout {
  display: flex;

  width: 100%;
  height: 100vh;

  overflow: hidden;

  background: #f5fbf6;
}


/* ======================
   SIDEBAR
====================== */

.sidebar {
  width: 220px;
  min-width: 220px;
  max-width: 220px;
  flex: 0 0 220px;

  background: #ffffff;

  border-right:
    1px solid #e6e6e6;

  display: flex;
  flex-direction: column;

  position: relative;

  z-index: 10;
}


/* ======================
   LOGO
====================== */

.logo-section {
  display: flex;

  align-items: center;

  gap: 12px;

  position: relative;

  padding: 22px;

  border-bottom:
    1px solid #ececec;
}


.logo {
  width: 42px;
  height: 42px;

  object-fit: contain;

  flex-shrink: 0;
}


.logo-text {
  min-width: 0;
}


.logo-text h2 {
  font-size: 18px;

  color: #12284c;

  font-weight: 700;

  line-height: 1.2;
}


.logo-text p {
  font-size: 13px;

  color: #6b7280;

  margin-top: 2px;
}


/* ======================
   MOBILE CLOSE BUTTON
====================== */

.close-drawer-btn {
  display: none;

  position: absolute;

  right: 14px;

  top: 50%;

  transform:
    translateY(-50%);

  width: 32px;
  height: 32px;

  border: none;

  border-radius: 8px;

  background: #f3f4f6;

  color: #374151;

  cursor: pointer;

  align-items: center;

  justify-content: center;

  transition:
    background .2s,
    color .2s;
}


.close-drawer-btn:hover {
  background: #e5e7eb;

  color: #111827;
}


/* ======================
   MENU
====================== */

.menu {
  display: flex;

  flex-direction: column;

  padding: 14px;

  gap: 10px;

  overflow-y: auto;
}


.menu a {
  display: flex;

  align-items: center;

  gap: 12px;

  text-decoration: none;

  color: #374151;

  font-size: 15px;

  padding: 14px 16px;

  border-radius: 10px;

  transition:
    background .2s,
    color .2s,
    transform .2s;
}


.menu a svg {
  flex-shrink: 0;
}


.menu a span {
  white-space: nowrap;
}


.menu a:hover {
  background: #edfdf2;

  color: #00b248;

  transform:
    translateX(2px);
}


/* ======================
   ACTIVE ROUTE
====================== */

.menu a.router-link-active {
  background: #eaf9ef;

  color: #00b248 !important;

  font-weight: 600;
}


/* ======================
   LOGOUT AREA
====================== */

.bottom {
  margin-top: auto;

  padding: 18px;

  border-top:
    1px solid #ececec;
}


.logout-btn {
  width: 100%;

  padding: 13px;

  border: none;

  background:
    rgb(222, 0, 0);

  border-radius: 10px;

  cursor: pointer;

  font-size: 14px;

  font-weight: 600;

  transition:
    background .2s,
    transform .2s;

  color: white;

  display: flex;

  align-items: center;

  justify-content: center;

  gap: 9px;
}


.logout-btn:hover {
  background: #ff4d4d;

  transform:
    translateY(-1px);
}


/* ======================
   MAIN
====================== */

.main {
  flex: 1;

  min-width: 0;

  display: flex;

  flex-direction: column;
}


/* ======================
   NAVBAR
====================== */

.navbar {
  height: 70px;

  background: #00c853;

  color: white;

  display: flex;

  justify-content: space-between;

  align-items: center;

  padding: 0 30px;

  flex-shrink: 0;
}


.navbar-left {
  display: flex;

  align-items: center;

  gap: 14px;
}


.navbar h1 {
  font-size: 34px;

  font-weight: 700;

  line-height: 1;
}


/* ======================
   HAMBURGER
====================== */

.hamburger-btn {
  display: none;

  background: none;

  border: none;

  color: white;

  cursor: pointer;

  line-height: 1;

  padding: 4px;

  align-items: center;

  justify-content: center;
}


.hamburger-btn:hover {
  opacity: .85;
}


/* ======================
   ABOUT BUTTON
====================== */

.about-btn {
  border: none;

  background:
    rgba(255, 255, 255, .2);

  color: white;

  padding: 10px 18px;

  border-radius: 8px;

  cursor: pointer;

  transition:
    background .2s,
    color .2s;

  display: flex;

  align-items: center;

  justify-content: center;

  gap: 7px;

  font-weight: 500;
}


.about-btn:hover {
  background: white;

  color: #00c853;
}


/* ======================
   PAGE CONTENT
====================== */

.content {
  flex: 1;

  padding: 0;

  overflow: auto;
}


/* ======================
   MOBILE OVERLAY
====================== */

.mobile-overlay {
  display: none;
}


/* ======================
   LAPTOPS
   1366px and below
====================== */

@media (max-width: 1366px) {

  .sidebar {
    width: 190px;
    min-width: 190px;
    max-width: 190px;
    flex: 0 0 190px;
  }


  .logo-section {
    padding:
      20px 16px;
  }


  .logo {
    width: 38px;
    height: 38px;
  }


  .logo-text h2 {
    font-size: 17px;
  }


  .logo-text p {
    font-size: 12px;
  }


  .menu {
    padding: 10px;

    gap: 8px;
  }


  .menu a {
    font-size: 14px;

    padding:
      13px 12px;

    gap: 10px;
  }


  .menu a svg {
    width: 19px;
    height: 19px;
  }


  .bottom {
    padding: 14px;
  }

}


/* ======================
   TABLET / IPAD
====================== */

@media (max-width: 1024px) {

  .sidebar {
    width: 180px;
    min-width: 180px;
    max-width: 180px;
    flex: 0 0 180px;
  }


  .logo-section {
    padding:
      18px 12px;

    gap: 9px;
  }


  .logo {
    width: 34px;
    height: 34px;
  }


  .logo-text h2 {
    font-size: 15px;
  }


  .logo-text p {
    font-size: 11px;
  }


  .menu {
    padding: 9px;

    gap: 7px;
  }


  .menu a {
    font-size: 13px;

    padding:
      12px 10px;

    gap: 9px;
  }


  .menu a svg {
    width: 18px;
    height: 18px;
  }


  .navbar h1 {
    font-size: 28px;
  }


  .content {
    padding: 24px;
  }

}


/* ======================
   MOBILE
   768px and below
====================== */

@media (max-width: 768px) {

  .sidebar {
    position: fixed;

    top: 0;
    left: 0;

    height: 100vh;

    z-index: 1001;

    width: 260px;
    min-width: 260px;
    max-width: 260px;
    flex: 0 0 260px;

    transform:
      translateX(-100%);

    transition:
      transform .28s ease;

    box-shadow:
      2px 0 20px
      rgba(0, 0, 0, .2);
  }


  .sidebar.sidebar-open {
    transform:
      translateX(0);
  }


  .close-drawer-btn {
    display: flex;
  }


  .mobile-overlay {
    display: block;

    position: fixed;

    inset: 0;

    background:
      rgba(0, 0, 0, .5);

    z-index: 1000;
  }


  .hamburger-btn {
    display: flex;
  }


  .navbar {
    padding:
      0 16px;

    height: 60px;
  }


  .navbar h1 {
    font-size: 22px;
  }


  .about-btn {
    padding:
      8px 12px;

    font-size: 13px;
  }


  .about-btn svg {
    width: 16px;
    height: 16px;
  }


  .content {
    padding: 16px;
  }


  .logo-section {
    padding:
      18px;
  }


  .logo-text h2 {
    font-size: 16px;
  }


  .logo-text p {
    font-size: 12px;
  }


  .menu {
    padding: 14px;

    gap: 8px;
  }


  .menu a {
    padding:
      13px 14px;

    font-size: 14px;

    gap: 12px;
  }

}


/* ======================
   SMALL MOBILE
====================== */

@media (max-width: 480px) {

  .navbar h1 {
    font-size: 19px;
  }


  .about-btn {
    padding:
      7px 10px;

    font-size: 12px;

    gap: 5px;
  }


  .content {
    padding: 12px;
  }


  .dialog {
    width: 90%;

    padding: 22px;
  }

}


/* ======================
   LOGOUT DIALOG OVERLAY
====================== */

.dialog-overlay {
  position: fixed;

  inset: 0;

  background:
    rgba(0, 0, 0, .45);

  display: flex;

  justify-content: center;

  align-items: center;

  z-index: 9999;

  padding: 20px;
}
/* ======================
   LOGOUT DIALOG
====================== */
.dialog {
  width: 420px;
  max-width: 90vw;
  background: #ffffff;
  border-radius: 18px;
  padding: 30px;
  text-align: center;
  box-shadow:
    0 15px 40px
    rgba(0, 0, 0, .25);
}
.dialog-icon {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 15px;
  color: #dc2626;
}
.dialog h2 {
  margin-bottom: 10px;
  color: #112244;
  font-size: 24px;
}
.dialog p {
  color: #666;
  line-height: 1.6;
  font-size: 14px;
}
/* ======================
   DIALOG BUTTONS
====================== */
.dialog-buttons{
  display: flex;
  justify-content: center;
  gap: 15px;
  margin-top: 25px;
}
.cancel-btn {
  padding:12px 28px;
  border: none;
  border-radius: 10px;
  background: #dddddd;
  color: #374151;
  cursor: pointer;
  font-weight: 600;
  transition:
    background .2s;
}
.cancel-btn:hover {
  background: #cccccc;
}
.start-btn {
  padding:
    12px 28px;
  border: none;
  border-radius: 10px;
  background: #dc2626;
  color: white;
  cursor: pointer;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  transition:
    background .2s;
}
.start-btn:hover {
  background: #b91c1c;
}
</style>