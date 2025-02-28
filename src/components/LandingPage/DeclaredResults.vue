<template>
    <div class="declaredresults-main">
        <CommonNavbar :nav-items="adminnav" :dropdown-items="admindropdownData" :logo="logo" :logo-url="logoUrl" />
        <div class="results mt-5">
            <ElectionResults />
        </div>
    </div>
</template>

<script setup lang="ts">
import CommonNavbar from '../CommonComponents/CommonNavbar.vue';
import { reactive, ref } from 'vue';
import ElectionResults from '../CommonComponents/ElectionResults.vue';
const logoUrl = "/"
const logo = ref('')
const adminnav = reactive([
    {
        NavItemName: '',
        Url: '/'
    }
])

const admindropdownData = reactive([
    {
        NavItemName: "Login as Voter",
        Url: "/voterLogin"
    },
    {
        NavItemName: "Login as Candidate",
        Url: "/candidateLogin"
    },
    {
        NavItemName: "Login as Admin",
        Url: "/adminLogin"
    }
])
</script>
