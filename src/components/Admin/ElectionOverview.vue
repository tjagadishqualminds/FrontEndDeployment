<template>
  <div class="container-fluid p-3 bg-light">
    <div class="row g-3">
      <!-- Election Statistics Card -->
      <div class="col-12 col-md-6">
        <div class="card shadow-sm h-100">
          <div class="card-header bg-primary text-white">
            <h3 class="h5 mb-0">Election Statistics</h3>
          </div>
          <div class="card-body p-2">
            <div class="row g-2">
              <div class="col-6">
                <div class="bg-primary text-white p-3 rounded">
                  <div class="d-flex flex-column">
                    <span class="small">Total Elections</span>
                    <span class="fw-bold">{{ electionStats.totalElections }}</span>
                  </div>
                </div>
              </div>
              <div class="col-6">
                <div class="bg-success text-white p-3 rounded clickable shadow-hover"
                  @click="navigateToElectionManagement('active')">
                  <div class="d-flex flex-column">
                    <span class="small">Active Elections</span>
                    <span class="fw-bold">{{ electionStats.activeElections }}</span>
                  </div>
                </div>
              </div>
              <div class="col-6">
                <div class="bg-warning text-dark p-3 rounded clickable shadow-hover"
                  @click="navigateToElectionManagement('upcoming')">
                  <div class="d-flex flex-column">
                    <span class="small">Upcoming Elections</span>
                    <span class="fw-bold">{{ electionStats.upcomingElections }}</span>
                  </div>
                </div>
              </div>
              <div class="col-6">
                <div class="bg-info text-white p-3 rounded">
                  <div class="d-flex flex-column">
                    <span class="small">Completed Elections</span>
                    <span class="fw-bold">{{ electionStats.completedElections }}</span>
                  </div>
                </div>
              </div>
              <div class="col-6">
                <div class="bg-danger text-white p-3 rounded">
                  <div class="d-flex flex-column">
                    <span class="small">Canceled Elections</span>
                    <span class="fw-bold">{{ electionStats.canceledElections }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="col-12 col-md-6">
        <div class="card shadow-sm h-100">
          <div class="card-header bg-primary text-white">
            <h3 class="h5 mb-0">Upcoming Elections</h3>
          </div>
          <div class="card-body p-2">
            <div class="election-list" style="max-height: 250px; overflow-y: auto;">
              <div v-if="filterElections(upcomingElections).length === 0" class="text-center text-muted py-2">
                <span>No upcoming elections</span>
              </div>
              <div v-for="election in filterElections(upcomingElections)" :key="election.id" class="border-bottom py-2">
                <div class="d-flex flex-column">
                  <span class="fw-bold text-dark">{{ election.electionName }}</span>
                  <span class="small text-muted">
                    Election Date: {{ formatDate(election.electionDate) }}
                  </span>
                  <span class="small text-muted">{{ election.stateName }}</span>
                  <span v-if="election.constituencyName" class="small text-muted fst-italic">
                    {{ election.constituencyName }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { apiService } from '../../Services/ApiService';
import { useRouter } from 'vue-router';

const router = useRouter();

const props = defineProps({
  state: {
    type: String,
    default: ''
  },
  constituency: {
    type: String,
    default: ''
  },
  year: {
    type: String,
    default: ''
  }
});

interface Election {
  id: number;
  electionName: string;
  stateId: number;
  stateName: string;
  constituencyId?: number;
  constituencyName?: string;
  electionDate: string;
  isActive: boolean;
}

interface UpcomingElection extends Election {
  campaignDateFrom: string;
  campaignDateTo: string;
  nominationDateFrom: string;
  nominationTo: string;
  electionTimeFrom: string;
  electionTimeTo: string;
  depositAmount: number;
}

const upcomingElections = ref<UpcomingElection[]>([]);
const allElections = ref<Election[]>([]);
const canceledElections = ref<Election[]>([]);
const isLoadingElections = ref(false);
const activeElections = ref<Election[]>([]);

const filterElections = (elections: Election[]) => {
  return elections.filter(election => {
    const electionYear = new Date(election.electionDate).getFullYear().toString();
    const matchesState = !props.state || election.stateId === Number(props.state);
    const matchesConstituency = !props.constituency || election.constituencyId === Number(props.constituency);
    const matchesYear = !props.year || electionYear === props.year;

    return matchesState && matchesConstituency && matchesYear;
  });
};

const electionStats = computed(() => {
  const currentDate = new Date();
  const filteredAllElections = filterElections(allElections.value);
  const filteredActiveElections = filterElections(activeElections.value);
  const filteredUpcomingElections = filterElections(upcomingElections.value);
  const filteredCanceledElections = filterElections(canceledElections.value);

  return {
    totalElections: filteredAllElections.length,
    upcomingElections: filteredUpcomingElections.length,
    activeElections: filteredActiveElections.length,
    completedElections: filteredAllElections.filter(
      (election) => !election.isActive && new Date(election.electionDate) < currentDate
    ).length,
    canceledElections: filteredCanceledElections.length,
  };
});

const navigateToElectionManagement = (tab: string) => {
  router.push({
    name: 'electionmanagement',
    query: { tab },
  });
};

const fetchActiveElections = async () => {
  try {
    const response = await apiService.getActiveElections();
    activeElections.value = response.map((election: Election) => ({
      ...election,
      electionDate: new Date(election.electionDate).toISOString(),
    }));
  } catch (error) {
    activeElections.value = [];
  }
};

const fetchUpcomingElections = async () => {
  isLoadingElections.value = true;
  try {
    const response = await apiService.getUpcomingElections();
    upcomingElections.value = response.map((election: UpcomingElection) => ({
      ...election,
      electionDate: new Date(election.electionDate).toISOString(),
    }));
  } catch (error) {
    upcomingElections.value = [];
  } finally {
    isLoadingElections.value = false;
  }
};

const fetchAllElections = async () => {
  isLoadingElections.value = true;
  try {
    const response = await apiService.getAllElections();
    allElections.value = response.map((election: Election) => ({
      ...election,
      electionDate: new Date(election.electionDate).toISOString(),
    }));
  } catch (error) {
    allElections.value = [];
  } finally {
    isLoadingElections.value = false;
  }
};

const fetchCanceledElections = async () => {
  try {
    const response = await apiService.getCanceledElections();
    canceledElections.value = response.map((election: Election) => ({
      ...election,
      electionDate: new Date(election.electionDate).toISOString(),
    }));
  } catch (error) {
    canceledElections.value = [];
  }
};

const formatDate = (dateString: string) =>
  new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

watch([() => props.state, () => props.constituency, () => props.year], () => {
  fetchUpcomingElections();
  fetchAllElections();
  fetchCanceledElections();
  fetchActiveElections();
});

onMounted(() => {
  fetchUpcomingElections();
  fetchAllElections();
  fetchCanceledElections();
  fetchActiveElections();
});
</script>


<style scoped>
.shadow-hover:hover {
  transform: translateY(-2px);
  transition: transform 0.2s ease;
  cursor: pointer;
}

.clickable {
  cursor: pointer;
}
</style>