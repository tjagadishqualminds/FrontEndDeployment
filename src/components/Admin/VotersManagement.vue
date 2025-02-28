<!-- eslint-disable vue/no-deprecated-filter -->
<template>
    <div>
        <div class="btns d-flex gap-2 justify-content-center align-content-center mt-4">
            <div class="btns d-flex gap-2">
                <button class="btn btn-primary" @click="toggleOperation('NewVoters')"
                    :class="{ 'active': operation === 'NewVoters' }">Newly
                    Registered Voters</button>
                <button class="btn btn-primary" @click="toggleOperation('ActiveVoters')"
                    :class="{ 'active': operation === 'ActiveVoters' }">Active Voters</button>
                <button class="btn btn-primary" @click="toggleOperation('UpdateUsers')"
                    :class="{ 'active': operation === 'UpdateUsers' }">Update Voters</button>
            </div>
        </div>
        <!-- 
        // eslint-disable-next-line vue/no-deprecated-filter -->
        <ManagementTables :data="voters" :data-type="operation as 'NewVoters' | 'UpdateUsers'"
            :approveVoter="approveVoter" :rejectVoter="rejectVoter" :validateVoter
            :showActions="operation === 'NewVoters' || operation === 'UpdateUsers'"
            :validate-update-voter="validateUpdateUser" :approve-update-user="approveUpdateUser"
            :reject-update-user="rejectUpdateUser" />

        <Modal v-if="validateError" :visible="validateError" title="Validation" :message="PopupMessage"
            buttonClass="btn-danger" @onClose="closeError" :isbutton-enble-ok="isButtonEnable"
            :show-reason-input="isShowReasonInput" reasontext="reason" @on-submit-reason="onSubmitReason" />
    </div>
</template>

<script setup lang="ts">
import Modal from "./AdminModal.vue";
import { toast } from "vue3-toastify";
import "vue3-toastify/dist/index.css";
import ManagementTables from './ManagementTables.vue';
import { ref, onMounted } from 'vue';
import { adminService } from '@/Services/AdminApiService';


const validateError = ref(false);
const PopupMessage = ref('');
const isButtonEnable = ref(false);
const selectedVoterId = ref();
const isShowReasonInput = ref(false);
const voters = ref<Voter[]>([]);
const operation = ref<'NewVoters' | 'UpdateUsers' | 'ActiveVoters'>('NewVoters');


interface Voter {
    id: number;
    fullName: string;
    dateOfBirth: string;
    aadharNumber: number;
    status: string;
    phoneNumber: number;
    address: string;
    gender: string;
    isApproveValidated: boolean;
    isRejectValidated: boolean;
}
interface UpdateUsers {
    id: number;
    fullName: string;
    aadharNumber: number;
    phoneNumber: number;
    address: string;
    isApproveValidated: boolean;
    isRejectValidated: boolean;
}
interface ValidateVoter {
    fullName: string;
    aadharNumber: number;
    dateOfBirth?: string;
    phoneNumber: number;
    address: string;
    gender?: string;
}
interface UpdateUser {
    id: number
    fullName: string
    aadharNumber: number
    phoneNumber: number
    address: string
    voterId: string
}


const closeError = () => {
    validateError.value = false;
}

const toggleOperation = (operationType: string) => {
    operation.value = operationType as 'NewVoters' | 'UpdateUsers' | 'ActiveVoters';
    getVoters();
};

const getVoters = async () => {
    try {
        let response;
        switch (operation.value) {
            case 'NewVoters':
                response = await adminService.getNewlyRegisteredVoters();
                break;
            case 'ActiveVoters':
                response = await adminService.getAllActiveVoters();
                break;
            case 'UpdateUsers':
                response = await adminService.getUpdateUsers();
                break;
            default:
                throw new Error("Invalid operation")
        }

        if (!response || response.length === 0 || typeof response === "string") {
            voters.value = [];
        } else {
            voters.value = response.map((voter: Voter | UpdateUsers) => ({
                ...voter,
                dateOfBirth: (voter as Voter).dateOfBirth || '',
                status: (voter as Voter).status || '',
                gender: (voter as Voter).gender || '',
                isApproveValidated: false,
                isRejectValidated: false
            }));
        }
    } catch (error) {
        toast.error((error as Error).message, { theme: "dark" });
    }
};

