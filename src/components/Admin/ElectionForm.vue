<template>
  <div class="container my-4">
    <div class="bg-light rounded p-4">
      <h2 class="mb-4 text-dark">Add New Election</h2>
      <form @submit.prevent="submitElectionForm" class="overflow-auto" style="max-height: 500px;">
        <div class="row mb-4">
          <div class="col-md-6">
            <div class="mb-3">
              <label for="electionName" class="form-label fw-medium text-dark">Election Name:</label>
              <input type="text" v-model="newElection.electionName" id="electionName" class="form-control" required />
            </div>
          </div>
          <div class="col-md-6">
            <div class="mb-3">
              <label for="state" class="form-label fw-medium text-dark">State:</label>
              <select v-model="newElection.stateId" id="state" class="form-select"
                :class="{ 'is-invalid': errors.state }" @change="selectState(newElection.stateId)">
                <option value="0" disabled>Select your state</option>
                <option v-for="state in states" :key="state.id" :value="state.id">
                  {{ state.name }}
                </option>
              </select>
              <div class="invalid-feedback" v-if="errors.state">
                {{ errors.state }}
              </div>
            </div>
          </div>
        </div>
        <div class="row mb-4">
          <div class="col-md-6">
            <div class="mb-3">
              <label for="nominationDateFrom" class="form-label fw-medium text-dark">Nomination Start Date:</label>
              <input type="date" v-model="newElection.nominationDateFrom" id="nominationDateFrom" class="form-control"
                :class="{ 'is-invalid': errors.nomination }" required />
              <div class="invalid-feedback" v-if="errors.nomination">
                {{ errors.nomination }}
              </div>
            </div>
          </div>
          <div class="col-md-6">
            <div class="mb-3">
              <label for="nominationDateTo" class="form-label fw-medium text-dark">Nomination End Date:</label>
              <input type="date" v-model="newElection.nominationTo" id="nominationDateTo" class="form-control"
                :class="{ 'is-invalid': errors.nominationEndDate }" required />
              <div class="invalid-feedback" v-if="errors.nominationEndDate">
                {{ errors.nominationEndDate }}
              </div>
            </div>
          </div>
        </div>
        <div class="row mb-4">
          <div class="col-md-6">
            <div class="mb-3">
              <label for="campaignDateFrom" class="form-label fw-medium text-dark">Campaign Start Date:</label>
              <input type="date" v-model="newElection.campaignDateFrom" id="campaignDateFrom" class="form-control"
                :class="{ 'is-invalid': errors.campaign }" required />
              <div class="invalid-feedback" v-if="errors.campaign">
                {{ errors.campaign }}
              </div>
            </div>
          </div>
          <div class="col-md-6">
            <div class="mb-3">
              <label for="campaignDateTo" class="form-label fw-medium text-dark">Campaign End Date:</label>
              <input type="date" v-model="newElection.campaignDateTo" id="campaignDateTo" class="form-control"
                :class="{ 'is-invalid': errors.campaignEndDate }" required />
              <div class="invalid-feedback" v-if="errors.campaignEndDate">
                {{ errors.campaignEndDate }}
              </div>
            </div>
          </div>
        </div>
        <div class="row mb-4">
          <div class="col-md-4">
            <div class="mb-3">
              <label for="electionDate" class="form-label fw-medium text-dark">Election Date:</label>
              <input type="date" v-model="newElection.electionDate" id="electionDate" class="form-control"
                :class="{ 'is-invalid': errors.electionDate }" required />
              <div class="invalid-feedback" v-if="errors.electionDate">
                {{ errors.electionDate }}
              </div>
            </div>
          </div>
          <div class="col-md-4">
            <div class="mb-3">
              <label for="electionTimeFrom" class="form-label fw-medium text-dark">Election Time From:</label>
              <input type="time" v-model="newElection.electionTimeFrom" id="electionTimeFrom" class="form-control"
                :class="{ 'is-invalid': errors.electionTime }" required />
              <div class="invalid-feedback" v-if="errors.electionTime">
                {{ errors.electionTime }}
              </div>
            </div>
          </div>
          <div class="col-md-4">
            <div class="mb-3">
              <label for="electionTimeTo" class="form-label fw-medium text-dark">Election Time To:</label>
              <input type="time" v-model="newElection.electionTimeTo" id="electionTimeTo" class="form-control"
                :class="{ 'is-invalid': errors.electionTime }" required />
            </div>
          </div>
        </div>
        <div class="row mb-4">
          <div class="col-md-6">
            <div class="mb-3">
              <label for="depositAmount" class="form-label fw-medium text-dark">Deposit Amount:</label>
              <input type="number" v-model="newElection.depositAmount" id="depositAmount" class="form-control"
                :class="{ 'is-invalid': errors.depositAmount }" required />
              <div class="invalid-feedback" v-if="errors.depositAmount">
                {{ errors.depositAmount }}
              </div>
            </div>
          </div>
        </div>
        <div class="row">
          <div class="col-12">
            <button type="submit" class="btn btn-success me-2">Add Election</button>
            <button type="button" class="btn btn-danger" @click="cancelForm">Cancel</button>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref } from 'vue';
