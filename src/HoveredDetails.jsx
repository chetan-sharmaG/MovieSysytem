import { Box, Tooltip, Typography } from "@mui/material";
import React, { useEffect } from "react";

const HoveredDetails = ({ boxPosition, hoveredMovie ,setVisible,visible}) => {
 

  useEffect(() => {
    setVisible(true);
  }, [hoveredMovie]);

  return (
    <Box
      className="details"
      sx={{
        top: boxPosition.top + 20,
        left: boxPosition.left - 180,
        position: "absolute",
        bgcolor: "rgba(20,20,20,0.8)", // glass effect
        backdropFilter: "blur(4px)",
        color: "white",
        p: 2,
        borderRadius: "8px",
        width: "300px",
        zIndex: 10,
        boxShadow: "0px 0px 12px rgba(0,0,0,0.6)",
        display: "flex",
        flexDirection: "column",
        gap: 1,
        opacity: visible ? 1 : 0,
        transition: "opacity 0.4s ease",
        pointerEvents: visible ? "auto" : "none",
      }}
      //   onMouseLeave={() => setHoveredMovie(null)}
    >
      <video
        height="200px"
        controls
        muted
        autoPlay
        loop
        poster={hoveredMovie.Poster}
        style={{ borderRadius: "8px", transition: "opacity 0.5s ease-in" }}
      >
        <source
          src={`https://imdb.iamidiotareyoutoo.com/media/${hoveredMovie.imdbID}`}
          type="video/mp4"
        />
        Your browser does not support the video tag.
      </video>
      {/* {!loading && <img
        src={hoveredMovie.Poster}
        alt={hoveredMovie.Title}
        style={{
          maxWidth: "100%",
          maxHeight: "100px",
          objectFit: "cover",
          objectPosition: "center",
          marginTop: "0px",
        }}
      />} */}

      <Typography variant="h6" fontWeight="bold">
        {hoveredMovie.Title}
      </Typography>
      <Tooltip title={hoveredMovie.Plot} placement="right">
        <Typography variant="body2" color="#ccc">
          {hoveredMovie.Plot?.slice(0, 120) || "No Plot Available"}
          ...
        </Typography>
      </Tooltip>

      <Box display="flex" flexWrap="wrap" gap={1} mt={1}>
        {hoveredMovie.Genre?.split(",").map((genre) => (
          <Box
            key={genre}
            sx={{
              bgcolor: "#e50914",
              color: "white",
              px: 1,
              py: 0.2,
              borderRadius: "20px",
              fontSize: "0.7rem",
              fontWeight: 600,
            }}
          >
            {genre}
          </Box>
        ))}
      </Box>
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        mt={1}
        borderTop="1px solid #333"
        pt={1}
      >
        <Typography variant="caption" color="#aaa">
          IMDb Rating:
        </Typography>
        <Box
          sx={{
            bgcolor: "#ffc107",
            color: "#000",
            px: 1,
            py: 0.2,
            borderRadius: "4px",
            fontSize: "0.75rem",
            fontWeight: "bold",
          }}
        >
          {hoveredMovie.imdbRating}
        </Box>
      </Box>
      <Typography variant="caption" color="#aaa">
        IMDb Votes: {hoveredMovie?.imdbVotes}
      </Typography>
      <Typography variant="caption" color="#aaa" mt={1}>
        Actors: {hoveredMovie.Actors}
      </Typography>

      <Typography variant="caption" color="#aaa">
        Language: {hoveredMovie.Language}
      </Typography>
      <Typography variant="caption" color="#aaa" mt={0}>
        Country: {hoveredMovie.Country}
      </Typography>
      <Box sx={{ mt: 2 }}>
        <a
          href={`https://www.imdb.com/title/${hoveredMovie.imdbID}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{ textDecoration: "none" }}
        >
          <Box
            sx={{
              bgcolor: "#e50914",
              color: "#fff",
              textAlign: "center",
              py: 0.7,
              borderRadius: "4px",
              fontWeight: "600",
              fontSize: "0.85rem",
              "&:hover": { opacity: 0.9 },
            }}
          >
            More Info on IMDb
          </Box>
        </a>
      </Box>
    </Box>
  );
};

export default HoveredDetails;
