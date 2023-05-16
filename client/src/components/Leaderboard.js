import React from "react";

// components
import {
  Grid,
  ListItem,
  ListItemText,
  // Typography
} from "@mui/material";

// React virtualized for infinite scroll
import { AutoSizer, CellMeasurer, CellMeasurerCache, List } from "react-virtualized";

// context
import { useGlobalState } from "@context";

// utils
// import { backendAPI } from "@utils";

const cache = new CellMeasurerCache({
  fixedWidth: true,
  defaultHeight: 100,
});

export function Leaderboard() {
  const {
    // hasInteractiveParams,
    leaderboardData,
    visitor,
    world,
  } = useGlobalState();
  // const [leaderboardData, setLeaderboardData] = useState([]);
  // const [hasMore, setHasMore] = useState(true);

  // useEffect(() => {
  //   fetchData();
  // }, [visitor]);

  // const fetchData = async () => {
  //   try {
  //     const result = await backendAPI.get("/egg-leaderboard");
  //     if (result.data.success) {
  //       console.log(visitor.profileId, result.data.leaderboard);
  //       setLeaderboardData((prevData) => [...prevData, ...result.data.leaderboard]);
  //       // setLeaderboardData((prevData) => [...prevData]);
  //     } else return console.log("ERROR getting data object");
  //   } catch (error) {
  //     console.log(error);
  //   }
  // };

  const rowRenderer = ({ index, key, parent, style }) => {
    const data = leaderboardData[index];
    return (
      <CellMeasurer cache={cache} columnIndex={0} key={key} parent={parent} rowIndex={index}>
        <div style={style}>
          <ListItem>
            <ListItemText primary={`${data.name} - ${data.collected}`} />
          </ListItem>
        </div>
      </CellMeasurer>
    );
  };

  if (!visitor || !world) return;

  return (
    <>
      <Grid container direction="column" justifyContent="space-around" p={3} sx={{ height: "100%" }}>
        <Grid item>{/* <Typography>{world.name} Leaderboard</Typography> */}</Grid>
        {/* <Typography>Welcome {visitor.username}!</Typography> */}
        <Grid item sx={{ height: "50vh" }}>
          <AutoSizer>
            {({ height, width }) => (
              <List
                deferredMeasurementCache={cache}
                height={height}
                // onRowsRendered={({ overscanStopIndex }) => {
                //   if (hasMore && overscanStopIndex === leaderboardData.length - 1) {
                //     fetchData();
                //   }
                // }}
                overscanRowCount={1}
                rowCount={leaderboardData.length}
                rowHeight={cache.rowHeight}
                rowRenderer={rowRenderer}
                width={width}
              />
            )}
          </AutoSizer>
        </Grid>
      </Grid>
    </>
  );
}
