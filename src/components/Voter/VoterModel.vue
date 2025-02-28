<template>
  <dialog v-if="visible" class="modal" style="display: block; background-color: rgba(0, 0, 0, 0.5)">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">{{ title }}</h5>
          <button type="button" class="close" @click="emitClose" aria-label="Close">
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
        <div class="modal-body">
          <p>{{ message }}</p>
        </div>
        <div class="modal-footer">
          <button type="button" :class="buttonClass" @click="emitClose">Close</button>
        </div>
      </div>
    </div>
  </dialog>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue'

defineProps({
  visible: Boolean,
  title: String,
  message: String,
  buttonClass: String
})

const emit = defineEmits(['onClose'])

function emitClose() {
  emit('onClose')
}
</script>

<style>
.modal {
  display: flex;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1050;
  background-color: rgba(0, 0, 0, 0.5);
  justify-content: center;
  align-items: center;
}

.modal-dialog {
  width: 100%;
  max-width: 500px;
  top: 30%;
  position: relative;
  height: auto;
}

.modal-content {
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  padding: 20px;
  width: 100%;
  transition: all 0.3s ease-in-out;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #ddd;
  width: 100%;
}

.modal-title {
  font-size: 1.25rem;
  font-weight: bold;
}

.close {
  cursor: pointer;
  font-size: 1.5rem;
  color: #555;
  border: none;
  background: none;
}

.close:hover {
  color: red;
}

.modal-body {
  margin-top: 10px;
  font-size: 1rem;
  line-height: 1.5;
  color: #333;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  padding-top: 10px;
  border-top: 1px solid #ddd;
  width: 100%;
}

.modal-footer button {
  padding: 8px 15px;
  font-size: 1rem;
  border-radius: 5px;
  border: none;
  background-color: red;
  color: white;
  cursor: pointer;
}

.modal-footer button:hover {
  background-color: darkred;
}

.text-danger {
  color: #dc3545;
}

.text-success {
  color: #28a745;
}

#successMessage {
  margin-top: 10px;
  color: green;
  text-align: center;
  font-size: 1rem;
}

#RegistrationForm label {
  font-size: 0.9rem;
  margin-bottom: 5px;
  display: inline-block;
}

#RegistrationForm input::placeholder {
  font-size: 0.85rem;
}
</style>
