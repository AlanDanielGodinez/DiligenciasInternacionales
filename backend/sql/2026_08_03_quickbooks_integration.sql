BEGIN;

CREATE TABLE IF NOT EXISTS public.quickbooks_conexiones (
  id_quickbooks_conexion bigserial PRIMARY KEY,
  realm_id varchar(64) NOT NULL,
  access_token_encrypted text NOT NULL,
  refresh_token_encrypted text NOT NULL,
  access_token_expires_at timestamptz NOT NULL,
  refresh_token_expires_at timestamptz NULL,
  environment varchar(16) NOT NULL CHECK (environment IN ('sandbox', 'production')),
  status varchar(32) NOT NULL DEFAULT 'connected'
    CHECK (status IN ('connected', 'disconnected', 'requires_reconnection', 'error')),
  last_error text NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (realm_id, environment)
);

CREATE TABLE IF NOT EXISTS public.contacto_quickbooks (
  id_contacto integer PRIMARY KEY REFERENCES public.contacto(id_contacto),
  realm_id varchar(64) NULL,
  quickbooks_customer_id varchar(64) NULL,
  quickbooks_sync_token varchar(64) NULL,
  sync_status varchar(32) NOT NULL DEFAULT 'pending'
    CHECK (sync_status IN ('pending', 'syncing', 'synced', 'error', 'requires_reconnection')),
  last_error text NULL,
  attempts integer NOT NULL DEFAULT 0 CHECK (attempts >= 0),
  last_attempt_at timestamptz NULL,
  synced_at timestamptz NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.contacto_quickbooks
  ADD COLUMN IF NOT EXISTS realm_id varchar(64) NULL;
ALTER TABLE public.contacto_quickbooks
  ADD COLUMN IF NOT EXISTS last_attempt_at timestamptz NULL;

DROP INDEX IF EXISTS public.uq_contacto_quickbooks_customer_id;
CREATE UNIQUE INDEX IF NOT EXISTS uq_contacto_quickbooks_realm_customer
  ON public.contacto_quickbooks (realm_id, quickbooks_customer_id)
  WHERE quickbooks_customer_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_contacto_quickbooks_sync_status
  ON public.contacto_quickbooks (sync_status, updated_at);

CREATE TABLE IF NOT EXISTS public.quickbooks_oauth_states (
  state_hash char(64) PRIMARY KEY,
  expires_at timestamptz NOT NULL,
  used_at timestamptz NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_quickbooks_oauth_states_expires_at
  ON public.quickbooks_oauth_states (expires_at);

COMMIT;
