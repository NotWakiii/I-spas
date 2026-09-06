<template>
  <div class="admin-login-page">
    <div class="login-card">
      <!-- LOGO -->
      <div class="logo-container">
        <img
          src="@/assets/logo.png"
          alt="I-SPAS Logo"
          class="logo"
        />
      </div>
      <!-- TITLE -->
      <div class="header">
        <div class="admin-login-icon">
          <ShieldCheck :size="28" />
        </div>
        <h1>I-SPAS</h1>
        <h2>Administrator Login</h2>
        <p>
          Sign in to access the system
          administration panel.
        </p>
      </div>
      <!-- FORM -->
      <form @submit.prevent="adminLogin">
        <!-- EMAIL -->
        <div class="input-group">
          <label for="email">Email</label>
          <input
            id="email"
            v-model="email"
            type="email"
            placeholder="Enter admin email"
            autocomplete="email"
            required
          />
        </div>
        <!-- PASSWORD -->
        <div class="input-group">
          <label for="password">Password</label>
          <div class="password-wrapper">
            <input
              id="password"
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              placeholder="Enter password"
              autocomplete="current-password"
              required
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
        <!-- ERROR -->
        <div
          v-if="loginError"
          class="error"
        >
          {{ loginError }}
        </div>
        <!-- LOGIN -->
        <button
          type="submit"
          class="login-btn"
          :disabled="isLoggingIn"
        >
          <span
            v-if="isLoggingIn"
            class="login-content"
          >
            Logging in...
          </span>
          <span
            v-else
            class="login-content"
          >
            <LogIn :size="18" />
            <span>Login as Administrator</span>
          </span>
        </button>
      </form>
      <!-- BACK -->
      <button
        type="button"
        class="back-btn"
        @click="router.push('/')"
      >
        <ArrowLeft :size="17" />
        <span>Back to I-SPAS</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import api from '../../services/api'
import {
  Eye,
  EyeOff,
  LogIn,
  ArrowLeft,
  ShieldCheck
} from '@lucide/vue'

const router = useRouter()
const email = ref('')
const password = ref('')
const showPassword = ref(false)
const loginError = ref('')
const isLoggingIn = ref(false)

async function adminLogin() {
  loginError.value = ''
  if (
    !email.value.trim() ||
    !password.value
  ) {
    loginError.value =
      'Please enter email and password.'
    return
  }
  if (isLoggingIn.value) {
    return
  }
  isLoggingIn.value = true
  try {
    const response = await api.post(
      '/login',
      {
        email: email.value.trim(),
        password: password.value
      }
    )
    const token = response.data.token
    const user = response.data.user
    if (!token || !user) {
      loginError.value =
        'Invalid login response.'
      return
    }
    // =====================================
    // ADMIN ROLE CHECK
    // =====================================
    if (user.role !== 'admin') {
      loginError.value =
        'This account does not have administrator access.'
      return
    }
    // =====================================
    // SAVE ADMIN SESSION
    // =====================================
    localStorage.setItem(
      'token',
      token
    )
    localStorage.setItem(
      'user',
      JSON.stringify(user)
    )
    localStorage.setItem(
      'role',
      user.role
    )
    // =====================================
    // ADMIN DASHBOARD
    // =====================================
    await router.push(
      '/admin/dashboard'
    )
  } catch (error: any) {
    console.error(
      'ADMIN LOGIN ERROR:',
      error
    )
    if (
      error.response?.status === 422
    ) {
      loginError.value =
        error.response?.data
          ?.errors?.email?.[0]
        ||
        'Invalid email or password.'
    } else {
      loginError.value =
        'Invalid email or password.'
    }
  } finally {
    isLoggingIn.value = false
  }
}
</script>

<style scoped>
* {
  box-sizing: border-box;
  font-family: 'Poppins', sans-serif;
}

.admin-login-page {
  position: relative;
  width: 100%;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 24px;
  overflow: hidden;
}

