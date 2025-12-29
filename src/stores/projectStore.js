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
        // 1. Sanitizar nombre del archivo (Solo a-z, 0-9, y extensión)
        // Evita errores con acentos, espacios, ñ, etc.
        const fileExt = file.name.split('.').pop();
        const fileName = `${project.id}_${Date.now()}.${fileExt}`;

        const { data, error: uploadError } = await supabase.storage
            .from('reports')
            .upload(fileName, file);

        if (uploadError) throw uploadError;

        // 2. Obtener URL pública
        const { data: { publicUrl } } = supabase.storage
            .from('reports')
            .getPublicUrl(fileName);

        // 3. Actualizar proyecto y traer el email del dueño
        const { data: updatedProject, error: dbError } = await supabase
            .from('projects')
            .update({
                report_url: publicUrl,
                status: 'Completado'
            })
            .eq('id', project.id)
            .select('*, profiles(email)')
            .single();

        if (dbError) throw dbError;

        // 4. Enviar Email (Resend)
        if (updatedProject?.profiles?.email) {
            await sendCompletionEmail(updatedProject.profiles.email, project.name, publicUrl);
        }

        // 5. Actualizar estado local
        await fetchProjects();
    };

    // --- EMAIL FUNCTION (Vía Supabase Edge Function) ---
    const sendCompletionEmail = async (toEmail, projectName, reportUrl) => {
        try {
            console.log('Invocando Edge Function para email...')
            const { data, error } = await supabase.functions.invoke('send-email', {
                body: {
                    to: toEmail,
                    subject: `✅ Proyecto Completado: ${projectName}`,
                    html: `
            <p>El proyecto <strong>${projectName}</strong> ha sido completado.</p>
            <a href="${reportUrl}" style="padding: 10px 20px; background-color: #2563EB; color: white; text-decoration: none; border-radius: 5px;">Descargar Reporte</a>
          `
                }
            })

            if (error) throw error
            console.log('Email enviado con éxito:', data)
        } catch (e) {
            console.error('Error enviando email:', e)
        }
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
