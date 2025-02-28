<template>
  <div id="resetPassword" class="d-flex justify-content-center align-items-center vh-100 bg-white">
    <div class="container border border-dark shadow-lg p-4 bg-white" style="max-width: 500px;">
      <div class="d-flex justify-content-end">
        <button @click="closeForm" class="btn-close" aria-label="Close"></button>
      </div>
      <form @submit.prevent="onResetPassword">
        <h2 class="text-center mb-4">Reset Password</h2>
        <div>
          <div class="mb-3">
            <label for="password" class="form-label">New Password:</label>
            <div class="input-group">
              <input v-model="resetPasswordData.password" :type="showPassword ? 'text' : 'password'" id="password"
                placeholder="Enter new password" @focus="showPasswordConditions = true"
                @blur="showPasswordConditions = false" @input="validatePassword" class="form-control" />
              <button class="btn btn-outline-secondary" type="button" @click="showPassword = !showPassword">
                <i :class="showPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
              </button>
            </div>
            <div v-if="showPasswordConditions" class="mt-2">
              <div :class="passwordConditions.length ? 'text-success' : 'text-danger'">
                <i class="bi" :class="passwordConditions.length ? 'bi-check-circle' : 'bi-x-circle'"></i>
                At least 8 characters
              </div>
              <div :class="passwordConditions.uppercase ? 'text-success' : 'text-danger'">
                <i class="bi" :class="passwordConditions.uppercase ? 'bi-check-circle' : 'bi-x-circle'"></i>
                Contains an uppercase letter
              </div>
              <div :class="passwordConditions.lowercase ? 'text-success' : 'text-danger'">
                <i class="bi" :class="passwordConditions.lowercase ? 'bi-check-circle' : 'bi-x-circle'"></i>
                Contains a lowercase letter
              </div>
              <div :class="passwordConditions.number ? 'text-success' : 'text-danger'">
                <i class="bi" :class="passwordConditions.number ? 'bi-check-circle' : 'bi-x-circle'"></i>
                Contains a number
              </div>
              <div :class="passwordConditions.specialCharacter ? 'text-success' : 'text-danger'">
                <i class="bi" :class="passwordConditions.specialCharacter ? 'bi-check-circle' : 'bi-x-circle'"></i>
                Contains a special character
              </div>
            </div>
          </div>

          <div class="mb-3">
            <label for="confirmPassword" class="form-label">Confirm New Password:</label>
            <div class="input-group">
              <input v-model="resetPasswordData.confirmPassword" :type="showConfirmPassword ? 'text' : 'password'"
                id="confirmPassword" placeholder="Confirm new password" @focus="showConfirmPasswordValidation = true"
                @blur="showConfirmPasswordValidation = false" @input="validateConfirmPassword" class="form-control" />
              <button class="btn btn-outline-secondary" type="button"
                @click="showConfirmPassword = !showConfirmPassword">
                <i :class="showConfirmPassword ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
              </button>
            </div>
            <div v-if="showConfirmPasswordValidation" class="mt-2">
              <span :class="passwordsMatch ? 'text-success' : 'text-danger'">
                <i class="bi" :class="passwordsMatch ? 'bi-check-circle' : 'bi-x-circle'"></i>
                {{ passwordsMatch ? 'Passwords match' : 'Passwords do not match' }}
              </span>
            </div>
          </div>

          <div class="d-flex justify-content-center mt-4">
            <button type="submit" class="btn btn-primary me-2">Submit</button>
          </div>
        </div>
      </form>
    </div>

    <ModalComponent :title="modalState.title" :message="modalState.message" :showModal="modalState.showModal"
      @close="closeModal" />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { validatePassword as validatePasswordFn } from '../Services/ValidatePassword';
import { apiService } from '@/Services/ApiService';
import ModalComponent from './Modal.vue';
import { useRouter } from 'vue-router';
import { modalService } from '@/Services/ModalService';

interface ResetPasswordData {
  email: string;
  password: string;
  confirmPassword: string;
  errors: ResetPasswordErrors;
}

interface ResetPasswordErrors {
  email?: string;
  password?: string | { [key: string]: boolean };
  confirmPassword?: string;
}

const resetPasswordData = reactive<ResetPasswordData>({
  email: '',
  password: '',
  confirmPassword: '',
  errors: {}
});

const showPasswordConditions = ref(false);
const showConfirmPasswordValidation = ref(false);
const router = useRouter();
const showPassword = ref(false);
const showConfirmPassword = ref(false);
const modalState = modalService.getModalState();
const passwordConditions = reactive({
  length: false,
  uppercase: false,
  lowercase: false,
  number: false,
  specialCharacter: false
});
const passwordsMatch = ref(false);

async function onResetPassword() {
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token') || '';
  const decodedToken = decodeURIComponent(token.replace(/\s/g, '+'));

  if (!resetPasswordData.password || !resetPasswordData.confirmPassword) {
    resetPasswordData.errors.password = resetPasswordData.password
      ? ''
      : 'Password is required';
    resetPasswordData.errors.confirmPassword = resetPasswordData.confirmPassword
      ? ''
      : 'Confirm password is required';
  } else {
    resetPasswordData.errors = {};
    try {
      const message = await apiService.postNewPassword(decodedToken, resetPasswordData.password);
      modalService.show('Success', message, () => {
        router.push('/');
      });
    } catch (error: any) {
      const errorMessage = getErrorMessage(error.message);
      modalService.show('Error', errorMessage);
      resetFormState();
    }
  }
}

function resetFormState() {
  resetPasswordData.password = '';
  resetPasswordData.confirmPassword = '';
  passwordsMatch.value = false;
  Object.assign(passwordConditions, {
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    specialCharacter: false
  });
}

function getErrorMessage(errorMessage: string): string {
  switch (errorMessage) {
    case 'Reset link expired.':
      return 'The reset link has expired. Please request a new one.';
    case 'This link has already been used.':
      return 'This reset link has already been used. Please request a new one.';
    case 'Password must be different from previous passwords.':
      return 'Password must be different from previous passwords.';
    default:
      return errorMessage || 'Failed to reset password. Please try again.';
  }
}

function validatePassword() {
  const result = validatePasswordFn(resetPasswordData.password);
  Object.assign(passwordConditions, result);
  resetPasswordData.errors.password = result.length
    ? undefined
    : 'Password must be at least 8 characters long.';
}

function validateConfirmPassword() {
  passwordsMatch.value =
    resetPasswordData.password === resetPasswordData.confirmPassword;
  resetPasswordData.errors.confirmPassword = passwordsMatch.value
    ? undefined
    : 'Passwords do not match';
}

function closeModal() {
  modalService.close();
  if (modalState.title === 'Success') {
    router.push('/');
  }
}

function closeForm() {
  router.push('/');
}

defineExpose({
  resetPasswordData,
  showPasswordConditions,
  showConfirmPasswordValidation,
  passwordConditions,
  passwordsMatch,
  onResetPassword,
  validatePassword,
  validateConfirmPassword,
  closeModal
});
</script>
