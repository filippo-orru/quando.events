import { getUserByToken } from "../utils/db/users";

export default defineEventHandler(async (event) => {
  if (!(event.node.req.url || "").startsWith("/api/")) {
    return;
  }

  let accessToken = event.headers.get("Authorization");
  if (!accessToken) {
    console.log("Missing token in url", event.node.req.url);
    return;
  }
  let [userId, token] = accessToken.split("##");
  if (!userId || !token) {
    console.log("Bad token");
    return;
  }
  let user = await getUserByToken(userId, token);
  // console.log("User authorized", user);
  event.context.authorizedUser = user;
})
