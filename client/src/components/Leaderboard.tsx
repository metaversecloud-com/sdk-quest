import { useContext, useEffect, useState } from "react";

// components
import { Loading } from "./Loading";

// utils
import { backendAPI } from "@utils/backendAPI";

// context
import { GlobalStateContext } from "@context/GlobalContext";

export const Leaderboard = () => {
  const [visibleData, setVisibleData] = useState([]);
  const [total, setTotal] = useState();
  const [currentPosition, setCurrentPosition] = useState(0);
  const [myData, setMyData] = useState({ streak: 0, collected: 0 });
  const [isLoading, setIsLoading] = useState(true);

  // context
  const { questDetails, visitor } = useContext(GlobalStateContext);
  const { questItemImage } = questDetails

  useEffect(() => {
    backendAPI.get(`/leaderboard`)
      .then((result) => {
        const { leaderboard } = result.data;
        const index = leaderboard.findIndex((item: any) => item.profileId === visitor.profileId);
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
          <h4 className="h4">My Stats</h4>
          <table className="table">
            <thead>
              <tr>
                <th className="h5">Current Position</th>
                <th className="h5">Streak</th>
                <th className="h5">Collected</th>
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
        <p className="p1">
          Explore and find <img alt="Find me" className="inline" style={{ height: 20 }} src={questItemImage} /> to complete your daily quest.
        </p>
      )}
      <div className="mt-6">
        <h4 className="h4">Leaderboard</h4>
        <table className="table">
          <thead>
            <tr>
              <th></th>
              <th className="h5">Name</th>
              <th className="h5">Streak</th>
              <th className="h5">Collected</th>
            </tr>
          </thead>
          <tbody>
            {visibleData.map((item: { collected: number, name: string, streak: number }, index) => {
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
