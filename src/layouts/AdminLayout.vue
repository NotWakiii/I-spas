<template>
  <div class="admin-layout">

    <!-- ==========================================
         MOBILE OVERLAY
    =========================================== -->
    <div
      v-if="mobileMenuOpen"
      class="mobile-overlay"
      @click="closeMobileMenu"
    ></div>


    <!-- ==========================================
         SIDEBAR
    =========================================== -->
    <aside
      class="sidebar"
      :class="{
        'mobile-open': mobileMenuOpen
      }"
    >

      <!-- SIDEBAR HEADER -->
      <div class="sidebar-header">

        <img
          src="@/assets/logo.png"
          alt="I-SPAS"
          class="logo"
        />

        <div class="brand">
          <strong>
            I-SPAS
          </strong>

          <small>
            Administrator
          </small>
        </div>


        <!-- MOBILE CLOSE -->
        <button
          class="mobile-close-btn"
          @click="closeMobileMenu"
        >
          ✕
        </button>

      </div>


      <!-- ========================================
           NAVIGATION
      ========================================= -->
      <nav class="navigation">

        <RouterLink
          to="/admin/dashboard"
          class="nav-item"
          @click="closeMobileMenu"
        >
          <span>
            Dashboard
          </span>

        </RouterLink>


        <RouterLink
          to="/admin/faculty"
          class="nav-item"
          @click="closeMobileMenu"
        >
          <span>
            Faculty Management
          </span>
        </RouterLink>


        <RouterLink
          to="/admin/exams"
          class="nav-item"
          @click="closeMobileMenu"
        >
          <span>
            Examination Overview
          </span>

        </RouterLink>


        <RouterLink
          to="/admin/results"
          class="nav-item"
          @click="closeMobileMenu"
        >
          <span>
            Results Overview
          </span>

        </RouterLink>
        <RouterLink
          to="/admin/audit-logs"
          class="nav-item"
          @click="closeMobileMenu"
        >
          <span>
            Audit Logs
          </span>
        </RouterLink>

      </nav>


      <!-- ========================================
           LOGOUT
      ========================================= -->
      <div class="sidebar-footer">

        <button
          class="logout-btn"
          :disabled="loggingOut"
          @click="logout"
        >

          <span>
            {{
              loggingOut
                ? 'Logging out...'
                : 'Logout'
            }}
          </span>

        </button>

      </div>

    </aside>


    <!-- ==========================================
         MAIN AREA
    =========================================== -->
    <div class="main-area">

      <!-- ========================================
           TOPBAR
      ========================================= -->
      <header class="topbar">

        <!-- MOBILE BURGER ONLY -->
        <button
          class="menu-btn"
          @click="toggleMobileMenu"
        >
          ☰
        </button>


        <!-- EMPTY SPACE ON DESKTOP -->
        <div class="topbar-spacer"></div>


        <!-- ADMIN INFORMATION -->
        <div class="admin-info">

          <div class="admin-avatar">
            {{ adminInitial }}
          </div>


          <div class="admin-details">

            <strong>
              {{ adminName }}
            </strong>

            <small>
              Administrator
            </small>

          </div>

        </div>

      </header>


      <!-- ========================================
           PAGE CONTENT
      ========================================= -->
      <main class="content">

        <RouterView />

      </main>

    </div>


    <!-- ==========================================
         LOGOUT CONFIRMATION
    =========================================== -->
    <div
      v-if="showLogoutDialog"
      class="dialog-overlay"
      @click.self="
        showLogoutDialog = false
      "
    >

      <div class="dialog">
        <h2>
          Logout?
        </h2>


        <p>
          Are you sure you want to log out
          from the administrator account?
        </p>


        <div class="dialog-actions">

          <button
            class="cancel-btn"
            :disabled="loggingOut"
            @click="
              showLogoutDialog = false
            "
          >
            Cancel
          </button>


          <button
            class="confirm-btn"
            :disabled="loggingOut"
            @click="confirmLogout"
          >
            {{
              loggingOut
                ? 'Logging out...'
                : 'Logout'
            }}
          </button>

        </div>

      </div>

    </div>

  </div>
</template>


<script setup lang="ts">

