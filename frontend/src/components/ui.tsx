import { cn } from "../lib/utils";

interface CardProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export function Card({ title, children, className }: CardProps) {
  return (
    <div className={cn("bg-gray-900 border border-gray-800 rounded-xl p-5", className)}>
      {title && <h2 className="text-lg font-semibold mb-4">{title}</h2>}
      {children}
    </div>
  );
}

export function StatCard({
  label,
  value,
  icon,
  color = "blue",
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color?: string;
}) {
  const colors: Record<string, string> = {
    blue: "text-blue-400 bg-blue-500/10",
    green: "text-green-400 bg-green-500/10",
    yellow: "text-yellow-400 bg-yellow-500/10",
    red: "text-red-400 bg-red-500/10",
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-400">{label}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
        </div>
        <div className={cn("p-3 rounded-lg", colors[color])}>{icon}</div>
      </div>
    </div>
  );
}

export function Badge({
  children,
  variant = "default",
}: {
  children: React.ReactNode;
  variant?: "default" | "success" | "danger" | "warning";
}) {
  const variants = {
    default: "bg-blue-500/20 text-blue-400",
    success: "bg-green-500/20 text-green-400",
    danger: "bg-red-500/20 text-red-400",
    warning: "bg-yellow-500/20 text-yellow-400",
  };
  return (
    <span className={cn("px-2 py-0.5 rounded text-xs font-medium", variants[variant])}>
      {children}
    </span>
  );
}

export function Button({
  children,
  onClick,
  disabled,
  variant = "primary",
  className,
  type = "button",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: "primary" | "secondary" | "success" | "danger";
  className?: string;
  type?: "button" | "submit";
}) {
  const variants = {
    primary: "bg-blue-600 hover:bg-blue-700 text-white",
    secondary: "bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700",
    success: "bg-green-600 hover:bg-green-700 text-white",
    danger: "bg-red-600 hover:bg-red-700 text-white",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
        variants[variant],
        className
      )}
    >
      {children}
    </button>
  );
}

export function LoadingSpinner({ text = "Loading..." }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-gray-400">
      <div className="w-8 h-8 border-2 border-gray-700 border-t-blue-500 rounded-full animate-spin mb-3" />
      <p className="text-sm">{text}</p>
    </div>
  );
}

export function Alert({ message, type = "error" }: { message: string; type?: "error" | "info" | "success" }) {
  const styles = {
    error: "bg-red-500/10 border-red-500/30 text-red-300",
    info: "bg-blue-500/10 border-blue-500/30 text-blue-300",
    success: "bg-green-500/10 border-green-500/30 text-green-300",
  };
  return <div className={cn("p-3 rounded-lg border text-sm mb-4", styles[type])}>{message}</div>;
}
