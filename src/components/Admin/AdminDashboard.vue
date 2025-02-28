<template>
  <div class="container-fluid p-4">
    <div v-if="notification.show" class="alert fixed-top ms-auto m-3" :class="`alert-${notification.type}`"
      style="max-width: 300px; top: 80px">
      {{ notification.message }}
    </div>
    <div class="row mb-4">
      <div class="col">
        <div class="nav nav-pills gap-2 justify-content-center">
          <button v-for="tab in ['voter', 'candidate', 'election']" :key="tab" class="nav-link"
            :class="{ 'active': activeTab === tab }" @click="activeTab = tab">
            {{ formatTabTitle(tab) }}
          </button>
        </div>
      </div>
    </div>
    <div class="row row-cols-1 row-cols-md-3 g-3 mb-4">
      <div class="col">
        <div class="form-group">
          <label class="form-label" for="state">State:</label>
          <select v-model="selectedState" @change="applyFilters" class="form-select">
            <option value="">All</option>
            <option v-for="state in states" :key="state.id" :value="state.id">
              {{ state.name }}
            </option>
          </select>
        </div>
      </div>
      <div class="col">
        <div class="form-group">
          <label class="form-label" for="constituency">Constituency:</label>
          <select v-model="selectedConstituency" @change="applyFilters" class="form-select">
            <option value="">All</option>
            <option v-for="constituency in constituencies" :key="constituency.id" :value="constituency.id">
              {{ constituency.name }}
            </option>
          </select>
        </div>
      </div>
      <div v-if="activeTab === 'election'" class="col">
        <div class="form-group">
          <label class="form-label" for="year">Year:</label>
          <select v-model="selectedYear" @change="applyFilters" class="form-select">
            <option value="">All</option>
            <option v-for="year in yearOptions" :key="year" :value="year">
              {{ year }}
            </option>
          </select>
        </div>
      </div>
    </div>
    <div class="border p-3 bg-white rounded">
      <VoterOverview v-if="activeTab === 'voter'" :state="selectedState" :constituency="selectedConstituency" />
      <CandidateOverview v-if="activeTab === 'candidate'" :state="selectedState" :constituency="selectedConstituency" />
      <ElectionOverview v-if="activeTab === 'election'" :state="selectedState" :constituency="selectedConstituency"
        :year="selectedYear" />
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, watch, onMounted, computed } from 'vue';
import VoterOverview from './VoterOverview.vue';
import CandidateOverview from './CandidateOverview.vue';
import ElectionOverview from './ElectionOverview.vue';
import { apiService } from '../../Services/ApiService';

const emit = defineEmits<(event: 'filtersChanged', filters: {
  state: string;
  constituency: string;
  year: string;
}) => void>();

interface State {
  id: number;
  name: string;
}

interface Constituency {
  id: number;
  name: string;
  stateId: number;
}

interface NotificationState {
  message: string;
  type: 'success' | 'error' | 'info';
  show: boolean;
}

const selectedState = ref('');
const selectedConstituency = ref('');
const states = ref<State[]>([]);
const constituencies = ref<Constituency[]>([]);
const activeTab = ref('voter');
const selectedYear = ref('');
const notification = ref<NotificationState>({
  message: '',
  type: 'info',
  show: false
});

const yearOptions = computed(() => {
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let i = currentYear - 5; i <= currentYear + 5; i++) {
    years.push(i.toString());
  }
  return years;
});

const showNotification = (message: string, type: 'success' | 'error' | 'info') => {
  notification.value = {
    message,
    type,
    show: true
  };
  setTimeout(() => {
    notification.value.show = false;
  }, 3000);
};

watch(activeTab, (newTab) => {
  if (newTab !== 'election') {
    selectedYear.value = '';
  }
});

const fetchStates = async () => {
  try {
    const response = await apiService.getStates();
    states.value = response;
  } catch (error) {
    showNotification((error as Error).message, 'error');
  }
};
const formatTabTitle = (tab: string) => {
  return tab.charAt(0).toUpperCase() + tab.slice(1).replace(/([A-Z])/g, ' $1').trim() + ' Overview';
};

const fetchConstituenciesByState = async (stateId: number) => {
  try {
    const response = await apiService.getConstituencies(stateId);
    constituencies.value = response;
  } catch (error) {
    showNotification('Failed to load constituencies', 'error');
    constituencies.value = [];
  }
};

const applyFilters = async () => {
  try {
    const filters = {
      state: selectedState.value,
      constituency: selectedConstituency.value,
      year: selectedYear.value
    };

    emit('filtersChanged', filters);
    showNotification('Filters applied successfully', 'success');
  } catch (error) {
    showNotification('Failed to apply filters', 'error');
  }
};

watch(selectedState, (newStateId) => {
  selectedConstituency.value = '';
  if (newStateId) {
    fetchConstituenciesByState(Number(newStateId));
  } else {
    constituencies.value = [];
  }
});

onMounted(() => {
  fetchStates();
});
</script>
