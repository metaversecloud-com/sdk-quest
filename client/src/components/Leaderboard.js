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
    if (leaderboardData && leaderboardData.length) setData(leaderboardData.slice(0, 25));
  }, [leaderboardData]);

  const loadMoreRows = () => {
    if (data.length < leaderboardData.length) {
      setData(leaderboardData.slice(0, data.length + 25));
    } else {
      setHasMore(false);
    }
  };

  const cellRenderer = ({ columnIndex, key, rowIndex, style }) => {
    const cellStyle = {
      ...style,
      padding: `${rowIndex === 0 ? 0 : 0}px 10px`,
      margin: `${rowIndex === 0 ? 10 : 0}px 0`,
      lineHeight: `${rowIndex === 0 ? 40 : 30}px`,
      // textAlign: `${columnIndex === 2 || columnIndex === 3 ? "right" : "left"}`,

      boxShadow: "0px 1px 0px #E8E8E8",
    };

    if (rowIndex === 0) {
      // Render headers
      let content;
      switch (columnIndex) {
        case 0:
          content = "";
          break;
        // case 1:
        //   content = "Avatar";
        //   break;
        case 1:
          content = "Name";
          break;
        case 2:
          content = "Streak";
          break;
        case 3:
          content = "Total";
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
          content = `${item.streak ? item.streak : 0} ⚡`;
          break;
        case 3:
          content = item.collected;
          break;
        default:
          content = "";
      }

      let cellStyle = {
        ...style,
        // padding: `${rowIndex === 0 || content.length > 11 ? 0 : 10}px 10px`,
        padding: `5px 10px`,
        // lineHeight: content.length > 11 ? 60 : 30,
        // height: 60,
        // margin: "auto",
        // textAlign: `${columnIndex === 2 || columnIndex === 3 ? "right" : "left"}`,
        background: item.profileId === visitor.profileId ? "lightgray" : "#FFF",
        boxShadow: "0px 1px 0px #E8E8E8",
        textAlign: columnIndex === 2 || columnIndex === 3 ? "end" : "inherit",
        paddingRight: columnIndex === 2 ? 0 : 10,
        paddingLeft: columnIndex === 0 || columnIndex === 1 ? 10 : 0,
        // borderBottom: "1px solid lightgray",
      };

      return (
        <Box ref={registerChild} style={cellStyle}>
          <Typography>{content}</Typography>
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
      mt={1}
      p={2}
      paddingTop={0}
      sx={{
        height: "60vh",
        // background: "linear-gradient(90deg, #6441A5 0%, #2A0845 100%)",
        border: "8px solid black",
        borderRadius: 12,
        width: "100%",
      }}
    >
      <Box sx={{ height: "100%", backgroundColor: "white", borderRadius: 5, width: "100%" }}>
        <AutoSizer>
          {({ height, width }) => (
            <MultiGrid
              cellRenderer={cellRenderer}
              columnCount={4}
              columnWidth={({ index }) =>
                index === 0 ? width / 7.9 : index === 1 ? width / 2 : index == 2 ? width / 5.2 : width / 6
              } // 50px for the first column, 100px for the others
              fixedRowCount={1}
              height={height}
              onSectionRendered={({ rowStopIndex }) => {
                // Load more rows when we've rendered the last row
                if (rowStopIndex === data.length - 2 && hasMore) {
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
