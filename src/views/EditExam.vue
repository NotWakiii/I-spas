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
            @click="saveExam"
        >

            💾 Save Changes

        </button>

    </div>

  

    <div class="details-card">

        <h2>

            Exam Information

        </h2>

        <div class="details-grid">

            <div>

                <label>

                    Exam Title

                </label>

                <input

                    v-model="exam.title"

                    type="text"

                >

            </div>

            <div>

                <label>

                    Course

                </label>

                <input

                    v-model="exam.course"

                    type="text"

                >

            </div>

            <div>

                <label>

                    Duration

                </label>

                <input

                    v-model="exam.duration"

                    type="number"

                >

            </div>

            <div>

                <label>

                    Passing Score

                </label>

                <input

                    v-model="exam.passing"

                    type="number"

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

                

        <div class="options-grid">

            <div>

                <label>

                    Choice A

                </label>

                <input

                    v-model="question.options[0]"

                    type="text"

                >

            </div>

            <div>

                <label>

                    Choice B

                </label>

                <input

                    v-model="question.options[1]"

                    type="text"

                >

            </div>

            <div>

                <label>

                    Choice C

                </label>

                <input

                    v-model="question.options[2]"

                    type="text"

                >

            </div>

            <div>

                <label>

                    Choice D

                </label>

                <input

                    v-model="question.options[3]"

                    type="text"

                >

            </div>

        </div>

        

        <div class="question-footer">

            <div>

                <label>

                    Correct Answer

                </label>

                <select

                    v-model="question.answer"

                >

                    <option>A</option>

                    <option>B</option>

                    <option>C</option>

                    <option>D</option>

                </select>

            </div>

            <div>

                <label>

                    Points

                </label>

                <input

                    v-model="question.points"

                    type="number"

                    min="1"

                >

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
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()



const exam = ref({

    id: 1,

    title: 'Exam 2 : App Dev 2',

    course: 'App Dev 2',

    duration: 90,

    passing: 70

})

// ==========================================
// QUESTIONS
// (Dummy Data)
// Replace with Laravel later
// ==========================================

const questions = ref([

{

    id:1,

    question:'What does HTML stand for?',

    options:[

        'Hyper Text Markup Language',

        'Home Tool Markup Language',

        'Hyperlinks Text Language',

        'Hyper Tool Machine Language'

    ],

    answer:'A',

    points:2

},

{

    id:2,

    question:'Which company created Vue.js?',

    options:[

        'Google',

        'Microsoft',

        'Facebook',

        'Evan You'

    ],

    answer:'D',

    points:2

},

{

    id:3,

    question:'Which language is used by Vue?',

    options:[

        'Python',

        'JavaScript',

        'Java',

        'C#'

    ],

    answer:'B',

    points:2

}

])



function addQuestion(){

    questions.value.push({

        id:Date.now(),

        question:'',

        options:[

            '',

            '',

            '',

            ''

        ],

        answer:'A',

        points:1

    })

}



function deleteQuestion(index:number){

    if(

        confirm(

            'Delete this question?'

        )

    ){

        questions.value.splice(index,1)

    }

}

// ==========================================
// SAVE
// ==========================================

function saveExam(){

    alert(

        'Changes saved successfully!\n\nLater this will save to Laravel.'

    )

    router.push('/faculty/dashboard')

}

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