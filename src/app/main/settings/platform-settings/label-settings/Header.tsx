import { Typography } from '@mui/material';
import React from 'react';

type Props = {
	label: string;
	content?: string;
};

function Header({ label, content }: Props) {
	return (
		<div className="mt-5 mb-5">
			<Typography
				component="h4"
				className="flex-1 text-1xl md:text-1xl font-bold tracking-tight leading-7 sm:leading-10 truncate "
			>
				{label}
			</Typography>
			<div className="mt-1 md:w-2xl text-base">{content}</div>
		</div>
	);
}

export default Header;
