ALTER TABLE public.documentos
  ADD COLUMN IF NOT EXISTS drive_file_id text,
  ADD COLUMN IF NOT EXISTS drive_folder_id text,
  ADD COLUMN IF NOT EXISTS web_view_link text,
  ADD COLUMN IF NOT EXISTS web_content_link text,
  ADD COLUMN IF NOT EXISTS mime_type text,
  ADD COLUMN IF NOT EXISTS tamano_bytes bigint,
  ADD COLUMN IF NOT EXISTS drive_match_status text,
  ADD COLUMN IF NOT EXISTS drive_match_notes text,
  ADD COLUMN IF NOT EXISTS drive_matched_at timestamp without time zone;

COMMENT ON COLUMN public.documentos.drive_file_id IS 'Google Drive file ID matched or created for this document.';
COMMENT ON COLUMN public.documentos.drive_folder_id IS 'Google Drive folder ID where the document is stored.';
COMMENT ON COLUMN public.documentos.web_view_link IS 'Google Drive web link for viewing the document.';
COMMENT ON COLUMN public.documentos.web_content_link IS 'Google Drive web link for downloading the document when available.';
COMMENT ON COLUMN public.documentos.mime_type IS 'MIME type reported by Google Drive for the document.';
COMMENT ON COLUMN public.documentos.tamano_bytes IS 'File size in bytes reported by Google Drive.';
COMMENT ON COLUMN public.documentos.drive_match_status IS 'Drive matching status for migrated documents, such as matched, multiple_matches, not_found, or error.';
COMMENT ON COLUMN public.documentos.drive_match_notes IS 'Notes from the Drive matching process for review or troubleshooting.';
COMMENT ON COLUMN public.documentos.drive_matched_at IS 'Timestamp when the document was matched with Google Drive metadata.';
