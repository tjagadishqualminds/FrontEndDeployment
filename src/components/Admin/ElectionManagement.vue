<template>
  <div class="container py-4">
    <button v-if="!showElectionForm" class="btn btn-success float-end mb-4" @click="showElectionForm = true">
      Add New Election
    </button>
    <ElectionForm v-if="showElectionForm" :states="states" @success="handleSuccess('add')" @cancel="handleCancel" />
    <div v-if="!showElectionForm">
      <div class="position-relative w-100 max-w-lg mb-4 d-flex">
        <input type="text" v-model="searchTerm" class="form-control rounded-pill pe-5"
          placeholder="Search Elections ElectionName,StateName,ElectionDate" @input="handleSearch" />
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
          class="position-absolute top-50 end-0 translate-middle-y me-3 text-secondary">
          <path fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M3 10a7 7 0 1 0 14 0a7 7 0 1 0-14 0m18 11l-6-6" />
        </svg>
      </div>
      <div class="d-flex justify-content-center mb-4">
        <div class="btn-group">
          <button :class="['btn', selectedTab === 'active' ? 'btn-primary' : 'btn-outline-primary']"
            @click="changeTab('active')">
            Active Elections
          </button>
          <button :class="['btn', selectedTab === 'upcoming' ? 'btn-primary' : 'btn-outline-primary']"
            @click="changeTab('upcoming')">
            Upcoming Elections
          </button>
        </div>
      </div>
      <div v-if="selectedTab === 'active'">
        <ActiveElections @refresh="fetchActiveElections" :activeElections="activeElections" :getStateName="getStateName"
          :getConstituencyName="getConstituencyName" :candidates="candidates" :deleteElection="deleteElection"
          :viewCandidates="viewCandidates" @update-election="updateElection" @delete-election="confirmDelete" />
      </div>
      <div v-if="selectedTab === 'upcoming'">
        <UpcomingElection :elections="upcomingElections" :searchTerm="searchTerm" :candidates="candidates"
          @update-election="updateElection" @delete-election="confirmDelete" @view-candidates="viewCandidates" />
      </div>
    </div>
    <AdminModal v-if="isAddSuccessModalVisible" :visible="isAddSuccessModalVisible" title="Success"
      message="Election Added successfully" :isButtonEnableOk="true" buttonClass="btn btn-success"
      @onClose="handleAddModalClose" />
    <AdminModal v-if="isModalVisible" :visible="isModalVisible" title="Success" message="Election Updated successfully"
      :isButtonEnableOk="true" buttonClass="btn btn-success" @onClose="isModalVisible = false" />
    <AdminModal v-if="isDeleteModalVisible" :visible="isDeleteModalVisible" title="Delete Election"
      message="Are you sure you want to delete this election?" :isButtonEnableOk="false" :isButtonEnableCancel="true"
      :isButtonEnableConfirm="true" buttonClass="btn btn-danger" @onConfirm="deleteElection(electionToDelete)"
      @onCancel="cancelDelete" @onClose="isDeleteModalVisible = false" />
    <AdminModal v-if="isShowModal" :visible="isShowModal" title="Success" message="Election Deleted successfully"
      :isButtonEnableOk="true" buttonClass="btn btn-success" @onClose="isShowModal = false" />
  </div>
</template>
<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import ElectionForm from './ElectionForm.vue';
import UpcomingElection from './UpcomingElection.vue';
import ActiveElections from './ActiveElections.vue';
import { apiService } from '../../Services/ApiService';
import { useRoute } from 'vue-router';
import AdminModal from './AdminModal.vue';
import { toast } from "vue3-toastify";
import "vue3-toastify/dist/index.css";

interface Election {
  id: number;
  electionName: string;
  stateId: number;
  stateName: string;
  campaignDateFrom: string;
  campaignDateTo: string;
  nominationDateFrom: string;
  nominationTo: string;
  electionTimeFrom: string;
  electionTimeTo: string;
  depositAmount: number;
  electionDate: string;
  isActive: boolean;
}

interface Candidate {
  id: number;
  name: string;
}

interface RouteMeta {
  defaultTab?: string;
}

const elections = ref<Election[]>([]);
const constituencies = ref<Record<number, any>>({});
const candidates = ref<Candidate[]>([]);
const showElectionForm = ref(false);
const selectedTab = ref<string>('active');
const errorMessage = ref('');
const states = ref<any[]>([]);
const searchTerm = ref('');
const route = useRoute();
const selectedElectionId = ref<number | null>(null);
const isModalVisible = ref(false);
const isAddSuccessModalVisible = ref(false);
const isShowModal = ref(false);
const isDeleteModalVisible = ref(false);
const electionToDelete = ref<number | null>(null);

