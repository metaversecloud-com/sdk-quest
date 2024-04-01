import React, { useContext, useEffect, useState } from "react";

// components
import { Loading } from "@components";

// utils
import { backendAPI } from "@utils/backendAPI";

// context
import { GlobalStateContext } from "@context/GlobalContext";

export function Leaderboard({ isKeyAsset, keyAssetImage }) {
  const [visibleData, setVisibleData] = useState([]);
  const [total, setTotal] = useState();
  const [currentPosition, setCurrentPosition] = useState(true);
  const [myData, setMyData] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  // context
  const { visitor } = useContext(GlobalStateContext);

  useEffect(() => {
    backendAPI.get(`/leaderboard?isKeyAsset=${isKeyAsset}`)
      .then((result) => {
        const { leaderboard } = result.data;
        const index = leaderboard.findIndex((item) => item.profileId === visitor.profileId);
        setMyData(leaderboard[index]);
        setCurrentPosition(index + 1);
        setTotal(leaderboard.length);
        setVisibleData(leaderboard.slice(0, 100));
        setIsLoading(false);
      })
      .catch(() => console.error("There was a problem while retrieving leaderboard data. Please try again later."))
      .finally(() => setIsLoading(false))
  }, [visitor]);

  if (isLoading) return <Loading />;

  if (visibleData.length === 0) return <p>No quest items have been found yet. Search the world and be the first!</p>;

  return (
    <div className="container">
      {currentPosition && currentPosition > 0 ? (
        <>
          <h4>My Stats</h4>
          <table className="table">
            <thead>
              <tr>
                <th>Current Position</th>
                <th>Streak</th>
                <th>Collected</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="p2">
                  {currentPosition} of {total}
                </td>
                <td className="p2">{myData.streak || 0}</td>
                <td className="p2">{myData.collected}</td>
              </tr>
            </tbody>
          </table>
        </>
      ) : (
        <div className="flex flex-col">
          <p>
            Explore and find <img alt="Find me" height={20} src={keyAssetImage} /> to complete your daily quest.
          </p>
        </div>
      )}
      <div className="mt-6">
        <h4>Leaderboard</h4>
        <table className="table">
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
                  <td className="p2">{index + 1}</td>
                  <td className="p2">{item.name}</td>
                  <td className="p2">{item.streak || 0}</td>
                  <td className="p2">{item.collected}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
