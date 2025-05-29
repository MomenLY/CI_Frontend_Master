import FuseNavigation from '@fuse/core/FuseNavigation';

function InnerSidebar({navigationData}) {
	return (
		<div className="px-[16px] py-[28px] min-h-sm">
			<FuseNavigation
				navigation={navigationData}
				className="px-0"
			/>
		</div>
	);
}

export default InnerSidebar;