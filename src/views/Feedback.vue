<template>
  <div class="feedback-page">
    <div class="page-header">
      <div>
        <span>STUDENT FEEDBACK</span>
        <h1>Assessment Feedback</h1>
        <p>Review concerns and comments submitted by students.</p>
      </div>

      <div class="feedback-count">
        {{ feedback.length }} Feedback
      </div>
    </div>

    <div class="toolbar">
      <div class="search-box">
        <Search :size="17" />
        <input
          v-model="search"
          type="text"
          placeholder="Search student, assessment, or feedback..."
        >
      </div>
    </div>

    <div
      v-if="loading"
      class="state-card"
    >
      <LoaderCircle
        :size="30"
        class="spinner"
      />
      <p>Loading feedback...</p>
    </div>

    <div
      v-else-if="errorMessage"
      class="state-card error"
    >
      <CircleAlert :size="32" />
      <h3>Unable to load feedback</h3>
      <p>{{ errorMessage }}</p>
      <button @click="fetchFeedback">
        Try Again
      </button>
    </div>

    <div
      v-else-if="groupedClasses.length === 0"
      class="state-card"
    >
      <MessageSquareText :size="40" />
      <h3>No feedback yet</h3>
      <p>
        Student feedback will appear here after they submit an assessment.
      </p>
    </div>

    <div
      v-else
      class="class-list"
    >
      <section
        v-for="classGroup in groupedClasses"
        :key="classGroup.classId"
        class="class-card"
      >
        <button
          type="button"
          class="class-header"
          @click="toggleClass(classGroup.classId)"
        >
          <div class="class-title">
            <div class="class-icon">
              <BookOpenText :size="20" />
            </div>

            <div>
              <h2>
                {{ classGroup.subject }}
              </h2>

              <p>
                {{ classGroup.grade }}
                •
                {{ classGroup.strand }}
                •
                {{ classGroup.section }}
              </p>
            </div>
          </div>

          <div class="class-meta">
            <span>
              {{ classGroup.items.length }}
              Feedback
            </span>

            <span
              v-if="classGroup.unread > 0"
              class="unread-count"
            >
              {{ classGroup.unread }} New
            </span>

            <ChevronDown
              :size="18"
              :class="{
                rotated:
                  expandedClasses.has(
                    classGroup.classId
                  )
              }"
            />
          </div>
        </button>

        <div
          v-if="
            expandedClasses.has(
              classGroup.classId
            )
          "
          class="feedback-list"
        >
          <article
            v-for="item in classGroup.items"
            :key="item.id"
            class="feedback-card"
            :class="{ unread: !item.is_read }"
            @click="markRead(item)"
          >
            <div class="student-avatar">
              {{
                getInitials(
                  item.student?.name
                )
              }}
            </div>

            <div class="feedback-content">
              <div class="feedback-top">
                <div>
                  <strong>
                    {{
                      item.student?.name ||
                      'Unknown Student'
                    }}
                  </strong>

                  <span>
                    LRN:
                    {{
                      item.student?.lrn ||
                      'N/A'
                    }}
                  </span>
                </div>

                <time>
                  {{
                    formatDate(
                      item.created_at
                    )
                  }}
                </time>
              </div>

              <div class="assessment-name">
                <ClipboardList :size="14" />

                <span>
                  {{
                    item.exam?.title ||
                    'Assessment'
                  }}
                </span>

                <span
                  class="assessment-type"
                >
                  {{
                    item.exam?.assessment_type ===
                    'quiz'
                      ? 'Quiz'
                      : 'Examination'
                  }}
                </span>
              </div>

              <p class="feedback-message">
                {{ item.message }}
              </p>

              <span
                v-if="!item.is_read"
                class="new-badge"
              >
                New
              </span>
            </div>
          </article>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  computed,
  onMounted,
  ref
} from 'vue'

import {
  BookOpenText,
  ChevronDown,
  CircleAlert,
  ClipboardList,
  LoaderCircle,
  MessageSquareText,
  Search
} from '@lucide/vue'

import api from '../services/api'

interface Student {
  id: number
  name: string
  lrn?: string | null
  email?: string | null
}

interface Exam {
  id: number
  title: string
  assessment_type:
    | 'quiz'
    | 'examination'
}

interface SchoolClass {
  id: number
  grade: string
  section?: string | null
  semester?: string | null

  subject?: {
    name: string
  }

  strand?: {
    name: string
  }

  section_data?: {
    section: string
  }

  school_year?: {
    year: string
  }
}

interface FeedbackItem {
  id: number
  student_id: number
  class_id: number
  exam_id: number
  exam_session_id?: number | null
  message: string
  is_read: boolean
  created_at: string
  student?: Student | null
  exam?: Exam | null
  school_class?: SchoolClass | null
}

