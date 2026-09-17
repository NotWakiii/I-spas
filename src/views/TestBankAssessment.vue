<template>
  <div class="builder-page">
    <div class="topbar">
      <button class="back-btn" @click="goBack"><ArrowLeft :size="18" />Back</button>
      <div>
        <h1>Create From Test Bank</h1>
        <p>Select saved questions, add your own, then create the assessment.</p>
      </div>
    </div>

    <div class="layout">
      <main>
        <section class="panel">
          <div class="section-head">
            <div>
              <h2>Assessment Details</h2>
              <p>Configure the assessment before creating it.</p>
            </div>
          </div>
          <div class="form-grid">
            <div class="field">
              <label>Assessment Title</label>
              <input v-model="exam.title" placeholder="Enter assessment title">
            </div>
            <div class="field">
              <label>Assessment Type</label>
              <select v-model="exam.type">
                <option value="quiz">Quiz</option>
                <option value="examination">Examination</option>
              </select>
            </div>
            <div class="field">
              <label>Passing Percentage</label>
              <input v-model.number="exam.passing_percentage" type="number" min="1" max="100">
            </div>
            <div class="field">
              <label>Time Limit (Minutes)</label>
              <input v-model.number="exam.time_limit" type="number" min="1">
            </div>
          </div>
        </section>

        <section class="panel">
          <div class="section-head question-section-head">
            <div>
              <h2>Assessment Questions</h2>
              <p>{{ draftQuestions.length }} question{{ draftQuestions.length === 1 ? '' : 's' }} • {{ totalPoints }} total point{{ totalPoints === 1 ? '' : 's' }}</p>
            </div>
            <div class="head-actions">
              <button class="secondary-green" @click="openManualModal">
                <Plus :size="17" />Add Question
              </button>
              <button class="primary-btn" @click="openBankModal">
                <BookOpenCheck :size="17" />Add From Test Bank
              </button>
            </div>
          </div>

          <div v-if="draftQuestions.length === 0" class="empty">
            <BookOpenCheck :size="44" />
            <h3>No questions added yet</h3>
            <p>Select questions from your Test Bank or add one manually.</p>
            <div class="empty-actions">
              <button class="secondary-green" @click="openManualModal"><Plus :size="17" />Add Question</button>
              <button class="primary-btn" @click="openBankModal"><BookOpenCheck :size="17" />Choose Test Bank Questions</button>
            </div>
          </div>

          <div v-else class="draft-list">
            <article v-for="(q,index) in draftQuestions" :key="q.localId" class="draft-card">
              <div class="draft-top">
                <div class="draft-meta">
                  <strong>Question {{ index + 1 }}</strong>
                  <span>{{ typeLabel(q.question_type) }}</span>
                  <span>{{ q.points }} pt{{ q.points === 1 ? '' : 's' }}</span>
                  <span v-if="q.source === 'test_bank'" class="source-bank">Test Bank</span>
                  <span v-else class="source-manual">Manual</span>
                </div>
                <div class="card-actions">
                  <button class="icon-edit" @click="editDraftQuestion(index)"><Pencil :size="15" />Edit</button>
                  <button class="icon-delete" @click="removeDraftQuestion(index)"><Trash2 :size="15" />Remove</button>
                </div>
              </div>
              <h3>{{ q.question }}</h3>
              <p v-if="q.competency" class="competency"><b>Competency:</b> {{ q.competency }}</p>
              <div v-if="q.question_type === 'multiple_choice'" class="options">
                <div v-for="(opt,oi) in q.options" :key="oi" :class="{ correct: opt.is_correct }">
                  <b>{{ String.fromCharCode(65 + oi) }}.</b><span>{{ opt.option_text }}</span>
                  <CircleCheckBig v-if="opt.is_correct" :size="15" />
                </div>
              </div>
              <div v-else class="answer"><span>Correct Answer:</span><b>{{ q.answer }}</b></div>
            </article>
          </div>
        </section>
      </main>

      <aside class="summary panel">
        <h2>Draft Summary</h2>
        <div class="summary-row"><span>Questions</span><b>{{ draftQuestions.length }}</b></div>
        <div class="summary-row"><span>Total Points</span><b>{{ totalPoints }}</b></div>
        <div class="summary-row"><span>Test Bank</span><b>{{ bankQuestionCount }}</b></div>
        <div class="summary-row"><span>Manually Added</span><b>{{ manualQuestionCount }}</b></div>
        <div class="summary-row"><span>Passing</span><b>{{ exam.passing_percentage }}%</b></div>
        <button class="create-btn" :disabled="creating || draftQuestions.length === 0" @click="createAssessment">
          <LoaderCircle v-if="creating" :size="18" class="spin" />
          <CheckCircle2 v-else :size="18" />
          {{ creating ? 'Creating...' : 'Create Assessment' }}
        </button>
      </aside>
    </div>

    <!-- TEST BANK SELECTOR -->
    <div v-if="showBankModal" class="overlay" @click.self="closeBankModal">
      <div class="modal bank-modal">
        <div class="modal-head">
          <div><h2>Add From Test Bank</h2><p>Select one or multiple questions to add to this draft.</p></div>
          <button class="close-btn" @click="closeBankModal"><X :size="20" /></button>
        </div>
        <div class="bank-filters">
          <div class="search"><Search :size="17" /><input v-model="bankSearch" placeholder="Search question or competency..."></div>
          <select v-model="bankType">
            <option value="">All Types</option>
            <option value="multiple_choice">Multiple Choice</option>
            <option value="true_false">True or False</option>
            <option value="identification">Identification</option>
          </select>
        </div>
        <div v-if="bankLoading" class="modal-state"><LoaderCircle :size="28" class="spin" />Loading questions...</div>
        <div v-else-if="filteredBankQuestions.length === 0" class="modal-state"><BookOpen :size="36" />No available Test Bank questions found.</div>
        <div v-else class="bank-list">
          <label v-for="q in filteredBankQuestions" :key="q.id" class="bank-item" :class="{ selected: selectedBankIds.has(q.id) }">
            <input type="checkbox" :checked="selectedBankIds.has(q.id)" @change="toggleBankQuestion(q.id)">
            <div class="bank-content">
              <div class="bank-tags"><span>{{ typeLabel(q.question_type) }}</span><span>{{ q.points }} pt{{ q.points === 1 ? '' : 's' }}</span></div>
              <strong>{{ q.question }}</strong>
              <small v-if="q.competency">{{ q.competency }}</small>
            </div>
          </label>
        </div>
        <div class="modal-footer">
          <span>{{ selectedBankIds.size }} selected</span>
          <div>
            <button class="cancel-btn" @click="closeBankModal">Cancel</button>
            <button class="primary-btn" :disabled="selectedBankIds.size === 0" @click="addSelectedBankQuestions">
              <Plus :size="17" />Add Selected Questions
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- MANUAL ADD / EDIT -->
    <div v-if="showQuestionModal" class="overlay" @click.self="closeQuestionModal">
      <div class="modal question-modal">
        <div class="modal-head">
          <div><h2>{{ editingIndex === null ? 'Add Question' : 'Edit Question' }}</h2><p>Create or modify one question in this assessment draft.</p></div>
          <button class="close-btn" @click="closeQuestionModal"><X :size="20" /></button>
        </div>
        <div class="form-grid">
          <div class="field">
            <label>Question Type</label>
            <select v-model="questionForm.question_type" @change="changeQuestionType">
              <option value="multiple_choice">Multiple Choice</option>
              <option value="true_false">True or False</option>
              <option value="identification">Identification</option>
            </select>
          </div>
          <div class="field">
            <label>Points</label>
            <input v-model.number="questionForm.points" type="number" min="1">
          </div>
        </div>
        <div class="field">
          <label>Question</label>
          <textarea v-model="questionForm.question" placeholder="Enter question..."></textarea>
        </div>
        <div class="field">
          <label>Competency <small>(Optional)</small></label>
          <input v-model="questionForm.competency" placeholder="Enter learning competency">
        </div>
        <template v-if="questionForm.question_type === 'multiple_choice'">
          <div class="field">
            <label>Choices</label>
            <div v-for="(_,i) in questionForm.options" :key="i" class="choice">
              <b>{{ String.fromCharCode(65+i) }}.</b>
              <input v-model="questionForm.options[i]" :placeholder="`Option ${i+1}`">
            </div>
          </div>
          <div class="field">
            <label>Correct Answer</label>
            <select v-model="questionForm.answer">
              <option value="" disabled>Select correct answer</option>
              <option v-for="(opt,i) in questionForm.options" :key="i" :value="String.fromCharCode(65+i)" :disabled="!opt.trim()">
                {{ String.fromCharCode(65+i) }}. {{ opt || `Option ${i+1}` }}
              </option>
            </select>
          </div>
        </template>
        <div v-else-if="questionForm.question_type === 'true_false'" class="field">
          <label>Correct Answer</label>
          <select v-model="questionForm.answer">
            <option value="" disabled>Select correct answer</option><option>True</option><option>False</option>
          </select>
        </div>
        <div v-else class="field">
          <label>Correct Answer</label>
          <input v-model="questionForm.answer" placeholder="Enter correct answer">
        </div>
        <div class="modal-footer right">
          <div>
            <button class="cancel-btn" @click="closeQuestionModal">Cancel</button>
            <button class="primary-btn" @click="saveDraftQuestion"><Save :size="17" />{{ editingIndex === null ? 'Add Question' : 'Save Changes' }}</button>
          </div>
        </div>
      </div>
    </div>

    <Transition name="toast">
      <div v-if="toast.show" class="toast" :class="toast.type">
        <div><b>{{ toast.title }}</b><p>{{ toast.message }}</p></div>
        <button @click="toast.show=false">×</button>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import api from '../services/api'