import {
  computed,
  ref
} from 'vue'

import {
  useRouter
} from 'vue-router'

import api from '../services/api'


const router =
  useRouter()


// ==========================================
// UI STATE
// ==========================================

const mobileMenuOpen =
  ref(false)

const showLogoutDialog =
  ref(false)

const loggingOut =
  ref(false)


// ==========================================
// MOBILE MENU
// ==========================================

function toggleMobileMenu() {

  mobileMenuOpen.value =
    !mobileMenuOpen.value

}


function closeMobileMenu() {

  mobileMenuOpen.value =
    false

}


// ==========================================
// ADMIN DATA
// ==========================================

interface StoredUser {
  id?: number
  name?: string
  email?: string
  role?: string
}


const storedUser =
  localStorage.getItem(
    'user'
  )


let user:
  StoredUser | null =
  null


try {

  user =
    storedUser
      ? JSON.parse(
          storedUser
        ) as StoredUser
      : null

} catch (error) {

  console.error(
    'Invalid stored admin user:',
    error
  )

  user = null

}


// ==========================================
// ADMIN NAME
// ==========================================

const adminName =
  computed(() => {

    return (
      user?.name ||
      'Administrator'
    )

  })


// ==========================================
// ADMIN INITIAL
// ==========================================

const adminInitial =
  computed(() => {

    const name =
      adminName.value
        .trim()


    if (!name) {
      return 'A'
    }


    return name
      .charAt(0)
      .toUpperCase()

  })


// ==========================================
// LOGOUT
// ==========================================

function logout() {

  showLogoutDialog.value =
    true

}


async function confirmLogout() {

  if (
    loggingOut.value
  ) {
    return
  }


  loggingOut.value =
    true


  try {

    await api.post(
      '/logout'
    )

  } catch (error) {

    /*
     * Even if the API request fails,
     * remove local authentication.
     */
    console.error(
      'ADMIN LOGOUT ERROR:',
      error
    )

  } finally {

    // CLEAR AUTH DATA
    localStorage.removeItem(
      'token'
    )

    localStorage.removeItem(
      'user'
    )

    localStorage.removeItem(
      'role'
    )


    showLogoutDialog.value =
      false

    mobileMenuOpen.value =
      false

    loggingOut.value =
      false


    await router.replace(
      '/admin/login'
    )

  }

}

</script>


<style scoped>

* {
  box-sizing: border-box;
}


/* ==========================================
   ADMIN LAYOUT
========================================== */

.admin-layout {
  width: 100%;

  min-height: 100vh;

  display: flex;

  background: #f4fbf6;

  font-family:
    'Poppins',
    sans-serif;

  color: #0f172a;
}


/* ==========================================
   MOBILE OVERLAY
========================================== */

.mobile-overlay {
  display: none;
}


/* ==========================================
   SIDEBAR
========================================== */

.sidebar {
  position: fixed;

  top: 0;
  left: 0;
  bottom: 0;

  width: 255px;

  display: flex;

  flex-direction: column;

  background: #ffffff;

  border-right:
    1px solid #e2e8f0;

  box-shadow:
    4px 0 18px
    rgba(
      15,
      23,
      42,
      .04
    );

  z-index: 100;
}


/* ==========================================
   SIDEBAR HEADER
========================================== */

.sidebar-header {
  position: relative;

  height: 85px;

  padding:
    15px 18px;

  display: flex;

  align-items: center;

  gap: 12px;

  border-bottom:
    1px solid #f1f5f9;
}


.logo {
  width: 47px;

  height: 47px;

  flex-shrink: 0;

  object-fit: contain;
}


.brand {
  display: flex;

  flex-direction: column;

  white-space: nowrap;
}


.brand strong {
  color: #15803d;

  font-size: 20px;

  font-weight: 800;
}


.brand small {
  margin-top: 1px;

  color: #64748b;

  font-size: 10px;
}


/* ==========================================
   MOBILE CLOSE BUTTON
========================================== */

.mobile-close-btn {
  display: none;

  position: absolute;

  right: 14px;

  top: 50%;

  transform:
    translateY(-50%);

  width: 34px;

  height: 34px;

  border: none;

  border-radius: 8px;

  background: #f1f5f9;

  color: #334155;

  font-size: 15px;

  font-weight: 700;

  cursor: pointer;
}


