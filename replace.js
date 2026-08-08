const fs = require('fs');
const file = 'components/dashboard/timeline-replay.tsx';
let content = fs.readFileSync(file, 'utf8');

const returnIndex = content.indexOf('  return (');
if (returnIndex === -1) {
  console.error('return ( not found');
  process.exit(1);
}

const before = content.substring(0, returnIndex);

const newReturn = `  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 w-screen h-[100dvh] bg-[#07111f] font-sans flex flex-col overflow-hidden text-ivory"
    >
      {/* Ambient cosmic glow */}
      <div
        className="pointer-events-none absolute -left-20 -top-20 h-96 w-96 rounded-full blur-3xl transition-all duration-1000 ease-out z-0"
        style={{
          backgroundColor: engine.eraColor.glow,
          transform: \`translate(\${engine.progress * 0.3}px, \${
            engine.progress * 0.15
          }px)\`,
        }}
      />
      <div
        className="pointer-events-none absolute -bottom-20 -right-20 h-96 w-96 rounded-full blur-3xl transition-all duration-1000 ease-out z-0"
        style={{
          backgroundColor: engine.eraColor.glow,
          transform: \`translate(-\${engine.progress * 0.3}px, -\${
            engine.progress * 0.15
          }px)\`,
        }}
      />

      {/* Top (10%): Chapter badge, title, and controls */}
      <div className="h-[10%] w-full flex items-center justify-between px-6 sm:px-12 border-b border-white/5 relative z-10 shrink-0">
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl border bg-zinc-950/80 shadow-md transition-all duration-500"
            style={{
              borderColor: engine.eraColor.border,
              color: engine.eraColor.accent,
            }}
          >
            <Clock
              className={\`h-4 w-4 sm:h-5 sm:w-5 \${
                engine.isPlaying
                  ? "animate-spin [animation-duration:12s]"
                  : ""
              }\`}
            />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span
                className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em]"
                style={{ color: engine.eraColor.accent }}
              >
                Developer Odyssey
              </span>
              <span
                className={\`inline-flex items-center rounded-full border px-2 py-0.5 font-mono text-[9px] font-medium transition-all \${
                  engine.isPlaying
                    ? "border-brass/45 bg-brass/10 text-brass-light shadow-[0_0_10px_rgba(212,168,83,0.2)]"
                    : "border-zinc-800 bg-zinc-950 text-zinc-500"
                }\`}
              >
                {engine.isPlaying ? "Playing 1x" : "Paused"}
              </span>
            </div>
            <h2 className="font-display tracking-tight text-ivory text-xl sm:text-2xl md:text-3xl font-semibold mt-0.5">
              {currentChapter?.name || "The Developer Journey"}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={toggleSoundtrack}
            className={\`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 font-mono text-xs transition-all \${
              soundEnabled
                ? "border-brass bg-brass/10 text-brass-light shadow-[0_0_15px_rgba(212,168,83,0.15)]"
                : "border-zinc-800 bg-zinc-950/50 text-zinc-500 hover:text-ivory"
            }\`}
          >
            {soundEnabled ? (
              <><Volume2 className="h-3.5 w-3.5 text-brass-light animate-pulse" /><span className="hidden sm:inline">Piano On</span></>
            ) : (
              <><VolumeX className="h-3.5 w-3.5" /><span className="hidden sm:inline">Muted</span></>
            )}
          </button>
          
          <div className="hidden sm:flex items-center gap-2 rounded-xl border border-zinc-800 bg-zinc-950/80 px-3.5 py-1.5 shadow-inner">
            <Calendar className="h-3.5 w-3.5 text-brass-light" />
            <span className="font-display text-lg font-bold tracking-tight text-ivory">
              {engine.currentYear}
            </span>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleFullscreen}
            className="h-8 w-8 p-0 text-zinc-500 hover:text-ivory hidden sm:inline-flex"
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowControlsDrawer(!showControlsDrawer)}
            className="hidden sm:flex h-8 border-zinc-800 px-2.5 font-mono text-xs text-zinc-500 hover:text-ivory"
          >
            <Sliders className="mr-1 h-3 w-3 text-brass-light" />
            <span>{showControlsDrawer ? "Hide Options" : "Options"}</span>
          </Button>

          {onClose && (
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              className="h-8 border-zinc-800 text-zinc-400 hover:text-white"
            >
              Close
            </Button>
          )}
        </div>
      </div>

      {showControlsDrawer && (
        <div className="absolute top-[10%] right-6 z-50 glass-card p-4 flex flex-col gap-3 shadow-2xl border-white/10 bg-zinc-950/90 rounded-xl mt-2">
          <div className="flex flex-col gap-2">
            <span className="font-mono text-[10px] uppercase text-zinc-500">Chapters</span>
            <div className="flex flex-wrap items-center gap-1.5 max-w-xs">
              {engine.chapters.map((ch) => (
                <button
                  key={ch.id}
                  onClick={() => engine.jumpToChapter(ch.id)}
                  className={\`rounded-lg border px-2.5 py-1 font-sans text-xs transition-all \${
                    currentChapter?.id === ch.id
                      ? "border-brass bg-brass text-ink font-semibold"
                      : "border-zinc-800 bg-zinc-950/60 text-zinc-400 hover:text-ivory"
                  }\`}
                >
                  {ch.name}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2 mt-2">
            <Button variant="outline" size="sm" onClick={handleCopyLink} className="h-8 text-xs">
              {copiedLink ? <Check className="mr-1 h-3 w-3 text-brass" /> : <Share2 className="mr-1 h-3 w-3" />} Share
            </Button>
            <Button variant="outline" size="sm" onClick={handleDownloadPDF} className="h-8 text-xs">
              <FileText className="mr-1 h-3 w-3" /> PDF
            </Button>
            <Button variant="outline" size="sm" onClick={() => setShowExportModal(!showExportModal)} className="h-8 text-xs border-brass/40 text-brass-light">
              <Video className="mr-1 h-3 w-3" /> Export
            </Button>
          </div>
        </div>
      )}

      {showExportModal && (
        <div className="absolute top-[10%] right-6 mt-40 z-50 glass-card p-4 flex flex-col gap-3 shadow-2xl border-white/10 bg-zinc-950/90 rounded-xl max-w-sm">
          <div>
            <span className="font-mono text-xs font-semibold uppercase tracking-wider text-brass-light">Export</span>
            <p className="font-sans text-[10px] text-zinc-400">Renders the entire replay at 1080p 30fps.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => handleExportVideo("landscape", false)} disabled={!!exportingType} className="text-[10px] h-7">1080p (No Audio)</Button>
            <Button variant="outline" size="sm" onClick={() => handleExportVideo("landscape", true)} disabled={!!exportingType} className="text-[10px] h-7 border-brass/40 text-brass-light">1080p (With Audio)</Button>
            <Button variant="outline" size="sm" onClick={() => handleExportVideo("vertical", false)} disabled={!!exportingType} className="text-[10px] h-7">9:16 Reel</Button>
            <Button variant="outline" size="sm" onClick={handleExportThumbnail} className="text-[10px] h-7">Thumbnail PNG</Button>
          </div>
        </div>
      )}
      
      {exportStatus && (
        <div className="absolute top-[10%] right-6 mt-40 z-50 flex items-center justify-between rounded-xl border border-brass/40 bg-brass/10 px-4 py-2.5 font-mono text-xs text-brass-light shadow-sm">
          <span>{exportStatus}</span>
          <span className="ml-3 h-2 w-2 animate-pulse rounded-full bg-brass" />
        </div>
      )}

      {/* Upper-middle (15%): Narrative paragraph */}
      <div className="h-[15%] w-full flex items-center justify-center px-6 relative z-10 shrink-0">
        {currentChapter?.narrative && (
          <div className="text-center max-w-4xl mx-auto">
            <p className="font-serif italic text-zinc-300 text-lg sm:text-xl md:text-2xl leading-relaxed drop-shadow-md">
              “{currentChapter.narrative}”
            </p>
          </div>
        )}
      </div>

      {/* Center (50%): Milestone card (72-78% width) */}
      <div className="h-[50%] w-full flex items-center justify-center relative z-10 shrink-0">
        {isAtEnd ? (
          <div className="w-[75%] h-full max-h-[400px] glass-card-glow relative p-8 text-center sm:p-12 border-zinc-800 bg-zinc-900/90 shadow-2xl flex flex-col items-center justify-center rounded-3xl">
            <div className="pointer-events-none absolute inset-0 bg-scan-line opacity-5 rounded-3xl" />
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-brass bg-brass/10 text-brass-light shadow-lg">
              <Award className="h-7 w-7 animate-bounce" />
            </div>
            <span className="mt-5 font-mono text-[10px] uppercase tracking-[0.25em] text-brass-light font-bold">
              Documentary Finale
            </span>
            <h3 className="mt-4 font-display text-2xl font-semibold leading-relaxed text-ivory sm:text-3xl">
              {stats.commitsReplayed} commits. {repos.length || 6} repositories. {yearsSpan} year{yearsSpan > 1 ? "s" : ""} of growth.
            </h3>
            <p className="mt-2 font-display text-xl font-medium text-brass-light sm:text-2xl">
              This is how a developer is built.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Button
                size="lg"
                onClick={engine.replay}
                className="rounded-full bg-brass px-7 font-sans font-semibold text-ink hover:bg-brass-light"
              >
                <RotateCcw className="mr-2 h-4 w-4" /> Watch Story Again
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={handleDownloadPDF}
                className="rounded-full border-zinc-800 font-mono text-xs text-white"
              >
                <FileText className="mr-2 h-4 w-4" /> Download PDF Chronicle
              </Button>
            </div>
          </div>
        ) : (
          <div
            className="w-[75%] h-full max-h-[400px] glass-card cinematic-depth-card relative overflow-hidden transition-opacity duration-1000 ease-in-out shadow-2xl flex flex-col justify-between border-zinc-800 bg-[#161618]/95 p-8 sm:p-10 rounded-3xl"
            style={{ borderColor: engine.eraColor.border }}
          >
            <div className="pointer-events-none absolute inset-0 bg-scan-line opacity-5 rounded-3xl" />
            
            {currentEvent?.type === "repo_created" ? (
              <div className="relative z-10 flex flex-col gap-4 select-text h-full justify-center">
                <div className="flex items-center justify-between gap-2 border-b border-zinc-800/80 pb-3">
                  <span className="inline-flex items-center gap-1.5 rounded-lg border border-brass-dim/50 bg-brass/10 px-3 py-1 font-mono text-xs font-medium text-brass-light">
                    <FolderGit2 className="h-3.5 w-3.5" />
                    New Repository Founded
                  </span>
                  <span className="font-mono text-xs text-zinc-500">{formattedDate}</span>
                </div>
                <div className="py-2">
                  <h3 className="font-display text-3xl font-semibold text-ivory lg:text-5xl">
                    {currentEvent.repoName}
                  </h3>
                  <p className="mt-4 font-sans text-base leading-relaxed text-zinc-400">
                    {currentEvent.description || "Inaugural repository initialized."}
                  </p>
                </div>
                <div className="mt-auto flex items-center justify-between border-t border-zinc-800/80 pt-4 font-mono text-sm text-zinc-500">
                  {currentEvent.language && (
                    <span className="inline-flex items-center gap-1.5 text-ivory">
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ backgroundColor: currentEvent.languageColor || "#D4A853" }}
                      />
                      {currentEvent.language}
                    </span>
                  )}
                </div>
              </div>
            ) : (
              <div className="relative z-10 flex flex-col gap-5 select-text h-full justify-center">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800/60 pb-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-md border border-zinc-700/60 bg-zinc-800/50 px-3 py-1 font-mono text-sm font-semibold text-zinc-200 shadow-sm">
                      <FolderGit2 className="h-4 w-4 text-brass-light" />
                      {currentEvent?.repoName}
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-md border border-zinc-800/80 bg-zinc-900/50 px-2 py-1 font-mono text-xs uppercase text-zinc-400">
                      <GitCommit className="h-3 w-3" />
                      {commit?.sha?.substring(0, 7) || "commit"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-zinc-500" />
                    <span className="font-mono text-sm text-zinc-300 font-medium">{formattedDate}</span>
                  </div>
                </div>

                <div className="py-2">
                  <h3 className="font-display font-medium leading-snug tracking-tight text-ivory text-3xl sm:text-4xl lg:text-5xl line-clamp-2">
                    {currentEvent?.title}
                  </h3>
                </div>

                <div className="text-base md:text-lg lg:text-xl font-sans text-zinc-300 leading-relaxed">
                  {currentEvent?.description || currentEvent?.impactDescription || (commit?.message ? commit.message.split('\n')[0] : "Codebase updated.")}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Lower-middle (10%): Chapter indicator, Month, Remaining milestones */}
      <div className="h-[10%] w-full flex flex-col items-center justify-center relative z-10 shrink-0">
        <div className="font-mono text-xs uppercase tracking-[0.2em] text-zinc-500 mb-2">
          Chapter {engine.chapters.findIndex(c => c.id === currentChapter?.id) + 1} of {engine.chapters.length}
          <span className="mx-2 text-zinc-700">•</span>
          <span className="text-brass-light">{currentEvent?.monthName} {currentEvent?.year}</span>
        </div>
        
        <div className="font-sans text-sm text-zinc-400">
          {Math.max(0, engine.total - engine.currentIndex - 1)} meaningful milestones remaining
        </div>
      </div>

      {/* Bottom (15%): Timeline scrubber and safe area padding */}
      <div className="h-[15%] w-full flex flex-col items-center justify-center px-6 pb-4 relative z-10 shrink-0">
        {/* Scrubber / Progress bar */}
        <div className="w-full max-w-5xl h-1 bg-zinc-800/50 rounded-full overflow-hidden mb-5">
          <div 
            className="h-full bg-brass transition-all duration-1000 ease-out" 
            style={{ width: \`\${(engine.currentIndex / Math.max(1, engine.total - 1)) * 100}%\` }}
          />
        </div>

        <div className="glass-card flex flex-wrap items-center justify-between gap-4 p-3.5 w-full max-w-5xl rounded-2xl bg-zinc-900/80 border-white/5">
          {/* Speed Controls */}
          <div className="flex items-center gap-1 rounded-xl border border-white/10 bg-black/40 p-1">
            <span className="px-2 font-mono text-[10px] uppercase text-zinc-500">
              Speed
            </span>
            {([1, 2, 5]).map((s) => (
              <button
                key={s}
                onClick={() => engine.setSpeed(s as any)}
                className={\`rounded-lg px-2.5 py-0.5 font-mono text-xs font-semibold transition-all \${
                  engine.speed === s
                    ? "bg-brass text-ink shadow-sm"
                    : "text-zinc-500 hover:text-ivory"
                }\`}
              >
                {s}x
              </button>
            ))}
          </div>

          {/* Primary Transport Controls */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={engine.replay}
              title="Replay from start (R)"
              className="h-10 w-10 p-0 border-white/10 hover:border-brass hover:text-ivory rounded-full"
            >
              <RotateCcw className="h-4 w-4 text-zinc-400" />
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={engine.stepBack}
              disabled={engine.currentIndex === 0}
              title="Step backward (←)"
              className="h-10 w-10 p-0 border-white/10 rounded-full"
            >
              <ChevronLeft className="h-5 w-5 text-ivory" />
            </Button>

            <Button
              size="lg"
              onClick={engine.togglePlay}
              title="Play / Pause (Space)"
              className="h-12 px-8 rounded-full bg-brass text-ink font-sans text-base font-semibold shadow-[0_0_25px_rgba(212,168,83,0.45)] transition-all hover:bg-brass-light hover:scale-105"
            >
              {engine.isPlaying ? (
                <><Pause className="mr-2 h-5 w-5 fill-current" />Pause</>
              ) : (
                <><Play className="mr-2 h-5 w-5 fill-current" />
                {engine.currentIndex >= engine.total - 1 ? "Replay" : "Play"}</>
              )}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={engine.stepForward}
              disabled={engine.currentIndex >= engine.total - 1}
              title="Step forward (→)"
              className="h-10 w-10 p-0 border-white/10 rounded-full"
            >
              <ChevronRight className="h-5 w-5 text-ivory" />
            </Button>
          </div>

          <div className="hidden font-mono text-[10px] text-zinc-500 md:flex md:items-center md:gap-2.5">
            <span><kbd className="rounded border border-white/10 bg-black/40 px-1 py-0.2 text-zinc-300">Space</kbd> Play</span>
            <span><kbd className="rounded border border-white/10 bg-black/40 px-1 py-0.2 text-zinc-300">← / →</kbd> Step</span>
          </div>
        </div>
      </div>
    </div>
  );
}
`;

fs.writeFileSync(file, before + newReturn);
console.log('Successfully replaced return block in timeline-replay.tsx');
