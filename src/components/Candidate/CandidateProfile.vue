<template>
  <div class="container py-4">
    <button @click="goBack" class="btn btn-link position-absolute top-0 start-0 mt-2 ms-2">
      <i class="bi bi-arrow-left-circle-fill fs-4 text-primary"></i>
    </button>
    <div class="row justify-content-center">
      <div class="col-md-8">
        <div class="card shadow-sm">
          <div class="card-body">
            <div v-if="candidate" class="p-3">
              <div class="row align-items-start mb-4">
                <div class="col">
                  <h2 class="mb-3">{{ candidate.fullName }}</h2>
                  <p class="mb-2">
                    <strong>Date of Birth:</strong>
                    {{ candidate.dateOfBirth.toString().split("T")[0] }}
                  </p>
                  <p class="mb-2"><strong>Party:</strong> {{ candidate.partyName }}</p>
                  <p class="mb-2"><strong>Constituency:</strong> {{ candidate.constituencyName }}</p>
                </div>
                <div class="col-auto">
                  <img :src="candidate.photo" alt="CandidateImg" class="rounded img-fluid" style="max-width: 150px;" />
                </div>
              </div>

              <div class="card bg-light mt-4">
                <div class="card-body">
                  <h3 class="card-title h4 mb-3">Manifesto</h3>
                  <p class="card-text">{{ candidate.manifesto }}</p>
                </div>
              </div>
            </div>
            <div v-else class="text-center py-4">
              <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
              </div>
              <p class="mt-2">Loading candidate details...</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted } from "vue";
import axios from "axios";
import { useRouter } from "vue-router";
import config from "../../config/apiConfig.json";
import { toast } from "vue3-toastify";
import "vue3-toastify/dist/index.css";

interface Candidate {
  id: number;
  partyId: number;
  partyName: string;
  constituencyId: string;
  constituencyName: string;
  fullName: string;
  dateOfBirth: string;
  photo: string;
  manifesto: string;
}

const props = defineProps({
  electionId: {
    type: Number,
    required: true,
  },
  candidateId: {
    type: Number,
    required: true,
  },
});

const router = useRouter();
const candidate = ref<Candidate>();

const fetchCandidateDetails = async () => {
  const token = localStorage.getItem("token");
  try {
    const response = await axios.get(
      `${config.baseUrl}${config.endpoints.Nominations}/${props.electionId}/${props.candidateId}/GetProfileDetailsByCandidateId`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    candidate.value = response.data;
  } catch (error) {
    toast.error("Error fetching candidate details:", { theme: "dark" });
  }
};

const goBack = () => {
  const currentPath = router.currentRoute.value.path;
  const electionId = props.electionId;
  if (currentPath.includes("/admin")) {
    router.push(`/admin/electionmanagement/${electionId}/ContestedCandidates`);
  } else if (currentPath.includes("/candidate")) {
    router.push(`/candidate/${electionId}/ContestedCandidates`);
  } else {
    router.push("/");
  }
};

onMounted(() => {
  fetchCandidateDetails();
});
</script>