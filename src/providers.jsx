import { QueryClientProvider } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import AppToaster from './components/AppToaster'
import { clearLegacyAuthStorage } from './lib/auth-cookies'
import { getQueryClient } from './lib/query-client'

export function Providers({ children }) {
  const [queryClient] = useState(() => getQueryClient())

  useEffect(() => {
    clearLegacyAuthStorage()
  }, [])

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <AppToaster />
    </QueryClientProvider>
  )
}