import { ArrowLeft, BookOpen, BookOpenCheck, CheckCircle2, CircleCheckBig, LoaderCircle, Pencil, Plus, Save, Search, Trash2, X } from '@lucide/vue'

type QType = 'multiple_choice' | 'true_false' | 'identification'
interface Option { option_text: string; is_correct: boolean }
interface BankQuestion { id:number; subject_id:number; question:string; question_type:QType; competency?:string|null; answer?:string|null; points:number; options?:Option[] }
interface DraftQuestion { localId:string; bankId?:number; source:'test_bank'|'manual'; question:string; question_type:QType; competency:string; answer:string; points:number; options:Option[] }

const route = useRoute()
const router = useRouter()
const classId = computed(() => {
  const id = Number(route.query.class_id)
  return Number.isInteger(id) && id > 0 ? id : null
})

const classData = ref<any>(null)
const bankQuestions = ref<BankQuestion[]>([])
const draftQuestions = ref<DraftQuestion[]>([])
const selectedBankIds = ref<Set<number>>(new Set())
const showBankModal = ref(false)
const showQuestionModal = ref(false)
const bankLoading = ref(false)
const creating = ref(false)
const bankSearch = ref('')
const bankType = ref('')
const editingIndex = ref<number|null>(null)
const toast = ref({ show:false, type:'success', title:'', message:'' })
let toastTimer:any = null

