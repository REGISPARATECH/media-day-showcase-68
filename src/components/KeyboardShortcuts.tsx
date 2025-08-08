import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const KeyboardShortcuts = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!e.ctrlKey || !e.altKey) return;
      const key = (e.key || '').toLowerCase();
      if (key === 'a') { e.preventDefault(); navigate('/admin'); }
      if (key === 'u') { e.preventDefault(); navigate('/upload'); }
      if (key === 'p') { e.preventDefault(); navigate('/'); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [navigate]);

  return null;
};

export default KeyboardShortcuts;
