import { useAuth } from '@/hooks/useAuth'

interface DashboardHeaderProps {
  onLogout: () => void
  onSimulateDay: () => void
  isSimulating: boolean
}

export default function DashboardHeader({
  onLogout,
  onSimulateDay,
  isSimulating,
}: DashboardHeaderProps) {
  const { user } = useAuth()

  return (
    <div className='bg-surface p-4 mb-1'>
      <div className='flex justify-between items-center'>
        <div className='flex items-center gap-4'>
          <h1 className='text-2xl text-brand'>Trip Tracker Dashboard</h1>
          <p className='text-xl text-accent'>Welcome, {user?.first_name}!</p>
        </div>
        <div className='flex gap-3'>
          <button
            onClick={onSimulateDay}
            disabled={isSimulating}
            className='btn-outline border-brand hover:bg-brand/10 disabled:border-gray-600 disabled:bg-transparent'
          >
            {isSimulating ? 'Simulating...' : 'ELD Simulation'}
          </button>
          <button
            onClick={onLogout}
            className='btn-outline border-red-600 hover:bg-red-600/10'
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  )
}
