<template>
  <div class="container p-4">
    <div class="d-flex justify-content-between gap-4 flex-column">
      <section class="flex-1 bg-white rounded p-4 shadow-sm border w-30">
        <h2 class="fs-4 mb-3 text-center">Active Elections</h2>
        <div v-if="activeElections.length > 0" class="d-flex gap-2 overflow-x-scroll h-75 w-[70vw]">
          <div v-for="election in activeElections" :key="election.id"
            class="bg-white rounded p-4 shadow-sm mb-3 flex-shrink-0 ">
            <h3 class="fs-5 fw-bold mb-2 text-center">{{ election.electionName }}</h3>
            <p class="small text-muted mb-2">State: {{ election.stateName }}</p>
            <p class="small text-muted mb-2">
              From: {{ formatDate(election.electionTimeFrom) }} To:
              {{ formatDate(election.electionTimeTo) }}
            </p>
            <button class="btn btn-primary w-100" @click="viewCandidates(election)">
              View Candidates
            </button>
          </div>
        </div>
        <p v-else class="text-center text-muted">No active elections available.</p>
      </section>

      <section class="flex-1 bg-white rounded p-4 shadow-sm border w-30">
        <h2 class="fs-4 mb-3 text-center">Upcoming Elections</h2>
        <div v-if="upcomingElections.length > 0" class="d-flex gap-2 overflow-x-scroll h-75 w-[70vw]">
          <div v-for="election in upcomingElections" :key="election.id"
            class="bg-white rounded p-4 shadow-sm mb-3 flex-shrink-0">
            <h3 class="fs-5 fw-bold mb-2 text-center">{{ election.electionName }}</h3>
            <p class="small text-muted mb-2">State: {{ election.stateName }}</p>
            <p class="small text-muted mb-2">
              Election Date: {{ formatDate(election.electionDate) }}
            </p>
            <button class="btn btn-primary w-100" @click="viewCandidates(election)">
              View Candidates
            </button>
          </div>
        </div>
        <p v-else class="text-center text-muted">No upcoming elections available.</p>
      </section>
    </div>
  </div>
</template>
<script lang="ts" setup>
import { ref, onMounted } from "vue";
import axios from "axios";
import { useRouter } from "vue-router";
import config from "../../config/apiConfig.json";
import { toast } from "vue3-toastify";
import "vue3-toastify/dist/index.css";
import { useDetailsUserStore } from '@/stores/userDetailsStore';
const userDetailsStore = useDetailsUserStore();


interface Election {
  id: number;
  electionName: string;
  stateName: string;
  stateId: number;
  electionDate?: string;
  electionTimeFrom?: string;
  electionTimeTo?: string;
}

const activeElections = ref<Election[]>([]);
const upcomingElections = ref<Election[]>([]);
const stateId = ref();

const formatDate = (date: string | undefined) =>
  date
    ? new Date(date).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
    : "";

const fetchActiveElections = async () => {
  try {
    const response = await axios.get<Election[]>(
      `${config.baseUrl}${config.endpoints.activeElections}`
    );
    activeElections.value = response.data;
  } catch (error) {
    toast.error((error as Error).message, { theme: "dark" });
  }
};

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

const router = useRouter();
const viewCandidates = (election: Election) => {
  router.push({ name: "contestedcandidateslist", params: { electionId: election.id } });
};

onMounted(async () => {
  await Promise.all([fetchActiveElections(), fetchUpcomingElections()]);
});

onMounted(async () => {
  await Promise.all([fetchActiveElections(), fetchUpcomingElections()]);
  await userDetailsStore.getLoginDetails();
  if (userDetailsStore.userId) {
    await userDetailsStore.fetchUserDetails();
    stateId.value = userDetailsStore.userDetails.stateId;
  }
});
</script>