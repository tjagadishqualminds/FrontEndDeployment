<template>
    <div class="pagination-container d-flex justify-content-center w-100 position-relative bottom-0 text-center">
        <button class="pagination-btn border border-0 bg-transparent" :disabled="currentPage === 1"
            @click="setPage(currentPage - 1)">
            <Icon icon="lucide:circle-chevron-left" width="28" color="#007bff" />
        </button>
        <button class="pagination-btn rounded-circle text-center fw-semibold">
            {{ currentPage }}
        </button>
        <button class="pagination-btn border border-0 bg-transparent" :disabled="currentPage === totalPages"
            @click="setPage(currentPage + 1)">
            <Icon icon="lucide:circle-chevron-right" width="28" color="#007bff" />
        </button>
    </div>
</template>
<script setup lang="ts">
import { defineProps, defineEmits } from 'vue';
import { Icon } from "@iconify/vue"
const props = defineProps(["currentPage", "totalPages"]);
const emit = defineEmits(['setPage']);
const setPage = (page: number) => {
    if (page > 0 && page <= props.totalPages) {
        emit('setPage', page);
    }
};
</script>
<style scoped>
.pagination-btn {
    margin: 0 5px;
    padding: 4px 15px;
    background-color: #007bff;
    color: white;
    border: none;
    cursor: pointer;
}

.pagination-btn:disabled {
    background-color: #d9d9d9;
    cursor: not-allowed;
}

.pagination-btn.active {
    background-color: #0056b3;
}
</style>