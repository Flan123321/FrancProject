<template>
  <div class="relative inline-block w-full">
    <input
      type="file"
      ref="fileInput"
      class="hidden"
      accept=".pdf,.bcf,.zip"
      @change="handleFileChange"
    />

    <!-- Upload Button when not uploading -->
    <button
      v-if="!isUploading"
      @click="triggerUpload"
      class="text-xs bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded hover:bg-indigo-200 transition-colors flex items-center gap-1.5 font-medium w-full justify-center"
      :class="{ 'opacity-50 cursor-not-allowed': isDisabled }"
      :disabled="isDisabled"
    >
      <span>📤</span>
      Subir Archivo
    </button>

    <!-- Progress Bar State -->
    <div v-else class="w-full">
        <div class="flex justify-between text-xs mb-1">
            <span class="text-indigo-600 font-medium">Subiendo...</span>
            <span class="text-gray-500">{{ uploadProgress }}%</span>
        </div>
        <div class="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 overflow-hidden">
            <div 
                class="bg-indigo-600 h-2.5 rounded-full transition-all duration-300 ease-out" 
                :style="{ width: `${uploadProgress}%` }"
            ></div>
        </div>
    </div>
    
    <!-- Error Message -->
    <div v-if="errorMessage" class="absolute top-full right-0 mt-2 w-64 text-xs text-red-600 bg-white border border-red-200 p-3 rounded shadow-lg z-20 flex items-start gap-2">
      <span class="text-lg">⚠️</span>
      <div>
          <p class="font-bold">Error al subir</p>
          <p>{{ errorMessage }}</p>
          <button @click="errorMessage = ''" class="text-gray-400 hover:text-gray-600 underline mt-1 text-[10px]">Cerrar</button>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useProjectStore } from '../stores/projectStore';

const props = defineProps({
  project: {
    type: Object,
    required: true,
    validator: (value) => {
      return value && value.id;
    }
  }
});

const store = useProjectStore();
const fileInput = ref(null);
const isUploading = ref(false);
const uploadProgress = ref(0);
const errorMessage = ref('');

// Computed to safely check for organization_id
const isDisabled = computed(() => !props.project?.organization_id);

const triggerUpload = () => {
  errorMessage.value = '';
  if (isDisabled.value) {
    errorMessage.value = 'Este proyecto no pertenece a una organización válida.';
    return;
  }
  fileInput.value.click();
};

const handleFileChange = async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  // Validate size (50MB)
  if (file.size > 50 * 1024 * 1024) { 
    errorMessage.value = 'El archivo supera el límite de 50MB.';
    return;
  }

  try {
    isUploading.value = true;
    errorMessage.value = '';
    uploadProgress.value = 0;

    // Simulate progress because Supabase JS client doesn't support it natively for all buckets yet
    const progressInterval = setInterval(() => {
        if (uploadProgress.value < 90) {
            uploadProgress.value += Math.floor(Math.random() * 10) + 1; // Increment random 1-10%
        }
    }, 300);

    // Perform Upload
    await store.uploadReport(props.project, file);
    
    // Complete
    clearInterval(progressInterval);
    uploadProgress.value = 100;

    // Small delay to show 100% before resetting
    setTimeout(() => {
         isUploading.value = false;
         alert('✅ Archivo subido y notificado correctamente.'); 
    }, 600);
   

  } catch (error) {
    console.error('Upload error:', error);
    isUploading.value = false; // Stop loading immediately on error
    
    // Friendly error parsing
    if (error.message.includes('row-level security') || error.code === '42501') {
        errorMessage.value = 'No tienes permiso para subir archivos en esta organización.';
    } else if (error.message.includes('storage')) {
         errorMessage.value = 'Error de almacenamiento. Verifica tu conexión.';
    } else {
        errorMessage.value = error.message || 'Ocurrió un error inesperado.';
    }

  } finally {
    event.target.value = ''; // Reset input to allow selecting same file again
  }
};
</script>