const exam = reactive({
  title:'',
  type:'examination',
  passing_percentage:75,
  time_limit:60
})

const questionForm = reactive({
  question_type:'multiple_choice' as QType,
  question:'',
  competency:'',
  answer:'',
  points:1,
  options:['','','','']
})

const subjectId = computed(() => Number(classData.value?.subject_id || classData.value?.subject?.id || 0))
const totalPoints = computed(() => draftQuestions.value.reduce((sum,q) => sum + Number(q.points || 0), 0))
const bankQuestionCount = computed(() => draftQuestions.value.filter(q => q.source === 'test_bank').length)
const manualQuestionCount = computed(() => draftQuestions.value.filter(q => q.source === 'manual').length)
const alreadyAddedBankIds = computed(() => new Set(draftQuestions.value.filter(q => q.bankId).map(q => q.bankId as number)))
const filteredBankQuestions = computed(() => {
  const search = bankSearch.value.trim().toLowerCase()
  return bankQuestions.value.filter(q => {
    if (alreadyAddedBankIds.value.has(q.id)) return false
    if (bankType.value && q.question_type !== bankType.value) return false
    if (search && !`${q.question} ${q.competency || ''}`.toLowerCase().includes(search)) return false
    return true
  })
})

function notify(type:string,title:string,message:string) {
  if (toastTimer) clearTimeout(toastTimer)
  toast.value = { show:true,type,title,message }
  toastTimer = setTimeout(() => toast.value.show=false, 4000)
}
function typeLabel(type:QType) {
  if (type === 'multiple_choice') return 'Multiple Choice'
  if (type === 'true_false') return 'True or False'
  return 'Identification'
}
function uid() { return `${Date.now()}-${Math.random().toString(36).slice(2)}` }

