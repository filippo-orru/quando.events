export default defineEventHandler(async (event) => {
  return event.context.authorizedUser;
})
