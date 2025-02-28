<template>
  <div>
    <input type="file" @change="handleFileUpload" />
    <p v-if="imageUrl">
      Image URL: <a :href="imageUrl" target="_blank">{{ imageUrl }}</a>
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { uploadImage } from '../../Services/FirebaseHelper';
import { toast } from 'vue3-toastify';
import "vue3-toastify/dist/index.css";


const imageUrl = ref<string | null>(null);

const handleFileUpload = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files ? target.files[0] : null;

  if (file) {
    try {
      imageUrl.value = await uploadImage(file, 'uploads');
    } catch (error) {
      toast.error((error as Error).message, { theme: "dark" });
    }
  }
};
</script>