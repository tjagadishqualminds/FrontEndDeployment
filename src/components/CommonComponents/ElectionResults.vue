<template>
  <div class="dashboard">
    <filter-section :elections="mappedElections" :states="mappedStates" :constituencies="mappedConstituencies"
      :modelValue="selectedFilters" @update:modelValue="updateFilters" @clear:filters="clearFilters" />
    <div class="charts d-flex justify-content-around">
      <results-chart :chartData="chartData" :options="chartOptions" :currentResults="currentResults" />
      <voting-chart :votingData="votingChartData" :options="donutOptions" />
    </div>
    <brief-results-table :results="briefResults" :currentPage="currentPage" :itemsPerPage="itemsPerPage"
      @sort="handleBriefSort" @page="setPage" @download="handleBriefDownload" />
    <button @click="toggleDetails" type="button" class="btn btn-primary btn-sm">
      {{ showDetails ? "Hide Details" : "Get More Details" }}
    </button>
    <detailed-results-table v-if="showDetails" :results="detailedResults" :parties="parties"
      :currentPage="currentDetailedPage" :itemsPerPage="DetaileditemsPerPage" @sort="handleDetailedSort"
      @page="setDetailedPage" @filter="handleDetailedFilter" @download="handleDetailedDownload" />
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted, computed, watch, onUnmounted } from "vue";
import FilterSection from "./FilterSection.vue";
import ResultsChart from "./ResultsChart.vue";
import VotingChart from "./VotingChart.vue";
import BriefResultsTable from "./BriefResultsTable.vue";
import DetailedResultsTable from "./DetailedResultsTable.vue";
import { useElectionStore } from "../../stores/electionStore";
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
};
const donutOptions = {
  responsive: true,
  maintainAspectRatio: false,
};
interface Election {
  code: number;
  name: string;
}
interface State {
  id: number;
  name: string;
}
interface Constituency {
  id: number;
  name: string;
}
interface Filters {
  electionCode: number | null;
  stateId: number | null;
  constituencyId: number | null;
  partyName: string | null;
}
interface BriefResult {
  electionCode: number;
  constituency: string;
  constituencyId: number;
  candidateCount: number;
  totalVotes: number;
  winningCandidate: string;
  winningParty: string;
  winningVotes: number;
}
interface DetailedResult {
  id: number;
  electionCode: number;
  candidateId: number;
  candidateName: string;
  partyName: string;
  votesReceived: number;
  votesPercentage: number;
  voteDifference: number;
  status: string;
  totalVotesCast: number;
  constituency: string;
  stateId: number;
  state: string;
  voterTurnout: number;
  partyAlliance: string;
  partyLogoUrl: string;
  isLive: boolean;
  constituencyId: number;
  totalVotes: number;
  electionDate: Date;
  electionName: string;
}
interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor: string[];
  }[];
}
const electionStore = useElectionStore();
const showDetails = ref(false);
const currentPage = ref(1);
const currentDetailedPage = ref(1);
const itemsPerPage = ref(5);
const DetaileditemsPerPage = ref(10);
const currentResults = ref<"live" | "declared">("live");
const refreshInterval = ref<number | null>(null);
const selectedFilters = ref<Filters>({
  electionCode: null,
  stateId: null,
  constituencyId: null,
  partyName: null,
});
const mappedElections = computed(() => {
  const elections = electionStore.elections || [];
  const filteredElections = elections.filter((election) => {
    return electionStore.resultsType === "live" ? election.isLive : !election.isLive;
  });
  return filteredElections.map((e) => ({
    code: e.code,
    name: e.name,
    isLive: e.isLive,
  }));
});
const mappedStates = computed(() => {
  const states = electionStore.states || [];
  return (states || []).map((s) => ({
    id: s.id,
    name: s.name,
  }));
});
const mappedConstituencies = computed(() => {
  const constituencies = electionStore.constituencies || [];
  return (constituencies || []).map((c) => ({
    id: c.id,
    name: c.name,
  }));
});
const parties = computed(() => electionStore.parties as string[]);
const liveElectionCodes = computed(() => {
  return electionStore.detailedResults
    .filter((result) => result.isLive)
    .map((result) => result.electionCode);
});

