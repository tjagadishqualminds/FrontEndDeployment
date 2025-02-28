<template>
  <div class="container reports">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h3>Reports and Analytics</h3>
      <div class="d-flex align-items-center gap-3">
        <div class="form-group d-flex align-items-center mb-0">
          <label for="stateFilter" class="me-2">State:</label>
          <select id="stateFilter" v-model="selectedStateId" class="form-select" @change="handleStateChange">
            <option value="">All States</option>
            <option v-for="state in states" :key="state.id" :value="state.id">
              {{ state.name }}
            </option>
          </select>
          <button v-if="selectedStateId" class="btn btn-sm btn-outline-secondary ms-2" @click="clearStateFilter">
            &times;
          </button>
        </div>
        <button ref="downloadButtonRef" class="btn btn-primary" @click="downloadExcel">
          <i class="bi bi-download me-2"></i>Download Reports
        </button>
      </div>
    </div>
    <div class="row mb-4">
      <div class="col-12">
        <div class="card h-100">
          <div class="card-body">
            <div class="d-flex gap-3 mb-4">
              <div class="form-group position-relative">
                <label for="constituencyFilter">Constituency:</label>
                <select id="constituencyFilter" v-model="selectedConstituencyId" class="form-select"
                  @change="handleConstituencyChange">
                  <option value="">All Constituencies</option>
                  <option v-for="constituency in constituencies" :key="constituency.id" :value="constituency.id">
                    {{ constituency.name }}
                  </option>
                </select>
                <button v-if="selectedConstituencyId"
                  class="btn btn-sm btn-outline-secondary position-absolute top-0 end-0 mt-4 me-2"
                  @click="clearConstituencyFilter">
                  &times;
                </button>
              </div>
            </div>
            <div class="row flex-grow-1">
              <div class="col-md-6">
                <div v-if="!hasVoterData" class="text-center text-muted">
                  No data available
                </div>
                <div v-else>
                  <DoubleLineGraph :chartData="voterChartData" :chartOptions="voterChartOptions" />
                </div>
              </div>
              <div class="col-md-6">
                <div v-if="!hasCandidatesData" class="text-center text-muted">
                  No data available
                </div>
                <div v-else>
                  <DoubleLineGraph :chartData="candidatesChartData" :chartOptions="candidatesChartOptions" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="row">
      <div class="col-12">
        <div class="card h-100">
          <div class="card-body d-flex flex-column">
            <h5 class="card-title">Elections and Feedback Overview</h5>
            <div v-if="!hasElectionsData" class="text-center text-muted">
              No data available
            </div>
            <div v-else>
              <DoubleLineGraph :chartData="electionsChartData" :chartOptions="electionsChartOptions" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import DoubleLineGraph from './DoubleLineGraph.vue';
import type { ChartData, ChartOptions } from 'chart.js';
import { adminService } from '@/Services/AdminApiService';
import { apiService } from '@/Services/ApiService';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';

interface Dataset {
  label: string;
  data: number[];
  borderColor: string;
  backgroundColor: string;
  fill: boolean;
  yAxisID?: string;
  borderWidth?: number;
  pointRadius?: number;
  pointHoverRadius?: number;
  pointStyle?: string;
}

interface CustomChartData extends ChartData<'line', number[], string> {
  labels: string[];
  datasets: Dataset[];
}

interface DataPoint {
  year: number;
  count: number;
}

interface FetchParams {
  stateId?: string | null;
  constituencyId?: string | null;
}

const voterChartData = ref<CustomChartData>(initializeChartData());
const candidatesChartData = ref<CustomChartData>(initializeChartData());
const electionsChartData = ref<CustomChartData>(initializeChartData());

const transformedAverageVoting = ref<DataPoint[]>([]);
const transformedvoterChartData = ref<DataPoint[]>([]);
const transformedElections = ref<DataPoint[]>([]);
const transformedFeedback = ref<DataPoint[]>([]);

