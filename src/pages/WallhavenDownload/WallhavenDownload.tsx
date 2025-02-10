import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Masonry from 'react-masonry-css';
import { fetchData } from '../../utils/request';
import './wallhaven_download.css';

const API_URL_TEST = 'http://localhost:3001/wallhaven/search';
const API_URL = 'https://wallhaven.cc/api/v1/search';
const API_KEY = 'TGOqr9tmdQNYOf7YG9ulyh5hlTtnHVtV';

const calculateColumns = () => {
  const sidebarWidth = 250; // Adjust this value based on your sidebar width
  const windowWidth = window.innerWidth - sidebarWidth;
  return Math.max(1, Math.floor(windowWidth / 250));
};

function WallhavenDownload() {
  const { t } = useTranslation();
  const [keyword, setKeyword] = useState('Azur Lane');
  const [images, setImages] = useState<any[]>([]);
  const [selectedImages, setSelectedImages] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [largeImage, setLargeImage] = useState<string | null>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; img: any } | null>(null);
  const [columns, setColumns] = useState(calculateColumns());
  const [customPage, setCustomPage] = useState('');
  const [startPage, setStartPage] = useState('');
  const [endPage, setEndPage] = useState('');
  const [isAutoDownloading, setIsAutoDownloading] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setColumns(calculateColumns());
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

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
      return data.data
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
    return []
  };

  const handleDownloadAll = (data = []) => {
    if (data.length === 0) {
      alert(t('common.noImagesSelected'));
      return;
    }

    console.log(data.map(img => img.id).join('/'))

    data.forEach((img) => {
      const url = img.path;
      const filename = url.split('/').pop() || 'image.jpg';
      if (window.Main) {
        window.Main.send('download-file', url, filename);
      } else {
        console.error('window.Main is not available');
      }
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

  const handleCustomPageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomPage(e.target.value);
  };

  const handleCustomPageSubmit = () => {
    const pageNumber = parseInt(customPage, 10);
    if (!isNaN(pageNumber) && pageNumber > 0 && pageNumber <= totalPages) {
      setPage(pageNumber);
      handleSearch(pageNumber);
    }
  };

  const handleSelectImage = (img: any) => {
    if (isSelectionMode) {
      setSelectedImages((prevSelected) =>
        prevSelected.some((selected) => selected.path === img.path)
          ? prevSelected.filter((selected) => selected.path !== img.path)
          : [...prevSelected, img]
      );
    } else {
      setLargeImage(img.path);
    }
  };

  const handleSelectAll = () => {
    setSelectedImages(images);
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

  const handleContextMenu = (event: React.MouseEvent, img: any) => {
    event.preventDefault();
    setContextMenu({ x: event.clientX, y: event.clientY, img });
  };

  const handleDownloadImage = (img: any) => {
    const url = img.path
    const filename = url.split('/').pop() || 'image.jpg';
    window.Main.send('download-file', url, filename);
  };

  const handleViewDetails = (img: any) => {
    setLargeImage(img.path);
    setContextMenu(null);
  };

  const handlePrevImage = () => {
    if (largeImage) {
      const currentIndex = images.findIndex((img) => img.path === largeImage);
      if (currentIndex > 0) {
        setLargeImage(images[currentIndex - 1].path);
      }
    }
  };

  const handleNextImage = () => {
    if (largeImage) {
      const currentIndex = images.findIndex((img) => img.path === largeImage);
      if (currentIndex < images.length - 1) {
        setLargeImage(images[currentIndex + 1].path);
      }
    }
  };

  const handleAutoDownload = async () => {
    const start = parseInt(startPage, 10);
    const end = parseInt(endPage, 10);
    if (isNaN(start) || isNaN(end) || start <= 0 || end <= 0 || start > end) {
      alert(t('common.invalidPageRange'));
      return;
    }

    setIsAutoDownloading(true);
    for (let pageNumber = start; pageNumber <= end; pageNumber++) {
      setPage(pageNumber);
      const data = await handleSearch(pageNumber);
      handleDownloadAll(data);
      await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait for 2 seconds
    }
    setIsAutoDownloading(false);
  };

  const openDownloadFolder = () => {
    if (window.Main) {
      window.Main.send('open-download-folder');
    } else {
      console.error('window.Main is not available');
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
        <button onClick={() => handleDownloadAll(images)}>{t('common.download')}</button>
        {isSelectionMode && (
          <>
            <button onClick={handleSelectAll}>{t('common.selectAll')}</button>
            <button onClick={handleDeselectAll}>{t('common.deselectAll')}</button>
          </>
        )}
        <input
          type="number"
          value={startPage}
          onChange={(e) => setStartPage(e.target.value)}
          placeholder={t('common.startPage')}
        />
        <input
          type="number"
          value={endPage}
          onChange={(e) => setEndPage(e.target.value)}
          placeholder={t('common.endPage')}
        />
        <button onClick={handleAutoDownload} disabled={isAutoDownloading}>
          {t('common.autoDownload')}
        </button>
        <button onClick={openDownloadFolder}>{t('common.openFolder')}</button>
      </div>
      <div className="image-display">
        {loading ? (
          <div className="loading">{t('common.loading')}</div>
        ) : (
          <Masonry breakpointCols={columns} className="my-masonry-grid" columnClassName="my-masonry-grid_column">
            {images.map((img, index) => (
              <img
                key={index}
                src={img.thumbs.original}
                alt={`wallhaven-${index}`}
                onClick={() => handleSelectImage(img)}
                onContextMenu={(e) => handleContextMenu(e, img)}
                className={isSelectionMode && selectedImages.some((selected) => selected.path === img.path) ? 'selected' : ''}
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
        <input
          type="number"
          value={customPage}
          onChange={handleCustomPageChange}
          placeholder={t('common.page')}
          className="pagination-input"
        />
        <button onClick={handleCustomPageSubmit} className="pagination-button">
          {t('common.go')}
        </button>
      </div>
      {largeImage && (
        <div className="large-image-overlay" onClick={closeLargeImage}>
          <button
            className="large-image-nav left"
            onClick={(e) => {
              e.stopPropagation();
              handlePrevImage();
            }}
            disabled={images.findIndex((img) => img.path === largeImage) === 0}
          >
            &lt;
          </button>
          <img src={largeImage} alt="Large preview" className="large-image" />
          <button
            className="large-image-nav right"
            onClick={(e) => {
              e.stopPropagation();
              handleNextImage();
            }}
            disabled={images.findIndex((img) => img.path === largeImage) === images.length - 1}
          >
            &gt;
          </button>
        </div>
      )}
      {contextMenu && (
        <div
          className="context-menu"
          style={{ top: contextMenu.y, left: contextMenu.x }}
          onClick={() => setContextMenu(null)}
        >
          <button onClick={() => handleDownloadImage(contextMenu.img)}>{t('common.download')}</button>
          <button onClick={() => handleViewDetails(contextMenu.img)}>{t('common.viewDetails')}</button>
        </div>
      )}
    </div>
  );
}

export default WallhavenDownload;