const declaredElectionCodes = computed(() => {
  return electionStore.detailedResults
    .filter((result) => !result.isLive)
    .map((result) => result.electionCode);
});

const segregatedBriefResults = computed(() => {
  const allBriefResults = electionStore.getBriefResults(
    selectedFilters.value
  ) as BriefResult[];

  const liveResults = allBriefResults.filter((result) =>
    liveElectionCodes.value.includes(result.electionCode)
  );

  const declaredResults = allBriefResults.filter((result) =>
    declaredElectionCodes.value.includes(result.electionCode)
  );

  return electionStore.resultsType === "live" ? liveResults : declaredResults;
});

const briefResults = computed(() => segregatedBriefResults.value);

const detailedResults = computed(() => {
  const results = electionStore.getDetailedResults(selectedFilters.value);
  return results.map((result) => ({
    id: result.id,
    candidateName: result.candidateName,
    partyName: result.partyName,
    votesReceived: result.votesReceived,
    votesPercentage: result.votesPercentage,
    partyLogoUrl: result.partyLogoUrl || "",
    constituency: result.constituency,
    voterTurnout: result.voterTurnout,
    electionName: result.electionName,
    electionDate: result.electionDate,
  })) as DetailedResult[];
});
const chartData = computed<ChartData>(() => ({
  ...electionStore.getChartData(selectedFilters.value),
}));
const votingChartData = computed<ChartData>(() => ({
  ...electionStore.getVotingChartData(selectedFilters.value),
}));
const setupAutoRefresh = () => {
  if (refreshInterval.value) {
    clearInterval(refreshInterval.value);
    refreshInterval.value = null;
  }
  if (electionStore.resultsType === "live") {
    refreshInterval.value = setInterval(() => {
      fetchData();
    }, 5 * 60 * 1000); // 5 minutes
  }
};
const updateFilters = (newFilters: Partial<Filters>) => {
  selectedFilters.value = { ...selectedFilters.value, ...newFilters };
  currentPage.value = 1;
  currentDetailedPage.value = 1;
  fetchData();
};
const clearFilters = () => {
  selectedFilters.value = {
    electionCode: null,
    stateId: null,
    constituencyId: null,
    partyName: null,
  };
  fetchData();
};
const fetchData = async () => {
  await electionStore.fetchElectionData(selectedFilters.value);
};
const handleBriefSort = (column: string, order: string) => {
  const direction = order as "asc" | "desc";
  electionStore.sortResults?.({ column, direction, type: "brief" });
};
const handleDetailedSort = (column: string, order: string) => {
  const direction = order as "asc" | "desc";
  electionStore.sortResults?.({ column, direction, type: "detailed" });
};
const handleDetailedFilter = (searchTerm: string, party: string | null) => {
  electionStore.filterResults?.({ searchTerm, party });
};
const handleBriefDownload = () => {
  electionStore.downloadBriefResultsExcel();
};
const handleDetailedDownload = () => {
  electionStore.downloadDetailedResultsExcel();
};
const setPage = (page: number) => {
  currentPage.value = page;
};
const setDetailedPage = (page: number) => {
  currentDetailedPage.value = page;
};
const toggleDetails = () => {
  showDetails.value = !showDetails.value;
};
watch(
  () => electionStore.resultsType,
  () => {
    setupAutoRefresh();
  }
);

onMounted(() => {
  fetchData();
  setupAutoRefresh();
});

onUnmounted(() => {
  if (refreshInterval.value) {
    clearInterval(refreshInterval.value);
  }
});
</script>
<style scoped>
.dashboard {
  padding: 1rem;
  width: 100%;
}

.charts {
  margin-top: 1rem;
  margin-right: 20px;
  gap: 1rem;
  margin-bottom: 2rem;
}

.btn-primary {
  margin-top: 0.5rem;
  transition: background-color 0.3s;
  position: absolute;
  right: 6rem;
  font-size: 0.8rem;
}
</style>
