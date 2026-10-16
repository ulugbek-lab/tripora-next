import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'next-i18next';

// Miami Beach footage; source/license recorded beside the local media.
const VIDEO = '/video/miami-coast.mp4';
const POSTER = '/video/miami-coast-poster.jpg';

const DestinationVideoBanner = () => {
	const { t } = useTranslation('common');
	const section = useRef<HTMLElement>(null);
	const [nearby, setNearby] = useState(false);
	const [motionAllowed, setMotionAllowed] = useState(false);
	const [ready, setReady] = useState(false);
	const [failed, setFailed] = useState(false);

	useEffect(() => {
		const media = window.matchMedia('(prefers-reduced-motion: reduce)');
		const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
		const update = () => setMotionAllowed(!media.matches && !connection?.saveData);
		update();
		media.addEventListener('change', update);
		const observer = new IntersectionObserver(([entry]) => {
			if (entry.isIntersecting) {
				setNearby(true);
				observer.disconnect();
			}
		}, { rootMargin: '200px' });
		if (section.current) observer.observe(section.current);
		return () => {
			media.removeEventListener('change', update);
			observer.disconnect();
		};
	}, []);

	return (
		<section ref={section} className="home-destination-video" aria-labelledby="destination-video-title">
			<img className="destination-video-poster" src={POSTER} alt="" loading="lazy" aria-hidden="true" />
			{nearby && motionAllowed && !failed && (
				<video
					className={ready ? 'ready' : ''}
					src={VIDEO}
					poster={POSTER}
					autoPlay
					muted
					loop
					playsInline
					preload="none"
					aria-hidden="true"
					tabIndex={-1}
					onPlaying={() => setReady(true)}
					onError={() => setFailed(true)}
				/>
			)}
			<h2 id="destination-video-title">{t('home.destinationVideo.title')}</h2>
		</section>
	);
};

export default DestinationVideoBanner;
