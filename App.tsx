
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GamePhase, Player, Platform, Obstacle } from './types';
import { SALES_FLOW, GAME_SPEED, JUMP_FORCE, GRAVITY, BLOCK_WIDTH } from './constants';
import Dashboard from './components/Dashboard';
import { submitFlowFeedback } from './services/geminiService';
import { Play, RotateCcw, CheckCircle, XCircle, Send, Loader, AlertTriangle } from 'lucide-react';

const CANVAS_HEIGHT = 400;
const CANVAS_WIDTH = 800; // Conceptual width
const PLAYER_SIZE = 40;
const GROUND_Y = 300;

const App: React.FC = () => {
  // --- STATE ---
  const [phase, setPhase] = useState<GamePhase>(GamePhase.START);
  const [currentStageTitle, setCurrentStageTitle] = useState("Start");
  const [score, setScore] = useState(0);
  
  // Feedback UI State
  const [feedbackStatus, setFeedbackStatus] = useState<'Correct' | 'Incorrect' | null>(null);
  const [feedbackText, setFeedbackText] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);

  // --- REFS (Mutable Game State) ---
  const requestRef = useRef<number>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const state = useRef({
    distance: 0,
    player: { x: 100, y: GROUND_Y - PLAYER_SIZE, w: PLAYER_SIZE, h: PLAYER_SIZE, vy: 0, isGrounded: true } as Player,
    platforms: [] as Platform[],
    obstacles: [] as Obstacle[],
    stageIndex: 0,
    nextSpawnX: 0
  });

  // --- GAME LOOP ENGINE ---
  
  const spawnSegment = useCallback((startX: number) => {
    // If we exhausted all stages, we don't spawn more (Victory condition check happens in loop)
    if (state.current.stageIndex >= SALES_FLOW.length) {
      // Spawn a generic "Finish Line" platform
      state.current.platforms.push({
        id: 'finish',
        x: startX,
        y: GROUND_Y,
        w: 600,
        h: 100,
        stageTitle: 'REVENUE MOUNTAIN',
        role: 'Victory',
        color: 'bg-yellow-400'
      });
      state.current.nextSpawnX = startX + 600;
      return;
    }

    const stage = SALES_FLOW[state.current.stageIndex];
    
    // Create the ground platform
    const platform: Platform = {
      id: `plat-${state.current.stageIndex}`,
      x: startX,
      y: GROUND_Y,
      w: BLOCK_WIDTH,
      h: 100,
      stageTitle: stage.title,
      role: stage.role,
      color: stage.color
    };
    state.current.platforms.push(platform);

    // Chance to spawn obstacle (Pain Point)
    // Don't spawn on the very first block
    if (state.current.stageIndex > 0) {
      const pain = stage.pains[Math.floor(Math.random() * stage.pains.length)];
      const obsX = startX + 50 + Math.random() * (BLOCK_WIDTH - 100);
      
      // Special logic for RFP - Make it impossible to pass
      const isImpossible = pain === 'RFP';
      const obsHeight = isImpossible ? 280 : 40; // 280 is taller than max jump
      const obsY = GROUND_Y - obsHeight;

      state.current.obstacles.push({
        id: `obs-${state.current.stageIndex}`,
        x: obsX,
        y: obsY,
        w: 30,
        h: obsHeight,
        name: pain
      });
    }

    state.current.nextSpawnX = startX + BLOCK_WIDTH + 10; // +10 for small gap visual
    state.current.stageIndex++;
  }, []);

  const resetGame = () => {
    state.current = {
      distance: 0,
      player: { x: 100, y: 0, w: PLAYER_SIZE, h: PLAYER_SIZE, vy: 0, isGrounded: false },
      platforms: [],
      obstacles: [],
      stageIndex: 0,
      nextSpawnX: 0
    };
    
    // Initial Spawn
    spawnSegment(0);
    spawnSegment(BLOCK_WIDTH);
    spawnSegment(BLOCK_WIDTH * 2);
    spawnSegment(BLOCK_WIDTH * 3);
    
    setScore(0);
    setFeedbackStatus(null);
    setFeedbackText("");
    setAiResponse("");
    setPhase(GamePhase.PLAYING);
  };

  const jump = () => {
    if (state.current.player.isGrounded) {
      state.current.player.vy = -JUMP_FORCE;
      state.current.player.isGrounded = false;
    }
  };

  // Input Listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        if (phase === GamePhase.PLAYING) jump();
        if (phase === GamePhase.START || phase === GamePhase.GAME_OVER) resetGame();
      }
    };
    const handleTouch = () => {
       if (phase === GamePhase.PLAYING) jump();
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('touchstart', handleTouch);
    return () => {
        window.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('touchstart', handleTouch);
    }
  }, [phase]);

  // Main Loop
  const update = useCallback(() => {
    if (phase !== GamePhase.PLAYING) return;

    const s = state.current;
    
    // 1. Player Physics
    s.player.vy += GRAVITY;
    s.player.y += s.player.vy;
    s.distance += GAME_SPEED;

    // 2. Ground Collision
    s.player.isGrounded = false;
    
    // Check if player fell in a hole (Game Over)
    if (s.player.y > CANVAS_HEIGHT + 100) {
      setPhase(GamePhase.GAME_OVER);
      return;
    }

    // Platform collision
    for (const plat of s.platforms) {
      // Horizontal overlap
      if (
        s.player.x + s.player.w > plat.x &&
        s.player.x < plat.x + plat.w &&
        s.player.y + s.player.h >= plat.y &&
        s.player.y + s.player.h <= plat.y + 30 // Top tolerance
      ) {
         if (s.player.vy >= 0) { // Only land if falling
             s.player.y = plat.y - s.player.h;
             s.player.vy = 0;
             s.player.isGrounded = true;
             
             // Update UI title
             if (currentStageTitle !== plat.stageTitle) {
                 setCurrentStageTitle(plat.stageTitle);
             }
         }
      }
    }

    // 3. Move World (Scroll Left)
    s.platforms.forEach(p => p.x -= GAME_SPEED);
    s.obstacles.forEach(o => o.x -= GAME_SPEED);
    s.nextSpawnX -= GAME_SPEED;

    // 4. Obstacle Collision
    for (const obs of s.obstacles) {
        if (
            s.player.x < obs.x + obs.w &&
            s.player.x + s.player.w > obs.x &&
            s.player.y < obs.y + obs.h &&
            s.player.y + s.player.h > obs.y
        ) {
            setPhase(GamePhase.GAME_OVER);
            return;
        }
    }

    // 5. Spawning & Cleanup
    if (s.nextSpawnX < CANVAS_WIDTH + 100) {
        spawnSegment(s.nextSpawnX);
    }

    // Remove off-screen objects
    if (s.platforms[0] && s.platforms[0].x + s.platforms[0].w < -100) {
        s.platforms.shift();
    }
    if (s.obstacles[0] && s.obstacles[0].x + s.obstacles[0].w < -100) {
        s.obstacles.shift();
    }

    // 6. Check Victory
    // If we are past the last stage and hit the "Finish" block
    const finishPlat = s.platforms.find(p => p.id === 'finish');
    if (finishPlat && s.player.x > finishPlat.x + 100) {
        setPhase(GamePhase.VICTORY);
    }

    setScore(s.distance);
    requestRef.current = requestAnimationFrame(update);
  }, [phase, spawnSegment, currentStageTitle]);

  useEffect(() => {
    if (phase === GamePhase.PLAYING) {
      requestRef.current = requestAnimationFrame(update);
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [phase, update]);

  // --- HANDLERS ---
  const handleFeedbackSubmit = async () => {
      setIsAiLoading(true);
      const response = await submitFlowFeedback(feedbackStatus!, feedbackText);
      setAiResponse(response);
      setIsAiLoading(false);
  };
  
  const handleSkipToFeedback = () => {
      setPhase(GamePhase.VICTORY);
      // Pre-fill feedback if they came from the impossible wall
      setFeedbackStatus('Incorrect');
      setFeedbackText("An RFP at the Closing stage is impossible to overcome.");
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center font-sans overflow-hidden select-none">
      
      {/* HEADER / TITLE */}
      <h1 className="absolute top-8 text-3xl md:text-5xl font-arcade text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-green-400 drop-shadow-md z-10 text-center">
        PIPELINE RUNNER
      </h1>
      
      {/* GAME CONTAINER */}
      <div 
        ref={containerRef}
        className="relative bg-slate-800 border-b-4 border-slate-600 shadow-2xl overflow-hidden"
        style={{ width: '100%', maxWidth: '900px', height: '400px' }}
      >
        {/* Background Grids */}
        <div className="absolute inset-0 opacity-10" 
             style={{ 
                 backgroundImage: 'linear-gradient(#334155 1px, transparent 1px), linear-gradient(90deg, #334155 1px, transparent 1px)',
                 backgroundSize: '40px 40px'
             }} 
        />

        {/* --- GAME ELEMENTS RENDER --- */}

        {/* Platforms */}
        {state.current.platforms.map(p => (
            <div 
                key={p.id}
                className={`absolute bottom-0 border-t-4 border-white/20 flex flex-col justify-center items-center text-center p-2 shadow-lg transition-transform will-change-transform ${p.color}`}
                style={{ 
                    left: p.x, 
                    width: p.w, 
                    height: 100, // Fixed height for ground visual
                    bottom: 0 
                }}
            >
                <div className="font-bold text-white text-base md:text-lg uppercase tracking-wider px-2">{p.stageTitle}</div>
                <div className="text-white/70 text-sm">{p.role}</div>
            </div>
        ))}

        {/* Obstacles */}
        {state.current.obstacles.map(o => (
            <div 
                key={o.id}
                className={`absolute rounded-sm flex items-center justify-center text-white font-bold text-center border-2 border-red-900 shadow-xl z-10 ${o.name === 'RFP' ? 'bg-red-800' : 'bg-red-500'}`}
                style={{ 
                    left: o.x, 
                    bottom: 100, // Ground height
                    width: o.w, 
                    height: o.h 
                }}
            >
                <span className={`leading-none transform -rotate-90 whitespace-nowrap ${o.name === 'RFP' ? 'text-lg text-red-200' : 'text-[10px]'}`}>
                    {o.name}
                </span>
            </div>
        ))}

        {/* Player */}
        <div 
            className="absolute z-20 transition-transform will-change-transform"
            style={{ 
                left: state.current.player.x, 
                top: state.current.player.y,
                width: state.current.player.w, 
                height: state.current.player.h
            }}
        >
            <div className={`w-full h-full bg-yellow-400 rounded-lg shadow-[0_0_15px_rgba(250,204,21,0.6)] border-2 border-white relative ${!state.current.player.isGrounded ? 'rotate-12' : ''}`}>
                 {/* Face */}
                 <div className="absolute top-2 right-2 w-2 h-2 bg-black rounded-full"></div>
                 <div className="absolute top-5 right-2 w-4 h-1 bg-black rounded-full"></div>
            </div>
        </div>

        {/* --- OVERLAYS --- */}
        
        {phase === GamePhase.PLAYING && (
            <Dashboard currentStage={currentStageTitle} score={score} distance={state.current.distance} />
        )}

        {phase === GamePhase.START && (
            <div className="absolute inset-0 bg-slate-900/90 flex flex-col items-center justify-center text-white z-50 p-6 text-center">
                <p className="max-w-md text-slate-300 mb-8 text-lg">
                    Run through the <b>Sales Process</b>.<br/>
                    Jump over the <b>Pains</b>.<br/>
                    Validate the <b>Flow</b>.
                </p>
                <div className="flex gap-2 mb-8 text-sm text-slate-400 font-mono bg-slate-800 p-4 rounded border border-slate-700">
                    <span>SPACE</span> or <span>TAP</span> to Jump
                </div>
                <button 
                    onClick={resetGame}
                    className="group relative px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-arcade rounded shadow-[0_4px_0_rgb(30,58,138)] active:shadow-none active:translate-y-1 transition-all flex items-center gap-3"
                >
                    <Play className="group-hover:scale-110 transition-transform" /> START PIPELINE
                </button>
            </div>
        )}

        {phase === GamePhase.GAME_OVER && (
             <div className="absolute inset-0 bg-red-900/90 flex flex-col items-center justify-center text-white z-50 p-6 text-center">
                <h2 className="text-3xl font-arcade text-white mb-2">DEAL LOST</h2>
                <p className="text-red-200 mb-8">You tripped on a pain point.</p>
                <div className="flex flex-col gap-3 w-full max-w-xs">
                    <button 
                        onClick={resetGame}
                        className="px-8 py-4 bg-white text-red-900 font-bold rounded hover:bg-slate-200 shadow-lg flex items-center justify-center gap-2"
                    >
                        <RotateCcw size={20} /> TRY AGAIN
                    </button>
                    
                    <button 
                        onClick={handleSkipToFeedback}
                        className="px-8 py-3 bg-red-800/50 border border-red-400/30 text-red-100 text-sm font-semibold rounded hover:bg-red-800/80 flex items-center justify-center gap-2"
                    >
                        <AlertTriangle size={16} /> WAIT, THIS IS WRONG!
                    </button>
                </div>
            </div>
        )}

        {phase === GamePhase.VICTORY && (
            <div className="absolute inset-0 bg-slate-900/95 flex flex-col items-center justify-center text-white z-50 p-6 overflow-y-auto">
                {!aiResponse ? (
                    <>
                        <h2 className="text-2xl md:text-3xl font-arcade text-green-400 mb-4">PIPELINE REVIEW</h2>
                        <p className="text-slate-300 mb-6 max-w-lg text-center leading-relaxed">
                            {currentStageTitle === 'Closing' 
                                ? "That RFP wall was impossible, right?" 
                                : "You've navigated the sales process."}
                            <br/>
                            Now, I need your expert opinion.
                        </p>
                        
                        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 w-full max-w-lg mb-6">
                            <h3 className="text-xl font-bold text-white mb-4">Is this the real flow?</h3>
                            
                            {!feedbackStatus ? (
                                <div className="flex gap-4 justify-center">
                                    <button 
                                        onClick={() => { setFeedbackStatus('Correct'); setFeedbackText('It looks accurate.'); }}
                                        className="flex-1 py-3 px-4 bg-green-600/20 border border-green-500 hover:bg-green-600/40 rounded flex flex-col items-center gap-2 transition-colors"
                                    >
                                        <CheckCircle className="text-green-500" />
                                        <span className="font-bold">Yes, looks right</span>
                                    </button>
                                    <button 
                                        onClick={() => setFeedbackStatus('Incorrect')}
                                        className="flex-1 py-3 px-4 bg-red-600/20 border border-red-500 hover:bg-red-600/40 rounded flex flex-col items-center gap-2 transition-colors"
                                    >
                                        <XCircle className="text-red-500" />
                                        <span className="font-bold">No, something's off</span>
                                    </button>
                                </div>
                            ) : (
                                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    {feedbackStatus === 'Incorrect' && (
                                        <div className="mb-4">
                                            <label className="block text-sm text-slate-400 mb-2">What stage or pain point is missing?</label>
                                            <textarea 
                                                className="w-full bg-slate-900 border border-slate-600 rounded p-3 text-white focus:outline-none focus:border-blue-500 text-sm"
                                                rows={3}
                                                placeholder="e.g., We usually have a Proof of Concept stage before Negotiation..."
                                                value={feedbackText}
                                                onChange={(e) => setFeedbackText(e.target.value)}
                                            />
                                        </div>
                                    )}
                                    <button 
                                        onClick={handleFeedbackSubmit}
                                        disabled={isAiLoading}
                                        className="w-full bg-blue-600 hover:bg-blue-500 py-3 rounded font-bold flex items-center justify-center gap-2 disabled:opacity-50"
                                    >
                                        {isAiLoading ? <Loader className="animate-spin" /> : <Send size={18} />}
                                        SUBMIT FEEDBACK
                                    </button>
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    <div className="bg-slate-800 p-8 rounded-xl border-2 border-green-500/50 w-full max-w-lg text-center animate-in zoom-in duration-300">
                         <div className="w-16 h-16 bg-green-900/50 rounded-full flex items-center justify-center mx-auto mb-4 text-green-400">
                             <CheckCircle size={32} />
                         </div>
                         <h3 className="text-xl font-bold text-white mb-4">Thanks for the insight!</h3>
                         <p className="text-slate-300 italic mb-6">"{aiResponse}"</p>
                         <button onClick={resetGame} className="text-sm text-slate-500 hover:text-white underline">Play Again</button>
                    </div>
                )}
            </div>
        )}

      </div>

      <div className="mt-6 text-center text-slate-500 text-sm max-w-lg">
         Validate the process. Identify the gaps.
      </div>

    </div>
  );
};

export default App;
