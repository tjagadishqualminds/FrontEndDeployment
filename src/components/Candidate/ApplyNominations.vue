<template>
  <div class="container">
    <h5 class="text-center pt-5 mb-4">Apply MLA Nomination</h5>
    <div class="card mx-auto" style="max-width: 500px">
      <div class="card-body">
        <form @submit.prevent="onRegister">
          <div class="form-group row mb-3">
            <label for="Party" class="col-sm-4 col-form-label">Party Name:</label>
            <div class="col-sm-8">
              <select
                v-model.number="ApplyNominationsData.PartyId"
                id="Party"
                class="form-control form-control-sm"
              >
                <option value="0" disabled>Select your Party</option>
                <option v-for="party in parties" :key="party.id" :value="party.id">
                  {{ party.name }}
                </option>
              </select>
            </div>
          </div>
          <div class="form-group row mb-3">
            <label for="state" class="col-sm-4 col-form-label">State:</label>
            <div class="col-sm-8">
              <select
                v-model.number="ApplyNominationsData.stateId"
                id="state"
                class="form-control form-control-sm"
                @change="selectState(ApplyNominationsData.stateId)"
              >
                <option value="0" disabled>Select your state</option>
                <option v-for="state in states" :key="state.id" :value="state.id">
                  {{ state.name }}
                </option>
              </select>
            </div>
          </div>
          <div class="form-group row mb-3">
            <label for="constituency" class="col-sm-4 col-form-label"
              >Constituency:</label
            >
            <div class="col-sm-8">
              <select
                v-model.number="ApplyNominationsData.constituencyId"
                id="constituency"
                class="form-control form-control-sm"
                :disabled="isConstituencyDisabled"
              >
                <option value="0" disabled>Select your constituency</option>
                <option
                  v-for="constituency in constituencies"
                  :key="constituency.id"
                  :value="constituency.id"
                >
                  {{ constituency.name }}
                </option>
              </select>
            </div>
          </div>
          <div class="form-group row mb-3">
            <label class="col-sm-4 col-form-label" for="photo">Photo:</label>
            <div class="col-sm-8">
              <input
                type="file"
                class="form-control form-control-sm"
                @change="handlePhotoChange"
                accept=".jpg, .jpeg, .png"
              />
            </div>
          </div>

          <div class="form-group row mb-3">
            <label class="col-sm-4 col-form-label" for="form">Affidavit Form:</label>
            <div class="col-sm-8">
              <input
                type="file"
                class="form-control form-control-sm"
                @change="handleAffidavitFormChange"
                accept=".pdf"
              />
            </div>
          </div>

          <div class="mb-3">
            <PaymentButton
              @payment-success="onPaymentSuccess"
              :prefill="{
                name: userDetails.name,
                email: userDetails.email,
                contact: userDetails.contact,
              }"
            />
          </div>

          <div class="d-flex justify-content-center">
            <button
              type="submit"
              class="btn btn-success btn-block"
              :disabled="!isPaymentSuccessful"
            >
              <div class="loading-indicator" v-if="loading">
                <output class="spinner-border text-primary">
                  <span class="sr-only">Loading...</span>
                </output>
              </div>
              <span v-else>Submit</span>
            </button>
          </div>
        </form>
      </div>
    </div>
    <Modal
      v-if="isModalVisible"
      :title="modalTitle"
      :message="modalMessage"
      :showModal="isModalVisible"
      @close="isModalVisible = false"
    />
  </div>
</template>

