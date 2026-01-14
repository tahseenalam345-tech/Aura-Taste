import { useEffect, useState } from 'react';

export default function OrderTimer({ createdAt }) {
  const [timeLeft, setTimeLeft] = useState("");
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!createdAt) return;

    const interval = setInterval(() => {
      // Order Time
      const start = createdAt.toDate().getTime();
      // Target Time (45 mins later)
      const target = start + (45 * 60 * 1000); 
      const now = new Date().getTime();
      
      const diff = target - now;
      
      // Calculate Progress Percentage (0 to 100)
      const totalDuration = 45 * 60 * 1000;
      const elapsed = now - start;
      const prog = Math.min((elapsed / totalDuration) * 100, 100);
      setProgress(prog);

      if (diff <= 0) {
        setTimeLeft("Order Ready!");
        clearInterval(interval);
      } else {
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft(`${m}m ${s}s`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [createdAt]);

  return (
    <div className="w-full">
      <div className="flex justify-between items-end mb-1">
        <span className="text-xs text-gray-400 uppercase tracking-widest font-bold">Estimated Time</span>
        <span className="text-2xl font-bold text-primary tabular-nums">{timeLeft}</span>
      </div>
      {/* Progress Bar */}
      <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
        <div 
          className="h-full bg-primary transition-all duration-1000 ease-linear"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}