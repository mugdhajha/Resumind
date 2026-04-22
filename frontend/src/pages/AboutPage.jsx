import { motion } from 'framer-motion'

export default function AboutPage() {
  const fadeUp = (delay = 0) => ({
    initial: { opacity: 0, y: 14 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.55, delay, ease: [0.16, 1, 0.3, 1] },
  })

  return (
    <div className="flex-1 px-6 py-10 md:px-16 flex items-center justify-center">
      <div className="w-full max-w-3xl">
        <motion.div
          {...fadeUp(0.05)}
          className="glass rounded-2xl p-7"
        >
          <motion.h1
            {...fadeUp(0.1)}
            className="text-3xl md:text-4xl font-extrabold grad-main"
          >
            About Resumind
          </motion.h1>

          <motion.p {...fadeUp(0.18)} className="text-sm md:text-base text-slate-100/80 mt-2 leading-relaxed">
            Resumind started as a very practical problem: "I have a resume, I have a job description — what should I fix first?"
            It helps you quickly see how well your resume matches a role, what skills you already cover, and what’s missing —
            without turning it into a complicated process.
          </motion.p>

          <div className="mt-7 grid gap-5">
            <motion.section {...fadeUp(0.24)} className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <h2 className="text-xl font-extrabold text-white">What it can do</h2>
              <p className="mt-3 text-sm md:text-base text-slate-100/80 leading-relaxed">
                It’s built around a simple flow: upload your resume, paste the job description, and get a clear match score.
                Then it breaks that into what’s already working (matching skills) and what to improve next (missing skills).
                Your results are saved to History so you can compare attempts over time, and the Career Options view helps you
                explore roles you’re already close to.
              </p>
            </motion.section>

            <motion.section {...fadeUp(0.3)} className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <h2 className="text-xl font-extrabold text-white">Difficulties I faced</h2>
              <p className="mt-3 text-sm md:text-base text-slate-100/80 leading-relaxed">
                Resumes are messy in real life — different formats, strange PDFs, random headings — so extracting useful text
                without breaking was a real challenge. Skill extraction was another: too strict and you miss important
                keywords; too loose and you get noisy, misleading matches. I also spent time keeping the scoring understandable
                and making the frontend ↔ backend experience feel stable (auth, API errors, and the small stuff that usually
                ruins demos).
              </p>
            </motion.section>

            <motion.section {...fadeUp(0.36)} className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <h2 className="text-xl font-extrabold text-white">A small note</h2>
              <p className="mt-3 text-sm md:text-base text-slate-100/80 leading-relaxed">
                Looks like we have all grown up, here to check whether our cv matches the job requirement? Oh bro come on isn’t it like 2013 and we’re just waiting for holidays to just chill at home and do nothing?...
                <br />
                Making this made me realise it was so much better to just.. This just has so many sentences to attach to..
                <br />
                OK OK done being nostalgic..
                <br />
                So quick recap of the journey of making this, This project was made during the end semester examination cause ya this thing is so much better than my course work..
                Not that I am demeaning my course work but this is much easier than taking out stress in some random machining component.
                <br />
                So ya this is made with love, my heart and soul.., and coffee..
                <br />
                – Mugdha Jha
              </p>
            </motion.section>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
