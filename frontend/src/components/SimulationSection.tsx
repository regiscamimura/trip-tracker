interface SimulationSectionProps {
  isSimulating: boolean
  onSimulateDay: () => void
  simulationResult: string
}

export default function SimulationSection({
  isSimulating,
  onSimulateDay,
  simulationResult,
}: SimulationSectionProps) {
  return (
    <>
      <div className='bg-surface rounded-lg p-6 mb-6'>
        <h2 className='text-xl text-brand'>ELD Simulation</h2>
        <div className='text-white'>
          <p className='text-gray-400 mb-4'>
            Demo: Simulate a realistic truck driver's day with automatic duty
            status tracking.
          </p>
          <button
            onClick={onSimulateDay}
            disabled={isSimulating}
            className='bg-brand hover:bg-brand/80 disabled:bg-gray-600 text-white px-6 py-3 rounded-lg transition-colors text-lg'
          >
            {isSimulating ? 'Simulating...' : 'Simulate Day'}
          </button>
        </div>
      </div>

      {simulationResult && (
        <div className='bg-surface rounded-lg p-6 mb-6'>
          <h2 className='text-xl text-brand'>Simulation Result</h2>
          <div className='text-white'>
            <pre className='whitespace-pre-wrap text-sm bg-gray-800 p-4 rounded-lg overflow-x-auto'>
              {simulationResult}
            </pre>
          </div>
        </div>
      )}
    </>
  )
}
