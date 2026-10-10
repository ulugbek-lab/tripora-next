import { useTranslation } from 'next-i18next';
import React, { ReactNode, useEffect, useRef, useState } from 'react';
import { Button, Stack } from '@mui/material';
import PauseIcon from '@mui/icons-material/Pause';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';

// Change only this value to compare the retained Home hero options.
export const HERO_VIDEO_VARIANT: 'coastline' | 'city' | 'scenic' | 'beach' = 'beach';
const heroVideos = {
	coastline: { video: '/video/coastal-exploration.mp4', poster: '/img/travel/coastal-exploration-poster.jpg' },
	city: { video: '/video/city-travel.mp4', poster: '/img/travel/city-travel-poster.jpg' },
	scenic: { video: '/video/scenic-exploration.mp4', poster: '/img/travel/scenic-exploration-poster.jpg' },
	beach: { video: '/video/tropical-beach.mp4', poster: '/img/travel/tropical-beach-poster.jpg' },
};
const heroVideo = heroVideos[HERO_VIDEO_VARIANT];

// Set videoEnabled to false in LayoutHome to restore the original static hero.
const HomeHeroBanner = ({ children, videoEnabled = true }: { children: ReactNode; videoEnabled?: boolean }) => {
	const { t } = useTranslation('common');
	const video = useRef<HTMLVideoElement>(null);
	const [motionAllowed, setMotionAllowed] = useState(false);
	const [playing, setPlaying] = useState(false);
	const [ready, setReady] = useState(false);
	const [failed, setFailed] = useState(false);
	useEffect(() => {
		const media = window.matchMedia('(prefers-reduced-motion: reduce)');
		const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
		const update = () => setMotionAllowed(!media.matches && !connection?.saveData);
		update();
		media.addEventListener('change', update);
		return () => media.removeEventListener('change', update);
	}, []);
	const toggle = async () => {
		if (!video.current) return;
		if (playing) video.current.pause();
		else {
			try {
				await video.current.play();
			} catch {
				setPlaying(false);
			}
		}
	};
	return (
		<Stack
			component="header"
			className={`tripora-home-header${videoEnabled ? ' home-hero-media' : ''}`}
			style={videoEnabled ? { backgroundImage: `url(${heroVideo.poster})` } : undefined}
		>
			{videoEnabled && motionAllowed && !failed && (
				<video
					ref={video}
					className={`home-hero-video${ready ? ' ready' : ''}`}
					autoPlay
					muted
					playsInline
					loop
					preload="none"
					poster={heroVideo.poster}
					aria-hidden="true"
					tabIndex={-1}
					onPlaying={() => {
						setPlaying(true);
						setReady(true);
					}}
					onPause={() => setPlaying(false)}
					onError={() => setFailed(true)}
				>
					<source src={heroVideo.video} type="video/mp4" />
				</video>
			)}
			{children}
			{videoEnabled && motionAllowed && !failed && (
				<Button
					className="home-hero-motion-control"
					onClick={() => void toggle()}
					startIcon={playing ? <PauseIcon /> : <PlayArrowIcon />}
				>
					{playing ? t('home.hero.pause') : t('home.hero.play')}
				</Button>
			)}
		</Stack>
	);
};
export default HomeHeroBanner;
