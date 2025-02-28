<template>
    <div class="container py-4">
        <div class="card mb-4 bg-light">
            <div class="card-body text-center">
                <h5 class="mb-3">Your vote has been casted</h5>
                <div class="mb-2">
                    <span class="text-success">
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                            class="mb-2">
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                            <polyline points="22 4 12 14.01 9 11.01" />
                        </svg>
                    </span>
                </div>
                <p class="mb-0">Thank you!</p>
            </div>
        </div>
        <div class="card" v-if="hasSubmitted">
            <div class="card-body">
                <h4 class="card-title text-primary mb-4">Give the Feedback on voting process</h4>
                <form @submit.prevent="submitApplicationFeedback">
                    <div class="mb-3">
                        <div class="d-flex align-items-center">
                            <label class="me-3" for="question1">1. Does the voting process seem clear to you?</label>
                            <div class="form-check form-check-inline">
                                <input class="form-check-input" type="radio" v-model="feedback.question1" id="q1-yes"
                                    :value="true">
                                <label class="form-check-label" for="q1-yes">Yes</label>
                            </div>
                            <div class="form-check form-check-inline">
                                <input class="form-check-input" type="radio" v-model="feedback.question1" id="q1-no"
                                    :value="false">
                                <label class="form-check-label" for="q1-no">No</label>
                            </div>
                        </div>
                    </div>
                    <div class="mb-3">
                        <div class="d-flex align-items-center">
                            <label class="me-3" for="question2">2. Does the voting process seem transparent to
                                you?</label>
                            <div class="form-check form-check-inline">
                                <input class="form-check-input" type="radio" v-model="feedback.question2" id="q2-yes"
                                    :value="true">
                                <label class="form-check-label" for="q2-yes">Yes</label>
                            </div>
                            <div class="form-check form-check-inline">
                                <input class="form-check-input" type="radio" v-model="feedback.question2" id="q2-no"
                                    :value="false">
                                <label class="form-check-label" for="q2-no">No</label>
                            </div>
                        </div>
                    </div>
                    <div class="mb-3">
                        <div class="d-flex align-items-center">
                            <label class="me-3" for="question3">3. Are you satisfied with the overall voting
                                experience?</label>
                            <div class="form-check form-check-inline">
                                <input class="form-check-input" type="radio" v-model="feedback.question3" id="q3-yes"
                                    :value="true" />
                                <label class="form-check-label" for="q3-yes">Yes</label>
                            </div>
                            <div class="form-check form-check-inline">
                                <input class="form-check-input" type="radio" v-model="feedback.question3" id="q3-no"
                                    :value="false" />
                                <label class="form-check-label" for="q3-no">No</label>
                            </div>
                        </div>
                    </div>
                    <div class="mb-4">
                        <label class="form-label" for="question4">Do you have any suggestions for improving the voting
                            process?</label>
                        <textarea class="form-control" v-model="feedback.suggestions" rows="3"
                            placeholder="Enter your feedback here"></textarea>
                    </div>
                    <button type="submit" class="btn btn-primary px-4">Submit</button>
                </form>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { apiService } from '@/Services/ApiService';
import { onMounted, reactive, ref } from 'vue'
import { toast } from "vue3-toastify";
import "vue3-toastify/dist/index.css";
import { useDetailsUserStore } from '@/stores/userDetailsStore';
const userDetailsStore = useDetailsUserStore();


const hasSubmitted = ref(true);
const feedback = reactive({
    question1: null as boolean | null,
    question2: null as boolean | null,
    question3: null as boolean | null,
    suggestions: ''
})

const submitApplicationFeedback = async () => {
    if (feedback.question1 === null || feedback.question2 === null || feedback.question3 === null || feedback.suggestions === "") {
        toast.info('Please answer both questions');
        return;
    }
    const feedbackData = {
        BlockchainId: 1,
        UserId: userDetailsStore.userId,
        ElectionCode: userDetailsStore.electionId,
        StateId: userDetailsStore.userDetails.stateId,
        IsVotingProcessClear: feedback.question1,
        IsVotingTransparent: feedback.question2,
        IsSatisfied: feedback.question3,
        Feedback: feedback.suggestions || ''
    };
    try {
        await apiService.PostApplicationFeedback(feedbackData);

        feedback.question1 = null;
        feedback.question2 = null;
        feedback.question3 = null;
        feedback.suggestions = '';

        toast.success('Thank you for your feedback!');
        hasSubmitted.value = false
    } catch (error) {
        toast.error('Failed to submit feedback. Please try again.');
    }
};
const GetFeedbackByUserId = async () => {
    const response = await apiService.getApplicationFeedbackByUserId(userDetailsStore.userId);
    if (response) {
        toast.info('Already submitted the feedback');
        hasSubmitted.value = false;

    }
}
onMounted(async () => {
    await userDetailsStore.getLoginDetails();
    if (userDetailsStore.userId) {
        await userDetailsStore.fetchUserDetails();
        GetFeedbackByUserId();

    }
});
</script>

<style scoped>
.card {
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
</style>