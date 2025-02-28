<template>
    <div>
        <div class="arrow-button mt-3">
            <router-link :to="route">
                <Icon icon="lucide:circle-arrow-left" width="24" color="black" />
            </router-link>
        </div>
        <section class="mt-3" style="background-color: #eee;">
            <div class="container p-5">
                <div class="d-flex justify-content-center gap-3">
                    <div class="col-lg-5">
                        <div class="card mb-4">
                            <div class="card-body text-center">
                                <img :src="userRoleDetails.avatarUrl" alt="avatar" class="rounded-circle img-fluid"
                                    style="width: 150px;" />
                                <h5 class="my-3">
                                    {{ isEditMode ? editableFields.fullName : userDetails.fullName }}
                                </h5>
                                <p class="text-muted mb-1 voterrole">
                                    <span class="fw-bold m-lg-1">VoterId:</span>{{ userRoleDetails.voterId }}
                                </p>
                                <p class="text-muted mb-1" v-if="userRoleDetails.candidateId">
                                    <span class="fw-bold m-lg-1">CandidateId:</span>{{ userRoleDetails.candidateId }}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div class="col-lg-8">
                        <div class="card mb-1">
                            <div class="card-body">
                                <div class="d-flex flex-column align-items-baseline gap-3">
                                    <div v-for="(value, key) in editableFieldsToShow" :key="key">
                                        <div class="d-flex justify-content-center align-items-start gap-2">
                                            <div class="mb-0">{{ formatLabel(key) }}</div><span>:</span>
                                            <template
                                                v-if="key === 'aadharNumber' || key === 'email' || key === 'gender' || key === 'dateOfBirth'">
                                                <div class="text-muted mb-0">{{ value }}</div>
                                            </template>
                                            <template v-else>
                                                <input v-if="isEditMode"
                                                    :type="key === 'phoneNumber' ? 'number' : 'text'"
                                                    v-model="editableFields[key]" class="form-control"
                                                    @input="handlePhoneNumberInput(key)"
                                                    v-bind="{ value: editableFields[key] || '' }" />

                                                <div v-else class="text-muted mb-0">{{ value }}</div>
                                            </template>
                                        </div>
                                    </div>
                                    <button v-if="isEditMode" @click="updateProfile" class="btn btn-primary">
                                        Save Changes
                                    </button>
                                    <button
                                        :disabled="isEditMode || updateUserCount >= 2 || userRoleDetails.roleId === 3"
                                        @click="toggleEditMode" class="btn btn-secondary">
                                        {{ isEditMode ? 'Cancel' : 'Edit' }}
                                    </button>

                                    <div v-if="phoneNumberError" class="text-danger mt-2">
                                        {{ phoneNumberError }}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { apiService } from '@/Services/ApiService';
import { jwtDecode } from 'jwt-decode';
import { toast } from "vue3-toastify";
import "vue3-toastify/dist/index.css";
import { FIELD_KEYS } from "@/Constants/Constants"
import type { UserDetails } from "@/Constants/Constants";
import { Icon } from "@iconify/vue"
import { previousRoute } from "@/router"
import { useUserStore } from '@/stores/userStore';


const router = useRouter();
const route = ref("previousRoute || '/voter/dashboard'");
const isEditMode = ref(false);
const phoneNumberError = ref<string | false>(false);
const updateUserCount = ref(0);
const userStore = useUserStore();


const userDetails = reactive({
    id: 0,
    fullName: "",
    dateOfBirth: "",
    email: "",
    phoneNumber: "",
    aadharNumber: "",
    address: "",
    gender: "",
});


const editableFields = reactive<typeof userDetails>({ ...userDetails });

const editableFieldsToShow = computed(() => {
    const { id, ...fieldsToShow } = editableFields;
    return fieldsToShow;
});


const userRoleDetails = reactive({
    voterId: "",
    candidateId: "",
    avatarUrl: "",
    roleId: 0
});



const toggleEditMode = () => {
    if (isEditMode.value) {
        Object.assign(editableFields, userDetails);
    }
    isEditMode.value = !isEditMode.value;
};

const formatLabel = (key: string) => {
    return key.split(/(?=[A-Z])/).join(' ').replace(/^\w/, c => c.toUpperCase());
};

const validatePhoneNumber = (phone: string) => {
    if (phone.length !== 10) {
        phoneNumberError.value = "Phone number must be exactly 10 digits long.";
        return false;
    }
    phoneNumberError.value = false;
    return true;
};


watch(() => editableFields.phoneNumber, (newVal) => {
    validatePhoneNumber(String(newVal || ""));
});