/* BACKGROUND */
.admin-login-page::before {
  content: "";
  position: absolute;
  inset: 0;
  background-image: url('../../assets/backgroundssj.jpg');
  background-size: cover;
  background-position: center;
  filter: blur(12px);
  transform: scale(1.08);
  z-index: -2;
}

.admin-login-page::after {
  content: "";
  position: absolute;
  inset: 0;
  background:
    rgba(0, 0, 0, .38);
  z-index: -1;
}

/* LOGIN CARD */
.login-card {
  width: 440px;
  max-width: 100%;
  background:
    rgba(255, 255, 255, .97);
  border-radius: 22px;
  padding: 38px;
  box-shadow:
    0 22px 55px
    rgba(0, 0, 0, .35);
  border:
    1px solid
    rgba(255, 255, 255, .3);
}

/* LOGO */
.logo-container {
  display: flex;
  justify-content: center;
  margin-bottom: 12px;
}

.logo {
  width: 90px;
  height: 90px;
  object-fit: contain;
  filter:
    drop-shadow(
      0 8px 14px
      rgba(0, 0, 0, .18)
    );
}

/* HEADER */
.header {
  text-align: center;
  margin-bottom: 28px;
}

.header h1 {
  font-size: 32px;
  font-weight: 800;
  color: #008045;
  margin: 0 0 4px;
}

.header h2 {
  font-size: 22px;
  font-weight: 700;
  color: #111827;
  margin: 0 0 8px;
}

.header p {
  font-size: 13px;
  color: #6b7280;
  margin: 0;
  line-height: 1.6;
}

/* INPUT */
.input-group {
  width: 100%;
  margin-bottom: 18px;
}

.input-group label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  margin-bottom: 7px;
}

.input-group input {
  width: 100%;
  height: 50px;
  padding: 0 14px;
  border:
    1px solid #d1d5db;
  border-radius: 10px;
  outline: none;
  font-size: 14px;
  background: white;
  transition: .2s;
}

.input-group input:focus {
  border-color: #00c853;
  box-shadow:
    0 0 0 3px
    rgba(0, 200, 83, .12);
}

/* PASSWORD */
.password-wrapper {
  position: relative;
}

.password-wrapper input {
  padding-right: 48px;
}

.eye-btn {
  position: absolute;
  right: 12px;
  top: 50%;
  transform:
    translateY(-50%);
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  color: #6b7280;
  cursor: pointer;
}

.eye-btn:hover {
  color: #00a844;
}

/* ERROR */
.error {
  background: #fef2f2;
  color: #dc2626;
  border:
    1px solid #fecaca;
  border-radius: 8px;
  padding: 10px 12px;
  font-size: 13px;
  margin-bottom: 18px;
}

/* LOGIN */
.login-btn {
  width: 100%;
  border: none;
  padding: 14px;
  border-radius: 10px;
  background: #00c853;
  color: white;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: .2s;
}

.login-btn:hover:not(:disabled) {
  background: #00b548;
  transform:
    translateY(-1px);
  box-shadow:
    0 8px 18px
    rgba(0, 200, 83, .25);
}

.login-btn:disabled {
  opacity: .65;
  cursor: not-allowed;
}

/* BACK */
.back-btn {
  width: 100%;
  margin-top: 16px;
  border: none;
  background: transparent;
  color: #6b7280;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}

.back-btn:hover {
  color: #008045;
}

@media(max-width: 600px) {
  .admin-login-page {
    padding: 15px;
  }

  .login-card {
    padding: 30px 22px;
  }

  .logo {
    width: 78px;
    height: 78px;
  }
}

/* ==========================================
   ADMIN LOGIN ICON
========================================== */
.admin-login-icon {
  width: 52px;
  height: 52px;
  margin:
    0 auto 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: #ecfdf3;
  color: #008045;
}

/* ==========================================
   LUCIDE ALIGNMENT
========================================== */
.eye-btn svg,
.login-btn svg,
.back-btn svg {
  flex-shrink: 0;
}

.login-content {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.back-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
}
</style>
