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
          <button
            class="role-btn"
            @click="$router.push('/student')"
          >
            <GraduationCap :size="22" />
            <span>STUDENT</span>
          </button>
          <button
            class="role-btn"
            @click="showFacultyLogin = true"
          >
            <UserRound :size="22" />
            <span>FACULTY</span>
          </button>
          <p class="help">
            Need Help?
            <span>Seek for your assigned professor</span>
          </p>
        </div>
      </div>
      <!-- RIGHT PANEL -->
      <div class="right">
        <div class="right-content">
          <div class="logo-container">
            <img
              src="@/assets/logo.png"
              class="logo"
              alt="I-SPAS Logo"
            />
          </div>
          <h2>I-SPAS</h2>
          <p class="subtitle">
            An Intranet-Based Student Performance Assessment System
          </p>
          <div class="description">
            This is I-SPAS, an advanced offline examination assessment
            platform designed for educational institutions.
            Conduct secure, real-time monitored exams with automatic grading,
            comprehensive item analysis, and detailed performance tracking.
            Built for seamless operation on local networks without requiring
            internet connectivity, ensuring data privacy and system reliability.
          </div>
        </div>
      </div>
    </div>
  </div>
  <!-- FACULTY LOGIN MODAL -->
  <div
    v-if="showFacultyLogin"
    class="login-overlay"
    @click.self="closeLogin"
  >
    <div class="login-modal">
      <div class="login-icon">
        <UserRound :size="28" />
      </div>
      <h2>Faculty Login</h2>
      <p class="login-description">
        Enter your assigned email and password.
      </p>
      <form @submit.prevent="facultyLogin">
        <!-- EMAIL -->
        <div class="input-group">
          <label for="email">
            Email
          </label>
          <input
            id="email"
            v-model="email"
            type="email"
            placeholder="Enter your email"
            autocomplete="email"
          />
        </div>
        <!-- PASSWORD -->
        <div class="input-group">
          <label for="password">
            Password
          </label>
          <div class="password-wrapper">
            <input
              id="password"
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="Enter your password"
              autocomplete="current-password"
            />
            <button
              type="button"
              class="eye-btn"
              :aria-label="showPassword ? 'Hide password' : 'Show password'"
              @click="showPassword = !showPassword"
            >
              <EyeOff
                v-if="showPassword"
                :size="21"
              />
              <Eye
                v-else
                :size="21"
              />
            </button>
          </div>
        </div>
        <!-- LOGIN ERROR -->
        <div
          v-if="loginError"
          class="error"
        >
          {{ loginError }}
        </div>
        <!-- BUTTONS -->
        <div class="login-actions">
          <button
              type="submit"
              class="login-btn"
              :disabled="isLoggingIn"
            >
              <span v-if="isLoggingIn" class="login-loading">
                <span class="spinner"></span>
                Logging in...
              </span>
              <span
                v-else
                class="login-button-content"
              >
                <LogIn :size="18" />
                <span>Login</span>
              </span>
          </button>
          <button
            type="button"
            class="cancel-btn"
            @click="closeLogin"
          >
            <X :size="18" />
            <span>Cancel</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '../services/api'
