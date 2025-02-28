<template>
  <div class="container p-3 bg-white border rounded shadow-sm mw-800 mx-auto my-4"
    style="max-height: 350px; overflow-y: auto;">
    <h3 class="text-center mb-4">Edit Election</h3>
    <form @submit.prevent="submitForm" class="g-3">
      <div class="row g-3">
        <div class="col-12 col-md-6">
          <div class="mb-3">
            <label for="electionName" class="form-label">Election Name</label>
            <input type="text" v-model="formData.electionName" class="form-control" required>
          </div>
        </div>
        <div class="col-12 col-md-6">
          <div class="mb-3">
            <label for="state" class="form-label">State</label>
            <select v-model="formData.stateId" @change="updateStateName" class="form-select"
              :class="{ 'is-invalid': errors.state }" required>
              <option value="0" disabled>Select your state</option>
              <option v-for="state in states" :key="state.id" :value="state.id">{{ state.name }}</option>
            </select>
            <div v-if="errors.state" class="invalid-feedback">
              {{ errors.state }}
            </div>
          </div>
        </div>
        <div class="col-12 col-md-6">
          <div class="mb-3">
            <label for="campaignDateFrom" class="form-label">Campaign Date From</label>
            <input type="date" v-model="formData.campaignDateFrom" class="form-control"
              :class="{ 'is-invalid': errors.campaign }" required>
            <div v-if="errors.campaign" class="invalid-feedback">
              {{ errors.campaign }}
            </div>
          </div>
        </div>
        <div class="col-12 col-md-6">
          <div class="mb-3">
            <label for="campaignDateTo" class="form-label">Campaign Date To</label>
            <input type="date" v-model="formData.campaignDateTo" class="form-control"
              :class="{ 'is-invalid': errors.campaignEndDate }" required>
            <div v-if="errors.campaignEndDate" class="invalid-feedback">
              {{ errors.campaignEndDate }}
            </div>
          </div>
        </div>
        <div class="col-12 col-md-6">
          <div class="mb-3">
            <label for="nominationDateFrom" class="form-label">Nomination Date From</label>
            <input type="date" v-model="formData.nominationDateFrom" class="form-control"
              :class="{ 'is-invalid': errors.nomination }" required>
            <div v-if="errors.nomination" class="invalid-feedback">
              {{ errors.nomination }}
            </div>
          </div>
        </div>
        <div class="col-12 col-md-6">
          <div class="mb-3">
            <label for="nominationTo" class="form-label">Nomination To</label>
            <input type="date" v-model="formData.nominationTo" class="form-control"
              :class="{ 'is-invalid': errors.nominationEndDate }" required>
            <div v-if="errors.nominationEndDate" class="invalid-feedback">
              {{ errors.nominationEndDate }}
            </div>
          </div>
        </div>
        <div class="col-12 col-md-6">
          <div class="mb-3">
            <label for="electionDate" class="form-label">Election Date</label>
            <input type="date" v-model="formData.electionDate" class="form-control"
              :class="{ 'is-invalid': errors.electionDate }" required>
            <div v-if="errors.electionDate" class="invalid-feedback">
              {{ errors.electionDate }}
            </div>
          </div>
        </div>
        <div class="col-12 col-md-3">
          <div class="mb-3">
            <label for="electionTimeFrom" class="form-label">Election Time From</label>
            <input type="time" v-model="formData.electionTimeFrom" class="form-control"
              :class="{ 'is-invalid': errors.electionTime }" required>
          </div>
        </div>
        <div class="col-12 col-md-3">
          <div class="mb-3">
            <label for="electionTimeTo" class="form-label">Election Time To</label>
            <input type="time" v-model="formData.electionTimeTo" class="form-control"
              :class="{ 'is-invalid': errors.electionTime }" required>
            <div v-if="errors.electionTime" class="invalid-feedback">
              {{ errors.electionTime }}
            </div>
          </div>
        </div>
        <div class="col-12">
          <div class="mb-3">
            <label for="depositAmount" class="form-label">Deposit Amount</label>
            <input type="number" v-model="formData.depositAmount" class="form-control"
              :class="{ 'is-invalid': errors.depositAmount }" required>
            <div v-if="errors.depositAmount" class="invalid-feedback">
              {{ errors.depositAmount }}
            </div>
          </div>
        </div>
        <div class="col-12">
          <div class="mb-3 form-check">
            <input type="checkbox" v-model="formData.isActive" class="form-check-input">
            <label for="isActive" class="form-check-label">Is Active</label>
          </div>
        </div>
        <div class="col-12 d-flex justify-content-between gap-2">
          <button type="submit" class="btn btn-success flex-grow-1">Update</button>
          <button type="button" class="btn btn-danger flex-grow-1" @click="cancelUpdate">Cancel</button>
        </div>
      </div>
    </form>
  </div>
