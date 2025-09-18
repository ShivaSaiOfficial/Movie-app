// Get your free API key from: https://www.themoviedb.org/settings/api
const API_KEY = "Yde79c44241a0e1db09617217f8b8692a"; // Replace with your actual TMDB API key
const BASE_URL = "https://api.themoviedb.org/3";

export const getPopularMovies = async () => {
  // OMDB does not have a 'popular' endpoint, so we fetch a default movie list
  const response = await fetch(`${BASE_URL}?s=batman&apikey=${API_KEY}`);
  const data = await response.json();
  return data.Search || [];
};

export const searchMovies = async (query) => {
  const response = await fetch(
    `${BASE_URL}?s=${encodeURIComponent(query)}&apikey=${API_KEY}`
  );
  const data = await response.json();
  return data.Search || [];
};
