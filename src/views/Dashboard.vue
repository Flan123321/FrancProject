<template>
  <div class="min-h-screen bg-gray-50">
    <nav class="bg-white shadow">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
        <h1 class="text-xl font-bold text-gray-800">
          BIM Audit Hub 
          <span v-if="store.isAdmin" class="text-xs bg-red-100 text-red-800 px-2 py-1 rounded ml-2">ADMIN MODE</span>
        </h1>
        <div class="flex items-center gap-4">
          <span class="text-sm text-gray-500">{{ store.userEmail }}</span>
          <button @click="handleLogout" class="text-sm text-red-600 hover:text-red-800 font-medium">Salir</button>
        </div>
      </div>
    </nav>

    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold text-gray-700">Proyectos</h2>
        <router-link 
          to="/new-project" 
          class="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 transition flex items-center gap-2"
        >
          + Nuevo Proyecto
        </router-link>
      </div>

      <div v-if="store.loading" class="text-center py-10 text-gray-500">
        Cargando proyectos...
      </div>

      <div v-else class="bg-white shadow overflow-hidden sm:rounded-lg">
        <ul role="list" class="divide-y divide-gray-200">
          
          <li v-for="project in store.projects" :key="project.id" class="p-6 hover:bg-gray-50 transition">
            <div class="flex items-center justify-between">
              
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-3">
                  <p class="text-lg font-medium text-blue-600 truncate">{{ project.name }}</p>
                  <span 
                    class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
                    :class="{
                      'bg-yellow-100 text-yellow-800': project.status === 'Pendiente',
                      'bg-blue-100 text-blue-800': project.status === 'En Revisión',
                      'bg-green-100 text-green-800': project.status === 'Completado'
                    }"
                  >
                    {{ project.status }}
                  </span>
                </div>
                <p class="text-sm text-gray-500 mt-1">{{ project.description }}</p>
                <div class="mt-2 text-xs text-gray-400">
                  Enviado: {{ new Date(project.created_at).toLocaleDateString() }}
                  <span v-if="store.isAdmin"> | Usuario: {{ project.profiles?.email }}</span>
                </div>
              </div>

              <div class="flex flex-col items-end gap-2 ml-4">
                
                <a :href="project.model_url" target="_blank" class="text-sm text-gray-600 hover:text-blue-600 underline decoration-dotted">
                  📂 Ver Modelo (Drive/Box)
                </a>

                <a v-if="project.report_url" :href="project.report_url" target="_blank" class="text-sm font-bold text-green-600 hover:text-green-800 flex items-center gap-1">
                  📥 Descargar Reporte PDF
                </a>
                <span v-else class="text-xs text-gray-400 italic">Reporte no disponible</span>

                <!-- Admin Actions -->
                <div v-if="store.isAdmin" class="mt-2 pt-2 border-t border-gray-100 flex gap-2 items-center">
                  <select 
                    @change="store.updateProjectStatus(project.id, $event.target.value)" 
                    class="text-xs border rounded p-1 bg-gray-50"
                    :value="project.status"
                  >
                    <option value="Pendiente">Pendiente</option>
                    <option value="En Revisión">En Revisión</option>
                    <option value="Completado">Completado</option>
                  </select>
                  
                  <!-- Upload Button triggers hidden input -->
                  <button 
                    @click="triggerUpload(project)"
                    class="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded hover:bg-indigo-200 flex items-center gap-1"
                    :disabled="uploadingId === project.id"
                  >
                    {{ uploadingId === project.id ? 'Subiendo...' : '📤 Subir Reporte' }}
                  </button>
                </div>

              </div>
            </div>
          </li>
        </ul>
      </div>
      
      <!-- Input oculto para subir archivos -->
      <input 
        type="file" 
        ref="fileInput" 
        class="hidden" 
        accept=".pdf,.bcf,.zip"
        @change="handleFileChange"
      />

    </main>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useProjectStore } from '../stores/projectStore'
import { supabase } from '../supabaseClient'
import { useRouter } from 'vue-router'

const store = useProjectStore()
const router = useRouter()
const fileInput = ref(null)
const selectedProject = ref(null)
const uploadingId = ref(null)

onMounted(() => {
  store.fetchProjects()
})

const handleLogout = async () => {
  await supabase.auth.signOut()
  router.push('/')
}

const triggerUpload = (project) => {
  selectedProject.value = project
  fileInput.value.click() // Simula clic en el input oculto
}

const handleFileChange = async (event) => {
  const file = event.target.files[0]
  if (!file || !selectedProject.value) return

  try {
    uploadingId.value = selectedProject.value.id
    await store.uploadReport(selectedProject.value, file)
    alert('Reporte subido y proyecto completado.')
  } catch (error) {
    alert('Error al subir: ' + error.message)
  } finally {
    uploadingId.value = null
    event.target.value = '' // Limpiar input
  }
}
</script>
