<template>
  <div class="audit-page">
    <!-- ==========================================
         PAGE HEADER
    =========================================== -->
    <div class="page-header">
      <div class="header-icon">
        <ScrollText :size="28" />
      </div>
      <div>
        <h1>Audit Logs</h1>
        <p>
          Review important system activities performed by
          administrators and faculty members.
        </p>
      </div>
    </div>
    <!-- ==========================================
         FILTERS
    =========================================== -->
    <div class="filters-card">
      <!-- SEARCH -->
      <div class="filter-group search-group">
        <Search
          :size="18"
          class="filter-icon"
        />
        <input
          v-model="search"
          type="text"
          placeholder="Search user, action, or description..."
          @input="loadLogs"
        >
      </div>
      <!-- ROLE -->
      <div class="filter-group select-group">
        <Users
          :size="18"
          class="filter-icon"
        />
        <select
          v-model="selectedRole"
          @change="fetchLogs"
        >
          <option value="">All Roles</option>
          <option value="admin">Administrator</option>
          <option value="faculty">Faculty</option>
        </select>
      </div>
      <!-- ACTION -->
      <div class="filter-group select-group">
        <ListFilter
          :size="18"
          class="filter-icon"
        />
        <select
          v-model="selectedAction"
          @change="fetchLogs"
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
    </div>
    <!-- ==========================================
         TABLE CARD
    =========================================== -->
    <div class="table-card">
      <div class="table-header">
        <div class="table-title">
          <ScrollText :size="19" />
          <span>System Activity</span>
        </div>
        <span
          v-if="!loading"
          class="record-count"
        >
          {{ logs.length }}
          {{ logs.length === 1 ? 'record' : 'records' }}
        </span>
      </div>
      <!-- ========================================
           LOADING
      ========================================= -->
      <div
        v-if="loading"
        class="loading-state"
      >
        <LoaderCircle
          :size="32"
          class="spinner-icon"
        />
        <span>Loading audit logs...</span>
      </div>
      <!-- ========================================
           TABLE
      ========================================= -->
      <div
        v-else-if="logs.length > 0"
        class="table-wrapper"
      >
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
              <!-- DATE -->
              <td class="date-cell">
                <div class="cell-with-icon">
                  <CalendarDays
                    :size="16"
                    class="cell-icon"
                  />
                  <span>{{ formatDate(log.created_at) }}</span>
                </div>
              </td>
              <!-- USER -->
              <td>
                <div class="user-cell">
                  <div class="user-avatar">
                    {{ getInitial(log.user_name) }}
                  </div>
                  <span>{{ log.user_name || 'Unknown User' }}</span>
                </div>
              </td>
              <!-- ROLE -->
              <td>
                <span
                  class="role-badge"
                  :class="getRoleClass(log.role)"
                >
                  <ShieldCheck :size="13" />
                  {{ formatRole(log.role) }}
                </span>
              </td>
              <!-- ACTION -->
              <td>
                <span
                  class="action-badge"
                  :class="getActionClass(log.action)"
                >
                  {{ formatAction(log.action) }}
                </span>
              </td>
              <!-- MODULE -->
              <td>
                <div class="cell-with-icon">
                  <Boxes
                    :size="15"
                    class="cell-icon"
                  />
                  <span>{{ log.module || '-' }}</span>
                </div>
              </td>
              <!-- DESCRIPTION -->
              <td class="description-cell">
                {{ log.description || '-' }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <!-- ========================================
           EMPTY STATE
      ========================================= -->
      <div
        v-else
        class="empty-state"
      >
        <div class="empty-icon">
          <FileSearch :size="38" />
        </div>
        <h3>No audit logs found</h3>
        <p>No system activities match the selected filters.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import api from '../../services/api'
import {
  ScrollText,
  Search,
  Users,
  ListFilter,
  LoaderCircle,
  FileSearch,
  CalendarDays,
  ShieldCheck,
  Boxes
} from '@lucide/vue'

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

const logs = ref<AuditLog[]>([])
const loading = ref(false)
const search = ref('')
const selectedRole = ref('')
const selectedAction = ref('')
let searchTimeout: ReturnType<typeof setTimeout> | null = null

async function fetchLogs() {
  loading.value = true
  try {
    const response = await api.get(
      '/admin/audit-logs',
      {
        params: {
          search: search.value || undefined,
          role: selectedRole.value || undefined,
          action: selectedAction.value || undefined
        }
      }
    )
    logs.value = response.data?.data?.data || []
  } catch (error) {
    console.error('AUDIT LOG ERROR:', error)
  } finally {
    loading.value = false
  }
}

function loadLogs() {
  if (searchTimeout) {
    clearTimeout(searchTimeout)
  }
  searchTimeout = setTimeout(() => {
    fetchLogs()
  }, 300)
}

function formatDate(date: string) {
  if (!date) {
    return '-'
  }
  return new Date(date).toLocaleString()
}

function formatRole(role: string | null) {
  if (!role) {
    return '-'
  }
  if (role === 'admin') {
    return 'Administrator'
  }
  if (role === 'faculty') {
    return 'Faculty'
  }
  return role
}

function getRoleClass(role: string | null) {
  if (role === 'admin') {
    return 'role-admin'
  }
  if (role === 'faculty') {
    return 'role-faculty'
  }
  return ''
}

function formatAction(action: string) {
  if (!action) {
    return '-'
  }
  return action.replaceAll('_', ' ')
}

function getActionClass(action: string) {
  if (
    action === 'DELETE_EXAM' ||
    action === 'CANCEL_LOBBY'
  ) {
    return 'action-danger'
  }
  if (
    action === 'CREATE_EXAM' ||
    action === 'PUBLISH_EXAM'
  ) {
    return 'action-success'
  }
  if (
    action === 'LOGIN' ||
    action === 'LOGOUT'
  ) {
    return 'action-auth'
  }
  if (
    action === 'START_EXAM' ||
    action === 'RESTART_EXAM' ||
    action === 'END_EXAM'
  ) {
    return 'action-exam'
  }
  return 'action-default'
}

function getInitial(name: string | null) {
  if (!name) {
    return '?'
  }
  const trimmed = name.trim()
  if (!trimmed) {
    return '?'
  }
  return trimmed.charAt(0).toUpperCase()
}

onMounted(() => {
  fetchLogs()
})
</script>

<style scoped>
.audit-page {
  width: 100%;
  min-height: 100vh;
  padding: 32px 36px 45px;
  background: #f6faf7;
  box-sizing: border-box;
}

/* PAGE HEADER */
.page-header {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 24px;
}

.header-icon {
  width: 52px;
  height: 52px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border-radius: 12px;
  background: #dcfce7;
  color: #15803d;
}

.page-header h1 {
  margin: 0 0 5px;
  color: #0f172a;
  font-size: 30px;
  font-weight: 800;
}

.page-header p {
  margin: 0;
  max-width: 700px;
  color: #64748b;
  font-size: 14px;
  line-height: 1.6;
}

/* FILTER CARD */
.filters-card {
  width: 100%;
  margin-bottom: 20px;
  padding: 15px;
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  box-shadow: 0 3px 12px rgba(15, 23, 42, .035);
}

/* FILTER GROUP */
.filter-group {
  position: relative;
  display: flex;
  align-items: center;
}

.search-group {
  min-width: 280px;
  flex: 1;
}

.select-group {
  min-width: 190px;
}

.filter-icon {
  position: absolute;
  left: 13px;
  color: #64748b;
  pointer-events: none;
  z-index: 1;
}

.filter-group input,
.filter-group select {
  width: 100%;
  height: 44px;
  padding: 0 14px 0 41px;
  border: 1px solid #dbe2ea;
  border-radius: 8px;
  outline: none;
  background: #ffffff;
  color: #334155;
  font-size: 13px;
  transition: border-color .2s ease, box-shadow .2s ease;
}

.filter-group input::placeholder {
  color: #94a3b8;
}

.filter-group input:focus,
.filter-group select:focus {
  border-color: #16a34a;
  box-shadow: 0 0 0 3px rgba(22, 163, 74, .10);
}

/* TABLE CARD */
.table-card {
  width: 100%;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 18px rgba(15, 23, 42, .04);
}

/* TABLE HEADER */
.table-header {
  min-height: 62px;
  padding: 0 18px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  border-bottom: 1px solid #e2e8f0;
}

.table-title {
  display: inline-flex;
  align-items: center;
  gap: 9px;
  color: #0f172a;
  font-size: 15px;
  font-weight: 700;
}

.table-title svg {
  color: #15803d;
}

.record-count {
  padding: 5px 10px;
  border-radius: 20px;
  background: #f1f5f9;
  color: #64748b;
  font-size: 11px;
  font-weight: 600;
}

/* TABLE */
.table-wrapper {
  width: 100%;
  overflow-x: auto;
}

table {
  width: 100%;
  min-width: 1050px;
  border-collapse: collapse;
}

th,
td {
  padding: 14px 16px;
  text-align: left;
  border-bottom: 1px solid #edf0f4;
  vertical-align: middle;
}

th {
  background: #f8fafc;
  color: #64748b;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: .03em;
  white-space: nowrap;
}

td {
  color: #334155;
  font-size: 13px;
}

tbody tr {
  transition: background .15s ease;
}

tbody tr:hover {
  background: #f8fdf9;
}

tbody tr:last-child td {
  border-bottom: none;
}

/* TABLE CELLS */
.cell-with-icon {
  display: inline-flex;
  align-items: center;
  gap: 7px;
}

.cell-icon {
  flex-shrink: 0;
  color: #94a3b8;
}

.date-cell {
  white-space: nowrap;
}

/* USER */
.user-cell {
  display: flex;
  align-items: center;
  gap: 9px;
  min-width: 150px;
  font-weight: 600;
  color: #1e293b;
}

.user-avatar {
  width: 31px;
  height: 31px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border-radius: 50%;
  background: #dcfce7;
  color: #15803d;
  font-size: 12px;
  font-weight: 800;
}

/* ROLE BADGES */
.role-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 9px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 700;
  white-space: nowrap;
}

