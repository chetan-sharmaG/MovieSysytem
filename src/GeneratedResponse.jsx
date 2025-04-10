import React, { useEffect } from "react";
import {
  Card,
  CardContent,
  CardMedia,
  CardHeader,
  Typography,
  Skeleton,
  Chip,
  Badge,
  Avatar,
  Box,
  Grid,
  Container,
} from "@mui/material";
import StarIcon from "@mui/icons-material/Star";
import { styled } from "@mui/material/styles";
import {  useQuery } from "@tanstack/react-query";
import axios from "axios";


const StreamingBadge = styled(Badge)(({ theme }) => ({
  "& .MuiBadge-badge": {
    // right: 0,
    // top: 8,
    transform:'none',
    border: `2px solid ${theme.palette.background.paper}`,
    padding: "0 6px",
    backgroundColor: "#E50914",
    color: "#fff",
    fontSize: "0.7rem",
  },
}));

const fetchOmdbData = async (title, year,type) => {
  const { data } = await axios.get("https://www.omdbapi.com/", {
    params: { apikey: "8ef9ee99", t: title, type: type }, //y: year
  });
  return data?.Response === "True" ? data : null;
};

const RecommendationCard = ({ item }) => {
  const { data, isLoading } = useQuery({
    queryKey: ["omdb", item.imdb_id],
    queryFn: () => fetchOmdbData(item.title, item.release_year,item.type),
  });

  return (
    <Card
      sx={{
        // width: { xs: "100%", sm: 280, md: 320 },
        backgroundColor: "#141414",
        color: "#fff",
        m: 2,
        width:'300px !important',
        transition: "transform 0.3s ease, box-shadow 0.3s ease",
        "&:hover": {
          transform: "scale(1.05)",
          boxShadow: "0 4px 20px rgba(229, 9, 20, 0.7)",
        },
      }}
    >
      {isLoading ? (
        <>
          <Skeleton variant="rectangular" height={300} />
          <CardContent>
            <Skeleton width="60%" />
            <Skeleton width="80%" />
          </CardContent>
        </>
      ) : (
        <>
          <StreamingBadge badgeContent={item.streaming_platform}>
            <CardMedia
              component="img"
              height="300px"
              sx={{width:'300px !important'}}
              image={data?.Poster !== "N/A" ? data?.Poster : "https://via.placeholder.com/300x450?text=No+Image"}
              // alt={item.title}
            />
          </StreamingBadge>

          <CardHeader
            title={item.title}
            subheader={
              <Box display="flex" alignItems="center" gap={0.5}>
                <StarIcon sx={{ color: "#f5c518" }} />
                <Typography variant="body2" sx={{ color: "#f5c518" }}>{item.imdb_rating}</Typography>
              </Box>
            }
          />

          <CardContent>
            <Typography variant="body2" gutterBottom color="grey.400">
              {item.type} | {item.language} | {item.release_year}
            </Typography>

            <Box display="flex" flexWrap="wrap" gap={0.5} mt={1} mb={1}>
              {item.genre_tags.map((genre) => (
                <Chip
                  key={genre}
                  label={genre}
                  size="small"
                  sx={{ backgroundColor: "#333", color: "#fff" }}
                />
              ))}
            </Box>

            <Typography variant="body2" color="grey.300">
              {item.description}
            </Typography>
          </CardContent>
        </>
      )}
    </Card>
  );
};

const RecommendationsList = ({ content }) => {
  useEffect(() => {
    document.getElementById('recommendations').scrollIntoView({ behavior: 'smooth' })
  },[content])
  return (
    <Box id='recommendations' sx={{ backgroundColor: "#000", py: 5 }}>
      <Container>
        <Typography
          variant="h4"
          sx={{ color: "#fff", mb: 3, fontWeight: "bold" }}
        >
          Recommended For You
        </Typography>
        <Grid container justifyContent="center">
          {content.length > 0 && content.map((item) => (
            <Grid item key={item.imdb_id}>
              <RecommendationCard item={item} />
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

const GeneratedResponse = ({ content }) => (
  // <QueryClientProvider client={queryClient}>
    <RecommendationsList content={content} />
  // </QueryClientProvider>
);

export default GeneratedResponse;
