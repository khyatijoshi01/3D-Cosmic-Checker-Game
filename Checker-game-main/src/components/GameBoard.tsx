import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { Piece } from './Piece';
import { GameState, Position } from '../types';
import iceWallpaper from "../assests/image.png"

interface GameBoardProps {
  gameState: GameState;
  currentPlayer: 'black' | 'white';
  onPieceSelect: (position: Position) => void;
  onMove: (from: Position, to: Position) => void;
  selectedPiece: Position | null;
  validMoves: Position[];
  boardRotation: number;
}

export const GameBoard = ({ 
  gameState, 
  currentPlayer, 
  onPieceSelect,
  onMove,
  selectedPiece,
  validMoves,
  boardRotation
}: GameBoardProps) => {
  const boardRef = useRef<THREE.Group>(null);
  const woodTexture = useTexture('https://images.unsplash.com/photo-1601055283742-8b27e81b5553?auto=format&fit=crop&q=80&w=512');
  woodTexture.wrapS = woodTexture.wrapT = THREE.RepeatWrapping;
  woodTexture.repeat.set(4, 4);

  useFrame((_, delta) => {
    if (boardRef.current) {
      const diff = boardRotation - boardRef.current.rotation.y;
      if (Math.abs(diff) > 0.01) {
        boardRef.current.rotation.y += diff * delta * 5;
      }
    }
  });

  const renderSquare = (x: number, z: number, isBlack: boolean) => {
    const isValidMove = validMoves.some(move => move.x === x && move.z === z);
    
    return (
      <mesh
        key={`${x}-${z}`}
        position={[x - 3.5, 0, z - 3.5]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
        onClick={() => {
          if (isValidMove && selectedPiece) {
            onMove(selectedPiece, { x, z });
          } else if (gameState[x]?.[z]?.color === currentPlayer) {
            onPieceSelect({ x, z });
          }
        }}
      >
        <planeGeometry args={[1, 1]} />
        <meshStandardMaterial 
          color={isValidMove ? '#4ade80' : isBlack ? '#4a5568' : '#e2e8f0'}
          map={woodTexture}
          roughness={0.8}
          metalness={0.2}
        />
      </mesh>
    );
  };

  return (
    <group ref={boardRef} rotation={[0, Math.PI,0]}> {/* Rotates board 180° to face the user */}
      {/* Board base */}
      <mesh position={[0, -0.1, 0]} receiveShadow>
        <boxGeometry args={[9, 0.2, 9]} />
        <meshStandardMaterial 
          map={woodTexture}
          color="#805e3b"
          roughness={0.8}
          metalness={0.2}
        />
      </mesh>

      {/* Board squares */}
      <group position={[0, 0.01, 0]}>
        {Array.from({ length: 8 }, (_, i) =>
          Array.from({ length: 8 }, (_, j) => renderSquare(i, j, (i + j) % 2 === 0))
        )}
      </group>

      {/* Pieces */}
      {Object.entries(gameState).map(([x, row]) =>
        Object.entries(row).map(([z, piece]) => (
          <Piece
            key={`${x}-${z}`}
            position={[Number(x) - 3.5, 0.1, Number(z) - 3.5]}
            color={piece.color}
            isKing={piece.isKing}
            isSelected={selectedPiece?.x === Number(x) && selectedPiece?.z === Number(z)}
          />
        ))
      )}
    </group>
  );
};
