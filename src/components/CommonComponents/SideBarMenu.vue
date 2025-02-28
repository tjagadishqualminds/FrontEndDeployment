<template>
  <div class="main-dashboard position-sticky">
    <RouterLink :to="Url" active-class="active-link" exact-active-class="active-link">
      <div
        class="admin-items w-100 text-center p-2 rounded border border-2 border-primary"
      >
        <h6>{{ Dashboard }}</h6>
      </div>
    </RouterLink>
  </div>
</template>
<script setup lang="ts">
import { defineProps } from "vue";
defineProps<{
  Dashboard: string;
  Url: string;
}>();
</script>

<style scoped>
.admin-items {
  cursor: pointer;
}

.admin-items:hover {
  transform: scale(1.05);
  transition: all 0.3s ease;
  color: #007bff;
}

.active-link .admin-items {
  background-color: #007bff;
  color: white;
}

h6:hover {
  color: #1a1a1b;
}

a {
  text-decoration: none;
}
</style>
