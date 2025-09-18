const API_KEY = "75265db5";
const BASE_URL = "http://www.omdbapi.com/";

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
