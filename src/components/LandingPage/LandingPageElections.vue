<template>
    <div class="declaredresults-main">
        <CommonNavbar :nav-items="adminnav" :dropdown-items="admindropdownData" :logo="logo" :logo-url="logoUrl" />
        <div class="results mt-5">
            <CommonElection />
        </div>
    </div>
</template>

<script setup lang="ts">
import CommonElection from '../CommonComponents/CommonElection.vue';
import CommonNavbar from '../CommonComponents/CommonNavbar.vue';
import { reactive, ref } from 'vue';

const logo = ref('');
const logoUrl = '/';
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