import React, { useState } from 'react';
import './folder_tool.css';

function FolderTool() {
  const [folderPath, setFolderPath] = useState('');
  const [duplicates, setDuplicates] = useState<{ [key: string]: string[] }>({});
  const [folderDuplicates, setFolderDuplicates] = useState<{ [key: string]: number }>({});

  const handleSelectFolder = async () => {
    if (window.Main) {
      const path = await window.Main.invoke('select-path');
      if (path) {
        setFolderPath(path);
      }
    } else {
      console.error('window.Main is not available');
    }
  };

  const handleDetectDuplicates = () => {
    if (folderPath) {
      if (window.Main) {
        window.Main.send('detect-duplicates', folderPath);
        window.Main.on('duplicates-detected', ({ duplicates, folderDuplicates }: { duplicates: { [key: string]: string[] }, folderDuplicates: { [key: string]: number } }) => {
          setDuplicates(duplicates);
          setFolderDuplicates(folderDuplicates);
        });
      } else {
        console.error('window.Main is not available');
      }
    } else {
      alert('Please select a folder first.');
    }
  };

  const handleOpenFileLocation = (filePath: string) => {
    if (window.Main) {
      window.Main.send('open-file-location', filePath);
    } else {
      console.error('window.Main is not available');
    }
  };

  return (
    <div className="folder-tool">
      <button onClick={handleSelectFolder}>Select Folder</button>
      <button onClick={handleDetectDuplicates}>Detect Duplicates</button>
      {folderPath && <div>Selected Folder: {folderPath}</div>}
      {Object.keys(duplicates).length > 0 && (
        <div className="duplicates-list">
          <h3>Duplicate Files:</h3>
          <ul>
            {Object.entries(duplicates).map(([fileName, paths]) => (
              <li key={fileName}>
                {fileName}: {paths.length} duplicates
                <button onClick={() => handleOpenFileLocation(paths[0])}>Open Location</button>
              </li>
            ))}
          </ul>
        </div>
      )}
      {Object.keys(folderDuplicates).length > 0 && (
        <div className="folder-duplicates-list">
          <h3>Duplicate Files by Folder:</h3>
          <ul>
            {Object.entries(folderDuplicates).map(([folder, count]) => (
              <li key={folder}>
                {folder}: {count} duplicates
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default FolderTool;
