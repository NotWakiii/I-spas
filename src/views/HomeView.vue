<template>
  <div class="page">

    <div class="container">

      <!-- LEFT PANEL -->
      <div class="left">

        <div class="content">

          <h1>CHOOSE TO CONTINUE</h1>

          <p class="welcome">
            WELCOME BACK TO I-SPAS
          </p>

          <button class="role-btn">
            <span class="icon">👥</span>
            STUDENT
          </button>

          <button class="role-btn">
            <span class="icon">🎓</span>
            FACULTY
          </button>

          <p class="help">
            Need Help?
            <span>Seek for your assigned professor</span>
          </p>

        </div>

      </div>

      <!-- RIGHT PANEL -->
      <div class="right">

        <div class="logo-container">
          <img
            src="@/assets/logo.png"
            class="logo"
            alt="Logo"
          />
        </div>

        <h2>I-SPAS</h2>

        <p class="subtitle">
          An Intranet-Based Student Performance Assessment System
        </p>

        <div class="description">
          This is I-SPAS, an advanced offline examination and assessment
          platform designed for educational institutions.

          Conduct secure, real-time monitored exams with automatic grading,
          comprehensive item analysis, and detailed performance tracking.

          Built for seamless operation on local networks without requiring
          internet connectivity, ensuring data privacy and system reliability.
        </div>

      </div>

    </div>

  </div>
</template>

<style scoped>

@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap');

*{
    margin:0;
    padding:0;
    box-sizing:border-box;
    font-family:'Poppins',sans-serif;
}



.page{

    position:relative;

    width:100%;
    min-height:100vh;

    display:flex;
    justify-content:center;
    align-items:center;

    padding:40px;

    overflow:hidden;
}

.page::before{

    content:"";

    position:absolute;
    inset:0;

    background-image:url("@/assets/backgroundssj.jpg");

    background-size:cover;
    background-position:center;
    background-repeat:no-repeat;

    filter:blur(12px);

    transform:scale(1.08);

    z-index:-2;

}

.page::after{

    content:"";

    position:absolute;
    inset:0;

    background:rgba(0,0,0,.18);

    z-index:-1;

}

/* MAIN CARD */

.container{

    position:relative;

    z-index:1;

    width:100%;
    max-width:1120px;

    height:700px;

    display:flex;

    border-radius:30px;

    overflow:hidden;

    box-shadow:
    0 25px 60px rgba(0,0,0,.35);

}



.left{

    width:50%;

   background:rgba(255,255,255,.95);

backdrop-filter:blur(8px);

    display:flex;
    justify-content:center;
    align-items:center;

}

.content{

    width:80%;
    text-align:center;

}

.content h1{

    font-size:48px;
    font-weight:700;
    color:#111;

    margin-bottom:12px;

}

.welcome{

    color:#07b34d;

    font-size:18px;

    margin-bottom:55px;

}



.role-btn{

    width:100%;
    height:65px;

    border:2px solid #00c853;

    background:#f2fff5;
    border-radius:50px;

    margin-bottom:18px;

    cursor:pointer;

    font-size:22px;
    font-weight:600;

    transition:.25s;

    display:flex;
    justify-content:center;
    align-items:center;
    gap:12px;

}

.role-btn:hover{

    background:#00c853;

    color:white;

    transform:translateY(-4px);

    box-shadow:0 10px 25px rgba(0,200,83,.35);

}

.icon{

    font-size:22px;

}

.help{

    margin-top:35px;

    color:#666;

    font-size:14px;

}

.help span{

    color:#06b34d;

    font-weight:600;

}

/* RIGHT */

.right{

    width:50%;

    background:#05cf59;

    color:white;

    display:flex;
    flex-direction:column;
    justify-content:center;

    padding:60px;

}



.logo-container{

    display:flex;
    justify-content:center;

    margin-bottom:25px;

}

.logo{

    width:135px;

}



.right h2{

    font-size:60px;

    font-weight:700;

    text-align:center;

    margin-bottom:20px;

}



.subtitle{

    font-size:20px;

    line-height:1.6;

    margin-bottom:28px;

}



.description{

   background:rgba(255,255,255,.16);

backdrop-filter:blur(10px);

border:1px solid rgba(255,255,255,.25);

    border-radius:12px;

    padding:30px;

    line-height:2;

    font-size:14px;

}

/* RESPONSIVE */

@media(max-width:960px){

.container{

    flex-direction:column;

    height:auto;

}

.left,
.right{

    width:100%;

}

.left{

    padding:60px 0;

}

.right{

    padding:40px;

}

.content{

    width:90%;

}

.content h1{

    font-size:36px;

}

.right h2{

    font-size:42px;

}

.subtitle{

    font-size:18px;

}

.logo{

    width:90px;

}

}

.container{

    animation:fadeIn .8s ease;
}

@keyframes fadeIn{

    from{

        opacity:0;
        transform:translateY(20px);

    }

    to{

        opacity:1;
        transform:translateY(0);

    }

}

</style>