import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface EmptyProps {
  className?: string;
  icon?: LucideIcon;
  iconClassName?: string;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: "default" | "outline" | "ghost" | "secondary";
  };
}

export function Empty({ 
  className, 
  icon: Icon, 
  iconClassName,
  title, 
  description, 
  action 
}: EmptyProps) {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center py-16 px-6 text-center",
      className
    )}>
      {Icon && (
        <div className={cn(
          "w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4",
          iconClassName
        )}>
          <Icon className="w-8 h-8 text-muted-foreground" />
        </div>
      )}
      
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      
      {description && (
        <p className="text-muted-foreground text-sm mb-6 max-w-sm">
          {description}
        </p>
      )}
      
      {action && (
        <button
          onClick={action.onClick}
          className={cn(
            "inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2",
            action.variant === "default" && "bg-primary text-primary-foreground hover:bg-primary/90",
            action.variant === "outline" && "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
            action.variant === "ghost" && "hover:bg-accent hover:text-accent-foreground",
            action.variant === "secondary" && "bg-secondary text-secondary-foreground hover:bg-secondary/80",
            !action.variant && "border border-input bg-background hover:bg-accent hover:text-accent-foreground"
          )}
        >
          {action.label}
        </button>
      )}
    </div>
  );
}

// Preset variants for common use cases
export const EmptyCard = ({ className, ...props }: Omit<EmptyProps, 'title'> & { title?: string }) => (
  <div className={cn("flex h-[450px] shrink-0 items-center justify-center rounded-md border border-dashed", className)}>
    <Empty {...props} />
  </div>
);

export const EmptyPage = ({ className, ...props }: EmptyProps) => (
  <div className={cn("flex min-h-[400px] flex-1 items-center justify-center rounded-lg border border-dashed", className)}>
    <Empty {...props} />
  </div>
);