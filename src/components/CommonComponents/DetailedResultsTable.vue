<template>
  <div class="mt-5">
    <div class="d-flex justify-content-between align-items-center gap-2 me-5 w-100">
      <h2>Details</h2>
      <div class="d-flex justify-content-evenly w-100 align-items-center">
        <div class="position-relative d-flex align-items-center">
          <input type="text" v-model="searchQuery" placeholder="Search by name, party, constituency"
            class="form-control w-100 pe-4" style="width: 400px !important;" @input="handleSearch" />
          <i class="bi bi-search position-absolute end-2 text-muted"></i>
        </div>
        <div class="d-flex align-items-center">
          <label for="party" class="me-2 fw-bold text-body">Party :</label>
          <div class="position-relative d-inline-block">
            <select v-model="selectedParty" class="form-select bg-light">
              <option value="" disabled selected>select a party</option>
              <option v-for="party in parties" :key="party" :value="party">
                {{ party }}
              </option>
            </select>
            <button v-if="selectedParty" @click="clearPartyFilter"
              class="btn btn-link position-absolute top-50 end-0 translate-middle-y p-1 pe-3" title="Clear selection">
              x
            </button>
          </div>
        </div>
        <button class="btn btn-light position-relative p-2" @click="$emit('download')">
          <i class="bi bi-download"></i>
          <small class="position-absolute start-50 translate-middle-x opacity-0 hover-opacity-100 transition"
            style="top: 90%">
            Download in Excel
          </small>
        </button>
      </div>
    </div>
    <div class="table-responsive">
      <table class="table table-striped table-bordered table-hover mt-3 bg-white rounded-3 shadow-sm">
        <thead>
          <tr>
            <th @click="handleSort('candidateName')" class="cursor-pointer">
              Candidate
              <span>{{ getSortIcon("candidateName") }}</span>
            </th>
            <th @click="handleSort('partyName')" class="cursor-pointer">
              Party Name
              <span>{{ getSortIcon("partyName") }}</span>
            </th>
            <th @click="handleSort('votesReceived')" class="cursor-pointer">
              Votes Received
              <span>{{ getSortIcon("votesReceived") }}</span>
            </th>
            <th>Percentage of Votes</th>
            <th>Party Symbol</th>
            <th @click="handleSort('constituency')" class="cursor-pointer">
              Constituency
              <span>{{ getSortIcon("constituency") }}</span>
            </th>
            <th>Voter Turnout</th>
            <th>Election</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="endIndex === 0">
            <td colspan="8" class="text-center">No data found</td>
          </tr>
          <tr v-for="result in paginatedResults" :key="result.id">
            <td>{{ result.candidateName }}</td>
            <td>{{ result.partyName }}</td>
            <td>{{ formatNumber(result.votesReceived) }}</td>
            <td>{{ result.votesPercentage }}%</td>
            <td>
              <img :src="result.partyLogoUrl" alt="Party Logo" width="50" />
            </td>
            <td>{{ result.constituency }}</td>
            <td>{{ result.voterTurnout }}%</td>
            <td>
              {{ result.electionName }}-{{ result.electionDate.toString().split("T")[0] }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="d-flex justify-content-between align-items-center mt-3">
      <span v-if="endIndex != 0" class="text-muted small">
        Showing {{ startIndex + 1 }} to {{ endIndex }} of
        {{ filteredResults.length }} results
      </span>
      <Pagination :currentPage="currentPage" :totalPages="totalPages" @setPage="handlePageChange" />
    </div>
  </div>
</template>

<script setup lang="ts">
// Script section remains unchanged
import { ref, computed } from "vue";
import Pagination from "../CommonComponents/Pagination.vue";

interface DetailedResult {
  id: number;
  candidateName: string;
  partyName: string;
  votesReceived: number;
  votesPercentage: number;
  partyLogoUrl: string;
  constituency: string;
  voterTurnout: number;
  electionName: string;
  electionDate: Date;
}

const props = defineProps<{
  results: DetailedResult[];
  parties: string[];
  currentPage: number;
  itemsPerPage: number;
}>();

const emit = defineEmits<{
  (e: "sort", field: string, direction: "asc" | "desc"): void;
  (e: "page", page: number): void;
  (e: "download"): void;
}>();

const searchQuery = ref("");
const selectedParty = ref("");
const sortField = ref("votesReceived");
const sortDirection = ref<"asc" | "desc">("desc");

const filteredResults = computed(() => {
  if (!searchQuery.value && !selectedParty.value) return props.results;
  const lowerQuery = searchQuery.value.toLowerCase();
  return props.results.filter(
    (result) =>
      (lowerQuery === "" ||
        result.constituency.toLowerCase().includes(lowerQuery) ||
        result.partyName.toLowerCase().includes(lowerQuery) ||
        result.candidateName.toLowerCase().includes(lowerQuery)) &&
      (selectedParty.value === "" || result.partyName === selectedParty.value)
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
};

const clearPartyFilter = () => {
  selectedParty.value = "";
};

const getSortIcon = (field: string): string => {
  if (sortField.value !== field) return "↕️";
  return sortDirection.value === "asc" ? "↑" : "↓";
};

const formatNumber = (value: number): string => {
  return new Intl.NumberFormat().format(value);
};
</script>

<style scoped>
.cursor-pointer {
  cursor: pointer;
}

.end-2 {
  right: 0.5rem;
}

.hover-opacity-100:hover {
  opacity: 1 !important;
}

.transition {
  transition: opacity 0.3s;
}
</style>