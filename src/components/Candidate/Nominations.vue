<template>
  <div class="container mt-4 mb-5">
    <div class="d-flex justify-content-center gap-2 mb-4">
      <button
        class="btn btn-outline-primary"
        :class="{ active: !showAppliedElections && !showWithdrawnElections }"
        @click="toggleElections(false, false)"
      >
        Apply Nominations
      </button>
      <button
        class="btn btn-outline-primary"
        :class="{ active: showAppliedElections }"
        @click="toggleElections(true, false)"
      >
        Applied Nominations
      </button>
      <button
        class="btn btn-outline-primary"
        :class="{ active: showWithdrawnElections }"
        @click="toggleElections(false, true)"
      >
        Withdrawals
      </button>
    </div>
    <div v-if="!showAppliedElections && !showWithdrawnElections">
      <h3 class="text-center mb-4">Upcoming Elections</h3>
      <div v-if="paginatedUpcomingElections.length > 0">
        <div class="row row-cols-1 row-cols-1 g-4 d-flex flex-column align-items-center">
          <div
            v-for="election in paginatedUpcomingElections"
            :key="election.id"
            class="col-10"
          >
            <div class="card h-100 shadow">
              <div class="card-body" style="background-color: #418ced; color: #f0e4cc">
                <h2 class="card-title mb-3">{{ election.electionName }}</h2>
                <div class="row g-3 mb-3">
                  <div class="col-md-6">
                    <p class="mb-1"><strong>State:</strong> {{ election.stateName }}</p>
                    <p class="mb-1">
                      <strong>Election Date:</strong>
                      {{ formatDate(election.electionDate) }}
                    </p>
                  </div>
                  <div class="col-md-6">
                    <p class="mb-1">
                      <strong>Nomination Start:</strong>
                      {{ formatDate(election.nominationDateFrom) }}
                    </p>
                    <p class="mb-1">
                      <strong>Nomination End:</strong>
                      {{ formatDate(election.nominationTo) }}
                    </p>
                  </div>
                </div>
                <p class="text-muted"><strong>Deposit Amount:</strong> {{ election.depositAmount }}</p>
                <div class="d-flex flex-wrap gap-2 justify-content-around mt-3">
                  <button class="btn bg-white text-dark border">Total Votes: 1,23,45,678</button>
                  <button class="btn bg-white text-dark border" @click="viewContestedCandidates(election.id)">
                    Contesting Candidates
                  </button>
                  <button
                    class="btn btn-success"
                    @click="applyForNomination(election.id)"
                  >
                    Apply
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="fixed-bottom p-3">
          <Pagination
            :currentPage="currentPage"
            :totalPages="totalPages(upcomingElections.length)"
            @setPage="setPage"
            class="justify-content-center"
          />
        </div>
      </div>
      <p v-else class="text-center text-muted">No upcoming elections available.</p>
    </div>
    <div v-if="showAppliedElections && !showWithdrawnElections">
      <h3 class="text-center mb-4">Applied Nominations</h3>
      <div v-if="paginatedAppliedElections.length > 0">
        <div class="row row-cols-1 g-4 d-flex flex-column align-items-center">
          <div
            v-for="nomination in paginatedAppliedElections"
            :key="nomination.id"
            class="col-10"
          >
            <div class="card h-100 shadow">
              <div
                class="card-body"
                :class="nominationStatusClass(nomination.candidateNominationStatus)"
              >
                <h2 class="card-title mb-3">{{ nomination.electionName }}</h2>
                <div class="row g-3">
                  <div class="col-md-6">
                    <p class="mb-1">
                      <strong>Nomination ID:</strong> {{ nomination.id }}
                    </p>
                    <p class="mb-1"><strong>Party:</strong> {{ nomination.partyName }}</p>
                    <p class="mb-1">
                      <strong>Constituency:</strong> {{ nomination.constituencyName }}
                    </p>
                  </div>
                  <div class="col-md-6">
                    <p class="mb-1"><strong>State:</strong> {{ nomination.stateName }}</p>
                    <p class="mb-1">
                      <strong>Election Date:</strong>
                      {{ formatDate(nomination.electionDate) }}
                    </p>
                    <p class="mb-1">
                      <strong>Status:</strong> {{ nomination.candidateNominationStatus }}
                    </p>
                  </div>
                </div>
                <div
                  v-if="nomination.candidateNominationStatus === 'Rejected'"
                  class="alert alert-danger mt-3"
                >
                  <strong>Rejection Reason:</strong> {{ nomination.reason }}
                </div>
                <div v-else class="d-flex flex-wrap gap-2 justify-content-center mt-3">
                  <button class="btn btn-secondary disabled">
                    Total Votes: 1,23,45,678
                  </button>
                  <button
                    class="btn btn-primary"
                    @click="viewContestedCandidates(nomination.electionId)"
                  >
                    Contesting Candidates
                  </button>
                  <button
                    class="btn btn-danger"
                    @click="WithDraw(nomination.id, nomination.electionName)"
                  >
                    Withdraw
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="fixed-bottom p-3">
          <Pagination
            :currentPage="currentPage"
            :totalPages="totalPages(appliedElections.length)"
            @setPage="setPage"
            class="justify-content-center"
          />
        </div>
      </div>
      <p v-else class="text-center text-muted">No applied elections available.</p>
    </div>
    <div v-if="showWithdrawnElections">
      <h3 class="text-center mb-4">Withdrawn Elections</h3>
      <div v-if="paginatedWithdrawnElections.length > 0">
        <div class="row row-cols-1 g-4 d-flex align-content-center flex-column">
          <div
            v-for="election in paginatedWithdrawnElections"
            :key="election.id"
            class="col-10"
          >
            <div class="card h-100 shadow">
              <div class="card-body">
                <h2 class="card-title mb-3">{{ election.electionName }}</h2>
                <div class="row g-3">
                  <div class="col-md-6">
                    <p class="mb-1">
                      <strong>Constituency:</strong> {{ election.constituencyName }}
                    </p>
                    <p class="mb-1"><strong>Party:</strong> {{ election.partyName }}</p>
                  </div>
                  <div class="col-md-6">
                    <p class="mb-1"><strong>State:</strong> {{ election.stateName }}</p>
                    <p class="mb-1">
                      <strong>Election Date:</strong>
                      {{ formatDate(election.electionDate) }}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="fixed-bottom p-3">
          <Pagination
            :currentPage="currentPage"
            :totalPages="totalPages(withdrawnElections.length)"
            @setPage="setPage"
            class="justify-content-center"
          />
        </div>
      </div>
      <p v-else class="text-center text-muted">No withdrawn elections available.</p>
    </div>

    <Modal
      v-if="isModalVisible"
      :title="modalTitle"
      :message="modalMessage"
      :showModal="isModalVisible"
      @close="isModalVisible = false"
    />
  </div>
