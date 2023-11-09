import React, { useEffect } from "react";

// components
import { Layout } from "@components";
import { Grid, Typography } from "@mui/material";

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
    return <Typography>You can only access this application from within a Topia world embed.</Typography>;
  }

  return (
    <Grid alignItems="center" container direction="column" p={0}>
      <Layout />
    </Grid>
  );
}
