
import IconButton from '@mui/material/IconButton';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';

type SettingsHeaderProps = {
    leftSidebarToggle?: () => void;
}

export default function SettingsHeader(props: SettingsHeaderProps) {
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