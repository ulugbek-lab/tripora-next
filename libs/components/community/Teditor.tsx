import { useTranslation } from 'next-i18next';
import React, { useMemo, useRef, useState } from 'react';
import { Box, Button, FormControl, MenuItem, Stack, Typography, Select, TextField } from '@mui/material';
import { BoardArticleCategory } from '../../enums/board-article.enum';
import { Editor } from '@toast-ui/react-editor';
import { getJwtToken } from '../../auth';
import { REACT_APP_API_URL } from '../../config';
import { useRouter } from 'next/router';
import axios from 'axios';
import { T } from '../../types/common';
//@ts-ignore
import '@toast-ui/editor/dist/toastui-editor.css';
import { useMutation } from '@apollo/client';
import { CREATE_BOARD_ARTICLE } from '../../../apollo/user/mutation';
import toast from 'react-hot-toast';
import { Message } from '../../enums/common.enum';

const TuiEditor = () => {
	const { t } = useTranslation('common');
	const editorRef = useRef<Editor>(null),
		token = getJwtToken(),
		router = useRouter();
	const [articleCategory, setArticleCategory] = useState<BoardArticleCategory>(BoardArticleCategory.TRAVEL_STORY);

	/** APOLLO REQUESTS **/
	const [createBoardArticle, { loading: creating }] = useMutation(CREATE_BOARD_ARTICLE, {
		context: { suppressErrorAlert: true },
	});

	const memoizedValues = useMemo(() => {
		const articleTitle = '',
			articleContent = '',
			articleImage = '';

		return { articleTitle, articleContent, articleImage };
	}, []);

	/** HANDLERS **/
	const uploadImage = async (image: any) => {
		try {
			const formData = new FormData();
			formData.append(
				'operations',
				JSON.stringify({
					query: `mutation ImageUploader($file: Upload!, $target: String!) {
						imageUploader(file: $file, target: $target) 
				  }`,
					variables: {
						file: null,
						target: 'article',
					},
				}),
			);
			formData.append(
				'map',
				JSON.stringify({
					'0': ['variables.file'],
				}),
			);
			formData.append('0', image);

			const response = await axios.post(`${process.env.REACT_APP_API_GRAPHQL_URL}`, formData, {
				headers: {
					'Content-Type': 'multipart/form-data',
					'apollo-require-preflight': true,
					Authorization: `Bearer ${token}`,
				},
			});

			const responseImage = response.data.data.imageUploader;
			memoizedValues.articleImage = responseImage;

			return `${REACT_APP_API_URL}/${responseImage}`;
		} catch (err) {
			toast.error(t('myPage.uploadError'));
		}
	};

	const changeCategoryHandler = (e: any) => {
		setArticleCategory(e.target.value);
	};

	const articleTitleHandler = (e: T) => {
		console.log(e.target.value);
		memoizedValues.articleTitle = e.target.value;
	};

	const handleRegisterButton = async () => {
		if (creating) return;
		try {
			const editor = editorRef.current;
			const articleContent = editor?.getInstance().getHTML() as string;
			memoizedValues.articleContent = articleContent;

			if (
				!memoizedValues.articleContent.replace(/<[^>]*>/g, '').trim() ||
				memoizedValues.articleTitle.trim().length < 3 ||
				memoizedValues.articleTitle.trim().length > 50
			) {
				throw new Error(Message.INSERT_ALL_INPUTS);
			}
			await createBoardArticle({
				variables: {
					input: { ...memoizedValues, articleCategory },
				},
			});
			toast.success(t('myPage.saved'));
			await router.push({
				pathname: '/mypage',
				query: {
					category: 'myArticles',
				},
			});
		} catch (err: any) {
			console.log(err);
			toast.error(t(err.message === Message.INSERT_ALL_INPUTS ? 'myPage.articleValidation' : 'myPage.actionError'));
		}
	};

	return (
		<Stack>
			<Stack className="article-form-fields">
				<Box component={'div'} className={'form_row'} style={{ width: '100%' }}>
					<Typography style={{ color: '#7f838d', margin: '10px' }} variant="h3">
						{t('communityPage.category')}
					</Typography>
					<FormControl sx={{ width: '100%', background: 'white' }}>
						<Select
							value={articleCategory}
							onChange={changeCategoryHandler}
							displayEmpty
							inputProps={{ 'aria-label': t('communityPage.categoriesLabel') }}
						>
							{Object.values(BoardArticleCategory).map((category) => (
								<MenuItem key={category} value={category}>
									{t(`communityPage.categories.${category}`)}
								</MenuItem>
							))}
						</Select>
					</FormControl>
				</Box>
				<Box component={'div'} style={{ width: '100%', flexDirection: 'column' }}>
					<Typography style={{ color: '#7f838d', margin: '10px' }} variant="h3">
						{t('communityPage.articleTitle')}
					</Typography>
					<TextField
						onChange={articleTitleHandler}
						id="filled-basic"
						label={t('communityPage.titlePlaceholder')}
						style={{ width: '100%', background: 'white' }}
					/>
				</Box>
			</Stack>

			<Editor
				initialValue={''}
				placeholder={t('communityPage.contentPlaceholder')}
				previewStyle={'vertical'}
				height={'440px'}
				// @ts-ignore
				initialEditType={'WYSIWYG'}
				toolbarItems={[
					['heading', 'bold', 'italic', 'strike'],
					['image', 'table', 'link'],
					['ul', 'ol', 'task'],
				]}
				ref={editorRef}
				hooks={{
					addImageBlobHook: async (image: any, callback: any) => {
						const uploadedImageURL = await uploadImage(image);
						callback(uploadedImageURL);
						return false;
					},
				}}
				events={{
					load: function (param: any) {},
				}}
			/>

			<Stack direction="row" justifyContent="center">
				<Button
					variant="contained"
					color="primary"
					style={{ margin: '30px', width: '250px', height: '45px' }}
					disabled={creating}
					onClick={handleRegisterButton}
				>
					{t('communityPage.publish')}
				</Button>
			</Stack>
		</Stack>
	);
};

export default TuiEditor;
