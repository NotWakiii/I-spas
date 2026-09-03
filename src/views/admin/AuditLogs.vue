<template>
  <div class="audit-page">

    <div class="page-header">
      <div>
        <h1>Audit Logs</h1>
        <p>
          Review important system activities performed by
          administrators and faculty members.
        </p>
      </div>
    </div>

    <div class="filters">

      <input
        v-model="search"
        type="text"
        placeholder="Search user, action, or description..."
        @input="loadLogs"
      >

      <select
        v-model="selectedRole"
        @change="loadLogs"
      >
        <option value="">All Roles</option>
        <option value="admin">Administrator</option>
        <option value="faculty">Faculty</option>
      </select>

      <select
        v-model="selectedAction"
        @change="loadLogs"
      >
        <option value="">All Actions</option>
        <option value="CREATE_EXAM">Create Exam</option>
        <option value="UPDATE_EXAM">Update Exam</option>
        <option value="PUBLISH_EXAM">Publish Exam</option>
        <option value="START_EXAM">Start Exam</option>
        <option value="RESTART_EXAM">Restart Exam</option>
        <option value="END_EXAM">End Exam</option>
        <option value="DELETE_EXAM">Delete Exam</option>
        <option value="CANCEL_LOBBY">Cancel Lobby</option>
        <option value="LOGIN">Login</option>
        <option value="LOGOUT">Logout</option>
      </select>

    </div>

    <div class="table-card">

      <table>
        <thead>
          <tr>
            <th>Date & Time</th>
            <th>User</th>
            <th>Role</th>
            <th>Action</th>
            <th>Module</th>
            <th>Description</th>
          </tr>
        </thead>

        <tbody>
          <tr
            v-for="log in logs"
            :key="log.id"
          >
            <td>
              {{ formatDate(log.created_at) }}
            </td>

            <td>
              {{ log.user_name }}
            </td>

            <td>
              <span class="role-badge">
                {{ formatRole(log.role) }}
              </span>
            </td>

            <td>
              <span class="action-badge">
                {{ formatAction(log.action) }}
              </span>
            </td>

            <td>
              {{ log.module || '-' }}
            </td>

            <td>
              {{ log.description || '-' }}
            </td>
          </tr>

          <tr v-if="!loading && logs.length === 0">
            <td colspan="7" class="empty-state">
              No audit logs found.
            </td>
          </tr>
        </tbody>
      </table>

      <div
        v-if="loading"
        class="loading"
      >
        Loading audit logs...
      </div>

    </div>

  </div>
</template>

<script setup lang="ts">

import {
  onMounted,
  ref
} from 'vue'

import api from '../../services/api'

interface AuditLog {
  id: number
  user_id: number | null
  user_name: string | null
  role: string | null
  action: string
  module: string | null
  description: string | null
  created_at: string
}

const logs =
  ref<AuditLog[]>([])

const loading =
  ref(false)

const search =
  ref('')

const selectedRole =
  ref('')

const selectedAction =
  ref('')

let searchTimeout:
  ReturnType<typeof setTimeout> | null =
  null


async function fetchLogs() {

  loading.value = true

  try {

    const response =
      await api.get(
        '/admin/audit-logs',
        {
          params: {
            search:
              search.value || undefined,

            role:
              selectedRole.value || undefined,

            action:
              selectedAction.value || undefined,
          }
        }
      )

    logs.value =
      response.data?.data?.data || []

  }

  catch (error) {

    console.error(
      'AUDIT LOG ERROR:',
      error
    )

  }

  finally {

    loading.value = false

  }

}


function loadLogs() {

  if (searchTimeout) {
    clearTimeout(searchTimeout)
  }

  searchTimeout =
    setTimeout(() => {
      fetchLogs()
    }, 300)

}


function formatDate(
  date: string
) {

  if (!date) return '-'

  return new Date(date)
    .toLocaleString()

}


function formatRole(
  role: string | null
) {

  if (!role) return '-'

  if (role === 'admin') {
    return 'Administrator'
  }

  if (role === 'faculty') {
    return 'Faculty'
  }

  return role

}


function formatAction(
  action: string
) {

  return action
    .replaceAll('_', ' ')

}


onMounted(() => {
  fetchLogs()
})

</script>

<style scoped>

.audit-page {
  padding: 30px;
  min-height: 100vh;
  background: #f5f7fb;
}

.page-header {
  margin-bottom: 24px;
}

.page-header h1 {
  margin: 0 0 6px;
  font-size: 30px;
  color: #0f172a;
}

.page-header p {
  margin: 0;
  color: #64748b;
}

.filters {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.filters input,
.filters select {
  padding: 11px 14px;
  border: 1px solid #dbe2ea;
  border-radius: 8px;
  background: white;
}

.filters input {
  min-width: 280px;
  flex: 1;
}

.table-card {
  background: white;
  border-radius: 12px;
  overflow-x: auto;
  border: 1px solid #e5e7eb;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th,
td {
  padding: 14px 16px;
  text-align: left;
  border-bottom: 1px solid #edf0f4;
}

th {
  background: #f8fafc;
  color: #475569;
  font-size: 13px;
}

td {
  color: #334155;
  font-size: 14px;
}

.role-badge,
.action-badge {
  display: inline-block;
  padding: 5px 9px;
  border-radius: 6px;
  background: #eef2ff;
  font-size: 12px;
  font-weight: 600;
}

.empty-state,
.loading {
  padding: 30px;
  text-align: center;
  color: #64748b;
}

</style>
