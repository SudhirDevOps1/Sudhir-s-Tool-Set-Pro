import { useState } from 'react';
import { Image, Copy, Download, Settings, Zap, BookOpen, ChevronRight, ChevronDown, X, FileImage, Video, Wand2, Terminal, FolderOpen, CheckCircle2, ArrowRight, Sparkles, ImageDown, Eye } from 'lucide-react';
import { Section } from '../Section';
import { Card } from '../Card';
import { Button } from '../Button';
import { CodeBlock } from '../CodeBlock';

interface Props {
  visible: boolean;
  onCopy: (text: string) => void;
  showToast: (msg: string, isError?: boolean) => void;
}

type GuideStep = {
  step: number;
  title: string;
  description: string;
  command?: string;
  icon: React.ReactNode;
  tip?: string;
};

const guideSteps: GuideStep[] = [
  {
    step: 1,
    title: 'yt-dlp Install Karo',
    description: 'Sabse pehle yt-dlp install hona chahiye. Windows pe WinGet ya pip se install karo.',
    command: 'pip install yt-dlp\n# ya\nwinget install yt-dlp',
    icon: <Terminal className="w-5 h-5" />,
    tip: 'yt-dlp -U se update bhi kar sakte ho agar pehle se installed hai.',
  },
  {
    step: 2,
    title: 'FFmpeg Install Karo',
    description: 'Video + Audio merge karne ke liye FFmpeg zaroori hai. Iske bina video mein audio nahi aayega.',
    command: 'winget install ffmpeg\n# Verify:\nffmpeg -version',
    icon: <Settings className="w-5 h-5" />,
    tip: 'FFmpeg ko PATH mein add karna mat bhoolna! set PATH=E:\\ffmpeg\\bin;%PATH%',
  },
  {
    step: 3,
    title: 'Video URL Copy Karo',
    description: 'YouTube se video ka URL copy karo. Short URL (youtu.be) ya full URL (youtube.com/watch?v=) dono chalega.',
    command: 'https://youtu.be/OsDgpJNIVH4?si=ifDq9pF1Xl2hP5qG',
    icon: <Copy className="w-5 h-5" />,
    tip: 'Playlist URL bhi de sakte ho — saari videos ek saath download hongi!',
  },
  {
    step: 4,
    title: 'Thumbnail ke Saath Video Download',
    description: 'Ye command video ko best quality mein download karega, thumbnail embed karega aur alag file mein bhi save karega.',
    command: 'yt-dlp -f "bestvideo[height<=1080]+bestaudio/best" ^\n  --merge-output-format mp4 ^\n  --embed-thumbnail ^\n  --write-thumbnail ^\n  --add-metadata ^\n  -o "D:\\Videos\\%(title)s.%(ext)s" ^\n  "https://youtu.be/OsDgpJNIVH4?si=ifDq9pF1Xl2hP5qG"',
    icon: <Video className="w-5 h-5" />,
    tip: '--embed-thumbnail video file ke andar thumbnail daal deta hai, --write-thumbnail alag JPG/WebP file save karta hai.',
  },
  {
    step: 5,
    title: 'Sirf Thumbnail Download (Video Nahi)',
    description: 'Agar sirf thumbnail chahiye aur video nahi, to --skip-download use karo. Ye fastest method hai.',
    command: 'yt-dlp --write-thumbnail --skip-download -o "D:\\Videos\\%(title)s.%(ext)s" "URL"',
    icon: <ImageDown className="w-5 h-5" />,
    tip: 'Thumbnail usually WebP ya JPG format mein aati hai. --convert-thumbnails jpg se JPG mein convert kar sakte ho.',
  },
  {
    step: 6,
    title: 'Output Folder Check Karo',
    description: 'Download hone ke baad D:\\Videos\\ folder mein check karo. Video file (.mp4) aur thumbnail file (.webp/.jpg) dono milenge.',
    command: 'dir "D:\\Videos\\"',
    icon: <FolderOpen className="w-5 h-5" />,
    tip: 'Agar folder exist nahi karta to pehle bana lo: mkdir "D:\\Videos"',
  },
];