async function fetchClass() {
  if (!classId.value) return
  try {
    const response = await api.get(`/faculty/classes/${classId.value}`)
    classData.value = response.data?.data || response.data
  } catch (e:any) {
    notify('error','Class Error',e.response?.data?.message || 'Unable to load class information.')
  }
}
async function fetchBank() {
  bankLoading.value = true
  try {
    const params:any = {}
    if (subjectId.value) params.subject_id = subjectId.value
    const response = await api.get('/faculty/test-bank',{ params })
    bankQuestions.value = Array.isArray(response.data?.data) ? response.data.data : []
  } catch (e:any) {
    bankQuestions.value = []
    notify('error','Test Bank Error',e.response?.data?.message || 'Unable to load Test Bank.')
  } finally { bankLoading.value = false }
}
async function openBankModal() {
  selectedBankIds.value = new Set()
  bankSearch.value = ''
  bankType.value = ''
  showBankModal.value = true
  await fetchBank()
}
function closeBankModal() { showBankModal.value = false; selectedBankIds.value = new Set() }
function toggleBankQuestion(id: number) {
  const next = new Set(selectedBankIds.value)

  if (next.has(id)) {
    next.delete(id)
  } else {
    next.add(id)
  }

  selectedBankIds.value = next
}
function normalizeBankQuestion(q:BankQuestion):DraftQuestion {
  let answer = q.answer || ''
  const options = (q.options || []).map(o => ({ option_text:o.option_text,is_correct:Boolean(o.is_correct) }))
  if (q.question_type === 'multiple_choice') {
    const correct = options.findIndex(o => o.is_correct)
    if (correct >= 0) answer = String.fromCharCode(65 + correct)
  } else if (q.question_type === 'true_false') {
    const correct = options.find(o => o.is_correct)
    if (correct) answer = correct.option_text
  }
  return { localId:uid(),bankId:q.id,source:'test_bank',question:q.question,question_type:q.question_type,competency:q.competency || '',answer,points:Number(q.points || 1),options }
}
function addSelectedBankQuestions() {
  const selected = bankQuestions.value.filter(q => selectedBankIds.value.has(q.id) && !alreadyAddedBankIds.value.has(q.id))
  draftQuestions.value.push(...selected.map(normalizeBankQuestion))
  closeBankModal()
  notify('success','Questions Added',`${selected.length} Test Bank question${selected.length === 1 ? '' : 's'} added to the draft.`)
}

function resetQuestionForm() {
  questionForm.question_type='multiple_choice'
  questionForm.question=''
  questionForm.competency=''
  questionForm.answer=''
  questionForm.points=1
  questionForm.options=['','','','']
}
function openManualModal() {
  editingIndex.value=null
  resetQuestionForm()
  showQuestionModal.value=true
}
function editDraftQuestion(index: number) {
  const q = draftQuestions.value[index]

  if (!q) {
    notify(
      'error',
      'Question Not Found',
      'The selected question could not be found.'
    )
    return
  }

  editingIndex.value = index
  questionForm.question_type = q.question_type
  questionForm.question = q.question
  questionForm.competency = q.competency
  questionForm.answer = q.answer
  questionForm.points = q.points

  questionForm.options =
    q.question_type === 'multiple_choice'
      ? [0, 1, 2, 3].map(i => q.options[i]?.option_text || '')
      : ['', '', '', '']

  showQuestionModal.value = true
}
function closeQuestionModal() { showQuestionModal.value=false; editingIndex.value=null }
function changeQuestionType() { questionForm.answer=''; questionForm.options=['','','',''] }
function validateQuestion() {
  if (!questionForm.question.trim()) return 'Enter the question.'
  if (Number(questionForm.points)<1) return 'Points must be at least 1.'
  if (!questionForm.answer.trim()) return 'Select or enter the correct answer.'
  if (questionForm.question_type==='multiple_choice') {
    if (questionForm.options.some(o=>!o.trim())) return 'Complete all four choices.'
    const values=questionForm.options.map(o=>o.trim().toLowerCase())
    if (new Set(values).size!==4) return 'Multiple choice options must be unique.'
  }
  return ''
}
function buildManualQuestion(existing?:DraftQuestion):DraftQuestion {
  let options:Option[]=[]
  if (questionForm.question_type==='multiple_choice') {
    const correct=questionForm.answer.charCodeAt(0)-65
    options=questionForm.options.map((o,i)=>({option_text:o.trim(),is_correct:i===correct}))
  } else if (questionForm.question_type==='true_false') {
    options=['True','False'].map(o=>({option_text:o,is_correct:o===questionForm.answer}))
  }
  return {
    localId:existing?.localId || uid(),
    bankId:existing?.bankId,
    source:existing?.source || 'manual',
    question:questionForm.question.trim(),
    question_type:questionForm.question_type,
    competency:questionForm.competency.trim(),
    answer:questionForm.answer.trim(),
    points:Number(questionForm.points),
    options
  }
}
function saveDraftQuestion() {
  const error=validateQuestion()
  if (error) return notify('error','Incomplete Question',error)
  if (editingIndex.value===null) {
    draftQuestions.value.push(buildManualQuestion())
    notify('success','Question Added','The question was added to the assessment draft.')
  } else {
    const old=draftQuestions.value[editingIndex.value]
    draftQuestions.value[editingIndex.value]=buildManualQuestion(old)
    notify('success','Question Updated','The draft question was updated.')
  }
  closeQuestionModal()
}
function removeDraftQuestion(index: number) {
  if (index < 0 || index >= draftQuestions.value.length) {
    return
  }

  draftQuestions.value.splice(index, 1)
}

