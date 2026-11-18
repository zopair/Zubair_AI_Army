# Portfolio Video Production

This branch contains the production brief and narration manifest for the English-language portfolio film.

## Output
- Title: Five Projects. One Technology Vision.
- Brand: AL-ZUBAIR TEC INVESTMENT
- GitHub: https://github.com/zopair
- Format: MP4, H.264 video + AAC audio, 1280x720, 25 fps
- Runtime: approximately 2 minutes 5 seconds
- Language: English

## Open-source production toolchain
- FFmpeg: https://github.com/FFmpeg/FFmpeg — video assembly, encoding, audio mixing.
- Pillow: https://github.com/python-pillow/Pillow — generated slide artwork.
- eSpeak NG: https://github.com/espeak-ng/espeak-ng — English narration synthesis.
- Python standard library — orchestration and asset generation.

The rendered file is delivered separately from this source branch. No paid AI video-generation service is required.

## Accuracy policy
This showcase summarizes public repository descriptions. It does not claim independently verified production deployment, customer results, certifications, revenue, or performance metrics. CLT Platform and CLT Core are presented together because their repositories describe an orchestration/foundation relationship; undocumented implementation details are intentionally omitted.

## Project references
1. Zubair AI Army — https://github.com/zopair/Zubair_AI_Army
2. CLT Sovereign OS — https://github.com/zopair/Zubair-Hunter-AI
3. Sovereign AI Arsenal — https://github.com/zopair/Sovereign-AI-Arsenal
4. SINC-OS — https://github.com/zopair/SINC-OS
5. CLT Platform & Core — https://github.com/zopair/CLT-Platform and https://github.com/zopair/CLT-Core-Monorepo

## Reproduction
Install FFmpeg, Python 3, Pillow, and eSpeak NG. Use the scene/narration manifest in `portfolio_manifest.json` as the source of truth. Render still scenes, synthesize the narration, encode each scene to H.264, concatenate the scenes, and mix a low-level generated ambient bed under the voice track.

All generated visual artwork and ambient audio are original for this video.