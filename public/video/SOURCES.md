# Tripora Home video

- Asset: coastal-exploration.mp4
- Creator: Mikhail Nilov
- Original: https://www.pexels.com/video/drone-footage-of-a-coast-8349424/
- License: https://www.pexels.com/license/ (permits website use and modification)
- Retrieved: 2026-10-10
- Processing: first 12 seconds, 960×540, 24 fps, H.264 CRF 28, no audio stream, MP4 fast-start.
- Size: 271,452 bytes.
- Poster: ../img/travel/coastal-exploration-poster.jpg, extracted at 3 seconds, 20,552 bytes.

This is atmospheric imagery, not a representation of a particular listed package. Set HomeHeroBanner.videoEnabled to false in LayoutHome to restore the original cream hero. Reduced-motion and data-saving preferences use the static poster without requesting the video.

## Additional Home hero comparison options

All four clips are atmospheric backgrounds. No package-specific destination or availability claim is implied.
The Pexels license permits website use and modification: https://www.pexels.com/license/
No visible attribution is required. The unchanged Home overlay, crop and layout are used for every option.

### B — City / destination arrival

- Asset: city-travel.mp4
- Source: https://www.pexels.com/video/bridge-on-seine-in-paris-13556986/
- Creator: Jay (Pexels)
- Download: https://videos.pexels.com/video-files/13556986/13556986-hd_1280_720_24fps.mp4
- Downloaded rendition: 1280×720, 58.26s, 21,720,544 bytes. Original download is kept outside the repository.
- Processing: first 12s, 960×540, 24fps, H.264 CRF 26, audio removed, MP4 fast-start.
- Optimized: 1,076,833 bytes (~1.03MiB), 12.00s.
- Poster: ../img/travel/city-travel-poster.jpg, frame at 3s, 92,325 bytes.
- Character: slow aerial movement over Paris, bridge, riverboats and civic architecture.

### C — Scenic / nature exploration

- Asset: scenic-exploration.mp4
- Source: https://www.pexels.com/video/a-road-cutting-through-the-mountain-forest-4081703/
- Creator: 8 K (Pexels)
- Download: https://videos.pexels.com/video-files/4081703/4081703-hd_1280_720_24fps.mp4
- Downloaded rendition: 1280×720, 11.84s, 4,067,223 bytes. Original download is kept outside the repository.
- Processing: up to 12s, 960×540, 24fps, H.264 CRF 26, audio removed, MP4 fast-start.
- Optimized: 895,825 bytes (~0.85MiB), 11.79s.
- Poster: ../img/travel/scenic-exploration-poster.jpg, frame at 3s, 49,281 bytes.
- Character: warm mountain-and-forest landscape with a winding road and slow aerial movement.

Retrieved 2026-10-10. Both new clips were reviewed separately in the actual Home hero at 1920, 1366, 820, 390 and 320px.

## Switching

In libs/components/homepage/HomeHeroBanner.tsx, change HERO_VIDEO_VARIANT to:

- 'coastline' for A (existing)
- 'city' for B
- 'scenic' for C
- 'beach' for D (active for review)

The selected video and its poster change together. videoEnabled=false in LayoutHome still restores the original static cream hero.

## D — Beach, palms and blue sky (active)

- Asset: tropical-beach.mp4
- Source: https://www.pexels.com/video/a-beach-with-palm-trees-and-a-clear-blue-ocean-19860922/
- Creator: + One Day (Pexels)
- License: https://www.pexels.com/license/
- Download: https://videos.pexels.com/video-files/19860922/19860922-hd_1280_720_30fps.mp4
- Processing: first 12 seconds, 960×540, 24fps, H.264 CRF 26 with 1000kbps cap, no audio, fast-start.
- Optimized size: 1,491,357 bytes (~1.42MiB).
- Poster: ../img/travel/tropical-beach-poster.jpg, 82,290 bytes, extracted at 3s.
- Character: white sand, turquoise ocean, swaying palms, blue sky and soft white clouds.
- Retrieved: 2026-10-10.

Set HERO_VIDEO_VARIANT to 'beach' in HomeHeroBanner.tsx to use this fourth option. All three earlier options and their posters are retained. Reduced-motion/save-data/video-error fallbacks continue to use the selected poster.