function validateAssessment() {
  if (!exam.title.trim()) return 'Enter an assessment title.'
  if (!draftQuestions.value.length) return 'Add at least one question.'
  if (exam.passing_percentage<1 || exam.passing_percentage>100) return 'Passing percentage must be from 1 to 100.'
  if (exam.time_limit<1) return 'Time limit must be at least 1 minute.'
  return ''
}

/*
 IMPORTANT:
 Your existing Manual/Automatic Assessment may use additional /exams fields
 (class IDs, dates, exam code, violation penalties, schedule, etc.).
 Keep those existing fields in this payload if your ExamController requires them.
 The questions below are copied into the normal exam payload; no Test Bank ID is
 required by the exam after creation.
*/
function examPayload() {
  return {
    title:exam.title.trim(),
    exam_type:exam.type,
    type:exam.type,
    class_id:classId.value,
    school_class_id:classId.value,
    passing_percentage:Number(exam.passing_percentage),
    passing_score:Number(exam.passing_percentage),
    time_limit:Number(exam.time_limit),
    questions:draftQuestions.value.map((q,index)=>({
      question:q.question,
      question_type:q.question_type,
      competency:q.competency || null,
      answer:q.answer,
      points:Number(q.points),
      question_order:index+1,
      options:q.options.map(o=>({option_text:o.option_text,is_correct:o.is_correct}))
    }))
  }
}
async function createAssessment() {
  const error=validateAssessment()
  if (error) return notify('error','Cannot Create Assessment',error)
  creating.value=true
  try {
    const response=await api.post('/exams',examPayload())
    notify('success','Assessment Created',response.data?.message || 'Assessment created successfully.')
    setTimeout(()=> {
      if (classId.value) router.push({path:`/faculty/classes/${classId.value}`,query:{tab:'assessments'}})
      else router.push('/faculty/dashboard')
    },700)
  } catch (e:any) {
    const errors=e.response?.data?.errors
    const first=errors ? Object.values(errors).flat()[0] : null
    notify('error','Creation Failed',String(first || e.response?.data?.message || 'Unable to create assessment.'))
  } finally { creating.value=false }
}
function goBack() {
  if (classId.value) router.push({path:`/faculty/classes/${classId.value}`,query:{tab:'assessments'}})
  else router.back()
}

onMounted(async()=> {
  await fetchClass()
  await fetchBank()
})
</script>