.mobile-close-btn:hover {
  background: #fee2e2;

  color: #dc2626;
}


/* ==========================================
   NAVIGATION
========================================== */

.navigation {
  flex: 1;

  padding:
    20px 12px;

  display: flex;

  flex-direction: column;

  gap: 7px;

  overflow-y: auto;
}


.nav-item {
  min-height: 48px;

  padding:
    0 14px;

  display: flex;

  align-items: center;

  gap: 13px;

  color: #475569;

  text-decoration: none;

  border-radius: 9px;

  font-size: 13px;

  font-weight: 600;

  white-space: nowrap;

  transition:
    background .2s ease,
    color .2s ease;
}


.nav-item:hover {
  background: #f0fdf4;

  color: #15803d;
}


.nav-item.router-link-active {
  background: #dcfce7;

  color: #15803d;

  font-weight: 700;
}


.nav-icon {
  width: 26px;

  min-width: 26px;

  text-align: center;

  font-size: 19px;
}


/* ==========================================
   SIDEBAR FOOTER
========================================== */

.sidebar-footer {
  padding:
    14px 12px;

  border-top:
    1px solid #f1f5f9;
}


.logout-btn {
  width: 100%;

  min-height: 46px;

  border: none;

  border-radius: 9px;

  padding:
    0 14px;

  display: flex;

  align-items: center;

  gap: 13px;

  background: #fef2f2;

  color: #dc2626;

  font-size: 13px;

  font-weight: 700;

  cursor: pointer;

  transition:
    background .2s ease;
}


.logout-btn:hover:not(:disabled) {
  background: #fee2e2;
}


.logout-btn:disabled {
  opacity: .6;

  cursor: not-allowed;
}


/* ==========================================
   MAIN AREA
========================================== */

.main-area {
  width: 100%;

  min-height: 100vh;

  margin-left: 255px;
}


/* ==========================================
   TOPBAR
========================================== */

.topbar {
  position: sticky;

  top: 0;

  height: 70px;

  padding:
    0 28px;

  display: flex;

  align-items: center;

  justify-content:
    space-between;

  background:
    rgba(
      255,
      255,
      255,
      .96
    );

  border-bottom:
    1px solid #e2e8f0;

  backdrop-filter:
    blur(10px);

  -webkit-backdrop-filter:
    blur(10px);

  z-index: 50;
}


/* ==========================================
   BURGER BUTTON
   HIDDEN ON DESKTOP
========================================== */

.menu-btn {
  display: none;

  width: 40px;

  height: 40px;

  border: none;

  border-radius: 8px;

  background: #f1f5f9;

  color: #334155;

  font-size: 20px;

  cursor: pointer;

  transition:
    background .2s ease,
    color .2s ease;
}


.menu-btn:hover {
  background: #dcfce7;

  color: #15803d;
}


/* ==========================================
   TOPBAR SPACER
========================================== */

.topbar-spacer {
  flex: 1;
}


/* ==========================================
   ADMIN INFORMATION
========================================== */

.admin-info {
  display: flex;

  align-items: center;

  gap: 10px;
}


.admin-avatar {
  width: 38px;

  height: 38px;

  display: flex;

  align-items: center;

  justify-content: center;

  border-radius: 50%;

  background: #16a34a;

  color: white;

  font-size: 14px;

  font-weight: 800;

  flex-shrink: 0;
}


.admin-details {
  display: flex;

  flex-direction: column;
}


.admin-details strong {
  color: #0f172a;

  font-size: 12px;
}


.admin-details small {
  color: #64748b;

  font-size: 9px;
}


/* ==========================================
   CONTENT
========================================== */

.content {
  width: 100%;

  min-height:
    calc(
      100vh - 70px
    );
}


.content :deep(.dashboard),
.content :deep(.faculty-page),
.content :deep(.exam-page),
.content :deep(.results-page) {

  min-height:
    calc(
      100vh - 70px
    );

}


/* ==========================================
   LOGOUT DIALOG OVERLAY
========================================== */

