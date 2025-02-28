<template>
  <div v-if="showModal" class="modal-overlay">
    <div class="modal-content">
      <h3>{{ title }}</h3>
      <p>{{ message }}</p>
      <button @click="closeModal" class="btn btn-primary">OK</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from "vue";
defineProps<{
  title: string;
  message: string;
  showModal: boolean;
}>();
const emit = defineEmits<(event: "close") => void>();
const closeModal = () => {
  emit("close");
};
</script>


<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

button {
  width: 15%;
  margin-left: 43%;
}

.modal-content {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  text-align: center;
  width: 50%;
}
</style>
