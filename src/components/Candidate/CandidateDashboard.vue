<template>
  <div class="container mt-4">
    <h1 class="text-right">Welcome {{ username }}</h1>
    <div class="row mb-4">
      <section class="col-md-6">
        <h2>Your next Election :</h2>
        <div v-if="nearestElectionDate" class="text-center">
          <div>
            <p class="font-weight-bold text-start">{{ nearestElectionName }}</p>
          </div>
          <h2 class="text-start">in</h2>
          <div class="display-4 text-danger text-start">{{ countdown }}</div>
        </div>
        <p v-else class="text-muted text-start">No upcoming elections</p>
      </section>
      <div class="col-md-6">
        <div class="mb-3 d-flex align-items-baseline gap-2">
          <label for="constituency" class="form-label">Select Constituency :</label>
          <select id="constituency" class="form-select w-auto" v-model="selectedConstituency" @change="updateChart">
            <option v-for="constituency in constituencyData" :key="constituency.constituency"
              :value="constituency.constituency">
              {{ constituency.constituency }}
            </option>
          </select>
        </div>
        <div class="row">
          <section class="col-md-6">
            <h3>Voter Demographics</h3>
            <div>
              <Pie v-if="isDataLoadedAgeGroups" :data="demographicsDataAgeGroup" :options="options" />
            </div>
          </section>
          <section class="col-md-6">
            <h3>Gender</h3>
            <div>
              <Pie v-if="isDataLoadedGender" :data="demographicsDataGender" :options="options" />
              <p v-else class="text-muted">Loading chart data...</p>
            </div>
          </section>
        </div>
      </div>
    </div>
    <section class="mb-4">
      <h2>Applied Nominations</h2>
      <div class="d-flex overflow-auto gap-3 scrollable-cards">
        <div v-for="nomination in Nominations" :key="nomination.id" class="card p-3 shadow-sm"
          style="min-width: 200px;">
          <p><strong>Constituency:</strong> {{ nomination.constituencyName }}</p>
          <p><strong>Status:</strong> {{ nomination.candidateNominationStatus }}</p>
        </div>
      </div>
    </section>
    <section>
      <h2>Upcoming Elections</h2>
      <div class="d-flex overflow-auto gap-3 scrollable-cards">
        <div v-for="election in upcomingElections" :key="election.id" class="card p-3 shadow-sm"
          style="min-width: 200px;">
          <p><strong>Election Name:</strong> {{ election.electionName }}</p>
          <p><strong>State:</strong> {{ election.stateName }}</p>
          <p><strong>Date:</strong> {{ election.electionDate.split('T')[0] }}</p>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, nextTick } from "vue";
import axios from "axios";
import config from "../../config/apiConfig.json";
import { Pie } from "vue-chartjs";
import { Chart as ChartJS, Title, Tooltip, Legend, ArcElement } from "chart.js";
import { useCandidateStore } from "@/Services/Store";
import { toast } from "vue3-toastify";
ChartJS.register(Title, Tooltip, Legend, ArcElement);
interface Nominations {
  id: number;
  constituencyName: string;
  candidateNominationStatus: string;
}
interface Election {
  id: number;
  electionName: string;
  stateName: string;
  electionDate: string;
}
interface ConstituencyData {
  constituency: string;
  totalVoters: number;
  femaleVoters: number;
  maleVoters: number;
  youth: number;
  middleAged: number;
  seniorCitizens: number;
}
interface DemographicsData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor: string[];
  }[];
}
const candidateStore = useCandidateStore();
const username = candidateStore.userDetails?.fullName || " ";
const candidateId = candidateStore.candidateId;
const token = localStorage.getItem("CandidateToken");
const Nominations = ref<Nominations[]>([]);
const upcomingElections = ref<Election[]>([]);
const countdown = ref("");
const nearestElectionDate = ref<Date | null>(null);
const nearestElectionName = ref("");
const constituencyData = ref<ConstituencyData[]>([]);
const selectedConstituency = ref<string>("");
const isDataLoadedGender = ref(false);
const isDataLoadedAgeGroups = ref(false);
const demographicLabelGender = ["Total Voters", "Female Voters", "Male Voters"];
const demographicLabelAgeGroup = ["Senior Citizens", "Middle Age", "Youth"];
const backgroundColours = ["#FFCE56", "#FF6384", "#36A2EB"];
const demographicsDataGender = ref<DemographicsData>({
  labels: demographicLabelGender,
  datasets: [
    {
      label: "Voter Demographics",
      data: [],
      backgroundColor: backgroundColours,
    },
  ],
});

