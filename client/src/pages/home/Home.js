import React from "react";

// components
import { Layout } from "@components";
import { Grid, Typography } from "@mui/material";

// context
import { useGlobalState } from "@context";

export function Home() {
  // context
  const { hasInteractiveParams } = useGlobalState();

  if (!hasInteractiveParams) {
    return <Typography>You can only access this application from within a Topia world embed.</Typography>;
  }

  return (
    <Grid alignItems="center" container direction="column" p={0}>
      <Layout />
    </Grid>
  );
}