</template>
<script setup lang="ts">
import { ref, watch, onMounted } from 'vue';
import { apiService } from '../../Services/ApiService';
import { validateElectionDates } from '../../Services/ElectionFormValidations';
import { toast } from 'vue3-toastify';
import 'vue3-toastify/dist/index.css';

interface Election {
  id: number;
  electionName: string;
  stateName: string;
  stateId: number;
  electionDate: string;
  campaignDateFrom: string;
  campaignDateTo: string;
  nominationDateFrom: string;
  nominationTo: string;
  electionTimeFrom: string;
  electionTimeTo: string;
  depositAmount: number;
  isActive: boolean;
}

interface State {
  id: number;
  name: string;
}

interface Props {
  election: Election;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  (e: 'update', updatedElection: Election): void;
  (e: 'cancel'): void;
}>();

const states = ref<State[]>([]);
const errors = ref<Record<string, string>>({});

const formatDate = (date: string) => {
  if (date) {
    const localDate = new Date(date);
    localDate.setMinutes(localDate.getMinutes() - localDate.getTimezoneOffset());
    return localDate.toISOString().split('T')[0];
  }
  return '';
};

const formatTime = (time: string) => time ? time.split('T')[1].slice(0, 5) : '';
const formData = ref<Election>({
  id: props.election.id,
  electionName: props.election.electionName,
  stateName: props.election.stateName,
  stateId: props.election.stateId,
  electionDate: formatDate(props.election.electionDate),
  campaignDateFrom: formatDate(props.election.campaignDateFrom),
  campaignDateTo: formatDate(props.election.campaignDateTo),
  nominationDateFrom: formatDate(props.election.nominationDateFrom),
  nominationTo: formatDate(props.election.nominationTo),
  electionTimeFrom: formatTime(props.election.electionTimeFrom),
  electionTimeTo: formatTime(props.election.electionTimeTo),
  depositAmount: props.election.depositAmount,
  isActive: props.election.isActive,
});

const fetchStates = async () => {
  try {
    const response = await apiService.getStates();
    states.value = response;
  } catch (error) {
    toast.error((error as Error).message, { theme: "dark" });
  }
};

const updateStateName = () => {
  const selectedState = states.value.find(state => state.id === formData.value.stateId);
  formData.value.stateName = selectedState ? selectedState.name : '';
};

watch(
  () => props.election,
  (newElection) => {
    formData.value = {
      id: newElection.id,
      electionName: newElection.electionName,
      stateName: newElection.stateName,
      stateId: newElection.stateId,
      electionDate: formatDate(newElection.electionDate),
      campaignDateFrom: formatDate(newElection.campaignDateFrom),
      campaignDateTo: formatDate(newElection.campaignDateTo),
      nominationDateFrom: formatDate(newElection.nominationDateFrom),
      nominationTo: formatDate(newElection.nominationTo),
      electionTimeFrom: formatTime(newElection.electionTimeFrom),
      electionTimeTo: formatTime(newElection.electionTimeTo),
      depositAmount: newElection.depositAmount,
      isActive: newElection.isActive,
    };
  },
  { immediate: true }
);

const submitForm = async () => {
  errors.value = {};
  try {
    const validationErrors = validateElectionDates(formData.value, formData.value.stateId, formData.value.depositAmount);

    if (Object.keys(validationErrors).length > 0) {
      errors.value = validationErrors;
      return;
    }
    const { electionTimeFrom, electionTimeTo, electionDate } = formData.value;
    if (electionTimeFrom && electionTimeTo) {
      const electionTimeFromDate = `${electionDate}T${electionTimeFrom}:00`;
      const electionTimeToDate = `${electionDate}T${electionTimeTo}:00`;
      formData.value.electionTimeFrom = electionTimeFromDate;
      formData.value.electionTimeTo = electionTimeToDate;
    }

    emit('update', formData.value);
  } catch (error) {
    toast.error((error as Error).message, { theme: "dark" });
    errors.value.general = 'An error occurred while submitting the election. Please try again.';
  }
};

const cancelUpdate = () => {
  emit('cancel');
};

onMounted(() => {
  fetchStates();
});

</script>
<style scoped>
.mw-800 {
  max-width: 800px;
}
</style>