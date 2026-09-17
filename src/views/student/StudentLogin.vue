<template>
  <div class="student-login-page">

    <div class="login-card">

      <div class="login-header">
        <div class="login-icon">
          <GraduationCap :size="32" />
        </div>

        <span class="eyebrow">
          I-SPAS STUDENT PORTAL
        </span>

        <h1>
          Student Login
        </h1>

        <p>
          Sign in using your registered
          student email and LRN.
        </p>
      </div>

      <form @submit.prevent="login">

        <div class="form-group">
          <label>
            Email Address
          </label>

          <div class="input-wrapper">
            <Mail :size="18" />

            <input
              v-model="email"
              type="email"
              placeholder="Enter your email"
              autocomplete="email"
            >
          </div>
        </div>

        <div class="form-group">
          <label>
            LRN
          </label>

          <div class="input-wrapper">
            <IdCard :size="18" />

            <input
              v-model="lrn"
              type="text"
              placeholder="Enter your LRN"
              autocomplete="off"
            >
          </div>
        </div>

        <div
          v-if="errorMessage"
          class="error-message"
        >
          <CircleAlert :size="17" />

          <span>
            {{ errorMessage }}
          </span>
        </div>

        <button
          type="submit"
          class="login-btn"
          :disabled="loading"
        >
          <LoaderCircle
            v-if="loading"
            :size="18"
            class="spinner"
          />

          <LogIn
            v-else
            :size="18"
          />

          {{
            loading
              ? 'Signing In...'
              : 'Login'
          }}
        </button>

      </form>

    </div>

  </div>
</template>

<script setup lang="ts">

import {
  ref
} from 'vue'

import {
  useRouter
} from 'vue-router'

import {
  CircleAlert,
  GraduationCap,
  IdCard,
  LoaderCircle,
  LogIn,
  Mail
} from '@lucide/vue'

import api from '../../services/api'

const router =
  useRouter()

const email =
  ref('')

const lrn =
  ref('')

const loading =
  ref(false)

const errorMessage =
  ref('')

async function login() {
  errorMessage.value = ''

  if (!email.value.trim() || !lrn.value.trim()) {
    errorMessage.value = 'Email and LRN are required.'
    return
  }

  loading.value = true

  try {
    const response = await api.post('/student/login', {
      email: email.value.trim(),
      lrn: lrn.value.trim(),
    })

    console.log('LOGIN RESPONSE:', response.data)

    const token = response.data?.token
    const student = response.data?.data

    if (!token) {
      errorMessage.value = 'Login token was not returned by the server.'
      return
    }

    if (!student) {
      errorMessage.value = 'Student information was not returned.'
      return
    }

    localStorage.setItem('token', token)
    localStorage.setItem('role', 'student')
    localStorage.setItem(
      'student_user',
      JSON.stringify(student)
    )

    await router.push('/student/dashboard')
  } catch (error: any) {
    console.error('STUDENT LOGIN ERROR:', error)

    errorMessage.value =
      error.response?.data?.message ||
      'Unable to login.'
  } finally {
    loading.value = false
  }
}

</script>

<style scoped>
* {
  box-sizing:
    border-box;
}

.student-login-page {
  min-height:
    100vh;

  display:
    flex;

  align-items:
    center;

  justify-content:
    center;

  padding:
    24px;

  background:
    #eefbf4;

  font-family:
    'Poppins',
    sans-serif;
}

.login-card {
  width:
    100%;

  max-width:
    430px;

  padding:
    34px;

  border:
    1px solid #e2e8f0;

  border-radius:
    20px;

  background:
    #fff;

  box-shadow:
    0 18px 45px
    rgba(15, 23, 42, .08);
}

.login-header {
  margin-bottom:
    28px;

  text-align:
    center;
}

.login-icon {
  width:
    70px;

  height:
    70px;

  margin:
    0 auto 14px;

  border-radius:
    50%;

  display:
    flex;

  align-items:
    center;

  justify-content:
    center;

  background:
    #dcfce7;

  color:
    #16a34a;
}

.eyebrow {
  display:
    block;

  margin-bottom:
    5px;

  color:
    #16a34a;

  font-size:
    9px;

  font-weight:
    800;

  letter-spacing:
    1px;
}

.login-header h1 {
  margin:
    0;

  color:
    #112244;

  font-size:
    28px;

  font-weight:
    800;
}

.login-header p {
  margin:
    8px 0 0;

  color:
    #64748b;

  font-size:
    11px;

  line-height:
    1.6;
}

.form-group {
  margin-bottom:
    17px;
}

.form-group label {
  display:
    block;

  margin-bottom:
    7px;

  color:
    #334155;

  font-size:
    10px;

  font-weight:
    700;
}

.input-wrapper {
  position:
    relative;
}

.input-wrapper svg {
  position:
    absolute;

  top:
    50%;

  left:
    13px;

  color:
    #94a3b8;

  transform:
    translateY(-50%);
}

.input-wrapper input {
  width:
    100%;

  height:
    46px;

  padding:
    0 14px 0 42px;

  border:
    1px solid #dbe3eb;

  border-radius:
    10px;

  outline:
    none;

  color:
    #334155;

  font-family:
    inherit;

  font-size:
    11px;

  transition:
    .18s ease;
}

.input-wrapper input:focus {
  border-color:
    #22c55e;

  box-shadow:
    0 0 0 3px
    rgba(34, 197, 94, .1);
}

.error-message {
  margin-bottom:
    15px;

  padding:
    11px 12px;

  border-radius:
    9px;

  display:
    flex;

  align-items:
    center;

  gap:
    7px;

  background:
    #fef2f2;

  color:
    #dc2626;

  font-size:
    10px;

  font-weight:
    600;
}

.login-btn {
  width:
    100%;

  min-height:
    46px;

  border:
    none;

  border-radius:
    10px;

  display:
    flex;

  align-items:
    center;

  justify-content:
    center;

  gap:
    7px;

  background:
    #16a34a;

  color:
    #fff;

  font-family:
    inherit;

  font-size:
    11px;

  font-weight:
    800;

  cursor:
    pointer;

  transition:
    .18s ease;
}

.login-btn:hover:not(:disabled) {
  background:
    #15803d;
}

.login-btn:disabled {
  opacity:
    .6;

  cursor:
    not-allowed;
}

.spinner {
  animation:
    spin .8s linear infinite;
}

@keyframes spin {
  to {
    transform:
      rotate(360deg);
  }
}

@media (
  max-width: 500px
) {
  .student-login-page {
    padding:
      15px;
  }

  .login-card {
    padding:
      25px 20px;
  }

  .login-header h1 {
    font-size:
      24px;
  }
}
</style>
