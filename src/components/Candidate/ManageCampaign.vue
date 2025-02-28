<template>
  <div class="container-fluid">
    <div class="btn-group mb-4 d-flex mt-3 m-auto" style="width: fit-content">
      <button
        class="btn me-2"
        :class="{
          'btn-primary': activeTab === 'past',
          'btn-light': activeTab !== 'past',
        }"
        @click="activeTab = 'past'"
      >
        Past Meetings
      </button>
      <button
        class="btn me-2"
        :class="{
          'btn-primary': activeTab === 'present',
          'btn-light': activeTab !== 'present',
        }"
        @click="activeTab = 'present'"
      >
        Present Meetings
      </button>
      <button
        class="btn"
        :class="{
          'btn-primary': activeTab === 'upcoming',
          'btn-light': activeTab !== 'upcoming',
        }"
        @click="activeTab = 'upcoming'"
      >
        Upcoming Meetings
      </button>
    </div>
    <div v-if="activeTab === 'past'" class="meetings-tab">
      <h2 class="text-primary text-center mb-4 m-auto">Past Meetings</h2>
      <div class="row d-flex flex-column align-items-center">
        <div
          v-for="meeting in paginatedPastMeetings"
          :key="meeting.id"
          class="col-4 mb-3"
        >
          <div class="card shadow-sm hover-shadow">
            <div class="card-body">
              <h3 class="card-title">{{ meeting.meetingPlace }}</h3>
              <p class="card-text">
                <strong>Date:</strong> {{ formatDate(meeting.meetingDateTime) }}
              </p>
              <p class="card-text"><strong>Agenda:</strong> {{ meeting.description }}</p>
              <p class="card-text">
                <strong>Election Name:</strong> {{ meeting.electionName }}
              </p>
            </div>
          </div>
        </div>
      </div>
      <div v-if="totalPages > 1" class="d-flex justify-content-center mt-4">
        <Pagination
          :currentPage="currentPage"
          :totalPages="totalPages"
          @setPage="setPage"
        />
      </div>
    </div>
    <div v-if="activeTab === 'present'" class="meetings-tab">
      <h2 class="text-primary text-center">Present Meetings</h2>
      <div class="row d-flex flex-column align-items-center">
        <div
          v-for="meeting in paginatedPresentMeetings"
          :key="meeting.id"
          class="col-4 mb-3"
        >
          <div class="card shadow-sm">
            <div class="card-body">
              <div v-if="editingMeetingId === meeting.id">
                <div class="mb-3">
                  <input v-model="meeting.meetingPlace" class="form-control" />
                </div>
                <div class="mb-3">
                  <strong>Date:</strong>
                  <input
                    v-model="meeting.meetingDateTime"
                    type="datetime-local"
                    class="form-control"
                  />
                </div>
                <div class="mb-3">
                  <strong>Agenda:</strong>
                  <textarea v-model="meeting.description" class="form-control"></textarea>
                </div>
                <p class="mb-3">
                  <strong>Election Name:</strong> {{ meeting.electionName }}
                </p>
                <button class="btn btn-success" @click="saveMeeting(meeting)">
                  Save
                </button>
              </div>
              <div v-else>
                <h3 class="card-title">{{ meeting.meetingPlace }}</h3>
                <p class="card-text">
                  <strong>Date:</strong> {{ formatDate(meeting.meetingDateTime) }}
                </p>
                <p class="card-text">
                  <strong>Agenda:</strong> {{ meeting.description }}
                </p>
                <p class="card-text">
                  <strong>Election Name:</strong> {{ meeting.electionName }}
                </p>
                <button class="btn btn-primary" @click="editMeeting(meeting.id)">
                  Edit
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <button class="btn btn-success mt-4 d-flex m-auto" @click="openModal">
        Add New Present Meeting
      </button>
      <div v-if="totalPages > 1" class="d-flex justify-content-center mt-4">
        <Pagination
          :currentPage="currentPage"
          :totalPages="totalPages"
          @setPage="setPage"
        />
      </div>
    </div>

    <div v-if="activeTab === 'upcoming'" class="meetings-tab">
      <h2 class="text-primary text-center mb-4">Upcoming Meetings</h2>
      <div class="row d-flex flex-column align-items-center">
        <div
          v-for="meeting in paginatedUpComingMeetings"
          :key="meeting.id"
          class="col-4 mb-3"
        >
          <div class="card shadow-sm">
            <div class="card-body">
              <div v-if="editingMeetingId === meeting.id">
                <div class="mb-3">
                  <input v-model="meeting.meetingPlace" class="form-control" />
                </div>
                <div class="mb-3">
                  <strong>Date:</strong>
                  <input
                    v-model="meeting.meetingDateTime"
                    type="datetime-local"
                    class="form-control"
                  />
                </div>
                <div class="mb-3">
                  <strong>Agenda:</strong>
                  <textarea v-model="meeting.description" class="form-control"></textarea>
                </div>
                <p class="mb-3">
                  <strong>Election Name:</strong> {{ meeting.electionName }}
                </p>
                <button class="btn btn-success" @click="saveMeeting(meeting)">
                  Save
                </button>
              </div>
              <div v-else>
                <h3 class="card-title">{{ meeting.meetingPlace }}</h3>
                <p class="card-text">
                  <strong>Date:</strong> {{ formatDate(meeting.meetingDateTime) }}
                </p>
                <p class="card-text">
                  <strong>Agenda:</strong> {{ meeting.description }}
                </p>
                <p class="card-text">
                  <strong>Election Name:</strong> {{ meeting.electionName }}
                </p>
                <button class="btn btn-primary" @click="editMeeting(meeting.id)">
                  Edit
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <button class="btn btn-success mt-4 d-flex m-auto" @click="openModal">
        Add New Upcoming Meeting
      </button>
      <div v-if="totalPages > 1" class="d-flex justify-content-center mt-4">
        <Pagination
          :currentPage="currentPage"
          :totalPages="totalPages"
          @setPage="setPage"
        />
      </div>
    </div>
    <div v-if="showModal" class="modal-backdrop" style="z-index: 1040">
      <div class="modal d-block">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content" style="position: relative; bottom: 25vh">
            <div class="modal-header">
              <h2 class="modal-title text-primary">Add New Meeting</h2>
              <button type="button" class="btn-close" @click="closeModal"></button>
            </div>
            <div class="modal-body">
              <form>
                <div class="mb-3">
                  <label for="meeting-date-time" class="form-label">Date and Time:</label>
                  <input
                    type="datetime-local"
                    class="form-control"
                    id="meeting-date-time"
                    v-model="newMeeting.meetingDateTime"
                  />
                </div>

                <div class="mb-3">
                  <label for="meeting-place" class="form-label">Meeting Place:</label>
                  <input
                    type="text"
                    class="form-control"
                    id="meeting-place"
                    v-model="newMeeting.meetingPlace"
                  />
                </div>

                <div class="mb-3">
                  <label for="description" class="form-label">Agenda:</label>
                  <textarea
                    class="form-control"
                    id="description"
                    v-model="newMeeting.description"
                  ></textarea>
                </div>

                <div class="mb-3">
                  <label for="election" class="form-label">Select Election:</label>
                  <select
                    class="form-select"
                    v-model="newMeeting.electionCode"
                    id="election"
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
                <button class="btn btn-success" @click.prevent="saveNewMeeting">
                  Save
                </button>
              </form>
            </div>
          </div>
        </div>
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
<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import axios from "axios";
import Pagination from "../CommonComponents/Pagination.vue";
import config from "../../config/apiConfig.json";
import Modal from "../Modal.vue";
import { useCandidateStore } from "@/Services/Store";
import { toast } from "vue3-toastify";
import "vue3-toastify/dist/index.css";

