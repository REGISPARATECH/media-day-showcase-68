import { Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/useTheme";

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggleTheme}
      className="font-orbitron"
    >
      {theme === 'light' ? (
        <>
          <Moon className="h-4 w-4 mr-2" />
          Escuro
        </>
      ) : (
        <>
          <Sun className="h-4 w-4 mr-2" />
          Claro
        </>
      )}
    </Button>
  );
};

export default ThemeToggle;