const handleSuccess = (action: 'add' | 'update') => {
  showElectionForm.value = false;
  if (action === 'add') {
    isAddSuccessModalVisible.value = true;
  } else {
    isModalVisible.value = true;
  }
};

const handleAddModalClose = () => {
  isAddSuccessModalVisible.value = false;
  if (selectedTab.value === 'active') {
    fetchActiveElections();
  } else {
    fetchUpcomingElections();
  }
};

const handleCancel = () => {
  showElectionForm.value = false;
};

const activeElections = computed(() => {
  return elections.value.filter(election => election.isActive &&
    (election.electionName.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
      election.stateName.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
      new Date(election.electionDate).toLocaleDateString().includes(searchTerm.value)
    ));
});

const upcomingElections = computed(() => {
  return elections.value.filter(election => !election.isActive &&
    (election.electionName.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
      election.stateName.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
      new Date(election.electionDate).toLocaleDateString().includes(searchTerm.value)
    ));
});

const fetchActiveElections = async () => {
  try {
    const params = searchTerm.value ? { searchTerm: searchTerm.value } : undefined;
    const response = await apiService.getActiveElections(params);
    elections.value = response.data || response;
  } catch (error) {
    elections.value = [];
    errorMessage.value = "Failed to fetch active elections. Please try again.";
    toast.error((error as Error).message, { theme: "dark" });
  }
};

const fetchUpcomingElections = async () => {
  try {
    const params = searchTerm.value ? { searchTerm: searchTerm.value } : undefined;
    const response = await apiService.getUpcomingElections(params);
    elections.value = response.data || response;
  } catch (error) {
    elections.value = [];
    toast.error((error as Error).message, { theme: "dark" });
  }
};

const fetchStates = async () => {
  try {
    const response = await apiService.getStates();
    states.value = response;
  } catch (error) {
    toast.error((error as Error).message, { theme: "dark" });

  }
};

const getStateName = (stateId: number) => {
  const state = states.value.find(state => state.id === stateId);
  return state ? state.name : 'Unknown State';
};

const getConstituenciesByStateId = async (stateId: number) => {
  if (!constituencies.value[stateId]) {
    try {
      const response = await apiService.getConstituencies(stateId);
      constituencies.value[stateId] = response.data;
    } catch (error) {
      toast.error((error as Error).message, { theme: "dark" });

    }
  }
};

const getConstituencyName = (stateId: number) => {
  const constituency = constituencies.value[stateId];
  if (!constituency) {
    getConstituenciesByStateId(stateId);
    return 'Loading...';
  }
  return constituency.length > 0 ? constituency[0].name : 'Unknown Constituency';
};

const viewCandidates = (electionId: number) => {
  selectedElectionId.value = electionId;
};

const updateElection = async (updatedElection: Election) => {
  try {
    await apiService.updateElection(updatedElection.id, updatedElection);
    const index = elections.value.findIndex((el) => el.id === updatedElection.id);
    if (index !== -1) {
      elections.value[index] = updatedElection;
    }
    handleSuccess('update');
  } catch (error) {
    toast.error((error as Error).message, { theme: "dark" });

  }
};

const confirmDelete = (electionId: number) => {
  electionToDelete.value = electionId;
  isDeleteModalVisible.value = true;
};

const deleteElection = async (electionId: number | null) => {
  if (electionId === null) return;
  try {
    await apiService.deleteElection(electionId);
    isDeleteModalVisible.value = false;
    isShowModal.value = true;
    if (selectedTab.value === 'active') {
      fetchActiveElections();
    } else {
      fetchUpcomingElections();
    }
  } catch (error) {
    toast.error((error as Error).message, { theme: "dark" });
  } finally {
    isDeleteModalVisible.value = false;
  }
};

const cancelDelete = () => {
  electionToDelete.value = null;
  isDeleteModalVisible.value = false;
};

const handleSearch = () => {
  if (selectedTab.value === 'active') {
    fetchActiveElections();
  } else if (selectedTab.value === 'upcoming') {
    fetchUpcomingElections();
  }
};

const changeTab = (tab: string) => {
  selectedTab.value = tab;
  if (tab === 'active') {
    fetchActiveElections();
  } else if (tab === 'upcoming') {
    fetchUpcomingElections();
  }
};

onMounted(() => {
  const meta = route.meta as RouteMeta;
  selectedTab.value = meta.defaultTab || 'active';
  if (selectedTab.value === 'active') {
    fetchActiveElections();
  } else {
    fetchUpcomingElections();
  }
  fetchStates();
});


watch(route, (newRoute) => {
  const meta = newRoute.meta as RouteMeta;
  selectedTab.value = meta.defaultTab || 'active';
  if (selectedTab.value === 'active') {
    fetchActiveElections();
  } else {
    fetchUpcomingElections();
  }
});
</script>