import { apiService } from '../../Services/ApiService';
import { formatISO } from 'date-fns';
import { validateElectionDates } from '../../Services/ElectionFormValidations';
import { toast } from "vue3-toastify";
import "vue3-toastify/dist/index.css";

interface State {
  id: number;
  name: string;
}

interface Election {
  electionName: string;
  stateId: number;
  stateName?: string;
  nominationDateFrom: string;
  nominationTo: string;
  campaignDateFrom: string;
  campaignDateTo: string;
  electionDate: string;
  electionTimeFrom: string;
  electionTimeTo: string;
  depositAmount: number;
}

interface ValidationErrors {
  state?: string;
  nomination?: string;
  nominationEndDate?: string;
  campaign?: string;
  campaignEndDate?: string;
  electionDate?: string;
  electionTime?: string;
  depositAmount?: string;
  general?: string;
}

const props = defineProps<{
  states: State[];
}>();

const emit = defineEmits<{
  (e: 'cancel'): void;
  (e: 'success', message: string): void;
}>();

const newElection = ref<Election>({
  electionName: '',
  stateId: 0,
  nominationDateFrom: '',
  nominationTo: '',
  campaignDateFrom: '',
  campaignDateTo: '',
  electionDate: '',
  electionTimeFrom: '',
  electionTimeTo: '',
  depositAmount: 0,
});

const errors = ref<ValidationErrors>({});

const selectState = (stateId: number) => {
  const selectedState = props.states.find(state => state.id === stateId);
  if (selectedState) {
    newElection.value.stateName = selectedState.name;
  }
};

const validateForm = (): boolean => {
  errors.value = {};

  if (!newElection.value.stateId) {
    errors.value.state = 'Please select a state';
    return false;
  }

  if (newElection.value.depositAmount <= 0) {
    errors.value.depositAmount = 'Deposit amount must be greater than 0';
    return false;
  }

  const validationErrors = validateElectionDates(
    newElection.value,
    newElection.value.stateId,
    newElection.value.depositAmount
  );

  if (Object.keys(validationErrors).length > 0) {
    errors.value = validationErrors;
    return false;
  }

  return true;
};

const submitElectionForm = async () => {
  try {
    if (!validateForm()) {
      return;
    }

    const electionTimeFromDate = formatISO(
      new Date(`${newElection.value.electionDate}T${newElection.value.electionTimeFrom}`)
    );
    const electionTimeToDate = formatISO(
      new Date(`${newElection.value.electionDate}T${newElection.value.electionTimeTo}`)
    );

    const electionData = {
      ...newElection.value,
      electionTimeFrom: electionTimeFromDate,
      electionTimeTo: electionTimeToDate,
    };

    await apiService.addElection(electionData);
    newElection.value = {
      electionName: '',
      stateId: 0,
      nominationDateFrom: '',
      nominationTo: '',
      campaignDateFrom: '',
      campaignDateTo: '',
      electionDate: '',
      electionTimeFrom: '',
      electionTimeTo: '',
      depositAmount: 0,
    };

    emit('success', 'Election Added Successfully');
    cancelForm();
  } catch (error) {
    errors.value.general = 'An error occurred while submitting the election. Please try again.';
    if (error instanceof Error) {
      toast.error(error.message, { theme: "dark" });
    } else {
      toast.error('An unexpected error occurred', { theme: "dark" });
    }
  }
};

const cancelForm = () => {
  emit('cancel');
};
</script>