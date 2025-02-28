<template>
    <div class="container px-4 py-5">
        <div class="card p-4">
            <div class="d-flex justify-content-between align-items-start mb-4">
                <img :src="candidate.partysymbol" alt="Party Symbol" class="rounded-circle img-fluid"
                    style="width: 150px;" />
                <div class="d-flex mx-5">
                    <div class="d-flex flex-column align-items-baseline">
                        <p class="text-muted">Name: <span class="text-dark fw-bold">{{ candidate.name }}</span></p>
                        <p class="text-muted">Party: <span class="text-dark fw-bold">{{ candidate.party }}</span></p>
                        <p class="text-muted">Constituency: <span class="text-dark fw-bold">{{ candidate.constituency
                                }}</span></p>
                    </div>
                </div>
                <div class="d-flex align-items-center justify-content-center rounded-circle bg-light"
                    style="width: 100px; height: 100px;">
                    <img :src="candidate.profile" alt="Candidate Profile" class="rounded-circle img-fluid"
                        style="width: 80px;" />
                </div>
            </div>

            <div class="mb-4">
                <h5 class="fw-bold mb-3">MANIFESTO:</h5>
                <div class="bg-light p-3 rounded overflow-auto" style="max-height: 150px;">
                    <ul class="list-unstyled mb-0">
                        <li>
                            {{ candidate.manifesto }}
                        </li>
                    </ul>
                </div>
            </div>

            <div v-if="isFormVisible">
                <form @submit.prevent="submitFeedback" class="d-flex flex-column align-items-center gap-3">
                    <div class="d-flex gap-3">
                        <div class="form-check">
                            <input type="radio" v-model="feedback.satisfied" :value="true" id="satisfied"
                                class="form-check-input" />
                            <label for="satisfied" class="form-check-label">Satisfied</label>
                        </div>
                        <div class="form-check">
                            <input type="radio" v-model="feedback.satisfied" :value="false" id="not-satisfied"
                                class="form-check-input" />
                            <label for="not-satisfied" class="form-check-label">Not Satisfied</label>
                        </div>
                    </div>
                    <div class="mb-3 w-100">
                        <label for="reason" class="form-label">Give the reason:</label>
                        <textarea id="reason" v-model="feedback.reason" class="form-control" rows="3"></textarea>
                    </div>
                    <button type="submit" class="btn btn-success">Submit</button>
                </form>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { apiService } from '@/Services/ApiService';
import { toast } from "vue3-toastify";
import "vue3-toastify/dist/index.css";
import { useDetailsUserStore } from '@/stores/userDetailsStore';
const userDetailsStore = useDetailsUserStore();

const feedback = ref({
    satisfied: null as boolean | null,
    reason: '',
});

const candidate = ref({
    name: '',
    id: '',
    party: '',
    partysymbol: '',
    constituency: '',
    profile: '',
    manifesto: '',
});

const electionCode = ref();
const isFormVisible = ref(true);

const fetchCandidate = async (id: number) => {
    try {
        const userData = await apiService.getcandidatevoterconstituency(id);
        candidate.value = {
            name: userData.candidateName,
            party: userData.partyName,
            constituency: userData.constituencyName,
            profile: userData.profileImageUrl,
            partysymbol: userData.partySymbol,
            id: userData.candidateId,
            manifesto: '',
        };
        fetchManifesto(userData.candidateId);
    } catch (error) {
        toast.error((error as Error).message, { theme: "dark" });
    }
};

const fetchManifesto = async (candidateId: number) => {
    try {
        const data = await apiService.fetchManifestos(candidateId);
        if (data.length > 0) {
            candidate.value.manifesto = data[0].manifesto;
            electionCode.value = data[0].electionCode
        }
    } catch (error) {
        toast.error((error as Error).message, { theme: "dark" });
    }
};



const submittedFeedback = async (voterId: string) => {
    try {
        const response = await apiService.getFeedbackbyVoterId(voterId);
        if (response) {
            toast.success('Already Feedback submitted successfully', { theme: "dark" });
            isFormVisible.value = false;
        } else {
            isFormVisible.value = true;
        }
    } catch (error) {
        toast.error('Failed to retrieve feedback. Please try again.', { theme: "dark" });
    }
};




const submitFeedback = async () => {
    if (feedback.value.satisfied === null) {
        toast.error('Please select whether you are satisfied or not', { theme: "dark" });
        return;
    }

    if (!feedback.value.reason.trim()) {
        toast.error('Please provide a reason for your feedback', { theme: "dark" });
        return;
    }

    try {
        const data:
            {
                UserId: number
                BlockchainId: number
                ElectionCode: number
                ConstituencyId: number
                VoterId: string
                CandidateId: number
                Feedback: string // Adjust case
                IsSatisfied: boolean // Adjust case
            }
            =
        {
            UserId: userDetailsStore.userId,
            BlockchainId: 1,
            ElectionCode: electionCode.value,
            ConstituencyId: userDetailsStore.userDetails.constituencyId as number,
            VoterId: userDetailsStore.userDetails.voterId,
            CandidateId: Number(candidate.value.id),
            Feedback: feedback.value.reason.trim(),
            IsSatisfied: feedback.value.satisfied,
        };

        await apiService.PostFeedback(data);
        toast.success('Feedback submitted successfully', { theme: "dark" });
        isFormVisible.value = false;
    } catch (error) {
        toast.error('Failed to submit feedback. Please try again.', { theme: "dark" });
    }
};


onMounted(async () => {
    await userDetailsStore.getLoginDetails();
    if (userDetailsStore.userId) {
        await userDetailsStore.fetchUserDetails();
        const voterId = userDetailsStore.userDetails.voterId;
        if (voterId) {
            submittedFeedback(voterId);
        } else {
            toast.info("Voter ID is missing");
        }
        const constituencyId = userDetailsStore.userDetails.constituencyId;
        if (constituencyId) {
            fetchCandidate(constituencyId);
        } else {
            toast.info("Constituency ID is missing");
        }
    }
});


</script>

<style scoped>
.feedback-container {
    margin: 20px;
}

textarea {
    width: 100%;
    height: 100px;
    margin: 10px 0;
    padding: 5px;
    border: 1px solid #ccc;
    border-radius: 4px;
}

button {
    background-color: #28a745;
    color: white;
    border: none;
    padding: 10px 15px;
    border-radius: 4px;
    cursor: pointer;
}

button:hover {
    background-color: #218838;
}
</style>