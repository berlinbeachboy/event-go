import { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipForward, SkipBack, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PLAYLIST } from '@/config/playlist';

export const MusicPlayer = () => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [currentTrack, setCurrentTrack] = useState(0);
    const [volume] = useState(0.5);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [isInitialized, setIsInitialized] = useState(false);

    // Initialize audio on component mount
    useEffect(() => {
        audioRef.current = new Audio(PLAYLIST[currentTrack].url);
        audioRef.current.volume = volume;

        // const attemptAutoplay = async () => {
        //     try {
        //         if (audioRef.current) {
        //             await audioRef.current.play();
        //             setIsPlaying(true);
        //             setIsInitialized(true);
        //         }
        //     } catch {
        //         console.log('Autoplay failed - waiting for user interaction');
        //         setIsInitialized(true);
        //     }
        // };
        setIsInitialized(true);
        // attemptAutoplay();

        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
        };
    }, [currentTrack, volume]);

    useEffect(() => {
        if (!audioRef.current || !isInitialized) return;

        audioRef.current.src = PLAYLIST[currentTrack].url;
        audioRef.current.volume = volume;

        if (isPlaying) {
            audioRef.current.play().catch(error => {
                console.log('Playback failed:', error);
            });
        }
    }, [currentTrack, isInitialized, isPlaying, volume]);

    const togglePlay = async () => {
        if (!audioRef.current) return;

        try {
            if (isPlaying) {
                audioRef.current.pause();
            } else {
                await audioRef.current.play();
            }
            setIsPlaying(!isPlaying);
        } catch (error) {
            console.log('Playback failed:', error);
        }
    };

    const toggleMute = () => {
        if (!audioRef.current) return;

        if (isMuted) {
            audioRef.current.volume = volume;
        } else {
            audioRef.current.volume = 0;
        }
        setIsMuted(!isMuted);
    };

    const nextTrack = () => {
        if (!audioRef.current) return;
        audioRef.current.pause();
        const nextIndex = (currentTrack + 1) % PLAYLIST.length;
        setCurrentTrack(nextIndex);
    };

    const previousTrack = () => {
        if (!audioRef.current) return;
        audioRef.current.pause();
        const prevIndex = currentTrack === 0 ? PLAYLIST.length - 1 : currentTrack - 1;
        setCurrentTrack(prevIndex);
    };

    useEffect(() => {
        if (!audioRef.current) return;

        const handleTrackEnd = () => {
            nextTrack();
        };

        audioRef.current.addEventListener('ended', handleTrackEnd);

        return () => {
            if (audioRef.current) {
                audioRef.current.removeEventListener('ended', handleTrackEnd);
            }
        };
    });

    return (
        <div className="fixed left-1/2 -translate-x-1/2 bottom-4 z-50">
            <div className="max-w-md mx-auto px-2">
                <div className="flex items-center border-solid border-2 border-black gap-2 bg-custom-aquamarine backdrop-blur-sm rounded-full px-3 shadow-lg">
                    {/* Controls */}
                    <div className="flex items-center gap-1">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={previousTrack}
                        >
                            <SkipBack className="h-3 w-3" />
                        </Button>

                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={togglePlay}
                        >
                            {isPlaying ? (
                                <Pause className="h-3 w-3" />
                            ) : (
                                <Play className="h-3 w-3" />
                            )}
                        </Button>

                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={nextTrack}
                        >
                            <SkipForward className="h-3 w-3" />
                        </Button>
                    </div>

                    {/* Visualizer */}
                    <div className="flex gap-0.5 mx-2">
                        {[...Array(3)].map((_, i) => (
                            <div
                                key={i}
                                className={`w-0.5 bg-black rounded-full ${
                                    isPlaying && !isMuted ? 'animate-music-bounce' : 'h-2'
                                }`}
                                style={{
                                    animationDelay: `${i * 0.2}s`,
                                    height: isPlaying && !isMuted ? '10px' : '6px',
                                }}
                            />
                        ))}
                    </div>

                    {/* Volume */}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="relative group h-8 w-8"
                        onClick={toggleMute}
                    >
                        {isMuted ? (
                            <VolumeX className="h-3 w-3" />
                        ) : (
                            <Volume2 className="h-3 w-3" />
                        )}
                    </Button>

                    {/* Track Info - Hidden on small screens */}
                    <div className="hidden sm:block ml-1 truncate max-w-[150px]">
                        <p className="text-xs font-medium truncate">
                            {PLAYLIST[currentTrack].title}
                        </p>
                        <p className="text-xs opacity-75 truncate">
                            {PLAYLIST[currentTrack].artist}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};