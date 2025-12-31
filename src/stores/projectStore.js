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

        // 1. Obtener la organización del usuario (Contexto actual)
        // Por ahora asumimos que el usuario opera en su primera organización encontrada
        // TODO: En el futuro, esto debería venir de un selector de organización en la UI
        const { data: orgMember, error: orgError } = await supabase
            .from('organization_members')
            .select('organization_id')
            .eq('user_id', user.id)
            .limit(1)
            .single()

        if (orgError || !orgMember) {
            console.error('Error: Usuario no pertenece a ninguna organización', orgError)
            throw new Error('Debes pertenecer a una organización para crear proyectos.')
        }

        const organizationId = orgMember.organization_id

        console.log(`Creando proyecto para organización: ${organizationId}`)

        // 2. Insertar Proyecto con organization_id explícito
        const { error } = await supabase.from('projects').insert([{
            organization_id: organizationId, // OBLIGATORIO por esquema
            name: projectData.name,
            description: projectData.description,
            model_url: projectData.modelUrl
        }])

        // 3. Manejo de Errores RLS y Base de Datos
        if (error) {
            console.error('Error al crear proyecto en Supabase:', error)

            // Check specific RLS or Permission errors (Postgres codes usually 42501 for permission denied)
            // Supabase returns { code, message, details, hint }
            if (error.code === '42501' || error.code === 'PGRST301') {
                console.error('BLOQUEO RLS: No tienes permisos para crear proyectos en esta organización.')
                throw new Error('No tienes permisos para crear proyectos en esta organización (RLS).')
            }

            throw error
        }

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
        // Valida que exista org_id
        if (!project.organization_id) {
            throw new Error("Error crítico: El proyecto no tiene organization_id asociado.");
        }

        // 1. Sanitizar nombre del archivo
        const fileExt = file.name.split('.').pop();
        // Limpiamos el nombre original de caracteres especiales para evitar problemas en URL/Storage
        const sanitizedOriginalName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_');

        // Estructura Estricta: organization_id/project_id/filename
        const filePath = `${project.organization_id}/${project.id}/${sanitizedOriginalName}`;

        const { data, error: uploadError } = await supabase.storage
            .from('reports')
            .upload(filePath, file, {
                upsert: true // Permitir sobrescribir si es el mismo archivo
            });

        if (uploadError) throw uploadError;

        // 2. Obtener URL pública
        const { data: { publicUrl } } = supabase.storage
            .from('reports')
            .getPublicUrl(filePath);

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

    // --- SECURITY VERIFICATION TOOL ---
    const testSecurity = async () => {
        // 1. Create Dummy Project
        const timestamp = new Date().toISOString();
        const dummyName = `Security Test ${timestamp}`;

        const { data: { user } } = await supabase.auth.getUser();

        // Need org_id. Assuming the user has at least one org or using a default. 
        // For now, let's try to get the first org from members
        const { data: orgData, error: orgError } = await supabase
            .from('organization_members')
            .select('organization_id, role')
            .eq('user_id', user.id)
            .limit(1)
            .single();

        if (orgError || !orgData) {
            console.error("Org Member Error:", orgError);
            throw new Error("Unable to retrieve organization membership. ensure you are part of an organization.");
        }

        console.log("Found Organization:", orgData.organization_id, "Role:", orgData.role);

        if (orgData.role !== 'admin' && orgData.role !== 'member') {
            return { success: false, message: `Your role '${orgData.role}' does not have permission to create projects.` };
        }

        console.log("Creating dummy project for security test...");
        const { data: project, error: createError } = await supabase
            .from('projects')
            .insert([{
                organization_id: orgData.organization_id, // Mandatory now
                name: dummyName,
                description: "Temporary project for security verification",
                model_url: "https://example.com/dummy",
                status: "Pendiente"
            }])
            .select()
            .single();

        if (createError) {
            // Check for RLS specifically
            if (createError.code === '42501') {
                return { success: false, message: `RLS Error: Permission denied. Role '${orgData.role}' might be insufficient or policy mismatch.` };
            }
            throw createError;
        }
        console.log("Project created:", project.id);

        // 2. Query Audit Log IMMEDIATELY
        console.log("Querying audit logs...");
        // Wait a tiny bit just in case propagation is involved, though trigger should be immediate in same tx context usually, 
        // but here we are making separate API calls. RLS might be tricky.

        const { data: logs, error: logError } = await supabase
            .from('audit_logs')
            .select('*')
            .eq('target_id', project.id)
            .eq('action', 'INSERT')
            .limit(1);

        if (logError) {
            console.error("Audit Log Error:", logError);
            return { success: false, message: "Error Accessing Logs: " + logError.message, project };
        }

        if (logs && logs.length > 0) {
            return {
                success: true,
                message: "Audit Log Verified!",
                log: logs[0],
                project
            };
        } else {
            return {
                success: false,
                message: "No Audit Log returned. (RLS might be hiding it OR Trigger failed)",
                project
            };
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
        uploadReport,
        testSecurity
    }
})
