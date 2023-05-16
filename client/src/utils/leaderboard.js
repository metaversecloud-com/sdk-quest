import { backendAPI } from "@utils";

export const getLeaderboardData = async ({ setLeaderboardData, globalDispatch }) => {
  const result = await backendAPI.get("/egg-leaderboard");
  let { leaderboard, success } = result.data;
  if (success) {
    setLeaderboardData({
      dispatch: globalDispatch,
      leaderboardData: leaderboard,
    });
  } else return console.log("ERROR getting data object");
};