interface Election {
  id: number;
  electionName: string;
  electionDate: string;
}

interface Meeting {
  id: number;
  candidateId: number;
  meetingDateTime: string;
  meetingPlace: string;
  description: string;
  electionCode: number;
  electionName: string;
}

const meetings = ref<Meeting[]>([]);
const pastMeetings = ref<Meeting[]>([]);
const presentMeetings = ref<Meeting[]>([]);
const upcomingMeetings = ref<Meeting[]>([]);
const activeTab = ref<"past" | "present" | "upcoming">("past");
const editingMeetingId = ref<number | null>(null);
const showModal = ref(false);
const isModalVisible = ref<boolean>(false);
const modalTitle = ref<string>("");
const modalMessage = ref<string>("");
const candidateStore = useCandidateStore();
const candidateId = candidateStore.candidateId;
const token = localStorage.getItem("CandidateToken");
const upcomingElections = ref<Election[]>([]);
const currentPage = ref(1);
const itemsPerPage = 2;

const newMeeting = ref({
  candidateId,
  meetingDateTime: "",
  meetingPlace: "",
  description: "",
  electionCode: 0,
});

const totalPages = computed(() => {
  let meetingCount;
  if (activeTab.value === "past") {
    meetingCount = pastMeetings.value.length;
  } else if (activeTab.value === "present") {
    meetingCount = presentMeetings.value.length;
  } else {
    meetingCount = upcomingMeetings.value.length;
  }
  return Math.ceil(meetingCount / itemsPerPage);
});
const paginatedPastMeetings = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  return pastMeetings.value.slice(start, start + itemsPerPage);
});

