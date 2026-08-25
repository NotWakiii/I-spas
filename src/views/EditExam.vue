<template>

<div class="edit-page">



    <div class="page-header">

        <div>

            <button
                class="back-btn"
                @click="$router.back()"
            >
                ← Back
            </button>

            <h1>

                Edit Examination

            </h1>

            <p>

                Modify exam details and questions.

            </p>

        </div>

     <button
        class="save-btn"
        :disabled="saving"
        @click="saveExam"
      >
        {{ saving ? 'Saving...' : '💾 Save Changes' }}
    </button>
    </div>
      <div class="details-card">
          <h2>
              Exam Information
          </h2>
          <div class="details-grid">
              <!-- EXAM TITLE -->
              <div>
                  <label>
                      Exam Title
                  </label>
                  <input
                      v-model="exam.title"
                      type="text"
                  >
              </div>
              <!-- CLASS -->
              <div>
                  <label>
                      Class
                  </label>

                  <select v-model="exam.class_id">

                      <option
                          :value="null"
                          disabled
                      >
                          Select Class
                      </option>

                      <option
                          v-for="schoolClass in classes"
                          :key="schoolClass.id"
                          :value="schoolClass.id"
                      >
                          {{ schoolClass.grade }} - {{ schoolClass.section }}
                      </option>

                  </select>
              </div>
              <!-- SUBJECT -->
              <div>
                  <label>
                      Subject
                  </label>
                  <input
                      v-model="exam.subject"
                      type="text"
                      placeholder="e.g. Computer Systems Servicing"
                  >
              </div>
              <!-- DURATION -->
              <div>
                  <label>
                      Duration (minutes)
                  </label>
                  <input
                      v-model="exam.duration"
                      type="number"
                      min="1"
                  >
              </div>
              <!-- PASSING -->
              <div>
                  <label>
                      Passing Score (%)
                  </label>
                  <input
                      v-model="exam.passing"
                      type="number"
                      min="1"
                      max="100"
                  >
              </div>
          </div>
      </div>
    <div

        v-for="(question,index) in questions"

        :key="question.id"

        class="question-card"

    >

        <div class="question-header">

            <h2>

                Question {{ index + 1 }}

            </h2>

            <button

                class="delete-btn"

                @click="deleteQuestion(index)"

            >

                🗑 Delete

            </button>

        </div>

        <label>

            Question

        </label>

        <textarea

            v-model="question.question"

        ></textarea>



       <div class="form-group">
    <label>Question Type</label>

    <select v-model="question.type">
        <option>Multiple Choice</option>
        <option>True or False</option>
        <option>Identification</option>
        <option>Essay</option>
    </select>
</div>

<div
    v-if="question.type === 'Multiple Choice'"
    class="options-grid"
>
    <div>
        <label>Choice A</label>
        <input v-model="question.options[0]" type="text">
    </div>

    <div>
        <label>Choice B</label>
        <input v-model="question.options[1]" type="text">
    </div>

    <div>
        <label>Choice C</label>
        <input v-model="question.options[2]" type="text">
    </div>

    <div>
        <label>Choice D</label>
        <input v-model="question.options[3]" type="text">
    </div>
</div>



        <div class="question-footer">

            <div>

                <label>

                    Correct Answer

                </label>

                <select
    v-if="question.type === 'Multiple Choice'"
    v-model="question.answer"
>
    <option>A</option>
    <option>B</option>
    <option>C</option>
    <option>D</option>
</select>

<select
    v-else-if="question.type === 'True or False'"
    v-model="question.answer"
>
    <option>True</option>
    <option>False</option>
</select>

<input
    v-else
    v-model="question.answer"
    type="text"
    placeholder="Correct answer"
/>

            </div>

        </div>

    </div>



    <div class="add-question">

        <button

            class="add-btn"

            @click="addQuestion"

        >

            ＋ Add New Question

        </button>

    </div>

</div>

</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import api from '../services/api'

interface SchoolClass {
    id: number
    grade: string
    section: string
}

const classes = ref<SchoolClass[]>([])
const router = useRouter()
const route = useRoute()

const loading = ref(false)
const saving = ref(false)

const exam = ref({
    id: 0,
    title: '',
    description: '',
    class_id: null as number | null,
    grade: '',
    section: '',
    subject: '',
    duration: 60,
    passing: 75
})

const questions = ref<any[]>([])

async function fetchClasses() {
    try {

        const response =
            await api.get(
                '/faculty/classes'
            )

        const data =
            response.data.data ??
            response.data

        classes.value =
            Array.isArray(data)
                ? data
                : []

        classes.value.sort(
            (a, b) => {

                const gradeCompare =
                    a.grade.localeCompare(
                        b.grade,
                        undefined,
                        {
                            numeric: true,
                            sensitivity: 'base'
                        }
                    )

                if (gradeCompare !== 0) {
                    return gradeCompare
                }

                return a.section.localeCompare(
                    b.section,
                    undefined,
                    {
                        numeric: true,
                        sensitivity: 'base'
                    }
                )
            }
        )

    } catch (error) {

        console.error(
            'Failed to load classes:',
            error
        )

    }
}
async function fetchExam() {
    loading.value = true

    try {
        const response = await api.get(`/exams/${route.params.id}`)

        const data = response.data.data

        exam.value = {
            id: data.id,
            title: data.title,
            description: data.description || '',

            class_id:
                data.class_id
                    ? Number(data.class_id)
                    : null,

            grade: data.grade || '',
            section: data.section || '',
            subject: data.subject || '',

            duration:
                Number(data.duration || 60),

            passing:
                Number(data.passing || 75)
        }
        questions.value = (data.questions || []).map((q:any) => {
            let type = 'Multiple Choice'

            if (q.question_type === 'true_false') {
                type = 'True or False'
            }

            if (q.question_type === 'identification') {
                type = 'Identification'
            }

            if (q.question_type === 'essay') {
                type = 'Essay'
            }

            const options = ['', '', '', '']

            if (q.options && q.options.length) {
                q.options.forEach((option:any, index:number) => {
                    options[index] = option.option_text
                })
            }

            let answer = q.answer || ''

            if (q.question_type === 'multiple_choice' && q.options) {
                const correctIndex = q.options.findIndex((option:any) => option.is_correct)

                if (correctIndex >= 0) {
                    answer = String.fromCharCode(65 + correctIndex)
                }
            }

            return {
                id: q.id,
                type,
                question: q.question,
                options,
                answer,
                points: q.points || 1,
                time: q.time_limit || 30
            }
        })

    } catch (error) {
        console.error(error)
        alert('Failed to load exam.')
    } finally {
        loading.value = false
    }
}

