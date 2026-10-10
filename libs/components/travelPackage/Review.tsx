import React from 'react';
import { Stack, Typography } from '@mui/material';
import { useReactiveVar } from '@apollo/client';
import Link from 'next/link';
import moment from 'moment';
import { Comment } from '../../types/comment/comment';
import { userVar } from '../../../apollo/store';
import { packageImageUrl } from './TravelPackageCard';

const Review = ({ comment }: { comment: Comment }) => {
	const user = useReactiveVar(userVar);
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
						<Typography>Member</Typography>
					)}
					<Typography className="date">{moment(comment.createdAt).format('DD MMMM, YYYY')}</Typography>
				</Stack>
			</Stack>
			<Typography className="description">{comment.commentContent}</Typography>
		</Stack>
	);
};

export default Review;
