# Language Typing Practice

Practice app for Chinese 双拼, English, and Japanese typing.

**Live:** https://language-typing-practice.vercel.app

## Run locally

```bash
cd "/Users/adelaidewang/Documents/Vibe Coding Prototypes/xiaohe-shuangpin"
npm install
npm run dev
```

Open **http://127.0.0.1:5179/**

## Languages

Switch from the left panel:

- **双拼** — Xiaohe / 自然码 / 搜狗 Chinese typing
- **English** — QWERTY letter practice
- **日本語** — Romaji input with hiragana hints

## Modes (per language)

Character/word, sentence, and article practice, plus mistakes log and settings. Preferences are stored separately per language.

## Timer

Pick a session length. Settings control auto vs manual start and auto-advance after a passage.

## Shortcuts

| Key | Action |
|-----|--------|
| Letter keys | Type codes / letters / romaji |
| `Space` | Speak (双拼) or type space where required |
| `Esc` | Clear current input / error flash |
| `⌥R` | Redo current passage (on completion) |
| `⌥N` | Next passage (on completion) |
| `Backspace` | Delete last typed key in buffer |