const selectedStateId = ref<string>('');
const selectedConstituencyId = ref<string>('');
const states = ref<Array<{ id: number; name: string }>>([]);
const constituencies = ref<Array<{ id: number; name: string }>>([]);
const downloadButtonRef = ref<HTMLElement | null>(null);

const voterChartOptions = computed<ChartOptions<'line'>>(() =>
  getDualAxisChartOptions('Voter Statistics', {
    voters: transformedvoterChartData.value,
    averageVoting: transformedAverageVoting.value
  })
);

const candidatesChartOptions = computed<ChartOptions<'line'>>(() =>
  getChartOptions('Candidate Statistics')
);

const electionsChartOptions = computed<ChartOptions<'line'>>(() =>
  getDualAxisChartOptions('Elections Statistics', {
    elections: transformedElections.value,
    feedback: transformedFeedback.value
  })
);

function clearStateFilter() {
  selectedStateId.value = "";
  constituencies.value = [];
  updateCharts();
}
async function handleConstituencyChange() {
  await updateCharts();
}
function clearConstituencyFilter() {
  selectedConstituencyId.value = "";
  updateCharts();
}
async function handleStateChange() {
  selectedConstituencyId.value = "";
  if (selectedStateId.value) {
    constituencies.value = await apiService.getConstituencies(
      Number(selectedStateId)
    );
  } else {
    constituencies.value = [];
  }
  await updateCharts();
}

const hasVoterData = computed(() =>
  transformedvoterChartData.value.length > 0 &&
  transformedAverageVoting.value.length > 0
);

const hasCandidatesData = computed(() =>
  candidatesChartData.value.datasets[0].data.length > 0
);

const hasElectionsData = computed(() =>
  transformedElections.value.length > 0 &&
  transformedFeedback.value.length > 0
);

function initializeChartData(): CustomChartData {
  return {
    labels: [],
    datasets: [{
      label: '',
      data: [],
      borderColor: '',
      backgroundColor: '',
      fill: true,
    }],
  };
}

function getChartOptions(title: string): ChartOptions<'line'> {
  return {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: title }
    },
    scales: { y: { beginAtZero: true } }
  };
}

function getDualAxisChartOptions(
  title: string,
  chartData?: {
    voters?: DataPoint[];
    averageVoting?: DataPoint[];
    elections?: DataPoint[];
    feedback?: DataPoint[]
  }
): ChartOptions<'line'> {
  const maxValue = chartData?.voters
    ? Math.max(...chartData.voters.map(d => d.count)) + 2
    : chartData?.elections
      ? Math.max(...chartData.elections.map(d => d.count)) + 2
      : 10;

  return {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: title },
      tooltip: { mode: 'index', intersect: false }
    },
    scales: {
      x: { display: true, title: { display: true, text: 'Year' } },
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        beginAtZero: true,
        title: {
          display: true,
          text: chartData?.voters ? 'Total Voters' : 'Number of Elections'
        },
        min: 0,
        max: maxValue
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        beginAtZero: true,
        title: {
          display: true,
          text: chartData?.voters ? 'Average Voting Percentage (%)' : 'Satisfaction Score (%)'
        },
        min: 0,
        max: 100,
        grid: { drawOnChartArea: false }
      }
    },
    interaction: { mode: 'index', intersect: false }
  };
}

function transformApiData(data: { [key: string]: number }): DataPoint[] {
  return Object.entries(data)
    .map(([year, count]) => ({ year: parseInt(year), count }))
    .sort((a, b) => a.year - b.year);
}

function mergeDataSets(data1: DataPoint[], data2: DataPoint[]) {
  const allYears = new Set<number>([...data1.map(d => d.year), ...data2.map(d => d.year)]);
  const sortedYears = Array.from(allYears).sort((a, b) => a - b);

  return {
    labels: sortedYears,
    dataset1: sortedYears.map(year => data1.find(d => d.year === year)?.count || 0),
    dataset2: sortedYears.map(year => data2.find(d => d.year === year)?.count || 0)
  };
}

