import { useState, useCallback, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { Volume2, VolumeX, RotateCcw, Crown } from 'lucide-react';
import { GameBoard } from './components/GameBoard';
import { Stars } from './components/Stars';
import { AudioManager } from './components/AudioManager';
import { GameState, Position } from './types';

const initialGameState: GameState = {
  0: { 1: { color: 'black', isKing: false }, 3: { color: 'black', isKing: false }, 5: { color: 'black', isKing: false }, 7: { color: 'black', isKing: false } },
  1: { 0: { color: 'black', isKing: false }, 2: { color: 'black', isKing: false }, 4: { color: 'black', isKing: false }, 6: { color: 'black', isKing: false } },
  2: { 1: { color: 'black', isKing: false }, 3: { color: 'black', isKing: false }, 5: { color: 'black', isKing: false }, 7: { color: 'black', isKing: false } },
  5: { 0: { color: 'white', isKing: false }, 2: { color: 'white', isKing: false }, 4: { color: 'white', isKing: false }, 6: { color: 'white', isKing: false } },
  6: { 1: { color: 'white', isKing: false }, 3: { color: 'white', isKing: false }, 5: { color: 'white', isKing: false }, 7: { color: 'white', isKing: false } },
  7: { 0: { color: 'white', isKing: false }, 2: { color: 'white', isKing: false }, 4: { color: 'white', isKing: false }, 6: { color: 'white', isKing: false } },
};

function App() {
  const [gameState, setGameState] = useState<GameState>(initialGameState);
  const [currentPlayer, setCurrentPlayer] = useState<'black' | 'white'>('black');
  const [selectedPiece, setSelectedPiece] = useState<Position | null>(null);
  const [muted, setMuted] = useState(false);
  const [boardRotation, setBoardRotation] = useState(0);
  const [pieceCount, setPieceCount] = useState({ black: 12, white: 12 });
  const [kings, setKings] = useState({ black: 0, white: 0 });

  useEffect(() => {
    let black = 0;
    let white = 0;
    let blackKings = 0;
    let whiteKings = 0;

    Object.values(gameState).forEach(row => {
      Object.values(row).forEach(piece => {
        if (piece.color === 'black') {
          black++;
          if (piece.isKing) blackKings++;
        } else if (piece.color === 'white') {
          white++;
          if (piece.isKing) whiteKings++;
        }
      });
    });
    
    setPieceCount({ black, white });
    setKings({ black: blackKings, white: whiteKings });
  }, [gameState]);

  const getValidMoves = useCallback((position: Position): Position[] => {
    const piece = gameState[position.x]?.[position.z];
    if (!piece || piece.color !== currentPlayer) return [];

    const moves: Position[] = [];
    const directions = piece.isKing ? [-1, 1] : piece.color === 'black' ? [1] : [-1];

    directions.forEach(dx => {
      [-1, 1].forEach(dz => {
        const newX = position.x + dx;
        const newZ = position.z + dz;

        if (newX >= 0 && newX < 8 && newZ >= 0 && newZ < 8) {
          if (!gameState[newX]?.[newZ]) {
            moves.push({ x: newX, z: newZ });
          } else {
            const jumpX = newX + dx;
            const jumpZ = newZ + dz;
            if (
              jumpX >= 0 && jumpX < 8 && jumpZ >= 0 && jumpZ < 8 &&
              gameState[newX][newZ].color !== piece.color &&
              !gameState[jumpX]?.[jumpZ]
            ) {
              moves.push({ x: jumpX, z: jumpZ });
            }
          }
        }
      });
    });

    return moves;
  }, [gameState, currentPlayer]);

  const handleMove = useCallback((from: Position, to: Position) => {
    const piece = gameState[from.x][from.z];
    const newGameState = { ...gameState };
    
    // Remove the piece from its current position
    delete newGameState[from.x][from.z];
    if (Object.keys(newGameState[from.x]).length === 0) {
      delete newGameState[from.x];
    }

    // Add the piece to its new position
    if (!newGameState[to.x]) newGameState[to.x] = {};
    newGameState[to.x][to.z] = {
      ...piece,
      isKing: piece.isKing || (piece.color === 'black' ? to.x === 7 : to.x === 0)
    };

    // Handle captures
    const dx = to.x - from.x;
    const dz = to.z - from.z;
    if (Math.abs(dx) === 2) {
      const capturedX = from.x + dx / 2;
      const capturedZ = from.z + dz / 2;
      delete newGameState[capturedX][capturedZ];
      if (Object.keys(newGameState[capturedX]).length === 0) {
        delete newGameState[capturedX];
      }
    }

    setGameState(newGameState);
    setCurrentPlayer(current => current === 'black' ? 'white' : 'black');
    setBoardRotation(current => current + Math.PI);
    setSelectedPiece(null);
  }, [gameState]);

  const handlePieceSelect = (position: Position) => {
    const piece = gameState[position.x]?.[position.z];
    if (piece?.color === currentPlayer) {
      setSelectedPiece(position);
    }
  };

  const resetGame = () => {
    setGameState(initialGameState);
    setCurrentPlayer('black');
    setBoardRotation(0);
    setSelectedPiece(null);
  };

  return (
    <div className="game-container">
      <Stars />
      <AudioManager muted={muted} />
      
      <Canvas shadows>
        <PerspectiveCamera
          makeDefault
          position={[0, 15, 0]}
          rotation={[-Math.PI / 2 + Math.PI / 6, 0, 0]}
          fov={45}
        />
        <OrbitControls
          enablePan={false}
          minPolarAngle={Math.PI / 4}
          maxPolarAngle={Math.PI / 2.5}
          minDistance={10}
          maxDistance={20}
        />
        
        <ambientLight intensity={0.5} />
        <directionalLight
          position={[5, 5, 5]}
          castShadow
          intensity={1}
          shadow-mapSize={[2048, 2048]}
        />
        <directionalLight
          position={[-5, 5, -5]}
          intensity={0.5}
        />

        <GameBoard
          gameState={gameState}
          currentPlayer={currentPlayer}
          onPieceSelect={handlePieceSelect}
          onMove={handleMove}
          selectedPiece={selectedPiece}
          validMoves={selectedPiece ? getValidMoves(selectedPiece) : []}
          boardRotation={boardRotation}
        />
      </Canvas>

      <div className="ui-overlay">
        <div className="absolute top-4 right-4 flex gap-4">
          <button
            onClick={() => setMuted(!muted)}
            className="p-3 rounded-full bg-white/10 hover:bg-white/20 transition-all"
            title={muted ? "Unmute" : "Mute"}
          >
            {muted ? <VolumeX className="w-6 h-6 text-white" /> : <Volume2 className="w-6 h-6 text-white" />}
          </button>
          <button
            onClick={resetGame}
            className="p-3 rounded-full bg-white/10 hover:bg-white/20 transition-all"
            title="Reset Game"
          >
            <RotateCcw className="w-6 h-6 text-white" />
          </button>
        </div>

        <div className="absolute top-4 left-4">
          <div className="game-status">
            <h2 className="text-3xl font-bold mb-6">Cosmic Checkers</h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-3">Current Turn</h3>
                <div className="flex items-center gap-3 piece-counter">
                  <div className={`w-5 h-5 rounded-full ${currentPlayer === 'black' ? 'bg-black' : 'bg-white'} shadow-lg`} />
                  <span className="capitalize text-lg">{currentPlayer}'s turn</span>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-3">Game Stats</h3>
                <div className="grid gap-4">
                  <div className="piece-counter">
                    <div className="w-4 h-4 rounded-full bg-black shadow-lg" />
                    <span>Black: {pieceCount.black}</span>
                    {kings.black > 0 && (
                      <div className="flex items-center gap-1 ml-2">
                        <Crown className="w-4 h-4 text-yellow-400" />
                        <span className="text-yellow-400">{kings.black}</span>
                      </div>
                    )}
                  </div>
                  <div className="piece-counter">
                    <div className="w-4 h-4 rounded-full bg-white shadow-lg" />
                    <span>White: {pieceCount.white}</span>
                    {kings.white > 0 && (
                      <div className="flex items-center gap-1 ml-2">
                        <Crown className="w-4 h-4 text-yellow-400" />
                        <span className="text-yellow-400">{kings.white}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