.dialog-overlay {
  position: fixed;

  inset: 0;

  z-index: 10000;

  display: flex;

  align-items: center;

  justify-content: center;

  padding: 20px;

  background:
    rgba(
      15,
      23,
      42,
      .55
    );

  backdrop-filter:
    blur(5px);

  -webkit-backdrop-filter:
    blur(5px);
}


/* ==========================================
   LOGOUT DIALOG
========================================== */

.dialog {
  width: 410px;

  max-width: 100%;

  padding: 30px;

  background: white;

  border-radius: 16px;

  text-align: center;

  box-shadow:
    0 20px 55px
    rgba(
      0,
      0,
      0,
      .25
    );
}


.dialog-icon {
  width: 65px;

  height: 65px;

  margin:
    0 auto 15px;

  border-radius: 50%;

  display: flex;

  align-items: center;

  justify-content: center;

  background: #fee2e2;

  font-size: 28px;
}


.dialog h2 {
  margin:
    0 0 8px;

  color: #0f172a;
}


.dialog p {
  margin: 0;

  color: #64748b;

  font-size: 13px;

  line-height: 1.6;
}


/* ==========================================
   DIALOG BUTTONS
========================================== */

.dialog-actions {
  margin-top: 24px;

  display: flex;

  gap: 10px;
}


.cancel-btn,
.confirm-btn {
  flex: 1;

  border: none;

  padding: 11px;

  border-radius: 8px;

  font-weight: 700;

  cursor: pointer;
}


.cancel-btn {
  background: #e2e8f0;

  color: #475569;
}


.cancel-btn:hover:not(:disabled) {
  background: #cbd5e1;
}


.confirm-btn {
  background: #dc2626;

  color: white;
}


.confirm-btn:hover:not(:disabled) {
  background: #b91c1c;
}


.cancel-btn:disabled,
.confirm-btn:disabled {
  opacity: .6;

  cursor: not-allowed;
}


/* ==========================================
   MOBILE
========================================== */

@media(max-width: 768px) {

  /* ========================================
     SIDEBAR BECOMES DRAWER
  ========================================= */

  .sidebar {
    width: 260px;

    min-width: 260px;

    max-width: 260px;

    transform:
      translateX(-100%);

    transition:
      transform .28s ease;

    box-shadow:
      2px 0 20px
      rgba(
        0,
        0,
        0,
        .2
      );

    z-index: 101;
  }


  .sidebar.mobile-open {
    transform:
      translateX(0);
  }


  /* ========================================
     MOBILE CLOSE
  ========================================= */

  .mobile-close-btn {
    display: flex;

    align-items: center;

    justify-content: center;
  }


  /* ========================================
     MOBILE OVERLAY
  ========================================= */

  .mobile-overlay {
    display: block;

    position: fixed;

    inset: 0;

    background:
      rgba(
        0,
        0,
        0,
        .5
      );

    z-index: 99;
  }


  /* ========================================
     MAIN TAKES FULL WIDTH
  ========================================= */

  .main-area {
    margin-left: 0;
  }


  /* ========================================
     TOPBAR
  ========================================= */

  .topbar {
    height: 60px;

    padding:
      0 16px;
  }


  /* ========================================
     SHOW BURGER ON MOBILE ONLY
  ========================================= */

  .menu-btn {
    display: flex;

    align-items: center;

    justify-content: center;

    flex-shrink: 0;
  }


  .topbar-spacer {
    display: block;
  }


  /* ========================================
     ADMIN INFO
  ========================================= */

  .admin-details {
    display: none;
  }


  /* ========================================
     CONTENT
  ========================================= */

  .content {
    min-height:
      calc(
        100vh - 60px
      );
  }


  .content :deep(.dashboard),
  .content :deep(.faculty-page),
  .content :deep(.exam-page),
  .content :deep(.results-page) {

    min-height:
      calc(
        100vh - 60px
      );

  }

}


/* ==========================================
   SMALL MOBILE
========================================== */

@media(max-width: 480px) {

  .sidebar {
    width: 85vw;

    min-width: 85vw;

    max-width: 300px;
  }


  .dialog {
    padding: 22px;
  }


  .dialog-actions {
    flex-direction: column;
  }

}
</style>