const paginatedUpComingMeetings = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  return upcomingMeetings.value.slice(start, start + itemsPerPage);
});

const paginatedPresentMeetings = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  return presentMeetings.value.slice(start, start + itemsPerPage);
});

watch(activeTab, () => {
  currentPage.value = 1;
});

const filterMeetings = () => {
  const now = new Date();
  pastMeetings.value = meetings.value.filter(
    (meeting) => new Date(meeting.meetingDateTime) < now
  );
  presentMeetings.value = meetings.value.filter((meeting) => {
    const meetingDate = new Date(meeting.meetingDateTime);
    return meetingDate.toDateString() === now.toDateString();
  });
  upcomingMeetings.value = meetings.value.filter((meeting) => {
    const meetingDate = new Date(meeting.meetingDateTime);
    return meetingDate.getDate() > now.getDate();
  });
};

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
    upcomingElections.value = response.data;
  } catch (error) {
    toast.error((error as Error).message, { theme: "dark" });
  }
};

const setPage = (page: number) => {
  currentPage.value = page;
};

const openModal = async () => {
  showModal.value = true;
  await fetchUpComingElections();
};

const closeModal = () => {
  showModal.value = false;
  newMeeting.value = {
    candidateId: 0,
    meetingDateTime: "",
    meetingPlace: "",
    description: "",
    electionCode: 0,
  };
};

const saveNewMeeting = () => {
  axios
    .post(`${config.baseUrl}${config.endpoints.CampaignInfo}`, newMeeting.value, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
    .then((response) => {
      if (activeTab.value === "present") {
        presentMeetings.value.push(response.data);
      } else {
        upcomingMeetings.value.push(response.data);
      }
      const selectedElection = upcomingElections.value.find(
        (election) => election.id === response.data.electionCode
      );
      if (selectedElection) {
        response.data.electionName = selectedElection.electionName;
      }
      closeModal();
    })
    .catch((error) => {
      toast.error((error as Error).message, { theme: "dark" });
    });
};

const editMeeting = (meetingId: number) => {
  editingMeetingId.value = meetingId;
};

const saveMeeting = (meeting: Meeting) => {
  editingMeetingId.value = null;
  axios
    .put(`${config.baseUrl}${config.endpoints.CampaignInfo}/${meeting.id}`, meeting, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
    .then(() => {
      modalTitle.value = "Update Successful";
      modalMessage.value = "Updated the meeting details successfully";
      isModalVisible.value = true;
    })
    .catch((error) => {
      modalTitle.value = "Cannot Update";
      modalMessage.value = `Error Updating the meeting ${error}`;
      isModalVisible.value = true;
    });
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString() + " " + date.toLocaleTimeString();
};

const formatElectionDate = (dateString: string) => {
  const date = new Date(dateString);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
};

onMounted(() => {
  axios
    .get(`${config.baseUrl}${config.endpoints.CampaignInfo}/${candidateId}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
    .then((response) => {
      meetings.value = response.data;
      filterMeetings();
    })
    .catch((error) => {
      toast.error((error as Error).message, { theme: "dark" });
    });
});
</script>
<style scoped>
.hover-shadow:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2) !important;
  transition: all 0.3s ease;
}

.modal {
  display: flex !important;
  align-items: center;
  justify-content: center;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1040;
}

.modal-dialog {
  margin: 0;
  max-width: 600px;
}

.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
}
</style>
