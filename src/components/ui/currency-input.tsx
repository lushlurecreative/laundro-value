import * as React from "react"
import { cn } from "@/lib/utils"

interface CurrencyInputProps extends Omit<React.ComponentProps<"input">, 'onChange'> {
  value?: number | string;
  onChange?: (value: number) => void;
}

const CurrencyInput = React.forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ className, value, onChange, ...props }, ref) => {
    const [displayValue, setDisplayValue] = React.useState('')
    const isTypingRef = React.useRef(false)

    // Only update display value from props when not actively typing
    React.useEffect(() => {
      if (!isTypingRef.current) {
        if (value === undefined || value === null || value === 0 || value === '0' || value === '') {
          setDisplayValue('')
        } else {
          const numValue = typeof value === 'number' ? value : parseFloat(value as string) || 0
          if (numValue > 0) {
            setDisplayValue(numValue.toLocaleString('en-US', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2
            }))
          } else {
            setDisplayValue('')
          }
        }
      }
    }, [value])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      isTypingRef.current = true
      const inputValue = e.target.value
      
      // Allow empty string to clear the field
      if (inputValue === '') {
        setDisplayValue('')
        onChange?.(0)
        return
      }
      
      // Remove non-numeric characters except dots
      const numericValue = inputValue.replace(/[^0-9.]/g, '')
      
      // Don't allow multiple decimal points
      const decimalCount = (numericValue.match(/\./g) || []).length
      if (decimalCount > 1) {
        return
      }
      
      // Update display value without formatting while typing
      setDisplayValue(numericValue)
      
      // Parse and send numeric value
      const parsed = parseFloat(numericValue) || 0
      onChange?.(parsed)
    }

    const handleBlur = () => {
      isTypingRef.current = false
      
      if (displayValue === '') {
        onChange?.(0)
        return
      }
      
      const numValue = parseFloat(displayValue) || 0
      if (numValue > 0) {
        const formatted = numValue.toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        })
        setDisplayValue(formatted)
        onChange?.(numValue)
      } else {
        setDisplayValue('')
        onChange?.(0)
      }
    }

    const handleFocus = () => {
      isTypingRef.current = true
      // Convert formatted value back to raw number for editing
      if (displayValue) {
        const rawValue = displayValue.replace(/,/g, '')
        setDisplayValue(rawValue)
      }
    }

    return (
      <div className="relative">
        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
          $
        </span>
        <input
          type="text"
          className={cn(
            "flex h-10 w-full rounded-md border border-input bg-background pl-8 pr-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
            className
          )}
          value={displayValue}
          onChange={handleChange}
          onBlur={handleBlur}
          onFocus={handleFocus}
          ref={ref}
          {...props}
        />
      </div>
    )
  }
)
CurrencyInput.displayName = "CurrencyInput"

export { CurrencyInput }