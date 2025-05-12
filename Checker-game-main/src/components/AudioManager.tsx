import { useEffect, useRef } from 'react';
import { Howl } from 'howler';

interface AudioManagerProps {
  muted: boolean;
}

export const AudioManager = ({ muted }: AudioManagerProps) => {
  const sounds = useRef<{
    move: Howl;
    capture: Howl;
    crown: Howl;
    bgm: Howl;
  }>();

  useEffect(() => {
    sounds.current = {
      move: new Howl({
        src: ['https://assets.mixkit.co/sfx/preview/mixkit-quick-jump-arcade-game-239.mp3'],
        volume: 0.5
      }),
      capture: new Howl({
        src: ['https://assets.mixkit.co/sfx/preview/mixkit-arcade-game-jump-coin-216.mp3'],
        volume: 0.5
      }),
      crown: new Howl({
        src: ['https://assets.mixkit.co/sfx/preview/mixkit-achievement-bell-600.mp3'],
        volume: 0.5
      }),
      bgm: new Howl({
        src: ['https://assets.mixkit.co/sfx/preview/mixkit-game-level-music-689.mp3'],
        volume: 0.3,
        loop: true
      })
    };

    if (!muted) {
      sounds.current.bgm.play();
    }

    return () => {
      Object.values(sounds.current!).forEach(sound => sound.unload());
    };
  }, []);

  useEffect(() => {
    if (!sounds.current) return;

    Object.values(sounds.current).forEach(sound => {
      sound.mute(muted);
    });
  }, [muted]);

  return null;
};