<template>
  <div class="container d-flex flex-column align-items-center p-4">
    <UpdateForm v-if="selectedActiveElection" :election="selectedActiveElection" @update="handleUpdateActiveElection"
      @cancel="cancelUpdate" />
    <div v-else-if="selectedElectionId" class="contested-candidates-section w-100 mt-4">
      <ContestedCandidates v-if="candidates.length > 0" :electionId="selectedElectionId" :candidates="candidates" />
      <div v-else-if="loading" class="text-center mt-3">Loading candidates...</div>
      <div v-else-if="error" class="alert alert-danger mt-3">{{ error }}</div>
    </div>
    <div v-else class="w-100">
      <div class="table-responsive">
        <table class="table table-bordered table-hover table-striped mb-4">
          <thead class="table">
            <tr>
              <th scope="col">S.No</th>
              <th scope="col">Election Code</th>
              <th scope="col">Election Name</th>
              <th scope="col">State</th>
              <th scope="col">Election Date & Time</th>
              <th scope="col">Candidate Details</th>
              <th scope="col">Edit Election</th>
              <th scope="col">Delete Election</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(election, index) in paginatedElections" :key="election.id">
              <td>{{ index + 1 + (currentPage - 1) * pageSize }}</td>
              <td>{{ election.id }}</td>
              <td>{{ election.electionName }}</td>
              <td>{{ election.stateName }}</td>
              <td>
                {{ formatDate(election.electionDate) }} &
                {{ formatTime(election.electionTimeFrom) }} to
                {{ formatTime(election.electionTimeTo) }}
              </td>
              <td>
                <button class="btn btn-primary btn-sm" @click="viewCandidates(election.id)">
                  View Candidates
                </button>
              </td>
              <td>
                <button class="btn btn-warning btn-sm" @click="openEditElection(election)">
                  Edit
                </button>
              </td>
              <td>
                <button class="btn btn-danger btn-sm" @click="confirmDeleteElection(election.id)">
                  Delete
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-if="props.activeElections.length === 0" class="alert alert-info mt-3">
        No Active Elections
      </div>
      <div v-if="props.activeElections.length > 3" class="pagination-container mt-3">
        <Pagination :currentPage="currentPage" :totalPages="totalPages" @setPage="changePage" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, defineProps, defineEmits } from 'vue';
import { toast } from "vue3-toastify";
import "vue3-toastify/dist/index.css";
import { useRouter } from 'vue-router';
import Pagination from "../CommonComponents/Pagination.vue";
import UpdateForm from './UpdateForm.vue';
import ContestedCandidates from '../Candidate/ContestedCandidates.vue';

interface Election {
  id: number;
  electionName: string;
  stateName: string;
  stateId: number;
  electionDate: string;
  campaignDateFrom: string;
  campaignDateTo: string;
  nominationDateFrom: string;
  nominationTo: string;
  electionTimeFrom: string;
  electionTimeTo: string;
  depositAmount: number;
  isActive: boolean;
}

interface Candidate {
  id: number;
  name: string;
}

const props = defineProps<{
  activeElections: Election[];
  candidates: Candidate[];
  deleteElection: (id: number) => void;
}>();

const emit = defineEmits<{
  (e: 'update-election', updatedElection: Election): void;
  (e: 'refresh'): void;
  (e: 'delete-election', electionId: number): void;
}>();

const pageSize = ref(3);
const currentPage = ref(1);
const selectedActiveElection = ref<Election | null>(null);
const selectedElectionId = ref<number | null>(null);
const loading = ref(false);
const error = ref<string>("");
const router = useRouter();

const totalPages = computed(() => {
  return Math.ceil(props.activeElections.length / pageSize.value);
});

const paginatedElections = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return props.activeElections.slice(start, end);
});

const changePage = (page: number) => {
  currentPage.value = page;
};

const openEditElection = (election: Election) => {
  selectedActiveElection.value = { ...election };
};

const handleUpdateActiveElection = (updatedElection: Election) => {
  emit('update-election', updatedElection);
  emit('refresh');
  selectedActiveElection.value = null;
};

const cancelUpdate = () => {
  selectedActiveElection.value = null;
};

const formatDate = (dateString: string) => {
  const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

const formatTime = (dateString: string) => {
  const options: Intl.DateTimeFormatOptions = { hour: 'numeric', minute: 'numeric', hour12: false };
  return new Date(dateString).toLocaleTimeString(undefined, options);
};

const confirmDeleteElection = (electionId: number) => {
  emit('delete-election', electionId);
  emit('refresh');
};

const viewCandidates = (electionId: number) => {
  if (electionId) {
    router.push(`/admin/electionmanagement/${electionId}/ContestedCandidates`);
  } else {
    toast.error("Election ID is undefined", { theme: "dark" });
  }
};
</script>