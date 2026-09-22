import { useEffect, useState } from 'react';

const MENU_KEY = 'addiseats_menu';

function readStoredMenu() {
  try {
    const savedMenu = JSON.parse(localStorage.getItem(MENU_KEY) || '[]');
    return Array.isArray(savedMenu) ? savedMenu : [];
  } catch {
    return [];
  }
}

export function useFetch(url) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let ignore = false;

    const loadData = async () => {
      setLoading(true);
      setError('');

      try {
        if (url === '/dishes.json') {
          const storedMenu = readStoredMenu();

          if (storedMenu.length > 0) {
            if (!ignore) setData(storedMenu);
            return;
          }
        }

        const response = await fetch(url);
        if (!response.ok) throw new Error('Unable to fetch data');

        const result = await response.json();
        const menu = url === '/dishes.json' && Array.isArray(result)
          ? result.map((dish) => ({ ...dish, visible: dish.visible ?? true }))
          : result;

        if (!ignore) {
          setData(menu);

          if (url === '/dishes.json' && Array.isArray(menu)) {
            localStorage.setItem(MENU_KEY, JSON.stringify(menu));
          }
        }
      } catch (err) {
        if (!ignore) setError(err.message);
      } finally {
        if (!ignore) setLoading(false);
      }
    };

    const refreshManagedMenu = () => {
      if (url !== '/dishes.json') return;

      const storedMenu = readStoredMenu();
      setData(storedMenu);
      setError('');
      setLoading(false);
    };

    loadData();
    window.addEventListener('menu:updated', refreshManagedMenu);
    window.addEventListener('storage', refreshManagedMenu);

    return () => {
      ignore = true;
      window.removeEventListener('menu:updated', refreshManagedMenu);
      window.removeEventListener('storage', refreshManagedMenu);
    };
  }, [url]);

  return { data, loading, error };
}
