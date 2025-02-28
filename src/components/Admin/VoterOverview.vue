<template>
  <div class="container-fluid p-3">
    <div class="row g-3">
      <div class="col-12 col-md-4">
        <div class="card h-100 shadow-sm">
          <div class="card-header bg-primary text-white">
            <h3 class="h5 mb-0">Voter Statistics</h3>
          </div>
          <div class="card-body">
            <div class="row g-2">
              <div v-for="(value, key) in voterStats" :key="key" class="col-6 cursor-pointer"
                @click="navigateToVoterManagement(key === 'totalVoters' ? 'active' : 'new')">
                <div class="p-2 rounded text-white text-center stat-box" :class="[
                  key === 'totalVoters' ? 'bg-success' :
                    key === 'maleVoters' ? 'bg-info' :
                      key === 'femaleVoters' ? 'bg-primary' :
                        key === 'rejectedVoters' ? 'bg-danger' :
                          'bg-warning'
                ]">
                  <span class="d-block fw-semibold small">{{ key.replace(/([A-Z])/g, ' $1') }}</span>
                  <span class="d-block fs-5 fw-bold">{{ value }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="col-12 col-md-4">
        <div class="card h-100 shadow-sm">
          <div class="card-header bg-primary text-white">
            <h3 class="h5 mb-0">Demographics Distribution</h3>
          </div>
          <div class="card-body d-flex align-items-center justify-content-center" style="height: 300px;">
            <Pie v-if="shouldShowChart" :data="voterDemographicChart" :options="chartOptions" />
            <div v-else class="text-muted">
              No data found
            </div>
          </div>
        </div>
      </div>
      <div class="col-12 col-md-4">
        <div class="card h-100 shadow-sm">
          <div class="card-header bg-primary text-white">
            <h3 class="h5 mb-0">Voter Feedback</h3>
          </div>
          <div class="card-body">
            <div class="text-center p-2 bg-light rounded mb-3">
              <span class="fw-semibold">Total Feedback: </span>
              <span class="fs-4 text-primary fw-bold">{{ voterFeedback.totalFeedback }}</span>
            </div>
            <div class="bg-light p-2 rounded mb-3">
              <div class="d-flex justify-content-between mb-2">
                <span class="text-muted fw-medium">Positive</span>
                <span class="fw-bold">{{ voterFeedback.positiveFeedback }}</span>
              </div>
              <div class="progress" style="height: 8px;">
                <div class="progress-bar bg-success" :style="{ width: `${feedbackPercentages.positive}%` }">
                </div>
              </div>
              <span class="small text-muted">{{ feedbackPercentages.positive }}%</span>
            </div>
            <div class="bg-light p-2 rounded">
              <div class="d-flex justify-content-between mb-2">
                <span class="text-muted fw-medium">Negative</span>
                <span class="fw-bold">{{ voterFeedback.negativeFeedback }}</span>
              </div>
              <div class="progress" style="height: 8px;">
                <div class="progress-bar bg-danger" :style="{ width: `${feedbackPercentages.negative}%` }">
                </div>
              </div>
              <span class="small text-muted">{{ feedbackPercentages.negative }}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.cursor-pointer {
  cursor: pointer;
}

.stat-box {
  transition: transform 0.2s;
}

.stat-box:hover {
  transform: scale(1.05);
}

.card {
  transition: transform 0.2s;
}

.card:hover {
  transform: scale(1.01);
}
</style>
<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { adminService } from '@/Services/AdminApiService';
import { toast } from 'vue3-toastify';
import { Pie } from 'vue-chartjs';
import { Chart as ChartJS, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import type { ChartOptions } from 'chart.js';
import { useRouter } from 'vue-router';

ChartJS.register(Title, Tooltip, Legend, ArcElement);

const router = useRouter();

const navigateToVoterManagement = (filter?: string) => {
  router.push({
    name: 'votermanagement',
    query: { activeTab: filter || 'active' }
  });
};

const props = defineProps({
  state: {
    type: String,
    default: ''
  },
  constituency: {
    type: String,
    default: ''
  }
});

interface Voter {
  id: number;
  name: string;
  gender: string;
  registrationDate: string;
  constituencyId: number;
  constituencyName: string;
  stateId?: number;
}

interface VoterStats {
  totalVoters: number;
  maleVoters: number;
  femaleVoters: number;
  rejectedVoters: number;
  newlyRegistered: number;
}

interface VoterFeedback {
  id: number;
  blockchainId: number;
  blockchainHash: string;
  userId: number;
  voterId: string;
  candidateId: number;
  stateId: number;
  electionCode: number;
  constituencyId: number;
  feedback: string;
  isSatisfied: boolean;
  isReviewed: boolean;
  isApproved: boolean;
  dateCreated: string;
}

const voterStats = ref<VoterStats>({
  totalVoters: 0,
  maleVoters: 0,
  femaleVoters: 0,
  rejectedVoters: 0,
  newlyRegistered: 0
});

interface FeedbackState {
  totalFeedback: number;
  positiveFeedback: number;
  negativeFeedback: number;
  feedbackPercentage: number;
  feedbackList: VoterFeedback[];
}
const voterFeedback = ref<FeedbackState>({
  totalFeedback: 0,
  positiveFeedback: 0,
  negativeFeedback: 0,
  feedbackPercentage: 0,
  feedbackList: []
});

const feedbackPercentages = computed(() => {
  const total = voterFeedback.value.totalFeedback;
  return {
    positive: total > 0 ? Math.round((voterFeedback.value.positiveFeedback / total) * 100) : 0,
    negative: total > 0 ? Math.round((voterFeedback.value.negativeFeedback / total) * 100) : 0
  };
});

const newlyRegisteredVoters = ref<Voter[]>([]);
const activeVoters = ref<Voter[]>([]);
const rejectedVoters = ref<Voter[]>([]);
const isLoadingVoterData = ref(false);

const filterVotersByStateAndConstituency = (voters: Voter[]) => {
  return voters.filter(voter => {
    const matchesState = !props.state || voter.stateId === Number(props.state);
    const matchesConstituency = !props.constituency || voter.constituencyId === Number(props.constituency);
    return matchesState && matchesConstituency;
  });
};

const fetchNewlyRegisteredVoters = async () => {
  isLoadingVoterData.value = true;
  try {
    const response = await adminService.getNewlyRegisteredVoters();
    newlyRegisteredVoters.value = filterVotersByStateAndConstituency(response);
    updateVoterStats();
  } catch (error) {
    toast.error('Failed to load newly registered voters', { theme: 'dark' });
  } finally {
    isLoadingVoterData.value = false;
  }
};

const fetchActiveVoters = async () => {
  isLoadingVoterData.value = true;
  try {
    const response = await adminService.getAllActiveVoters();
    activeVoters.value = filterVotersByStateAndConstituency(response);
    updateVoterStats();
  } catch (error) {
    toast.error('Failed to load active voters', { theme: 'dark' });
  } finally {
    isLoadingVoterData.value = false;
  }
};

const fetchRejectedVoters = async () => {
  isLoadingVoterData.value = true;
  try {
    const response = await adminService.getRejectedVoters();
    rejectedVoters.value = filterVotersByStateAndConstituency(response);
    updateVoterStats();
  } catch (error) {
    toast.error('Failed to load rejected voters', { theme: 'dark' });
  } finally {
    isLoadingVoterData.value = false;
  }
};

const filterFeedbackByStateAndConstituency = (feedbackList: VoterFeedback[]) => {
  return feedbackList.filter(item => {
    const matchesState = !props.state || item.stateId === Number(props.state);
    const matchesConstituency = !props.constituency || item.constituencyId === Number(props.constituency);
    return matchesState && matchesConstituency;
  });
};

const fetchVoterFeedbackStats = async () => {
  try {
    const response = await adminService.getVoterFeedbackStats();
    const filteredFeedback = filterFeedbackByStateAndConstituency(response.feedbackList || []);
    const totalFeedback = filteredFeedback.length;
    const positiveFeedback = filteredFeedback.filter(f => f.isSatisfied).length;
    const negativeFeedback = filteredFeedback.filter(f => !f.isSatisfied).length;

    voterFeedback.value = {
      feedbackList: filteredFeedback,
      totalFeedback,
      positiveFeedback,
      negativeFeedback,
      feedbackPercentage: totalFeedback > 0
        ? (positiveFeedback / totalFeedback) * 100
        : 0
    };

    voterFeedbackChart.value.datasets[0].data = [
      voterFeedback.value.positiveFeedback,
      voterFeedback.value.negativeFeedback
    ];
  } catch (error) {
    toast.error('Failed to load voter feedback statistics', { theme: 'dark' });
  }
};

watch([() => props.state, () => props.constituency], () => {
  fetchNewlyRegisteredVoters();
  fetchActiveVoters();
  fetchRejectedVoters();
  fetchVoterFeedbackStats();
});

const voterDemographicChart = ref({
  labels: ['Male', 'Female', 'Rejected', 'Newly Registered'],
  datasets: [{
    label: 'Voter Demographics',
    data: [0, 0, 0, 0],
    backgroundColor: ['#28a745', '#17a2b8', '#dc3545', '#007bff']
  }]
});

const voterFeedbackChart = ref({
  labels: ['Positive Feedback', 'Negative Feedback'],
  datasets: [{
    label: 'Voter Feedback',
    data: [0, 0],
    backgroundColor: ['#28a745', '#dc3545']
  }]
});

const chartOptions = ref<ChartOptions<'pie'>>({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom',
      labels: {
        padding: 20,
        usePointStyle: true,
      }
    },
    tooltip: {
      callbacks: {
        label: (context) => {
          const label = context.label || '';
          const value = context.raw as number;
          const total = (context.dataset.data as number[]).reduce((a, b) => a + b, 0);
          const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
          return `${label}: ${value} (${percentage}%)`;
        }
      }
    }
  }
});

const shouldShowChart = computed(() => {
  return voterDemographicChart.value.datasets[0].data.some(value => value > 0);
});

const updateVoterStats = () => {
  const allVoters = [...activeVoters.value, ...newlyRegisteredVoters.value];

  voterStats.value = {
    totalVoters: allVoters.length,
    newlyRegistered: newlyRegisteredVoters.value.length,
    maleVoters: allVoters.filter(voter => voter.gender === 'Male').length,
    femaleVoters: allVoters.filter(voter => voter.gender === 'Female').length,
    rejectedVoters: rejectedVoters.value.length

  };

  voterDemographicChart.value = {
    labels: ['Newly Registered', 'Male', 'Female', 'Rejected'],
    datasets: [{
      label: 'Voter Demographics',
      data: [
        voterStats.value.newlyRegistered,
        voterStats.value.maleVoters,
        voterStats.value.femaleVoters,
        voterStats.value.rejectedVoters,

      ],
      backgroundColor: ['#FFCE56', '#36A2EB', '#FF6384', '#dc3545']
    }]
  };
};

onMounted(() => {
  fetchNewlyRegisteredVoters();
  fetchActiveVoters();
  fetchRejectedVoters();
  fetchVoterFeedbackStats();
});
</script>