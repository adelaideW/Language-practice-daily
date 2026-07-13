# 小鹤双拼练习

Local practice app for [Xiaohe Shuangpin](https://flypy.cc/) Chinese typing, inspired by [ulpb.app](https://ulpb.app/).

## Run locally

```bash
cd "/Users/adelaidewang/Documents/Vibe Coding Prototypes/xiaohe-shuangpin"
npm install
npm run dev
```

Open **http://127.0.0.1:5179/**

## Modes

- **单字练习** — random common characters (default)
- **句子练习** — short sentences; clean finish auto-loads the next while the timer runs
- **文章练习** — Tang poems; same auto-advance on a perfect pass
- **错字本** — recent mistakes + usually-wrong summary
- **设置** — smart practice, timer mode, shuangpin scheme (小鹤 / 自然码 / 搜狗), hints, etc.

Use ◀ ▶ on sentences/articles to revisit earlier passages or load a new one.

Your last mode and settings are saved in `localStorage`.

## Timer

Pick **1 / 3 / 5 / 10** minutes (or a custom value). In settings, choose **auto** (starts on first keystroke) or **manual** (requires 开始计时). When time is up, practice locks and a summary is shown.

During a timed sentence/article session, finishing a passage **with zero mistakes** automatically loads the next one (configurable in settings).

## Controls

| Key | Action |
|-----|--------|
| Letter keys | Type the 2-key Xiaohe code |
| `Space` | Speak current character |
| `Esc` | Clear current input |
| `Backspace` | Delete last key in buffer |
