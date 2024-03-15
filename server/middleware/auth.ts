import { getUserByToken } from "../utils/db/users";

export default defineEventHandler(async (event) => {
  let token = event.headers.get("Authorization");
  if (!token || token.split("##").length != 2) {
    console.log("User unauthorized");
    return;
  }
  let user = await getUserByToken(
    token.split("##")[0],
    token.split("##")[1]
  );
  console.log("User authorized", user);
  event.context.authorizedUser = user;
})