const demographicsDataAgeGroup = ref<DemographicsData>({
  labels: demographicLabelAgeGroup,
  datasets: [
    {
      label: "Voter Demographics",
      data: [],
      backgroundColor: backgroundColours,
    },
  ],
});
const options = ref({
  responsive: true,
  maintainAspectRatio: false,
});
const calculateCountdown = () => {
  if (nearestElectionDate.value) {
    const now = new Date();
    const timeDiff = nearestElectionDate.value.getTime() - now.getTime();

    if (timeDiff <= 0) {
      countdown.value = "0d 0h 0m 0s";
      return;
    }
    const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);

    countdown.value =
      days > 1
        ? `${days}d ${hours}h ${minutes}m`
        : `${hours + days * 24}h ${minutes}m ${seconds}s`;
  }
};

const updateChart = async () => {
  const constituency = constituencyData.value.find(
    (c) => c.constituency === selectedConstituency.value
  );

  if (constituency) {
    demographicsDataGender.value.datasets[0].data = [
      constituency.totalVoters,
      constituency.femaleVoters,
      constituency.maleVoters,
    ];

    demographicsDataAgeGroup.value.datasets[0].data = [
      constituency.youth,
      constituency.middleAged,
      constituency.seniorCitizens,
    ];

    isDataLoadedGender.value = false;
    isDataLoadedAgeGroups.value = false;
    await nextTick();
    isDataLoadedGender.value = true;
    isDataLoadedAgeGroups.value = true;
  }
};
const fetchVoterDemographicsGender = async () => {
  try {
    const response = await axios.get(
      `${config.baseUrl}${config.endpoints.Nominations}/getvoterdemographics/${candidateId}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    constituencyData.value = response.data;
  } catch (error) {
    toast.error((error as Error).message, { theme: "dark" });
  }
};
const parseElectionString = (electionString: string) => {
  const [namePart, datePart] = electionString.split(",");
  nearestElectionName.value = namePart.trim();
  const nearestElectionDatePart = datePart.split(" ")[0];
  const dateSegments = nearestElectionDatePart.trim().split("-");
  nearestElectionDate.value = new Date(
    `${dateSegments[2]}-${dateSegments[1]}-${dateSegments[0]}`
  );
};
onMounted(async () => {
  try {
    const response = await axios.get(
      `${config.baseUrl}${config.endpoints.Nominations}/nominatedelections/${candidateId}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (response.status === 404 || !response.data || response.data.length === 0) {
      Nominations.value = [];
      return;
    }
    Nominations.value = response.data;
  } catch (error) {
    toast.error((error as Error).message, { theme: "dark" });
  }
  try {
    const response = await axios.get(
      `${config.baseUrl}${config.endpoints.Nominations}/upcomingelectionsfornomination/${candidateId}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (response.status === 404 || !response.data || response.data.length === 0) {
      upcomingElections.value = [];
      return;
    }
    upcomingElections.value = response.data;
  } catch (error) {
    toast.error((error as Error).message, { theme: "dark" });
  }
  try {
    const response = await axios.get(
      `${config.baseUrl}${config.endpoints.Nominations}/nearestelectiondate/${candidateId}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (
      response.data !== "No upcoming elections" &&
      response.data !== "No nominations found for this candidate."
    ) {
      parseElectionString(response.data);
      setInterval(calculateCountdown, 1000);
    }
  } catch (error) {
    toast.error((error as Error).message, { theme: "dark" });
  }
  await fetchVoterDemographicsGender();
  if (constituencyData.value.length > 0) {
    selectedConstituency.value =
      constituencyData.value[constituencyData.value.length - 1].constituency;
    updateChart();
  }
});
watch(selectedConstituency, updateChart);
</script>

<style scoped>
.scrollable-cards::-webkit-scrollbar {
  display: none;
}
</style>
