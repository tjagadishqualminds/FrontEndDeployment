<script setup lang="ts">
import { useRouter } from 'vue-router';
import { apiService } from '@/Services/ApiService';
import { onMounted } from 'vue';

const router = useRouter();

const props = defineProps<{
    pathMatch: string;
}>();

const goBack = () => {
    router.back();
};

const goHome = () => {
    router.push('/');
};


const storeUrl = () => {
    apiService.storeUrl(props.pathMatch);
};


onMounted(() => {
    storeUrl();
})
</script>

<template>
    <div class="min-vh-100 d-flex align-items-center justify-content-center bg-light">
        <div class="text-center">
            <h1 class="display-1 fw-bold text-secondary mb-4">404</h1>
            <h2 class="display-6 mb-3">Page Not Found</h2>
            <p class="text-muted mb-5">
                Sorry, we couldn't find the page you're looking for. The page might have been moved, deleted, or never
                existed.
            </p>
            <p class="text-muted mb-5">
                The requested path was: <strong>{{ pathMatch }}</strong>
            </p>
            <div class="d-flex gap-3 justify-content-center">
                <button @click="goBack" class="btn btn-dark px-4">
                    Go Back
                </button>
                <button @click="goHome" class="btn btn-outline-secondary px-4">
                    Home Page
                </button>
            </div>
        </div>
    </div>
</template>
