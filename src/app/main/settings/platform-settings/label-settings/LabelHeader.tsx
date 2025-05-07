import FuseSvgIcon from '@fuse/core/FuseSvgIcon';
import { Box, Input, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

type Props = {
	title: string;
	subTitle?: string;
	searchData?: (data: string) => void;
};

function LabelHeader({ searchData, subTitle, title }: Props) {
	const { t } = useTranslation();
	return (
		<div>
			<div className="flex md:flex-row flex-col justify-between md:items-center space-y-5">
				<Typography
					component="h2"
					className="flex-1 text-3xl md:text-4xl font-extrabold tracking-tight leading-7 sm:leading-10 truncate "
				>
					{title}
				</Typography>
				<div className="md:w-1/2 flex justify-end">
					<Box
						component={motion.div}
						initial={{ y: -20, opacity: 0 }}
						animate={{ y: 0, opacity: 1, transition: { delay: 0.2 } }}
						className="flex w-full md:w-2/3 items-center px-16 mx-8 border-1 rounded-full"
					>
						<FuseSvgIcon
							color="action"
							size={20}
						>
							heroicons-outline:search
						</FuseSvgIcon>

						<Input
							placeholder={t('search')}
							className="flex flex-1 px-16"
							disableUnderline
							fullWidth
							// value={searchText}
							inputProps={{
								'aria-label': 'Search'
							}}
							onChange={(e) =>
								setTimeout(() => {
									searchData(e.target.value);
								}, 1000)
							}
						/>
					</Box>
				</div>
			</div>
		</div>
	);
}

export default LabelHeader;
