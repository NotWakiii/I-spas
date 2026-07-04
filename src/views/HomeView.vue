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
   <button
  class="role-btn"
  @click="showFacultyLogin = true"
>
  🎓 FACULTY
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

  <div
  v-if="showFacultyLogin"
  class="login-overlay"
>
  <div class="login-modal">
    <h2>Faculty Login</h2>
    <p>Enter your assigned username and password.</p>

    <input
      v-model="username"
      type="text"
      placeholder="Username"
    >

    <input
      v-model="password"
      type="password"
      placeholder="Password"
    >

    <div
      v-if="loginError"
      class="error"
    >
      {{ loginError }}
    </div>

    <div class="login-actions">
      <button
        class="cancel-btn"
        @click="closeLogin"
      >
        Cancel
      </button>

      <button
        class="login-btn"
        @click="facultyLogin"
      >
        Login
      </button>
    </div>
  </div>
</div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()

onMounted(() => {
  const token = localStorage.getItem('token')

  if (!token) {
    router.push('/')
  }
})

const showFacultyLogin = ref(false)
const username = ref('')
const password = ref('')
const loginError = ref('')

function closeLogin() {
  showFacultyLogin.value = false
  username.value = ''
  password.value = ''
  loginError.value = ''
}

async function facultyLogin() {
  loginError.value = ''

  if (!username.value || !password.value) {
    loginError.value = 'Please enter username and password.'
    return
  }

  try {
    const response = await axios.post('http://127.0.0.1:8000/api/login', {
      name: username.value,
      password: password.value
    })

    localStorage.setItem('token', response.data.token)
    localStorage.setItem('user', JSON.stringify(response.data.user))

    router.push('/faculty/dashboard')
  } catch (error) {
    loginError.value = 'Invalid username or password.'
  }
}
</script>

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
  padding:24px;
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

.container{
  position:relative;
  z-index:1;
  width:min(100%, 980px);
  min-height:560px;
  max-height:88vh;
  display:flex;
  border-radius:24px;
  overflow:hidden;
  box-shadow:0 22px 55px rgba(0,0,0,.35);
  animation:fadeIn .8s ease;
}

.left{
  width:50%;
  background:rgba(255,255,255,.95);
  backdrop-filter:blur(8px);
  display:flex;
  justify-content:center;
  align-items:center;
  padding:40px;
}

.content{
  width:100%;
  max-width:390px;
  text-align:center;
}

.content h1{
  font-size:clamp(34px, 4vw, 46px);
  font-weight:800;
  color:#111;
  margin-bottom:14px;
}

.welcome{
  color:#07b34d;
  font-size:16px;
  margin-bottom:42px;
}

.role-btn{
  width:100%;
  height:58px;
  border:2px solid #00c853;
  background:#f2fff5;
  border-radius:50px;
  margin-bottom:16px;
  cursor:pointer;
  font-size:20px;
  font-weight:700;
  transition:.25s;
  display:flex;
  justify-content:center;
  align-items:center;
  gap:12px;
}

.role-btn:hover{
  background:#00c853;
  color:white;
  transform:translateY(-3px);
  box-shadow:0 10px 25px rgba(0,200,83,.35);
}

.icon{
  font-size:20px;
}

.help{
  margin-top:28px;
  color:#666;
  font-size:13px;
}

.help span{
  color:#06b34d;
  font-weight:700;
}

.right{
  width:50%;
  background:#05cf59;
  color:white;
  display:flex;
  flex-direction:column;
  justify-content:center;
  padding:42px 48px;
}

.logo-container{
  display:flex;
  justify-content:center;
  margin-bottom:18px;
}

.logo{
  width:105px;
}

.right h2{
  font-size:clamp(42px, 5vw, 56px);
  font-weight:800;
  text-align:center;
  margin-bottom:18px;
}

.subtitle{
  font-size:18px;
  line-height:1.5;
  margin-bottom:24px;
}

.description{
  background:rgba(255,255,255,.16);
  backdrop-filter:blur(10px);
  border:1px solid rgba(255,255,255,.25);
  border-radius:12px;
  padding:24px;
  line-height:1.8;
  font-size:13px;
}

.login-overlay{
  position:fixed;
  inset:0;
  background:rgba(0,0,0,.55);
  backdrop-filter:blur(5px);
  display:flex;
  justify-content:center;
  align-items:center;
  z-index:9999;
}

.login-modal{
  width:420px;
  max-width:92%;
  background:white;
  border-radius:20px;
  padding:35px;
  text-align:center;
  box-shadow:0 20px 45px rgba(0,0,0,.25);
}

.login-modal h2{
  color:#112244;
  margin-bottom:10px;
}

.login-modal p{
  color:#666;
  margin-bottom:25px;
}

.login-modal input{
  width:100%;
  padding:14px;
  margin-bottom:15px;
  border:1px solid #ddd;
  border-radius:10px;
  outline:none;
}

.login-modal input:focus{
  border-color:#00c853;
}

.error{
  color:#dc2626;
  font-size:14px;
  margin-bottom:15px;
}

.login-actions{
  display:flex;
  gap:15px;
}

.cancel-btn,
.login-btn{
  flex:1;
  border:none;
  padding:14px;
  border-radius:10px;
  cursor:pointer;
  font-weight:600;
}

.cancel-btn{
  background:#e5e7eb;
}

.login-btn{
  background:#00c853;
  color:white;
}

@media(max-width:960px){
  .page{
    padding:18px;
    align-items:flex-start;
  }

  .container{
    flex-direction:column;
    width:min(100%, 760px);
    min-height:auto;
    max-height:none;
  }

  .left,
  .right{
    width:100%;
  }

  .left{
    padding:42px 28px;
  }

  .right{
    padding:38px 32px;
  }

  .content{
    max-width:430px;
  }

  .logo{
    width:88px;
  }

  .subtitle{
    text-align:center;
  }
}

@media(max-width:600px){
  .page{
    padding:12px;
  }

  .container{
    border-radius:18px;
  }

  .left{
    padding:36px 22px;
  }

  .right{
    padding:34px 24px;
  }

  .role-btn{
    height:54px;
    font-size:18px;
  }

  .description{
    padding:20px;
    font-size:12px;
  }

  .login-actions{
    flex-direction:column;
  }
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