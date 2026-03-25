
-- Adicionar colunas que podem estar faltando na tabela company_settings
ALTER TABLE public.company_settings
  ADD COLUMN IF NOT EXISTS phone text,
  ADD COLUMN IF NOT EXISTS email text,
  ADD COLUMN IF NOT EXISTS website text,
  ADD COLUMN IF NOT EXISTS payment_due_days integer DEFAULT 15,
  ADD COLUMN IF NOT EXISTS notify_new_indication boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS notify_status_change boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS notify_commission_approved boolean DEFAULT true,
  ADD COLUMN IF NOT EXISTS notify_weekly_report boolean DEFAULT false;

-- Garantir RLS permite admin ler e escrever
DROP POLICY IF EXISTS "Admin can manage settings" ON public.company_settings;
CREATE POLICY "Admin can manage settings"
  ON public.company_settings
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Ver estrutura atual
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'company_settings'
ORDER BY ordinal_position;
