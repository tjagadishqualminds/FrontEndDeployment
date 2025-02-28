<script setup lang="ts">
import { ref, onMounted } from 'vue'
import axios from 'axios'
import config from '../../config/apiConfig.json'
import 'bootstrap-icons/font/bootstrap-icons.css'
import { toast } from "vue3-toastify";
import "vue3-toastify/dist/index.css";


interface Candidate {
  id: number
  partyId: number
  partyName: string
  constituencyId: string
  constituencyName: string
  fullName: string
  dateOfBirth: string
  photo: string
  manifesto: string
}

const props = defineProps({
  electionId: {
    type: Number,
    required: true
  },
  candidateId: {
    type: Number,
    required: true
  }
})

const candidate = ref<Candidate>()
const route = ref("previousRoute || '/voter/dashboard'");

const fetchCandidateDetails = async () => {
  try {
    const response = await axios.get(
      `${config.baseUrl}${config.endpoints.Nominations}/${props.electionId}/${props.candidateId}/GetProfileDetailsByCandidateId`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem('VoterToken')}`
        },
      }
    );
    candidate.value = response.data;
  } catch (error) {
    toast.error((error as Error).message, { theme: "dark" });

  }
};
const formatDate = (dateString: any) => {
  return new Date(dateString).toISOString().split('T')[0]
}
onMounted(() => {
  fetchCandidateDetails()
})
</script>

<template>
  <div class="container-md mt-5 p-4 position-relative">
    <router-link :to="route" class="position-absolute top-0 start-0 m-3 text-decoration-none">
      <i class="bi bi-arrow-left-circle-fill fs-3 text-primary"></i>
    </router-link>

    <div class="card mx-auto mt-4 p-4" style="max-width: 800px;">
      <div v-if="candidate">
        <div class="d-flex flex-column flex-md-row gap-4 align-items-start">
          <div class="flex-grow-1">
            <h2 class="mb-3">{{ candidate.fullName }}</h2>
            <div class="mb-3">
              <p class="mb-1"><strong>Date of Birth:</strong> {{ formatDate(candidate.dateOfBirth) }}</p>
              <p class="mb-1"><strong>Party:</strong> {{ candidate.partyName }}</p>
              <p class="mb-0"><strong>Constituency:</strong> {{ candidate.constituencyName }}</p>
            </div>
          </div>
          <img :src="candidate.photo" alt="Candidate" class="img-fluid rounded ms-md-3" style="max-width: 150px;">
        </div>

        <div class="card mt-4">
          <div class="card-body">
            <h3 class="card-title h5 mb-3">Manifesto</h3>
            <p class="card-text lh-base">{{ candidate.manifesto }}</p>
          </div>
        </div>
      </div>

      <div v-else class="text-center py-4">
        <p class="mb-0">Loading candidate details...</p>
      </div>
    </div>
  </div>
</template>
<style scoped>
.bi-arrow-left-circle-fill:hover {
  color: #0056b3 !important;
}
</style>