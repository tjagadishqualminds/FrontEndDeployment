 <template>
    <div>
        <div class="btns d-flex gap-2 mt-3 justify-content-center align-items-center mt-4">
            <div class="btns d-flex gap-2">
                <button class="btn btn-primary" @click="toggleOperation('NewCandidates')"
                    :class="{ 'active': operation === 'NewCandidates' }">Newly Registered Candidates</button>
                <button class="btn btn-primary" @click="toggleOperation('ActiveCandidates')"
                    :class="{ 'active': operation === 'ActiveCandidates' }">Active Candidates</button>
                <button class="btn btn-primary" @click="toggleOperation('Nominations')"
                    :class="{ 'active': operation === 'Nominations' }">Nominations</button>
                <button class="btn btn-primary" @click="toggleOperation('FeedbackCandidateList')"
                    :class="{ 'active': operation === 'FeedbackCandidateList' }">Feedback Candidates List</button>
            </div>
        </div>
        <ManagementTables v-if="operation === 'NewCandidates' || operation === 'ActiveCandidates'" :data="candidates"
            :approveVoter="approveCandidate" :rejectVoter="rejectCandidate" :validateVoter="validateCandidate"
            :showActions="operation === 'NewCandidates'">
        </ManagementTables>
        <NominationTable v-if="operation === 'Nominations'" :data="nominations" :approve-nomination="approveNomination"
            :reject-nomination="rejectNomination" :validate-nomination="validateNominations" />
        <FeedbackTable v-if="operation === 'FeedbackCandidateList'" :data="votersFeedbacks" />
        <Modal v-if="validateError" :visible="validateError" title="Validation" :message="PopupMessage"
            buttonClass="btn-danger" @onClose="closeError" :isbutton-enble-ok="isButtonEnable"
            :show-reason-input="isShowReasonInput" reasontext="reason" @on-submit-reason="submitReason" />
    </div>
</template>

<script setup lang="ts">
import Modal from "./AdminModal.vue";
import ManagementTables from './CandidateManagementTable.vue';
import { ref, onMounted } from 'vue';
import { toast } from "vue3-toastify";
import "vue3-toastify/dist/index.css";
import { adminService } from '@/Services/AdminApiService';
import NominationTable from "./NominationTable.vue";
import FeedbackTable from "./FeedbackTable.vue";
import { useRoute } from 'vue-router';

const route = useRoute();


const validateError = ref(false);
const PopupMessage = ref('');
const isButtonEnable = ref(false);
const isShowReasonInput = ref(false);
const candidates = ref<Candidate[]>([]);
const nominations = ref<CandidateNomination[]>([]);
const votersFeedbacks = ref<VoterFeedback[]>([]);
const operation = ref('NewCandidates');
const selectedVoterId = ref();
const selectedNomineeId = ref();



