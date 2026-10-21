import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  Moon,
  Sun,
  Tag,
  GitCommit,
  Download,
  Share2,
  Check,
  Calendar,
  Layers,
  ChevronRight,
  ExternalLink,
  Sparkles,
  Zap,
  Shield,
  Filter,
  Terminal,
  X,
  Copy,
  ArrowUpRight,
  Github
} from 'lucide-react';

const INITIAL_LOGS = [
  {
    id: 'log-105',
    version: 'v0.1.5',
    date: 'September 24, 2026',
    title: 'High-Performance Spatial Audio Engine & Native WASM Pipeline',
    category: 'Releases',
    badges: [
      { text: 'Major Release', variant: 'default' },
      { text: 'Audio Core', variant: 'secondary' },
      { text: 'Performance', variant: 'outline' }
    ],
    description: 'Introducing our next-generation WebAssembly spatial audio rendering pipeline with sub-5ms latency processing and dynamic HRTF profile loading.',
    highlights: [
      'Rewrote the core PCM audio buffer pipeline in Rust/WASM, reducing CPU overhead by 38%.',
      'Added real-time 3D Binaural HRTF spatializer with custom room reflection models.',
      'Introduced dynamic buffer scaling for low-bandwidth streaming fallback.',
      'Fixed audio glitching on iOS Safari during background tab context switching.'
    ],
    codeSnippet: 'const engine = await SonivaAudioEngine.init({ spatial: true, hrtf: "kemar_high" });',
    downloadUrl: '#',
    downloadSize: '14.2 MB',
    commits: [
      { hash: 'a1b2c3d', message: 'feat(core): rewrite audio mixer in Rust with direct memory sharing', author: 'Alex Rivera' },
      { hash: 'e4f5g6h', message: 'perf(hrtf): optimize convolution matrix calculations using SIMD', author: 'Elena Rostova' },
      { hash: 'i7j8k9l', message: 'fix(ios): resolve web audio suspend/resume context race conditions', author: 'David Chen' }
    ]
  },
  {
    id: 'log-104',
    version: 'v0.1.4',
    date: 'September 12, 2026',
    title: 'Multi-Track Real-time Collaboration & Waveform Sync',
    category: 'Dev Logs',
    badges: [
      { text: 'Collaboration', variant: 'secondary' },
      { text: 'WebSockets', variant: 'outline' }
    ],
    description: 'Developers can now stream multi-track raw stems in real-time over WebSockets with automatic clock synchronization and conflict resolution.',
    highlights: [
      'Implemented CRDT-based timeline synchronization for non-destructive stem edits.',
      'Added visual spectral waveform overlay with frame-accurate scrubbing indicators.',
      'Optimized WebSocket frame compression using Snappy compression over binary chunks.',
      'Added automated fallback to WebRTC datachannels when peer-to-peer connection is optimal.'
    ],
    codeSnippet: 'session.subscribeToTrack("vocals-lead", (sampleBuffer) => mixer.push(sampleBuffer));',
    downloadUrl: '#',
    downloadSize: '12.8 MB',
    commits: [
      { hash: 'm1n2o3p', message: 'feat(sync): add CRDT state manager for multi-user waveform cursors', author: 'Alex Rivera' },
      { hash: 'q4r5s6t', message: 'refactor(net): introduce Snappy payload encoder for binary socket streams', author: 'Sarah Jenkins' }
    ]
  },
  {
    id: 'log-103',
    version: 'v0.1.3',
    date: 'August 28, 2026',
    title: 'AI Stem Separation Module & Noise Suppression V2',
    category: 'Releases',
    badges: [
      { text: 'Feature Release', variant: 'default' },
      { text: 'AI Engine', variant: 'secondary' }
    ],
    description: 'Shipment of our embedded 4-stem isolation model trained on 10,000+ hours of studio multitracks, running entirely client-side via WebGPU.',
    highlights: [
      'Zero-latency voice isolation and background noise cancellation using WebGPU tensors.',
      'Separates vocal, drums, bass, and instrumental stems with -92dB cross-bleed isolation.',
      'New UI controls for adjusting AI interference thresholds per audio input channel.',
      'Deprecated legacy WebAudio ScriptProcessorNode in favor of AudioWorkletProcessor.'
    ],
    codeSnippet: 'const { vocal, drums } = await soniva.isolateStems(audioFile, { gpuAcceleration: true });',
    downloadUrl: '#',
    downloadSize: '48.1 MB',
    commits: [
      { hash: 'u7v8w9x', message: 'feat(ai): integrate ONNX Runtime WebGPU engine for real-time stem splitting', author: 'Elena Rostova' },
      { hash: 'y1z2a3b', message: 'docs(api): update audio worklet setup guide and memory limits', author: 'Liam Vance' }
    ]
  },
  {
    id: 'log-102',
    version: 'v0.1.2',
    date: 'August 10, 2026',
    title: 'Security Patch & Zero-Copy Audio Buffer Allocation',
    category: 'Patch',
    badges: [
      { text: 'Security', variant: 'destructive' },
      { text: 'Optimization', variant: 'outline' }
    ],
    description: 'Patched a potential memory leak in long-running streaming sessions and eliminated unnecessary memory copies in the audio pipeline.',
    highlights: [
      'Eliminated memory duplication during large FLAC decoder chunking using SharedArrayBuffer.',
      'Patched web socket authentication token renewal timing vulns during socket reconnects.',
      'Added strict CORS policy checks for embedded web player widgets.'
    ],
    codeSnippet: 'const buffer = new SharedArrayBuffer(1024 * 1024 * 16); // Zero-copy buffer',
    downloadUrl: '#',
    downloadSize: '11.4 MB',
    commits: [
      { hash: 'c4d5e6f', message: 'fix(security): sanitize WebSocket auth handshake claims', author: 'Marcus Brody' },
      { hash: 'g7h8i9j', message: 'perf(mem): replace ArrayBuffer copy with SharedArrayBuffer views', author: 'Alex Rivera' }
    ]
  },
  {
    id: 'log-101',
    version: 'v0.1.0',
    date: 'July 15, 2026',
    title: 'Initial Developer Preview & SDK Release',
    category: 'Releases',
    badges: [
      { text: 'Initial Release', variant: 'default' },
      { text: 'SDK', variant: 'secondary' }
    ],
    description: 'The first official public release of Soniva Core SDK. High-fidelity audio processing for web applications.',
    highlights: [
      'Modular Audio Engine JavaScript/TypeScript Client SDK.',
      'Built-in support for MP3, WAV, FLAC, and Ogg Opus decoding.',
      'Comprehensive documentation site and interactive playground.'
    ],
    codeSnippet: 'import { SonivaClient } from "@soniva/sdk";',
    downloadUrl: '#',
    downloadSize: '8.9 MB',
    commits: [
      { hash: 'k1l2m3n', message: 'chore: initial commit of core SDK scaffolding', author: 'Alex Rivera' }
    ]
  }
];

