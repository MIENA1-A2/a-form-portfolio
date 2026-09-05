// Local dev and the separately built preview never connect to cloud drafts.
export const cloudEnabled = import.meta.env.VITE_STUDIO_MODE === 'cloud';
