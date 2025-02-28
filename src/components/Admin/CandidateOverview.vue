<template>
  <div class="container-fluid p-3">
    <div class="row g-3">
      <div class="col-12 col-md-6">
        <div class="card shadow hover-shadow-lg">
          <div class="card-header bg-primary text-white">
            <h3 class="h5 mb-0">Candidate Statistics</h3>
          </div>
          <div class="card-body">
            <div class="row g-2">
              <div v-for="(value, key, index) in candidateStats" :key="key" class="col-6">
                <div :class="[
                  'p-3 rounded text-white',
                  key !== 'rejectedCandidates' ? 'cursor-pointer hover-shadow' : '',
                  ['bg-success', 'bg-info', 'bg-warning', 'bg-primary', 'bg-danger'][index]
                ]" @click="key !== 'rejectedCandidates' ? handleStatClick(key) : null"
                  :title="key !== 'rejectedCandidates' ? 'Click to view ' + key.replace(/([A-Z])/g, ' $1') : ''">
                  <div class="d-flex flex-column text-center">
                    <span class="fs-5 fw-semibold text-capitalize">
                      {{ key.replace(/([A-Z])/g, ' $1') }}
                    </span>
                    <span class="fs-4 fw-bold">{{ value }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="col-12 col-md-6">
        <div class="card shadow">
          <div class="card-header bg-primary text-white">
            <h3 class="h5 mb-0">Candidate Statistics Distribution</h3>
          </div>
          <div class="card-body">
            <div class="minh-300 d-flex align-items-center justify-content-center">
              <Pie v-if="shouldShowCandidateChart" :data="candidateChartData" :options="chartOptions" />
              <div v-else class="text-muted fs-5">
                {{ isLoadingCandidateData ? 'Loading chart data...' : 'No data available for the selected filters' }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, reactive, onMounted, computed, watch } from 'vue';
import { adminService } from '@/Services/AdminApiService';
import { toast } from 'vue3-toastify';
import { Pie } from 'vue-chartjs';
import { Chart as ChartJS, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import type { ChartOptions } from 'chart.js';
import { useRouter } from 'vue-router';
import { CandidateStatus, CandidateNominationStatus } from '@/Constants/Constants'

const router = useRouter();
ChartJS.register(Title, Tooltip, Legend, ArcElement);
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

interface Candidate {
  id: number;
  stateId?: number;
  constituencyId?: number;
}

interface CandidateStats {
  registeredCandidates: number;
  newlyRegistered: number;
  pendingNominations: number;
  appliedNominations: number;
  rejectedCandidates: number;
}

const candidateStats = reactive<CandidateStats>({
  registeredCandidates: 0,
  newlyRegistered: 0,
  pendingNominations: 0,
  appliedNominations: 0,
  rejectedCandidates: 0,
});

const navigationMapping = {
  registeredCandidates: {
    operation: 'ActiveCandidates',
    filter: 'active'
  },
  newlyRegistered: {
    operation: 'NewCandidates',
    filter: 'new'
  },
  pendingNominations: {
    operation: 'Nominations',
    filter: 'pending'
  },
  appliedNominations: {
    operation: 'Nominations',
    filter: 'approved'
  }
};

const handleStatClick = (statKey: keyof typeof navigationMapping) => {
  const navigationConfig = navigationMapping[statKey];
  if (navigationConfig) {
    const query: Record<string, string> = {
      defaultOperation: navigationConfig.operation,
      filter: navigationConfig.filter
    };

    if (props.state) {
      query.state = props.state;
    }
    if (props.constituency) {
      query.constituency = props.constituency;
    }

    router.push({
      path: '/admin/candidatemanagement',
      query
    });
  }
};

const filterCandidatesByStateAndConstituency = (candidates: Candidate[]) => {
  if (!Array.isArray(candidates)) {
    return [];
  }

  return candidates.filter(candidate => {
    if (!candidate) return false;

    const matchesState = !props.state ||
      (candidate.stateId !== undefined && candidate.stateId === Number(props.state));
    const matchesConstituency = !props.constituency ||
      (candidate.constituencyId !== undefined && candidate.constituencyId === Number(props.constituency));

    return matchesState && matchesConstituency;
  });
};

const candidateChartData = computed(() => ({
  labels: [
    'Registered Candidates',
    'Newly Registered',
    'Pending Nominations',
    'Applied Nominations',
    'Rejected Candidates',
  ],
  datasets: [
    {
      label: 'Candidate Statistics',
      data: [
        candidateStats.registeredCandidates,
        candidateStats.newlyRegistered,
        candidateStats.pendingNominations,
        candidateStats.appliedNominations,
        candidateStats.rejectedCandidates,
      ],
      backgroundColor: ['#36A2EB', '#FF6384', '#FFCE56', '#4BC0C0', '#9966FF'],
    },
  ],
}));

const chartOptions = ref<ChartOptions<'pie'>>({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom',
      labels: {
        padding: 20,
        usePointStyle: true,
      },
    },
    tooltip: {
      callbacks: {
        label: (context) => {
          const label = context.label || '';
          const value = context.raw as number;
          const total = (context.dataset.data as number[]).reduce((a, b) => a + b, 0);
          const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
          return `${label}: ${value} (${percentage}%)`;
        },
      },
    },
  },
});

const isLoadingCandidateData = ref(false);
const shouldShowCandidateChart = computed(() => {
  return Object.values(candidateStats).some(value => value > 0);
});

const fetchCandidateData = async () => {
  isLoadingCandidateData.value = true;

  try {
    const requests = [
      {
        promise: adminService.getAllActiveCandidates(),
        key: 'registeredCandidates',
        errorValue: 0
      },
      {
        promise: adminService.getNewlyRegisteredCandidates(),
        key: 'newlyRegistered',
        errorValue: 0
      },
      {
        promise: adminService.getPendingNominations(),
        key: 'pendingNominations',
        errorValue: 0
      },
      {
        promise: adminService.getAllCandidatesDetails(CandidateStatus.Rejected),
        key: 'rejectedCandidates',
        errorValue: 0
      },
      {
        promise: adminService.getApprovedNominations(CandidateNominationStatus.Approved),
        key: 'appliedNominations',
        errorValue: 0
      }
    ];

    const responses = await Promise.allSettled(requests.map(req => req.promise));
    Object.keys(candidateStats).forEach(key => {
      candidateStats[key as keyof CandidateStats] = 0;
    });

    responses.forEach((result, index) => {
      const request = requests[index];
      const key = request.key as keyof CandidateStats;

      if (result.status === 'fulfilled') {
        const filteredData = filterCandidatesByStateAndConstituency(result.value || []);
        candidateStats[key] = filteredData.length;
      } else {
        candidateStats[key] = request.errorValue;
        toast.error(`Failed to load ${request.key.replace(/([A-Z])/g, ' $1')}`, { theme: 'dark' });
      }
    });
  } catch (error) {
    toast.error('Failed to load candidate data', { theme: 'dark' });
  } finally {
    isLoadingCandidateData.value = false;
  }
};

watch(
  [() => props.state, () => props.constituency],
  ([newState, newConstituency], [oldState, oldConstituency]) => {
    if (newState !== oldState || newConstituency !== oldConstituency) {
      fetchCandidateData();
    }
  },
  { immediate: true }
);

onMounted(() => {
  fetchCandidateData();
});
</script>

<style scoped>
.minh-300 {
  min-height: 300px;
}

.hover-shadow {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.hover-shadow:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.cursor-pointer {
  cursor: pointer;
}
</style>