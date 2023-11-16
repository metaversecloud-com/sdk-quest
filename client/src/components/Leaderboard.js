import React, { useEffect, useState } from "react";

// components
import { CircularProgress, Grid } from "@mui/material";

// context
import { useGlobalState } from "@context";

// utils
import { backendAPI } from "@utils";

export function Leaderboard({ isKeyAsset, keyAssetImage }) {
  const [visibleData, setVisibleData] = useState([]);
  const [total, setTotal] = useState();
  const [currentPosition, setCurrentPosition] = useState(true);
  const [myData, setMyData] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  const { visitor } = useGlobalState();

  useEffect(() => {
    const getLeaderboardData = async () => {
      try {
        const result = await backendAPI.get(`/leaderboard?isKeyAsset=${isKeyAsset}`);
        const { leaderboard } = result.data;
        const index = leaderboard.findIndex((item) => item.profileId === visitor.profileId);
        setMyData(leaderboard[index]);
        setCurrentPosition(index + 1);
        setTotal(leaderboard.length);
        setVisibleData(leaderboard.slice(0, 20));
        setIsLoading(false);
      } catch (error) {
        setIsLoading(false);
        console.log("There was a problem while retrieving leaderboard data. Please try again later.");
      }
    };
    if (visitor) getLeaderboardData();
  }, [visitor]);

  if (isLoading) return <CircularProgress />;

  return (
    <Grid container direction="column">
      {currentPosition && currentPosition > 0 ? (
        <>
          <h4>My Stats</h4>
          <table>
            <thead>
              <tr>
                <th>Current Position</th>
                <th>Streak</th>
                <th>Collected</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  {currentPosition} of {total}
                </td>
                <td>{myData.streak || 0}</td>
                <td>{myData.collected}</td>
              </tr>
            </tbody>
          </table>
        </>
      ) : (
        <Grid item>
          <h4>How To: Your Daily Quest</h4>
          <p>
            * Search the world to find <img alt="Find me" height={20} src={keyAssetImage} />
          </p>
          <p>* Collect up to 5 per day</p>
          <p>* Keep up your daily quest to stay on top of the leaderboard</p>
        </Grid>
      )}
      <Grid item mt={2}>
        <h4>Top 20</h4>
        <table>
          <thead>
            <tr>
              <th></th>
              <th>Name</th>
              <th>Streak</th>
              <th>Collected</th>
            </tr>
          </thead>
          <tbody>
            {visibleData.map((item, index) => {
              return (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{item.name}</td>
                  <td>{item.streak || 0}</td>
                  <td>{item.collected}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Grid>
    </Grid>
  );
}
