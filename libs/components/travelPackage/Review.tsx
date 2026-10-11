import React from 'react';
import { Stack, Typography } from '@mui/material';
import { useReactiveVar } from '@apollo/client';
import Link from 'next/link';
import { useTranslation } from 'next-i18next';
import { Comment } from '../../types/comment/comment';
import { userVar } from '../../../apollo/store';
import { packageImageUrl } from './TravelPackageCard';

const Review = ({ comment }: { comment: Comment }) => {
	const user = useReactiveVar(userVar);
	const { t, i18n } = useTranslation('common');
	const date = new Date(comment.createdAt);
	const locale =
		({ en: 'en-US', kr: 'ko-KR', ru: 'ru-RU', ja: 'ja-JP', zh: 'zh-CN' } as Record<string, string>)[i18n.language] ??
		'en-US';
	const member = comment.memberData;
	return (
		<Stack className="review-config">
			<Stack className="review-mb-info">
				<img src={member?.memberImage ? packageImageUrl(member.memberImage) : '/img/profile/defaultUser.svg'} alt="" />
				<Stack>
					{member?._id ? (
						<Link href={member._id === user._id ? '/mypage' : `/member?memberId=${member._id}`}>
							{member.memberNick}
						</Link>
					) : (
						<Typography>{t('detail.member')}</Typography>
					)}
					<Typography className="date">
						{Number.isFinite(date.getTime())
							? date.toLocaleDateString(locale, { year: 'numeric', month: 'short', day: 'numeric' })
							: t('detail.dateUnavailable')}
					</Typography>
				</Stack>
			</Stack>
			<Typography className="description">{comment.commentContent}</Typography>
		</Stack>
	);
};

export default Review;
