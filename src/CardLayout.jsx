import { Box, Card, CardContent, CardMedia, Grid, Tooltip, Typography } from "@mui/material";
import React, { useState } from "react";
import InfoIcon from "@mui/icons-material/Info";
import HoveredDetails from "./HoveredDetails";

const CardLayout = ({handleSelect,setHoveredMovie,movie,iconRefs,setBoxPosition,fetchMovieDetails,hoveredMovie,boxPosition,isFetching}) => {
  const [visible, setVisible] = useState(false);
  return (
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
        <CardMedia
          component="img"
          height="265" //265
          width="185" //185
          style={{ objectFit: "cover" }}
          image={isFetching ? "https://placehold.co/300x300/yellow/black?text=Loading..." :
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

            const details = await fetchMovieDetails(movie.imdbID);
            setHoveredMovie(details);
          }}
          //   onMouseLeave={() => setHoveredMovie(null)}
        >
          <InfoIcon />
        </Box>
      </Card>
      {hoveredMovie?.imdbID === movie.imdbID && (
        <HoveredDetails boxPosition={boxPosition} hoveredMovie={hoveredMovie} setVisible={setVisible} visible={visible} />
      )}
    </Grid>
  );
};

export default CardLayout;
