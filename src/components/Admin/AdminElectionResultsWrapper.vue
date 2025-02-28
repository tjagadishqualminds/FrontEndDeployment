<template>
  <div class="admin-election-results-wrapper">
    <ElectionResults />
  </div>
</template>

<script setup lang="ts">
import ElectionResults from "@/components/CommonComponents/ElectionResults.vue";
</script>

<style scoped>
.admin-election-results-wrapper {
  width: 100%;
  height: calc(100vh - 60px);
  overflow-y: auto;
  padding: 1rem;
  background-color: #f9f9f9;
}

:deep(.dashboard) {
  padding-top: 0;
  margin: 0 auto;
  max-width: 1200px;
}

:deep(.charts) {
  margin-top: 0;
  margin-right: 0;
  padding: 1rem 0;
  justify-content: space-between;
}

:deep(.table-responsive) {
  max-width: 100%;
  overflow-x: auto;
}

:deep(.filter-section) {
  margin-top: 0;
  padding-top: 0;
}

:deep(.btn-primary) {
  right: 2rem;
  top: 0.5rem;
  position: absolute;
}
</style>