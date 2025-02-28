<template>
  <div class="chart-container">
    <h5>Voting Percentage</h5>
    <Doughnut :data="votingData" :options="options" />
  </div>
</template>
<script setup lang="ts">
import { defineProps } from "vue";
import { Doughnut } from "vue-chartjs";
import type { ChartData, ChartOptions } from "chart.js";
defineProps({
  votingData: {
    type: Object as () => ChartData<"doughnut", number[], unknown>,
    required: true,
  },
  options: {
    type: Object as () => ChartOptions<"doughnut">,
    required: true,
  },
});
</script>
<style scoped>
.chart-container {
  width: 700px;
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
