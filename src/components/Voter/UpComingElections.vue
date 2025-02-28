<template>
  <div class="container min-vh-100 d-flex flex-column mt-5">
    <div v-if="paginatedUpcomingElections.length > 0" class="row justify-content-center g-3">
      <div v-for="election in paginatedUpcomingElections" :key="election.id" class="col-12 col-md-10 col-lg-8">
        <div class="border p-3 bg-primary text-white rounded-3 shadow">
          <h2 class="text-center fs-3 fs-md-2 fw-bold mb-3">{{ election.electionName }}</h2>
          <div class="row g-2 mb-3">
            <div class="col-12 col-md-6 col-lg-4">State: {{ election.stateName }}</div>
            <div class="col-12 col-md-6 col-lg-4">Election Date: {{ election.electionDate.toString().split('T')[0] }}
            </div>
            <div class="col-12 col-md-6 col-lg-4">Election Time From: {{ formatTime(election.electionTimeFrom) }}</div>
            <div class="col-12 col-md-6 col-lg-4">Election Time To: {{ formatTime(election.electionTimeTo) }}</div>
          </div>
          <div class="d-grid gap-2 d-md-flex justify-content-md-center">
            <button class="btn btn-light" @click="viewContestedCandidates(election.id)">
              Contesting Candidates
            </button>
          </div>
        </div>
      </div>
    </div>
    <div v-else class="text-center my-5">
      <p class="lead">No upcoming elections available.</p>
    </div>
    <div class="m-auto">
      <Pagination :currentPage="currentPage" :totalPages="totalPages(upcomingElections.length)" @setPage="setPage" />
    </div>
    <Modal v-if="isModalVisible" :title="modalTitle" :message="modalMessage" :showModal="isModalVisible"
      @close="isModalVisible = false" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import config from '../../config/apiConfig.json'
import Modal from '../Modal.vue'
import { toast } from "vue3-toastify";
import "vue3-toastify/dist/index.css";
import Pagination from '../CommonComponents/Pagination.vue'
import { useDetailsUserStore } from '@/stores/userDetailsStore';
const userDetailsStore = useDetailsUserStore();

interface Election {
  id: number
  stateName: string
  stateId: number;
  electionName: string
  electionDate: string
  electionTimeFrom: string
  electionTimeTo: string
}

const router = useRouter()
const upcomingElections = ref<Election[]>([])
const isModalVisible = ref(false)
const modalTitle = ref('Error')
const modalMessage = ref('')
const currentPage = ref(1)
const itemsPerPage = 2
const stateId = ref();
const totalPages = (totalItems: number) => Math.ceil(totalItems / itemsPerPage)

const paginatedUpcomingElections = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  return upcomingElections.value.slice(start, start + itemsPerPage)
})

const setPage = (page: number) => {
  currentPage.value = page
}

const fetchUpcomingElections = async () => {
  try {
    const response = await axios.get<Election[]>(
      `${config.baseUrl}${config.endpoints.upcomingElections}`
    );
    upcomingElections.value = response.data.filter(ele => ele.stateId == userDetailsStore.userDetails.stateId);
  } catch (error) {
    toast.error((error as Error).message, { theme: "dark" });
  }
};

onMounted(async () => {
  await userDetailsStore.getLoginDetails();
  if (userDetailsStore.userId) {
    await userDetailsStore.fetchUserDetails();
    stateId.value = userDetailsStore.userDetails.stateId;
  }
  await fetchUpcomingElections();
})

const formatTime = (dateTime: string): string => {
  const date = new Date(dateTime)
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

const viewContestedCandidates = (electionId: number) => {
  if (electionId) {
    router.push({
      name: 'contestedcandidateslist',
      params: { electionId }
    })
  } else {
    modalTitle.value = 'Oops Something went wrong'
    modalMessage.value = 'Election ID is undefined'
    isModalVisible.value = true
  }
}
</script>