import React, { useState, useEffect, useCallback, useRef } from "react";

import {
  TextField,
  Paper,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Box,
  Typography,
  Avatar,
  Fab,
  Stack,
  Button,
  CardContent,
  Card,
  CardMedia,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import SearchIcon from "@mui/icons-material/Search";
import Groq from "groq-sdk";
import GeneratedResponse from "./GeneratedResponse";
import { useDebounce } from "./util";

const groq = new Groq({
  apiKey: import.meta.env.VITE_GROQ_API_KEY,
  dangerouslyAllowBrowser: true,
});

const Search = () => {
  const listRef = useRef(null);

  const [query, setQuery] = useState("");
  const debounce = useDebounce(query, 500);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [maxPageSize, setMaxPageSize] = useState(1);
  const [page, setPage] = useState(1);
  const [error, setError] = useState(false);
  const [randomPic, setRandomPic] = useState(
    "https://media.glamour.com/photos/56957a138fa134644ec21f46/16:9/w_1920%2Cc_limit/entertainment-2014-02-03-titanic-main.jpg"
  );
  const [imageLoaded, setImageLoaded] = useState(false);
  const [fabOptions, setFabOptions] = useState([]);
  const [hoveredMovie, setHoveredMovie] = useState(null);
  const [hoverPosition, setHoverPosition] = useState({ x: 0, y: 0 });
  const [content, setContent] = useState({});
  const fetchData = async (searchQuery, pageNumber) => {
    if (!searchQuery) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(
        `https://www.omdbapi.com/?apikey=8ef9ee99&s=${searchQuery}&plot=full&page=${pageNumber}`
      );
      const data = await response.json();
      setResults((prevResults) => [...prevResults, ...(data?.Search || [])]);
      setMaxPageSize(data?.totalResults);
    } catch (error) {
      console.error("Error fetching cities:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    setError(false);
    if (debounce) {
      setResults([]); // Clear previous results
      setPage(1); // Reset page number
      fetchData(debounce, 1);
    }
    if (!debounce) {
      setResults([]);
    }
  }, [debounce]);

  const getRandomCityPictures = async () => {
    try {
      const response = await fetch(
        `https://api.unsplash.com/photos/random/?client_id=sC_DuAiI1xjVnxJjRSaLbxbatfcoEoK-df4lLlsRO-k&query=movies&count=100`
      );
      const data = await response.json();
      const randomIndex = Math.floor(Math.random() * data.length);
      const newImageUrl = data[randomIndex].urls.full;

      const img = new Image();
      img.src = newImageUrl;
      img.onload = () => {
        setRandomPic(newImageUrl);
        setImageLoaded(true);
      };
    } catch (error) {
      console.error("Error fetching image:", error);
      setImageLoaded(true);
    }
  };

  useEffect(() => {
    getRandomCityPictures();
  }, []);

  const getSelectedMoviesText = (selectedMovies) => {
    if (!selectedMovies) return "";

    const formattedMovies = selectedMovies
      .map((movie) => `${movie.Title} (imdb_id: ${movie.imdbID})`)
      .join(", ");

    return `[${formattedMovies}]`;
  };

  const handleScroll = useCallback(() => {
    if (listRef.current) {
      const bottom =
        listRef.current.scrollHeight - listRef.current.scrollTop ===
        listRef.current.clientHeight;
      if (bottom && !loading) {
        setPage((prevPage) => prevPage + 1);
      }
    }
  }, [loading]);

  useEffect(() => {
    if (page > 1 && page <= Math.ceil(maxPageSize / 10)) {
      fetchData(debounce, page);
    }
  }, [page]);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [handleScroll]);

  async function chat() {
    const chatCompletion = await getGroqChatCompletion();
    setContent(JSON.parse(chatCompletion.choices[0].message.content) || {});
  }

  async function getGroqChatCompletion() {
    const selectedMoviesText = getSelectedMoviesText(fabOptions);
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
  return (
    <>
      {!imageLoaded && (
        <CircularProgress
          sx={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            color: "black",
            zIndex: 10,
          }}
        />
      )}

      <Box
        sx={{
          width: "100vw",
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          backgroundImage: `url(${randomPic})`,
          backgroundSize: "cover",
          backgroundRepeat: "repeat-x",
          backgroundPosition: "center",
          // gap: 5,
          position: "relative",
          opacity: imageLoaded ? 1 : 0,
          transition: "opacity 1.5s ease-in-out",
        }}
      >
        {/* <Typography
          variant="h4"
          sx={{
            mb: 2,
            fontWeight: "bold",
            color: "white",
            textShadow: "2px 2px 10px rgba(0,0,0,0.5)",
          }}
        >
        </Typography> */}

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            backgroundColor: "rgba(255, 255, 255, 0.1)",
            backdropFilter: "blur(10px)",
            padding: "10px 15px",
            borderRadius: 2,
            width: "90%",
            maxWidth: 500,
          }}
        >
          <SearchIcon sx={{ color: "white" }} />
          <TextField
            fullWidth
            size="small"
            variant="standard"
            label="Enter Show name..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
            }}
            sx={{
              borderBottom: "1px solid rgba(255,255,255,0.8)",
              color: "white",
            }}
          />
          {loading && <CircularProgress sx={{ color: "black" }} />}
        </Box>

        {results.length > 0 && (
          <Paper
            ref={listRef}
            elevation={5}
            sx={{
              mt: 2,
              maxHeight: 300,
              overflowY: "auto",
              borderRadius: 2,
              backgroundColor: "rgba(0, 0, 0, 0.6)",
              width: "90%",
              maxWidth: 500,
              color: "white",
            }}
            onScroll={handleScroll}
            onMouseLeave={() => setHoveredMovie(null)}
          >
            <List>
              {loading && (
                <ListItem sx={{ display: "flex", justifyContent: "center" }}>
                  <CircularProgress sx={{ mt: 2, color: "white" }} />
                </ListItem>
              )}
              {results.length > 0 &&
                results.map((city) => (
                  <ListItem
                    key={city.imdbID}
                    button
                    sx={{
                      gap: 2,
                      transition: "0.3s",
                      cursor: "pointer",
                      "&:hover": {
                        backgroundColor: "rgba(255, 255, 255, 0.2)",
                      },
                    }}
                    onMouseEnter={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      setHoveredMovie(city);
                      setHoverPosition({
                        // x: rect.right - 60,
                        x: rect.left - 0,
                        y: rect.top - 230,
                      });
                    }}
                    // onMouseLeave={() => setHoveredMovie(null)}
                    onClick={() => {
                      setFabOptions([...fabOptions, city]);
                    }}
                  >
                    <Avatar
                      src={city.Poster !== "N/A" ? city.Poster : randomPic}
                      height={80}
                    />

                    <ListItemText
                      primary={`${city.Title} (${city.Type})`}
                      secondary={city.Year}
                      sx={{
                        color: "white",
                        "& .MuiListItemText-secondary": {
                          color: "rgba(255,255,255,0.8)",
                        },
                      }}
                    />
                  </ListItem>
                ))}
            </List>
          </Paper>
        )}
        {hoveredMovie && (
          <Card
            sx={{
              position: "fixed",
              top: hoverPosition.y,
              left: hoverPosition.x,
              p: 1,
              height: "auto",
              width: 200,
              boxShadow: 3,
            }}
            onMouseEnter={(e) => {
              setHoveredMovie(hoveredMovie);
            }}
            onMouseLeave={() => setHoveredMovie(null)}
          >
            <CardMedia
              component="img"
              sx={{ height: 150, objectFit: "contain" }}
              image={
                hoveredMovie.Poster !== "N/A" ? hoveredMovie.Poster : randomPic
              }
              alt="Live from space album cover"
            />
            <Box sx={{ display: "flex", flexDirection: "column" }}>
              <CardContent sx={{ flex: "1 0 auto" }}>
                <Typography component="div" variant="subtitle2">
                  {hoveredMovie.Title}
                </Typography>
                <Typography
                  variant="caption"
                  component="div"
                  sx={{ color: "text.secondary" }}
                >
                  {hoveredMovie.Year}
                </Typography>
              </CardContent>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <a
                  href={`https://www.imdb.com/title/${hoveredMovie.imdbID}`}
                  style={{ fontSize: "10px" }}
                >
                  Learn more
                </a>
              </Box>
            </Box>
          </Card>
        )}
        <Stack
          direction="row"
          sx={{
            position: "absolute",
            left: "20px",
            zIndex: 0,
            justifyContent: "center",
            gap: 2,
            width: "90%",
            maxWidth: 490,
            flexWrap: "wrap",
          }}
        >
          {fabOptions.length > 0 &&
            fabOptions.map((option) => (
              <Fab
                key={option.imdbID}
                color="primary"
                aria-label="add"
                disableTouchRipple
                disableRipple
                disableFocusRipple
                size="small"
                sx={{
                  width: "max-content",
                  padding: "0px 10px",
                  borderRadius: 40,
                  fontSize: "12px",
                  textTransform: "none",
                  backgroundColor: "rgba(255, 255, 255, 0.1)",
                  backdropFilter: "blur(200px)",
                  color: "white",
                  "&:hover": {
                    backgroundColor: "rgba(255, 255, 255, 0.2)",
                  },
                }}
                onClick={() => {
                  setFabOptions(
                    fabOptions.filter((c) => c.imdbID !== option.imdbID)
                  );
                }}
              >
                {option.Title}
                <CloseIcon />
              </Fab>
            ))}
        </Stack>
        <Stack
          direction="row"
          sx={{
            position: "absolute",
            right: "20px",
            zIndex: 0,
            justifyContent: "center",
            gap: 2,
            width: "90%",
            maxWidth: 490,
            flexWrap: "wrap",
          }}
        >
          {fabOptions.length > 0 && (
            <Button
              variant="contained"
              disableElevation
              disableRipple
              disableFocusRipple
              disableTouchRipple
              size="small"
              sx={{
                background: "red",
              }}
              onClick={chat}
            >
              Generate Recommendation
            </Button>
          )}
        </Stack>
        {error && (
          <List>
            <ListItem>
              <ListItemText
                primary={`No results found for ${query}`}
                sx={{
                  color: "white",
                  "& .MuiListItemText-secondary": {
                    color: "rgba(255,255,255,0.8)",
                  },
                }}
              />
            </ListItem>
          </List>
        )}
      </Box>
      <GeneratedResponse content={content} />
    </>
  );
};

export default Search;
