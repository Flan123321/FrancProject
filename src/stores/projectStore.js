import { defineStore } from 'pinia'
import { supabase } from '../supabaseClient'
import { ref } from 'vue'

export const useProjectStore = defineStore('project', () => {
    const projects = ref([])
    const loading = ref(false)
    const isAdmin = ref(false)
    const userEmail = ref('')

    // Inicializar usuario y verificar rol
    const initUser = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
            userEmail.value = user.email
            const { data } = await supabase
                .from('profiles')
                .select('is_admin')
                .eq('id', user.id)
                .single()
            isAdmin.value = data?.is_admin || false
        }
    }

    const fetchProjects = async () => {
        loading.value = true
        await initUser()
        const { data, error } = await supabase
            .from('projects')
            .select('*, profiles(email)')
            .order('created_at', { ascending: false })

        if (error) console.error(error)
        else projects.value = data
        loading.value = false
    }

    const createProject = async (projectData) => {
        const { data: { user } } = await supabase.auth.getUser()
        const { error } = await supabase.from('projects').insert([{
            user_id: user.id,
            name: projectData.name,
            description: projectData.description,
            model_url: projectData.modelUrl
        }])
        if (error) throw error
        await fetchProjects()
    }

    // Actualizar solo texto (Status)
    const updateProjectStatus = async (id, status) => {
        const { error } = await supabase.from('projects').update({ status }).eq('id', id)
        if (error) throw error
        const index = projects.value.findIndex(p => p.id === id)
        if (index !== -1) projects.value[index].status = status
    }

    // --- NUEVA FUNCIÓN: Subir Archivo Real ---
    const uploadReport = async (project, file) => {
        // 1. Subir archivo al bucket 'reports'
        // Nombre único: ID_PROYECTO + timestamp + nombre_archivo
        const fileName = `${project.id}_${Date.now()}_${file.name}`

        const { data, error: uploadError } = await supabase.storage
            .from('reports')
            .upload(fileName, file)

        if (uploadError) throw uploadError

        // 2. Obtener URL pública
        const { data: { publicUrl } } = supabase.storage
            .from('reports')
            .getPublicUrl(fileName)

        // 3. Actualizar proyecto en BD con el link y estado Completado
        const { error: dbError } = await supabase
            .from('projects')
            .update({
                report_url: publicUrl,
                status: 'Completado'
            })
            .eq('id', project.id)

        if (dbError) throw dbError

        // 4. Actualizar estado local
        await fetchProjects()
    }

    return {
        projects,
        loading,
        isAdmin,
        userEmail,
        fetchProjects,
        createProject,
        updateProjectStatus,
        uploadReport
    }
})
