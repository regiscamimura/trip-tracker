import { useEffect } from 'react'

interface SimulationResultModalProps {
  isOpen: boolean
  onClose: () => void
  simulationResult: string
  onOpenMap: () => void
  onOpenLogBook: () => void
}

export default function SimulationResultModal({
  isOpen,
  onClose,
  simulationResult,
  onOpenMap,
  onOpenLogBook,
}: SimulationResultModalProps) {
  // Disable body scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    // Cleanup function to restore scrolling when component unmounts
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className='fixed inset-0 bg-white/50 bg-opacity-5 flex items-center justify-center z-50 p-2 sm:p-4 backdrop-blur-xs'>
      <div className='bg-black/60 border border-white/40 max-w-4xl w-full max-h-[90vh] sm:max-h-[80vh] overflow-hidden'>
        {/* Header */}
        <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 border-b border-white/40'>
          <h2 className='text-lg sm:text-xl text-brand'>Simulation Result</h2>
          <div className='flex flex-col sm:flex-row gap-2 w-full sm:w-auto'>
            <button
              onClick={onOpenMap}
              className='btn-outline border-blue-600 hover:bg-blue-600/10 flex items-center gap-2 w-full sm:w-auto'
            >
              <svg
                className='w-4 h-4'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m-6 3l6-3'
                />
              </svg>
              View Map
            </button>
            <button
              onClick={onOpenLogBook}
              className='btn-outline border-green-600 hover:bg-green-600/10 flex items-center gap-2 w-full sm:w-auto'
            >
              <svg
                className='w-4 h-4'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
                />
              </svg>
              View Log Book
            </button>
            <button
              onClick={onClose}
              className='btn-outline border-gray-600 hover:bg-gray-600/10 w-full sm:w-auto'
            >
              Close
            </button>
          </div>
        </div>

        {/* Content */}
        <div className='p-4 overflow-y-auto max-h-[calc(90vh-120px)]'>
          <pre className='whitespace-pre-wrap text-sm overflow-x-auto text-white'>
            {simulationResult}
          </pre>
        </div>
      </div>
    </div>
  )
}