const feedback =
  ref<FeedbackItem[]>([])

const loading =
  ref(false)

const errorMessage =
  ref('')

const search =
  ref('')

const expandedClasses =
  ref<Set<number>>(
    new Set()
  )

const filteredFeedback =
  computed(() => {
    const keyword =
      search.value
        .trim()
        .toLowerCase()

    if (!keyword) {
      return feedback.value
    }

    return feedback.value.filter(
      item => {
        const student =
          item.student?.name || ''

        const title =
          item.exam?.title || ''

        const message =
          item.message || ''

        const subject =
          item.school_class
            ?.subject?.name || ''

        return [
          student,
          title,
          message,
          subject
        ].some(
          value =>
            value
              .toLowerCase()
              .includes(keyword)
        )
      }
    )
  })

const groupedClasses =
  computed(() => {
    const groups =
      new Map<
        number,
        {
          classId: number
          subject: string
          grade: string
          strand: string
          section: string
          unread: number
          items: FeedbackItem[]
        }
      >()

    filteredFeedback.value.forEach(
      item => {
        const schoolClass =
          item.school_class

        if (!schoolClass) {
          return
        }

        if (
          !groups.has(
            schoolClass.id
          )
        ) {
          groups.set(
            schoolClass.id,
            {
              classId:
                schoolClass.id,

              subject:
                schoolClass.subject
                  ?.name ||
                'Unnamed Subject',

              grade:
                schoolClass.grade ||
                'No Grade',

              strand:
                schoolClass.strand
                  ?.name ||
                'No Strand',

              section:
                schoolClass
                  .section_data
                  ?.section ||
                schoolClass.section ||
                'No Section',

              unread: 0,
              items: []
            }
          )
        }

        const group =
          groups.get(
            schoolClass.id
          )

        if (!group) return

        group.items.push(item)

        if (!item.is_read) {
          group.unread++
        }
      }
    )

    return Array.from(
      groups.values()
    )
  })

async function fetchFeedback() {
  loading.value = true
  errorMessage.value = ''

  try {
    const response =
      await api.get(
        '/faculty/feedback'
      )

    feedback.value =
      Array.isArray(
        response.data?.data
      )
        ? response.data.data
        : []

    if (
      groupedClasses.value.length
    ) {
      expandedClasses.value.add(
        groupedClasses.value[0]
          .classId
      )
    }
  }
  catch (error: any) {
    console.error(
      'FEEDBACK LOAD ERROR:',
      error
    )

    errorMessage.value =
      error.response
        ?.data
        ?.message ||
      'Failed to load student feedback.'
  }
  finally {
    loading.value = false
  }
}

function toggleClass(
  classId: number
) {
  const updated =
    new Set(
      expandedClasses.value
    )

  if (updated.has(classId)) {
    updated.delete(classId)
  }
  else {
    updated.add(classId)
  }

  expandedClasses.value =
    updated
}

async function markRead(
  item: FeedbackItem
) {
  if (item.is_read) {
    return
  }

  try {
    await api.put(
      `/faculty/feedback/${item.id}/read`
    )

    item.is_read = true
  }
  catch (error) {
    console.error(
      'MARK FEEDBACK READ ERROR:',
      error
    )
  }
}

function getInitials(
  name?: string
): string {
  if (!name) {
    return '?'
  }

  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(word =>
      word.charAt(0)
    )
    .join('')
    .toUpperCase()
}

function formatDate(
  value: string
): string {
  if (!value) {
    return ''
  }

  return new Date(
    value
  ).toLocaleString(
    'en-PH',
    {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    }
  )
}

onMounted(() => {
  fetchFeedback()
})
</script>

<style scoped>
*{
  box-sizing:border-box;
}

.feedback-page{
  min-height:100%;
  padding:28px;
  background:#f7faf8;
  color:#0f172a;
  font-family:'Poppins',sans-serif;
}

.page-header{
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:20px;
  margin-bottom:18px;
}

.page-header > div:first-child > span{
  color:#16a34a;
  font-size:8px;
  font-weight:800;
  letter-spacing:1px;
}

.page-header h1{
  margin:3px 0 4px;
  font-size:24px;
}

.page-header p{
  color:#64748b;
  font-size:10px;
}

.feedback-count{
  padding:9px 13px;
  border-radius:10px;
  background:#dcfce7;
  color:#166534;
  font-size:10px;
  font-weight:700;
}

.toolbar{
  margin-bottom:18px;
  padding:12px;
  border:1px solid #e2e8f0;
  border-radius:12px;
  background:#ffffff;
}

.search-box{
  max-width:480px;
  position:relative;
  display:flex;
  align-items:center;
}