const validateVoter = async (ValidateVoter: ValidateVoter) => {
    try {
        const voterToValidate = {
            ...ValidateVoter, dateOfBirth: ValidateVoter.dateOfBirth || '',
            gender: ValidateVoter.gender || ''
        }
        const result = await adminService.validateUserByAadhar(voterToValidate);
        if (result.success) {
            voters.value = voters.value.map(voter =>
                voter.aadharNumber === ValidateVoter.aadharNumber ? { ...voter, isApproveValidated: true, isRejectValidated: false } : voter
            );
            PopupMessage.value = "The Aadhar details have been verified <br> Everything looks good.";
            validateError.value = true;
            isShowReasonInput.value = false;
        }
        else {
            voters.value = voters.value.map(voter =>
                voter.aadharNumber === ValidateVoter.aadharNumber ? { ...voter, isRejectValidated: true, isApproveValidated: false } : voter
            );
            PopupMessage.value = result.message;
            isShowReasonInput.value = false;
            validateError.value = true;
        }
    } catch (error) {
        toast.error((error as Error).message, { theme: "dark" });
        PopupMessage.value = ((error as Error).message);
        validateError.value = true;
    }
};

const validateUpdateUser = async (UpdateUser: UpdateUser) => {
    try {

        const result = await adminService.validateUpdateUserByAadhar(UpdateUser);
        if (result.success) {
            voters.value = voters.value.map(voter =>
                voter.aadharNumber === UpdateUser.aadharNumber ? { ...voter, isApproveValidated: true, isRejectValidated: false } : voter
            );
            PopupMessage.value = "The Aadhar details have been verified <br> Everything looks good.";
            validateError.value = true;
            isShowReasonInput.value = false;
        }
        else {
            voters.value = voters.value.map(voter =>
                voter.aadharNumber === UpdateUser.aadharNumber ? { ...voter, isRejectValidated: true, isApproveValidated: false } : voter
            );
            PopupMessage.value = result.message;
            isShowReasonInput.value = false;
            validateError.value = true;
        }
    } catch (error) {
        toast.error((error as Error).message, { theme: "dark" });
        PopupMessage.value = ((error as Error).message);
        validateError.value = true;
    }
};

const approveVoter = async (id: number) => {
    try {
        await adminService.userApprovalOrReject(id);
        PopupMessage.value = "The User has been Approved.";
        isButtonEnable.value = true;
        validateError.value = true;
        getVoters();
    } catch (error) {
        toast.error((error as Error).message, { theme: "dark" });
    }
};

const approveUpdateUser = async (UpdateUser: UpdateUser) => {
    try {
        await adminService.updateuserApproval(UpdateUser);
        PopupMessage.value = "The User has been Approved.";
        isButtonEnable.value = true;
        validateError.value = true;
        getVoters();
    } catch (error) {
        toast.error((error as Error).message, { theme: "dark" });
    }
};

const submitreason = async (reason: string) => {
    try {
        await adminService.userApprovalOrReject(selectedVoterId.value, reason);
        validateError.value = false;
        getVoters();
    } catch (error) {
        toast.error((error as Error).message, { theme: "dark" });
    }
};
const submitUpdateReason = async (reason: string) => {
    try {
        if (!selectedVoterId.value) {
            throw new Error("Voter ID is not selected");
        }
        const idToSubmit = selectedVoterId.value;
        await adminService.rejectUpdateUser(idToSubmit, reason);
        await adminService.getUpdateUsers();
        validateError.value = false;
        window.location.reload();
    } catch (error) {
        toast.error((error as Error).message, { theme: "dark" });
    }
};


const onSubmitReason = async (reason: string) => {
    try {
        if (operation.value === 'NewVoters') {
            await submitreason(reason);
            getVoters();
        } else if (operation.value === 'UpdateUsers') {

            await submitUpdateReason(reason);
        }
        validateError.value = false;
    } catch (error) {
        toast.error((error as Error).message, { theme: "dark" });
    }
};


const rejectVoter = async (id: number) => {
    try {
        validateError.value = true
        PopupMessage.value = "Please Enter the Rejected Reason";
        isShowReasonInput.value = true;
        selectedVoterId.value = id;
    } catch (error) {
        toast.error((error as Error).message, { theme: "dark" });
    }
};
const rejectUpdateUser = async (UpdateUser: UpdateUser) => {
    try {
        validateError.value = true
        PopupMessage.value = "Please Enter the Rejected Reason";
        isShowReasonInput.value = true;
        selectedVoterId.value = UpdateUser.id;
    } catch (error) {
        toast.error((error as Error).message, { theme: "dark" });
    }
};

onMounted(() => {
    getVoters();
});
</script>

<style scoped>
.btns button {
    padding: 10px 20px;
    border: none;
    border-radius: 5px;
    transition: background-color 0.3s, transform 0.2s;
}

.btns button:hover {
    background-color: rgba(0, 123, 255, 0.8);
    transform: translateY(-2px);
}

.btns button.active {
    background-color: #0056b3;
    border: 2px solid white;
    box-shadow: 0 0 10px rgba(255, 255, 255, 0.5);
}
</style>