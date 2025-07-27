import * as React from "react"
import { cn } from "@/lib/utils"

interface CurrencyInputProps extends Omit<React.ComponentProps<"input">, 'onChange'> {
  value?: number | string;
  onChange?: (value: number) => void;
}

const CurrencyInput = React.forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ className, value, onChange, ...props }, ref) => {
    const [displayValue, setDisplayValue] = React.useState('')

  React.useEffect(() => {
    if (value === undefined || value === null || value === 0 || value === '0' || value === '') {
      setDisplayValue('')
    } else if (typeof value === 'number') {
      setDisplayValue(value.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }))
    } else if (typeof value === 'string' && value !== '') {
      const numValue = parseFloat(value) || 0
      if (numValue > 0) {
        setDisplayValue(numValue.toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        }))
      }
    }
  }, [value])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value
    
    // Allow empty string to clear the field
    if (inputValue === '') {
      setDisplayValue('')
      onChange?.(0)
      return
    }
    
    // Remove non-numeric characters except dots and commas
    const numericValue = inputValue.replace(/[^0-9.,]/g, '')
    
    // Remove commas for parsing
    const cleanValue = numericValue.replace(/,/g, '')
    
    // Update display value
    setDisplayValue(numericValue)
    
    // Parse and send numeric value
    const parsed = parseFloat(cleanValue) || 0
    onChange?.(parsed)
  }

  const handleBlur = () => {
    if (displayValue && typeof value === 'number') {
      setDisplayValue(value.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }))
    } else if (!displayValue) {
      onChange?.(0)
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
          ref={ref}
          {...props}
        />
      </div>
    )
  }
)
CurrencyInput.displayName = "CurrencyInput"

export { CurrencyInput }