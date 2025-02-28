<template>
  <div class="main-home">
    <Navbar :nav-items="landingData" :dropdown-items="dropdownData" :logo="logo" :navdropdown-items="navdropdownData"
      :logo-url="logoUrl" />
    <div style="padding-bottom: 86px;" class="main">
      <Carousel />
      <Cards />
      <ElectionCards />
      <Footer />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { reactive, ref } from "vue";
import Cards from "@/components/LandingPage/Cards.vue";
import ElectionCards from "@/components/LandingPage/ElectionCards.vue";
import Navbar from "../../components/CommonComponents/CommonNavbar.vue"
import Footer from "@/components/LandingPage/LandingPageFooter.vue";
import Carousel from "@/components/LandingPage/LandingPageCarousel.vue";


const logo = ref('')
const logoUrl = "/";
const landingData = reactive([
  {
    NavItemName: "Election Results",
    Url: "/declaredresults"
  },
  {
    NavItemName: "Elections",
    Url: "/elections"
  }
])

const dropdownData = reactive([
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
]
)


const navdropdownData = reactive([

  {
    NavItemName: "Live Results",
    Url: "/liveresults"
  },
  {
    NavItemName: "Declared Results",
    Url: "/declaredresults"
  },
  {
    NavItemName: "Elections",
    Url: "/elections"
  },
  {
    NavItemName: "Login As Voter",
    Url: "/voterLogin"
  },
  {
    NavItemName: "Login As Candidate",
    Url: "/candidateLogin"
  },
  {
    NavItemName: "Login As Admin",
    Url: "/adminLogin"
  }

])
</script>
<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
</style>