const handlePhoneNumberInput = (key: keyof UserDetails) => {
    if (key === FIELD_KEYS.PHONE_NUMBER) {
        editableFields[key] = String(editableFields[key] || "").replace(/\D/g, "");
        validatePhoneNumber(editableFields[key]);
    }
};

const hasChanges = () => {
    return (Object.keys(editableFields) as Array<keyof typeof editableFields>).some(
        (key) => editableFields[key] !== userDetails[key]
    );
};

const updateProfile = async () => {
    if (hasChanges() && !phoneNumberError.value) {
        await handleUpdateUser();
        Object.assign(userDetails, editableFields);
        const loginDetails = getLoginDetails();
        if (loginDetails) {
            fetchUserDetails(loginDetails.UserId);
        }
    } else if (phoneNumberError.value) {
        toast.error("Please fix the errors before saving.");
    } else {
        toast.info("No changes detected.");
    }
    isEditMode.value = false;
};


const fetchUpdatedUsersCount = async (id: number) => {
    try {
        const updatedUsers = await apiService.getUpdateUserById(id);
        updateUserCount.value = updatedUsers.length;
    } catch (error: any) {
        toast.error((error).message, { theme: "dark" });
    }
};



const handleUpdateUser = async () => {
    try {
        await apiService.updateUser([{
            id: userDetails.id,
            fullName: editableFields.fullName,
            address: editableFields.address,
            phoneNumber: editableFields.phoneNumber,
            voterId: userRoleDetails.voterId,
            aadharNumber: editableFields.aadharNumber,
        }]);
        toast.success("User update request sent successfully.");
        await fetchUpdatedUsersCount(userDetails.id);

    } catch (error) {
        toast.error((error as Error).message, { theme: "dark" });
    }
};

const getLoginDetails = () => {
    const voterToken = localStorage.getItem('VoterToken');
    const candidateToken = localStorage.getItem('CandidateToken');
    const adminToken = localStorage.getItem('AdminToken');

    let loginDetails: { UserId: number; role: string } | null = null;

    try {
        const currentRoute = router.currentRoute.value.path;

        if (currentRoute.startsWith('/voter') && voterToken) {
            const decodedToken = jwtDecode(voterToken) as DecodedToken;
            loginDetails = {
                UserId: parseInt(decodedToken.UserId || '0'),
                role: 'Voter'
            };
            const userId = loginDetails.UserId
            userStore.setUserId(userId);
        } else if (currentRoute.startsWith('/candidate') && candidateToken) {
            const decodedToken = jwtDecode(candidateToken) as DecodedToken;
            loginDetails = {
                UserId: parseInt(decodedToken.UserId || '0'),
                role: 'Candidate'
            };
        } else if (currentRoute.startsWith('/admin') && adminToken) {
            const decodedToken = jwtDecode(adminToken) as DecodedToken;
            loginDetails = {
                UserId: parseInt(decodedToken.UserId || '0'),
                role: 'Admin'
            };
        }
    } catch (error) {
        toast.error((error as Error).message, { theme: "dark" });
    }

    return loginDetails;
};

const fetchUserDetails = async (loginUserId: number) => {
    try {
        const userData = await apiService.getUserById(loginUserId);
        userDetails.fullName = userData.fullName;
        userDetails.email = userData.email;
        userDetails.phoneNumber = userData.phoneNumber;
        userDetails.aadharNumber = userData.aadharNumber;
        userDetails.address = userData.address;
        userDetails.gender = userData.gender;
        userDetails.id = loginUserId;
        userDetails.dateOfBirth = userData.dateOfBirth.split("T")[0];
        userRoleDetails.avatarUrl = userData.profileImageUrl;
        userStore.setUserDetails(userData);
        if (userData.roleId === 1) {
            userRoleDetails.voterId = userData.voterId;
        } else if (userData.roleId === 2 || userData.roleId === 3) {
            userRoleDetails.voterId = userData.voterId;
            userRoleDetails.candidateId = userData.candidateId;
            userRoleDetails.roleId = userData.roleId;
        }
        Object.assign(editableFields, { ...userDetails });

    } catch (error) {
        toast.error((error as Error).message, { theme: "dark" });
    }
};


onMounted(() => {
    route.value = previousRoute || "/voter/dashboard"
    const loginDetails = getLoginDetails();
    if (loginDetails) {
        fetchUserDetails(loginDetails.UserId);
    }
});

interface DecodedToken {
    unique_name?: string;
    email?: string;
    role?: string;
    UserId?: string;
    nbf: number;
    exp: number;
    iat: number;
}
</script>

<style scoped>
.is-invalid {
    border-color: #dc3545;
}
</style>
