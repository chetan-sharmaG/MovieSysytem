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
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  CircularProgress,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import { useDebounce } from "./util";
import Groq from "groq-sdk";
import GeneratedResponse from "./GeneratedResponse";

const groq = new Groq({
  apiKey: import.meta.env.VITE_GROQ_API_KEY,
  dangerouslyAllowBrowser: true,
});
const SearchPage = () => {
  const [query, setQuery] = useState("");
  const debounce = useDebounce(query, 500);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [maxPageSize, setMaxPageSize] = useState(1);
  const [selectedMovies, setSelectedMovies] = useState([]);
  const [content, setContent] = useState({});

  const [filter, setFilter] = useState("all");
  const [error, setError] = useState("");
  const [buttonLoading, setButtonLoading] = useState(false);
  const observerRef = useRef();
  const sliderRef = useRef();

  const fetchData = async (searchQuery, pageNumber) => {
    if (!searchQuery) return;
    setLoading(true);
    setError("");
    try {
      let url = `https://www.omdbapi.com/?apikey=8ef9ee99&s=${searchQuery}&plot=full&page=${pageNumber}`;
      if (filter !== "all") {
        url += `&type=${filter}`;
      }
      const response = await fetch(url);
      const data = await response.json();
      if (data.Response === "False") {
        setError(data.Error);
        setResults([]);
      } else {
        setResults((prev) => [...prev, ...(data?.Search || [])]);
        setMaxPageSize(data?.totalResults);
      }
    } catch (error) {
      console.error("Error fetching movies:", error);
      setError("An error occurred while fetching data.");
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
  }, [debounce, filter]);

  useEffect(() => {
    if (!loading && observerRef.current && results.length > 0) {
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

  async function chat() {
    const chatCompletion = await getGroqChatCompletion();
    setContent(JSON.parse(chatCompletion.choices[0].message.content) || {});
  }

  async function getGroqChatCompletion() {
    const selectedMoviesText = getSelectedMoviesText(selectedMovies);
    return groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: `You are an expert entertainment recommendation system that provides highly personalized movie, show, or anime suggestions based on a user’s past preferences.

You deeply analyze user preferences considering the following factors:

Genre

Themes and Story Patterns (including pacing, narrative structure, plot elements)

Actors (for movies/shows) or Voice Actors (for anime)

Directors (for movies/shows) or Original Creators (for anime)

Emotional Tone

Recurring Messages or Themes (moral, emotional or philosophical)

User's Liked Items:
${selectedMoviesText}
Based on this analysis, recommend 5 new movies, shows, or anime that the user might also enjoy.

Important Recommendation Rules:

Do NOT recommend sequels, prequels, remakes, or spin-offs of the user's liked items.

Mixed languages are acceptable — mention the primary language.

Only recommend if verified and accurate information is available.

Recommendations should be diverse in type, themes, and cultural background if possible.

Movie title should be accurate and complete.
If title includes special characters, remove them except for character '!'.

For each recommendation, return the following fields in JSON:

[
  {
    "title": "string",
    "release_year": number,
    "type": "Movie" or "Series",
    "actors":["string","string"],
    "directors": ["string", "string"],
    "description": "string",
    "genre_tags": ["string", "string"],
    "imdb_rating": number,
    "imdb_id": "string",
    "language": "string",
    "streaming_platform": "string",
  }
]
Important Instructions for Output:
Output ONLY valid JSON.

Do not add any explanation or comments outside JSON.

Field names must match EXACTLY.

Always provide values as per the schema.

Use arrays only where specified.

If data is not available, write "Not Available".`,
        },
      ],
      model: "llama3-70b-8192",
    });
  }
  const getSelectedMoviesText = (selectedMovies) => {
    if (!selectedMovies) return "";

    const formattedMovies = selectedMovies
      .map((movie) => `${movie.Title} (imdb_id: ${movie.imdbID})`)
      .join(", ");

    return `[${formattedMovies}]`;
  };

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

  const handleGenerateResponse = () => {
    setButtonLoading(true);
    setContent({});
    chat().then(() => {
      setButtonLoading(false);
      setResults([]);
      setSelectedMovies([]);
    });
  };

  return (
    <Box
      sx={{
        bgcolor: "#141414",
        color: "#fff",
        minHeight: "100vh",
        padding: "16px 0px",
        width: results.length > 0 ? "calc(100vw - 16px)" : "calc(100vw - 16px)",
      }}
    >
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
            mr: 2,
          }}
        />
        <FormControl variant="outlined" sx={{ minWidth: 120 }}>
          <InputLabel sx={{ color: "white" }}>Type</InputLabel>
          <Select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            label="Type"
            sx={{
              color: "white",
              bgcolor: "#1f1f1f",
              borderRadius: 2,
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: "white",
              },
              "&:hover .MuiOutlinedInput-notchedOutline": {
                borderColor: "white",
              },
              "& .MuiSvgIcon-root": {
                color: "white",
              },
            }}
          >
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="movie">Movie</MenuItem>
            <MenuItem value="series">Series</MenuItem>
          </Select>
        </FormControl>
      </Box>
      {error && (
        <Box sx={{ display: "flex", justifyContent: "center", mb: 3 }}>
          <Typography variant="h6" sx={{ color: "#e50914" }}>
            {error}
          </Typography>
        </Box>
      )}
      <Grid
        container
        spacing={5}
        minHeight="60vh"
        sx={{ p: 1, width: "80%", m: "0 auto" }}
      >
        {results.map((movie) => (
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
              <CardContent>
                <Typography
                  variant="h6"
                  sx={{ fontWeight: "bold", color: "#fff",fontSize:'1rem' , overflow:"hidden",WebkitLineClamp:'2' ,display:"-webkit-box",WebkitBoxOrient:"vertical"}}
                >
                  {movie.Title}
                </Typography>
                <Typography variant="body2" sx={{ color: "#b3b3b3" }}>
                  {movie.Year} | {movie.Type}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}

        {loading &&
          Array.from({ length: 10 }).map((_, idx) => (
            <Grid item xs={12} sm={6} md={3} key={idx}>
              <Skeleton
                variant="rectangular"
                height={285}
                width={185}
                sx={{ bgcolor: "#333" }}
              />
              <Skeleton width="80%" animation="wave" />
              <Skeleton width="60%" animation="wave" />
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
              width: "82%",
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
              selfAlign: "end",
              "&:hover": { bgcolor: "#f6121d" },
            }}
            onClick={()=>{handleGenerateResponse(); }}
            disabled={buttonLoading}
          >
            {buttonLoading ? (
              <CircularProgress size={24} sx={{ color: "white" }} />
            ) : (
              "Generate Response"
            )}
          </Button>
        </Box>
      )}

      {Object.keys(content).length > 0 && (
        <GeneratedResponse content={content} />
      )}
    </Box>
  );
};

export default SearchPage;
