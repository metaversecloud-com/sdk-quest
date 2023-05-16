import React, { useEffect, useState } from "react";

// components
import { Box, Grid, Typography } from "@mui/material";

// React virtualized for infinite scroll
import { AutoSizer, MultiGrid } from "react-virtualized";

// context
import { useGlobalState } from "@context";

// utils
// import { backendAPI } from "@utils";

export function Leaderboard() {
  const {
    // hasInteractiveParams,
    leaderboardData,
    visitor,
    // world,
  } = useGlobalState();
  const [data, setData] = useState([]);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    if (leaderboardData && leaderboardData.length) setData(leaderboardData.slice(0, 20));
  }, [leaderboardData]);

  const loadMoreRows = () => {
    if (data.length < leaderboardData.length) {
      setData(leaderboardData.slice(0, data.length + 20));
    } else {
      setHasMore(false);
    }
  };

  // const handleScroll = ({ clientHeight, scrollHeight, scrollTop }) => {
  //   const bottomReached = scrollTop + clientHeight >= scrollHeight;
  //   if (bottomReached && hasMore) {
  //     loadMoreRows();
  //   }
  // };

  // const rowGetter = ({ index }) => data[index];

  const cellRenderer = ({ columnIndex, key, rowIndex, style }) => {
    if (rowIndex === 0) {
      // Render headers
      let content;
      switch (columnIndex) {
        case 0:
          content = "Rank";
          break;
        // case 1:
        //   content = "Avatar";
        //   break;
        case 1:
          content = "Name";
          break;
        case 2:
          content = "Collected";
          break;
        default:
          content = "";
      }
      return (
        <Box key={key} style={style}>
          <Typography>{content}</Typography>
        </Box>
      );
    } else {
      // Render body rows
      const item = data[rowIndex - 1]; // Subtract 1 for header row
      let content;
      switch (columnIndex) {
        case 0:
          content = rowIndex;
          break;
        // case 1:
        //   content = <img alt="avatar" src={item.avatar}  style={{ height: 20, width: 20 }} />;
        //   break;
        case 1:
          content = item.name;
          break;
        case 2:
          content = item.collected;
          break;
        default:
          content = "";
      }
      return (
        <Box key={key} style={style}>
          <Typography>{content}</Typography>
        </Box>
      );
    }
  };

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

  // const rowRenderer = ({ index, key, parent, style }) => {
  //   const data = leaderboardData[index];
  //   return (
  //     <CellMeasurer cache={cache} columnIndex={0} key={key} parent={parent} rowIndex={index}>
  //       <div style={style}>
  //         <ListItem>
  //           <ListItemText primary={`${data.name} - ${data.collected}`} />
  //         </ListItem>
  //       </div>
  //     </CellMeasurer>
  //   );
  // };

  if (!visitor || !leaderboardData) return;

  return (
    <Grid
      container
      direction="column"
      justifyContent="space-around"
      mt={3}
      p={3}
      sx={{ height: "50vh", background: "linear-gradient(90deg, #6441A5 0%, #2A0845 100%)", borderRadius: 15 }}
    >
      <Box sx={{ height: "100%", backgroundColor: "white", borderRadius: 8, width: "100%" }}>
        <AutoSizer>
          {({ height, width }) => (
            <MultiGrid
              cellRenderer={cellRenderer}
              columnCount={3}
              columnWidth={width * 0.3}
              fixedRowCount={1}
              height={height}
              onSectionRendered={({ rowStopIndex }) => {
                // Load more rows when we've rendered the last row
                if (rowStopIndex === data.length && hasMore) {
                  loadMoreRows();
                }
              }}
              rowCount={data.length + 1} // Plus 1 for header row
              rowHeight={30}
              width={width}
            />
          )}
        </AutoSizer>
      </Box>
    </Grid>
  );

  // return (
  //   <Grid
  //     container
  //     direction="column"
  //     justifyContent="space-around"
  //     mt={3}
  //     p={3}
  //     sx={{ height: "50vh", background: "linear-gradient(90deg, #6441A5 0%, #2A0845 100%)", borderRadius: 15 }}
  //   >
  //     <Box sx={{ height: "100%", backgroundColor: "white", borderRadius: 8, width: "100%" }}>
  //       <AutoSizer>
  //         {({ height, width }) => (
  //           <Table
  //             headerHeight={60}
  //             height={height}
  //             onScroll={handleScroll}
  //             rowCount={data.length}
  //             rowGetter={rowGetter}
  //             rowHeight={30}
  //             width={width}
  //           >
  //             {/* <Column
  //             label='Rank'
  //             dataKey='rank'
  //             width={50}
  //             cellRenderer={({ cellData }) => <Typography>{cellData}</Typography>}
  //           /> */}
  //             {/* <Column
  //             label='Avatar'
  //             dataKey='avatar'
  //             width={50}
  //             cellRenderer={({ cellData }) => <img src={cellData} alt="avatar" style={{ height: 20, width: 20 }} />}
  //           /> */}
  //             <Column
  //               cellRenderer={({ cellData }) => <Typography>{cellData}</Typography>}
  //               dataKey="name"
  //               label="Name"
  //               width={width * 0.2}
  //             />
  //             <Column
  //               cellRenderer={({ cellData }) => <Typography>{cellData}</Typography>}
  //               dataKey="collected"
  //               label="Collected"
  //               width={width * 0.2}
  //             />
  //           </Table>
  //         )}
  //       </AutoSizer>
  //     </Box>
  //   </Grid>
  // );

  // return (
  //   <>
  //     <Grid
  //       container
  //       direction="column"
  //       justifyContent="space-around"
  //       mt={3}
  //       p={3}
  //       sx={{ height: "100%", background: "linear-gradient(90deg, #6441A5 0%, #2A0845 100%)", borderRadius: 15 }}
  //     >
  //       <Grid item>{/* <Typography>{world.name} Leaderboard</Typography> */}</Grid>
  //       {/* <Typography>Welcome {visitor.username}!</Typography> */}
  //       <Grid item p={2} sx={{ height: "50vh", backgroundColor: "white", borderRadius: 8 }}>
  //         <AutoSizer>
  //           {({ height, width }) => (
  //             <List
  //               deferredMeasurementCache={cache}
  //               height={height}
  //               // onRowsRendered={({ overscanStopIndex }) => {
  //               //   if (hasMore && overscanStopIndex === leaderboardData.length - 1) {
  //               //     fetchData();
  //               //   }
  //               // }}
  //               overscanRowCount={1}
  //               rowCount={leaderboardData.length}
  //               rowHeight={cache.rowHeight}
  //               rowRenderer={rowRenderer}
  //               width={width}
  //             />
  //           )}
  //         </AutoSizer>
  //       </Grid>
  //     </Grid>
  //   </>
  // );
}