export function ThumbnailDownloader({ visible, onCopy, showToast }: Props) {
  const [url, setUrl] = useState('https://youtu.be/OsDgpJNIVH4?si=ifDq9pF1Xl2hP5qG');
  const [outputPath, setOutputPath] = useState('D:\\Videos\\');
  const [quality, setQuality] = useState('1080');
  const [embedThumbnail, setEmbedThumbnail] = useState(true);
  const [writeThumbnail, setWriteThumbnail] = useState(true);
  const [addMetadata, setAddMetadata] = useState(true);
  const [format, setFormat] = useState('mp4');
  const [convertThumbnail, setConvertThumbnail] = useState(false);
  const [thumbnailFormat, setThumbnailFormat] = useState('jpg');

  // In-app guide state
  const [showGuide, setShowGuide] = useState(false);
  const [activeGuideStep, setActiveGuideStep] = useState(0);

  // Quick presets expanded
  const [presetsExpanded, setPresetsExpanded] = useState(false);

  const generateVideoCommand = () => {
    const qualityFilter = quality === '1080' ? '[height<=1080]' : quality === '720' ? '[height<=720]' : quality === '480' ? '[height<=480]' : '';
    let cmd = 'yt-dlp';
    cmd += ` -f "bestvideo${qualityFilter}+bestaudio/best"`;
    cmd += ` --merge-output-format ${format}`;
    if (embedThumbnail) cmd += ' --embed-thumbnail';
    if (writeThumbnail) cmd += ' --write-thumbnail';
    if (addMetadata) cmd += ' --add-metadata';
    if (convertThumbnail) cmd += ` --convert-thumbnails ${thumbnailFormat}`;
    cmd += ` -o "${outputPath}%(title)s.%(ext)s"`;
    cmd += ` "${url || 'URL_LINK'}"`;
    return cmd;
  };

  const generateThumbnailOnlyCommand = () => {
    let cmd = `yt-dlp --write-thumbnail --skip-download`;
    if (convertThumbnail) cmd += ` --convert-thumbnails ${thumbnailFormat}`;
    cmd += ` -o "${outputPath}%(title)s.%(ext)s" "${url || 'URL_LINK'}"`;
    return cmd;
  };

  const videoCommand = generateVideoCommand();
  const thumbnailOnlyCommand = generateThumbnailOnlyCommand();

  const selectStyle: React.CSSProperties = {
    background: 'var(--bg)',
    border: '1px solid rgba(255,255,255,0.1)',
    color: 'var(--text)',
    padding: '10px',
    borderRadius: '8px',
    outline: 'none',
    width: '100%',
  };

  const inputStyle: React.CSSProperties = { ...selectStyle };

  const checkboxStyle: React.CSSProperties = {
    accentColor: 'var(--accent)',
    width: '18px',
    height: '18px',
    marginRight: '8px',
    cursor: 'pointer',
  };

  return (
    <Section id="thumbnail-downloader" visible={visible}>
      <h2
        className="flex items-center gap-3 text-3xl font-bold pb-2.5"
        style={{ color: 'var(--accent)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}
      >
        <Image className="w-7 h-7" /> Thumbnail Downloader & Media Grabber
      </h2>

      {/* Guide Button - Prominent */}
      <div className="mt-4 mb-6">
        <button
          onClick={() => { setShowGuide(true); setActiveGuideStep(0); }}
          className="w-full py-4 px-6 rounded-2xl cursor-pointer font-bold flex items-center justify-between gap-3 transition-all duration-300 text-base group"
          style={{
            background: 'linear-gradient(135deg, rgba(56,189,248,0.15), rgba(240,80,50,0.1))',
            border: '1px solid var(--accent)',
            color: 'var(--accent)',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'linear-gradient(135deg, rgba(56,189,248,0.25), rgba(240,80,50,0.18))';
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 8px 30px rgba(56,189,248,0.2)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'linear-gradient(135deg, rgba(56,189,248,0.15), rgba(240,80,50,0.1))';
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          <div className="flex items-center gap-3">
            <BookOpen className="w-6 h-6" />
            <div className="text-left">
              <div className="text-lg">📖 Complete Thumbnail Guide — Step by Step</div>
              <div className="text-xs font-normal mt-0.5" style={{ color: 'var(--text-dim)' }}>
                App ke andar khulega • Koi naya tab nahi • Hindi + English instructions
              </div>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 transition-transform duration-200" />
        </button>
      </div>

      {/* ====== IN-APP GUIDE MODAL ====== */}
      {showGuide && (
        <div
          className="fixed inset-0 flex items-center justify-center z-[999]"
          style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}
          onClick={() => setShowGuide(false)}
        >
          <div
            className="w-[95%] max-w-[720px] max-h-[90vh] overflow-y-auto rounded-3xl relative"
            style={{ background: 'var(--bg)', border: '2px solid var(--accent)', boxShadow: '0 25px 60px rgba(0,0,0,0.6)' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Guide Header */}
            <div
              className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 rounded-t-3xl"
              style={{
                background: 'linear-gradient(135deg, rgba(56,189,248,0.2), rgba(240,80,50,0.1))',
                borderBottom: '1px solid rgba(255,255,255,0.1)',
                backdropFilter: 'blur(10px)',
              }}
            >
              <div className="flex items-center gap-3">
                <Sparkles className="w-6 h-6" style={{ color: 'var(--accent)' }} />
                <div>
                  <h3 className="m-0 text-xl font-bold" style={{ color: 'var(--accent)' }}>
                    Thumbnail Download Guide
                  </h3>
                  <p className="m-0 text-xs" style={{ color: 'var(--text-dim)' }}>
                    Step {activeGuideStep + 1} of {guideSteps.length}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowGuide(false)}
                className="w-9 h-9 flex items-center justify-center rounded-full cursor-pointer transition-all duration-200"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-dim)' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(239,68,68,0.2)'; e.currentTarget.style.color = 'var(--error)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = 'var(--text-dim)'; }}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Step Progress Bar */}
            <div className="px-6 pt-4">
              <div className="flex gap-1.5">
                {guideSteps.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveGuideStep(i)}
                    className="flex-1 h-2 rounded-full cursor-pointer transition-all duration-300"
                    style={{
                      background: i <= activeGuideStep ? 'var(--accent)' : 'rgba(255,255,255,0.08)',
                      border: 'none',
                      boxShadow: i === activeGuideStep ? '0 0 10px var(--accent)' : 'none',
                    }}
                    title={`Step ${i + 1}: ${guideSteps[i].title}`}
                  />
                ))}
              </div>
            </div>

            {/* Step Tabs */}
            <div className="px-6 pt-4 flex gap-2 flex-wrap">
              {guideSteps.map((step, i) => (
                <button
                  key={i}
                  onClick={() => setActiveGuideStep(i)}
                  className="px-3 py-1.5 rounded-full text-xs font-bold cursor-pointer transition-all duration-200 flex items-center gap-1.5"
                  style={{
                    background: i === activeGuideStep ? 'var(--accent)' : 'rgba(255,255,255,0.04)',
                    color: i === activeGuideStep ? 'var(--bg)' : 'var(--text-dim)',
                    border: i === activeGuideStep ? '1px solid var(--accent)' : '1px solid rgba(255,255,255,0.08)',
                  }}
                >
                  {i < activeGuideStep ? <CheckCircle2 className="w-3 h-3" /> : null}
                  Step {step.step}
                </button>
              ))}
            </div>

            {/* Active Step Content */}
            <div className="px-6 py-5">
              {(() => {
                const step = guideSteps[activeGuideStep];
                return (
                  <div
                    className="rounded-2xl p-5"
                    style={{ background: 'var(--card)', border: '1px solid rgba(255,255,255,0.08)' }}
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{ background: 'rgba(56,189,248,0.15)', color: 'var(--accent)' }}
                      >
                        {step.icon}
                      </div>
                      <div>
                        <h4 className="m-0 text-lg font-bold">{step.title}</h4>
                        <span className="text-xs" style={{ color: 'var(--text-dim)' }}>Step {step.step}</span>
                      </div>
                    </div>

                    <p className="text-sm mb-4" style={{ color: 'var(--text-dim)', lineHeight: 1.7 }}>
                      {step.description}
                    </p>

                    {step.command && (
                      <div className="relative">
                        <div
                          className="rounded-xl overflow-hidden"
                          style={{ background: '#000', border: '1px solid rgba(255,255,255,0.1)' }}
                        >
                          <div
                            className="px-4 py-2 flex justify-between items-center text-xs"
                            style={{ background: '#1f2937', color: 'var(--text-dim)' }}
                          >
                            <span>📋 Command</span>
                            <button
                              onClick={() => { onCopy(step.command!); showToast('Command copied!'); }}
                              className="px-2 py-1 rounded-md text-xs cursor-pointer transition-all duration-200 flex items-center gap-1"
                              style={{ background: 'rgba(56,189,248,0.15)', color: 'var(--accent)', border: '1px solid var(--accent)' }}
                              onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--accent)'; e.currentTarget.style.color = 'var(--bg)'; }}
                              onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(56,189,248,0.15)'; e.currentTarget.style.color = 'var(--accent)'; }}
                            >
                              <Copy className="w-3 h-3" /> Copy
                            </button>
                          </div>
                          <pre
                            className="m-0 p-4 overflow-x-auto whitespace-pre-wrap break-words font-mono text-sm"
                            style={{ color: '#10b981' }}
                          >
                            {step.command}
                          </pre>
                        </div>
                      </div>
                    )}

                    {step.tip && (
                      <div
                        className="mt-4 p-3 rounded-xl flex items-start gap-2 text-xs"
                        style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)', color: 'var(--warn)' }}
                      >
                        <span className="text-base">💡</span>
                        <span style={{ lineHeight: 1.6 }}>{step.tip}</span>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>

            {/* Navigation */}
            <div className="px-6 pb-5 flex justify-between items-center gap-3">
              <button
                onClick={() => setActiveGuideStep((p) => Math.max(0, p - 1))}
                disabled={activeGuideStep === 0}
                className="px-4 py-2.5 rounded-xl cursor-pointer font-bold flex items-center gap-2 transition-all duration-200 text-sm disabled:opacity-30 disabled:cursor-not-allowed"
                style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text)', border: '1px solid rgba(255,255,255,0.1)' }}
              >
                ← Previous
              </button>

              <span className="text-xs" style={{ color: 'var(--text-dim)' }}>
                {activeGuideStep + 1} / {guideSteps.length}
              </span>

              {activeGuideStep < guideSteps.length - 1 ? (
                <button
                  onClick={() => setActiveGuideStep((p) => Math.min(guideSteps.length - 1, p + 1))}
                  className="px-4 py-2.5 rounded-xl cursor-pointer font-bold flex items-center gap-2 transition-all duration-200 text-sm"
                  style={{ background: 'var(--accent)', color: 'var(--bg)', border: '1px solid var(--accent)' }}
                >
                  Next <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={() => setShowGuide(false)}
                  className="px-4 py-2.5 rounded-xl cursor-pointer font-bold flex items-center gap-2 transition-all duration-200 text-sm"
                  style={{ background: 'var(--success)', color: 'var(--bg)', border: '1px solid var(--success)' }}
                >
                  <CheckCircle2 className="w-4 h-4" /> Done!
                </button>
              )}
            </div>

            {/* All Steps Quick View */}
            <div
              className="px-6 pb-6"
            >
              <button
                onClick={() => setPresetsExpanded(!presetsExpanded)}
                className="w-full px-4 py-3 rounded-xl cursor-pointer font-bold flex items-center justify-between text-sm transition-all duration-200"
                style={{ background: 'rgba(255,255,255,0.03)', color: 'var(--text-dim)', border: '1px solid rgba(255,255,255,0.06)' }}
              >
                <span className="flex items-center gap-2"><Eye className="w-4 h-4" /> Saare Steps Ek Nazar Mein</span>
                <ChevronDown className="w-4 h-4 transition-transform duration-200" style={{ transform: presetsExpanded ? 'rotate(180deg)' : 'rotate(0)' }} />
              </button>
              {presetsExpanded && (
                <div className="mt-3 space-y-2">
                  {guideSteps.map((step, i) => (
                    <button
                      key={i}
                      onClick={() => { setActiveGuideStep(i); setPresetsExpanded(false); }}
                      className="w-full text-left px-4 py-3 rounded-xl cursor-pointer flex items-center gap-3 transition-all duration-200 text-sm"
                      style={{
                        background: i === activeGuideStep ? 'rgba(56,189,248,0.1)' : 'rgba(255,255,255,0.02)',
                        border: i === activeGuideStep ? '1px solid var(--accent)' : '1px solid rgba(255,255,255,0.04)',
                        color: 'var(--text)',
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(56,189,248,0.08)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = i === activeGuideStep ? 'rgba(56,189,248,0.1)' : 'rgba(255,255,255,0.02)'; }}
                    >
                      <span
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
                        style={{
                          background: i <= activeGuideStep ? 'var(--accent)' : 'rgba(255,255,255,0.06)',
                          color: i <= activeGuideStep ? 'var(--bg)' : 'var(--text-dim)',
                        }}
                      >
                        {i < activeGuideStep ? '✓' : step.step}
                      </span>
                      <div>
                        <div className="font-bold">{step.title}</div>
                        <div className="text-xs truncate max-w-[400px]" style={{ color: 'var(--text-dim)' }}>{step.description}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ====== MAIN BUILDER CARD ====== */}
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <Wand2 className="w-5 h-5" style={{ color: 'var(--accent)' }} />
          <h3 className="m-0 text-lg font-bold" style={{ color: 'var(--accent)' }}>Smart Thumbnail Command Builder</h3>
        </div>
        <p className="text-sm mb-4" style={{ color: 'var(--text-dim)' }}>
          Video ke saath thumbnail download karo ya sirf thumbnail extract karo. Sab kuch yahi set karo!
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold" style={{ color: 'var(--text-dim)' }}>🔗 Video URL</label>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://youtube.com/watch?v=..."
              style={inputStyle}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold" style={{ color: 'var(--text-dim)' }}>📁 Output Path</label>
            <input
              type="text"
              value={outputPath}
              onChange={(e) => setOutputPath(e.target.value)}
              placeholder="D:\Videos\"
              style={inputStyle}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold" style={{ color: 'var(--text-dim)' }}>📺 Video Quality</label>
            <select value={quality} onChange={(e) => setQuality(e.target.value)} style={selectStyle}>
              <option value="best">Best Available</option>
              <option value="1080">1080p HD</option>
              <option value="720">720p</option>
              <option value="480">480p</option>
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold" style={{ color: 'var(--text-dim)' }}>📦 Output Format</label>
            <select value={format} onChange={(e) => setFormat(e.target.value)} style={selectStyle}>
              <option value="mp4">MP4 (Universal)</option>
              <option value="mkv">MKV (Lossless)</option>
              <option value="webm">WebM (Web)</option>
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-sm font-bold" style={{ color: 'var(--text-dim)' }}>🖼️ Thumbnail Format</label>
            <select value={thumbnailFormat} onChange={(e) => setThumbnailFormat(e.target.value)} style={selectStyle}>
              <option value="jpg">JPG (Universal)</option>
              <option value="png">PNG (High Quality)</option>
              <option value="webp">WebP (Default)</option>
            </select>
          </div>
        </div>

        {/* Options Checkboxes */}
        <div
          className="p-4 rounded-xl mb-5"
          style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
        >
          <h4 className="text-sm font-bold mb-3 flex items-center gap-2" style={{ color: 'var(--accent)' }}>
            <Settings className="w-4 h-4" /> Options
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <label className="flex items-center cursor-pointer group">
              <input type="checkbox" checked={embedThumbnail} onChange={(e) => setEmbedThumbnail(e.target.checked)} style={checkboxStyle} />
              <span className="text-sm">🎯 Embed thumbnail in video file</span>
            </label>
            <label className="flex items-center cursor-pointer group">
              <input type="checkbox" checked={writeThumbnail} onChange={(e) => setWriteThumbnail(e.target.checked)} style={checkboxStyle} />
              <span className="text-sm">💾 Save thumbnail as separate file</span>
            </label>
            <label className="flex items-center cursor-pointer group">
              <input type="checkbox" checked={addMetadata} onChange={(e) => setAddMetadata(e.target.checked)} style={checkboxStyle} />
              <span className="text-sm">📝 Add metadata (title, artist)</span>
            </label>
            <label className="flex items-center cursor-pointer group">
              <input type="checkbox" checked={convertThumbnail} onChange={(e) => setConvertThumbnail(e.target.checked)} style={checkboxStyle} />
              <span className="text-sm">🔄 Convert thumbnail format</span>
            </label>
          </div>
        </div>

        {/* Video + Thumbnail Command */}
        <div
          className="p-4 rounded-xl mb-4"
          style={{ background: 'rgba(56,189,248,0.04)', border: '1px solid rgba(56,189,248,0.15)' }}
        >
          <div className="flex items-center gap-2 mb-2">
            <Video className="w-4 h-4" style={{ color: 'var(--accent)' }} />
            <span className="text-sm font-bold" style={{ color: 'var(--accent)' }}>Video + Thumbnail Command</span>
          </div>
          <CodeBlock title="Full Download Command">{videoCommand}</CodeBlock>
          <Button onClick={() => { onCopy(videoCommand); showToast('Video + Thumbnail command copied!'); }}>
            <Copy className="w-4 h-4" /> Copy Full Command
          </Button>
        </div>

        {/* Thumbnail Only Command */}
        <div
          className="p-4 rounded-xl"
          style={{ background: 'rgba(16,185,129,0.04)', border: '1px solid rgba(16,185,129,0.15)' }}
        >
          <div className="flex items-center gap-2 mb-2">
            <FileImage className="w-4 h-4" style={{ color: 'var(--success)' }} />
            <span className="text-sm font-bold" style={{ color: 'var(--success)' }}>🖼️ Thumbnail Only (No Video Download)</span>
          </div>
          <CodeBlock title="Thumbnail Only Command">{thumbnailOnlyCommand}</CodeBlock>
          <Button variant="success" onClick={() => { onCopy(thumbnailOnlyCommand); showToast('Thumbnail-only command copied!'); }}>
            <ImageDown className="w-4 h-4" /> Copy Thumbnail Only
          </Button>
        </div>
      </Card>

      {/* Quick Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-5">
        <Card className="!mb-0">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-5 h-5" style={{ color: 'var(--warn)' }} />
            <h4 className="m-0 text-sm font-bold" style={{ color: 'var(--warn)' }}>Exact Preset</h4>
          </div>
          <p className="text-xs mb-3" style={{ color: 'var(--text-dim)' }}>Original example command load karo</p>
          <Button
            variant="ghost"
            className="w-full justify-center"
            onClick={() => {
              setUrl('https://youtu.be/OsDgpJNIVH4?si=ifDq9pF1Xl2hP5qG');
              setQuality('1080');
              setFormat('mp4');
              setEmbedThumbnail(true);
              setWriteThumbnail(true);
              setAddMetadata(true);
              setOutputPath('D:\\Videos\\');
              showToast('Exact preset applied!');
            }}
          >
            <Zap className="w-4 h-4" /> Apply Preset
          </Button>
        </Card>

        <Card className="!mb-0">
          <div className="flex items-center gap-2 mb-2">
            <Download className="w-5 h-5" style={{ color: 'var(--accent)' }} />
            <h4 className="m-0 text-sm font-bold" style={{ color: 'var(--accent)' }}>Load Example URL</h4>
          </div>
          <p className="text-xs mb-3" style={{ color: 'var(--text-dim)' }}>Test URL se try karo</p>
          <Button
            variant="ghost"
            className="w-full justify-center"
            onClick={() => {
              setUrl('https://youtu.be/OsDgpJNIVH4?si=ifDq9pF1Xl2hP5qG');
              showToast('Example URL loaded!');
            }}
          >
            <Download className="w-4 h-4" /> Load URL
          </Button>
        </Card>

        <Card className="!mb-0">
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className="w-5 h-5" style={{ color: 'var(--success)' }} />
            <h4 className="m-0 text-sm font-bold" style={{ color: 'var(--success)' }}>Open Guide</h4>
          </div>
          <p className="text-xs mb-3" style={{ color: 'var(--text-dim)' }}>Step-by-step seekho</p>
          <Button
            variant="success"
            className="w-full justify-center"
            onClick={() => { setShowGuide(true); setActiveGuideStep(0); }}
          >
            <BookOpen className="w-4 h-4" /> View Guide
          </Button>
        </Card>
      </div>

      {/* Quick Presets */}
      <Card className="mt-5">
        <h4 className="text-lg font-bold mb-3 flex items-center gap-2" style={{ color: 'var(--accent)' }}>
          <Settings className="w-5 h-5" /> Ready-Made Commands (Copy & Use)
        </h4>
        <div className="space-y-4">
          <div
            className="p-4 rounded-xl"
            style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}
          >
            <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
              <h5 className="text-sm font-bold m-0 flex items-center gap-2" style={{ color: 'var(--accent)' }}>
                <Video className="w-4 h-4" /> Complete Media Download (Thumbnail Embedded)
              </h5>
              <Button
                variant="ghost"
                onClick={() => {
                  const cmd = `yt-dlp -f "bestvideo[height<=1080]+bestaudio/best" --merge-output-format mp4 --embed-thumbnail --write-thumbnail --add-metadata -o "D:\\Videos\\%(title)s.%(ext)s" "URL"`;
                  onCopy(cmd);
                  showToast('Complete command copied!');
                }}
              >
                <Copy className="w-3 h-3" /> Copy
              </Button>
            </div>
            <CodeBlock compact>
              {`yt-dlp -f "bestvideo[height<=1080]+bestaudio/best" --merge-output-format mp4 --embed-thumbnail --write-thumbnail --add-metadata -o "D:\\Videos\\%(title)s.%(ext)s" "URL"`}
            </CodeBlock>
          </div>

          <div
            className="p-4 rounded-xl"
            style={{ background: 'rgba(16,185,129,0.03)', border: '1px solid rgba(16,185,129,0.12)' }}
          >
            <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
              <h5 className="text-sm font-bold m-0 flex items-center gap-2" style={{ color: 'var(--success)' }}>
                <ImageDown className="w-4 h-4" /> Thumbnail Only (No Video)
              </h5>
              <Button
                variant="success"
                onClick={() => {
                  const cmd = `yt-dlp --write-thumbnail --skip-download -o "D:\\Videos\\%(title)s.%(ext)s" "URL"`;
                  onCopy(cmd);
                  showToast('Thumbnail-only command copied!');
                }}
              >
                <Copy className="w-3 h-3" /> Copy
              </Button>
            </div>
            <CodeBlock compact>
              {`yt-dlp --write-thumbnail --skip-download -o "D:\\Videos\\%(title)s.%(ext)s" "URL"`}
            </CodeBlock>
          </div>

          <div
            className="p-4 rounded-xl"
            style={{ background: 'rgba(251,191,36,0.03)', border: '1px solid rgba(251,191,36,0.12)' }}
          >
            <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
              <h5 className="text-sm font-bold m-0 flex items-center gap-2" style={{ color: 'var(--warn)' }}>
                <FileImage className="w-4 h-4" /> Thumbnail + Convert to JPG
              </h5>
              <Button
                variant="ghost"
                onClick={() => {
                  const cmd = `yt-dlp --write-thumbnail --skip-download --convert-thumbnails jpg -o "D:\\Videos\\%(title)s.%(ext)s" "URL"`;
                  onCopy(cmd);
                  showToast('JPG thumbnail command copied!');
                }}
              >
                <Copy className="w-3 h-3" /> Copy
              </Button>
            </div>
            <CodeBlock compact>
              {`yt-dlp --write-thumbnail --skip-download --convert-thumbnails jpg -o "D:\\Videos\\%(title)s.%(ext)s" "URL"`}
            </CodeBlock>
          </div>
        </div>
      </Card>

      {/* Pro Tips */}
      <Card className="mt-5">
        <h4 className="text-lg font-bold mb-3" style={{ color: 'var(--accent)' }}>💡 Thumbnail Pro Tips</h4>
        <ul className="space-y-3 text-sm pl-1" style={{ color: 'var(--text-dim)', listStyle: 'none' }}>
          <li className="flex items-start gap-2">
            <span className="text-base">🔍</span>
            <span><strong>Sizes dekhna:</strong> YouTube multiple sizes deta hai. <code>--list-thumbnails</code> se dekh sakte ho ki kaunse available hain.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-base">🔄</span>
            <span><strong>Format convert:</strong> Default mein WebP aata hai. <code>--convert-thumbnails jpg</code> se JPG mein convert karo.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-base">🎵</span>
            <span><strong>Audio + Thumbnail:</strong> Music files mein bhi thumbnail embed ho sakti hai — <code>--embed-thumbnail</code> MP3/M4A ke saath bhi kaam karta hai.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-base">📂</span>
            <span><strong>Batch download:</strong> Multiple videos ke liye URLs ko <code>urls.txt</code> file mein dalo aur <code>--batch-file urls.txt</code> use karo.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-base">⌨️</span>
            <span><strong>Windows CMD:</strong> Long commands ko <code>^</code> se break kar sakte ho multiple lines mein.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-base">🎯</span>
            <span><strong>Best thumbnail:</strong> <code>--write-all-thumbnails</code> se saari available thumbnails download ho jayengi.</span>
          </li>
        </ul>
      </Card>
    </Section>
  );
}
