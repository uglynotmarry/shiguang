import React, { useEffect, useRef, useState, useMemo } from "react"
import { motion } from "framer-motion"
import { User, Globe, MessageCircle, Sparkles, PlusCircle, LoaderCircle, CheckCircle2 } from "lucide-react"
import UnifiedPublishModal from "./UnifiedPublishModal"

const TOTAL_NODES = 35
const RADIUS = 320
const PERSPECTIVE = 800

const EMOTIONS = [
  { id: "blue",  color: "from-cyan-400 to-blue-600",  label: "忧郁", hex: "#7ce2f2", glow: "rgba(124,226,242,0.35)" },
  { id: "pink",  color: "from-pink-400 to-rose-600",  label: "爱意", hex: "#f4bfd2", glow: "rgba(244,191,210,0.35)" },
  { id: "purple",color: "from-violet-400 to-purple-600",label: "秘密", hex: "#c2a7f2", glow: "rgba(194,167,242,0.35)" },
  { id: "gold",  color: "from-amber-300 to-orange-500", label: "许愿", hex: "#f6d48b", glow: "rgba(246,212,139,0.35)" },
]

const TITLES = ["给未来的自己", "遗憾的告别", "偷偷喜欢你", "2025上岸", "树洞", "快乐小狗", "深夜碎碎念", "在星海边写信", "把月亮寄给你"]
const CONTENTS = [
  "这是一封寄往未来的信。保持热爱，奔赴山海。",
  "在霓虹下走了很远，想与你分享今晚的风。",
  "愿你在下一个秋天与喜欢的一切重逢。",
  "把不敢说的话写在这里，交给未来。",
  "夜航的光擦过云端，我在信里等你。",
]

const LETTERS = Array.from({ length: TOTAL_NODES }).map((_, i) => ({
  id: i,
  title: TITLES[i % TITLES.length],
  content: CONTENTS[i % CONTENTS.length],
  author: `Soul_${100 + i}`,
  isPrivate: Math.random() > 0.6,
  emotion: EMOTIONS[i % EMOTIONS.length],
}))

