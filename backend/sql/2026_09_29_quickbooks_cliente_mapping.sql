BEGIN;

-- Canonical QuickBooks mapping: one local cliente/aplicante per QBO Customer.
-- contacto_quickbooks is intentionally retained as legacy history. Its rows
-- cannot be converted safely because one contacto may own multiple clientes.
CREATE TABLE IF NOT EXISTS public.cliente_quickbooks (
  id_cliente integer PRIMARY KEY REFERENCES public.clientes(id_cliente),
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

CREATE UNIQUE INDEX IF NOT EXISTS uq_cliente_quickbooks_realm_customer
  ON public.cliente_quickbooks (realm_id, quickbooks_customer_id)
  WHERE quickbooks_customer_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_cliente_quickbooks_sync_status
  ON public.cliente_quickbooks (sync_status, updated_at);

COMMIT;
