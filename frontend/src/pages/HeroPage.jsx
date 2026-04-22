import { motion } from 'framer-motion'
import TextType from '../components/TextType.jsx'

// ── Main Hero Page ────────────────────────────────────────────────────────────
export default function HeroPage({ onStart }) {
  const fadeUp = (delay = 0) => ({
    initial: { opacity: 0, y: 22 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] },
  })

  const line1 = 'Your Resume.'
  const line2a = 'Analyzed.'
  const line2b = 'Upgraded.'
  const line2Full = 'Analyzed. Upgraded.'
  const line3 = 'Unstoppable.'
  const heroTypingSpeed = 95
  const heroGap = 250
  const heroSubGap = 160
  const delay2 = line1.length * heroTypingSpeed + heroGap
  const delay2b = delay2 + line2a.length * heroTypingSpeed + heroSubGap
  // Use the longer md+ variant length so line3 never starts early.
  const delay3 = delay2 + line2Full.length * heroTypingSpeed + heroGap

  return (
    <div
      className="relative w-full flex-1 overflow-hidden flex flex-col"
      style={{ background: 'transparent' }}
    >
      {/* Hero body */}
      <div className="relative z-10 flex flex-1 items-center justify-center text-center px-6 md:px-16 lg:px-20 py-16">
        <div className="w-full max-w-2xl">
          <motion.h1
            {...fadeUp(0.2)}
            className="text-5xl md:text-6xl font-extrabold leading-tight mb-6"
          >
            <TextType
              as="span"
              className="block"
              text={line1}
              typingSpeed={heroTypingSpeed}
              loop={false}
              showCursor={false}
              startOnVisible={true}
            />

            {/* md+ : single line "Analyzed. Upgraded." */}
            <TextType
              as="span"
              className="hidden md:block"
              text={line2Full}
              typingSpeed={heroTypingSpeed}
              initialDelay={delay2}
              loop={false}
              showCursor={false}
              startOnVisible={true}
              style={{ color: 'var(--a2)' }}
            />

            {/* <md : split into two typed lines */}
            <TextType
              as="span"
              className="block md:hidden"
              text={line2a}
              typingSpeed={heroTypingSpeed}
              initialDelay={delay2}
              loop={false}
              showCursor={false}
              startOnVisible={true}
              style={{ color: 'var(--a2)' }}
            />
            <TextType
              as="span"
              className="block md:hidden"
              text={line2b}
              typingSpeed={heroTypingSpeed}
              initialDelay={delay2b}
              loop={false}
              showCursor={false}
              startOnVisible={true}
              style={{ color: 'var(--a2)' }}
            />

            <TextType
              as="span"
              className="block"
              text={line3}
              typingSpeed={heroTypingSpeed}
              initialDelay={delay3}
              loop={false}
              showCursor={true}
              cursorCharacter="|"
              startOnVisible={true}
              style={{ color: 'var(--a3)' }}
            />
          </motion.h1>

          <motion.p {...fadeUp(0.8)} className="text-slate-100/90 text-base leading-relaxed mb-10 max-w-md mx-auto">
            Get recruiter-level insights, identify skill gaps, and unlock your dream career path with AI.
          </motion.p>

          <motion.div {...fadeUp(1.0)} className="flex flex-wrap gap-4 justify-center">
            <button
              onClick={onStart}
              className="button px-7 py-3.5 rounded-xl text-white font-bold text-sm flex items-center gap-2"
            >
              ✦ Analyze My Resume
            </button>
          </motion.div>

          <div className="mt-8" />
        </div>
      </div>
    </div>
  )
}
