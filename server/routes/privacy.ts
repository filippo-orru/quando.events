export default defineEventHandler(async (event) => {
  return sendRedirect(event, `/privacy.html`);
})
