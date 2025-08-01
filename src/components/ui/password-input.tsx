import * as React from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export interface PasswordInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  showSaveOption?: boolean;
  onSave?: (password: string) => void;
}

const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, showSaveOption = false, onSave, ...props }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false);
    const [savePassword, setSavePassword] = React.useState(false);

    const handleSave = () => {
      if (savePassword && onSave && props.value) {
        onSave(props.value as string);
      }
    };

    React.useEffect(() => {
      if (savePassword) {
        handleSave();
      }
    }, [savePassword, props.value]);

    return (
      <div className="relative space-y-2">
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            className={cn(
              "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pr-10 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
              className
            )}
            ref={ref}
            {...props}
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4 text-muted-foreground" />
            ) : (
              <Eye className="h-4 w-4 text-muted-foreground" />
            )}
          </Button>
        </div>
        
        {showSaveOption && (
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="save-password"
              checked={savePassword}
              onChange={(e) => setSavePassword(e.target.checked)}
              className="rounded border-input"
            />
            <label htmlFor="save-password" className="text-sm text-muted-foreground">
              Salvar senha
            </label>
          </div>
        )}
      </div>
    );
  }
);

PasswordInput.displayName = "PasswordInput";

export { PasswordInput };