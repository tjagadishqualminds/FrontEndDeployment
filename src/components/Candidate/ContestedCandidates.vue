<template>
  <div class="container mt-3">
    <div class="mb-4">
      <div class="d-flex align-items-center mb-4">
        <button @click="goBack" class="btn btn-link p-0 me-2">
          <i class="bi bi-arrow-left-circle-fill fs-3 text-primary"></i>
        </button>
        <h3 class="text-center flex-grow-1">Contested Candidates</h3>
      </div>
      <div class="row g-3 mb-4">
        <div class="col-12 col-md-6 col-lg-4">
          <input type="text" v-model="searchQuery" class="form-control"
            placeholder="Search by name, party or constituency" />
        </div>
        <div class="col-12 col-md-6 col-lg-4">
          <select v-model="selectedParty" class="form-select">
            <option value="">All Parties</option>
            <option v-for="party in uniqueParties" :key="party" :value="party">
              {{ party }}
            </option>
          </select>
        </div>
        <div class="col-12 col-md-6 col-lg-4">
          <select v-model="selectedConstituency" class="form-select">
            <option value="">All Constituencies</option>
            <option v-for="constituency in uniqueConstituencies" :key="constituency" :value="constituency">
              {{ constituency }}
            </option>
          </select>
        </div>
      </div>
    </div>
    <div v-if="paginatedfilteredCandidates.length > 0" class="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
      <div v-for="candidate in paginatedfilteredCandidates" :key="candidate.candidateId" class="col"
        @click="goToProfile(candidate.candidateId)">
        <div class="card h-100 shadow-sm cursor-pointer">
          <div class="card-body text-center">
            <img :src="candidate.photo" alt="Candidate" class="img-fluid rounded-circle mb-3"
              style="width: 150px; height: 150px; object-fit: cover;">
            <h5 class="card-title mb-3">{{ candidate.fullName }}</h5>
            <div class="card-text text-start">
              <p class="mb-1"><strong>Date of Birth:</strong> {{ candidate.dateOfBirth.toString().split("T")[0] }}</p>
              <p class="mb-1"><strong>Party:</strong> {{ candidate.partyName }}</p>
              <p class="mb-0"><strong>Constituency:</strong> {{ candidate.constituencyName }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-else-if="!loading && filteredCandidates.length === 0" class="text-center py-5">
      <p class="text-muted">No contested candidates found.</p>
    </div>
    <div class="fixed-bottom p-3">
      <Pagination :currentPage="currentPage" :totalPages="totalPages" @setPage="setPage"
        class="justify-content-center" />
    </div>
  </div>
</template>

<style scoped>
.cursor-pointer {
  cursor: pointer;
}

.card:hover {
  transform: translateY(-5px);
  transition: transform 0.2s ease;
}

.img-fluid {
  max-width: 100%;
  height: auto;
}
</style>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import axios from "axios";
import { useRoute, useRouter } from "vue-router";
import config from "../../config/apiConfig.json";
import Pagination from "../CommonComponents/Pagination.vue";
import "bootstrap-icons/font/bootstrap-icons.css";

interface Candidate {
  candidateId: number;
  partyId: number;
  partyName: string;
  constituencyId: string;
  constituencyName: string;
  fullName: string;
  dateOfBirth: string;
  photo: string;
}
defineProps({
  electionId: {
    type: Number,
    required: true,
  },
});

const router = useRouter();
const route = useRoute();
const electionCode = parseInt(route.params.electionId as string);

const candidates = ref<Candidate[]>([]);
const loading = ref(false);
const error = ref("");
const searchQuery = ref("");
const selectedParty = ref("");
const selectedConstituency = ref("");
const showFilters = ref(false);
const currentPage = ref(1);
const itemsPerPage = 5;

const uniqueParties = computed(() =>
  [...new Set(candidates.value.map(c => c.partyName))]
);

const uniqueConstituencies = computed(() =>
  [...new Set(candidates.value.map(c => c.constituencyName))]
);

const filteredCandidates = computed(() =>
  candidates.value.filter(c => {
    const searchLower = searchQuery.value.toLowerCase();
    return (
      (c.fullName.toLowerCase().includes(searchLower) ||
        c.partyName.toLowerCase().includes(searchLower) ||
        c.constituencyName.toLowerCase().includes(searchLower)) &&
      (!selectedParty.value || c.partyName === selectedParty.value) &&
      (!selectedConstituency.value || c.constituencyName === selectedConstituency.value)
    );
  })
);

const paginatedfilteredCandidates = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  return filteredCandidates.value.slice(start, start + itemsPerPage);
});

const totalPages = computed(() =>
  Math.ceil(filteredCandidates.value.length / itemsPerPage)
);

const fetchCandidates = async () => {
  loading.value = true;
  error.value = "";
  try {
    const response = await axios.get(
      `${config.baseUrl}${config.endpoints.Nominations}/${electionCode}/contestedCandidates`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    candidates.value = response.data;
  } catch (err) {
    error.value = "Failed to fetch contested candidates.";
  } finally {
    loading.value = false;
  }
};

const toggleFilterDropdown = () => {
  showFilters.value = !showFilters.value;
};

const setPage = (page: number) => {
  currentPage.value = page;
};

const goToProfile = (candidateId: number) => {
  const routeName = router.currentRoute.value.path.includes("/admin/electionmanagement")
    ? "CandidateDetails"
    : "CandidateProfile";

  router.push({
    name: routeName,
    params: {
      electionId: electionCode,
      candidateId: candidateId,
    },
  });
};

const goBack = () => {
  const basePath = router.currentRoute.value.path.includes("/admin")
    ? "/admin/electionmanagement"
    : router.currentRoute.value.path.includes("/candidate")
      ? "/candidate/nominations"
      : "/";

  router.push(basePath);
};

onMounted(fetchCandidates);
</script>
