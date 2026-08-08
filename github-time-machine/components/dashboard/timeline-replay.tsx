"use client";
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { GitHubCommit } from '@/lib/github/types';
import { Play, Pause, SkipBack, SkipForward, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TimelineReplayProps {
  commits: GitHubCommit[];
}

export function TimelineReplay({ commits }: TimelineReplayProps) {
  const sortedCommits = useMemo(() => {
    return [...commits].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [commits]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState<1 | 2 | 5>(1);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const currentCommit = sortedCommits[currentIndex];
  const progress = sortedCommits.length > 1 ? (currentIndex / (sortedCommits.length - 1)) * 100 : 0;
  
  const startYear = sortedCommits.length > 0 ? new Date(sortedCommits[0].date).getFullYear() : '';
  const endYear = sortedCommits.length > 0 ? new Date(sortedCommits[sortedCommits.length - 1].date).getFullYear() : '';
  const currentYear = currentCommit ? new Date(currentCommit.date).getFullYear() : '';

  useEffect(() => {
    if (isPlaying && currentIndex < sortedCommits.length - 1) {
      const delay = speed === 1 ? 1500 : speed === 2 ? 750 : 300;
      timerRef.current = setTimeout(() => {
        setCurrentIndex(prev => prev + 1);
      }, delay);
    } else if (isPlaying && currentIndex >= sortedCommits.length - 1) {
      setIsPlaying(false);
    }
    
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isPlaying, currentIndex, speed, sortedCommits.length]);

  const togglePlay = () => setIsPlaying(!isPlaying);
  
  const reset = () => {
    setIsPlaying(false);
    setCurrentIndex(0);
  };
  
  const stepBack = () => {
    setIsPlaying(false);
    setCurrentIndex(prev => Math.max(0, prev - 1));
  };
  
  const stepForward = () => {
    setIsPlaying(false);
    setCurrentIndex(prev => Math.min(sortedCommits.length - 1, prev + 1));
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsPlaying(false);
    setCurrentIndex(Number(e.target.value));
  };

  if (sortedCommits.length === 0) {
    return <div className="text-center p-8 text-muted">No commits available for replay.</div>;
  }

  return (
    <div className="bg-ink-surface border border-ink-border rounded-2xl p-6 md:p-8 flex flex-col items-center w-full max-w-4xl mx-auto space-y-8 shadow-sm">
      <div className="w-full flex justify-between items-center mb-2">
        <h2 className="font-display text-2xl text-ivory">Journey Through Time</h2>
        <div className="bg-ink-soft px-4 py-1.5 rounded-full border border-ink-border">
          <span className="font-mono text-brass font-medium">{currentYear}</span>
        </div>
      </div>

      <div className="w-full bg-ink border border-ink-border rounded-xl p-6 min-h-[160px] flex flex-col justify-center relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-full h-1 bg-ink-border">
          <div className="h-full bg-brass transition-all duration-300 ease-out" style={{ width: `${progress}%` }}></div>
        </div>
        
        <div className="space-y-4 relative z-10">
          <div className="flex items-center gap-3">
            <span className="bg-commit-100/10 text-commit-300 border border-commit-300/20 px-2.5 py-1 rounded-md text-xs font-semibold tracking-wide uppercase">
              {currentCommit.repoName}
            </span>
            <span className="font-mono text-xs text-muted">
              {currentCommit.sha.slice(0, 7)}
            </span>
          </div>
          
          <p className="font-display text-xl md:text-2xl text-ivory leading-snug">
            {currentCommit.message}
          </p>
          
          <div className="flex items-center gap-4 text-xs text-muted pt-2 border-t border-ink-border/50">
            <span>{new Date(currentCommit.date).toLocaleDateString(undefined, { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</span>
            <span>By {currentCommit.authorName}</span>
          </div>
        </div>
      </div>

      <div className="w-full space-y-6">
        <div className="relative pt-1">
          <input
            type="range"
            min={0}
            max={sortedCommits.length - 1}
            value={currentIndex}
            onChange={handleSliderChange}
            className="w-full h-2 bg-ink-soft rounded-lg appearance-none cursor-pointer accent-brass focus:outline-none focus:ring-2 focus:ring-brass/30"
          />
          <div className="flex justify-between text-xs text-muted mt-2 font-mono">
            <span>{startYear}</span>
            <span>{Math.round(progress)}% complete</span>
            <span>{endYear}</span>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-6 w-full">
          <div className="flex bg-ink-soft rounded-lg border border-ink-border p-1">
            <button onClick={() => setSpeed(1)} className={`px-3 py-1 text-xs rounded-md transition-colors ${speed === 1 ? 'bg-ink text-ivory shadow-sm' : 'text-muted hover:text-ivory'}`}>1x</button>
            <button onClick={() => setSpeed(2)} className={`px-3 py-1 text-xs rounded-md transition-colors ${speed === 2 ? 'bg-ink text-ivory shadow-sm' : 'text-muted hover:text-ivory'}`}>2x</button>
            <button onClick={() => setSpeed(5)} className={`px-3 py-1 text-xs rounded-md transition-colors ${speed === 5 ? 'bg-ink text-ivory shadow-sm' : 'text-muted hover:text-ivory'}`}>5x</button>
          </div>

          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={reset} disabled={currentIndex === 0} className="text-muted hover:text-ivory">
              <RotateCcw className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={stepBack} disabled={currentIndex === 0}>
              <SkipBack className="w-4 h-4" />
            </Button>
            <Button 
              variant="default" 
              size="lg" 
              className="bg-brass text-ink hover:bg-brass-light rounded-full w-12 h-12 p-0 flex items-center justify-center shadow-md shadow-brass/20"
              onClick={togglePlay}
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-1" />}
            </Button>
            <Button variant="outline" size="sm" onClick={stepForward} disabled={currentIndex === sortedCommits.length - 1}>
              <SkipForward className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="w-[120px] text-right text-sm text-muted font-mono hidden md:block">
            {currentIndex + 1} / {sortedCommits.length}
          </div>
        </div>
      </div>
    </div>
  );
}
