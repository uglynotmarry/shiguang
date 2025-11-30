import { useState, useRef, useEffect } from "react"
import { X, CheckCircle, Mic, Type, Pause, Play } from "lucide-react"

export default function UnifiedPublishModal({ open, onClose, onStateChange }: { open: boolean; onClose: () => void; onStateChange?: (s: 'idle' | 'publishing' | 'done') => void }) {
  const [text, setText] = useState("")
  const [rich, setRich] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)
  const [done, setDone] = useState(false)
  const [mode, setMode] = useState<'menu' | 'text' | 'voice'>('menu')
  const [recording, setRecording] = useState(false)
  const [levels, setLevels] = useState<number[]>(Array.from({ length: 32 }, () => 0))
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const editorRef = useRef<HTMLDivElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const rafRef = useRef<number>()

  const validate = () => {
    const plain = rich ? (editorRef.current?.innerText || "").trim() : text.trim()
    return plain.length >= 1
  }

  async function postUnifiedPublish(payload: { textPlain?: string; textHTML?: string; audio?: Blob | null }) {
    await new Promise(r => setTimeout(r, 600))
    return { ok: true }
  }

  const handlePublishText = async () => {
    if (!validate()) return alert("请输入内容")
    setIsPublishing(true)
    onStateChange?.('publishing')
    const textPlain = rich ? (editorRef.current?.innerText || "") : text
    const textHTML = rich ? editorRef.current?.innerHTML || undefined : undefined
    const res = await postUnifiedPublish({ textPlain, textHTML, audio: null })
    setIsPublishing(false)
    setDone(res.ok)
    onStateChange?.('done')
    setTimeout(() => { setDone(false); onClose() }, 800)
  }

  const handlePublishVoice = async () => {
    if (!audioBlob) return alert("请先录制语音")
    setIsPublishing(true)
    onStateChange?.('publishing')
    const res = await postUnifiedPublish({ audio: audioBlob })
    setIsPublishing(false)
    setDone(res.ok)
    onStateChange?.('done')
    setTimeout(() => { setDone(false); onClose() }, 800)
  }

  useEffect(() => {
    if (mode !== 'voice') return
    let audioCtx: AudioContext | null = null
    let source: MediaStreamAudioSourceNode | null = null
    let stream: MediaStream | null = null
    const start = async () => {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)()
      source = audioCtx.createMediaStreamSource(stream)
      const analyser = audioCtx.createAnalyser()
      analyser.fftSize = 64
      analyserRef.current = analyser
      source.connect(analyser)
      const data = new Uint8Array(analyser.frequencyBinCount)
      const tick = () => {
        analyser.getByteFrequencyData(data)
        const arr = Array.from({ length: 32 }, (_, i) => data[i] / 255)
        setLevels(arr)
        rafRef.current = requestAnimationFrame(tick)
      }
      tick()
    }
    start()
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      analyserRef.current = null
      if (stream) stream.getTracks().forEach(t => t.stop())
    }
  }, [mode])

  const toggleRecord = async () => {
    if (!recording) {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const rec = new MediaRecorder(stream)
      const chunks: BlobPart[] = []
      rec.ondataavailable = e => chunks.push(e.data)
      rec.onstop = () => { setAudioBlob(new Blob(chunks, { type: 'audio/webm' })) }
      mediaRecorderRef.current = rec
      rec.start()
      setRecording(true)
    } else {
      mediaRecorderRef.current?.stop()
      setRecording(false)
    }
  }

  if (!open) return null
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-[560px] max-w-[92vw] ghibli-paper rounded-3xl p-5 border border-white/20">
        <div className="flex items-center justify-between mb-3">
          <div className="ghibli-text text-xl">发布</div>
          <button className="text-white/70 hover:text-white" onClick={onClose}><X /></button>
        </div>
        {mode === 'menu' && (
          <div className="grid grid-cols-2 gap-3">
            <button className="ghibli-paper rounded-2xl p-4 flex items-center justify-center gap-2 hover:bg-white/15" onClick={() => setMode('text')}>
              <Type /> 文字发布
            </button>
            <button className="ghibli-paper rounded-2xl p-4 flex items-center justify-center gap-2 hover:bg-white/15" onClick={() => setMode('voice')}>
              <Mic /> 语音发布
            </button>
          </div>
        )}
        {mode === 'text' && (
          <div>
            <div className="flex items-center gap-3 mb-3">
              <label className="text-sm"><input type="checkbox" checked={rich} onChange={() => setRich(v => !v)} /> 使用富文本</label>
            </div>
            {rich ? (
              <div ref={editorRef} className="readable-pill" contentEditable suppressContentEditableWarning style={{ minHeight: 140 }} />
            ) : (
              <textarea className="readable-pill w-full" style={{ minHeight: 140 }} placeholder="请输入文本内容…" value={text} onChange={e => setText(e.target.value)} />
            )}
            <div className="mt-4 flex justify-end gap-2">
              <button className="px-4 py-2 rounded-xl bg-white/15 ring-1 ring-white/30 hover:bg-white/25" onClick={handlePublishText} disabled={isPublishing}>
                {isPublishing ? '发布中…' : '发布'}
              </button>
              {done && <span className="text-green-400 flex items-center gap-1"><CheckCircle size={18}/> 完成</span>}
            </div>
          </div>
        )}
        {mode === 'voice' && (
          <div>
            <div className="w-full h-24 ghibli-paper rounded-xl px-3 py-2 flex items-end gap-1">
              {levels.map((lv, i) => (
                <div key={i} className="bg-white/80" style={{ width: 6, height: 12 + lv * 36, borderRadius: 3, boxShadow: '0 0 6px rgba(255,255,255,.35)' }} />
              ))}
            </div>
            <div className="mt-3 flex items-center gap-2">
              <button className="px-4 py-2 rounded-xl bg-white/15 ring-1 ring-white/30 hover:bg-white/25 flex items-center gap-2" onClick={toggleRecord}>
                {recording ? (<><Pause size={16}/> 停止录制</>) : (<><Play size={16}/> 开始录制</>)}
              </button>
              <button className="px-4 py-2 rounded-xl bg-white/15 ring-1 ring-white/30 hover:bg-white/25" onClick={() => setMode('menu')}>返回</button>
              <div className="ml-auto" />
              <button className="px-4 py-2 rounded-xl bg-white/15 ring-1 ring-white/30 hover:bg-white/25" onClick={handlePublishVoice} disabled={isPublishing || !audioBlob}>
                {isPublishing ? '发布中…' : '发布'}
              </button>
              {done && <span className="text-green-400 flex items-center gap-1"><CheckCircle size={18}/> 完成</span>}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
