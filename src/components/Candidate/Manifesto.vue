<template>
  <div class="container mt-4">
    <div v-if="loading" class="text-center">Loading elections...</div>
    <div v-if="!loading && elections.length">
      <div class="row justify-content-center">
        <div
          class="col-md-4 mb-4"
          v-for="election in paginatedManifestoCards"
          :key="election.manifestoId"
        >
          <div class="card h-100 shadow">
            <div class="card-body">
              <h6 class="card-title">
                {{ election.electionName }} - {{ election.constituencies }}
              </h6>
              <p class="text-muted small">
                {{ formatElectionDate(election.electionDate) }}
              </p>
              <p class="card-text">
                {{
                  election.showMore
                    ? election.manifesto
                    : election.manifesto.slice(0, 500) + "..."
                }}
              </p>
              <button
                v-if="election.manifesto.length > 500"
                class="btn btn-link p-0"
                @click="toggleReadMore(election)"
              >
                {{ election.showMore ? "Read Less" : "Read More" }}
                <i
                  :class="
                    election.showMore
                      ? 'bi bi-chevron-compact-up'
                      : 'bi bi-chevron-compact-down'
                  "
                ></i>
              </button>
              <button
                class="btn btn-primary btn-sm mt-2"
                @click="editManifesto(election)"
              >
                Edit
              </button>
            </div>
          </div>
        </div>
      </div>
      <div class="d-flex justify-content-center mt-5 p-4">
        <Pagination
          :currentPage="currentPage"
          :totalPages="totalPages"
          @setPage="setPage"
        />
      </div>
    </div>
    <div v-if="!loading && !elections.length" class="text-center">
      No manifestos available.
    </div>
    <dialog v-if="showForm" class="modal fade show d-block" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              {{ isEditMode ? "Edit Manifesto" : "Add New Manifesto" }}
            </h5>
            <button type="button" class="btn-close" @click="toggleForm"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="submitManifesto">
              <div v-if="!isEditMode" class="mb-3">
                <label for="election" class="form-label">Select Election:</label>
                <select
                  v-model="form.electionCode"
                  id="election"
                  class="form-select"
                  required
                >
                  <option disabled value="">Select Election</option>
                  <option
                    v-for="upcomingElection in upcomingElections"
                    :value="upcomingElection.id"
                    :key="upcomingElection.id"
                  >
                    {{ upcomingElection.electionName }} -
                    {{ formatElectionDate(upcomingElection.electionDate) }}
                  </option>
                </select>
              </div>
              <div class="mb-3">
                <label for="manifesto" class="form-label">Manifesto:</label>
                <textarea
                  v-model="form.manifesto"
                  id="manifesto"
                  class="form-control"
                  rows="4"
                  required
                ></textarea>
              </div>
              <button type="submit" class="btn btn-primary">
                {{ isEditMode ? "Save Changes" : "Add Manifesto" }}
              </button>
            </form>
          </div>
        </div>
      </div>
    </dialog>
    <button
      class="btn btn-primary rounded-circle position-fixed bottom-0 end-0 me-4 mb-4"
      @click="toggleForm"
    >
      <i class="bi bi-plus fs-4"></i>
    </button>
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
.position-fixed {
  z-index: 1050;
}
</style>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import axios from "axios";
import Modal from "../Modal.vue";
import Pagination from "../CommonComponents/Pagination.vue";
import { useCandidateStore } from "@/Services/Store";
import config from "../../config/apiConfig.json";
import { toast } from "vue3-toastify";
import "vue3-toastify/dist/index.css";

interface ManifestoCard {
  id: number;
  electionCode: number;
  candidateId: number;
  constituencies: string;
  electionName: string;
  electionDate: string;
  manifesto: string;
  manifestoId: number;
  showMore?: boolean;
}

interface Election {
  id: number;
  electionName: string;
  electionDate: string;
}

const elections = ref<ManifestoCard[]>([]);
const upcomingElections = ref<Election[]>([]);
const loading = ref(true);
const showForm = ref(false);
const isEditMode = ref(false);
const form = ref<ManifestoCard>({
  id: 0,
  candidateId: 0,
  electionCode: 0,
  constituencies: "",
  electionName: "",
  electionDate: "",
  manifesto: "",
  manifestoId: 0,
});

const candidateStore = useCandidateStore();
const candidateId = candidateStore.candidateId;
const token = localStorage.getItem("CandidateToken");
const isModalVisible = ref(false);
const modalTitle = ref("");
const modalMessage = ref("");
const currentPage = ref(1);
const itemsPerPage = 2;
const totalPages = computed(() => Math.ceil(elections.value.length / itemsPerPage));
const paginatedManifestoCards = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  return elections.value.slice(start, start + itemsPerPage);
});
const setPage = (page: number) => {
  currentPage.value = page;
};
const fetchManifestos = async () => {
  try {
    const response = await axios.get(
      `${config.baseUrl}${config.endpoints.ManifestoInfoDetails}/${candidateId}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (response.status === 404 || !response.data || response.data.length === 0) {
      elections.value = [];
      return;
    }
    elections.value = response.data;
  } catch (error) {
    modalTitle.value = "Cannot Fetch";
    modalMessage.value = `Error fetching Manifesto: ${error}`;
    isModalVisible.value = true;
  } finally {
    loading.value = false;
  }
};
onMounted(fetchManifestos);
const fetchUpComingElections = async () => {
  try {
    const response = await axios.get(
      `${config.baseUrl}${config.endpoints.UpComingElectionsDetails}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );
    if (response.status === 404 || !response.data || response.data.length === 0) {
      upcomingElections.value = [];
      return;
    }
    upcomingElections.value = response.data;
  } catch (error) {
    modalTitle.value = "Cannot Fetch";
    modalMessage.value = `Error fetching Upcoming Elections: ${error}`;
    isModalVisible.value = true;
  }
};
onMounted(fetchUpComingElections);
const toggleForm = () => {
  showForm.value = !showForm.value;
  if (!showForm.value) resetForm();
};
const toggleReadMore = (election: ManifestoCard) => {
  election.showMore = !election.showMore;
};
const resetForm = () => {
  form.value = {
    id: 0,
    candidateId: 0,
    electionCode: 0,
    constituencies: "",
    electionName: "",
    electionDate: "",
    manifesto: "",
    manifestoId: 0,
  };
  isEditMode.value = false;
};
const formatElectionDate = (dateString: string) => {
  const date = new Date(dateString);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
};
const submitManifesto = async () => {
  try {
    if (isEditMode.value) {
      const payload = {
        Id: form.value.manifestoId,
        manifesto: form.value.manifesto,
        candidateId: form.value.candidateId,
        electionCode: form.value.electionCode,
        nominationId: 0,
      };
      await axios.put(
        `${config.baseUrl}${config.endpoints.ManifestoInfo}/${form.value.manifestoId}`,
        payload,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      modalTitle.value = "Updated";
      modalMessage.value = `Manifesto Updated Successfully`;
    } else {
      const payload = {
        manifesto: form.value.manifesto,
        candidateId: candidateId,
        electionCode: form.value.electionCode,
        nominationId: 0,
      };
      await axios.post(`${config.baseUrl}${config.endpoints.ManifestoInfo}`, payload, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      modalTitle.value = "Added";
      modalMessage.value = `Manifesto added successfully`;
    }
    isModalVisible.value = true;
    toggleForm();
    await fetchManifestos();
  } catch (error) {
    toast.error((error as Error).message, { theme: "dark" });
  }
};
const editManifesto = (election: ManifestoCard) => {
  isEditMode.value = true;
  form.value = { ...election };
  showForm.value = true;
};
</script>
