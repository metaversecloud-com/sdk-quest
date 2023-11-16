import React, { useEffect } from "react";

// components
import { Layout } from "@components";
import { Grid } from "@mui/material";

// context
import { useGlobalState } from "@context";

// utils
import { backendAPI } from "@utils";

export function Home() {
  const { hasInteractiveParams } = useGlobalState();

  useEffect(() => {
    if (hasInteractiveParams) backendAPI.post("/key-asset-id");
  }, [hasInteractiveParams]);

  if (!hasInteractiveParams) {
    return <h4>You can only access this application from within a Topia world embed.</h4>;
  }

  return (
    <Grid alignItems="center" container direction="column" p={0}>
      <Layout />
    </Grid>
  );
}
