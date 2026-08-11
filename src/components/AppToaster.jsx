import { Toaster } from 'sonner'

/**
 * Mount once at the app root. All toast.* / notify.* calls render here (top-right).
 */
export default function AppToaster() {
  return (
    <Toaster
      position="top-right"
      richColors
      closeButton
      duration={4500}
      toastOptions={{
        classNames: {
          toast:
            'border border-white/10 bg-[#252338] text-white shadow-xl font-[Inter,sans-serif]',
          title: 'text-sm font-medium text-white',
          description: 'text-xs text-white/70',
          closeButton: 'border-white/10 bg-[#313044] text-white/70',
          error: '!bg-[#3a1f2a] !border-[#FF7B7B]/35 !text-[#FFB4B4]',
          success: '!bg-[#1f3328] !border-[#60D624]/35 !text-[#B8F0A0]',
          warning: '!bg-[#3a3018] !border-[#FFC542]/35 !text-[#FFE08A]',
          info: '!bg-[#1a2e38] !border-[#00CED1]/35 !text-[#9DECF0]',
        },
      }}
    />
  )
}
