import React, {
  // useEffect,
  useState,
} from "react";

// components
import { Button, Grid, Typography } from "@mui/material";

// context
import { useGlobalState } from "@context";

// utils
// import { backendAPI } from "@utils";

export function Leaderboard() {
  const [position, setPosition] = useState(0);

  const {
    // hasInteractiveParams,
    visitor,
  } = useGlobalState();

  // // Get dropped eggs info
  // useEffect(() => {
  //   if (hasInteractiveParams) getDroppedEggs();
  // }, [hasInteractiveParams]);

  return (
    <>
      <Grid container direction="column" justifyContent="space-around" p={3}>
        <Grid item>{visitor && visitor.profileId}</Grid>
        <Button onClick={() => setPosition(1)}>Hi</Button>
        <Typography>{position}</Typography>
      </Grid>
    </>
  );
}