<style scoped>
*{box-sizing:border-box}.builder-page{min-height:100vh;padding:28px;background:#f8fafc;color:#1e293b}.topbar{max-width:1400px;margin:0 auto 20px;display:flex;align-items:center;gap:16px}.topbar h1{margin:0;color:#112244;font-size:28px}.topbar p{margin:3px 0 0;color:#64748b;font-size:13px}.back-btn,.primary-btn,.secondary-green,.cancel-btn,.create-btn,.icon-edit,.icon-delete,.close-btn{border:0;cursor:pointer;font:inherit;font-weight:600;display:inline-flex;align-items:center;justify-content:center;gap:7px;transition:.2s}.back-btn{padding:10px 13px;border:1px solid #e2e8f0;border-radius:9px;background:#fff;color:#475569}.back-btn:hover{background:#16a34a;color:#fff;border-color:#16a34a}.layout{max-width:1400px;margin:auto;display:grid;grid-template-columns:minmax(0,1fr) 290px;gap:18px;align-items:start}.panel{background:#fff;border-radius:15px;box-shadow:0 4px 16px rgba(0,0,0,.06);padding:19px;margin-bottom:17px}.section-head{display:flex;align-items:flex-start;justify-content:space-between;gap:14px;margin-bottom:16px}.section-head h2,.summary h2{margin:0;color:#112244;font-size:18px}.section-head p{margin:3px 0 0;color:#64748b;font-size:12px}.head-actions{display:flex;gap:8px}.primary-btn,.secondary-green{min-height:40px;padding:0 13px;border-radius:9px;font-size:12px}.primary-btn{background:#16a34a;color:#fff}.primary-btn:hover:not(:disabled),.create-btn:hover:not(:disabled){background:#12843c}.secondary-green{background:#ecfdf5;color:#15803d;border:1px solid #bbf7d0}.secondary-green:hover{background:#dcfce7}.primary-btn:disabled,.create-btn:disabled{opacity:.55;cursor:not-allowed}.form-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}.field{margin-bottom:12px}.field label{display:block;margin-bottom:6px;font-size:12px;font-weight:700;color:#374151}.field label small{font-weight:500;color:#94a3b8}.field input,.field select,.field textarea{width:100%;border:1px solid #d8dee8;border-radius:8px;background:#fff;outline:none;font:inherit;font-size:12px}.field input,.field select{height:42px;padding:0 11px}.field textarea{min-height:85px;padding:11px;resize:vertical}.field input:focus,.field select:focus,.field textarea:focus{border-color:#16a34a;box-shadow:0 0 0 3px rgba(22,163,74,.08)}.empty{min-height:230px;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;color:#94a3b8}.empty h3{margin:9px 0 3px;color:#334155}.empty p{margin:0;color:#64748b;font-size:12px}.empty-actions{display:flex;gap:8px;margin-top:14px}.draft-list{display:grid;gap:11px}.draft-card{border:1px solid #e8edf3;border-radius:11px;padding:14px}.draft-top{display:flex;justify-content:space-between;gap:10px}.draft-meta{display:flex;flex-wrap:wrap;align-items:center;gap:6px}.draft-meta strong{font-size:12px;color:#112244}.draft-meta span{padding:3px 7px;border-radius:12px;background:#f1f5f9;color:#475569;font-size:9px;font-weight:700}.draft-meta .source-bank{background:#dcfce7;color:#15803d}.draft-meta .source-manual{background:#dbeafe;color:#1d4ed8}.card-actions{display:flex;gap:6px}.icon-edit,.icon-delete{padding:6px 8px;border-radius:7px;font-size:10px}.icon-edit{background:#ecfdf5;color:#15803d}.icon-delete{background:#fee2e2;color:#dc2626}.draft-card h3{margin:10px 0 5px;font-size:14px;line-height:1.5;color:#273548}.competency{margin:0 0 9px;font-size:11px;color:#64748b}.competency b{color:#15803d}.options{display:grid;grid-template-columns:1fr 1fr;gap:6px}.options>div{display:flex;align-items:center;gap:6px;padding:7px 9px;border:1px solid #e5e7eb;border-radius:7px;background:#f8fafc;font-size:11px}.options>div span{flex:1}.options>div.correct{background:#f0fdf4;border-color:#86efac;color:#166534}.answer{display:flex;gap:8px;padding:8px 10px;border-radius:7px;background:#f0fdf4;font-size:11px}.answer span{color:#64748b}.answer b{color:#166534}.summary{position:sticky;top:18px;margin:0}.summary h2{margin-bottom:13px}.summary-row{display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid #f1f5f9;font-size:12px;color:#64748b}.summary-row b{color:#1e293b}.create-btn{width:100%;min-height:44px;margin-top:16px;border-radius:9px;background:#16a34a;color:#fff;font-size:12px}.overlay{position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;padding:18px;background:rgba(0,0,0,.52);backdrop-filter:blur(3px)}.modal{width:620px;max-width:100%;max-height:91vh;overflow:auto;border-radius:15px;background:#fff;padding:20px;box-shadow:0 20px 50px rgba(0,0,0,.2)}.bank-modal{width:780px}.modal-head{display:flex;justify-content:space-between;gap:15px;margin-bottom:15px}.modal-head h2{margin:0;color:#112244;font-size:19px}.modal-head p{margin:3px 0 0;color:#64748b;font-size:11px}.close-btn{width:33px;height:33px;border-radius:8px;background:#f1f5f9;color:#64748b}.bank-filters{display:grid;grid-template-columns:1fr 180px;gap:9px;margin-bottom:12px}.search{position:relative}.search svg{position:absolute;left:11px;top:50%;transform:translateY(-50%);color:#94a3b8}.search input,.bank-filters select{width:100%;height:40px;border:1px solid #d8dee8;border-radius:8px;outline:none;font-size:12px}.search input{padding:0 10px 0 36px}.bank-filters select{padding:0 9px}.bank-list{max-height:430px;overflow:auto;display:grid;gap:7px;padding-right:3px}.bank-item{display:flex;align-items:flex-start;gap:10px;padding:11px;border:1px solid #e5e7eb;border-radius:9px;cursor:pointer;transition:.15s}.bank-item:hover,.bank-item.selected{border-color:#86efac;background:#f0fdf4}.bank-item>input{margin-top:3px;accent-color:#16a34a}.bank-content{display:flex;flex-direction:column;gap:5px}.bank-content strong{font-size:12px;color:#334155;line-height:1.45}.bank-content small{color:#64748b;font-size:10px}.bank-tags{display:flex;gap:5px}.bank-tags span{padding:3px 6px;border-radius:10px;background:#dcfce7;color:#15803d;font-size:8px;font-weight:700}.modal-state{min-height:190px;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:8px;color:#94a3b8;font-size:12px}.modal-footer{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-top:15px;padding-top:13px;border-top:1px solid #f1f5f9}.modal-footer>span{font-size:11px;color:#64748b;font-weight:600}.modal-footer>div{display:flex;gap:8px}.modal-footer.right{justify-content:flex-end}.cancel-btn{min-height:40px;padding:0 13px;border-radius:8px;background:#f1f5f9;color:#475569;font-size:12px}.choice{display:flex;align-items:center;gap:7px;margin-bottom:6px}.choice b{width:18px;color:#15803d;font-size:11px}.choice input{flex:1}.toast{position:fixed;right:20px;top:20px;z-index:10000;width:min(380px,calc(100vw - 40px));display:flex;justify-content:space-between;gap:10px;padding:13px 14px;border-left:4px solid #16a34a;border-radius:10px;background:#fff;box-shadow:0 12px 30px rgba(0,0,0,.16)}.toast.error{border-left-color:#dc2626}.toast b{font-size:12px;color:#1e293b}.toast p{margin:2px 0 0;font-size:10px;color:#64748b}.toast button{border:0;background:transparent;font-size:20px;color:#94a3b8;cursor:pointer}.toast-enter-active,.toast-leave-active{transition:.2s}.toast-enter-from,.toast-leave-to{opacity:0;transform:translateX(15px)}.spin{animation:spin 1s linear infinite}@keyframes spin{to{transform:rotate(360deg)}}@media(max-width:950px){.layout{grid-template-columns:1fr}.summary{position:static}.question-section-head{flex-direction:column}.head-actions{width:100%}.head-actions button{flex:1}}@media(max-width:650px){.builder-page{padding:15px}.topbar{align-items:flex-start}.topbar h1{font-size:22px}.form-grid,.bank-filters,.options{grid-template-columns:1fr}.head-actions,.empty-actions,.modal-footer,.modal-footer>div{flex-direction:column;width:100%}.head-actions button,.empty-actions button,.modal-footer button{width:100%}.draft-top{flex-direction:column}.card-actions button{flex:1}.modal-footer{align-items:stretch}}
</style>
