import React from "react";
import { Link } from "react-router-dom";

// components
import { Button, Grid, Paper } from "@mui/material";

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
      <Paper
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: 16,
          maxWidth: 500,
        }}
      >
        <h1>404</h1>
        <h5>Oops. Looks like the page you&apos;re looking for no longer exists.</h5>
        <h6>But we&apos;re here to bring you back to safety</h6>
        <Button
          color="primary"
          component={Link}
          size="large"
          sx={{
            textTransform: "none",
            fontSize: 22,
          }}
          to="/"
          variant="contained"
        >
          Back to Home
        </Button>
      </Paper>
    </Grid>
  );
}
