import { useEffect, useState } from "react";

const useDebounce = (value, delay) => {
  const [debounceValue, setDebounceValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebounceValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debounceValue;
};

export { useDebounce };

// Centralized movie details fetcher with sessionStorage caching.
export const fetchMovieDetails = async (imdbID) => {
  if (!imdbID) return null;
  const raw = sessionStorage.getItem("movieDetails");
  const data = JSON.parse(raw || "[]");

  const cached = data.find((item) => item.imdbID === imdbID);
  if (cached) return cached;

  const response = await fetch(
    `https://imdb.iamidiotareyoutoo.com/search?tt=${imdbID}`
  );
  const movieDetails = await response.json();

  // Normalize property name to imdbID (some responses may use imdbId)
  const normalized = {
    ...movieDetails,
    imdbID: movieDetails.imdbID || movieDetails.imdbId || imdbID,
  };

  sessionStorage.setItem("movieDetails", JSON.stringify([...data, normalized]));
  return normalized;
};