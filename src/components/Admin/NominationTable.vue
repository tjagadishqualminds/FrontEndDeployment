<template>
    <div class="container mt-2">
        <div class="table-responsive">
            <table class="table table-hover table-bordered text-center">
                <thead class="thead-dark">
                    <tr>
                        <th scope="col">S.No</th>
                        <th scope="col">Candidate Name</th>
                        <th scope="col">Party Name</th>
                        <th scope="col" v-if="showIndependentColumn">Is Independent</th>
                        <th scope="col">Constituency Name</th>
                        <th scope="col">State Name</th>
                        <th scope="col">Election Name</th>
                        <th scope="col">Photo</th>
                        <th scope="col">Verification Status</th>
                        <th scope="col">Nomination Status</th>
                        <th scope="col">Affidavit Form</th>
                        <th scope="col">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(candidate, index) in paginatedData" :key="candidate.id">
                        <td class="fs-6">{{ (currentPage - 1) * itemsPerPage + index + 1 }}</td>
                        <td class="fs-6">{{ candidate.candidateName }}</td>
                        <td class="fs-6">{{ candidate.partyName }}</td>
                        <td class="fs-6" v-if="showIndependentColumn">{{ candidate.isIndependent ? 'Yes' : 'No' }}</td>
                        <td class="fs-6">{{ candidate.constituencyName }}</td>
                        <td class="fs-6">{{ candidate.stateName }}</td>
                        <td class="fs-6">{{ candidate.electionName }}</td>
                        <td class="fs-6"><img :src="candidate.photo" alt="CandidateImg" width="50"></td>
                        <td class="fs-6">{{ candidate.candidateVerificationStatus }}</td>
                        <td class="fs-6">{{ candidate.candidateNominationStatus }}</td>
                        <td class="fs-6"><a :href="candidate.affidavitForm" target="_blank">View Form</a></td>
                        <td class="d-flex">
                            <button @click="props.validateNomination(candidate.id)" class="btn btn-sm btn-primary mx-1">
                                Validate
                            </button>
                            <div :class="{ 'disabled-cursor': !candidate.isApproveValidated }">
                                <button @click="props.approveNomination(candidate.id)"
                                    class="btn btn-sm btn-success mx-1" :disabled="!candidate.isApproveValidated"
                                    :style="{ 'pointer-events': !candidate.isApproveValidated ? 'none' : 'auto' }">
                                    Approve
                                </button>
                            </div>
                            <div :class="{ 'disabled-cursor': !candidate.isRejectValidated }">
                                <button @click.prevent="props.rejectNomination(candidate.id)"
                                    class="btn btn-sm btn-danger mx-1" :disabled="!candidate.isRejectValidated"
                                    :style="{ 'pointer-events': !candidate.isRejectValidated ? 'none' : 'auto' }">
                                    Reject
                                </button>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
        <p v-if="paginatedData.length === 0" class="text-center">No Records Found</p>
        <div v-if="props.data.length > itemsPerPage" class="pagination-container">
            <CommonPagination :currentPage="currentPage" :totalPages="totalPages" @setPage="setPage" />
        </div>
    </div>
</template>

<script setup lang="ts">
import { defineProps, ref, computed } from 'vue';
import CommonPagination from '../CommonComponents/CommonPagination.vue';

const currentPage = ref(1);
const itemsPerPage = ref(10);

interface CandidateNomination {
    id: number;
    candidateName: string;
    partyName: string;
    isIndependent: boolean;
    constituencyName: string;
    photo: string;
    stateName: string;
    electionName: string;
    candidateVerificationStatus: string;
    candidateNominationStatus: string;
    affidavitForm: string;
    withdraw: boolean;
    paymentTransactionId: string;
    paymentStatus: boolean;
    status: string;
    isApproveValidated: boolean;
    isRejectValidated: boolean;
}

const props = defineProps<{
    data: Array<CandidateNomination>,
    validateNomination: (id: number) => void;
    approveNomination: (id: number) => void;
    rejectNomination: (id: number) => void;
}>();

const showIndependentColumn = computed(() =>
    props.data.some(candidate => candidate.isIndependent)
);

const totalPages = computed(() => Math.ceil(props.data.length / itemsPerPage.value));

const paginatedData = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage.value;
    const end = start + itemsPerPage.value;
    return props.data.slice(start, end);
});

const setPage = (page: number) => {
    if (page > 0 && page <= totalPages.value) {
        currentPage.value = page;
    }
};
</script>

<style scoped>
.table {
    width: 100%;
    margin-bottom: 1rem;
    color: #212529;
}

.pagination-container {
    margin-top: 10vh;
}

.disabled-cursor {
    cursor: not-allowed !important;
}
</style>