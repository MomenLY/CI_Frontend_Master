
import IconButton from '@mui/material/IconButton';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';

type ExpoHeaderProps = {
    leftSidebarToggle?: () => void;
}

export default function ExpoHeader(props: ExpoHeaderProps) {
    const { leftSidebarToggle} = props;

    return (
        <div className=' m-4 flex items-center'>
            {leftSidebarToggle && (
                    <div className="flex shrink-0 items-center">
                        <IconButton
                            onClick={leftSidebarToggle}
                            aria-label="toggle sidebar"
                        >
                            <FuseSvgIcon>heroicons-outline:menu</FuseSvgIcon>
                        </IconButton>
                    </div>
                )}
        </div>
    );
}