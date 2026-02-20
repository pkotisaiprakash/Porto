import { useEffect } from 'react';

/**
 * Simple hook to set the document title. It adds the app name suffix automatically.
 * @param {string} title The page-specific title (e.g. "Home", "Dashboard").
 */
const useDocumentTitle = (title) => {
  useEffect(() => {
    const base = 'Porto';
    if (title) {
      document.title = `${title} | ${base}`;
    } else {
      document.title = base;
    }
  }, [title]);
};

export default useDocumentTitle;
