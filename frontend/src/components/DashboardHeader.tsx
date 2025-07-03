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
      <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4'>
        <div className='flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4'>
          <div>
            <h1 className='text-xl sm:text-2xl text-brand'>
              Trip Tracker Dashboard
            </h1>
            <p className='text-sm text-gray-500 mt-1'>
              A sample app by{' '}
              <a
                href='https://regiscamimura.com'
                target='_blank'
                rel='noopener noreferrer'
                className='text-accent hover:text-brand underline'
              >
                Regis Camimura
              </a>{' '}
              for{' '}
              <a
                href='https://spotter.na.teamtailor.com/'
                target='_blank'
                rel='noopener noreferrer'
                className='text-accent hover:text-brand underline'
              >
                Spotter.Ai
              </a>
            </p>
          </div>
          <p className='text-lg sm:text-xl text-accent'>
            Welcome, {user?.first_name}!
          </p>
        </div>
        <div className='flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto'>
          <button
            onClick={onSimulateDay}
            disabled={isSimulating}
            className='btn-outline border-brand hover:bg-brand/10 disabled:border-gray-600 disabled:bg-transparent w-full sm:w-auto'
          >
            {isSimulating ? 'Simulating...' : 'ELD Simulation'}
          </button>
          <button
            onClick={onLogout}
            className='btn-outline border-red-600 hover:bg-red-600/10 w-full sm:w-auto'
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  )
}
