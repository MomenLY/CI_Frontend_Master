import React, { ReactNode } from 'react';

type Props = {
	imgUrl: string;
	children: ReactNode;
	label?: string;
};

function LayoutCard({ imgUrl, children, label }: Props) {
	return (
		<div>
			<img
				src={imgUrl}
				alt="layout"
				className="md:w-full"
			/>
			{children}
			<div className=" text-base">{label}</div>
		</div>
	);
}

export default LayoutCard;
