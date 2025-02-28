<template>
    <div class="container mt-2">
        <div class="table-responsive">
            <table class="table  table-hover table-bordered text-center">
                <thead class="thead-dark">
                    <tr>
                        <th scope="col">S.No</th>
                        <th scope="col">Full Name</th>
                        <th scope="col" v-if="dataType !== 'UpdateUsers'">Date of Birth</th>
                        <th scope="col" v-if="dataType !== 'UpdateUsers'">Gender</th>
                        <th scope="col">Aadhar Number</th>
                        <th scope="col">Phone Number</th>
                        <th scope="col">Address</th>
                        <th scope="col" v-if="dataType !== 'UpdateUsers'">Status</th>
                        <th scope="col" v-if="dataType == 'UpdateUsers'">VoterId</th>
                        <th scope="col" v-if="showActions">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(voter, index) in paginatedData" :key="voter.id">
                        <td class="fs-6">{{ (currentPage - 1) * itemsPerPage + index + 1 }}</td>
                        <td class="fs-6">{{ voter.fullName }}</td>
                        <td class="fs-6" v-if="dataType !== 'UpdateUsers'">{{ formatDate(voter.dateOfBirth) }}</td>
                        <td class="fs-6" v-if="dataType !== 'UpdateUsers'">{{ voter.gender }}</td>
                        <td class="fs-6">{{ voter.aadharNumber }}</td>
                        <td class="fs-6">{{ voter.phoneNumber }}</td>
                        <td class="fs-6">{{ voter.address }}</td>
                        <td class="fs-6" v-if="dataType !== 'UpdateUsers'">{{ voter.status }}</td>
                        <td class="fs-6" v-if="dataType == 'UpdateUsers'">{{ voter.voterId }}</td>
                        <td v-if="showActions" class="d-flex">
                            <button @click="validateHandler(voter)" class="btn btn-sm btn-primary mx-1">
                                Validate
                            </button>
                            <div :class="{ 'disabled-cursor': !voter.isApproveValidated }">
                                <button @click="approveHandler(voter)" class="btn btn-sm btn-success mx-1"
                                    :disabled="!voter.isApproveValidated"
                                    :style="{ 'pointer-events': !voter.isApproveValidated ? 'none' : 'auto' }">
                                    Approve
                                </button>
                            </div>
                            <div :class="{ 'disabled-cursor': !voter.isRejectValidated }">
                                <button @click.prevent="rejectHandler(voter)" class="btn btn-sm btn-danger mx-1"
                                    :disabled="!voter.isRejectValidated"
                                    :style="{ 'pointer-events': !voter.isRejectValidated ? 'none' : 'auto' }">
                                    Reject
                                </button>
                            </div>
                        </td>
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
import { toast } from 'vue3-toastify';

const currentPage = ref(1);
const itemsPerPage = ref(10);

interface ValidateVoter {
    fullName: string;
    aadharNumber: number;
    dateOfBirth: string;
    phoneNumber: number;
    address: string;
    gender: string;
    isApproveValidated: boolean;
    isRejectValidated: boolean;
}
interface UpdateUser {
    id: number
    fullName: string
    aadharNumber: number
    phoneNumber: number
    address: string
    voterId: string
    isApproveValidated: boolean;
    isRejectValidated: boolean;
}

const props = defineProps<{
    data: Array<{
        id: number;
        fullName: string;
        dateOfBirth?: string;
        aadharNumber: number;
        status?: string;
        phoneNumber: number;
        address: string;
        gender?: string;
        voterId?: string;
        isApproveValidated: boolean;
        isRejectValidated: boolean;
    }>;
    validateVoter: (voter: ValidateVoter) => void;
    validateUpdateVoter: (voter: UpdateUser) => void;
    approveVoter: (id: number) => void;
    approveUpdateUser: (UpdateUser: UpdateUser) => void;
    rejectVoter: (id: number) => void;
    rejectUpdateUser: (UpdateUser: UpdateUser) => void;
    showActions: boolean;
    dataType: "NewVoters" | "UpdateUsers";

}>();



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

const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const validateHandler = (voter: any) => {

    if (props.dataType === 'NewVoters') {
        props.validateVoter(voter);
    } else if (props.dataType === 'UpdateUsers') {
        props.validateUpdateVoter(voter);
    } else {
        toast.error("Unexpected data type:", props.dataType);
    }
};

const approveHandler = (voter: any) => {
    if (props.dataType === 'NewVoters') {
        props.approveVoter(voter.id);
    } else if (props.dataType === 'UpdateUsers') {
        props.approveUpdateUser(voter);
    }
};
const rejectHandler = (voter: any) => {
    if (props.dataType === 'NewVoters') {
        props.rejectVoter(voter.id);
    } else if (props.dataType === 'UpdateUsers') {
        props.rejectUpdateUser(voter);
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

.btn {
    margin-left: 5px;
}

.disabled-cursor {
    cursor: not-allowed;
}

.pagination-container {
    margin-top: 10vh;
}
</style>