<template>
  <div class="main-admin">
    <div class="nav">
      <Navbar :nav-items="candidatennav" :dropdown-items="candidatedropdownData" :logo="CandidateLogo"
        :logo-url="logoUrl" />
    </div>
    <div class="main-content d-flex" style="margin-top: 60px; position: sticky; top: 0">
      <div
        class="totalsidebar d-flex flex-column gap-4 justify-content-center bg-body-secondary p-4 align-items-baseline"
        style="height: 93vh; position: sticky; top: 10vh"
      >
        <div
          class="sidebar"
          v-for="(data, index) in candidateData"
          :key="index"
          style="width: 100%"
        >
          <Sidebar :-dashboard="data.dashboardName" :-url="data.url" />
        </div>
      </div>
      <div class="WelcomeAdmin d-flex flex-column align-items-center mt-4" style="width: 80vw">
        <RouterView></RouterView>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import Navbar from "../CommonComponents/CommonNavbar.vue";
import CandidateLogo from "../../assets/Admin/AdminIogo.png";
import { reactive } from "vue";
import Sidebar from "../CommonComponents/SideBarMenu.vue";
import { apiService } from "@/Services/ApiService";

const logoUrl = "/candidate/dashboard"
const candidateData = [
  {
    dashboardName: "DashBoard",
    url: "/candidate/dashboard",
  },
  {
    dashboardName: "Nominations",
    url: "/candidate/nominations",
  },
  {
    dashboardName: "Manifesto",
    url: "/candidate/manifesto",
  },
  {
    dashboardName: "Manage Campaign",
    url: "/candidate/manageCampaign",
  },
  {
    dashboardName: "Election Results",
    url: "/candidate/electionresults",
  },
];

const candidatennav = reactive([
  {
    NavItemName: "",
    Url: "/",
  },
]);

type DropdownItem =
  | { NavItemName: string; Url: string; Action?: undefined }
  | { NavItemName: string; Action: () => void; Url?: undefined };

const candidatedropdownData = reactive<DropdownItem[]>([
  {
    NavItemName: "Profile",
    Url: "/candidate/profile",
  },
  {
    NavItemName: "Logout",
    Action: () => apiService.logout("candidate"),
  },
]);

</script>

<style scoped>
a {
  text-decoration: none;
}
</style>
