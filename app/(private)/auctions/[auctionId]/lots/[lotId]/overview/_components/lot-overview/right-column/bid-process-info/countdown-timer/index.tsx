type CountdownTimerProps = {
  lotTimeLeft: number;
  progress: number;
};

const CountdownTimer = ({ lotTimeLeft, progress }: CountdownTimerProps) => {
  const days = Math.max(0, Math.floor(lotTimeLeft / (60 * 60 * 24)))
    .toString()
    .padStart(2, '0');
  const hours = Math.max(0, Math.floor((lotTimeLeft / (60 * 60)) % 24))
    .toString()
    .padStart(2, '0');
  const minutes = Math.max(0, Math.floor((lotTimeLeft / 60) % 60))
    .toString()
    .padStart(2, '0');
  const seconds = Math.max(0, Math.floor(lotTimeLeft % 60))
    .toString()
    .padStart(2, '0');

  return (
    <div className='flex flex-col items-center space-y-2'>
      <div className='w-full h-2 bg-slate-200 rounded-full overflow-hidden'>
        <div
          className='h-full w-full transition-all duration-50 ease-linear'
          style={{
            width: `${progress}%`,
            background: progress <= 40 ? '#3b82f6' : progress <= 80 ? '#f59e0b' : '#ef4444',
          }}
        />
      </div>
      <div className='text-sm font-medium'>
        {days}:{hours}:{minutes}:{seconds}
      </div>
    </div>
  );
};

export default CountdownTimer;
