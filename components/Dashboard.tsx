
import React from 'react';

interface DashboardProps {
  currentStage: string;
  score: number;
  distance: number;
}

const Dashboard: React.FC<DashboardProps> = ({ currentStage, score, distance }) => {
  return (
    <div className="absolute top-4 left-0 right-0 px-4 flex justify-between items-start pointer-events-none z-20">
      <div className="bg-slate-900/80 backdrop-blur border-2 border-slate-700 px-6 py-3 rounded-full text-white font-bold shadow-xl">
        <span className="text-slate-400 text-xs uppercase mr-2 tracking-wider">Current Stage</span>
        <span className="text-yellow-400 font-arcade">{currentStage}</span>
      </div>
      
      <div className="bg-slate-900/80 backdrop-blur border-2 border-slate-700 px-6 py-3 rounded-full text-white font-bold shadow-xl font-arcade">
        SCORE: {Math.floor(distance / 10)}
      </div>
    </div>
  );
};

export default Dashboard;
