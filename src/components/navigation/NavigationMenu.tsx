import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Play, Upload, Settings } from "lucide-react";

const NavigationMenu = () => {
  const location = useLocation();

  const navItems = [
    { path: "/", label: "PLAYER", icon: Play },
    { path: "/upload", label: "UPLOAD", icon: Upload },
    { path: "/admin", label: "ADMIN", icon: Settings }
  ];

  return (
    <nav className="fixed top-4 right-4 z-50 flex space-x-2">
      {navItems.map(({ path, label, icon: Icon }) => (
        <Link key={path} to={path}>
          <Button
            variant={location.pathname === path ? "default" : "secondary"}
            size="sm"
            className="font-orbitron shadow-primary"
          >
            <Icon className="w-4 h-4 mr-2" />
            {label}
          </Button>
        </Link>
      ))}
    </nav>
  );
};

export default NavigationMenu;