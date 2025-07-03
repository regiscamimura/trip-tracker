import { useAuth } from '@/hooks/useAuth'
import { useSimulator } from '@/hooks/useSimulator'
import { useState, useEffect } from 'react'
import { api } from '@/api/Api'
import type { components } from '@/types/api'
import DashboardHeader from './DashboardHeader'
import DailyLogsList from './DailyLogsList'
import MapView from './MapView'
import SimulationResultModal from './SimulationResultModal'

export default function Dashboard() {
  const { user, logout } = useAuth()
  const { isSimulating, simulationResult, simulateDay } = useSimulator()
  const [dailyLogs, setDailyLogs] = useState<
    components['schemas']['DailyLog'][]
  >([])
  const [isLoadingLogs, setIsLoadingLogs] = useState(false)
  const [selectedDailyLog, setSelectedDailyLog] = useState<
    components['schemas']['DailyLog'] | null
  >(null)
  const [viewMode, setViewMode] = useState<'list' | 'map' | 'chart'>('list')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [latestSimulatedLog, setLatestSimulatedLog] = useState<
    components['schemas']['DailyLog'] | null
  >(null)

  const handleLogout = async () => {
    await logout()
  }

  const loadDailyLogs = async () => {
    setIsLoadingLogs(true)
    try {
      const { data, error } = await api.GET('/api/daily-logs')
      if (error) {
        console.error('Failed to load daily logs:', error)
      } else if (data) {
        setDailyLogs(data)
      }
    } catch (err) {
      console.error('Error loading daily logs:', err)
    } finally {
      setIsLoadingLogs(false)
    }
  }

  // Load logs on component mount
  useEffect(() => {
    loadDailyLogs()
  }, [])

  const handleSimulateDay = async () => {
    const result = await simulateDay(user?.id || 1)
    if (result.success) {
      // Refresh the daily logs list
      await loadDailyLogs()
      // Store the latest simulated log for the modal shortcut
      if (result.dailyLog) {
        setLatestSimulatedLog(result.dailyLog)
      }
      // Open the modal
      setIsModalOpen(true)
    }
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
  }

  const handleOpenMapFromModal = () => {
    if (latestSimulatedLog) {
      setSelectedDailyLog(latestSimulatedLog)
      setViewMode('map')
      setIsModalOpen(false)
    }
  }

  const handleShowMap = (dailyLog: components['schemas']['DailyLog']) => {
    setSelectedDailyLog(dailyLog)
    setViewMode('map')
  }

  const handleShowChart = (dailyLog: components['schemas']['DailyLog']) => {
    setSelectedDailyLog(dailyLog)
    setViewMode('chart')
  }

  const handleBackToList = () => {
    setSelectedDailyLog(null)
    setViewMode('list')
  }

  return (
    <>
      <div className='min-h-screen bg-base p-4'>
        <div className='max mx-auto'>
          <DashboardHeader
            onLogout={handleLogout}
            onSimulateDay={handleSimulateDay}
            isSimulating={isSimulating}
          />

          {/* Content based on view mode */}
          {viewMode === 'list' && (
            <DailyLogsList
              dailyLogs={dailyLogs}
              isLoadingLogs={isLoadingLogs}
              onRefresh={loadDailyLogs}
              onShowMap={handleShowMap}
              onShowChart={handleShowChart}
            />
          )}

          {viewMode === 'map' && selectedDailyLog && (
            <MapView dailyLog={selectedDailyLog} onBack={handleBackToList} />
          )}

          {viewMode === 'chart' && selectedDailyLog && (
            <div className='bg-surface p-4'>
              <div className='flex justify-between items-center mb-2'>
                <div>
                  <button
                    onClick={handleBackToList}
                    className='btn-outline-sm border-gray-600 hover:bg-gray-600/10 flex items-center gap-1 mb-2'
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
                        d='M15 19l-7-7 7-7'
                      />
                    </svg>
                    Back to List
                  </button>
                  <h2 className='text-xl text-brand'>
                    Chart View - Daily Log #{selectedDailyLog.id}
                  </h2>
                  <p className='text-gray-300 text-sm'>
                    {selectedDailyLog.driver?.user?.first_name}{' '}
                    {selectedDailyLog.driver?.user?.last_name} •
                    {new Date(selectedDailyLog.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className='flex justify-center items-center h-64'>
                <div className='text-brand text-lg'>
                  Chart view coming soon...
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Simulation Result Modal */}
      <SimulationResultModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        simulationResult={simulationResult}
        onOpenMap={handleOpenMapFromModal}
      />
    </>
  )
}