function addQuestion() {
    questions.value.push({
        id: Date.now(),
        type: 'Multiple Choice',
        question: '',
        options: ['', '', '', ''],
        answer: 'A',
        points: 1,
        time: 30
    })
}

function deleteQuestion(index:number) {
    if (confirm('Delete this question?')) {
        questions.value.splice(index, 1)
    }
}

async function saveExam() {

    if (!exam.value.title.trim()) {
        alert('Please enter an exam title.')
        return
    }

    if (!exam.value.class_id) {
        alert('Please select a class.')
        return
    }

    if (!exam.value.subject.trim()) {
        alert('Please enter a subject.')
        return
    }

    if (Number(exam.value.duration) <= 0) {
        alert('Duration must be greater than 0.')
        return
    }

    if (
        Number(exam.value.passing) < 1 ||
        Number(exam.value.passing) > 100
    ) {
        alert(
            'Passing score must be between 1 and 100.'
        )
        return
    }

    saving.value = true

    try {

        await api.put(
            `/exams/${exam.value.id}`,
            {
                title:
                    exam.value.title.trim(),

                description:
                    exam.value.description,

                class_id:
                    exam.value.class_id,

                subject:
                    exam.value.subject.trim(),

                duration:
                    Number(exam.value.duration),

                passing:
                    Number(exam.value.passing),

                questions:
                    questions.value
            }
        )

        alert(
            'Exam updated successfully!'
        )

        router.push(
            '/faculty/dashboard'
        )

    } catch (error: any) {

        console.error(
            'UPDATE EXAM ERROR:',
            error.response?.data || error
        )

        alert(
            error.response?.data?.message ||
            'Failed to update exam.'
        )

    } finally {

        saving.value = false

    }
}

onMounted(async () => {

    await Promise.all([
        fetchClasses(),
        fetchExam()
    ])

})
</script>

<style scoped>



.edit-page{

    padding:30px;

    background:#f5f7fb;

    min-height:100vh;

}


.page-header{

    display:flex;

    justify-content:space-between;

    align-items:center;

    margin-bottom:30px;

}

.page-header h1{

    color:#112244;

    margin-top:10px;

}

.page-header p{

    color:#666;

}

.back-btn{

    border:none;

    background:#eef2f7;

    padding:10px 18px;

    border-radius:10px;

    cursor:pointer;

}

.save-btn{

    border:none;

    background:#00c853;

    color:white;

    padding:14px 24px;

    border-radius:12px;

    font-weight:600;

    cursor:pointer;

    transition:.25s;

}

.save-btn:hover{

    background:#00b248;

}


.details-card,

.question-card{

    background:white;

    border-radius:16px;

    padding:25px;

    margin-bottom:25px;

    box-shadow:0 8px 20px rgba(0,0,0,.08);

}



.details-grid{

    display:grid;

    grid-template-columns:repeat(2,1fr);

    gap:20px;

    margin-top:20px;

}



label{

    display:block;

    margin-bottom:8px;

    font-weight:600;

    color:#333;

}



input,

textarea,

select{

    width:100%;

    padding:13px;

    border:1px solid #ddd;

    border-radius:10px;

    font-size:15px;

    outline:none;

    box-sizing:border-box;

}

input:focus,

textarea:focus,

select:focus{

    border-color:#00c853;

}

textarea{

    min-height:120px;

    resize:vertical;

}



.question-header{

    display:flex;

    justify-content:space-between;

    align-items:center;

    margin-bottom:20px;

}

.delete-btn{

    border:none;

    background:#ffebee;

    color:#d32f2f;

    padding:10px 18px;

    border-radius:10px;

    cursor:pointer;

}



.options-grid{

    display:grid;

    grid-template-columns:repeat(2,1fr);

    gap:20px;

    margin-top:20px;

}


.question-footer{

    display:grid;

    grid-template-columns:1fr 200px;

    gap:20px;

    margin-top:25px;

}



.add-question{

    display:flex;

    justify-content:center;

    margin:35px 0;

}

.add-btn{

    border:none;

    background:#2962ff;

    color:white;

    padding:16px 35px;

    border-radius:12px;

    font-size:16px;

    font-weight:600;

    cursor:pointer;

}

.add-btn:hover{

    background:#0039cb;

}

/* ==========================================
   RESPONSIVE
========================================== */

@media(max-width:900px){

.details-grid{

    grid-template-columns:1fr;

}

.options-grid{

    grid-template-columns:1fr;

}

.question-footer{

    grid-template-columns:1fr;

}

.page-header{

    flex-direction:column;

    align-items:flex-start;

    gap:20px;

}

.save-btn{

    width:100%;

}

}

</style>
