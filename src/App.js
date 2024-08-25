import React, { useEffect, useState } from 'react';
import axios from 'axios';

const CLIENT_ID = '39300b1668d6473783173aa8629ccf6f';
const REDIRECT_URI = 'https://thbertolino.github.io/SpotShuffle/callback';
// const REDIRECT_URI = 'http://localhost:3000/callback';
const AUTH_ENDPOINT = 'https://accounts.spotify.com/authorize';
const RESPONSE_TYPE = 'token';

function App() {
  const [token, setToken] = useState('');
  const [albums, setAlbums] = useState([]);
  const [randomAlbum, setRandomAlbum] = useState(null);
  const [dateAlbum, setDateAlbum] = useState(null);

  useEffect(() => {
    const hash = window.location.hash;
    let token = window.localStorage.getItem('token');

    if (!token && hash) {
      token = hash.substring(1).split('&').find(elem => elem.startsWith('access_token')).split('=')[1];
      window.location.hash = '';
      window.localStorage.setItem('token', token);
    }

    setToken(token);

    if (token) {
      fetchSavedAlbums(token);
    }
  }, []);

  const [loading, setLoading] = useState(false);

  const fetchSavedAlbums = async (token) => {
    setLoading(true); // Inicia o carregamento e esconde o botão
  
    try {
      const totalAlbumsResponse = await axios.get('https://api.spotify.com/v1/me/albums?limit=1', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
  
      const totalAlbums = totalAlbumsResponse.data.total;
      const randomOffset = Math.floor(Math.random() * (totalAlbums - 50));
  
      const { data } = await axios.get(`https://api.spotify.com/v1/me/albums?limit=50&offset=${randomOffset}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
  
      setAlbums(data.items); // Atualiza os álbuns
    } catch (error) {
      console.error("Error fetching albums:", error);
    } finally {
      setLoading(false); // Finaliza o carregamento e mostra o botão novamente
    }
  };

  const handleRandomAlbum = () => {
    if (albums.length === 0) {
      alert("Aguarde a requisição da API...");
      return;
    }

    const randomIndex = Math.floor(Math.random() * albums.length);
    const selectedAlbum = albums[randomIndex]?.album;
    const addedDateAlbum = albums[randomIndex]?.added_at;

    if (selectedAlbum) {
      setRandomAlbum(selectedAlbum);
      setDateAlbum(addedDateAlbum)
    } else {
      alert("Could not find a random album.");
    }
  };

  const logout = () => {
    setToken('');
    window.localStorage.removeItem('token');
    setAlbums([]);
    setRandomAlbum(null);
    setDateAlbum(null);
  };

  return (
    <div className="App">
      <header className="App-header" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px' }}>
        <h1 style={{ fontSize: '2.5rem', color: '#1DB954' }}>Shuffle Albums</h1>
  
        {!token ? (
          <a
            href={`${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=${RESPONSE_TYPE}&scope=user-library-read`}
            style={{
              padding: '10px 20px',
              backgroundColor: '#1DB954',
              color: '#fff',
              textDecoration: 'none',
              borderRadius: '50px',
              fontSize: '1.2rem',
              marginBottom: '20px',
              display: 'inline-block',
            }}
          >
            Login to Spotify
          </a>
        ) : (
          <button
            onClick={logout}
            style={{
              padding: '10px 20px',
              backgroundColor: '#e63946',
              color: '#fff',
              border: 'none',
              borderRadius: '50px',
              cursor: 'pointer',
              fontSize: '1.2rem',
              marginBottom: '20px',
            }}
          >
            Logout
          </button>
        )}
      </header>
  
      <main style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px' }}>
        {!token ? null : (
          <>
            {!loading && (
              <button
                onClick={handleRandomAlbum}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#1DB954',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '50px',
                  cursor: 'pointer',
                  fontSize: '1.2rem',
                  marginBottom: '20px',
                }}
              >
                Get Random Album
              </button>
            )}
  
            {loading && <p style={{ fontSize: '1.2rem', color: '#888' }}>Loading albums...</p>}
  
            {randomAlbum && (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  maxWidth: '400px',
                  textAlign: 'center',
                  backgroundColor: '#f0f0f0',
                  padding: '20px',
                  borderRadius: '10px',
                  marginTop: '20px',
                }}
              >
                <img
                  src={randomAlbum.images[0].url}
                  alt={randomAlbum.name}
                  style={{ width: '100%', borderRadius: '10px', marginBottom: '15px' }}
                />
                <h2 style={{ fontSize: '1.5rem', marginBottom: '10px' }}>{randomAlbum.name}</h2>
                <p style={{ fontSize: '1.1rem', color: '#555' }}>
                  {randomAlbum.artists.map((artist) => artist.name).join(', ')}
                </p>
                
                {/* Informações adicionais */}
                <div style={{ marginTop: '15px', textAlign: 'left', width: '100%' }}>
                <p style={{ fontSize: '1rem', color: '#777' }}>
                    <strong>Added on:</strong> {dateAlbum ? new Date(dateAlbum).toLocaleDateString() : 'N/A'}
                  </p>
                  <p style={{ fontSize: '1rem', color: '#777' }}>
                    <strong>Release Date:</strong> {randomAlbum.release_date ? new Date(randomAlbum.release_date).toLocaleDateString() : 'N/A'}
                  </p>
                  <p style={{ fontSize: '1rem', color: '#777' }}>
                    <strong>Total Tracks:</strong> {randomAlbum.total_tracks}
                  </p>
                  <p style={{ fontSize: '1rem', color: '#777', marginBottom: '10px' }}>
                    <strong>Top Tracks:</strong>
                  </p>
                  <ul style={{ paddingLeft: '20px', color: '#555' }}>
                    {randomAlbum.tracks.items.slice(0, 3).map((track) => (
                      <li key={track.id} style={{ marginBottom: '5px' }}>
                        {track.name}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
  
}

export default App;
