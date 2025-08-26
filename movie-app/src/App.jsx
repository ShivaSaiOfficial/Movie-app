import "./App.css";
import MovieCard from "./components/MovieCard";     

function App() {
  return (
    <>
      <MovieCard movie={{ title: "Interstellar", release_date: "2024" }} />
      <MovieCard movie={{ title: "Interstellar", release_date: "2024" }} />
      <MovieCard movie={{ title: "Interstellar", release_date: "2024" }} />
    </>
  );
}

export default App;
