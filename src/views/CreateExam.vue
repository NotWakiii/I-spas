<template>

<div class="create-page">

    <h1>How would you like to get started?</h1>

    <p>Choose to Continue</p>

    <div class="cards">

        <div class="card" @click="$router.push('/faculty/manual-exam')">

            <div class="circle">
                ✏️
            </div>

            <h2>Create</h2>

            <span>
                Manually create an assessment
            </span>

        </div>

        <div class="card" @click="$router.push('/faculty/automatic-exam')">

            <div class="circle">
                ✨
            </div>

            <h2>Create</h2>

            <span>
                Automatic generated questions via upload
            </span>

        </div>

        <div class="card" @click="$router.push('/faculty/dashboard')">

            <div class="circle">
                🏠
            </div>

            <h2>Back to Dashboard</h2>

            <span>
                Going back to main dashboard
            </span>

        </div>

    </div>

</div>

</template>

<style scoped>

.create-page{

    padding:60px;

    text-align:center;

}

.create-page h1{

    font-size:42px;

    color:rgb(26, 24, 24);

    margin-bottom:15px;

}

.create-page p{

    color:#009944;

    font-size:22px;

    margin-bottom:60px;

}

.cards{

    display:flex;

    justify-content:center;

    gap:35px;

}

.card{

    width:320px;

    background:white;

    border-radius:18px;

    padding:40px;

    cursor:pointer;

    transition:.3s;

    box-shadow:0 10px 30px rgba(0,0,0,.1);

}

.card:hover{

    transform:translateY(-10px);

}

.circle{

    width:80px;

    height:80px;

    margin:auto;

    border-radius:50%;

    background:#dff9e8;

    display:flex;

    justify-content:center;

    align-items:center;

    font-size:40px;

    margin-bottom:20px;

}

.card h2{

    color:#112244;

    margin-bottom:10px;

}

.card span{

    color:#666;

}

</style>