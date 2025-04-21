import { Box, Card, CardContent, CardMedia, CircularProgress, Grid, Tooltip, Typography } from "@mui/material";
import React, { useEffect, useState } from "react";
import InfoIcon from "@mui/icons-material/Info";
import HoveredDetails from "./HoveredDetails";

const CardLayout = ({handleSelect,setHoveredMovie,movie,iconRefs,setBoxPosition,fetchMovieDetails,hoveredMovie,boxPosition,isFetching}) => {
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  
  return (
    <Grid
      item
      // xs={12}
      // sm={6}
      // md={4}
      size={{xs:12,sm:6,md:4}}
      key={movie.imdbID}
      onClick={() => handleSelect(movie)}
      className="movie-card"
      sx={{
        transition: "transform 0.3s",
       
      }}
      onMouseLeave={() => {
        setHoveredMovie(null);
        setVisible(false);

      }}
    >
      <Card
        sx={{
          position: "relative",
          bgcolor: "transparent",
          "&:hover": { transform: "scale(1.02)" },
          "&:hover .info-icon": { opacity: 1 },
        }}
      >
      <Box sx={{height:"265px",width:"185px",position:"relative"}} >
        {loading && (
        <CircularProgress   sx={{ height: "50px", width: "50px",color: "red",position: "absolute", top: "50%", left: "50%" }} />
      )}

        <CardMedia
          component="img"
          height="265" //265
          width="185" //185
          style={{ objectFit: "cover",opacity: loading ? 0.5 : 1 }}
          image={
            movie.Poster
              ? movie.Poster
              : `https://placehold.co/300x300/1f1f1f/white?text=${movie.Title}&font=Poppins`
          }
          alt={movie.Title}
          />
          </Box>
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
        </CardContent>

        <Box
          ref={(el) => (iconRefs.current[movie.imdbID] = el)}
          sx={{
            position: "absolute",
            top: 10,
            right: 0,
            color: "white",
            cursor: "pointer",
            opacity: 0.4,
            transition: "opacity 0.3s",
            "&:hover": { opacity: 1 },
          }}
          onMouseEnter={async (e) => {
            const rect = iconRefs.current[movie.imdbID].getBoundingClientRect();
            setBoxPosition({
              top: rect.top + window.scrollY,
              left: rect.left + window.scrollX,
            });
            setLoading(true);
            const details = await fetchMovieDetails(movie.imdbID);
            console.log(details);
            // setHoveredMovie(details);
            setLoading(false);
            if (details?.imdbId === movie.imdbID) {
              setHoveredMovie(details);
            }
          }}
          //   onMouseLeave={() => setHoveredMovie(null)}
        >
          <InfoIcon />
        </Box>
      </Card>
      
      {hoveredMovie?.imdbId === movie.imdbID && (
        <HoveredDetails boxPosition={boxPosition} hoveredMovie={hoveredMovie} setVisible={setVisible} visible={visible} />
      )}
    </Grid>
  );
};

export default CardLayout;
