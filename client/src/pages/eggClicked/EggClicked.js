import React, { useCallback, useEffect, useState } from "react";
import { Admin, Leaderboard } from "../../components";

// components
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Grid,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import { ExpandMore } from "@mui/icons-material";

// context
import {
  // fetchWorld,
  setLeaderboardData,
  useGlobalDispatch,
  useGlobalState,
} from "@context";

import { getLeaderboardData } from "@utils/leaderboard";

import { backendAPI } from "@utils";

export function EggClicked() {
  const [message, setMessage] = useState("");
  const [collectedText, setCollectedText] = useState("");
  const [eggImage, setEggImage] = useState("");
  const [toggle, setToggle] = useState("leaderboard");
  const {
    hasInteractiveParams,
    visitor,
    // selectedWorld
  } = useGlobalState();

  // Get dropped eggs info
  useEffect(() => {
    if (hasInteractiveParams) {
      getEggImage();
    }
  }, [hasInteractiveParams]);

  const getEggImage = async () => {
    try {
      const result = await backendAPI.get("/egg-image");
      if (result.data.success) {
        setEggImage(result.data.eggImage);
      } else return console.log("ERROR getting egg image");
    } catch (error) {
      console.log(error);
    }
  };

  // context
  const globalDispatch = useGlobalDispatch();

  const handleEggClicked = useCallback(async () => {
    try {
      const result = await backendAPI.post("/egg-clicked");
      const { addedClick, numberAllowedToCollect, numberCollected, success } = result.data;

      if (addedClick) {
        //   let numString = "";
        //   switch (numberCollected) {
        //     case 1:
        //       numString = "first";
        //       break;
        //     case 2:
        //       numString = "second";
        //       break;
        //     case 3:
        //       numString = "third";
        //       break;
        //     case 4:
        //       numString = "fourth";
        //       break;
        //     case 5:
        //       numString = "fifth";
        //       break;
        //     case 6:
        //       numString = "sixth";
        //       break;
        //     default:
        //       numString = "";
        // }
        setCollectedText(`${numberCollected}/${numberAllowedToCollect} collected today`);
        setMessage(
          `🎉 Congratulations! You are one step closer to completing your daily quest!`,

          // `You just found a ${numString} egg. ${
          //   numberCollected === numberAllowedToCollect
          //     ? "Help your friends find theirs and come find more tomorrow!"
          //     : `Go find ${numberAllowedToCollect - numberCollected} more!`
          // }`,
        );

        // Refresh the leaderboard
        getLeaderboardData({ setLeaderboardData, globalDispatch });
      } else if (success) {
        setMessage(`🎉 You have already completed your daily quest! Come back tomorrow!`);
        setCollectedText(`${numberAllowedToCollect}/${numberAllowedToCollect} collected today`);
        // setMessage(
        //   `You already found ${numberAllowedToCollect} ${
        //     numberAllowedToCollect === 1 ? "egg" : "eggs"
        //   } today. Help your friends find theirs and come find more tomorrow!`,
        // );
      } else return console.log("ERROR getting data object");
    } catch (error) {
      console.log(error);
    }
  }, [globalDispatch]);

  // Get dropped eggs info
  useEffect(() => {
    if (hasInteractiveParams) handleEggClicked();
  }, [hasInteractiveParams, handleEggClicked]);

  if (!hasInteractiveParams)
    return <Typography>You can only access this application from within a Topia world embed.</Typography>;

  return (
    <Grid alignItems="center" container direction="column" p={0}>
      <Grid item p={3} paddingBottom={0} paddingTop={0} xs={12}>
        {eggImage ? <img alt="Find me" src={eggImage} /> : <div />}
      </Grid>
      <Grid item p={3} paddingBottom={1} paddingTop={0} xs={12}>
        <Typography variant="h4">Quest</Typography>
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
            <ToggleButton style={{ padding: 20 }} value="leaderboard">
              Leaderboard
            </ToggleButton>
            <ToggleButton style={{ padding: 20 }} value="admin">
              Admin
            </ToggleButton>
          </ToggleButtonGroup>
        </Grid>
      )}
      <Grid container direction="column">
        {toggle !== "admin" && message && (
          <Grid item p={1} paddingTop={0}>
            <Accordion>
              <AccordionSummary
                aria-controls="panel1a-content"
                expandIcon={<ExpandMore />}
                id="panel1a-header"
                style={{ height: 40, minHeight: 40 }}
              >
                <Typography>How To: Your Daily Quest</Typography>
              </AccordionSummary>
              <AccordionDetails style={{ padding: 0 }}>
                <Typography>
                  <ul>
                    <li>
                      Search the world to find <img alt="Find me" height={20} src={eggImage} />
                    </li>
                    <li>Collect up to 5 per day</li>
                    <li>Keep up your daily quest to stay on top of the leaderboard</li>
                  </ul>
                </Typography>
              </AccordionDetails>
            </Accordion>
          </Grid>
        )}
      </Grid>
      <Grid container direction="column">
        {toggle !== "admin" && message && (
          <Grid item p={1} paddingTop={0}>
            <Typography>{message}</Typography>
          </Grid>
        )}
        {toggle !== "admin" && collectedText && (
          <Grid item p={1} paddingTop={0}>
            <Typography>{collectedText}</Typography>
          </Grid>
        )}
        {toggle === "admin" ? <Admin /> : <Leaderboard />}
      </Grid>
    </Grid>
  );
}
