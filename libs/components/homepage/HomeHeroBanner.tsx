import React, { ReactNode, useEffect, useState } from 'react';
import { Stack } from '@mui/material';

const heroVideo = { video: '/video/tropical-beach.mp4', poster: '/img/travel/tropical-beach-poster.jpg' };

// Set videoEnabled to false in LayoutHome to restore the original static hero.
const HomeHeroBanner = ({ children, videoEnabled = true }: { children: ReactNode; videoEnabled?: boolean }) => {
	const [motionAllowed, setMotionAllowed] = useState(false);
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
	return (
		<Stack
			component="header"
			className={`tripora-home-header${videoEnabled ? ' home-hero-media' : ''}`}
			style={videoEnabled ? { backgroundImage: `url(${heroVideo.poster})` } : undefined}
		>
			{videoEnabled && motionAllowed && !failed && (
				<video
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
						setReady(true);
					}}
					onError={() => setFailed(true)}
				>
					<source src={heroVideo.video} type="video/mp4" />
				</video>
			)}
			{children}
		</Stack>
	);
};
export default HomeHeroBanner;
