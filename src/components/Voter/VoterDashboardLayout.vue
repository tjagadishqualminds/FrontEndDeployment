<template>
  <div class="main-admin">
    <div class="nav">
      <Navbar :nav-items="voternav" :dropdown-items="voterdropdownData" :logo="Logo" :logo-url="logoUrl" />
    </div>
    <div class="main-content-voter d-flex" style="margin-top: 50px;">
      <div
        class="totalsidebar d-flex flex-column   gap-4 justify-content-center bg-body-secondary p-4 align-items-baseline"
        style="height: 94vh; position: sticky; top: 10vh;">
        <div class="sidebar" v-for="(data, index) in voterDashboardData" :key="index" style="width: 100%;">
          <Sidebar :-dashboard="data.dashboardName" :-url="data.url" />
        </div>
      </div>
      <div class="WelcomeAdmin d-flex flex-column align-items-center mt-4" style="width: 80vw">
        <RouterView></RouterView>
      </div>
    </div>
  </div>
</template>

<style scoped>
.main-admin {
  display: flex;
  flex-direction: column;
}

a {
  text-decoration: none;
}
</style>


<script setup lang="ts">
import Navbar from '../CommonComponents/CommonNavbar.vue';
import { reactive } from 'vue';
import Sidebar from '../CommonComponents/SideBarMenu.vue';
import Logo from "../../assets/Admin/AdminIogo.png"
import { apiService } from '@/Services/ApiService';

const logoUrl = "/voter/dashboard"
const voterDashboardData = [
  {
    dashboardName: "Dashboard",
    url: "/voter/dashboard"
  },
  {
    dashboardName: "Vote Now",
    url: "/voter/votenow",
  },
  {
    dashboardName: "Upcoming Elections",
    url: "/voter/upcomingelections",
  },
  {
    dashboardName: "Election Results",
    url: "/voter/voterelectionresults",
  },
  {
    dashboardName: "Register as Candidate",
    url: "/voter/registercandidate",
  },
  {
    dashboardName: "Candidate Feedback",
    url: "/voter/feedback",
  }
]
const voternav = reactive([
  {
    NavItemName: "",
    Url: "/"
  }

])
type DropdownItem =
  | { NavItemName: string; Url: string; Action?: undefined }
  | { NavItemName: string; Action: () => void; Url?: undefined };

const voterdropdownData = reactive<DropdownItem[]>([
  {
    NavItemName: "Profile",
    Url: "/voter/profile",
  },
  {
    NavItemName: "Logout",
    Action: () => apiService.logout("voter"),
  },
]);
</script>
