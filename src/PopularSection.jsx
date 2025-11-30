import React, { useRef, useState } from "react";
import {
  trendingAnime,
  trendingHollywood,
  trendingMovies,
  trendingShows,
} from "./constant";
import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Grid,
  Stack,
  Typography,
} from "@mui/material";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchMovieDetails } from "./util";
import InfoIcon from "@mui/icons-material/Info";
import HoveredDetails from "./HoveredDetails";
import CardLayout from "./CardLayout";
const returnSection = (index) => {
  switch (index) {
    case 0:
      return trendingMovies;
    case 1:
      return trendingHollywood;
    case 2:
      return trendingShows;
    case 3:
      return trendingAnime;
  }
};
// fetchMovieDetails is provided by ./util

const PopularSection = ({ handleSelect }) => {
  const queryClient = useQueryClient();
  const [currentMovieId, setCurrentMovieId] = useState(null);
  const [hoveredMovie, setHoveredMovie] = useState(null);
  const [boxPosition, setBoxPosition] = useState({ top: 0, right: 0 });

  const iconRefs = useRef({});
  const { refetch, isFetching } = useQuery({
    queryKey: ["movieDetails"],
    queryFn: () => fetchMovieDetails(currentMovieId),
    enabled: false,
  });

  const handleMouseEnter = (imdbID) => {
    setCurrentMovieId(imdbID);
    refetch();
  };

  const MouseOut = () => {
    queryClient.cancelQueries(["movieDetails"]);
  };
  const sectionNames = [
    "Popular Bollywood Movies",
    "Popular Hollywood Movies",
    "Popular Shows",
    "Popular Anime",
  ];

  return (
    <>
      {sectionNames.map((sectionName, index) => {
        return (
          <>
            <Typography
              variant="h6"
              sx={{
                fontWeight: "600",
                color: "#fff",
                fontSize: "1rem",
                overflow: "hidden",
                WebkitLineClamp: "2",
                display: "-webkit-box",
                WebkitBoxOrient: "vertical",
              }}
            >
              {sectionName}
            </Typography>
            <Stack
              className="scrollbar"
              spacing={2}
              direction="row"
              sx={{ overflow: "scroll", width: "100%" }}
            >
              {returnSection(index).Search.map((movie) => (
               <CardLayout boxPosition={boxPosition} hoveredMovie={hoveredMovie}  setBoxPosition={setBoxPosition} setHoveredMovie={setHoveredMovie} handleSelect={handleSelect} iconRefs={iconRefs} key={movie.imdbID} movie={movie} fetchMovieDetails={fetchMovieDetails} />
              ))}
            </Stack>
          </>
        );
      })}
    </>
  );
};

export default React.memo(PopularSection);
