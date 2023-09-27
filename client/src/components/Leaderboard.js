import React, { useEffect, useState } from "react";

// components
import { Box, Grid, Tooltip, Typography } from "@mui/material";

// React virtualized for infinite scroll
import { AutoSizer, CellMeasurer, CellMeasurerCache, MultiGrid } from "react-virtualized";

// context
import { useGlobalState } from "@context";

// utils
// import { backendAPI } from "@utils";

const cache = new CellMeasurerCache({
  fixedWidth: true,
  minHeight: 30, // set minimum height for rows
});

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

  const cellRenderer = ({ columnIndex, key, rowIndex, parent, style }) => {
    let cellStyle = {
      ...style,
      padding: `${rowIndex === 0 ? 0 : 10}px 10px`,
      margin: `${rowIndex === 0 ? 10 : 0}px 0`,
      // lineHeight: `${rowIndex === 0 ? 40 : 60}px`,
      // textAlign: `${columnIndex === 2 || columnIndex === 3 ? "right" : "left"}`,

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
          content = "Streak";
          break;
        case 3:
          content = "Total";
          break;
        default:
          content = "";
      }

      const tooltipTitle = columnIndex === 2 ? "# of days in a row" : columnIndex === 3 ? "Total collected" : null;

      return (
        <CellMeasurer cache={cache} columnIndex={columnIndex} key={key} parent={parent} rowIndex={rowIndex}>
          <Box style={cellStyle}>
            {tooltipTitle ? (
              <Tooltip placement="top" style={{ cursor: "pointer" }} title={tooltipTitle}>
                <Typography>{content}</Typography>
              </Tooltip>
            ) : (
              <Typography>{content}</Typography>
            )}
          </Box>
        </CellMeasurer>
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

      cellStyle = {
        ...style,
        // padding: `${rowIndex === 0 || content.length > 11 ? 0 : 10}px 10px`,
        padding: `0px 10px`,
        margin: `auto`,
        // lineHeight: 60,
        // textAlign: `${columnIndex === 2 || columnIndex === 3 ? "right" : "left"}`,
        background: item.profileId === visitor.profileId ? "lightgray" : "#FFF",
        boxShadow: "0px 1px 0px #E8E8E8",
        textAlign: columnIndex === 2 || columnIndex === 3 ? "end" : "inherit",
        paddingRight: columnIndex === 2 ? 0 : 10,
        paddingLeft: columnIndex === 0 || columnIndex === 1 ? 10 : 0,
        // borderBottom: "1px solid lightgray",
      };

      return (
        <CellMeasurer cache={cache} columnIndex={columnIndex} key={key} parent={parent} rowIndex={rowIndex}>
          <Box style={cellStyle}>
            <Box sx={{ padding: "5px 0px" }}>
              <Typography>{content}</Typography>
            </Box>
          </Box>
        </CellMeasurer>
      );
    }
  };

  if (!visitor || !leaderboardData) return;

  // const cache = new CellMeasurerCache({
  //   defaultWidth: 100,
  //   minWidth: 75,
  //   fixedHeight: true,
  // });

  return (
    <Grid
      container
      direction="column"
      justifyContent="space-around"
      mt={1}
      p={3}
      paddingTop={0}
      sx={{
        height: "60vh",
        // background: "linear-gradient(90deg, #6441A5 0%, #2A0845 100%)",
        border: "8px solid black",
        borderRadius: 15,
      }}
    >
      <Box sx={{ height: "100%", backgroundColor: "white", borderRadius: 5, width: "100%" }}>
        <AutoSizer>
          {({ height, width }) => (
            <MultiGrid
              cellRenderer={cellRenderer}
              columnCount={4}
              columnWidth={({ index }) =>
                index === 0 ? width / 6 : index === 1 ? width / 2.5 : index == 2 ? width / 5 : width / 6
              } // 50px for the first column, 100px for the others
              // deferredMeasurementCache={cache}
              deferredMeasurementCache={cache}
              fixedRowCount={1}
              height={height}
              onSectionRendered={({ rowStopIndex }) => {
                // Load more rows when we've rendered the last row
                if (rowStopIndex === data.length - 1 && hasMore) {
                  loadMoreRows();
                }
              }}
              rowCount={data.length + 1} // Plus 1 for header row
              // rowHeight={({ index }) => (index === 0 ? 40 : 30)} // 50px for body rows, 30px for the header
              // rowHeight={({ index }) => (index === 0 ? 40 : 60)} // 60px for body rows, 40px for the header
              rowHeight={cache.rowHeight}
              width={width}
            />
          )}
        </AutoSizer>
      </Box>
    </Grid>
  );
}