async function updateCharts() {
  try {
    const params: FetchParams = {
      stateId: selectedStateId.value || null,
      constituencyId: selectedConstituencyId.value || null
    };

    const [votersData, candidatesData, electionsData, feedbackData, averageVotingPercentage] =
      await Promise.all([
        adminService.fetchCumulativeVoterCounts(params),
        adminService.fetchCandidatesCount(params),
        adminService.fetchNumberOfElections({ stateId: params.stateId }),
        adminService.fetchFeedbackSatisfactionCounts({ stateId: params.stateId }),
        adminService.fetchAverageVotingPercentage(params),
      ]);

    const transformedVoters = transformApiData(votersData);
    const transformedAverageVoting = transformApiData(averageVotingPercentage);
    const transformedCandidates = transformApiData(candidatesData);
    const transformedElections = transformApiData(electionsData);
    const transformedFeedback = transformApiData(feedbackData);

    const votingChartData = mergeDataSets(transformedVoters, transformedAverageVoting);
    const electionChartData = mergeDataSets(transformedElections, transformedFeedback);
    updateVoterChartData(votingChartData);
    updateCandidatesChartData(transformedCandidates);
    updateElectionsChartData(electionChartData);

  } catch (error) {
    console.error('Error updating charts:', error);
  }
}

function updateVoterChartData(data: ReturnType<typeof mergeDataSets>) {
  voterChartData.value = {
    labels: data.labels.map(String),
    datasets: [
      {
        label: 'Total Voters',
        data: data.dataset1,
        borderColor: 'rgba(54, 162, 235, 1)',
        backgroundColor: 'rgba(54, 162, 235, 0.2)',
        fill: true,
        yAxisID: 'y'
      },
      {
        label: 'Average Voting Percentage',
        data: data.dataset2,
        borderColor: 'rgba(255, 206, 86, 1)',
        backgroundColor: 'rgba(255, 206, 86, 0.2)',
        borderWidth: 3,
        pointRadius: 6,
        pointHoverRadius: 8,
        fill: true,
        yAxisID: 'y1'
      }
    ]
  };
}

function updateCandidatesChartData(data: DataPoint[]) {
  candidatesChartData.value = {
    labels: data.map(d => d.year.toString()),
    datasets: [
      {
        label: 'Total Candidates',
        data: data.map(d => d.count),
        borderColor: 'rgba(255, 99, 132, 1)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        fill: true
      }
    ]
  };
}

function updateElectionsChartData(data: ReturnType<typeof mergeDataSets>) {
  electionsChartData.value = {
    labels: data.labels.map(String),
    datasets: [
      {
        label: 'Elections Held',
        data: data.dataset1,
        borderColor: 'rgba(255, 206, 86, 1)',
        backgroundColor: 'rgba(255, 206, 86, 0.2)',
        borderWidth: 3,
        pointRadius: 6,
        pointHoverRadius: 8,
        fill: true,
        yAxisID: 'y'
      },
      {
        label: 'Feedback Satisfaction Score',
        data: data.dataset2,
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderWidth: 3,
        pointRadius: 6,
        pointHoverRadius: 8,
        pointStyle: 'triangle',
        fill: true,
        yAxisID: 'y1'
      }
    ]
  };
}

