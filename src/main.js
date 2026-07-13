import './style.css'
import { loadTrack, mountLanguageShell } from './track.js'

async function boot() {
  const track = loadTrack()
  const app = document.querySelector('#app')
  const root = mountLanguageShell(app, track)

  if (track === 'english') {
    const { bootEnglish } = await import('./english/practice.js')
    bootEnglish(root)
    return
  }
  if (track === 'japanese') {
    const { bootJapanese } = await import('./japanese/practice.js')
    bootJapanese(root)
    return
  }
  const { bootShuangpin } = await import('./shuangpinPractice.js')
  bootShuangpin(root)
}

boot()
