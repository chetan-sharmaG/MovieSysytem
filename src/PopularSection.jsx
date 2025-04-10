import React, { useState } from "react";
import {
  trendingAnime,
  trendingHollywood,
  trendingMovies,
  trendingShows,
} from "./constant";
import {
  Card,
  CardContent,
  CardMedia,
  Grid,
  Stack,
  Typography,
} from "@mui/material";
import { QueryClient, useQuery, useQueryClient } from "@tanstack/react-query";
import InfoIcon from '@mui/icons-material/Info';
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
const fetchMovieDetails = async (imdbID) => {
    const data = JSON.parse(sessionStorage.getItem("movieDetails")) || [];
  
    if (!data.find((item) => item.imdbID === imdbID)) {
      const response = await fetch(
        `https://www.omdbapi.com/?apikey=8ef9ee99&i=${imdbID}&plot=full`
      );
  
      const movieDetails = await response.json();
  
      sessionStorage.setItem("movieDetails", JSON.stringify([...data, movieDetails]));
  
      return movieDetails;
    }
  
    return data.find((item) => item.imdbID === imdbID);
  };
  
const PopularSection = ({handleSelect}) => {
const queryClient = useQueryClient();
const [currentMovieId, setCurrentMovieId] = useState(null);

  const { refetch, isFetching } = useQuery({
    queryKey: ["movieDetails"],
    queryFn: () => fetchMovieDetails(currentMovieId),
    enabled: false,
  })

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
                <Grid
                  item
                  xs={12}
                  sm={6}
                  md={4}
                  key={movie.imdbID}
                  onClick={() => handleSelect(movie)}
                  sx={{
                    transition: "transform 0.3s",
                    cursor: "pointer",
                    width: "185px",
                    minWidth: "185px",
                  }}
                >
                  <Card
                    sx={{
                      // bgcolor: "#1f1f1f",
                      bgcolor: "transparent",
                      "&:hover": { transform: "scale(1.05)" },
                    }}
                  >
                    <CardMedia
                      component="img"
                      height="265" //265
                      width="185" //185
                      style={{ objectFit: "cover" }}
                      image={
                        movie.Poster !== "N/A"
                          ? movie.Poster
                          : `https://placehold.co/300x300/yellow/black?text=${movie.Title}`
                      }
                      alt={movie.Title}
                    />
                    <CardContent sx={{ pl: 0 }}>
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
                        {movie.Title}
                      </Typography>
                      <Typography variant="body2" sx={{ color: "#b3b3b3" }}>
                        {movie.Year} | {movie.Type}
                      </Typography>
                        <InfoIcon onMouseEnter={() => fetchMovieDetails(movie.imdbID)} sx={{color:'wheat',zIndex:100,position:'absolute',top:10,right:0}}/>           
        
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Stack>
          </>
        );
      })}
    </>
  );
};

export default PopularSection;
