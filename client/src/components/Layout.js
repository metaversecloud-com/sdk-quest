import React, { useEffect, useState } from "react";

// components
import { Admin, Leaderboard } from "@components";
import { Grid, Typography } from "@mui/material";

// context
import { setKeyAssetImage, useGlobalDispatch, useGlobalState } from "@context";

// utils
import { backendAPI } from "@utils";

export function Layout({ children }) {
  const [activeTab, setActiveTab] = useState("leaderboard");
  const [isLoading, setIsLoading] = useState(true);

  // context
  const { keyAssetImage, visitor } = useGlobalState();
  const globalDispatch = useGlobalDispatch();

  useEffect(() => {
    getKeyAssetImage();
    if (isLoading) setIsLoading(false);
  }, [isLoading]);

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

  if (isLoading) return <div />;

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
        <Typography variant="h4">Quest</Typography>
      </Grid>
      <Grid container direction="column">
        {children}
      </Grid>
      {activeTab === "admin" ? <Admin keyAssetImage={keyAssetImage} /> : <Leaderboard keyAssetImage={keyAssetImage} />}
    </Grid>
  );
}
