import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

export function PasswordVisibilityToggle({
  visible,
  onToggle,
  label = 'Toggle password visibility',
  className = 'absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70 transition-colors',
}) {
  return (
    <button type="button" onClick={onToggle} aria-label={label} className={className}>
      {visible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
    </button>
  )
}

/**
 * Password input with show/hide eye toggle.
 * Pass the same className you would on a normal <input>; padding-right is added for the icon.
 */
export default function PasswordInput({
  className = '',
  containerClassName = 'relative',
  toggleClassName,
  toggleLabel = 'Toggle password visibility',
  style,
  ...props
}) {
  const [visible, setVisible] = useState(false)

  return (
    <div className={containerClassName}>
      <input
        {...props}
        type={visible ? 'text' : 'password'}
        className={`${className} pr-11`.trim()}
        style={style}
      />
      <PasswordVisibilityToggle
        visible={visible}
        onToggle={() => setVisible((v) => !v)}
        label={toggleLabel}
        className={toggleClassName}
      />
    </div>
  )
}
