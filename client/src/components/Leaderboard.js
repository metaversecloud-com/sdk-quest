import React, { useEffect, useRef, useState } from "react";

// components
import { Accordion, AccordionDetails, AccordionSummary, Box, Grid, Tooltip, Typography } from "@mui/material";

import { ExpandMore } from "@mui/icons-material";

// React virtualized for infinite scroll
import { AutoSizer, CellMeasurer, CellMeasurerCache, MultiGrid } from "react-virtualized";

// context
import { useGlobalState } from "@context";

// utils
// import { backendAPI } from "@utils";

const cache = new CellMeasurerCache({
  fixedWidth: true,
  defaultHeight: 60, // set minimum height for rows
  minHeight: 30, // set minimum height for rows
});

export function Leaderboard(props) {
  const {
    // hasInteractiveParams,
    leaderboardData,
    visitor,
    // world,
  } = useGlobalState();

  const { eggImage } = props;
  const [data, setData] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const gridRef = useRef(null);

  useEffect(() => {
    if (leaderboardData && leaderboardData.length) {
      if (gridRef.current) {
        cache.clearAll();
        gridRef.current.forceUpdateGrids();
      }
      setData(leaderboardData.slice(0, 25));
    }
  }, [leaderboardData]);

  const loadMoreRows = () => {
    if (data.length < leaderboardData.length) {
      setData(leaderboardData.slice(0, data.length + 25));
    } else {
      setHasMore(false);
    }
  };

  const cellRenderer = ({ columnIndex, key, rowIndex, parent, style }) => (
    <CellMeasurer cache={cache} columnIndex={columnIndex} key={key} parent={parent} rowIndex={rowIndex}>
      {({ registerChild, measure }) =>
        renderCell({ columnIndex, key, registerChild, measure, rowIndex, parent, style })
      }
    </CellMeasurer>
  );

  const renderCell = ({ columnIndex, registerChild, rowIndex, style }) => {
    if (rowIndex === 0) {
      let cellStyle = {
        ...style,
        height: 60,
        padding: `0px 10px`,
        margin: `10px 0`,
        boxShadow: "0px 1px 0px #E8E8E8",
      };
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

      const tooltipTitle = columnIndex === 2 ? "# of days in a row" : columnIndex === 3 ? "Total collected" : null;

      return (
        <Box ref={registerChild} style={cellStyle}>
          {tooltipTitle ? (
            <Tooltip placement="top" style={{ cursor: "pointer" }} title={tooltipTitle}>
              <Typography>{content}</Typography>
            </Tooltip>
          ) : (
            <Typography>{content}</Typography>
          )}
        </Box>
      );
    } else {
      // Render body rows
      if (!data || !data[rowIndex - 1] || !visitor) return <div style={{ height: 30 }} />;
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

  // if (!visitor || !data || !data.length) return;

  // const cache = new CellMeasurerCache({
  //   defaultWidth: 100,
  //   minWidth: 75,
  //   fixedHeight: true,
  // });

  // console.log("Cached Row Height", cache._rowHeightCache);

  return (
    <Grid container direction="column">
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
            <Typography color="#3b5166" component="ul">
              <Typography component="li" gutterBottom>
                Search the world to find <img alt="Find me" height={20} src={eggImage} />
              </Typography>
              <Typography component="li" gutterBottom>
                Collect up to 5 per day
              </Typography>
              <Typography component="li" gutterBottom>
                Keep up your daily quest to stay on top of the leaderboard
              </Typography>
            </Typography>
          </AccordionDetails>
        </Accordion>
      </Grid>
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
                // deferredMeasurementCache={cache}
                deferredMeasurementCache={cache}
                fixedRowCount={1}
                height={height}
                onSectionRendered={({ rowStopIndex }) => {
                  // Load more rows when we've rendered the last row
                  if (rowStopIndex === data.length - 2 && hasMore) {
                    loadMoreRows();
                  }
                }}
                ref={gridRef}
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
    </Grid>
  );
}
