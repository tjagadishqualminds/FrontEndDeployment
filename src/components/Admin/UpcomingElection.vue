<template>
  <div class="container-fluid my-3">
    <div v-if="isEditing && selectedElection">
      <UpdateForm :election="selectedElection" @update="handleUpdate" @cancel="cancelUpdate" />
    </div>
    <div v-else-if="selectedElectionId" class="contested-candidates-section">
      <ContestedCandidates v-if="candidates.length > 0" :electionId="selectedElectionId" :candidates="candidates" />
      <div v-else-if="loading" class="text-center my-4">Loading candidates...</div>
      <div v-else-if="error" class="alert alert-danger">{{ error }}</div>
    </div>
    <div v-else>
      <div v-if="paginatedElections.length > 0">
        <div class="row g-3">
          <div class="col-12 col-md-6" v-for="election in paginatedElections" :key="election.id">
            <div class="card h-100 shadow-sm">
              <div class="card-body">
                <div class="d-flex flex-row align-items-center mb-2">
                  <p class="me-3 mb-0"><strong>Election Code:</strong> {{ election.id }}</p>
                  <p class="mb-0"><strong>Name:</strong> {{ election.electionName }}</p>
                </div>
                <p class="mb-1"><strong>State:</strong> {{ election.stateName }}</p>
                <p class="mb-1">
                  <strong>Date:</strong> {{ formatDate(election.electionDate) }}<br>
                  <strong>Time:</strong> {{ formatTime(election.electionTimeFrom) }} -
                  {{ formatTime(election.electionTimeTo) }}
                </p>
                <p class="mb-1">
                  <strong>Campaign Period:</strong><br>
                  {{ formatDate(election.campaignDateFrom) }} -
                  {{ formatDate(election.campaignDateTo) }}
                </p>
                <p class="mb-1">
                  <strong>Nomination Period:</strong><br>
                  {{ formatDate(election.nominationDateFrom) }} -
                  {{ formatDate(election.nominationTo) }}
                </p>
                <p class="mb-0"><strong>Deposit:</strong> ₹{{ election.depositAmount }}</p>
              </div>
              <div class="card-footer bg-white">
                <div class="d-flex gap-2">
                  <button @click="editElection(election)" class="btn btn-primary btn-sm">
                    Edit
                  </button>
                  <button @click="confirmDeleteElection(election.id)" class="btn btn-danger btn-sm">
                    Delete
                  </button>
                  <button @click="viewCandidates(election.id)" class="btn btn-secondary btn-sm">
                    View Candidates
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div v-if="props.elections.length > 2" class="mt-4">
          <Pagination :currentPage="currentPage" :totalPages="totalPages" @setPage="changePage" />
        </div>
      </div>
      <div v-else class="text-center text-muted py-4">
        <p class="fs-5">No upcoming elections available</p>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, computed, toRefs } from 'vue';
import UpdateForm from './UpdateForm.vue';
import Pagination from "../CommonComponents/Pagination.vue";
import ContestedCandidates from '../Candidate/ContestedCandidates.vue';
import { useRouter } from 'vue-router';
import { toast } from 'vue3-toastify';
import 'vue3-toastify/dist/index.css';

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

interface Props {
  elections: Election[];
  candidates: Candidate[];
}

const props = defineProps<Props>();
const emit = defineEmits<{
  (e: 'update-election', updatedElection: Election): void;
  (e: 'delete-election', electionId: number): void;
}>();

const { elections } = toRefs(props);
const isEditing = ref(false);
const selectedElection = ref<Election | null>(null);
const selectedElectionId = ref<number | null>(null);
const loading = ref(false);
const error = ref("");
const router = useRouter();
const pageSize = ref(2);
const currentPage = ref(1);

const totalPages = computed(() => Math.ceil(elections.value.length / pageSize.value));
const paginatedElections = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  return elections.value.slice(start, start + pageSize.value);
});

const editElection = (election: Election) => {
  selectedElection.value = election;
  isEditing.value = true;
};

const cancelUpdate = () => {
  isEditing.value = false;
  selectedElection.value = null;
};

const handleUpdate = (updatedElection: Election) => {
  emit('update-election', updatedElection);
  cancelUpdate();
  toast.success('Election updated successfully', { theme: 'dark' });
};

const confirmDeleteElection = (electionId: number) => {
  emit('delete-election', electionId);
};

const viewCandidates = (electionId: number) => {
  if (electionId) {
    router.push(`/admin/electionmanagement/${electionId}/ContestedCandidates`);
  } else {
    toast.error("Election ID is undefined", { theme: "dark" });
  }
};

const changePage = (page: number) => {
  currentPage.value = page;
};

const formatDate = (dateString: string) => {
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

const formatTime = (dateString: string) => {
  const options: Intl.DateTimeFormatOptions = {
    hour: 'numeric',
    minute: 'numeric',
    hour12: false
  };
  return new Date(dateString).toLocaleTimeString(undefined, options);
};
</script>