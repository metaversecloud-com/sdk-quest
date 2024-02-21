import React, { useEffect, useState } from "react";

// components
import { Admin, Leaderboard } from "@components";
import CircularProgress from "@mui/material/CircularProgress";
import Grid from "@mui/material/Grid";

// context
import { setKeyAssetImage, useGlobalDispatch, useGlobalState } from "@context";

// utils
import { backendAPI } from "@utils";

export const Home = () => {
  const [activeTab, setActiveTab] = useState("leaderboard");
  const [isLoading, setIsLoading] = useState(true);

  // context
  const { keyAssetImage, visitor } = useGlobalState();
  const globalDispatch = useGlobalDispatch();

  useEffect(() => {
    getKeyAssetImage();
    setIsLoading(false);
  }, []);

  const getKeyAssetImage = async () => {
    try {
      const result = await backendAPI.get("/key-asset-image");
      if (result.data.success) {
        setKeyAssetImage({
          dispatch: globalDispatch,
          keyAssetImage: result.data.keyAssetImage,
        });
      } else {
        return console.log("ERROR getting key asset image");
      }
    } catch (error) {
      console.log(error);
    }
  };

  if (isLoading) {
    return (
      <Grid container justifyContent="center" mt={4}>
        <CircularProgress />
      </Grid>
    );
  }

  return (
    <Grid alignItems="center" container direction="column" p={0}>
      {visitor && visitor.isAdmin && (
        <Grid item pb={2} xs={12}>
          <div className="tab-container">
            <button className={activeTab !== "admin" ? "" : "btn-text"} onClick={() => setActiveTab("leaderboard")}>
              Leaderboard
            </button>
            <button className={activeTab === "admin" ? "" : "btn-text"} onClick={() => setActiveTab("admin")}>
              Admin
            </button>
          </div>
        </Grid>
      )}
      <Grid item p={3} paddingBottom={0} paddingTop={0} xs={12}>
        {keyAssetImage ? <img alt="Find me" src={keyAssetImage} /> : <div />}
      </Grid>
      <Grid item p={3} xs={12}>
        <h1>Quest</h1>
      </Grid>
      {activeTab === "admin" ? (
        <Admin keyAssetImage={keyAssetImage} />
      ) : (
        <Leaderboard isKeyAsset={true} keyAssetImage={keyAssetImage} />
      )}
    </Grid>
  );
};
