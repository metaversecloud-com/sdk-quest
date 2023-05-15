import React, { useState } from "react";
import { Admin } from "../admin";
import { Leaderboard } from "../leaderboard";

// components
import {
  Grid,
  // TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";

// context
import {
  // fetchWorld, useGlobalDispatch,
  useGlobalState,
} from "@context";

export function Home() {
  // const [droppedAsset, setDroppedAsset] = useState();
  const [toggle, setToggle] = useState("leaderboard");

  // context
  // const globalDispatch = useGlobalDispatch();
  const {
    hasInteractiveParams,
    visitor,
    // selectedWorld
  } = useGlobalState();

  if (!hasInteractiveParams)
    return <Typography>You can only access this application from within a Topia world embed.</Typography>;

  return (
    <>
      <Grid container direction="column" justifyContent="space-around" p={3}>
        <Grid item>
          <Grid alignItems="center" container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="h4">Egg Hunter</Typography>
            </Grid>
            {visitor && visitor.isAdmin && (
              <Grid item xs={12}>
                <ToggleButtonGroup
                  aria-label="Admin vs Leaderboard"
                  color="primary"
                  exclusive
                  onChange={(e) => setToggle(e.target.value)}
                  value={toggle}
                >
                  <ToggleButton value="leaderboard">Leaderboard</ToggleButton>
                  <ToggleButton value="admin">Admin</ToggleButton>
                </ToggleButtonGroup>
              </Grid>
            )}
            {toggle === "admin" ? <Admin /> : <Leaderboard />}
          </Grid>
        </Grid>
      </Grid>
    </>
  );
}
