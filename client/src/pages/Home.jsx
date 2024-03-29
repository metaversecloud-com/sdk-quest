import React, { useContext, useEffect, useState } from "react";

// components
import { Admin, Leaderboard, Loading } from "@components";

// utils
import { backendAPI } from "@utils/backendAPI";

// context
import { GlobalDispatchContext, GlobalStateContext } from "@context/GlobalContext";
import { SET_KEY_ASSET_IMAGE } from "@context/types";

export const Home = () => {
  const [activeTab, setActiveTab] = useState("leaderboard");
  const [isLoading, setIsLoading] = useState(true);

  // context
  const dispatch = useContext(GlobalDispatchContext);
  const { keyAssetImage, visitor } = useContext(GlobalStateContext);

  useEffect(() => {
    backendAPI.get("/key-asset-image")
      .then((result) => {
        if (result.data.success) {
          dispatch({
            type: SET_KEY_ASSET_IMAGE,
            payload: result.data.keyAssetImage,
          });
        } else {
          return console.error("ERROR getting key asset image");
        }
      }
      )
      .catch((error) => console.error(error))
      .finally(() => setIsLoading(false))
  }, []);

  if (isLoading) return <Loading />;

  return (
    <div className="container p-6 items-center justify-center">
      {visitor && visitor.isAdmin && (
        <div className="flex flex-col items-end mb-6">
          <div className="tab-container">
            <button
              className={activeTab !== "admin" ? "btn" : "btn btn-text"}
              onClick={() => setActiveTab("leaderboard")}
            >
              Leaderboard
            </button>
            <button className={activeTab === "admin" ? "btn" : "btn btn-text"} onClick={() => setActiveTab("admin")}>
              Admin
            </button>
          </div>
        </div>
      )}
      {keyAssetImage ? <img alt="Find me" className="mx-auto" src={keyAssetImage} /> : <div />}
      <div className="flex flex-col pb-4">
        <h1 className="h1 text-center pb-4">Quest</h1>
      </div>
      {activeTab === "admin" ? (
        <Admin keyAssetImage={keyAssetImage} />
      ) : (
        <Leaderboard isKeyAsset={true} keyAssetImage={keyAssetImage} />
      )}
    </div>
  );
};

export default Home