async function fetchAndSetupCharts() {
  try {
    const [
      votersData,
      candidatesData,
      electionsData,
      feedbackData,
      averageVotingPercentage,
    ] = await Promise.all([
      adminService.fetchCumulativeVoterCounts(),
      adminService.fetchCandidatesCount(),
      adminService.fetchNumberOfElections(),
      adminService.fetchFeedbackSatisfactionCounts(),
      adminService.fetchAverageVotingPercentage(),
    ]);

    transformedvoterChartData.value = transformApiData(votersData);
    transformedAverageVoting.value = transformApiData(averageVotingPercentage);
    const votingChartdata = mergeDataSets(
      transformedvoterChartData.value,
      transformedAverageVoting.value
    );
    const transformedCandidates = transformApiData(candidatesData);
    transformedElections.value = transformApiData(electionsData);
    transformedFeedback.value = transformApiData(feedbackData);
    const mergedData = mergeDataSets(
      transformedElections.value,
      transformedFeedback.value
    );
    voterChartData.value = {
      labels: votingChartdata.labels.map((year) => year.toString()),
      datasets: [
        {
          label: "Total Voters",
          data: votingChartdata.dataset1,
          borderColor: "rgba(54, 162, 235, 1)",
          backgroundColor: "rgba(54, 162, 235, 0.2)",
          fill: true,
          yAxisID: "y",
        },
        {
          label: "Average Voting Percentage",
          data: votingChartdata.dataset2,
          borderColor: "rgba(255, 206, 86, 1)",
          backgroundColor: "rgba(255, 206, 86, 0.2)",
          borderWidth: 3,
          pointRadius: 6,
          pointHoverRadius: 8,
          fill: true,
          yAxisID: "y1",
        },
      ],
    };
    candidatesChartData.value = {
      labels: transformedCandidates.map((d) => d.year.toString()),
      datasets: [
        {
          label: "Total Candidates",
          data: transformedCandidates.map((d) => d.count),
          borderColor: "rgba(255, 99, 132, 1)",
          backgroundColor: "rgba(255, 99, 132, 0.2)",
          fill: true,
        },
      ],
    };
    electionsChartData.value = {
      labels: mergedData.labels.map((year) => year.toString()),
      datasets: [
        {
          label: "Elections Held",
          data: mergedData.dataset1,
          borderColor: "rgba(255, 206, 86, 1)",
          backgroundColor: "rgba(255, 206, 86, 0.2)",
          borderWidth: 3,
          pointRadius: 6,
          pointHoverRadius: 8,
          fill: true,
          yAxisID: "y",
        },
        {
          label: "Feedback Satisfaction Score",
          data: mergedData.dataset2,
          borderColor: "rgba(75, 192, 192, 1)",
          backgroundColor: "rgba(75, 192, 192, 0.2)",
          borderWidth: 3,
          pointRadius: 6,
          pointHoverRadius: 8,
          pointStyle: "triangle",
          fill: true,
          yAxisID: "y1",
        },
      ],
    };
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}
async function downloadExcel() {
  const data = {
    voters: voterChartData.value.labels.map((year, index) => ({
      year,
      totalVoters: voterChartData.value.datasets[0].data[index],
      votingPercentage: voterChartData.value.datasets[1].data[index],
    })),
    candidates: candidatesChartData.value.labels.map((year, index) => ({
      year,
      totalCandidates: candidatesChartData.value.datasets[0].data[index],
    })),
    elections: electionsChartData.value.labels.map((year, index) => ({
      year,
      electionsHeld: electionsChartData.value.datasets[0].data[index],
      satisfactionScore: electionsChartData.value.datasets[1].data[index],
    })),
  };

  const wb = XLSX.utils.book_new();
  const votersWS = XLSX.utils.json_to_sheet(data.voters);
  const candidatesWS = XLSX.utils.json_to_sheet(data.candidates);
  const electionsWS = XLSX.utils.json_to_sheet(data.elections);

  XLSX.utils.book_append_sheet(wb, votersWS, "Voters Data");
  XLSX.utils.book_append_sheet(wb, candidatesWS, "Candidates Data");
  XLSX.utils.book_append_sheet(wb, electionsWS, "Elections Data");

  const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  const blob = new Blob([excelBuffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  saveAs(blob, `election_reports_${new Date().toISOString().split("T")[0]}.xlsx`);
}

async function fetchInitialData() {
  try {
    states.value = await apiService.getStates();
    await fetchAndSetupCharts();
  } catch (error) {
    console.error("Error fetching initial data:", error);
  }
}
onMounted(() => {
  fetchInitialData();
});
</script>

<style scoped>
.reports {
  margin-top: 20px;
}
</style>