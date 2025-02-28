<template>
  <div class="d-flex justify-content-center align-items-center px-3" style="height: 80vh;">
    <div class="bg-white border rounded-3 shadow p-4 max-w-500">
      <h3 class="text-center">Register as Candidate</h3>
      <div class="text-center mb-3">
        <p class="fs-5 mb-2">Do you want to register as a candidate?</p>
        <input type="checkbox" id="registerAsCandidate" v-model="isCandidate" class="form-check-input"
          style="width: 25px; height: 25px;" />
      </div>
      <div v-if="isCandidate" class="text-center mb-3">
        <label for="fileUpload" class="fs-5 me-2">Upload Your Profile photo:</label>
        <input type="file" id="fileUpload" @change="onFileChange" accept=".jpg, .jpeg, .png, .pdf"
          class="form-control" />
      </div>
      <div class="text-center">
        <button class="btn btn-primary fs-5 px-4 py-2" @click="submitForm">Submit</button>
      </div>
    </div>
    <Modal v-if="showModal" :visible="showModal" :title="modalTitle" :message="modalMessage" buttonClass="btn-success"
      @onClose="closeModal" />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import Modal from '../Voter/VoterModel.vue';
import { apiService } from '../../Services/ApiService';
import { uploadImage } from '../../Services/FirebaseHelper';
import { useDetailsUserStore } from '@/stores/userDetailsStore';

const userDetailsStore = useDetailsUserStore();
const isCandidate = ref(false);
const showModal = ref(false);
const modalTitle = ref('');
const modalMessage = ref('');

interface RegistrationData {
  fullName: string;
  dateOfBirth: string;
  email: string;
  password: string;
  confirmPassword: string;
  gender: string;
  address: string;
  stateId: number;
  constituencyId: number;
  phoneNumber: number;
  aadharNumber: number;
  identityProofUrl: string;
  profileImageUrl: string;
  roleId: number;
  voterId: string;
}

const registrationData = reactive<RegistrationData>({
  fullName: '',
  dateOfBirth: '',
  email: '',
  password: '',
  confirmPassword: '',
  gender: '',
  address: '',
  stateId: 0,
  constituencyId: 0,
  phoneNumber: 0,
  aadharNumber: 0,
  identityProofUrl: '',
  profileImageUrl: '',
  roleId: 2,
  voterId: ''
});
const onFileChange = async (event: Event) => {
  const fileInput = event.target as HTMLInputElement;
  if (fileInput && fileInput.files && fileInput.files[0]) {
    try {
      const uploadedUrl = await uploadImage(fileInput.files[0], 'profileImage');
      if (uploadedUrl) {
        registrationData.profileImageUrl = uploadedUrl;
      } else {
        modalTitle.value = 'Error';
        modalMessage.value = 'Failed to upload image. Please try again.';
        showModal.value = true;
      }
    } catch (error) {
      modalTitle.value = 'Error';
      modalMessage.value = 'Error uploading profile image. Please try again later.';
      showModal.value = true;
    }
  }
};

const submitForm = async () => {
  if (!isCandidate.value) {
    modalTitle.value = 'Alert';
    modalMessage.value = 'Please check the box to register as a candidate.';
    showModal.value = true;
    return;
  }

  const userDetails = userDetailsStore.userDetails
  if (userDetails) {
    Object.assign(registrationData, {
      fullName: userDetailsStore.userDetails.fullName,
      dateOfBirth: userDetailsStore.userDetails.dateOfBirth,
      email: userDetailsStore.userDetails.email,
      gender: userDetailsStore.userDetails.gender,
      address: userDetailsStore.userDetails.address,
      stateId: userDetailsStore.userDetails.stateId,
      constituencyId: userDetailsStore.userDetails.constituencyId,
      phoneNumber: userDetailsStore.userDetails.phoneNumber,
      aadharNumber: userDetailsStore.userDetails.aadharNumber,
      identityProofUrl: userDetailsStore.userDetails.identityProofUrl || registrationData.identityProofUrl,
      profileImageUrl: registrationData.profileImageUrl,
      roleId: 2,
      voterId: userDetailsStore.userDetails.voterId
    });
    if (!registrationData.identityProofUrl) {
      modalTitle.value = 'Alert';
      modalMessage.value = 'Please upload a valid identity proof.';
      showModal.value = true;
      return;
    }

    try {
      const response = await apiService.postRegistration({ ...registrationData });

      if (response.success) {
        modalTitle.value = 'Registration Successful';
        modalMessage.value = response.message;
        resetForm();
      } else {
        modalTitle.value = 'Registration Failed';
        modalMessage.value = response.message;
      }
      showModal.value = true;
    } catch (error) {
      modalTitle.value = 'Error';
      modalMessage.value = 'An error occurred during registration. Please try again later.';
      showModal.value = true;
    }
  } else {
    modalTitle.value = 'Alert';
    modalMessage.value = 'No user details found. Please log in again.';
    showModal.value = true;
  }
};

const resetForm = () => {
  isCandidate.value = false;
  registrationData.identityProofUrl = '';
  const fileInput = document.getElementById('fileUpload') as HTMLInputElement;
  if (fileInput) fileInput.value = '';
};

const closeModal = () => {
  showModal.value = false;
};

onMounted(async () => {
  await userDetailsStore.getLoginDetails();
  if (userDetailsStore.userId) {
    await userDetailsStore.fetchUserDetails();
  }
});
</script>