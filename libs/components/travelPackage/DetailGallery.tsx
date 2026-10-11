import React, { useEffect, useState } from 'react';
import { Button, Stack } from '@mui/material';
import { useTranslation } from 'next-i18next';
import { packageImageUrl } from './TravelPackageCard';

const DetailImage = ({ path, alt, caption = false }: { path?: string; alt: string; caption?: boolean }) => {
	const { t } = useTranslation('common');
	const [failed, setFailed] = useState(!path);
	useEffect(() => setFailed(!path), [path]);
	return (
		<div className="detail-image">
			<img
				src={failed ? '/img/travel/package-placeholder.svg' : packageImageUrl(path)}
				alt={failed ? t('detail.photoUnavailable') : alt}
				onError={() => setFailed(true)}
				onLoad={(event) => {
					if (event.currentTarget.naturalWidth < 2) setFailed(true);
				}}
			/>
			{failed && caption && <span className="detail-photo-caption">{t('detail.photoUnavailable')}</span>}
		</div>
	);
};

const DetailGallery = ({
	images,
	title,
	selected,
	onSelect,
}: {
	images: string[];
	title: string;
	selected: number;
	onSelect: (index: number) => void;
}) => {
	const { t } = useTranslation('common');
	const index = Math.min(selected, Math.max(0, images.length - 1));
	return (
		<Stack className="images" aria-label={t('detail.gallery')}>
			<div className="main-image">
				<DetailImage path={images[index]} alt={t('detail.imageAlt', { title, index: index + 1 })} caption />
				{images.length > 1 && (
					<span className="detail-image-counter">
						{index + 1} / {images.length}
					</span>
				)}
			</div>
			{images.length > 1 && (
				<Stack className="sub-images">
					{images.map((image, imageIndex) => (
						<Button
							key={`${image}-${imageIndex}`}
							className="sub-img-box"
							aria-label={t('detail.showImage', { index: imageIndex + 1 })}
							aria-pressed={imageIndex === index}
							onClick={() => onSelect(imageIndex)}
						>
							<DetailImage path={image} alt={t('detail.imageAlt', { title, index: imageIndex + 1 })} />
						</Button>
					))}
				</Stack>
			)}
		</Stack>
	);
};
export default DetailGallery;
