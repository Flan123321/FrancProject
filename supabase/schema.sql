-- 1. Tabla de Organizaciones (Datos Empresas / Facturación)
CREATE TABLE organizations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  rut TEXT,            -- RUT Empresa
  giro TEXT,           -- Giro comercial
  tax_address TEXT,    -- Dirección Tributaria
  slug TEXT UNIQUE,    -- Para URLs amigables (ej: app.com/constructora-perez)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Tabla de Perfiles (Se vincula a los usuarios de Supabase Auth)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users NOT NULL PRIMARY KEY,
  email TEXT,
  -- organization_id UUID REFERENCES organizations(id), -- REDUNDANTE: Usamos organization_members para relación N:N
  is_admin BOOLEAN DEFAULT FALSE, -- Rol de "Super Admin" / Plataforma (No de Organización)
  updated_at TIMESTAMP WITH TIME ZONE
);

-- 2.1. Función y Trigger para crear perfil automático al registrarse
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to automatically create profile on signup
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 3. Tabla de Miembros de Organización (RBAC)
CREATE TYPE org_role AS ENUM ('admin', 'member', 'auditor');

CREATE TABLE organization_members (
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  role org_role DEFAULT 'member',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  PRIMARY KEY (organization_id, user_id)
);

-- 4. Tabla de Proyectos (Vinculados a Organizaciones, NO a usuarios)
CREATE TABLE projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL, -- FK clave
  name TEXT NOT NULL,
  description TEXT,
  model_url TEXT NOT NULL,
  report_url TEXT,
  status TEXT DEFAULT 'Pendiente' CHECK (status IN ('Pendiente', 'En Revisión', 'Completado'))
);

-- 5. Habilitar Seguridad (Row Level Security)
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- 6. Helper Function: Check if user is member of org
create or replace function public.is_org_member(_org_id uuid)
returns boolean as $$
begin
  return exists (
    select 1
    from organization_members
    where organization_id = _org_id
    and user_id = auth.uid()
  );
end;
$$ language plpgsql security definer;

-- 8. Políticas RLS

-- A. Perfiles
CREATE POLICY "Ver propio perfil" ON profiles FOR SELECT USING (auth.uid() = id);

-- 7. Audit Logs Table (Immutable Audit Trail)
CREATE TABLE audit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  organization_id UUID REFERENCES organizations(id),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  action TEXT NOT NULL,
  target_table TEXT,    -- Table being modified
  target_id UUID,       -- ID of the row being modified
  details JSONB         -- Full row copy
);

ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- 8. Policies for Audit Logs (Immutable)

-- Select: Super Admins y Org Admins ven logs
CREATE POLICY "View audit logs" ON audit_logs FOR SELECT
USING (
  -- 1. Super Admin (Plataforma)
  (SELECT is_admin FROM profiles WHERE id = auth.uid()) = TRUE
  OR
  -- 2. Org Admin (Solo logs de su organización)
  (
    organization_id IS NOT NULL AND
    exists (
      select 1 from organization_members
      where organization_members.organization_id = audit_logs.organization_id
      and organization_members.user_id = auth.uid()
      and organization_members.role = 'admin'
    )
  )
);
-- No INSERT policy needed because the Trigger acts as Superuser (Security Definer)
-- No UPDATE or DELETE policies -> Strict Immutability

-- B. Organizaciones
-- Ver: Miembros pueden ver su organización
CREATE POLICY "Ver mis organizaciones" ON organizations FOR SELECT
USING (
  exists (
    select 1 from organization_members
    where organization_id = organizations.id
    and user_id = auth.uid()
  )
);

-- Crear: Cualquiera puede crear una organización
CREATE POLICY "Crear organizaciones" ON organizations FOR INSERT
WITH CHECK (true); 

-- C. Miembros de Organización
-- Ver: Miembros pueden ver a sus compañeros
CREATE POLICY "Ver miembros de mi org" ON organization_members FOR SELECT
USING (
  exists (
    select 1 from organization_members om
    where om.organization_id = organization_members.organization_id
    and om.user_id = auth.uid()
  )
);

-- Gestionar: Solo Admins pueden añadir/borrar miembros
CREATE POLICY "Admins gestionan miembros" ON organization_members FOR ALL
USING (
  exists (
    select 1 from organization_members admin
    where admin.organization_id = organization_members.organization_id
    and admin.user_id = auth.uid()
    and admin.role = 'admin'
  )
);

-- D. Proyectos
-- Ver: Todo miembro de la org puede ver los proyectos (Admin, Member, Auditor)
CREATE POLICY "Ver proyectos de mi org" ON projects FOR SELECT
USING ( public.is_org_member(organization_id) );

-- Crear: Solo Admin y Member pueden crear (Auditor NO)
CREATE POLICY "Crear proyectos en mi org" ON projects FOR INSERT
WITH CHECK (
  exists (
    select 1 from organization_members
    where organization_id = projects.organization_id
    and user_id = auth.uid()
    and role IN ('admin', 'member')
  )
);

-- Editar: Admins y Miembros (Colaboración)
CREATE POLICY "Editar proyectos en mi org" ON projects FOR UPDATE
USING (
  exists (
    select 1 from organization_members
    where organization_id = projects.organization_id
    and user_id = auth.uid()
    and role IN ('admin', 'member')
  )
);

-- Borrar: SOLO Admins (Seguridad jerárquica)
CREATE POLICY "Eliminar proyectos" ON projects FOR DELETE
USING (
  exists (
    select 1 from organization_members
    where organization_id = projects.organization_id
    and user_id = auth.uid()
    and role = 'admin'
  )
);

-- 9. Enterprise Audit Trigger Logic
create or replace function public.handle_audit_log()
returns trigger as $$
begin
  insert into public.audit_logs (organization_id, user_id, action, target_table, target_id, details)
  values (
    new.organization_id, -- Assume target table has org_id
    auth.uid(),          -- Auth User
    TG_OP,               -- INSERT/UPDATE/DELETE
    TG_TABLE_NAME,       
    new.id,              
    row_to_json(new)     
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger for Projects
create trigger on_project_change
  after insert or update 
  on public.projects
  for each row execute procedure public.handle_audit_log();

-- 10. Storage Policies (Files)
-- Ensure 'reports' bucket exists and has RLS
insert into storage.buckets (id, name, public) 
values ('reports', 'reports', false)
on conflict (id) do nothing;

alter table storage.objects enable row level security;

-- Policy: Allow Org members to download reports
-- Assumes filename format: "PROJECTID_TIMESTAMP.ext"
-- Checks if user is member of the Org that owns the ProjectID found in filename.
create policy "Give users access to own folder" on storage.objects for select
using (
  bucket_id = 'reports' 
  and exists (
    select 1 from projects
    join organization_members on projects.organization_id = organization_members.organization_id
    where projects.id::text = split_part(name, '_', 1) -- Extract Project ID
    and organization_members.user_id = auth.uid()
  )
);

-- Policy: Allow Uploads (Same check as Project Create/Update)
create policy "Allow uploads" on storage.objects for insert
with check (
  bucket_id = 'reports' 
  and exists (
    select 1 from projects
    join organization_members on projects.organization_id = organization_members.organization_id
    where projects.id::text = split_part(name, '_', 1) 
    and organization_members.user_id = auth.uid()
    and organization_members.role IN ('admin', 'member')
  )
);
