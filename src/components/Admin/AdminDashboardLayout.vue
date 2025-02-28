<template>
  <div class="main-admin">
    <div class="nav">
      <Navbar :nav-items="adminnav" :dropdown-items="admindropdownData" :logo="AdminImage" :logo-url="logoUrl" />
    </div>
    <div class="main-content d-flex" style="margin-top: 60px">
      <div
        class="totalsidebar d-flex flex-column gap-2 justify-content-center bg-body-secondary p-4 align-items-baseline">
        <div class="sidebar" v-for="(data, index) in adminData" :key="index" style="width: 100%">
          <Sidebar :Dashboard="data.dashboardName" :Url="data.url" />
        </div>
      </div>
      <div class="WelcomeAdmin d-flex flex-column" style="width: 80vw">
        <div class="heading">
          <router-view></router-view>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import Navbar from '../CommonComponents/CommonNavbar.vue'
import AdminImage from '../../assets/Admin/AdminIogo.png'
import { reactive } from 'vue'
import Sidebar from '../CommonComponents/SideBarMenu.vue'
import { apiService } from "@/Services/ApiService";

const logoUrl = "/admin/dashboard"

const adminData = [
  {
    dashboardName: 'Dashboard',
    url: '/admin/dashboard',
  },
  {
    dashboardName: 'Election Management',
    url: '/admin/electionmanagement',
  },
  {
    dashboardName: 'Candidate Management',
    url: '/admin/candidatemanagement',
  },
  {
    dashboardName: 'Voters Management',
    url: '/admin/votermanagement',
  },
  {
    dashboardName: 'Reports',
    url: '/admin/reports',
  },
  {
    dashboardName: 'Election Results',
    url: '/admin/electionresults',
  }
]

const adminnav = reactive([
  {
    NavItemName: '',
    Url: '/admin/dashboard'
  }
])

type DropdownItem =
  | { NavItemName: string; Url: string; Action?: undefined }
  | { NavItemName: string; Action: () => void; Url?: undefined };

const admindropdownData = reactive<DropdownItem[]>([
  {
    NavItemName: "Profile",
    Url: "/admin/profile",
  },
  {
    NavItemName: "Logout",
    Action: () => apiService.logout("admin"),
  },
]);

</script>

<style scoped>
a {
  text-decoration: none;
}

.totalsidebar {
  height: 91vh;
}
</style>
