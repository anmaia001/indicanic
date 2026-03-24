
-- Inserir perfil para usuários do Auth que não têm perfil ainda
INSERT INTO public.profiles (id, name, email, role)
SELECT
  u.id,
  COALESCE(u.raw_user_meta_data->>'name', split_part(u.email, '@', 1)),
  u.email,
  COALESCE(u.raw_user_meta_data->>'role', 'affiliate')
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- Promover automaticamente usuários com role='admin' nos metadados
UPDATE public.profiles p
SET role = 'admin'
FROM auth.users u
WHERE p.id = u.id
  AND u.raw_user_meta_data->>'role' = 'admin'
  AND p.role != 'admin';

-- Mostrar resultado
SELECT id, email, role, is_active, created_at
FROM public.profiles
ORDER BY created_at;
