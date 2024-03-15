export default defineEventHandler(async (event) => {
  let user = await createUser();
  return {
    id: user.id,
    token: user.tokens[0]!
  };
})
