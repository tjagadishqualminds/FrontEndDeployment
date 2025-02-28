<template>
    <div class="container py-4">
        <div class="d-flex justify-content-between gap-3">
            <section class="flex-fill bg-white rounded p-3 shadow-sm border" style="height: 40vh; width: 30vw;">
                <h2 class="h5 text-center mb-3 text-dark">Active Elections</h2>
                <div v-if="activeElections.length > 0" class="d-grid gap-3" style="height: 30vh; overflow-y: auto;">
                    <div v-for="election in activeElections" :key="election.id" class="card p-3 shadow-sm">
                        <h3 class="h6 text-center font-weight-bold mb-2">{{ election.electionName }}</h3>
                        <p class="text-muted">State: {{ election.stateName }}</p>
                        <p class="text-muted">
                            From: {{ formatDate(election.electionTimeFrom) }} To: {{ formatDate(election.electionTimeTo)
                            }}
                        </p>
                        <button class="btn btn-primary btn-sm w-100" @click="viewCandidates(election)">View
                            Candidates</button>
                    </div>
                </div>
                <p v-else class="text-center text-muted">No active elections available.</p>
            </section>
            <section class="flex-fill bg-white rounded p-3 shadow-sm border" style="height: 40vh; width: 30vw;">
                <h2 class="h5 text-center mb-3 text-dark">Upcoming Elections</h2>
                <div v-if="upcomingElections.length > 0" class="d-grid gap-3" style="height: 30vh; overflow-y: auto;">
                    <div v-for="election in upcomingElections" :key="election.id" class="card p-3 shadow-sm">
                        <h3 class="h6 text-center font-weight-bold mb-2">{{ election.electionName }}</h3>
                        <p class="text-muted">State: {{ election.stateName }}</p>
                        <p class="text-muted">Election Date: {{ formatDate(election.electionDate) }}</p>
                        <button class="btn btn-primary btn-sm w-100" @click="viewCandidates(election)">View
                            Candidates</button>
                    </div>
                </div>
                <p v-else class="text-center text-muted">No upcoming elections available.</p>
            </section>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from "vue";
import axios from "axios";
import { useRouter } from "vue-router";
import config from "../../config/apiConfig.json";

interface Election {
    id: number;
    electionName: string;
    stateName: string;
    electionDate?: string;
    electionTimeFrom?: string;
    electionTimeTo?: string;
}

const activeElections = ref<Election[]>([]);
const upcomingElections = ref<Election[]>([]);

const formatDate = (date: string | undefined) =>
    date
        ? new Date(date).toLocaleDateString(undefined, {
            year: "numeric",
            month: "short",
            day: "numeric",
        })
        : "";

const fetchActiveElections = async () => {
    try {
        const response = await axios.get<Election[]>(
            `${config.baseUrl}${config.endpoints.activeElections}`
        );
        activeElections.value = response.data;
    } catch (error) {
        console.error("Error fetching active elections:", error);
    }
};

const fetchUpcomingElections = async () => {
    try {
        const response = await axios.get<Election[]>(
            `${config.baseUrl}${config.endpoints.upcomingElections}`
        );
        upcomingElections.value = response.data;
    } catch (error) {
        console.error("Error fetching upcoming elections:", error);
    }
};

const router = useRouter();
const viewCandidates = (election: Election) => {
    router.push({ name: "contestedcandidateslist", params: { electionId: election.id } });
};

onMounted(async () => {
    await Promise.all([fetchActiveElections(), fetchUpcomingElections()]);
});
</script>
