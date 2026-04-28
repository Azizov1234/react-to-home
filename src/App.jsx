import { useEffect, useState } from "react";
import "./main.css";

const API_KEY = "dcea1fd7b3e65d34387ad6de7ef9cc5e";
const BASE_URL = "https://api.themoviedb.org/3";
const IMG_URL = "https://image.tmdb.org/t/p/w500";
const NO_IMAGE = "https://via.placeholder.com/500x750?text=No+Image";

function getScoreClass(score) {
  if (score >= 8) return "green";
  if (score >= 6) return "orange";
  return "red";
}

function App() {
  // Qaysi bo'lim tanlangan: top_rated / popular / upcoming
  const [movieType, setMovieType] = useState("top_rated");
  // Hozirgi sahifa raqami
  const [currentPage, setCurrentPage] = useState(1);

  // API'dan keladigan asosiy ma'lumotlar
  const [totalPages, setTotalPages] = useState(1);
  const [movies, setMovies] = useState([]);

  // UI holatlari
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Filter inputlari
  const [search, setSearch] = useState("");
  const [minYear, setMinYear] = useState("");
  const [maxYear, setMaxYear] = useState("");
  const [minScore, setMinScore] = useState("");

  useEffect(() => {
    async function getMovies() {
      setLoading(true);
      setError("");

      try {
        const response = await fetch(
          `${BASE_URL}/movie/${movieType}?api_key=${API_KEY}&page=${currentPage}`
        );

        if (!response.ok) {
          throw new Error("API dan ma'lumot olishda xatolik bo'ldi.");
        }

        const data = await response.json();
        setMovies(data.results || []);
        // TMDB ko'pi bilan 500 page qaytaradi
        setTotalPages(Math.min(data.total_pages || 1, 500));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    getMovies();
  }, [movieType, currentPage]);

  function matchesFilters(movie) {
    const title = movie.title || "";
    const movieYear = Number(movie.release_date?.slice(0, 4) || 0);
    const movieScore = Number(movie.vote_average || 0);

    const searchOk = title.toLowerCase().includes(search.trim().toLowerCase());
    const minYearOk = minYear ? movieYear >= Number(minYear) : true;
    const maxYearOk = maxYear ? movieYear <= Number(maxYear) : true;
    const scoreOk = minScore ? movieScore >= Number(minScore) : true;

    return searchOk && minYearOk && maxYearOk && scoreOk;
  }

  const filteredMovies = movies.filter(matchesFilters);

  function changeMovieType(nextType) {
    setMovieType(nextType);
    setCurrentPage(1);
  }

  function clearAllFilters() {
    setSearch("");
    setMinYear("");
    setMaxYear("");
    setMinScore("");
  }

  return (
    <div>
      <div className="header-inner">
        <div className="container rel">
          <div className="row2">
            <button
              type="button"
              className={`btns ${movieType === "top_rated" ? "active" : ""}`}
              onClick={() => changeMovieType("top_rated")}
            >
              Top kinolar
            </button>

            <button
              type="button"
              className={`btns ${movieType === "popular" ? "active" : ""}`}
              onClick={() => changeMovieType("popular")}
            >
              Popular
            </button>

            <button
              type="button"
              className={`btns ${movieType === "upcoming" ? "active" : ""}`}
              onClick={() => changeMovieType("upcoming")}
            >
              Upcoming
            </button>
          </div>

          <div className="fl">
            <div className="row1">
              <input
                type="text"
                placeholder="search"
                id="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="row1">
              <input
                type="number"
                placeholder="min year"
                id="min"
                value={minYear}
                onChange={(e) => setMinYear(e.target.value)}
              />
              <input
                type="number"
                placeholder="max year"
                id="max"
                value={maxYear}
                onChange={(e) => setMaxYear(e.target.value)}
              />
            </div>

            <div className="row1">
              <input
                type="number"
                placeholder="score"
                id="score"
                min="0"
                max="10"
                step="0.1"
                value={minScore}
                onChange={(e) => setMinScore(e.target.value)}
              />
            </div>

            <button className="btn" type="button" onClick={clearAllFilters}>
              Clear
            </button>
          </div>
        </div>
      </div>

      <div className="container">
        {loading && <p className="status">Yuklanmoqda...</p>}
        {error && <p className="status error">{error}</p>}

        {!loading && !error && (
          <div className="append">
            {filteredMovies.length > 0 ? (
              filteredMovies.map((movie) => (
                <div key={movie.id} className="movie">
                  <img
                    src={
                      movie.poster_path ? `${IMG_URL}${movie.poster_path}` : NO_IMAGE
                    }
                    alt={movie.title}
                  />

                  <div className="movie-info">
                    <h3>{movie.title}</h3>
                    <span className={getScoreClass(movie.vote_average)}>
                      {Number(movie.vote_average).toFixed(1)}
                    </span>
                  </div>

                  <span className="date">{movie.release_date || "No date"}</span>

                  <div className="overview">
                    <h3>Overview</h3>
                    <p>{movie.overview || "Ma'lumot mavjud emas."}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="status">Mos film topilmadi.</p>
            )}
          </div>
        )}

        <div className="pn">
          <button
            className="prev"
            type="button"
            onClick={() => setCurrentPage((oldPage) => Math.max(oldPage - 1, 1))}
            disabled={currentPage === 1 || loading}
          >
            prev
          </button>
          <span className="title">
            {currentPage} / {totalPages}
          </span>
          <button
            className="next"
            type="button"
            onClick={() =>
              setCurrentPage((oldPage) => Math.min(oldPage + 1, totalPages))
            }
            disabled={currentPage === totalPages || loading}
          >
            next
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
