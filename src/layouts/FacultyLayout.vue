<template>
  <div class="layout">

    <!-- ================= MOBILE OVERLAY ================= -->
    <div
      v-if="showMobileMenu"
      class="mobile-overlay"
      @click="closeMobileMenu"
    ></div>

    <!-- ================= SIDEBAR ================= -->

    <aside class="sidebar" :class="{ 'sidebar-open': showMobileMenu }">

      <!-- Logo -->
      <div class="logo-section">

        <img
          src="@/assets/logo.png"
          alt="Logo"
          class="logo"
        />

        <div class="logo-text">
          <h2>I-SPAS</h2>
          <p>Faculty Portal</p>
        </div>

        <button class="close-drawer-btn" @click="closeMobileMenu">
          ✕
        </button>

      </div>

      <!-- Navigation -->

  <nav class="menu">

    <RouterLink to="/faculty/dashboard" @click="closeMobileMenu">
      🏠 Dashboard
    </RouterLink>

    <RouterLink to="/faculty/create-exam" @click="closeMobileMenu">
      📝 Create Exam
    </RouterLink>
    <RouterLink to="/faculty/classes" @click="closeMobileMenu">
      🏫 Class Management
    </RouterLink>
    <RouterLink to="/faculty/exam-results" @click="closeMobileMenu">
      📋 Exam Results
    </RouterLink>

    <RouterLink to="/faculty/item-analysis" @click="closeMobileMenu">
      📊 Item Analysis
    </RouterLink>

    <RouterLink to="/faculty/student-history" @click="closeMobileMenu">
      👥 Students History
    </RouterLink>

  </nav>


      <!-- Logout -->

      <div class="bottom">

        <button
    class="logout-btn"
    @click="openLogoutDialog"
>
    ↩ Logout
</button>

      </div>

    </aside>

    <!-- ================= MAIN ================= -->

    <div class="main">

      <!-- Navbar -->

      <header class="navbar">

        <div class="navbar-left">
          <button class="hamburger-btn" @click="showMobileMenu = true">
            ☰
          </button>
          <h1>I-SPAS</h1>
        </div>

        <button class="about-btn">
          About Us
        </button>

      </header>

      <!-- Page Content -->

      <main class="content">

        <RouterView />

      </main>

    </div>

  </div>

  <div
    v-if="showLogoutDialog"
    class="dialog-overlay"
>
    <div class="dialog">

        <div class="dialog-icon">

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
                @click="cancelLogout"
            >
                Cancel
            </button>


            <button
                class="start-btn"
                @click="confirmLogout"
            >
                Logout
            </button>

        </div>

    </div>
</div>
</template>



<script setup lang="ts">

import { ref } from 'vue'
import { useRouter } from 'vue-router'
import api from '../services/api'

const router = useRouter()

const showLogoutDialog = ref(false)
const showMobileMenu = ref(false)

function openLogoutDialog() {
    showLogoutDialog.value = true
}

function cancelLogout() {
    showLogoutDialog.value = false
}

function closeMobileMenu() {
    showMobileMenu.value = false
}

async function confirmLogout() {

    showLogoutDialog.value = false

    try {

        const token = localStorage.getItem('token')

        if (token) {
            await api.post('/logout')
        }

    } catch (error) {

        console.log(
            'Logout API failed, continuing logout.'
        )

    } finally {

        // CLEAR ALL LOGIN DATA
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        localStorage.removeItem('role')

        // FACULTY → MAIN LOGIN
        await router.replace('/')

    }

}

</script>



<style scoped>

*{
    margin:0;
    padding:0;
    box-sizing:border-box;
    font-family:'Poppins',sans-serif;
}

/* ======================
   LAYOUT
====================== */

.layout{
    display:flex;
    width:100%;
    height:100vh;
    overflow:hidden;
    background:#f5fbf6;
}

/* ======================
   SIDEBAR
====================== */

.sidebar{
    width:220px;
    min-width:220px;
    max-width:220px;
    flex:0 0 220px;

    background:#ffffff;
    border-right:1px solid #e6e6e6;

    display:flex;
    flex-direction:column;
}

/* Logo */

.logo-section{
    display:flex;
    align-items:center;
    gap:12px;
    position:relative;

    padding:22px;

    border-bottom:1px solid #ececec;
}

.logo{
    width:42px;
    height:42px;
}

.logo-text h2{
    font-size:18px;
    color:#12284c;
    font-weight:700;
}

.logo-text p{
    font-size:13px;
    color:#6b7280;
    margin-top:2px;
}

.close-drawer-btn{
    display:none;
    position:absolute;
    right:14px;
    top:50%;
    transform:translateY(-50%);

    width:32px;
    height:32px;
    border:none;
    border-radius:8px;
    background:#f3f4f6;
    color:#374151;
    font-size:16px;
    cursor:pointer;
}

/* Menu */

.menu{
    display:flex;
    flex-direction:column;
    padding:14px;
    gap:20px;
    overflow-y:auto;
}

.menu a{
    display:flex;
    align-items:center;

    text-decoration:none;
    color:#374151;

    font-size:15px;

    padding:14px 16px;

    border-radius:10px;

    transition:.25s;
}

.menu a:hover{
    background:#edfdf2;
    color:#00b248;
}

/* Active */

