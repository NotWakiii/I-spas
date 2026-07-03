<template>
  <div class="layout">

    <!-- ================= SIDEBAR ================= -->

    <aside class="sidebar">

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

      </div>

      <!-- Navigation -->

      <nav class="menu">

        <RouterLink to="/faculty/dashboard">
          🏠 Dashboard
        </RouterLink>

       <RouterLink to="/faculty/create-exam">
    📝 Create Exam
</RouterLink>

        <RouterLink to="/faculty/item-analysis">
          📊 Item Analysis
        </RouterLink>


        <RouterLink to="/faculty/student-history">
          👥 Students History
        </RouterLink>

      </nav>

      <!-- Logout -->

      <div class="bottom">

        <button class="logout">
           ↩  Logout
        </button>

      </div>

    </aside>

    <!-- ================= MAIN ================= -->

    <div class="main">

      <!-- Navbar -->

      <header class="navbar">

        <h1>I-SPAS</h1>

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
</template>

<script setup lang="ts">
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

/* Menu */

.menu{
    display:flex;
    flex-direction:column;
    padding:14px;
    gap:20px;
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

.logout{
    width:100%;
    padding:14px;

    border:none;

    background:#f4f4f4;

    border-radius:10px;

    cursor:pointer;

    font-size:15px;

    transition:.3s;
}

.logout:hover{
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

</style>