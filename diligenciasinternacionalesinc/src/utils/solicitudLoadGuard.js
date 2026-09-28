// Only the most recently selected request may update request-scoped UI state.
export const shouldCommitSolicitudLoad = (activeVersion, responseVersion, selectedSolicitudId, responseSolicitudId) => (
  activeVersion === responseVersion && Number(selectedSolicitudId) === Number(responseSolicitudId)
);
