import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import { expoBoothLayoutImageUrl } from 'src/utils/urlHelper';

function BoothBanner({expoDetails}) {
	return (
		<div className="relative ">
			<Box
				component=""
				className="flex flex-col relative"
			>
				<img
          src={expoBoothLayoutImageUrl(`${expoDetails?.expLayoutId}.webp`)}
					sizes="(max-width: 600px) 300px, (max-width: 1200px) 768px, 1200px"
					alt="Booth Banner"
					className="w-full h-auto rounded"
				/>
			</Box>
		</div>
	);
}

export default BoothBanner;