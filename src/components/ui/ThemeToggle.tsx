import * as React from "react"
import { Moon, Sun } from "lucide-react"

import { Button } from "@/components/ui/Button"
import { useTheme } from "@/hooks/useTheme"

interface ThemeToggleProps extends React.HTMLAttributes<HTMLButtonElement> {
  // Optional size variant
  size?: "sm" | "md" | "lg"
  // Whether to display as a button or icon only
  variant?: "button" | "icon"
  // Custom icons
  lightIcon?: React.ReactNode
  darkIcon?: React.ReactNode
  // Custom labels
  lightLabel?: string
  darkLabel?: string
}

export function ThemeToggle({
  size = "md",
  variant = "icon",
  lightIcon,
  darkIcon,
  lightLabel = "Light mode",
  darkLabel = "Dark mode",
  className,
  ...props
}: ThemeToggleProps) {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)
  
  // Handle theme toggle
  const toggleTheme = React.useCallback(() => {
    setTheme(theme === "light" ? "dark" : "light")
  }, [theme, setTheme])
  
  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault()
      toggleTheme()
    }
    
    if (props.onKeyDown) {
      props.onKeyDown(e)
    }
  }
  
  // Only show the toggle on client-side to avoid hydration mismatch
  React.useEffect(() => {
    setMounted(true)
  }, [])
  
  if (!mounted) {
    return null
  }
  
  // Icon sizing based on size prop
  const iconSizes = {
    sm: 14,
    md: 18,
    lg: 22
  }
  
  // Button sizing based on size prop
  const buttonSizes = {
    sm: "h-8 px-2",
    md: "h-10 px-3",
    lg: "h-12 px-4"
  }
  
  // Render icon based on current theme
  const renderIcon = () => {
    if (theme === "dark") {
      return darkIcon || <Moon size={iconSizes[size]} className="transition-transform duration-200" />
    }
    return lightIcon || <Sun size={iconSizes[size]} className="transition-transform duration-200" />
  }
  
  // Render label based on current theme
  const renderLabel = () => {
    return theme === "dark" ? darkLabel : lightLabel
  }
  
  // Render as button or icon-only
  if (variant === "button") {
    return (
      <Button
        size={size === "lg" ? "lg" : size === "sm" ? "sm" : "default"}
        variant="outline"
        onClick={toggleTheme}
        onKeyDown={handleKeyDown}
        aria-label={renderLabel()}
        className={`transition-colors duration-200 ${className}`}
        {...props}
      >
        {renderIcon()}
        <span className="ml-2">{renderLabel()}</span>
      </Button>
    )
  }
  
  return (
    <Button
      variant="ghost"
      size="icon"
      className={`rounded-full h-auto w-auto p-2 transition-transform hover:scale-110 ${className}`}
      onClick={toggleTheme}
      onKeyDown={handleKeyDown}
      aria-label={renderLabel()}
      title={renderLabel()}
      {...props}
    >
      {renderIcon()}
    </Button>
  )
} 