const generateActivityData = () => {
  const days = [];
  const levels = [0, 1, 2, 3, 4];
  for (let i = 0; i < 90; i++) {
    // Generate mock commit frequency over 90 days
    const rand = Math.random();
    let level = 0;
    if (rand > 0.85) level = 4;
    else if (rand > 0.65) level = 3;
    else if (rand > 0.45) level = 2;
    else if (rand > 0.25) level = 1;
    days.push({ day: i, level });
  }
  return days;
};

export default function App() {
  const [darkMode, setDarkMode] = useState(true);
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLogForModal, setSelectedLogForModal] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const activityData = useMemo(() => generateActivityData(), []);

  // Sync dark mode class with root html element
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Show dynamic toast banner
  const triggerToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Copy share link helper
  const handleCopyLink = (id) => {
    setCopiedId(id);
    navigator.clipboard?.writeText?.(`${window.location.origin}/#${id}`);
    triggerToast(`Direct link to ${id} copied to clipboard!`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filter logs by tab and search keyword
  const filteredLogs = useMemo(() => {
    return INITIAL_LOGS.filter((log) => {
      const matchesTab =
        activeTab === 'All' ||
        (activeTab === 'Releases' && log.category === 'Releases') ||
        (activeTab === 'Dev Logs' && log.category === 'Dev Logs') ||
        (activeTab === 'Patches' && log.category === 'Patch');

      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        query === '' ||
        log.title.toLowerCase().includes(query) ||
        log.version.toLowerCase().includes(query) ||
        log.description.toLowerCase().includes(query) ||
        log.highlights.some((h) => h.toLowerCase().includes(query));

      return matchesTab && matchesSearch;
    });
  }, [activeTab, searchQuery]);

  return (
    <div className={`min-h-screen font-sans bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 transition-colors duration-200 antialiased selection:bg-zinc-800 selection:text-zinc-100 dark:selection:bg-zinc-200 dark:selection:text-zinc-900`}>
      
      {}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-3 bg-zinc-900 dark:bg-zinc-100 text-zinc-100 dark:text-zinc-900 px-4 py-3 rounded-lg shadow-xl border border-zinc-700 dark:border-zinc-300 text-sm font-medium animate-in fade-in slide-in-from-bottom-2 duration-200">
          <Check className="w-4 h-4 text-emerald-400 dark:text-emerald-600" />
          <span>{toastMessage}</span>
        </div>
      )}

      {}
      <header className="sticky top-0 z-40 w-full border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-950/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-6">
            <a href="#" className="flex items-center gap-2.5 group">
              <div className="w-7 h-7 rounded-md bg-zinc-900 dark:bg-zinc-100 text-zinc-100 dark:text-zinc-900 flex items-center justify-center font-mono font-bold text-sm tracking-tight group-hover:scale-105 transition-transform">
                S
              </div>
              <span className="font-semibold tracking-tight text-sm">Soniva</span>
              <span className="hidden sm:inline-block text-xs font-mono text-zinc-500 dark:text-zinc-400 bg-zinc-200/60 dark:bg-zinc-800/60 px-1.5 py-0.5 rounded border border-zinc-300/50 dark:border-zinc-700/50">
                v0.1.5
              </span>
            </a>

            <nav className="hidden md:flex items-center gap-5 text-xs font-medium text-zinc-600 dark:text-zinc-400">
              <a href="#" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">Documentation</a>
              <a href="#" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">API Reference</a>
              <a href="#" className="hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">Pricing</a>
              <a href="#" className="text-zinc-900 dark:text-zinc-100 font-semibold underline underline-offset-4 decoration-zinc-400 dark:decoration-zinc-600">Changelog</a>
            </nav>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-2">
            <a 
              href="https://github.com" 
              target="_blank" 
              rel="noreferrer"
              className="p-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 rounded-md hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50 transition-colors"
              title="GitHub Repository"
            >
              <Github className="w-4 h-4" />
            </a>

            {/* Theme Toggle Button */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 rounded-md hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50 transition-colors"
              title="Toggle theme"
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            <a
              href="#latest"
              className="hidden sm:inline-flex items-center justify-center h-8 px-3 text-xs font-medium bg-zinc-900 dark:bg-zinc-100 text-zinc-100 dark:text-zinc-900 rounded-md hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors shadow-sm"
            >
              Get Started
            </a>
          </div>
        </div>
      </header>

      {}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        
        {}
        <section className="mb-10 sm:mb-12 border-b border-zinc-200 dark:border-zinc-800 pb-8 sm:pb-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-mono bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Active Development</span>
                <span className="text-zinc-300 dark:text-zinc-700">|</span>
                <span>Latest: v0.1.5</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                Changelog & System Updates
              </h1>
              <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 leading-relaxed">
                New features, performance enhancements, and developer release notes for Soniva core audio engine & SDK APIs.
              </p>
            </div>

            {/* Quick Action / RSS link */}
            <div className="flex items-center gap-3">
              <button 
                onClick={() => triggerToast("Subscribed to RSS updates feed!")}
                className="inline-flex items-center gap-2 h-9 px-3 text-xs font-medium border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 rounded-md transition-colors shadow-sm"
              >
                <Sparkles className="w-3.5 h-3.5 text-zinc-500" />
                Subscribe RSS
              </button>
            </div>
          </div>
        </section>

        {}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-8">
          
          {/* Filter Tabs */}
          <div className="inline-flex items-center p-1 bg-zinc-200/50 dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 text-xs font-medium text-zinc-600 dark:text-zinc-400">
            {['All', 'Releases', 'Dev Logs', 'Patches'].map((tab) => {
              const active = activeTab === tab;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-1.5 rounded-md transition-all ${
                    active
                      ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm font-semibold'
                      : 'hover:text-zinc-900 dark:hover:text-zinc-200'
                  }`}
                >
                  {tab === 'All' ? 'All Updates' : tab}
                </button>
              );
            })}
          </div>

          {/* Search Box with ⌘K Badge */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder="Search logs or commits..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-9 pl-9 pr-12 text-xs bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:focus:ring-zinc-600 transition-all"
            />
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono text-zinc-400 bg-zinc-100 dark:bg-zinc-800 rounded border border-zinc-200 dark:border-zinc-700">
              <span>⌘</span>K
            </div>
          </div>
        </div>

        {}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Main Timeline Column */}
          <div className="lg:col-span-8 space-y-8 relative">
            
            {/* Vertical timeline connector rule */}
            <div className="absolute left-4 top-3 bottom-3 w-px bg-zinc-200 dark:bg-zinc-800 hidden sm:block" />

            {filteredLogs.length === 0 ? (
              <div className="p-8 text-center border border-dashed border-zinc-300 dark:border-zinc-800 rounded-xl bg-white/50 dark:bg-zinc-900/50">
                <Filter className="w-8 h-8 text-zinc-400 mx-auto mb-3" />
                <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-100 mb-1">No matching logs found</h3>
                <p className="text-xs text-zinc-500 mb-4">Try clearing your search query or switching tabs.</p>
                <button
                  onClick={() => { setSearchQuery(''); setActiveTab('All'); }}
                  className="px-3 py-1.5 text-xs font-medium bg-zinc-900 dark:bg-zinc-100 text-zinc-100 dark:text-zinc-900 rounded-md"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              filteredLogs.map((log) => (
                <article
                  key={log.id}
                  id={log.id}
                  className="relative sm:pl-10 group"
                >
                  {/* Timeline dot icon */}
                  <div className="absolute left-2.5 top-5 -translate-x-1/2 w-3 h-3 rounded-full border-2 border-zinc-50 dark:border-zinc-950 bg-zinc-400 dark:bg-zinc-600 group-hover:bg-zinc-900 dark:group-hover:bg-zinc-100 transition-colors hidden sm:block" />

                  {/* Card Container */}
                  <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-900 p-5 sm:p-6 shadow-sm hover:border-zinc-300 dark:hover:border-zinc-700 transition-all">
                    
                    {/* Header Row */}
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700">
                          {log.version}
                        </span>
                        <span className="text-xs font-mono text-zinc-500 dark:text-zinc-400">
                          {log.date}
                        </span>
                      </div>

                      {/* Share & Modal Actions */}
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleCopyLink(log.id)}
                          className="p-1.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                          title="Copy permalink"
                        >
                          {copiedId === log.id ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    {/* Title */}
                    <h2 className="text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-100 mb-3 group-hover:text-zinc-700 dark:group-hover:text-zinc-300 transition-colors">
                      {log.title}
                    </h2>

                    {/* Badge List */}
                    <div className="flex flex-wrap items-center gap-1.5 mb-4">
                      {log.badges.map((b, i) => {
                        let style = "bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700";
                        if (b.variant === 'default') {
                          style = "bg-zinc-900 text-zinc-100 dark:bg-zinc-100 dark:text-zinc-900 border-transparent";
                        } else if (b.variant === 'destructive') {
                          style = "bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-900";
                        }
                        return (
                          <span
                            key={i}
                            className={`px-2 py-0.5 text-[11px] font-medium rounded-md border ${style}`}
                          >
                            {b.text}
                          </span>
                        );
                      })}
                    </div>

                    {/* Description Paragraph */}
                    <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed mb-4">
                      {log.description}
                    </p>

                    {/* Key Highlights / Bullet points */}
                    <div className="mb-4 space-y-2">
                      <h4 className="text-xs font-semibold text-zinc-900 dark:text-zinc-200 uppercase tracking-wider font-mono">
                        Key Updates:
                      </h4>
                      <ul className="space-y-1.5 text-xs text-zinc-600 dark:text-zinc-400 list-disc list-inside">
                        {log.highlights.map((item, idx) => (
                          <li key={idx} className="leading-normal">
                            <span className="text-zinc-800 dark:text-zinc-200">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Inline Code Block Preview */}
                    {log.codeSnippet && (
                      <div className="mb-5 rounded-lg bg-zinc-900 dark:bg-zinc-950 p-3 font-mono text-xs text-zinc-200 border border-zinc-800 overflow-x-auto flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <Terminal className="w-3.5 h-3.5 text-zinc-500 flex-shrink-0" />
                          <code className="text-zinc-300">{log.codeSnippet}</code>
                        </div>
                        <button
                          onClick={() => {
                            navigator.clipboard?.writeText?.(log.codeSnippet);
                            triggerToast("Code snippet copied!");
                          }}
                          className="text-[10px] text-zinc-400 hover:text-zinc-100 transition-colors"
                        >
                          Copy
                        </button>
                      </div>
                    )}

                    {/* Card Footer Actions */}
                    <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800/80 flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedLogForModal(log)}
                          className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100 underline underline-offset-4 decoration-zinc-300 dark:decoration-zinc-700 transition-colors"
                        >
                          <GitCommit className="w-3.5 h-3.5" />
                          <span>View {log.commits.length} commits</span>
                        </button>
                      </div>

                      {log.downloadUrl && (
                        <a
                          href={log.downloadUrl}
                          onClick={(e) => {
                            e.preventDefault();
                            triggerToast(`Downloading Soniva SDK ${log.version} (${log.downloadSize})...`);
                          }}
                          className="inline-flex items-center gap-1.5 h-7 px-2.5 text-xs font-medium border border-zinc-200 dark:border-zinc-800 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                        >
                          <Download className="w-3 h-3 text-zinc-500" />
                          <span>Download Scaffolding</span>
                          <span className="text-[10px] text-zinc-400 font-mono">({log.downloadSize})</span>
                        </a>
                      )}
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>

          {}
          <aside className="lg:col-span-4 space-y-6">
            
            {/* Activity Matrix Card */}
            <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-900 p-5 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-semibold tracking-tight uppercase font-mono text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-zinc-500" />
                  Release Cadence
                </h3>
                <span className="text-[10px] text-zinc-500 font-mono">Last 90 days</span>
              </div>

              {/* GitHub-style matrix grid */}
              <div className="grid grid-cols-10 gap-1.5 mb-3">
                {activityData.map((d) => {
                  let bg = 'bg-zinc-100 dark:bg-zinc-800';
                  if (d.level === 1) bg = 'bg-emerald-200 dark:bg-emerald-950/80';
                  if (d.level === 2) bg = 'bg-emerald-400 dark:bg-emerald-800';
                  if (d.level === 3) bg = 'bg-emerald-500 dark:bg-emerald-600';
                  if (d.level === 4) bg = 'bg-emerald-600 dark:bg-emerald-400';

                  return (
                    <div
                      key={d.day}
                      className={`w-full aspect-square rounded-[2px] ${bg} transition-colors hover:ring-1 hover:ring-zinc-400`}
                      title={`Day ${d.day + 1}: Activity level ${d.level}`}
                    />
                  );
                })}
              </div>

              <div className="flex items-center justify-between text-[10px] text-zinc-500 font-mono">
                <span>Less</span>
                <div className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-[1px] bg-zinc-100 dark:bg-zinc-800" />
                  <span className="w-2.5 h-2.5 rounded-[1px] bg-emerald-200 dark:bg-emerald-950" />
                  <span className="w-2.5 h-2.5 rounded-[1px] bg-emerald-400 dark:bg-emerald-800" />
                  <span className="w-2.5 h-2.5 rounded-[1px] bg-emerald-500 dark:bg-emerald-600" />
                  <span className="w-2.5 h-2.5 rounded-[1px] bg-emerald-600 dark:bg-emerald-400" />
                </div>
                <span>More</span>
              </div>
            </div>

            {/* Quick Artifact Downloads */}
            <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-900 p-5 shadow-sm">
              <h3 className="text-xs font-semibold tracking-tight uppercase font-mono text-zinc-900 dark:text-zinc-100 mb-3 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-zinc-500" />
                Quick Build Artifacts
              </h3>

              <div className="space-y-2.5">
                {[
                  { name: 'Soniva Web WASM SDK', version: 'v0.1.5', size: '14.2 MB' },
                  { name: 'Node.js Native Bindings', version: 'v0.1.5', size: '28.1 MB' },
                  { name: 'CLI Utilities & Tools', version: 'v0.1.4', size: '8.4 MB' }
                ].map((artifact, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-2.5 rounded-lg border border-zinc-100 dark:border-zinc-800/60 bg-zinc-50/50 dark:bg-zinc-950/50 hover:bg-zinc-100/80 dark:hover:bg-zinc-800/50 transition-colors"
                  >
                    <div>
                      <div className="text-xs font-medium text-zinc-900 dark:text-zinc-100">{artifact.name}</div>
                      <div className="text-[10px] font-mono text-zinc-500">{artifact.version} • {artifact.size}</div>
                    </div>
                    <button
                      onClick={() => triggerToast(`Downloading ${artifact.name}...`)}
                      className="p-1 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                      title="Download"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* System Status Block */}
            <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-900 p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">All Systems Operational</span>
              </div>
              <p className="text-[11px] text-zinc-500 mb-3">
                NPM Registry, WASM CDN Edge Nodes, and WebSockets API are running smoothly.
              </p>
              <a
                href="#"
                onClick={(e) => { e.preventDefault(); triggerToast("Redirecting to status page..."); }}
                className="inline-flex items-center gap-1 text-[11px] font-mono font-medium text-zinc-700 dark:text-zinc-300 hover:underline"
              >
                <span>View Status Page</span>
                <ArrowUpRight className="w-3 h-3" />
              </a>
            </div>

          </aside>
        </div>
      </main>

      {}
      {selectedLogForModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-sm animate-in fade-in duration-150">
          <div
            className="w-full max-w-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-2xl p-6 relative animate-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-zinc-200 dark:border-zinc-800 mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                    Git Commits for {selectedLogForModal.version}
                  </h3>
                  <span className="text-xs font-mono text-zinc-500">
                    ({selectedLogForModal.commits.length} commits)
                  </span>
                </div>
                <p className="text-xs text-zinc-500 mt-0.5">{selectedLogForModal.title}</p>
              </div>
              <button
                onClick={() => setSelectedLogForModal(null)}
                className="p-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Commit List */}
            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {selectedLogForModal.commits.map((commit, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-lg border border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/50 flex items-start justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="font-mono text-zinc-800 dark:text-zinc-200 font-medium">
                      {commit.message}
                    </div>
                    <div className="text-[11px] text-zinc-500">
                      Authored by <span className="text-zinc-700 dark:text-zinc-300">{commit.author}</span>
                    </div>
                  </div>
                  <span className="font-mono text-[11px] text-zinc-400 bg-zinc-200/60 dark:bg-zinc-800/60 px-1.5 py-0.5 rounded border border-zinc-300/40 dark:border-zinc-700/40 flex-shrink-0">
                    {commit.hash}
                  </span>
                </div>
              ))}
            </div>

            {/* Modal Footer */}
            <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 mt-5 flex items-center justify-between">
              <span className="text-xs font-mono text-zinc-400">Branch: main</span>
              <button
                onClick={() => setSelectedLogForModal(null)}
                className="px-3 py-1.5 text-xs font-medium bg-zinc-900 dark:bg-zinc-100 text-zinc-100 dark:text-zinc-900 rounded-md hover:opacity-90 transition-opacity"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {}
      <footer className="border-t border-zinc-200 dark:border-zinc-800 py-8 mt-16 bg-white dark:bg-zinc-950 text-xs text-zinc-500">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-zinc-900 dark:text-zinc-200">Soniva Audio Labs</span>
            <span>© 2026. All rights reserved.</span>
          </div>
          <div className="flex items-center gap-4">
            <a href="#" className="hover:underline">Privacy Policy</a>
            <a href="#" className="hover:underline">Terms of Service</a>
            <a href="#" className="hover:underline">Security</a>
          </div>
        </div>
      </footer>

    </div>
  );
}