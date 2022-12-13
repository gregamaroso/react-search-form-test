import axios from 'axios';
import React, { useState, useEffect, useRef } from 'react'
import './App.css'

function SearchForm({
  searching,
  setSearching,
  setPage,
  term,
  setTerm,
  setResults
}) {
  const inputRef = useRef(null);

  const handleClick = (e: { preventDefault: () => void; }) => {
    e.preventDefault();

    const newTerm = inputRef.current.value;
    if (newTerm !== term) {
      setSearching('Searching...');

      setResults([]);
      setPage(1);
      setTerm(newTerm);
    }
  };

  return (
    <form>
      <input
        id="searchQuery"
        type="text"
        placeholder="Name, language..."
        ref={inputRef} />

      <button
        className="button-primary"
        type="submit"
        onClick={handleClick}>{searching}</button>
    </form>
  );
}

function SearchResult({
  result: {
    url,
    full_name,
    language,
    stargazers_count
  }
}) {
  const formatCount = (num: number) => {
    return num >= 1000 ?
      `${Math.floor(num / 1000)}k` :
      `${num}`;
  };

  const count = formatCount(
    parseInt(stargazers_count)
  );

  return (
    <tr>
      <td><a href={url}>{full_name}</a></td>
      <td>{language}</td>
      <td>{count}</td>
    </tr>
  );
}

function SearchResults({ results }) {
  return (
    <table id="searchResults">
      <thead>
        <tr>
          <th>Name</th>
          <th>Language</th>
          <th>Stars</th>
        </tr>
      </thead>
      <tbody>
        {results.map(result =>
          <SearchResult key={result.id} result={result} />
        )}
      </tbody>
    </table>
  );
}

function LoadMoreButton({
  page,
  setPage,
  loading,
  setLoading,
  results
}) {
  const handleClick = (e: { preventDefault: () => void; }) => {
    e.preventDefault();

    setLoading('Loading ...');
    setPage(page + 1);
  };

  return results.length > 0 ? (
    <button
      id="loadMoreButton"
      onClick={handleClick}>
      {loading}
    </button>
  ) : null;
}

export default function App() {
  const [term, setTerm] = useState('');
  const [results, setResults] = useState([]);
  const [page, setPage] = useState(1);

  const [error, setError] = useState('');
  const [searching, setSearching] = useState('Search');
  const [loading, setLoading] = useState('Load More');

  const resetSearchButton = () => {
    setSearching('Search');
  };

  const resetLoadingButton = () => {
    setLoading('Load More');
  };

  const doSearch = (term: string, page: number) => {
    const rpp = 2;

    setError('');

    if (term.length < 1) {
      return;
    }

    axios.get(`https://api.github.com/search/repositories?q=${term}&sort=stars&order=desc&per_page=${rpp}&page=${page}`).then((resp) => {
      const { items } = resp.data;

      setResults([
        ...results,
        ...items
      ]);

      resetSearchButton();
      resetLoadingButton();
    }).catch((error) => {
      resetSearchButton();
      resetLoadingButton();

      setError(error);
    });
  };

  useEffect(() => {
    doSearch(term, page);
  }, [term, page]);

  return (
    <>
      <h1 className="title">GitHub Search</h1>

      <SearchForm
        searching={searching}
        setSearching={setSearching}
        term={term}
        setPage={setPage}
        setTerm={setTerm}
        setResults={setResults} />
      
      <SearchResults
        results={results} />
     
      <LoadMoreButton
        page={page}
        results={results}
        setPage={setPage}
        loading={loading}
        setLoading={setLoading} />

      {error && <div className='error'>{JSON.stringify(error)}</div>}
    </>
  );
}
