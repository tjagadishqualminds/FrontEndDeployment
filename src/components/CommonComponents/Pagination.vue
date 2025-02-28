<template>
  <div class="pagination-container">
    <button class="pagination-btn" :disabled="currentPage === 1" @click="setPage(currentPage - 1)">
      <i v-if="currentPage === 1" class="bi bi-arrow-left-circle"></i>
      <i v-else class="bi bi-arrow-left-circle-fill"></i>
    </button>
    <button class="pagination-btn" :class="{ active: currentPage }" @click="setPage(currentPage)">
      {{ currentPage }}
    </button>
    <button class="pagination-btn" :disabled="currentPage === totalPages" @click="setPage(currentPage + 1)">
      <i v-if="currentPage === totalPages" class="bi bi-arrow-right-circle"></i>
      <i v-else class="bi bi-arrow-right-circle-fill"></i>
    </button>
  </div>
</template>

<script lang="ts">
export default {
  props: ["currentPage", "totalPages"],
  methods: {
    setPage(page: number) {
      if (page > 0 && page <= this.totalPages) {
        this.$emit("setPage", page);
      }
    },
  },
};
</script>
<style scoped>
.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
  position: relative;
  bottom: 0;
  left: 0;
  width: 100%;
  text-align: center;
}

.pagination-btn {
  margin: 0 5px;
  background-color: transparent;
  padding: 2.5px 5px;
  color: black;
  border: none;
  cursor: pointer;
}

.pagination-btn:disabled {
  cursor: not-allowed;
}

.pagination-btn.active {
  background-color: transparent;
}

i {
  font-size: x-small;
}
</style>
