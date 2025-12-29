<template>
  <div class="min-h-screen bg-gray-50 flex flex-col items-center pt-10 px-4">
    <div class="w-full max-w-2xl bg-white shadow-md rounded-lg p-8">
      
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold text-gray-800">Nuevo Proyecto de Auditoría</h2>
        <router-link to="/dashboard" class="text-sm text-gray-500 hover:text-gray-700">← Volver</router-link>
      </div>

      <form @submit.prevent="handleSubmit" class="space-y-6">
        
        <div>
          <label class="block text-sm font-medium text-gray-700">Nombre del Proyecto</label>
          <input 
            v-model="form.name" 
            type="text" 
            placeholder="Ej: Torre Costanera - Etapa 1"
            class="mt-1 w-full border rounded-md p-2 shadow-sm focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700">Descripción / Notas</label>
          <textarea 
            v-model="form.description" 
            rows="3" 
            placeholder="Detalles sobre qué disciplinas revisar (Clima vs Estructura, etc.)"
            class="mt-1 w-full border rounded-md p-2 shadow-sm focus:ring-blue-500 focus:border-blue-500"
          ></textarea>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700">Link de Descarga del Modelo (RVT, IFC, NWD)</label>
          <div class="mt-1 flex rounded-md shadow-sm">
            <span class="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
              URL
            </span>
            <input 
              v-model="form.modelUrl" 
              type="url" 
              placeholder="https://dropbox.com/s/..."
              class="flex-1 w-full border rounded-none rounded-r-md p-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <p class="mt-2 text-xs text-gray-500">
            Sube tu archivo pesado a Dropbox, Google Drive o WeTransfer y pega el link aquí.
          </p>
        </div>

        <div class="pt-4 flex justify-end">
          <button 
            type="submit" 
            class="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition shadow"
            :disabled="loading"
          >
            {{ loading ? 'Enviando...' : 'Crear Proyecto' }}
          </button>
        </div>

      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useProjectStore } from '../stores/projectStore'
import { useRouter } from 'vue-router'

const store = useProjectStore()
const router = useRouter()
const loading = ref(false)

const form = ref({
  name: '',
  description: '',
  modelUrl: ''
})

const handleSubmit = async () => {
  loading.value = true
  try {
    await store.createProject(form.value)
    router.push('/dashboard')
  } catch (error) {
    alert('Error al crear proyecto: ' + error.message)
  } finally {
    loading.value = false
  }
}
</script>
