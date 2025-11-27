
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GamePhase, Player, Platform, Obstacle, Decoration } from './types';
import { SALES_FLOW, GAME_SPEED, JUMP_FORCE, GRAVITY, BLOCK_WIDTH } from './constants';
import Dashboard from './components/Dashboard';
import { Play, RotateCcw, Share2 } from 'lucide-react';

const CANVAS_HEIGHT = 400;
const CANVAS_WIDTH = 800; // Conceptual width for spawning logic
const PLAYER_SIZE = 40;
const GROUND_Y = 300;

// Dynamic player X position helper
const getPlayerStartX = () => {
    if (typeof window === 'undefined') return 300;
    // On mobile (<768px), move player left to give more reaction time
    return window.innerWidth < 768 ? 60 : 300;
};

const App: React.FC = () => {
  // --- STATE ---
  const [phase, setPhase] = useState<GamePhase>(GamePhase.START);
  const [currentStageTitle, setCurrentStageTitle] = useState("Start");
  const [score, setScore] = useState(0);

  // --- REFS (Mutable Game State) ---
  const requestRef = useRef<number>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const state = useRef({
    distance: 0,
    player: { x: getPlayerStartX(), y: GROUND_Y - PLAYER_SIZE, w: PLAYER_SIZE, h: PLAYER_SIZE, vy: 0, isGrounded: true } as Player,
    platforms: [] as Platform[],
    obstacles: [] as Obstacle[],
    decorations: [] as Decoration[],
    stageIndex: 0,
    nextSpawnX: 0
  });

  // Handle Resize for Responsive Player Start Position
  useEffect(() => {
    const handleResize = () => {
        if (phase === GamePhase.START) {
            state.current.player.x = getPlayerStartX();
        }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [phase]);

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
        stageTitle: 'QUOTA CRUSHED',
        color: 'bg-green-500'
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
      color: stage.color
    };
    state.current.platforms.push(platform);

    // Spawn obstacle
    // Determine Dimensions based on levels
    // Level 0 dimensions = 50px (Creates a 50x50 Square for 0,0)
    // Level 1 Height = 80px (Reduced by 30% from 110px)
    // Level 1 Width = 110px (Reduced by 30% from 150px)
    
    let obsHeight = stage.hLevel === 1 ? 80 : 50;
    let obsWidth = stage.wLevel === 1 ? 110 : 50;

    // Specific tweak for (1,1) difficulty (RFP) to make it slightly more achievable (10% smaller)
    if (stage.hLevel === 1 && stage.wLevel === 1) {
        obsHeight = obsHeight * 0.9;
        obsWidth = obsWidth * 0.9;
    }

    // Center the obstacle on the block
    const obsX = startX + (BLOCK_WIDTH / 2) - (obsWidth / 2);
    const obsY = GROUND_Y - obsHeight;

    state.current.obstacles.push({
      id: `obs-${state.current.stageIndex}`,
      x: obsX,
      y: obsY,
      w: obsWidth,
      h: obsHeight,
      hLevel: stage.hLevel,
      wLevel: stage.wLevel,
      stageTitle: stage.title
    });

    // --- DECORATION / TEXT SPAWNING ---
    // Helper to add text decoration
    const addText = (text: string) => {
       // Position: At the END of the current block.
       // This places it visually in the "gap" between the current obstacle and the next one.
       const textX = startX + BLOCK_WIDTH; 
       
       // Fixed height in the air (approx 150px above ground)
       // This ensures it doesn't overlap titles or standard obstacles
       const textY = GROUND_Y - 150; 
       
       state.current.decorations.push({
         id: `text-${state.current.stageIndex}`,
         x: textX,
         y: textY,
         text: text,
         type: 'sign',
         opacity: 0, // Start invisible
         scale: 0.5  // Start small
       });
    };

    // New Signs Logic
    if (stage.title === 'Ghosted') {
       addText("Seen");
    }

    if (stage.title === 'Send Me Info') {
       addText("I do not really care");
    }

    if (stage.title === 'Missing Feature') {
       addText("If you only had integration with X");
    }

    if (stage.title === 'I’ll Think About It') {
       addText("Sure, I will call you");
    }

    if (stage.title === 'Legal Limbo') {
       addText("Sorry, your proposal came too late");
    }

    if (stage.title === 'Champion Left') {
       addText("Oh, Sarah does not work here anymore");
    }

    state.current.nextSpawnX = startX + BLOCK_WIDTH; 
    state.current.stageIndex++;
  }, []);

  const resetGame = () => {
    const startX = getPlayerStartX();
    
    state.current = {
      distance: 0,
      player: { x: startX, y: 0, w: PLAYER_SIZE, h: PLAYER_SIZE, vy: 0, isGrounded: false },
      platforms: [],
      obstacles: [],
      decorations: [],
      stageIndex: 0,
      nextSpawnX: 0
    };
    
    // Initial Spawn with Safe Zone
    // 800px safe zone
    const safeZoneWidth = 800;
    
    state.current.platforms.push({
      id: 'warmup-zone',
      x: 0,
      y: GROUND_Y,
      w: safeZoneWidth,
      h: 100,
      stageTitle: 'GET READY',
      color: 'bg-slate-700'
    });
    
    state.current.nextSpawnX = safeZoneWidth;

    spawnSegment(state.current.nextSpawnX);
    spawnSegment(state.current.nextSpawnX);
    spawnSegment(state.current.nextSpawnX);
    
    setScore(0);
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
    const handleTouch = (e: TouchEvent) => {
        // Prevent default only inside the game area usually, but here strict prevention helps 
        // We use touch-action: none on container instead of preventDefault everywhere
       if (phase === GamePhase.PLAYING) jump();
    };

    window.addEventListener('keydown', handleKeyDown);
    // Note: We use React's onTouchStart on the container for better scoping, but global listener acts as backup
    
    return () => {
        window.removeEventListener('keydown', handleKeyDown);
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
    
    s.decorations.forEach(d => {
        d.x -= GAME_SPEED;
        
        // --- ANIMATION LOGIC ---
        // Player is at x=300 (or 60 on mobile).
        // Text appears when it approaches the player.
        // Fade in when x < 500. Fade out when x < playerX - 100.
        
        if (d.x < 500 && d.x > s.player.x - 100) {
            // Smooth Pop-in
            d.opacity = Math.min(d.opacity + 0.1, 1);
            d.scale = Math.min(d.scale + 0.05, 1.0); 
        } 
        else if (d.x <= s.player.x - 100) {
            // Fade out as it leaves
            d.opacity = Math.max(d.opacity - 0.1, 0);
        }
    });
    
    s.nextSpawnX -= GAME_SPEED;

    // 4. Obstacle Collision
    for (const obs of s.obstacles) {
        if (
            s.player.x < obs.x + obs.w &&
            s.player.x + s.player.w > obs.x &&
            s.player.y < obs.y + obs.h &&
            s.player.y + s.player.h > obs.y
        ) {
            setCurrentStageTitle(obs.stageTitle);
            setPhase(GamePhase.GAME_OVER);
            return;
        }
    }

    // 5. Spawning & Cleanup
    // Logic uses CANVAS_WIDTH constant (800) to act as a look-ahead buffer. 
    // This works fine for mobile as it ensures obstacles exist before they enter screen.
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
    if (s.decorations[0] && s.decorations[0].x < -400) {
        s.decorations.shift();
    }

    // 6. Check Victory
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
  
  const handleLinkedInShare = async (e: React.MouseEvent) => {
      e.stopPropagation();
      // Open LinkedIn directly
      const url = `https://www.linkedin.com/feed/update/urn:li:activity:7377707785616183296/`;
      window.open(url, '_blank');
  };

  const handleContainerTouch = () => {
      if (phase === GamePhase.PLAYING) jump();
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center font-sans overflow-hidden select-none">
      
      {/* HEADER / TITLE */}
      <div className="absolute top-4 md:top-8 w-full flex flex-col items-center z-10 pointer-events-none">
        <h1 className="text-2xl md:text-5xl font-arcade text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-green-400 drop-shadow-md text-center px-4">
            PIPELINE RUNNER
        </h1>
      </div>
      
      {/* GAME CONTAINER */}
      <div 
        ref={containerRef}
        onTouchStart={handleContainerTouch}
        className="relative bg-slate-800 border-b-4 border-slate-600 shadow-2xl overflow-hidden cursor-pointer"
        style={{ 
            width: '100%', 
            maxWidth: '900px', 
            height: 'min(400px, 100dvh)', // Responsive height for landscape mobile
            touchAction: 'none' // IMPORTANT: Prevents scrolling on mobile while playing
        }}
      >
        {/* Background Grids */}
        <div className="absolute inset-0 opacity-10" 
             style={{ 
                 backgroundImage: 'linear-gradient(#334155 1px, transparent 1px), linear-gradient(90deg, #334155 1px, transparent 1px)',
                 backgroundSize: '40px 40px'
             }} 
        />

        {/* --- GAME ELEMENTS RENDER --- */}

        {/* Decorations (Text only) */}
        {state.current.decorations.map(d => (
            <div
                key={d.id}
                className="absolute z-0 pointer-events-none"
                style={{
                    left: d.x,
                    top: d.y,
                    width: '300px', // Constrain width
                    opacity: d.opacity,
                    transform: `translateX(-50%) scale(${d.scale})`, // Centered on x
                    transition: 'transform 0.1s linear, opacity 0.1s linear',
                    textAlign: 'center'
                }}
            >
                <div 
                    className="text-lg md:text-2xl text-white tracking-wide leading-tight uppercase font-black"
                    style={{ 
                        fontFamily: 'Inter, sans-serif',
                        textShadow: '2px 2px 0px #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000',
                    }}
                >
                    {d.text}
                </div>
            </div>
        ))}

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
                <div className="font-bold text-white text-xs md:text-xl uppercase tracking-wider px-3 py-1 bg-black/25 rounded-full backdrop-blur-[2px] shadow-sm">
                    {p.stageTitle}
                </div>
            </div>
        ))}

        {/* Obstacles */}
        {state.current.obstacles.map(o => {
            // Determine styling based on dimensions (level) to give visual cues
            const isTall = o.hLevel === 1;
            const isWide = o.wLevel === 1;
            
            // Base color
            let bgClass = 'bg-red-500';
            if (isTall && isWide) bgClass = 'bg-red-800'; // RFP / Very Hard
            else if (isTall) bgClass = 'bg-red-600'; // Tall
            else if (isWide) bgClass = 'bg-orange-600'; // Wide
            
            return (
                <div 
                    key={o.id}
                    className={`absolute rounded-sm border-2 border-red-900 shadow-xl z-10 ${bgClass}`}
                    style={{ 
                        left: o.x, 
                        bottom: 100, // Ground height
                        width: o.w, 
                        height: o.h 
                    }}
                >
                    {/* Visual pattern for walls */}
                    <div className="w-full h-full opacity-20" 
                         style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, #000 10px, #000 20px)' }} 
                    />
                    
                    {/* Obstacle Name (Floating above) */}
                    <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 whitespace-nowrap text-xs md:text-xl font-bold text-white bg-red-950/80 px-3 py-1.5 rounded-md backdrop-blur-sm border border-red-800/50 shadow-sm z-20">
                        {o.stageTitle}
                    </div>
                </div>
            );
        })}

        {/* Player (Sales Hero with Briefcase) */}
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
                 {/* Briefcase Emoji */}
                 <div className="absolute top-5 -left-3 text-xl md:text-2xl filter drop-shadow-sm transform -rotate-12">💼</div>
            </div>
        </div>

        {/* --- OVERLAYS --- */}
        
        {phase === GamePhase.PLAYING && (
            <Dashboard currentStage={currentStageTitle} score={score} distance={state.current.distance} />
        )}

        {phase === GamePhase.START && (
            <div className="absolute inset-0 bg-slate-900/90 flex flex-col items-center justify-center text-white z-50 p-6 text-center">
                <p className="max-w-md text-slate-300 mb-8 text-sm md:text-lg">
                    Run through the <b>Sales Process</b>.<br/>
                    Jump over the <b>Obstacles</b>.<br/>
                    Validate the <b>Flow</b>.
                </p>
                <div className="flex gap-2 mb-8 text-xs md:text-sm text-slate-400 font-mono bg-slate-800 p-4 rounded border border-slate-700">
                    <span>SPACE</span> or <span>TAP SCREEN</span> to Jump
                </div>
                <button 
                    onClick={(e) => { e.stopPropagation(); resetGame(); }}
                    className="group relative px-6 py-3 md:px-8 md:py-4 bg-blue-600 hover:bg-blue-500 text-white font-arcade rounded shadow-[0_4px_0_rgb(30,58,138)] active:shadow-none active:translate-y-1 transition-all flex items-center gap-3 text-sm md:text-base"
                >
                    <Play className="group-hover:scale-110 transition-transform" /> START PIPELINE
                </button>
            </div>
        )}

        {phase === GamePhase.GAME_OVER && (
             <div className="absolute inset-0 bg-red-900/90 flex flex-col items-center justify-center text-white z-50 p-6 text-center">
                <h2 className="text-2xl md:text-3xl font-arcade text-white mb-2">DEAL LOST</h2>
                <p className="text-red-200 mb-6 md:mb-8 text-base md:text-xl font-bold uppercase tracking-wide">
                    {currentStageTitle.includes('RFP') ? "RFP... The ultimate blocker." : currentStageTitle}
                </p>
                <div className="flex flex-col gap-3 w-full max-w-xs">
                    <button 
                        onClick={(e) => { e.stopPropagation(); resetGame(); }}
                        className="px-6 py-3 md:px-8 md:py-4 bg-white text-red-900 font-bold rounded hover:bg-slate-200 shadow-lg flex items-center justify-center gap-2 text-sm md:text-base"
                    >
                        <RotateCcw size={20} /> TRY AGAIN
                    </button>
                    
                    <p className="text-red-200 text-xs md:text-sm font-semibold text-center mt-2">
                        Share if those struggles look real
                    </p>
                    
                    <button 
                        onClick={handleLinkedInShare}
                        className="px-6 py-3 bg-[#0077b5] hover:bg-[#004182] border border-blue-400/30 text-white text-xs md:text-sm font-bold rounded shadow-lg flex items-center justify-center gap-2 transition-colors uppercase"
                    >
                        <Share2 size={16} /> 
                        Join the discussion on LinkedIn
                    </button>
                </div>
            </div>
        )}

        {phase === GamePhase.VICTORY && (
            <div className="absolute inset-0 bg-slate-900/95 flex flex-col items-center justify-center text-white z-50 p-4 md:p-6 overflow-y-auto">
                <h2 className="text-xl md:text-3xl font-arcade text-green-400 mb-4 mt-8 md:mt-0">PIPELINE REVIEW</h2>
                <p className="text-slate-300 mb-6 max-w-lg text-center leading-relaxed text-sm md:text-base">
                    {currentStageTitle.includes('RFP') 
                        ? "That RFP wall was impossible, right?" 
                        : "You've navigated the sales process."}
                    <br/>
                    Now, I need your expert opinion.
                </p>
                
                <div className="bg-slate-800 p-4 md:p-6 rounded-xl border border-slate-700 w-full max-w-lg mb-6 shadow-xl">
                    <h3 className="text-lg md:text-xl font-bold text-white mb-4">Share if those struggles look real</h3>
                    
                    <button 
                        onClick={handleLinkedInShare}
                        className="w-full mb-2 px-4 py-3 bg-[#0077b5] hover:bg-[#004182] border border-blue-400/30 text-white font-bold rounded shadow-lg flex items-center justify-center gap-2 transition-colors uppercase text-sm md:text-base"
                    >
                        <Share2 size={20} /> 
                        Join the discussion on LinkedIn
                    </button>
                </div>
                
                <button onClick={resetGame} className="text-sm text-slate-500 hover:text-white underline mt-4">Play Again</button>
            </div>
        )}

      </div>

      <div className="mt-4 md:mt-6 text-center text-slate-500 text-xs md:text-sm max-w-lg px-6">
         Jump over the objections. Survive the Pipeline.
      </div>

    </div>
  );
};

export default App;
