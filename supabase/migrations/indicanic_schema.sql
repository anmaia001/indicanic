
-- ============================================================
-- INDICANIC - SCHEMA COMPLETO
-- ============================================================

-- 1. PROFILES (estende auth.users com dados extras)
CREATE TABLE IF NOT EXISTS public.profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  email         TEXT NOT NULL,
  role          TEXT NOT NULL DEFAULT 'affiliate' CHECK (role IN ('affiliate', 'admin')),
  phone         TEXT,
  cpf           TEXT,
  pix_key       TEXT,
  commission_rate NUMERIC(5,2) NOT NULL DEFAULT 10.00,
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. INDICATIONS (indicações de clientes)
CREATE TABLE IF NOT EXISTS public.indications (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  client_name      TEXT NOT NULL,
  client_phone     TEXT NOT NULL,
  client_email     TEXT,
  client_address   TEXT,
  service_type     TEXT NOT NULL CHECK (service_type IN ('cftv','alarm','access_control','electric_fence','monitoring','combo')),
  status           TEXT NOT NULL DEFAULT 'indication' CHECK (status IN ('indication','budget','installation','active','commission_paid','cancelled')),
  notes            TEXT,
  admin_notes      TEXT,
  contract_value   NUMERIC(12,2),
  monthly_fee      NUMERIC(12,2),
  commission_value NUMERIC(12,2),
  commission_rate  NUMERIC(5,2) NOT NULL DEFAULT 10.00,
  budget_date      DATE,
  installation_date DATE,
  activation_date  DATE,
  commission_paid_date DATE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. COMMISSIONS (comissões geradas)
CREATE TABLE IF NOT EXISTS public.commissions (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  indication_id    UUID NOT NULL REFERENCES public.indications(id) ON DELETE CASCADE,
  affiliate_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  value            NUMERIC(12,2) NOT NULL,
  status           TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','paid')),
  reference_month  TEXT NOT NULL, -- formato: YYYY-MM
  payment_method   TEXT,
  paid_at          TIMESTAMPTZ,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. COMPANY SETTINGS
CREATE TABLE IF NOT EXISTS public.company_settings (
  id                     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name           TEXT NOT NULL DEFAULT 'NicSeg Segurança Eletrônica',
  company_phone          TEXT,
  company_email          TEXT,
  company_website        TEXT,
  default_commission_rate NUMERIC(5,2) NOT NULL DEFAULT 10.00,
  payment_due_days       INTEGER NOT NULL DEFAULT 15,
  notify_new_indication  BOOLEAN DEFAULT TRUE,
  notify_status_change   BOOLEAN DEFAULT TRUE,
  notify_commission_approved BOOLEAN DEFAULT TRUE,
  notify_weekly_report   BOOLEAN DEFAULT FALSE,
  created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Inserir configuração padrão
INSERT INTO public.company_settings (company_name)
VALUES ('NicSeg Segurança Eletrônica')
ON CONFLICT DO NOTHING;

-- ============================================================
-- TRIGGERS: updated_at automático
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER trg_indications_updated_at
  BEFORE UPDATE ON public.indications
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER trg_commissions_updated_at
  BEFORE UPDATE ON public.commissions
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================
-- TRIGGER: criar profile ao cadastrar usuário no auth
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'affiliate')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- TRIGGER: calcular comissão automaticamente quando indication
-- muda para status 'active'
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_indication_status_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Criar comissão quando indicação ativa (mensalidade)
  IF NEW.status = 'active' AND OLD.status != 'active' AND NEW.contract_value IS NOT NULL THEN
    -- Calcular valor da comissão
    NEW.commission_value = ROUND(NEW.contract_value * NEW.commission_rate / 100, 2);

    -- Inserir registro de comissão pendente
    INSERT INTO public.commissions (
      indication_id,
      affiliate_id,
      value,
      status,
      reference_month
    ) VALUES (
      NEW.id,
      NEW.affiliate_id,
      NEW.commission_value,
      'pending',
      TO_CHAR(NOW(), 'YYYY-MM')
    )
    ON CONFLICT DO NOTHING;
  END IF;

  -- Marcar comissão como paga quando status = commission_paid
  IF NEW.status = 'commission_paid' AND OLD.status != 'commission_paid' THEN
    NEW.commission_paid_date = CURRENT_DATE;
    UPDATE public.commissions
    SET status = 'paid', paid_at = NOW(), updated_at = NOW()
    WHERE indication_id = NEW.id AND status != 'paid';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_indication_auto_commission
  BEFORE UPDATE ON public.indications
  FOR EACH ROW EXECUTE FUNCTION public.handle_indication_status_change();

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.indications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_settings ENABLE ROW LEVEL SECURITY;

-- Helper: verificar se usuário atual é admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- PROFILES policies
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (id = auth.uid() OR public.is_admin());

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (id = auth.uid());

CREATE POLICY "Admins can insert profiles" ON public.profiles
  FOR INSERT WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update any profile" ON public.profiles
  FOR UPDATE USING (public.is_admin());

-- INDICATIONS policies
CREATE POLICY "Affiliates see own indications" ON public.indications
  FOR SELECT USING (affiliate_id = auth.uid() OR public.is_admin());

CREATE POLICY "Affiliates can insert own indications" ON public.indications
  FOR INSERT WITH CHECK (affiliate_id = auth.uid());

CREATE POLICY "Affiliates can update own indications (limited)" ON public.indications
  FOR UPDATE USING (affiliate_id = auth.uid() AND status = 'indication');

CREATE POLICY "Admins can update any indication" ON public.indications
  FOR UPDATE USING (public.is_admin());

CREATE POLICY "Admins can delete indications" ON public.indications
  FOR DELETE USING (public.is_admin());

-- COMMISSIONS policies
CREATE POLICY "Affiliates see own commissions" ON public.commissions
  FOR SELECT USING (affiliate_id = auth.uid() OR public.is_admin());

CREATE POLICY "Admins can manage commissions" ON public.commissions
  FOR ALL USING (public.is_admin());

-- COMPANY SETTINGS policies
CREATE POLICY "Anyone authenticated can read settings" ON public.company_settings
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Only admins can modify settings" ON public.company_settings
  FOR ALL USING (public.is_admin());

-- ============================================================
-- ÍNDICES para performance
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_indications_affiliate ON public.indications(affiliate_id);
CREATE INDEX IF NOT EXISTS idx_indications_status ON public.indications(status);
CREATE INDEX IF NOT EXISTS idx_indications_created_at ON public.indications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_commissions_affiliate ON public.commissions(affiliate_id);
CREATE INDEX IF NOT EXISTS idx_commissions_status ON public.commissions(status);
