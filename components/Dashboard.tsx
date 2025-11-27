
import React from 'react';

interface DashboardProps {
  currentStage: string;
  score: number;
  distance: number;
}

const Dashboard: React.FC<DashboardProps> = ({ currentStage, score, distance }) => {
  return (
    <div className="absolute top-2 left-0 right-0 px-2 flex justify-between items-start pointer-events-none z-20 w-full max-w-[900px] mx-auto">
      <div className="bg-slate-900/80 backdrop-blur border border-slate-700 px-3 py-2 rounded-full text-white font-bold shadow-xl flex items-center gap-2">
        <span className="text-slate-400 text-[10px] md:text-xs uppercase tracking-wider hidden sm:inline-block">Current Stage</span>
        <span className="text-yellow-400 font-arcade text-xs sm:text-sm md:text-base whitespace-nowrap">{currentStage}</span>
      </div>
      
      <div className="bg-slate-900/80 backdrop-blur border border-slate-700 px-3 py-2 rounded-full text-white font-bold shadow-xl font-arcade text-xs sm:text-sm md:text-base whitespace-nowrap">
        SCORE: {Math.floor(distance / 10)}
      </div>
    </div>
  );
};

export default Dashboard;
