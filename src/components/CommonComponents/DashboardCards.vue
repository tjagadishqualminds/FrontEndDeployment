<template>
    <div>
        <div class="card bg-danger p-2 shadow-lg shadow">
            <div class="card-main d-flex gap-3 align-items-center">
                <div class="image">
                    <Icon :icon="logo" width="36" color="white" />
                </div>
                <div class="card-text d-flex flex-column align-items-center">
                    <div class="card-text-heading">
                        <h3>
                            {{ cardHeading }}
                        </h3>
                    </div>
                    <div class="card-number">
                        <h2>{{ cardNumber }}</h2>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue/dist/iconify.js';
defineProps<{
    cardHeading: string;
    cardNumber: string;
    logo: string;
}>();
</script>
