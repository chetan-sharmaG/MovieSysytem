import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  TextField,
  Card,
  CardContent,
  CardMedia,
  Typography,
  IconButton,
  Grid,
  Skeleton,
  Button,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import { useDebounce } from "./util";

const SearchPage = () => {
  const [query, setQuery] = useState("");
  const debounce = useDebounce(query, 500);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [maxPageSize, setMaxPageSize] = useState(1);
  const [selectedMovies, setSelectedMovies] = useState([]);

  const observerRef = useRef();
  const sliderRef = useRef();

  const fetchData = async (searchQuery, pageNumber) => {
    if (!searchQuery) return;
    setLoading(true);
    try {
      const response = await fetch(
        `https://www.omdbapi.com/?apikey=8ef9ee99&s=${searchQuery}&plot=full&page=${pageNumber}`
      );
      const data = await response.json();
      setResults((prev) => [...prev, ...(data?.Search || [])]);
      setMaxPageSize(data?.totalResults);
    } catch (error) {
      console.error("Error fetching movies:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (debounce) {
      setResults([]);
      setPage(1);
      fetchData(debounce, 1);
    } else {
      setResults([]);
    }
  }, [debounce]);

  useEffect(() => {
    if (!loading && observerRef.current) {
      const observer = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && results.length < maxPageSize) {
            setPage((prev) => prev + 1);
          }
        },
        { threshold: 1 }
      );
      observer.observe(observerRef.current);
      return () => observer.disconnect();
    }
  }, [loading, results]);

  useEffect(() => {
    if (page > 1) fetchData(debounce, page);
  }, [page]);

  const handleSelect = (movie) => {
    if (!selectedMovies.find((m) => m.imdbID === movie.imdbID)) {
      setSelectedMovies([...selectedMovies, movie]);
    }
  };

  const handleRemove = (id) => {
    setSelectedMovies(selectedMovies.filter((m) => m.imdbID !== id));
  };

  const handleScroll = (direction) => {
    if (sliderRef.current) {
      const scrollAmount = direction === "left" ? -300 : 300;
      sliderRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  return (
    <Box sx={{ bgcolor: "#141414", color: "#fff", minHeight: "100vh", p: 2 }}>
     <Box sx={{ display: "flex", justifyContent: "center", mb: 3 }}>
  <TextField
    variant="outlined"
    placeholder="Search Movies..."
    value={query}
    onChange={(e) => setQuery(e.target.value)}
    sx={{
      input: { color: "white", fontSize: "1.2rem" },
      width: query ? "60%" : "80%",
      transition: "width 0.4s ease",
      bgcolor: "#1f1f1f",
      borderRadius: 2,
    }}
  />
</Box>

      <Grid container spacing={2} minHeight="60vh">
        {results.map((movie) => (
          <Grid
            item
            xs={12}
            sm={6}
            md={4}
            key={movie.imdbID}
            onClick={() => handleSelect(movie)}
            sx={{ transition: "transform 0.3s", cursor: "pointer" }}
          >
            <Card sx={{ bgcolor: "#1f1f1f", '&:hover': { transform: 'scale(1.05)' } }}>
              <CardMedia
                component="img"
                height="300"
                image={movie.Poster !== "N/A" ? movie.Poster : ""}
                alt={movie.Title}
              />
              <CardContent>
                <Typography variant="h6">{movie.Title}</Typography>
                <Typography variant="body2">{movie.Year}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}

        {loading &&
          Array.from({ length: 6 }).map((_, idx) => (
            <Grid item xs={12} sm={6} md={4} key={idx}>
              <Skeleton variant="rectangular" height={300} sx={{ bgcolor: "#333" }} />
              <Skeleton width="80%" />
              <Skeleton width="60%" />
            </Grid>
          ))}
      </Grid>

      <div ref={observerRef} />

      {selectedMovies.length > 0 && (
        <Box
          sx={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            bgcolor: "#1f1f1f",
            display: "flex",
            alignItems: "center",
            p: 1,
            zIndex: 10,
          }}
        >
          <IconButton onClick={() => handleScroll("left")}>
            <ArrowBackIosNewIcon sx={{ color: "white" }} />
          </IconButton>
          <Box
            ref={sliderRef}
            sx={{
              display: "flex",
              overflowX: "auto",
              width: "70%",
              gap: 1,
              "&::-webkit-scrollbar": { display: "none" },
            }}
          >
            {selectedMovies.map((movie) => (
              <Box key={movie.imdbID} sx={{ position: "relative" }}>
                <img
                  src={movie.Poster}
                  alt={movie.Title}
                  height="100"
                  style={{ borderRadius: "4px" }}
                />
                <IconButton
                  size="small"
                  onClick={() => handleRemove(movie.imdbID)}
                  sx={{
                    position: "absolute",
                    top: 0,
                    right: 0,
                    color: "white",
                    bgcolor: "rgba(0,0,0,0.6)",
                  }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Box>
            ))}
          </Box>

          <IconButton onClick={() => handleScroll("right")}>
            <ArrowForwardIosIcon sx={{ color: "white" }} />
          </IconButton>

          <Button
            variant="contained"
            sx={{
              ml: 2,
              bgcolor: "#e50914",
              color: "white",
              fontWeight: "bold",
              borderRadius: 2,
              textTransform: "none",
              '&:hover': { bgcolor: "#f6121d" },
            }}
          >
            Generate Response
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default SearchPage;
