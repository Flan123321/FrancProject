-- 1. Tabla de Perfiles (Se vincula a los usuarios de Supabase Auth)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users NOT NULL PRIMARY KEY,
  email TEXT,
  is_admin BOOLEAN DEFAULT FALSE,
  updated_at TIMESTAMP WITH TIME ZONE
);

-- 2. Función y Trigger para crear perfil automático al registrarse
-- (Esto resuelve el problema del "huevo y la gallina")
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

-- 3. Tabla de Proyectos
CREATE TABLE projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  user_id UUID REFERENCES profiles(id) NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  model_url TEXT NOT NULL, -- Link externo (Dropbox/Drive)
  report_url TEXT,         -- Link del BCF (Llenado por Admin)
  status TEXT DEFAULT 'Pendiente' CHECK (status IN ('Pendiente', 'En Revisión', 'Completado'))
);

-- 4. Habilitar Seguridad (Row Level Security)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- 5. Políticas RLS para PROYECTOS

-- A. SELECT: El dueño ve lo suyo, el Admin ve todo
CREATE POLICY "Ver proyectos" ON projects FOR SELECT
USING (
  auth.uid() = user_id 
  OR 
  (SELECT is_admin FROM profiles WHERE id = auth.uid()) = TRUE
);

-- B. INSERT: Cualquiera autenticado crea proyectos
CREATE POLICY "Crear proyectos" ON projects FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- C. UPDATE: 
-- (Nota simplificada para MVP: El Admin puede editar todo. 
-- El usuario puede editar si es dueño. La restricción de columnas se maneja en Frontend por ahora)
CREATE POLICY "Editar proyectos" ON projects FOR UPDATE
USING (
  auth.uid() = user_id 
  OR 
  (SELECT is_admin FROM profiles WHERE id = auth.uid()) = TRUE
);

-- 6. Políticas RLS para PERFILES (Lectura básica)
CREATE POLICY "Ver propio perfil" ON profiles FOR SELECT USING (auth.uid() = id);
