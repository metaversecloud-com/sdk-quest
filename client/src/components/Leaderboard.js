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
    console.log(data.length, leaderboardData.length);
    if (data.length < leaderboardData.length) {
      setData(leaderboardData.slice(0, data.length + 20));
    } else {
      setHasMore(false);
    }
  };

  const cellRenderer = ({ columnIndex, key, rowIndex, style }) => {
    const cellStyle = {
      ...style,
      padding: `${rowIndex === 0 ? 0 : 0}px 10px`, // Match row height
      margin: `${rowIndex === 0 ? 10 : 0}px 0`, // Match row height
      lineHeight: `${rowIndex === 0 ? 40 : 30}px`, // Match row height
      boxShadow: "0px 1px 0px #E8E8E8",
    };

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
        <Box key={key} style={cellStyle}>
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
        <Box
          key={key}
          style={item.profileId === visitor.profileId ? { ...cellStyle, background: "lightgray" } : cellStyle}
        >
          <Box sx={{ padding: "5px 0px" }}>
            <Typography>{content}</Typography>
          </Box>
        </Box>
      );
    }
  };

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
      <Box sx={{ height: "100%", backgroundColor: "white", borderRadius: 5, width: "100%" }}>
        <AutoSizer>
          {({ height, width }) => (
            <MultiGrid
              cellRenderer={cellRenderer}
              columnCount={3}
              columnWidth={({ index }) => (index === 0 ? width / 5 : index === 1 ? width / 2.5 : width / 3)} // 50px for the first column, 100px for the others
              fixedRowCount={1}
              height={height}
              onSectionRendered={({ rowStopIndex }) => {
                // Load more rows when we've rendered the last row
                if (rowStopIndex === data.length - 1 && hasMore) {
                  loadMoreRows();
                }
              }}
              rowCount={data.length + 1} // Plus 1 for header row
              rowHeight={({ index }) => (index === 0 ? 40 : 30)} // 50px for body rows, 30px for the header
              width={width}
            />
          )}
        </AutoSizer>
      </Box>
    </Grid>
  );
}
