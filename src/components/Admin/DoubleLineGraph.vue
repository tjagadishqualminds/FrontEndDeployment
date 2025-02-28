<template>
  <div>
    <Line :data="chartData" :options="chartOptions" />
  </div>
</template>
<script setup lang="ts">
import { Line } from 'vue-chartjs';
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  type ChartData,
  type ChartOptions
} from 'chart.js';

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale
);

interface Dataset {
  label: string;
  data: number[];
  borderColor: string;
  backgroundColor: string;
  fill: boolean;
}

export interface ChartDataType extends ChartData<'line', number[], string> {
  labels: string[];
  datasets: Dataset[];
}

defineProps<{
  chartData: ChartDataType;
  chartOptions: ChartOptions<'line'>;
}>();
</script>
