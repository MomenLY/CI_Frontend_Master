import { ReactNode } from 'react';

type Props = {
	imgUrl: string;
	children: ReactNode;
	label?: string;
};

function LayoutCard({ imgUrl, children, label }: Props) {
	return (
		<div className="">
			<img
				src={imgUrl}
				alt="layout"
				className="md:w-full "
			/>
			{children}
			<div>{label}</div>
		</div>
	);
}

export default LayoutCard;
