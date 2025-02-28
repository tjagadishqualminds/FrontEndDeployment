<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useDetailsUserStore } from '@/stores/userDetailsStore';
import config from '../../config/apiConfig.json'
import { apiService } from '@/Services/ApiService';
import { toast } from "vue3-toastify";
import "vue3-toastify/dist/index.css";
import { router } from '@/router';
const userDetailsStore = useDetailsUserStore();


interface Election {
  id: number
  electionName: string
  stateName: string
  electionTimeFrom: string
  electionTimeTo: string
  electionDate: string
}

interface Candidate {
  candidateId: number;
  fullName: string;
  partyName: string;
  partySymbol: string;
  hasVoted: boolean;
}



const elections = ref<Election[]>([])
const candidates = ref<Candidate[]>([])
const selectedElectionId = ref<number | null>(null)
const selectedElectionName = ref('')
const showOtpRequestPopup = ref(false)
const showOtpPopup = ref(false)
const showOtpSuccessPopup = ref(false)
const otpInput = ref('')
const timer = ref(0)
const statusMessage = ref('')
const statusClass = ref('')
const voterHasVoted = ref(false);
const hasVoted = ref(false);
const showFeedbackPopup = ref(false);
const feedbackText = ref('');
let otpTimeout: ReturnType<typeof setInterval> | null = null


const selectedCandidateId = ref<number | null>(null);


const formatOnlyDate = (dateString: string): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

const formatOnlyTime = (dateString: string): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
}


const fetchElections = async () => {
  try {
    const response = await fetch(`${config.baseUrl}${config.endpoints.activeElections}`)
    if (response.ok) {
      elections.value = await response.json()
    }
  }
  catch (error) {
    toast.error((error as Error).message, { theme: "dark" });
  }

}


const fetchCandidates = async (election: Election) => {
  selectedElectionId.value = election.id
  selectedElectionName.value = election.electionName
  userDetailsStore.setElectionId(election.id);
  try {

    const response = await fetch(
      `http://localhost:5265/api/Voter/contesting-candidates/${election.id}/${userDetailsStore.userDetails.constituencyId}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('VoterToken')}`
        }
      }
    )
    if (response.ok) {
      candidates.value = await response.json()
    }
  }
  catch (error) {
    toast.error((error as Error).message, { theme: "dark" });
  }
}



const voteNow = (candidateId: number) => {
  showOtpRequestPopup.value = true;
  selectedCandidateId.value = candidateId;
};

const castVoteProcess = () => {
  if (selectedCandidateId.value === null) {
    toast.info('Candidate ID is null. Unable to cast vote.');
    return;
  }

  return {
    voterId: userDetailsStore.userDetails.voterId || "",
    candidateId: selectedCandidateId.value,
    electionId: selectedElectionId.value || 0,
  };
};

const castVote = async () => {
  const voteData = castVoteProcess();
  if (!voteData) return;
  try {
    await apiService.voteCast(voteData);
    toast.success('Vote successfully casted', { theme: "dark" });
    router.push("/voter/applicationfeedback")
  } catch (error) {
    toast.error((error as Error).message, { theme: "dark" });
    voterHasVoted.value = true;
    hasVoted.value = true;

  }
};

const sendOtp = async () => {
  if (userDetailsStore.userDetails.email) {

    const response = await fetch(`${config.baseUrl}${config.endpoints.generateOtp}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email: userDetailsStore.userDetails.email })
    })
    if (response.ok) {
      showOtpRequestPopup.value = false
      showOtpPopup.value = true
      startOtpTimer()
      statusMessage.value = 'OTP sent successfully! Please check your email.'
      statusClass.value = 'text-success'
    } else {
      statusMessage.value = 'Failed to send OTP. Please try again.'
      statusClass.value = 'text-danger'
    }
  }
}
const startOtpTimer = () => {
  timer.value = 60
  otpTimeout = setInterval(() => {
    if (timer.value > 0) {
      timer.value--
    } else {
      clearInterval(otpTimeout!)
    }
  }, 1000)
}

const verifyOtp = async () => {
  if (otpInput.value.length === 6) {
    const response = await fetch(`${config.baseUrl}${config.endpoints.validateOtp}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: userDetailsStore.userDetails.email,
        otp: otpInput.value,
      }),
    });

    if (response.ok) {
      statusMessage.value = 'OTP verified successfully! You can now vote.';
      statusClass.value = 'text-success';
      showOtpPopup.value = false;
      showOtpSuccessPopup.value = true;
      if (selectedCandidateId.value !== null) {
        const candidate = candidates.value.find(
          (c) => c.candidateId === selectedCandidateId.value
        );
        if (candidate) candidate.hasVoted = true;
      }
      hasVoted.value = true;
      setTimeout(() => {
        showOtpSuccessPopup.value = false;
      }, 3000);
    } else {
      statusMessage.value = 'Invalid OTP. Please try again.';
      statusClass.value = 'text-danger';
    }
  } else {
    statusMessage.value = 'Invalid OTP format. Please enter a 6-digit OTP.';
    statusClass.value = 'text-danger';
  }
};

const closeOtpPopup = () => {
  showOtpPopup.value = false
  otpInput.value = ''
  if (otpTimeout) clearInterval(otpTimeout)
  timer.value = 0
}

