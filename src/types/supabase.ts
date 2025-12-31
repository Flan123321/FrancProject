/**
 * Tipos generados para la base de datos Supabase
 * Reflejan las tablas: organizations, profiles, organization_members, projects, audit_logs
 */

export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            organizations: {
                Row: {
                    id: string
                    name: string
                    rut: string | null
                    giro: string | null
                    tax_address: string | null
                    slug: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    name: string
                    rut?: string | null
                    giro?: string | null
                    tax_address?: string | null
                    slug?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    name?: string
                    rut?: string | null
                    giro?: string | null
                    tax_address?: string | null
                    slug?: string | null
                    created_at?: string
                }
            }
            profiles: {
                Row: {
                    id: string
                    email: string | null
                    is_admin: boolean | null
                    updated_at: string | null
                }
                Insert: {
                    id: string
                    email?: string | null
                    is_admin?: boolean | null
                    updated_at?: string | null
                }
                Update: {
                    id?: string
                    email?: string | null
                    is_admin?: boolean | null
                    updated_at?: string | null
                }
            }
            organization_members: {
                Row: {
                    organization_id: string
                    user_id: string
                    role: 'admin' | 'member' | 'auditor'
                    created_at: string
                }
                Insert: {
                    organization_id: string
                    user_id: string
                    role?: 'admin' | 'member' | 'auditor'
                    created_at?: string
                }
                Update: {
                    organization_id?: string
                    user_id?: string
                    role?: 'admin' | 'member' | 'auditor'
                    created_at?: string
                }
            }
            projects: {
                Row: {
                    id: string
                    created_at: string
                    organization_id: string
                    name: string
                    description: string | null
                    model_url: string
                    report_url: string | null
                    status: 'Pendiente' | 'En Revisión' | 'Completado' | null
                }
                Insert: {
                    id?: string
                    created_at?: string
                    organization_id: string
                    name: string
                    description?: string | null
                    model_url: string
                    report_url?: string | null
                    status?: 'Pendiente' | 'En Revisión' | 'Completado' | null
                }
                Update: {
                    id?: string
                    created_at?: string
                    organization_id?: string
                    name?: string
                    description?: string | null
                    model_url?: string
                    report_url?: string | null
                    status?: 'Pendiente' | 'En Revisión' | 'Completado' | null
                }
            }
            audit_logs: {
                Row: {
                    id: string
                    created_at: string
                    organization_id: string | null
                    user_id: string
                    action: string
                    target_table: string | null
                    target_id: string | null
                    details: Json | null
                }
                Insert: {
                    id?: string
                    created_at?: string
                    organization_id?: string | null
                    user_id: string
                    action: string
                    target_table?: string | null
                    target_id?: string | null
                    details?: Json | null
                }
                Update: {
                    // Audit logs son inmutables por diseño, pero definimos Update para compatibilidad de tipos
                    id?: string
                    created_at?: string
                    organization_id?: string | null
                    user_id?: string
                    action?: string
                    target_table?: string | null
                    target_id?: string | null
                    details?: Json | null
                }
            }
        }
    }
}
