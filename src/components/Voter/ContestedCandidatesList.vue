<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'
import config from '../../config/apiConfig.json'
import 'bootstrap-icons/font/bootstrap-icons.css'
import Pagination from '../CommonComponents/Pagination.vue'
import { previousRoute } from "@/router"

interface Candidate {
  candidateId: number
  partyId: number
  partyName: string
  constituencyId: string
  constituencyName: string
  fullName: string
  dateOfBirth: string
  photo: string
}

defineProps({
  electionId: {
    type: Number,
    required: true
  }
})

const candidates = ref<Candidate[]>([])
const loading = ref(false)
const error = ref('')
const searchQuery = ref('')
const selectedParty = ref('')
const selectedConstituency = ref('')
const route = useRoute()
const router = useRouter()
const electionCode = parseInt(route.params.electionId as string)
const currentPage = ref(1)
const itemsPerPage = 5
const totalPages = (totalItems: number) => Math.ceil(totalItems / itemsPerPage)
const prevRoute = ref("previousRoute || '/voter/dashboard'");

const uniqueParties = computed(() => {
  return [...new Set(candidates.value.map((candidate) => candidate.partyName))]
})

const uniqueConstituencies = computed(() => {
  return [...new Set(candidates.value.map((candidate) => candidate.constituencyName))]
})

const filteredCandidates = computed(() => {
  return candidates.value.filter((candidate) => {
    const matchesSearchQuery =
      candidate.fullName.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      candidate.partyName.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      candidate.constituencyName.toLowerCase().includes(searchQuery.value.toLowerCase())

    const matchesParty = selectedParty.value
      ? candidate.partyName === selectedParty.value
      : true

    const matchesConstituency = selectedConstituency.value
      ? candidate.constituencyName === selectedConstituency.value
      : true

    return matchesSearchQuery && matchesParty && matchesConstituency
  })
})

const paginatedfilteredCandidates = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  return filteredCandidates.value.slice(start, start + itemsPerPage)
})

const fetchCandidates = async () => {
  loading.value = true
  error.value = ''
  try {
    const response = await axios.get(
      `${config.baseUrl}${config.endpoints.Nominations}/${electionCode}/contestedcandidates`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('VoterToken')}`
        }
      }
    )
    candidates.value = response.data
  } catch (err) {
    error.value = 'Failed to fetch contested candidates.'
  } finally {
    loading.value = false
  }
}

const setPage = (page: number) => {
  currentPage.value = page
}


const goToProfile = (candidateId: number) => {
  router.push({
    name: 'ContestedCandidateProfile',
    params: {
      electionId: Number(electionCode),
      candidateId: Number(candidateId)
    }
  })
}

const goBack = () => {
  router.push('/voter/upcomingelections')

}

onMounted(() => {
  fetchCandidates()
  prevRoute.value = previousRoute || "/voter/dashboard"
})
</script>

<template>
  <div class="container mt-5">
    <div class="mb-3">
      <div class="d-flex align-items-center">
        <button @click="goBack" class="btn btn-link fs-4 ms-2">
          <i class="bi bi-arrow-left-circle-fill text-primary"></i>
        </button>
        <h3 class="text-center flex-grow-1">Contested Candidates</h3>
      </div>
      <div class="d-flex justify-content-evenly align-items-center gap-3 my-3">
        <input type="text" v-model="searchQuery" placeholder="Search by name, party or constituency"
          class="form-control w-50" />
        <select v-model="selectedParty" class="form-select w-25">
          <option value="">All Parties</option>
          <option v-for="party in uniqueParties" :key="party" :value="party">
            {{ party }}
          </option>
        </select>
        <select v-model="selectedConstituency" class="form-select w-25">
          <option value="">All Constituencies</option>
          <option v-for="constituency in uniqueConstituencies" :key="constituency" :value="constituency">
            {{ constituency }}
          </option>
        </select>
      </div>
    </div>

    <div v-if="paginatedfilteredCandidates.length > 0" class="d-flex flex-wrap justify-content-evenly">
      <div v-for="candidate in paginatedfilteredCandidates" :key="candidate.candidateId" class="card m-2"
        style="width: 200px; cursor: pointer;" @click="goToProfile(candidate.candidateId)">
        <div class="card-body text-center">
          <img :src="candidate.photo" alt="CandidateImg" class="w-100 mb-3"
            style="max-width: 150px; height: 150px; border-radius: 20%; object-fit: cover;" />
          <h3 class="h6 mb-2">{{ candidate.fullName }}</h3>
          <p class="small mb-1">
            <strong>Date of Birth:</strong>
            {{ candidate.dateOfBirth.toString().split('T')[0] }}
          </p>
          <p class="small mb-1"><strong>Party:</strong> {{ candidate.partyName }}</p>
          <p class="small mb-1"><strong>Constituency:</strong> {{ candidate.constituencyName }}</p>
        </div>
      </div>
    </div>

    <div v-else-if="!loading && filteredCandidates.length === 0" class="text-center">
      <p>No contested candidates found.</p>
    </div>
  </div>

  <div class="fixed-bottom text-center w-100">
    <Pagination :currentPage="currentPage" :totalPages="totalPages(filteredCandidates.length)" @setPage="setPage" />
  </div>
</template>