.search-box svg{
  position:absolute;
  left:12px;
  color:#94a3b8;
}

.search-box input{
  width:100%;
  min-height:40px;
  padding:0 12px 0 38px;
  border:1px solid #e2e8f0;
  border-radius:9px;
  outline:none;
  font-family:inherit;
  font-size:10px;
}

.search-box input:focus{
  border-color:#16a34a;
}

.class-list{
  display:flex;
  flex-direction:column;
  gap:13px;
}

.class-card{
  overflow:hidden;
  border:1px solid #e2e8f0;
  border-radius:14px;
  background:#ffffff;
}

.class-header{
  width:100%;
  padding:17px 18px;
  border:none;
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:15px;
  background:#ffffff;
  text-align:left;
  cursor:pointer;
}

.class-title{
  display:flex;
  align-items:center;
  gap:12px;
}

.class-icon{
  width:40px;
  height:40px;
  border-radius:10px;
  display:flex;
  align-items:center;
  justify-content:center;
  background:#dcfce7;
  color:#16a34a;
}

.class-title h2{
  font-size:13px;
}

.class-title p{
  margin-top:3px;
  color:#64748b;
  font-size:9px;
}

.class-meta{
  display:flex;
  align-items:center;
  gap:9px;
  color:#64748b;
  font-size:9px;
}

.unread-count{
  padding:4px 7px;
  border-radius:999px;
  background:#16a34a;
  color:#ffffff;
  font-weight:700;
}

.class-meta svg{
  transition:.2s;
}

.class-meta svg.rotated{
  transform:rotate(180deg);
}

.feedback-list{
  padding:14px;
  border-top:1px solid #eef2f0;
  display:flex;
  flex-direction:column;
  gap:10px;
  background:#fafcfb;
}

.feedback-card{
  padding:14px;
  border:1px solid #e2e8f0;
  border-radius:12px;
  display:grid;
  grid-template-columns:42px minmax(0,1fr);
  gap:12px;
  background:#ffffff;
  cursor:pointer;
}

.feedback-card.unread{
  border-color:#86efac;
  background:#f7fff9;
}

.student-avatar{
  width:40px;
  height:40px;
  border-radius:50%;
  display:flex;
  align-items:center;
  justify-content:center;
  background:#dcfce7;
  color:#166534;
  font-size:10px;
  font-weight:800;
}

.feedback-content{
  min-width:0;
}

.feedback-top{
  display:flex;
  justify-content:space-between;
  gap:10px;
}

.feedback-top > div{
  display:flex;
  flex-direction:column;
}

.feedback-top strong{
  font-size:11px;
}

.feedback-top span,
.feedback-top time{
  color:#94a3b8;
  font-size:8px;
}

.assessment-name{
  margin-top:8px;
  display:flex;
  align-items:center;
  gap:6px;
  color:#475569;
  font-size:9px;
}

.assessment-name svg{
  color:#16a34a;
}

.assessment-type{
  padding:3px 6px;
  border-radius:999px;
  background:#ecfdf3;
  color:#15803d;
  font-size:7px;
  font-weight:700;
}

.feedback-message{
  margin-top:10px;
  padding:11px;
  border-radius:9px;
  background:#f8fafc;
  color:#334155;
  font-size:10px;
  line-height:1.7;
  white-space:pre-wrap;
}

.new-badge{
  display:inline-block;
  margin-top:8px;
  padding:3px 7px;
  border-radius:999px;
  background:#16a34a;
  color:#ffffff;
  font-size:7px;
  font-weight:700;
}

.state-card{
  min-height:250px;
  padding:30px;
  border:1px solid #e2e8f0;
  border-radius:14px;
  display:flex;
  flex-direction:column;
  align-items:center;
  justify-content:center;
  gap:8px;
  background:#ffffff;
  color:#64748b;
  text-align:center;
}

.state-card h3{
  color:#0f172a;
}

.state-card p{
  font-size:10px;
}

.state-card button{
  margin-top:8px;
  padding:9px 14px;
  border:none;
  border-radius:8px;
  background:#16a34a;
  color:#ffffff;
  cursor:pointer;
}

.spinner{
  animation:spin .8s linear infinite;
}

@keyframes spin{
  to{
    transform:rotate(360deg);
  }
}

@media(max-width:700px){
  .feedback-page{
    padding:15px;
  }

  .page-header,
  .class-header{
    align-items:flex-start;
    flex-direction:column;
  }

  .class-meta{
    width:100%;
  }

  .feedback-card{
    grid-template-columns:36px minmax(0,1fr);
  }

  .student-avatar{
    width:34px;
    height:34px;
  }

  .feedback-top{
    flex-direction:column;
  }
}
</style>
