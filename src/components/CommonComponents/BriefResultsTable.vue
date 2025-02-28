<template>
  <div class="brief-results mt-5">
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h4 class="mb-0">Overview</h4>
      <div class="d-flex align-items-center gap-3">
        <div class="input-group" style="width: 400px;">
          <input type="text" v-model="searchQuery" placeholder="Search by name, party, constituency"
            class="form-control" @input="handleSearch" />
          <span class="input-group-text">
            <i class="bi bi-search"></i>
          </span>
        </div>
        <button class="btn btn-light" data-bs-toggle="tooltip" data-bs-placement="bottom"
          data-bs-title="Download in Excel" @click="$emit('download')">
          <i class="bi bi-download"></i>
        </button>
      </div>
    </div>
    <div class="table-responsive">
      <table class="table table-striped">
        <thead>
          <tr>
            <th v-for="header in headers" :key="header.field" @click="handleSort(header.field)" class="cursor-pointer">
              {{ header.label }}
              <span class="ms-2">{{ getSortIcon(header.field) }}</span>
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="endIndex === 0">
            <td colspan="8" class="text-center">No data found</td>
          </tr>
          <tr v-for="result in paginatedResults" :key="result.constituency">
            <td>{{ result.constituency }}</td>
            <td>
              <span class="badge" :style="{ backgroundColor: getPartyColor(result.winningParty) }">
                {{ result.winningParty }}
              </span>
            </td>
            <td>{{ result.winningCandidate }}</td>
            <td>{{ formatNumber(result.winningVotes) }}</td>
            <td>{{ formatNumber(result.totalVotes) }}</td>
            <td>{{ formatNumber(result.candidateCount) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="d-flex justify-content-between align-items-center mt-3">
      <span v-if="endIndex != 0" class="text-muted small">
        Showing {{ startIndex + 1 }} to {{ endIndex }} of {{ results.length }} results
      </span>
      <Pagination :currentPage="currentPage" :totalPages="totalPages" @setPage="handlePageChange" />
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, computed } from "vue";
import Pagination from "../CommonComponents/Pagination.vue";
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
interface Props {
  results: BriefResult[];
  currentPage: number;
  itemsPerPage: number;
}
interface TableHeader {
  field: string;
  label: string;
}

const headers: TableHeader[] = [
  { field: 'constituency', label: 'Constituency' },
  { field: 'winningParty', label: 'Winning Party' },
  { field: 'winningCandidate', label: 'Winning Candidate' },
  { field: 'winningVotes', label: 'Winning Votes' },
  { field: 'totalVotes', label: 'Total Votes' },
  { field: 'candidateCount', label: 'Candidate Count' }
];
const props = defineProps<Props>();
const emit = defineEmits<{
  (e: "sort", field: string, direction: "asc" | "desc"): void;
  (e: "page", page: number): void;
  (e: "download"): void;
  (e: "search", query: string): void;
}>();
const searchQuery = ref("");
const sortField = ref("constituencyName");
const sortDirection = ref<"asc" | "desc">("asc");
const filteredResults = computed(() => {
  if (!searchQuery.value) return props.results;
  const lowerQuery = searchQuery.value.toLowerCase();
  return props.results.filter(
    (result) =>
      result.constituency.toLowerCase().includes(lowerQuery) ||
      result.winningParty.toLowerCase().includes(lowerQuery) ||
      result.winningCandidate.toLowerCase().includes(lowerQuery)
  );
});
const startIndex = computed(() => (props.currentPage - 1) * props.itemsPerPage);
const endIndex = computed(() =>
  Math.min(startIndex.value + props.itemsPerPage, filteredResults.value.length)
);
const totalPages = computed(() =>
  Math.ceil(filteredResults.value.length / props.itemsPerPage)
);
const paginatedResults = computed(() => {
  return filteredResults.value.slice(startIndex.value, endIndex.value);
});
const handleSort = (field: string) => {
  if (sortField.value === field) {
    sortDirection.value = sortDirection.value === "asc" ? "desc" : "asc";
  } else {
    sortField.value = field;
    sortDirection.value = "asc";
  }
  emit("sort", field, sortDirection.value);
};
const handlePageChange = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    emit("page", page);
  }
};
const handleSearch = () => {
  if (props.currentPage !== 1) {
    emit("page", 1);
  }
  emit("search", searchQuery.value);
};
const getSortIcon = (field: string): string => {
  if (sortField.value !== field) return "↕️";
  return sortDirection.value === "asc" ? "↑" : "↓";
};
const formatNumber = (value: number): string => {
  return new Intl.NumberFormat().format(value);
};
const getPartyColor = (party: string): string => {
  const partyColors: Record<string, string> = {
    BJP: "#FF9933",
    INC: "#138808",
  };
  return partyColors[party] || "#6c757d";
};
</script>