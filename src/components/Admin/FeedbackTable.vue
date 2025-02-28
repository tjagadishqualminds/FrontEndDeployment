<template>
    <div class="container mt-2">
        <div class="table-responsive">
            <table class="table table-hover table-bordered text-center">
                <thead class="thead-dark">
                    <tr>
                        <th scope="col">S.No</th>
                        <th scope="col">FullName</th>
                        <th scope="col">Voter ID</th>
                        <th scope="col">Candidate ID</th>
                        <th scope="col">Election Type</th>
                        <th scope="col">Constituency </th>
                        <th scope="col">Feedback</th>
                        <th scope="col">Satisfied</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(feedback, index) in paginatedData" :key="feedback.id">
                        <td class="fs-6">{{ (currentPage - 1) * itemsPerPage + index + 1 }}</td>
                        <td class="fs-6">{{ feedback.fullName }}</td>
                        <td class="fs-6">{{ feedback.voterId }}</td>
                        <td class="fs-6">{{ feedback.candidateId }}</td>
                        <td class="fs-6">{{ feedback.electionName }}</td>
                        <td class="fs-6">{{ feedback.constituencyName }}</td>
                        <td class="fs-6">{{ feedback.feedback || '-' }}</td>
                        <td class="fs-6">{{ feedback.isSatisfied ? 'Yes' : 'No' }}</td>
                    </tr>
                </tbody>
            </table>
        </div>
        <p v-if="paginatedData.length === 0" class="text-center">No Records Found</p>
        <div v-if="props.data.length > 10" class="pagination-container">
            <CommonPagination :currentPage="currentPage" :totalPages="totalPages" @setPage="setPage" />
        </div>
    </div>
</template>
<script setup lang="ts">
import { defineProps, ref, computed } from 'vue';
import CommonPagination from '../CommonComponents/CommonPagination.vue';

const currentPage = ref(1);
const itemsPerPage = ref(10);

interface VoterFeedback {
    id: number;
    blockchainId: number;
    fullName: string;
    voterId: string;
    candidateId: number;
    electionName: string;
    constituencyName: string;
    feedback?: string;
    isSatisfied: boolean;
}

const props = defineProps<{ data: Array<VoterFeedback> }>();

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
    cursor: pointer;
}

.pagination-container {
    margin-top: 10vh;
}
</style>
