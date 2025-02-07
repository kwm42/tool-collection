import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Masonry from 'react-masonry-css';
import { fetchData } from '../../utils/request';
import './wallhaven_download.css';

const API_URL = 'https://wallhaven.cc/api/v1/search';
const API_KEY = 'TGOqr9tmdQNYOf7YG9ulyh5hlTtnHVtV';

function WallhavenDownload() {
  const { t } = useTranslation();
  const [keyword, setKeyword] = useState('');
  const [images, setImages] = useState<string[]>([]);

  useEffect(() => {
    const fetchDataFromAPI = async () => {
      const result = await fetchData(`${API_URL}?apikey=${API_KEY}`);
      const imageUrls = result.data.map((img: any) => img.path);
      setImages(imageUrls);
    };

    fetchDataFromAPI();
  }, []);

  const handleSearch = async () => {
    fetch('https://wallhaven.cc/api/v1/search?q=azur&apikey=TGOqr9tmdQNYOf7YG9ulyh5hlTtnHVtV', {
      method: 'GET',
      mode: 'no-cors'
    })
      .then((response) => {
        console.log(response);
      })
      .catch((error) => {
        console.error('Error:', error);
      });

    // const response = await fetch(`${API_URL}?q=${keyword}&apikey=${API_KEY}`);
    // const data = await response.json();
    // const imageUrls = data.data.map((img: any) => img.path);
    // setImages(imageUrls);
  };

  const handleDownload = () => {
    images.forEach((url) => {
      const link = document.createElement('a');
      link.href = url;
      link.download = url.split('/').pop() || 'image.jpg';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });
  };

  const handleRefresh = () => {
    setKeyword('');
    setImages([]);
  };

  return (
    <div className="wallhaven-download">
      <div className="toolbar">
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder={t('common.search')}
        />
        <button onClick={handleSearch}>{t('common.search')}</button>
        <button onClick={handleDownload}>{t('common.download')}</button>
        <button onClick={handleRefresh}>{t('common.refresh')}</button>
      </div>
      <div className="image-display">
        <Masonry breakpointCols={3} className="my-masonry-grid" columnClassName="my-masonry-grid_column">
          {images.map((url, index) => (
            <img key={index} src={url} alt={`wallhaven-${index}`} />
          ))}
        </Masonry>
      </div>
    </div>
  );
}

export default WallhavenDownload;
