<template>
  <section>
    <div class="chart-container">
      <h5>Seats won by each party</h5>
      <Bar
        v-if="electionStore.resultsType === 'live' && chartData"
        :data="chartData"
        :options="baroptions"
      />
      <Pie
        v-else-if="electionStore.resultsType === 'declared' && chartData"
        :data="chartData"
        :options="pieoptions"
      />
    </div>
  </section>
</template>
<script setup lang="ts">
import { Bar, Pie } from "vue-chartjs";
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
} from "chart.js";
ChartJS.register(
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  ArcElement
);
import { useElectionStore } from "../../stores/electionStore";
interface Props {
  chartData: {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      backgroundColor: string[];
    }[];
  };
}
const electionStore = useElectionStore();
const props = defineProps<Props>();
const pieoptions = {
  responsive: true,
  maintainAspectRatio: false,
};
const baroptions = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    y: {
      beginAtZero: true,
    },
  },
};
</script>

<style scoped>
.chart-container {
  width: 605px;
  gap: 0.5rem;
  height: 200px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

h5 {
  margin: 0;
  padding: 0;
  font-size: 1rem;
  font-weight: 600;
  color: #333;
}
</style>