.router-link-active{
    background:#eaf9ef;
    color:#00b248 !important;
    font-weight:600;
}

/* Bottom */

.bottom{
    margin-top:auto;
    padding:18px;
    border-top:1px solid #ececec;
}

.logout-btn{
    width:100%;
    padding:13px;
    border:none;
    background:rgb(222, 0, 0);
    border-radius:10px;
    cursor:pointer;
    font-size:14px;
    transition:.3s;
    color: white;
}

.logout-btn:hover{
    background:#ff4d4d;
    color:white;
}

/* ======================
   MAIN
====================== */

.main{
    flex:1;
    min-width:0;

    display:flex;
    flex-direction:column;
}

/* Navbar */

.navbar{
    height:70px;

    background:#00c853;

    color:white;

    display:flex;
    justify-content:space-between;
    align-items:center;

    padding:0 30px;

    flex-shrink:0;
}

.navbar-left{
    display:flex;
    align-items:center;
    gap:14px;
}

.hamburger-btn{
    display:none;
    background:none;
    border:none;
    color:white;
    font-size:26px;
    cursor:pointer;
    line-height:1;
    padding:4px;
}

.navbar h1{
    font-size:34px;
}

.about-btn{
    border:none;

    background:rgba(255,255,255,.2);

    color:white;

    padding:10px 18px;

    border-radius:8px;

    cursor:pointer;

    transition:.3s;
}

.about-btn:hover{
    background:white;
    color:#00c853;
}

/* Content */

.content{
    flex:1;
    padding:px;
    overflow:auto;
}

/* Mobile overlay backdrop */

.mobile-overlay{
    display:none;
}

/* ======================
   LAPTOPS (1366px below)
====================== */

@media (max-width:1366px){

    .sidebar{
        width:180px;
        min-width:180px;
        max-width:180px;
        flex:0 0 180px;
    }

    .logo{
        width:38px;
        height:38px;
    }

    .logo-text h2{
        font-size:17px;
    }

    .logo-text p{
        font-size:12px;
    }

    .menu a{
        font-size:14px;
        padding:13px 14px;
    }
}


/* ======================
   iPad
====================== */

@media (max-width:1024px){

    .sidebar{
        width:170px;
        min-width:170px;
        max-width:170px;
        flex:0 0 170px;
    }

    .logo-section{
        padding:18px 14px;
    }

    .logo{
        width:34px;
        height:34px;
    }

    .logo-text h2{
        font-size:15px;
    }

    .logo-text p{
        font-size:11px;
    }

    .menu{
        padding:10px;
        gap:16px;
    }

    .menu a{
        font-size:13px;
        padding:12px;
    }

    .navbar h1{
        font-size:28px;
    }

    .content{
        padding:24px;
    }
}

/* ======================
   MOBILE (768px and below)
====================== */

@media (max-width:768px){

    .sidebar{
        position:fixed;
        top:0;
        left:0;
        height:100vh;
        z-index:1001;

        width:260px;
        min-width:260px;
        max-width:260px;
        flex:0 0 260px;

        transform:translateX(-100%);
        transition:transform .28s ease;

        box-shadow:2px 0 20px rgba(0,0,0,.2);
    }

    .sidebar.sidebar-open{
        transform:translateX(0);
    }

    .close-drawer-btn{
        display:block;
    }

    .mobile-overlay{
        display:block;
        position:fixed;
        inset:0;
        background:rgba(0,0,0,.5);
        z-index:1000;
    }

    .hamburger-btn{
        display:block;
    }

    .navbar{
        padding:0 16px;
        height:60px;
    }

    .navbar h1{
        font-size:22px;
    }

    .about-btn{
        padding:8px 12px;
        font-size:13px;
    }

    .content{
        padding:16px;
    }

    .logo-text h2{
        font-size:16px;
    }

    .logo-text p{
        font-size:12px;
    }
}

@media (max-width:480px){

    .navbar h1{
        font-size:19px;
    }

    .about-btn{
        padding:7px 10px;
        font-size:12px;
    }

    .content{
        padding:12px;
    }

    .dialog{
        width:90%;
        padding:22px;
    }
}

.dialog-overlay{
    position:fixed;
    inset:0;
    background:rgba(0,0,0,.45);
    display:flex;
    justify-content:center;
    align-items:center;
    z-index:9999;
}

.dialog{
    width:420px;
    max-width:90vw;
    background:#fff;
    border-radius:18px;
    padding:30px;
    text-align:center;
    box-shadow:0 15px 40px rgba(0,0,0,.25);
}

.dialog-icon{
    font-size:55px;
    margin-bottom:15px;
}

.dialog h2{
    margin-bottom:10px;
    color:#112244;
}

.dialog p{
    color:#666;
    line-height:1.6;
}

.dialog-buttons{
    display:flex;
    justify-content:center;
    gap:15px;
    margin-top:25px;
}

.cancel-btn{
    padding:12px 28px;
    border:none;
    border-radius:10px;
    background:#ddd;
    cursor:pointer;
}

.cancel-btn:hover{
    background:#ccc;
}

.start-btn{
    padding:12px 28px;
    border:none;
    border-radius:10px;
    background:#16a34a;
    color:white;
    cursor:pointer;
}

.start-btn:hover{
    background:#15803d;
}

</style>
