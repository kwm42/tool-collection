import React from 'react';
import { useTranslation } from 'react-i18next';

function ViewKLine() {
  const { t } = useTranslation();

  return (
    <div className="h-full w-full">
      <iframe
        src="https://kwm42.github.io/coin-quote-board/"
        title="K-Line View"
        className="w-full h-full"
        style={{ border: 'none' }}
      />
    </div>
  );
}

export default ViewKLine;
