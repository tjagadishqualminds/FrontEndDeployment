<template>
  <div>
    <Navbar :nav-items="landingData" :dropdown-items="dropdownData" :logo="logo" :navdropdown-items="navdropdownData"
      :logo-url="logoUrl" />
    <div id="forgotPassword" class="d-flex justify-content-center align-items-center vh-100 bg-light">
      <div class="forgotPasswordContainer border border-dark w-100 max-w-500 p-4 shadow bg-white position-relative">
        <button class="closeBtn btn-close position-absolute top-0 end-0 m-2" @click="closeForgotPassword"></button>
        <form @submit.prevent="onReset">
          <div id="forgotPasswordForm" class="d-flex flex-column">
            <h2 class="text-center mb-4">Forgot Password</h2>
            <div class="form-group mb-3">
              <label for="emailOrId" class="form-label fw-bold">{{ labelText }}</label>
              <input v-model="emailOrId" type="text" id="emailOrId" :placeholder="'Enter your ' + labelText"
                class="form-control" />
              <div v-if="errors.emailOrId" class="validation text-danger mt-2">
                {{ errors.emailOrId }}
              </div>
            </div>
            <div id="resetButton" class="text-center mb-3">
              <button v-if="!isResendActive" type="submit" class="btn btn-primary px-5 py-2" :disabled="countdown > 0">
                Send
              </button>
              <button v-else type="button" class="btn btn-primary px-5 py-2" :disabled="countdown > 0"
                @click="onResend">
                {{ countdown > 0 ? `Resend` : 'Resend' }}
              </button>
            </div>
          </div>
        </form>
        <div v-if="showMessage" class="message text-center text-success mt-3">
          <p v-if="countdown > 0">
            If you don't receive an email, try resending the link after
            {{ countdown }}s.
          </p>
        </div>
      </div>
    </div>
    <ModalComponent v-if="showModal" :title="modalTitle" :message="modalMessage" :showModal="showModal"
      @close="closeModal" />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue';
import { validateForgotPasswordData, validateCandidateForgotPasswordData } from '../../Services/ForgotPasswordValidation';
import Navbar from '@/components/CommonComponents/CommonNavbar.vue';
import ModalComponent from '../Modal.vue';
import { apiService } from '../../Services/ApiService';
import { useRouter, useRoute } from 'vue-router';
import { Roles } from '../../Constants/Constants';

const logoUrl = "/";

const emailOrId = ref('');
const errors = reactive<{ emailOrId?: string }>({});
const showModal = ref(false);
const modalTitle = ref('');
const modalMessage = ref('');
const router = useRouter();
const route = useRoute();
const showMessage = ref(false);
const countdown = ref(0);
const countdownInterval = ref<ReturnType<typeof setInterval> | null>(null);
const showResend = ref(false);
const isResendActive = ref(false);
const roleId = ref<number>(Roles.Voter);
const labelText = ref('VoterId / Email');
watch(roleId, () => {
  if (roleId.value === Roles.Voter) labelText.value = 'VoterId / Email';
  else if (roleId.value === Roles.Candidate) labelText.value = 'CandidateId / Email';
  else if (roleId.value === Roles.Admin) labelText.value = 'Email';
});

if (route.params.roleId) {
  roleId.value = Number(route.params.roleId);
}

const startCountdown = () => {
  countdown.value = 60;
  showResend.value = true;
  if (countdownInterval.value) clearInterval(countdownInterval.value);
  countdownInterval.value = setInterval(() => {
    if (countdown.value > 0) {
      countdown.value--;
    } else {
      clearInterval(countdownInterval.value as ReturnType<typeof setInterval>);
      countdownInterval.value = null;
      showResend.value = false;
    }
  }, 1000);
};

const showErrorModal = (title: string, message: string) => {
  modalTitle.value = title;
  modalMessage.value = message;
  showModal.value = true;
};

const onReset = async () => {
  errors.emailOrId = '';

  let validationErrors: { emailOrId?: string } = {};
  if (roleId.value === Roles.Voter) {
    const voterValidationErrors = validateForgotPasswordData(emailOrId.value);
    if (voterValidationErrors.voterId) {
      validationErrors.emailOrId = voterValidationErrors.voterId;
    }
  } else if (roleId.value === Roles.Candidate) {
    const candidateValidationErrors = validateCandidateForgotPasswordData(emailOrId.value);
    if (candidateValidationErrors.candidateId) {
      validationErrors.emailOrId = candidateValidationErrors.candidateId;
    }
  } else if (roleId.value === Roles.Admin) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailOrId.value) {
      validationErrors = { emailOrId: 'Email is required.' };
    } else if (!emailRegex.test(emailOrId.value)) {
      validationErrors = { emailOrId: 'Invalid Email (please enter a valid email address).' };
    }
  }

  if (Object.keys(validationErrors).length > 0) {
    errors.emailOrId = validationErrors.emailOrId || '';
    return;
  }
  try {
    await apiService.postPasswordResetlink({
      emailOrId: emailOrId.value,
      roleId: roleId.value,
    });
    showMessage.value = true;
    startCountdown();
    isResendActive.value = true;
    startCountdown();
  } catch (error) {
    showErrorModal('Error', 'Please enter valid details.');
    emailOrId.value = '';
  }
};

const onResend = async () => {
  errors.emailOrId = '';
  if (!emailOrId.value) {
    errors.emailOrId = 'Please provide the email or ID.';
    return;
  }
  try {
    await apiService.postPasswordResetlink({
      emailOrId: emailOrId.value,
      roleId: roleId.value,
    });
    showMessage.value = true;
    startCountdown();
  } catch (error) {
    showErrorModal('Error', 'Failed to resend. Please try again.');
  }
};

function closeModal() {
  showModal.value = false;
  if (modalTitle.value === 'Success') {
    router.push('/');
  }
}

const closeForgotPassword = () => {
  router.push('/');
};

const logo = ref('');
const landingData = reactive([
  {
    NavItemName: "Election Results",
    Url: "/declaredresults"
  },
  {
    NavItemName: "Elections",
    Url: "/elections"
  }
]);
const dropdownData = reactive([
  { NavItemName: 'Login as Voter', Url: '/forgotpassword/1' },
  { NavItemName: 'Login as Candidate', Url: '/forgot-password/2' },
  { NavItemName: 'Login as Admin', Url: '/forgot-password/3' },
]);
const navdropdownData = reactive([...landingData, ...dropdownData]);
</script>

<style scoped>
.max-w-500 {
  max-width: 500px;
}
</style>
