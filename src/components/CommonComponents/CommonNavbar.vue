<script setup lang="ts">
import { Icon } from "@iconify/vue"
import { defineProps, onMounted, ref } from "vue";
import Commonlogo from "@/assets/landingpage/logo.png"
defineProps<{
  navItems: Array<{ NavItemName: string; Url: string }>;
  dropdownItems: Array<
    | { NavItemName: string; Url: string; Action?: undefined }
    | { NavItemName: string; Action: Function; Url?: undefined }
  >;
  logo: string;
  logoUrl: string;
}>();

const Dropdown = ref(false);
const isDropdown = () => {
  Dropdown.value = !Dropdown.value;
}
import { useDetailsUserStore } from '@/stores/userDetailsStore';
const userDetailsStore = useDetailsUserStore();
const profileImageUrl = ref<string | null>(null);

onMounted(async () => {
  await userDetailsStore.getLoginDetails();
  if (userDetailsStore.userId) {
    await userDetailsStore.fetchUserDetails();
    profileImageUrl.value = userDetailsStore.userDetails.profileImageUrl;
  }
});

</script>

<template>
  <div>
    <nav class="navbar navbar-expand-lg fixed-top navbar-dark bg-gradient-custom">
      <div class="container-fluid d-flex align-content-center">
        <div class="logos d-flex align-items-center flex-row-reverse gap-2">
          <router-link class="navbar-brand" :to=logoUrl>
            <img :src="Commonlogo" class="img-fluid" alt="Logo" style="width: 120px" />
          </router-link>
          <router-link :to="logoUrl" class="ms-3">
            <img :src="logo" class="img-fluid" alt="" style="width: 5vw;" />
          </router-link>
        </div>
        <button class="navbar-toggler shadow-none border-0" type="button" data-bs-toggle="offcanvas"
          data-bs-target="#offcanvasNavbar" aria-controls="offcanvasNavbar" aria-label="Toggle navigation">
          <span class="navbar-toggler-icon" @click="isDropdown"></span>
        </button>
        <div class="offcanvas offcanvas-end bg-gradient-custom" tabindex="-1" id="offcanvasNavbar"
          aria-labelledby="offcanvasNavbarLabel">
          <div class="offcanvas-header border-bottom">
            <h5 class="offcanvas-title" id="offcanvasNavbarLabel">E-Voting</h5>
            <button type="button" class="btn-close text-reset shadow-none text-white" data-bs-dismiss="offcanvas"
              aria-label="Close"></button>
          </div>
          <div class="offcanvas-body d-flex flex-lg-row flex-column p-4 p-lg-0">
            <ul class="navbar-nav justify-content-center align-items-center fs-6 flex-grow-1 pe-3">
              <li class="nav-item mx-2" v-for="(data, index) in navItems" :key="index">
                <router-link class="nav-link" :to="data.Url">{{ data.NavItemName }}</router-link>
              </li>
            </ul>
            <div :class="['btn-group', Dropdown ? 'dropup' : 'dropdown']">
              <button class="btn shadow-none border-0" type="button" data-bs-toggle="dropdown" aria-expanded="false">
                <Icon v-if="!profileImageUrl" icon="mdi:account-circle-outline" width="24" color="white" />
                <img v-else :src="profileImageUrl" alt="profileImg"
                  style="width: 34px; height: 34px; border-radius: 50%; background-color: aliceblue;" />
              </button>
              <ul class="dropdown-menu dropdown-menu-start-lg drop">
                <li v-for="(data, index) in dropdownItems" :key="index">
                  <button v-if="data.Action" class="dropdown-item text-white" @click="data.Action && data.Action()">
                    {{ data.NavItemName }}
                  </button>
                  <router-link v-else class="dropdown-item text-white" :to="data.Url">
                    {{ data.NavItemName }}
                  </router-link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </nav>
  </div>
</template>


<style scoped>
.navbar {
  background: linear-gradient(to right, #0e5695, #1e8bcd);
  opacity: 1;
}

.offcanvas {
  background: linear-gradient(to right, #0e5695, #1e8bcd);
  opacity: 1;
}

@media (max-width: 982px) {
  .Commonlogo {
    width: 12vw;
  }
}

.btn-group {
  margin-right: 6vw;
}

.navbar .nav-link,
.dropdown-menu,
.offcanvas {
  background-color: inherit;
  color: #fff;
}

.loginbtns {
  margin-right: 10vw;
}

.dropdown-menu {
  background: #1e8bcd;
  border-radius: 0.25rem;
  color: #fff;
}

.dropdown-item:hover {
  background-color: #0e5695;
  color: #fff;
}
</style>