.role-admin {
  background: #ecfdf5;
  color: #047857;
}

.role-faculty {
  background: #eff6ff;
  color: #2563eb;
}

/* ACTION BADGES */
.action-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 5px 9px;
  border-radius: 6px;
  font-size: 10px;
  font-weight: 700;
  white-space: nowrap;
}

.action-default {
  background: #f1f5f9;
  color: #475569;
}

.action-success {
  background: #dcfce7;
  color: #15803d;
}

.action-danger {
  background: #fee2e2;
  color: #dc2626;
}

.action-auth {
  background: #eef2ff;
  color: #4f46e5;
}

.action-exam {
  background: #fff7ed;
  color: #c2410c;
}

/* DESCRIPTION */
.description-cell {
  min-width: 260px;
  max-width: 400px;
  line-height: 1.55;
  color: #475569;
}

/* LOADING */
.loading-state {
  min-height: 230px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: #64748b;
  font-size: 13px;
}

.spinner-icon {
  color: #16a34a;
  animation: spin .8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* EMPTY */
.empty-state {
  min-height: 280px;
  padding: 40px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.empty-icon {
  width: 70px;
  height: 70px;
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: #f0fdf4;
  color: #16a34a;
}

.empty-state h3 {
  margin: 0 0 6px;
  color: #0f172a;
  font-size: 16px;
}

.empty-state p {
  margin: 0;
  color: #64748b;
  font-size: 13px;
}

/* LUCIDE */
svg {
  flex-shrink: 0;
}

/* TABLE SCROLLBAR */
.table-wrapper::-webkit-scrollbar {
  height: 7px;
}

.table-wrapper::-webkit-scrollbar-track {
  background: #f1f5f9;
}

.table-wrapper::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 10px;
}

/* TABLET */
@media(max-width: 1000px) {
  .audit-page {
    padding: 28px 26px 40px;
  }

  .search-group {
    flex-basis: 100%;
  }

  .select-group {
    flex: 1;
  }
}

/* MOBILE */
@media(max-width: 600px) {
  .audit-page {
    padding: 22px 18px 35px;
  }

  .page-header {
    align-items: flex-start;
  }

  .header-icon {
    width: 44px;
    height: 44px;
  }

  .header-icon svg {
    width: 23px;
    height: 23px;
  }

  .page-header h1 {
    font-size: 25px;
  }

  .page-header p {
    font-size: 12px;
  }

  .filters-card {
    flex-direction: column;
    align-items: stretch;
  }

  .search-group,
  .select-group {
    width: 100%;
    min-width: 0;
  }

  .table-header {
    min-height: 58px;
    padding: 0 14px;
  }

  .record-count {
    font-size: 10px;
  }

  th,
  td {
    padding: 12px 14px;
  }
}
</style>
