interface LogBookRemarksProps {
  dutyStatuses: any[]
}

export default function LogBookRemarks({ dutyStatuses }: LogBookRemarksProps) {
  return (
    <div className='border-2 border-black p-4'>
      <h3 className='text-black font-bold mb-3 text-center border-b border-black pb-2'>
        REMARKS
      </h3>
      <div className='space-y-2 max-h-48 overflow-y-auto'>
        {dutyStatuses.length > 0 ? (
          dutyStatuses.map(status => (
            <div
              key={status.id}
              className='text-sm text-black border-l-2 border-black pl-3'
            >
              <div className='font-bold'>
                {new Date(status.timestamp).toLocaleTimeString()} -{' '}
                {status.duty_status.replace('_', ' ').toUpperCase()}
              </div>
              <div className='text-gray-700'>{status.location_address}</div>
              {status.notes && (
                <div className='text-gray-600 italic'>"{status.notes}"</div>
              )}
            </div>
          ))
        ) : (
          <div className='text-gray-500 italic'>
            No duty status changes recorded
          </div>
        )}
      </div>
    </div>
  )
}