import {
  GraduationCap,
  UserRound,
  Eye,
  EyeOff,
  LogIn,
  X
} from '@lucide/vue'
const router = useRouter()
const showFacultyLogin = ref(false)
const email = ref('')
const password = ref('')
const showPassword = ref(false)
const loginError = ref('')
const isLoggingIn = ref(false)
onMounted(() => {
  const token = localStorage.getItem('token')
  if (!token) {
    router.push('/')
  }
})
function closeLogin() {
  showFacultyLogin.value = false
  email.value = ''
  password.value = ''
  showPassword.value = false
  loginError.value = ''
}
async function facultyLogin() {
  loginError.value = ''
  isLoggingIn.value = true
  try {
    const response = await api.post(
      '/login',
      {
        email: email.value,
        password: password.value
      }
    )
    const user = response.data.user
    // Make sure only faculty enters here
    if (user.role !== 'faculty') {
      loginError.value =
        'This login is for faculty accounts only.'
      return
    }
    // Clear previous session
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('role')
    // Save faculty session
    localStorage.setItem(
      'token',
      response.data.token
    )
    localStorage.setItem(
      'user',
      JSON.stringify(user)
    )
    localStorage.setItem(
      'role',
      user.role
    )
    await router.push(
      '/faculty/dashboard'
    )
  } catch (error: any) {
    console.error(
      'FACULTY LOGIN ERROR:',
      error
    )
    // Deactivated faculty
    if (error.response?.status === 403) {
      loginError.value =
        error.response?.data?.message ||
        'Your account has been deactivated. Please contact the administrator.'
    }
    // Wrong email/password
    else if (error.response?.status === 422) {
      loginError.value =
        error.response?.data
          ?.errors?.email?.[0] ||
        'Invalid email or password.'
    }
    else {
      loginError.value =
        'Unable to login. Please try again.'
    }
  } finally {
    // IMPORTANT
    isLoggingIn.value = false
  }
}
</script>
<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: 'Poppins', sans-serif;
}
/* ==========================================
   PAGE
========================================== */
.page {
  position: relative;
  width: 100%;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 24px;
  overflow: hidden;
}
.page::before {
  content: "";
  position: absolute;
  inset: 0;
  background-image: url("../assets/backgroundssj.jpg");
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  filter: blur(12px);
  transform: scale(1.08);
  z-index: -2;
}
.page::after {
  content: "";
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, .18);
  z-index: -1;
}
/* ==========================================
   MAIN CONTAINER
========================================== */
.container {
  position: relative;
  z-index: 1;
  width: min(100%, 980px);
  min-height: 560px;
  max-height: 88vh;
  display: flex;
  border-radius: 24px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, .22);
  box-shadow:
    0 22px 55px rgba(0, 0, 0, .35),
    inset 0 1px 0 rgba(255, 255, 255, .18);
  animation: fadeIn .8s ease;
}
/* ==========================================
   LEFT PANEL
========================================== */
.left {
  width: 50%;
  background: rgba(255, 255, 255, .95);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px;
}
.content {
  width: 100%;
  max-width: 390px;
  text-align: center;
}
.content h1 {
  font-size: clamp(34px, 4vw, 46px);
  font-weight: 800;
  color: #111;
  margin-bottom: 14px;
}
.welcome {
  color: #07b34d;
  font-size: 16px;
  margin-bottom: 42px;
}
/* ROLE BUTTONS */
.role-btn {
  width: 100%;
  height: 58px;
  border: 2px solid #00c853;
  background: #f2fff5;
  border-radius: 50px;
  margin-bottom: 16px;
  cursor: pointer;
  font-size: 20px;
  font-weight: 700;
  transition: .25s;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 12px;
}
.role-btn:hover {
  background: #00c853;
  color: white;
  transform: translateY(-3px);
  box-shadow:
    0 10px 25px rgba(0, 200, 83, .35);
}
.icon {
  font-size: 20px;
}
.help {
  margin-top: 28px;
  color: #666;
  font-size: 13px;
}
.help span {
  color: #06b34d;
  font-weight: 700;
}
/* ==========================================
   RIGHT PANEL
========================================== */
.right {
  position: relative;
  isolation: isolate;
  width: 50%;
  color: white;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 42px 48px;
  overflow: hidden;
  background:
    linear-gradient(
      145deg,
      rgba(0, 128, 69, .58),
      rgba(0, 200, 83, .30)
    );
  backdrop-filter: blur(22px);
  -webkit-backdrop-filter: blur(22px);
  border-left:
    1px solid rgba(255, 255, 255, .28);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, .22),
    inset 0 0 45px rgba(255, 255, 255, .04);
}
/* LARGE BACKGROUND LOGO */
.right::before {
  content: "";
  position: absolute;
  width: 430px;
  height: 430px;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  background-image: url("../assets/logo.png");
  background-size: contain;
  background-position: center;
  background-repeat: no-repeat;
  opacity: .13;
  filter:
    saturate(.85)
    contrast(1.05)
    drop-shadow(0 15px 30px rgba(0, 0, 0, .18));
  z-index: -2;
  pointer-events: none;
}
.right::after {
  content: "";
  position: absolute;
  inset: 0;
  background:
    radial-gradient(
      circle at top,
      rgba(255, 255, 255, .18),
      transparent 42%
    ),
    linear-gradient(
      to bottom,
      rgba(0, 70, 40, .12),
      rgba(0, 55, 34, .32)
    );
  z-index: -1;
  pointer-events: none;
}
.right-content {
  position: relative;
  z-index: 1;
  width: 100%;
}
.logo-container {
  display: flex;
  justify-content: center;
  margin-bottom: 18px;
}
.logo {
  width: 105px;
  height: 105px;
  object-fit: contain;
  filter:
    drop-shadow(0 10px 18px rgba(0, 0, 0, .28));
  transition: .3s ease;
}
.logo:hover {
  transform: scale(1.04);
}
.right h2 {
  font-size: clamp(42px, 5vw, 56px);
  font-weight: 800;
  text-align: center;
  margin-bottom: 18px;
  letter-spacing: 1px;
  color: #ffffff;
  text-shadow:
    0 3px 12px rgba(0, 0, 0, .32);
}
.subtitle {
  font-size: 18px;
  line-height: 1.5;
  margin-bottom: 24px;
  color: rgba(255, 255, 255, .97);
  text-shadow:
    0 2px 8px rgba(0, 0, 0, .28);
}
.description {
  position: relative;
  background:
    linear-gradient(
      135deg,
      rgba(255, 255, 255, .20),
      rgba(255, 255, 255, .09)
    );
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
  border:
    1px solid rgba(255, 255, 255, .32);
  border-radius: 16px;
  padding: 24px;
  line-height: 1.8;
  font-size: 13px;
  color: rgba(255, 255, 255, .98);
  white-space: normal;
  box-shadow:
    0 12px 32px rgba(0, 0, 0, .14),
    inset 0 1px 0 rgba(255, 255, 255, .18);
  text-shadow:
    0 1px 5px rgba(0, 0, 0, .18);
}
/* ==========================================
   LOGIN MODAL
========================================== */
.login-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, .55);
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  animation: overlayFade .25s ease;
}
.login-modal {
  width: 420px;
  max-width: 92%;
  background: white;
  border-radius: 22px;
  padding: 35px;
  box-shadow:
    0 20px 50px rgba(0, 0, 0, .30);
  animation: modalShow .3s ease;
}
.login-icon {
  width: 60px;
  height: 60px;
  margin:
    0 auto 12px auto;
  border-radius: 50%;
  background: #ecfdf3;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
}
.login-modal h2 {
  color: #112244;
  text-align: center;
  margin-bottom: 7px;
  font-size: 26px;
}
.login-description {
  color: #6b7280;
  text-align: center;
  font-size: 14px;
  margin-bottom: 26px;
}
/* ==========================================
   INPUTS
========================================== */
.input-group {
  width: 100%;
  margin-bottom: 18px;
}
.input-group label {
  display: block;
  text-align: left;
  color: #374151;
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 7px;
}
.input-group input {
  width: 100%;
  height: 50px;
  padding:
    0 14px;
  border:
    1px solid #d1d5db;
  border-radius: 10px;
  outline: none;
  font-size: 14px;
  color: #111827;
  background: #ffffff;
  transition:
    border-color .2s ease,
    box-shadow .2s ease;
}
.input-group input::placeholder {
  color: #9ca3af;
}
.input-group input:focus {
  border-color: #00c853;
  box-shadow:
    0 0 0 3px rgba(0, 200, 83, .12);
}
/* ==========================================
   PASSWORD
========================================== */
.password-wrapper {
  position: relative;
  width: 100%;
}
.password-wrapper input {
  padding-right: 48px;
}
.eye-btn {
  position: absolute;
  right: 13px;
  top: 50%;
  transform: translateY(-50%);
  width: 32px;
  height: 32px;
  display: flex;
  justify-content: center;
  align-items: center;
  border: none;
  background: transparent;
  color: #6b7280;
  cursor: pointer;
  border-radius: 6px;
  transition:
    color .2s ease,
    background .2s ease;
}
.eye-btn:hover {
  color: #00a844;
  background:
    rgba(0, 200, 83, .08);
}
.eye-btn:focus {
  outline: none;
}
/* ==========================================
   ERROR MESSAGE
========================================== */
.error {
  background: #fef2f2;
  color: #dc2626;
  border:
    1px solid #fecaca;
  border-radius: 8px;
  padding: 10px 12px;
  font-size: 13px;
  margin-bottom: 18px;
  text-align: left;
}
/* ==========================================
   LOGIN BUTTONS
========================================== */
.login-actions {
  display: flex;
  gap: 15px;
  margin-top: 8px;
}
.cancel-btn,
.login-btn {
  flex: 1;
  border: none;
  padding: 14px;
  border-radius: 10px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition:
    transform .2s ease,
    box-shadow .2s ease,
    background .2s ease;
}
.cancel-btn {
  background: #e5e7eb;
  color: #374151;
}
.cancel-btn:hover {
  background: #d1d5db;
  transform: translateY(-1px);
}
.login-btn {
  background: #00c853;
  color: white;
  box-shadow:
    0 6px 15px rgba(0, 200, 83, .24);
}
.login-btn:hover {
  background: #00b548;
  transform: translateY(-1px);
  box-shadow:
    0 8px 18px rgba(0, 200, 83, .30);
}
/* ==========================================
   RESPONSIVE
========================================== */
@media(max-width: 960px) {
  .page {
    padding: 18px;
    align-items: flex-start;
  }
  .container {
    flex-direction: column;
    width: min(100%, 760px);
    min-height: auto;
    max-height: none;
  }
  .left,
  .right {
    width: 100%;
  }
  .left {
    padding: 42px 28px;
  }
  .right {
    padding: 38px 32px;
    border-left: none;
    border-top:
      1px solid rgba(255, 255, 255, .28);
  }
  .content {
    max-width: 430px;
  }
  .logo {
    width: 88px;
    height: 88px;
  }
  .right::before {
    width: 390px;
    height: 390px;
  }
  .subtitle {
    text-align: center;
  }
}
@media(max-width: 600px) {
  .page {
    padding: 12px;
  }
  .container {
    border-radius: 18px;
  }
  .left {
    padding: 36px 22px;
  }
  .right {
    padding: 34px 24px;
  }
  .right::before {
    width: 310px;
    height: 310px;
    opacity: .12;
  }
  .role-btn {
    height: 54px;
    font-size: 18px;
  }
  .description {
    padding: 20px;
    font-size: 12px;
  }
  .login-modal {
    padding: 28px 22px;
  }
  .login-actions {
    flex-direction: column;
  }
}
/* ==========================================
   ANIMATIONS
========================================== */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform:
      translateY(20px);
  }
  to {
    opacity: 1;
    transform:
      translateY(0);
  }
}
@keyframes overlayFade {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
@keyframes modalShow {
  from {
    opacity: 0;
    transform:
      translateY(15px) scale(.97);
  }
  to {
    opacity: 1;
    transform:
      translateY(0) scale(1);
  }
}
/* ==========================================
   LUCIDE ICON ALIGNMENT
========================================== */
.role-btn svg,
.eye-btn svg,
.login-btn svg,
.cancel-btn svg {
  flex-shrink: 0;
}
.login-button-content {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
}
.cancel-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
}
.role-btn svg {
  transition: transform .2s ease;
}
.role-btn:hover svg {
  transform: scale(1.08);
}
.login-icon {
  color: #00a844;
}
</style>
