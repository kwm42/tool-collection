import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Masonry from 'react-masonry-css';
import { fetchData } from '../../utils/request';
import './wallhaven_download.css';

const API_URL_TEST = 'http://localhost:3001/wallhaven/search';
const API_URL = 'https://wallhaven.cc/api/v1/search';
const API_KEY = 'TGOqr9tmdQNYOf7YG9ulyh5hlTtnHVtV';

function WallhavenDownload() {
  const { t } = useTranslation();
  const [keyword, setKeyword] = useState('');
  const [images, setImages] = useState<any[]>([]);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [largeImage, setLargeImage] = useState<string | null>(null);

  const handleSearch = async (pageNumber = 1) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL_TEST}?apikey=${API_KEY}&q=${keyword}&page=${pageNumber}`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setImages(data.data); // Save all image data
      setTotalPages(data.meta.last_page);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!isSelectionMode || selectedImages.length === 0) {
      alert(t('common.noImagesSelected'));
      return;
    }

    const downloadImages = isSelectionMode ? selectedImages : images.map((img) => img.thumbs.original);
    downloadImages.forEach((url) => {
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
    setSelectedImages([]);
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

  const handleSelectImage = (img: any) => {
    if (isSelectionMode) {
      setSelectedImages((prevSelected) =>
        prevSelected.includes(img.thumbs.original) ? prevSelected.filter((url) => url !== img.thumbs.original) : [...prevSelected, img.thumbs.original]
      );
    } else {
      setLargeImage(img.path);
    }
  };

  const handleSelectAll = () => {
    setSelectedImages(images.map((img) => img.thumbs.original));
  };

  const handleDeselectAll = () => {
    setSelectedImages([]);
  };

  const toggleSelectionMode = () => {
    setIsSelectionMode(!isSelectionMode);
    setSelectedImages([]);
  };

  const closeLargeImage = () => {
    setLargeImage(null);
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
        <button onClick={toggleSelectionMode}>
          {isSelectionMode ? t('common.exitSelection') : t('common.enterSelection')}
        </button>
        {isSelectionMode && (
          <>
            <button onClick={handleSelectAll}>{t('common.selectAll')}</button>
            <button onClick={handleDeselectAll}>{t('common.deselectAll')}</button>
          </>
        )}
      </div>
      <div className="image-display">
        {loading ? (
          <div className="loading">{t('common.loading')}</div>
        ) : (
          <Masonry breakpointCols={6} className="my-masonry-grid" columnClassName="my-masonry-grid_column">
            {images.map((img, index) => (
              <img
                key={index}
                src={img.thumbs.original}
                alt={`wallhaven-${index}`}
                onClick={() => handleSelectImage(img)}
                className={isSelectionMode && selectedImages.includes(img.thumbs.original) ? 'selected' : ''}
              />
            ))}
          </Masonry>
        )}
      </div>
      <div className="pagination">
        <button onClick={handlePrevPage} disabled={page === 1} className="pagination-button">
          {t('common.previous')}
        </button>
        <span className="pagination-info">
          {page} / {totalPages}
        </span>
        <button onClick={handleNextPage} disabled={page === totalPages} className="pagination-button">
          {t('common.next')}
        </button>
      </div>
      {largeImage && (
        <div className="large-image-overlay" onClick={closeLargeImage}>
          <img src={largeImage} alt="Large preview" className="large-image" />
        </div>
      )}
    </div>
  );
}

export default WallhavenDownload;