const clearSelection = () => {
  selectedElectionId.value = null
  selectedElectionName.value = ''
  candidates.value = []
  showOtpRequestPopup.value = false
  showOtpPopup.value = false
  showOtpSuccessPopup.value = false
  timer.value = 0
}

onMounted(async () => {
  userDetailsStore.getLoginDetails();
  if (userDetailsStore.userId) {
    await userDetailsStore.fetchUserDetails();
    fetchElections();
  }
})
</script>

<template>
  <div class="container text-center">
    <div v-if="!selectedElectionId">
      <h2>Active Elections</h2>
      <div class="row justify-content-center">
        <div class="card col-md-3 mx-3 my-3" v-for="election in elections" :key="election.id"
          @click="fetchCandidates(election)" style="cursor: pointer; transition: transform 0.3s ease;"
          onmouseover="this.style.transform='scale(1.05)';this.style.borderColor='#007bff'"
          onmouseout="this.style.transform='scale(1)';this.style.borderColor=''" onfocus="" onblur="">
          <div class="card-body">
            <h5 class="card-title">{{ election.electionName }}</h5>
            <p class="card-text">Election Code: {{ election.id }}</p>
            <p class="card-text">State: {{ election.stateName }}</p>
            <div>
              <p class="card-text">
                Election Date: {{ formatOnlyDate(election.electionTimeFrom) }}
              </p>
              <p class="card-text">
                Time: {{ formatOnlyTime(election.electionTimeFrom) }} -
                {{ formatOnlyTime(election.electionTimeTo) }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-else>
      <div class="d-flex align-items-center gap-3 mb-3">
        <button class="btn fs-4 text-primary p-0" @click="clearSelection">←</button>
        <h3>Contested Candidates for {{ selectedElectionName }}</h3>
      </div>
      <div class="table-responsive" style="max-height: 550px;">
        <table class="table table-striped">
          <thead>
            <tr>
              <th>S.No</th>
              <th>Candidate Name</th>
              <th>Party</th>
              <th>Party Symbol</th>
              <th>Vote Now</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(candidate, index) in candidates" :key="candidate.candidateId">
              <td>{{ index + 1 }}</td>
              <td>{{ candidate.fullName }}</td>
              <td>{{ candidate.partyName }}</td>
              <td>
                <img :src="candidate.partySymbol" alt="Party Symbol" class="img-fluid"
                  style="width: 40px; height: 40px; object-fit: cover;" />
              </td>
              <td>
                <div v-if="!hasVoted">
                  <button class="btn" :class="hasVoted ? 'btn-success' : 'btn-primary'"
                    @click="voteNow(candidate.candidateId)" :disabled="voterHasVoted">
                    Vote Now
                  </button>
                </div>
                <div v-if="hasVoted">
                  <button class="btn" :class="hasVoted ? 'btn-success' : 'btn-primary'" @click="castVote()"
                    :disabled="voterHasVoted">
                    Vote
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <div v-if="showOtpRequestPopup"
      class="position-fixed top-0 start-0 w-100 h-100 bg-black bg-opacity-50 d-flex justify-content-center align-items-center">
      <div class="bg-white p-4 rounded-3" style="width: 300px;">
        <h4>Please Verify Your Account</h4>
        <p>Before submitting your vote, we need to verify your account.</p>
        <button class="btn btn-primary" @click="sendOtp">Send OTP to Registered Email</button>
      </div>
    </div>
    <div v-if="showOtpPopup"
      class="position-fixed top-0 start-0 w-100 h-100 bg-black bg-opacity-50 d-flex justify-content-center align-items-center">
      <div class="bg-white p-4 rounded-3" style="width: 300px;">
        <h4>OTP Verification</h4>
        <p>Please enter the OTP sent to your email.</p>
        <input v-model="otpInput" type="text" placeholder="Enter OTP" class="form-control mt-2" maxlength="6" />
        <p v-if="timer > 0">Expires in: {{ timer }} seconds</p>
        <p v-if="timer <= 0" class="text-danger">OTP Expired! Please request a new OTP.</p>
        <button class="btn btn-primary" @click="verifyOtp" :disabled="timer <= 0">Submit OTP</button>
        <button class="btn btn-secondary" @click="closeOtpPopup">Close</button>
        <div v-if="statusMessage" :class="statusClass" class="mt-2 fs-5">{{ statusMessage }}</div>
      </div>
    </div>
    <div v-if="showOtpSuccessPopup"
      class="position-fixed top-0 start-0 w-100 h-100 bg-black bg-opacity-50 d-flex justify-content-center align-items-center">
      <div class="bg-white p-4 rounded-3" style="width: 300px;">
        <h4>OTP Verified Successfully!</h4>
        <p>You can now vote for your chosen candidate.</p>
      </div>
    </div>
  </div>
  <div v-if="showFeedbackPopup"
    class="position-fixed top-0 start-0 w-100 h-100 bg-black bg-opacity-50 d-flex justify-content-center align-items-center">
    <div class="bg-white p-4 rounded-3" style="width: 300px;">
      <h4>We value your feedback</h4>
      <textarea v-model="feedbackText" placeholder="Provide your feedback..." class="form-control"></textarea>
      <button class="btn btn-primary">Submit Feedback</button>
      <button class="btn btn-secondary" @click="showFeedbackPopup = false">Close</button>
    </div>
  </div>
</template>