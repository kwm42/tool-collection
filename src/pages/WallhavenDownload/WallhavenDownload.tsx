import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Masonry from 'react-masonry-css';
import { fetchData } from '../../utils/request';
import './wallhaven_download.css';

const API_URL = 'http://localhost:3001/wallhaven/search';
const API_KEY = 'TGOqr9tmdQNYOf7YG9ulyh5hlTtnHVtV';

function WallhavenDownload() {
  const { t } = useTranslation();
  const [keyword, setKeyword] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (pageNumber = 1) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}?apikey=${API_KEY}&q=${keyword}&page=${pageNumber}`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      const imageUrls = data.data.map((img: any) => img.thumbs.original);
      setImages(imageUrls);
      setTotalPages(data.meta.last_page);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
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
    setPage(1);
    setTotalPages(1);
  };

  const handleNextPage = () => {
    if (page < totalPages) {
      const nextPage = page + 1;
      setPage(nextPage);
      handleSearch(nextPage);
    }
  };

  const handlePrevPage = () => {
    if (page > 1) {
      const prevPage = page - 1;
      setPage(prevPage);
      handleSearch(prevPage);
    }
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
        <button onClick={() => handleSearch()}>{t('common.search')}</button>
        <button onClick={handleDownload}>{t('common.download')}</button>
        <button onClick={handleRefresh}>{t('common.refresh')}</button>
      </div>
      <div className="pagination">
        <button onClick={handlePrevPage} disabled={page === 1}>
          {t('common.previous')}
        </button>
        <span>
          {page} / {totalPages}
        </span>
        <button onClick={handleNextPage} disabled={page === totalPages}>
          {t('common.next')}
        </button>
      </div>
      <div className="image-display">
        {loading ? (
          <div className="loading">{t('common.loading')}</div>
        ) : (
          <Masonry breakpointCols={3} className="my-masonry-grid" columnClassName="my-masonry-grid_column">
            {images.map((url, index) => (
              <img key={index} src={url} alt={`wallhaven-${index}`} />
            ))}
          </Masonry>
        )}
      </div>
    </div>
  );
}

export default WallhavenDownload;