interface Candidate {
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

interface ValidateCandidate {
    fullName: string;
    aadharNumber: number;
    dateOfBirth: string;
    phoneNumber: number;
    address: string;
    gender: string;
}

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

const closeError = () => {
    validateError.value = false
}
const toggleOperation = (operationType: string) => {
    operation.value = operationType;
    getCandidates();
};
const getCandidates = async () => {
    try {
        let response;
        switch (operation.value) {
            case 'NewCandidates':
                response = await adminService.getNewlyRegisteredCandidates();
                candidates.value = response.map((candidate: Candidate) => ({
                    ...candidate,
                    isApproveValidated: false,
                    isRejectValidated: false
                }));
                break;
            case 'ActiveCandidates':
                response = await adminService.getAllActiveCandidates();
                candidates.value = response.map((candidate: Candidate) => ({
                    ...candidate,
                    isApproveValidated: false,
                    isRejectValidated: false
                }));
                break;
            case 'Nominations':
                response = await adminService.getPendingNominations();
                nominations.value = response.map((nomination: CandidateNomination) => ({
                    ...nomination,
                    status: nomination.status
                }));
                break;
            case 'FeedbackCandidateList':
                response = await adminService.getVotersFeedbacks();
                votersFeedbacks.value = response.map((candidate: Candidate) => ({
                    ...candidate,
                    isApproveValidated: false,
                    isRejectValidated: false
                }));
                break;
            default:
                throw new Error("Invalid operation");
        }
    } catch (error) {
        toast.error((error as Error).message, { theme: "dark" });
    }
};

const validateCandidate = async (ValidateCandidate: ValidateCandidate) => {
    try {
        const result = await adminService.validateUserByAadhar(ValidateCandidate);
        if (result.success) {
            candidates.value = candidates.value.map(voter =>
                voter.aadharNumber === ValidateCandidate.aadharNumber ? { ...voter, isApproveValidated: true, isRejectValidated: false } : voter
            );
            PopupMessage.value = "The Aadhar details have been verified <br> Everything looks good.";
            validateError.value = true;
            isShowReasonInput.value = false;
        }
        else {
            candidates.value = candidates.value.map(voter =>
                voter.aadharNumber === ValidateCandidate.aadharNumber ? { ...voter, isRejectValidated: true, isApproveValidated: false } : voter
            );
            PopupMessage.value = result.message;
            validateError.value = true;
            isShowReasonInput.value = false;
        }
    } catch (error) {
        toast.error((error as Error).message, { theme: "dark" });
        PopupMessage.value = ((error as Error).message);
        validateError.value = true;
    }
};

const approveCandidate = async (id: number) => {
    try {
        await adminService.userApprovalOrReject(id);
        PopupMessage.value = "User has been  Approved";
        isButtonEnable.value = true;
        validateError.value = true;
        getCandidates()
    } catch (error) {
        toast.error((error as Error).message, { theme: "dark" });
    }
};

const approveNomination = async (id: number) => {
    try {
        await adminService.nomineeApprovalOrReject(id);
        PopupMessage.value = "Nominee has been  Approved";
        isButtonEnable.value = true;
        validateError.value = true;
        getCandidates();
    } catch (error) {
        toast.error((error as Error).message, { theme: "dark" });
    }
};

const submitReason = async (reason: string) => {
    try {
        if (operation.value === 'NewCandidates') {
            await adminService.userApprovalOrReject(selectedVoterId.value, reason);
            validateError.value = false;
            getCandidates();
        } else if (operation.value === 'Nominations') {
            await adminService.nomineeApprovalOrReject(selectedNomineeId.value, reason);
            validateError.value = false;
            getCandidates();
        }

    } catch (error) {
        toast.error((error as Error).message, { theme: "dark" });
    }
};

const rejectCandidate = async (id: number) => {
    try {
        validateError.value = true
        PopupMessage.value = "Please Enter the Rejected Reason"
        isShowReasonInput.value = true;
        selectedVoterId.value = id;
    } catch (error) {
        toast.error((error as Error).message, { theme: "dark" });
    }
};
const rejectNomination = async (id: number) => {
    try {
        validateError.value = true
        PopupMessage.value = "Please Enter the Rejected Reason"
        isShowReasonInput.value = true;
        selectedNomineeId.value = id;
    } catch (error) {
        toast.error((error as Error).message, { theme: "dark" });
    }
};

const validateNominations = async (nominationId: number) => {
    try {
        const response = await adminService.validateNominations(nominationId);
        if (response === "Validated") {
            validateError.value = true;
            PopupMessage.value = "Nominee Details Verified";
            isShowReasonInput.value = false;

            nominations.value = nominations.value.map(nomination =>
                nomination.id === nominationId ? { ...nomination, isApproveValidated: true, isRejectValidated: false } : nomination
            );
        } else {
            isShowReasonInput.value = false;
            validateError.value = true;
            PopupMessage.value = "Candidate does not meet eligibility criteria";

            nominations.value = nominations.value.map(nomination =>
                nomination.id === nominationId ? { ...nomination, isApproveValidated: false, isRejectValidated: true } : nomination);
        }
    } catch (error) {
        toast.error((error as Error).message, { theme: "dark" });
        validateError.value = true;
        PopupMessage.value = (error as Error).message;
    }
};

onMounted(() => {
    const defaultOperation = route.query.defaultOperation as string;
    if (defaultOperation) {
        operation.value = defaultOperation;
    }
    getCandidates();
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