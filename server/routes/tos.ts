export default defineEventHandler(async (event) => {
  return sendRedirect(event, `/terms-of-service.html`);
})
