import { Outlet } from 'react-router-dom'
import { PublicNav } from '@/components/navigation/PublicNav'

export function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAFAFA]">
      <PublicNav />
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="bg-[#1D3557] text-white py-12 pb-safe">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded-[6px] bg-white/20 flex items-center justify-center">
                  <span className="text-white font-bold text-xs">ML</span>
                </div>
                <span className="font-bold text-white">MotionLab</span>
              </div>
              <p className="text-sm text-white/60 leading-relaxed">Train with Understanding. Sports science for every athlete.</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-white mb-3">Product</p>
              <div className="flex flex-col gap-2">
                {['Sports', 'Learning Paths', 'AI Coach', 'Gym Finder'].map(l => (
                  <a key={l} href="#" className="text-sm text-white/60 hover:text-white transition-colors">{l}</a>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold text-white mb-3">Company</p>
              <div className="flex flex-col gap-2">
                {['About', 'Experts', 'Resources', 'Contact'].map(l => (
                  <a key={l} href="#" className="text-sm text-white/60 hover:text-white transition-colors">{l}</a>
                ))}
              </div>
            </div>
            <div>
              <p className="text-sm font-semibold text-white mb-3">Legal</p>
              <div className="flex flex-col gap-2">
                {['Privacy Policy', 'Terms of Service', 'Cookie Policy'].map(l => (
                  <a key={l} href="#" className="text-sm text-white/60 hover:text-white transition-colors">{l}</a>
                ))}
              </div>
            </div>
          </div>
          <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-white/40">© 2026 MotionLab. All rights reserved.</p>
            <p className="text-xs text-white/30">Not a medical device. Content is for educational purposes only.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
