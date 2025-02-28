<template>
  <div class="filter-section">
    <div class="d-flex justify-content-center mb-3">
      <div class="btn-group" role="group" aria-label="Toggle Results">
        <button type="button" class="btn btn-outline-primary" @click="toggleResults('live')"
          :class="{ active: electionStore.resultsType === 'live' }">
          Live Results
        </button>
        <button type="button" class="btn btn-outline-primary" @click="toggleResults('declared')"
          :class="{ active: electionStore.resultsType === 'declared' }">
          Declared Results
        </button>
      </div>
    </div>

    <div class="d-flex flex-wrap justify-content-evenly align-items-center gap-3 w-100">
      <div class="d-flex align-items-center gap-2">
        <label for="election" class="fw-bold">Election:</label>
        <div class="position-relative">
          <select v-model="filters.electionCode" @change="updateFilters" class="form-select">
            <option value="null" disabled>Select an election</option>
            <option v-for="election in filteredElections" :key="election.code" :value="election.code">
              {{ election.name }}
            </option>
          </select>
          <button v-if="filters.electionCode" @click="clearFilter('electionCode')"
            class="btn btn-link text-danger position-absolute end-0 top-50 translate-middle-y p-0">
            <Icon icon="line-md:close-circle" width="20" />
          </button>
        </div>
      </div>

      <div class="d-flex align-items-center gap-2">
        <label for="state" class="fw-bold">State:</label>
        <div class="position-relative">
          <select v-model="filters.stateId" @change="updateFilters" class="form-select">
            <option value="null" disabled>Select your state</option>
            <option v-for="state in states" :key="state.id" :value="state.id">
              {{ state.name }}
            </option>
          </select>
          <button v-if="filters.stateId" @click="clearFilter('stateId')"
            class="btn btn-link text-danger position-absolute end-0 top-50 translate-middle-y p-0">
            <Icon icon="line-md:close-circle" width="20" />
          </button>
        </div>
      </div>

      <div class="d-flex align-items-center gap-2">
        <label for="constituency" class="fw-bold">Constituency:</label>
        <div class="position-relative">
          <select v-model="filters.constituencyId" @change="updateFilters" class="form-select">
            <option value="null" disabled>Select a constituency</option>
            <option v-for="constituency in constituencies" :key="constituency.id" :value="constituency.id">
              {{ constituency.name }}
            </option>
          </select>
          <button v-if="filters.constituencyId" @click="clearFilter('constituencyId')"
            class="btn btn-link text-danger position-absolute end-0 top-50 translate-middle-y p-0">
            <Icon icon="line-md:close-circle" width="20" />
          </button>
        </div>
      </div>

      <button @click="clearAllFilters" class="btn btn-outline-secondary d-flex align-items-center gap-2">
        <Icon icon="line-md:filter-off-twotone" width="24" /> Clear Filters
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import { Icon } from "@iconify/vue";
import { useElectionStore } from "../../stores/electionStore";

interface Election {
  code: number;
  name: string;
  isLive: boolean;
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
}

interface Props {
  elections: Election[];
  states: State[];
  constituencies: Constituency[];
  modelValue: Filters;
}

const props = withDefaults(defineProps<Props>(), {
  elections: () => [],
  states: () => [],
  constituencies: () => [],
  modelValue: () => ({
    electionCode: null,
    stateId: null,
    constituencyId: null,
  }),
});

const emit = defineEmits<{
  (e: "update:modelValue", filters: Filters): void;
  (e: "clear:filters"): void;
}>();
const filters = ref<Filters>({ ...props.modelValue });
const electionStore = useElectionStore();
const isFirstLoad = ref(true);

const filteredElections = computed(() =>
  props.elections.filter((election) =>
    electionStore.resultsType === "live" ? election.isLive : !election.isLive
  )
);

const toggleResults = (type: "live" | "declared") => {
  electionStore.setResultsType(type);
  filters.value = {
    electionCode: null,
    stateId: null,
    constituencyId: null,
  };
  const recentElections = filteredElections.value;
  if (recentElections.length > 0) {
    filters.value.electionCode = recentElections[0].code;
  }
  updateFilters();
};
const updateFilters = () => {
  emit("update:modelValue", filters.value);
};

const clearFilter = (key: keyof Filters) => {
  filters.value[key] = null;
  updateFilters();
};

const clearAllFilters = () => {
  filters.value = {
    electionCode: null,
    stateId: null,
    constituencyId: null,
  };
  emit("clear:filters");
};

watch(
  () => props.modelValue,
  (newValue) => {
    if (JSON.stringify(newValue) !== JSON.stringify(filters.value)) {
      filters.value = { ...newValue };
    }
  },
  { deep: true }
);

onMounted(() => {
  const recentElections = filteredElections.value;
  if (isFirstLoad.value && recentElections.length > 0) {
    filters.value.electionCode = recentElections[0].code;
    isFirstLoad.value = false;
    updateFilters();
  }
});
</script>