</template>

<style scoped>
.card {
  transition: transform 0.2s;
  cursor: pointer;
}

.card:hover {
  transform: translateY(-5px);
}

.status-pending {
  background-color: #fdfd96;
  color: #333;
}

.status-approved {
  background-color: #d4edda;
  color: #155724;
}

.status-rejected {
  background-color: #f8d7da;
  color: #721c24;
}
</style>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";
import config from "../../config/apiConfig.json";
import Modal from "../Modal.vue";
import Pagination from "../CommonComponents/Pagination.vue";
import { useCandidateStore } from "@/Services/Store";
interface Election {
  id: number;
  stateName: string;
  electionName: string;
  nominationTo: string;
  nominationDateFrom: string;
  electionDate: string;
  depositAmount: number;
}

interface AppliedElection {
  id: number;
  partyName: string;
  stateName: string;
  constituencyName: string;
  electionId: number;
  electionName: string;
  nominationTo: string;
  electionDate: string;
  candidateNominationStatus: string;
  reason: string | null;
}

interface WithdrawnElection {
  id: number;
  electionName: string;
  electionDate: string;
  partyName: string;
  stateName: string;
  constituencyName: string;
}

const router = useRouter();
const upcomingElections = ref<Election[]>([]);
const appliedElections = ref<AppliedElection[]>([]);
const withdrawnElections = ref<WithdrawnElection[]>([]);
const showAppliedElections = ref(false);
const showWithdrawnElections = ref(false);
const candidateStore = useCandidateStore();
const candidateId = candidateStore.candidateId;
const isModalVisible = ref(false);
const modalTitle = ref("");
const modalMessage = ref("");
const currentPage = ref(1);
const itemsPerPage = 3;

