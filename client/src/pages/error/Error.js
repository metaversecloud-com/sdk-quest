import React from "react";

// components
import Grid from "@mui/material/Grid";

export function Error() {
  return (
    <Grid
      container
      sx={{
        height: "100vh",
        width: "100vw",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        position: "absolute",
        top: 0,
        left: 0,
      }}
    >
      <h1>404</h1>
      <h5>Oops. Looks like the page you&apos;re looking for no longer exists.</h5>
    </Grid>
  );
}