export default function SoulPlanet() {
  const [rotation, setRotation] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [isHovering, setIsHovering] = useState(false)
  const [publishOpen, setPublishOpen] = useState(false)
  const [publishState, setPublishState] = useState<'idle' | 'publishing' | 'done'>('idle')
  const lastMousePos = useRef({ x: 0, y: 0 })
  const autoRotateRef = useRef<number>()

  const points = useMemo(() => {
    const pts: { x: number; y: number; z: number; data: any }[] = []
    const phi = Math.PI * (3 - Math.sqrt(5))
    for (let i = 0; i < TOTAL_NODES; i++) {
      const y = 1 - (i / (TOTAL_NODES - 1)) * 2
      const radiusAtY = Math.sqrt(1 - y * y)
      const theta = phi * i
      pts.push({
        x: Math.cos(theta) * radiusAtY * RADIUS,
        y: y * RADIUS,
        z: Math.sin(theta) * radiusAtY * RADIUS,
        data: LETTERS[i],
      })
    }
    return pts
  }, [])

  useEffect(() => {
    const animate = () => {
      if (!isDragging && !isHovering) {
        setRotation(prev => ({ x: prev.x, y: prev.y + 0.002 }))
      }
      autoRotateRef.current = requestAnimationFrame(animate)
    }
    autoRotateRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(autoRotateRef.current!)
  }, [isDragging, isHovering])

  const handleStart = (e: any) => {
    setIsDragging(true)
    const clientX = e.touches ? e.touches[0].clientX : e.clientX
    const clientY = e.touches ? e.touches[0].clientY : e.clientY
    lastMousePos.current = { x: clientX, y: clientY }
  }

  const handleMove = (e: any) => {
    const clientX = e.touches ? e.touches[0].clientX : e.clientX
    const clientY = e.touches ? e.touches[0].clientY : e.clientY
    const deltaX = clientX - lastMousePos.current.x
    const deltaY = clientY - lastMousePos.current.y
    const factor = isDragging ? 0.005 : 0.002
    setRotation(prev => ({ x: prev.x - deltaY * factor, y: prev.y + deltaX * factor }))
    lastMousePos.current = { x: clientX, y: clientY }
  }

  const handleEnd = () => setIsDragging(false)

  

  return (
    <div className="flex flex-col h-screen w-full bg-[#050608] text-white overflow-hidden font-sans relative selection:bg-pink-500/30">
      <BackgroundEffects />
      <div
        className="relative h-[85%] w-full overflow-hidden flex items-center justify-center cursor-grab active:cursor-grabbing z-10"
        onMouseDown={handleStart} onMouseMove={handleMove} onMouseUp={handleEnd}
        onTouchStart={handleStart} onTouchMove={handleMove} onTouchEnd={handleEnd}
        style={{ perspective: `${PERSPECTIVE}px` }}
      >
        
        <div className="relative w-0 h-0" style={{ transformStyle: 'preserve-3d' }}>
          {points.map((point) => {
            const cosX = Math.cos(rotation.x)
            const sinX = Math.sin(rotation.x)
            const cosY = Math.cos(rotation.y)
            const sinY = Math.sin(rotation.y)

            let y = point.y * cosX - point.z * sinX
            let z = point.y * sinX + point.z * cosX
            let x = point.x * cosY - z * sinY
            z = point.x * sinY + z * cosY

            const scale = PERSPECTIVE / (PERSPECTIVE - z)
            const opacity = Math.max(0.1, Math.min(1, (z + RADIUS) / (1.5 * RADIUS)))
            const zIndex = Math.floor(z + RADIUS)
            const blur = z < -50 ? 'blur(2px)' : 'none'
            const openable = Math.abs(z) < 160

            
            const baseSize = 24 + (point.data.id % 20)
            const half = baseSize / 2
            const labelOpacity = Math.max(0.25, Math.min(0.9, (z + RADIUS) / (1.8 * RADIUS)))
            const labelWidth = Math.max(80, Math.min(140, baseSize * 2.4))
            const excerpt = point.data.content.length > 18 ? point.data.content.slice(0, 18) + '…' : point.data.content
            return (
              <motion.div
                key={point.data.id}
                className="absolute flex flex-col items-center justify-center will-change-transform"
                style={{ transform: `translate3d(${x}px, ${y}px, 0) scale(${scale})`, opacity, zIndex, filter: blur, left: -half, top: -half, width: baseSize, height: baseSize }}
                onMouseEnter={() => { if (openable) setIsHovering(true) }}
                onMouseLeave={() => setIsHovering(false)}
              >
                <div
                  className="relative w-full h-full rounded-full"
                  style={{
                    background: `radial-gradient(circle at 35% 30%, rgba(255,255,255,0.28), ${point.data.emotion.hex} 45%, ${point.data.emotion.hex} 85%)`,
                    border: "1px solid rgba(255,255,255,0.18)",
                    boxShadow: `0 0 10px ${point.data.emotion.glow}`,
                  }}
                />
                <div
                  className="absolute text-center text-white/80"
                  style={{ top: baseSize + 4, left: (baseSize / 2) - (labelWidth / 2), width: labelWidth, opacity: labelOpacity }}
                >
                  <div className="truncate text-[9px]">{point.data.title}</div>
                  <div className="truncate text-[8px] text-white/50 mt-0.5">{excerpt}</div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>

      

      

      <div className="h-[15%] min-h-[80px] w-full z-20 border-t border-white/10 flex items-center justify-around px-6 bg-black/40 backdrop-blur-md">
        <NavItem icon={<Globe size={24} />} label="星球" active />
        <div onClick={() => { setPublishOpen(true); setPublishState('idle') }}>
          <NavItem
            icon={publishState === 'publishing' ? <LoaderCircle size={24} className="animate-spin" /> : (publishState === 'done' ? <CheckCircle2 size={24} className="text-green-400" /> : <PlusCircle size={24} className="text-gray-400" />)}
            label="发布"
          />
        </div>
        <NavItem icon={<MessageCircle size={24} />} label="聊天" />
        <NavItem icon={<User size={24} />} label="自己" />
      </div>
      <UnifiedPublishModal open={publishOpen} onClose={() => { setPublishOpen(false); setPublishState('idle') }} onStateChange={setPublishState} />
    </div>
  )
}

 

function BackgroundEffects() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,#1a103c,#000000_60%)]" />
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-white"
          initial={{ x: Math.random() * window.innerWidth, y: Math.random() * window.innerHeight, opacity: 0, scale: 0 }}
          animate={{ y: [null, Math.random() * -100], opacity: [0, 0.4, 0], scale: [0, Math.random() * 2 + 1, 0] }}
          transition={{ duration: Math.random() * 5 + 5, repeat: Infinity, ease: "linear", delay: Math.random() * 5 }}
          style={{ width: Math.random() * 3 + 1 + 'px', height: Math.random() * 3 + 1 + 'px', filter: 'blur(1px)', boxShadow: '0 0 10px rgba(255,255,255,0.5)' }}
        />
      ))}
    </div>
  )
}

function NavItem({ icon, label, active }: { icon: any, label: string, active?: boolean }) {
  return (
    <div className={`flex flex-col items-center gap-1 cursor-pointer transition-all ${active ? 'text-white scale-110' : 'text-gray-500 hover:text-gray-300'}`}>
      <div className={`${active ? 'drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]' : ''}`}>{icon}</div>
      <span className="text-[10px] font-medium">{label}</span>
    </div>
  )
}