const totalPages = (totalItems: number) => Math.ceil(totalItems / itemsPerPage);

const paginatedUpcomingElections = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  return upcomingElections.value.slice(start, start + itemsPerPage);
});

const paginatedAppliedElections = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  return appliedElections.value.slice(start, start + itemsPerPage);
});

const paginatedWithdrawnElections = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  return withdrawnElections.value.slice(start, start + itemsPerPage);
});

const setPage = (page: number) => {
  currentPage.value = page;
};

const formatDate = (date: string) => date.split("T")[0];

const toggleElections = (showApplied: boolean, showWithdrawn: boolean) => {
  currentPage.value = 1;
  showAppliedElections.value = showApplied;
  showWithdrawnElections.value = showWithdrawn;
  if (showWithdrawn) fetchWithdrawnElections();
};

const applyForNomination = (electionId: number) => {
  router.push({
    name: "applynominations",
    params: {
      candidateId,
      electionCode: electionId,
    },
  });
};
const viewContestedCandidates = (electionId: number) => {
  if (electionId) {
    router.push({
      name: "ContestedCandidates",
      params: { electionId },
    });
  } else {
    modalTitle.value = "Oops Something went wrong";
    modalMessage.value = `Election ID is undefined`;
    isModalVisible.value = true;
  }
};

const nominationStatusClass = (status: string) => {
  switch (status) {
    case "Pending":
      return "status-pending";
    case "Approved":
      return "status-approved";
    case "Rejected":
      return "status-rejected";
    default:
      return "";
  }
};

const WithDraw = async (nominationId: number, electionName: string) => {
  const token = localStorage.getItem("CandidateToken");
  try {
    await axios.put(`${config.baseUrl}${config.endpoints.Nominations}/${nominationId}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    const appliedResponse = await axios.get(
      `${config.baseUrl}${config.endpoints.Nominations}/nominatedelections/${candidateId}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    modalTitle.value = "Success";
    modalMessage.value = `Your Nomination has been withdrawn for the election: ${electionName}`;
    isModalVisible.value = true;
    if (
      appliedResponse.status === 404 ||
      !appliedResponse.data ||
      appliedResponse.data.length === 0
    ) {
      appliedElections.value = [];
      return;
    }
    appliedElections.value = appliedResponse.data;
  } catch (error) {
    modalTitle.value = "Oops, Cannot Withdraw Nomination!";
    modalMessage.value = `Error: ${error}`;
    isModalVisible.value = true;
  }
};

onMounted(async () => {
  const url = `${config.baseUrl}${config.endpoints.Nominations}/upcomingelectionsfornomination/${candidateId}`;
  const token = localStorage.getItem("CandidateToken");
  try {
    const response = await axios.get(url, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    if (response.status === 404 || !response.data || response.data.length === 0) {
      upcomingElections.value = [];
      return;
    }
    upcomingElections.value = response.data;
  } catch (error) {
    modalTitle.value = "Cannot Fetch";
    modalMessage.value = `Error fetching elections ${error}`;
    isModalVisible.value = true;
  }
  try {
    const appliedResponse = await axios.get(
      `${config.baseUrl}${config.endpoints.Nominations}/nominatedelections/${candidateId}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (
      appliedResponse.status === 404 ||
      !appliedResponse.data ||
      appliedResponse.data.length === 0
    ) {
      appliedElections.value = [];
      return;
    }
    appliedElections.value = appliedResponse.data;
  } catch (error: any) {
    modalTitle.value = "Cannot Fetch Applied Elections";
    modalMessage.value = `Error fetching applied elections: ${error.message || error}`;
    isModalVisible.value = true;
  }
});

const fetchWithdrawnElections = async () => {
  const url = `${config.baseUrl}${config.endpoints.Nominations}/${candidateId}/withdrawls`;
  try {
    const token = localStorage.getItem("CandidateToken");
    const response = await axios.get(url, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    if (response.status === 404 || !response.data || response.data.length === 0) {
      withdrawnElections.value = [];
      return;
    }
    withdrawnElections.value = response.data;
  } catch (error: any) {
    modalTitle.value = "Cannot Fetch Withdrawn Elections";
    modalMessage.value = `Error fetching withdrawn elections: ${error.message || error}`;
    isModalVisible.value = true;
  }
};
</script>