<style scoped>
.loading-indicator {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(255, 255, 255, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.spinner-border {
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-top: 4px solid #3498db;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}
</style>
<script setup lang="ts">
import { ref, reactive, onMounted, watch, defineComponent } from "vue";
import axios from "axios";
import { apiService } from "../../Services/ApiService";
import { useRoute, useRouter } from "vue-router";
import { ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../../config/firebaseConfig";
import config from "../../config/apiConfig.json";
import PaymentButton from "./PaymentButton.vue";
import Modal from "../Modal.vue";

interface ApplyNominationsData {
  PartyId: number;
  stateId: number;
  constituencyId: number;
  Photo: File | null;
  AffidavitForm: File | null;
  PaymentTransactionId: string;
  errors: {};
}

interface Party {
  id: number;
  name: string;
}

interface State {
  id: number;
  name: string;
}

interface Constituency {
  id: number;
  name: string;
}

const ApplyNominationsData = reactive<ApplyNominationsData>({
  PartyId: 0,
  stateId: 0,
  constituencyId: 0,
  Photo: null,
  AffidavitForm: null,
  PaymentTransactionId: "",
  errors: {},
});
const loading = ref(false);
const parties = ref<Party[]>([]);
const states = ref<State[]>([]);
const constituencies = ref<Constituency[]>([]);
const isConstituencyDisabled = ref(true);
const isPaymentSuccessful = ref(false);
const isModalVisible = ref<boolean>(false);
const modalTitle = ref<string>("");
const modalMessage = ref<string>("");
const token = localStorage.getItem("token");
const userDetails = reactive({
  name: "",
  email: "",
  contact: "",
});
const router = useRouter();

async function fetchUserDetails() {
  const token = localStorage.getItem("CandidateToken");
  try {
    const response = await axios.get(
      `/${parseInt(route.params.candidateId as string)}/userdetails`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    userDetails.name = response.data.fullName;
    userDetails.email = response.data.email;
    userDetails.contact = response.data.phoneNumber;
  } catch (error) {
    modalTitle.value = "Cannot Fetch User Details";
    modalMessage.value = `Error fetching user details: ${error}`;
    isModalVisible.value = true;
  }
}
async function uploadFileToFirebase(file: any, type: string) {
  const fileRef = storageRef(
    storage,
    `Nominations/${route.params.candidateId as string}/${type}`
  );
  await uploadBytes(fileRef, file);
  return getDownloadURL(fileRef);
}
async function fetchParties() {
  try {
    const response = await apiService.getParties();
    parties.value = response;
  } catch (error) {
    modalTitle.value = "Cannot Fetch";
    modalMessage.value = `Error fetching Parties ${error}`;
    isModalVisible.value = true;
  }
}

async function fetchStates() {
  try {
    const response = await apiService.getStates();
    states.value = response;
  } catch (error) {
    modalTitle.value = "Cannot Fetch";
    modalMessage.value = `Error fetching states ${error}`;
    isModalVisible.value = true;
  }
}

async function fetchConstituencies(stateId: number) {
  try {
    const response = await apiService.getConstituencies(stateId);
    constituencies.value = response;
    isConstituencyDisabled.value = false;
  } catch (error) {
    modalTitle.value = "Cannot Fetch";
    modalMessage.value = `Error fetching constituencies: ${error}`;
    isModalVisible.value = true;
  }
}

function selectState(stateId: number) {
  ApplyNominationsData.constituencyId = 0;
  fetchConstituencies(stateId);
}

const route = useRoute();
onMounted(async () => {
  await fetchParties();
  await fetchStates();
  await fetchUserDetails();
});

function handlePhotoChange(event: Event) {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files.length > 0) {
    ApplyNominationsData.Photo = target.files[0];
  }
}

function handleAffidavitFormChange(event: Event) {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files.length > 0) {
    ApplyNominationsData.AffidavitForm = target.files[0];
  }
}
async function onRegister() {
  if (
    !ApplyNominationsData.PartyId ||
    !ApplyNominationsData.stateId ||
    !ApplyNominationsData.constituencyId
  ) {
    ApplyNominationsData.errors = {
      PartyId: !ApplyNominationsData.PartyId ? "Party is required" : "",
      stateId: !ApplyNominationsData.stateId ? "State is required" : "",
      constituencyId: !ApplyNominationsData.constituencyId
        ? "Constituency is required"
        : "",
    };
    return;
  }
  loading.value = true;
  const candidateId = parseInt(route.params.candidateId as string);
  const electionCode = parseInt(route.params.electionCode as string);
  const photoUrl = ApplyNominationsData.Photo
    ? await uploadFileToFirebase(ApplyNominationsData.Photo, "photo")
    : null;
  const affidavitFormUrl = ApplyNominationsData.AffidavitForm
    ? await uploadFileToFirebase(ApplyNominationsData.AffidavitForm, "affidavit")
    : null;
  const nominationData = {
    PartyId: ApplyNominationsData.PartyId,
    StateId: ApplyNominationsData.stateId,
    ConstituencyId: ApplyNominationsData.constituencyId,
    Photo: photoUrl,
    AffidavitForm: affidavitFormUrl,
    CandidateId: candidateId,
    ElectionCode: electionCode,
    PaymentTransactionId: ApplyNominationsData.PaymentTransactionId,
    PaymentStatus: true,
    AppliedDate: new Date().toISOString(),
  };
  const goBack = () => {
    router.push(`/candidate/nominations`);
  };

  await axios
    .post(`${config.baseUrl}${config.endpoints.Nominations}`, nominationData, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
    .then((response) => {
      modalTitle.value = "Success";
      modalMessage.value = `Your Nomination has been  submitted successfully!`;
      isModalVisible.value = true;
    })
    .catch((error) => {
      modalTitle.value = "Cannot Submit";
      modalMessage.value = `Error submitting nomination ${error}`;
      isModalVisible.value = true;
    });
  watch(isModalVisible, (newValue) => {
    if (!newValue) {
      goBack();
    }
  });
}

function onPaymentSuccess(paymentId: string) {
  isPaymentSuccessful.value = true;
  ApplyNominationsData.PaymentTransactionId = paymentId;
}

defineComponent({
  props: {
    candidateId: {
      type: String,
      required: true,
    },
    electionCode: {
      type: String,
      required: true,
    },
  },
});
</script>
