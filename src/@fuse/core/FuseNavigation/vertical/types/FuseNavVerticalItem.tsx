import NavLinkAdapter from '@fuse/core/NavLinkAdapter';
import { alpha, styled } from '@mui/material/styles';
import ListItemText from '@mui/material/ListItemText';
import clsx from 'clsx';
import { useMemo } from 'react';
import { ListItemButton } from '@mui/material';
import FuseNavBadge from '../../FuseNavBadge';
import FuseSvgIcon from '../../../FuseSvgIcon';

const Root = styled(ListItemButton)(({ theme, ...props }) => ({
    minHeight: 44,
    width: '100%',
    borderRadius: '6px',
    margin: '0 0 4px 0',
    paddingRight: 16,
    paddingLeft: props.itempadding > 80 ? 80 : props.itempadding,
    paddingTop: 10,
    paddingBottom: 10,
    // color: alpha(theme.palette.text.primary, 0.7),
    color: "theme.palette.text.primary",
    cursor: 'pointer',
    textDecoration: 'none!important',
    '&:hover': {
        color: theme.palette.text.primary
    },
    '&.active': {
        // color: theme.palette.text.primary,
        //color: theme.palette.mode === 'light' ? theme.palette.common.white: theme.palette.primary.main,
        // color: "red",
        color: theme.palette.name === 'custom' ? theme.palette.sideNav.textColor : theme.palette.text.primary,
        
        

        backgroundColor: theme.palette.name === 'custom' ? (
            theme.palette.mode === 'light' ? theme.palette.sideNav.backgroundColor : theme.palette.sideNav.backgroundColor
        ) : (
            theme.palette.mode === 'light' ? 'rgba(0, 0, 0, .05)!important' : 'rgba(255, 255, 255, .1)!important'
        ),
        
        //  theme.palette.mode === 'light' ? 'rgba(0, 0, 0, .05)!important' : 'rgba(255, 255, 255, .1)!important',
        
        // pointerEvents: 'none',
        transition: 'border-radius .15s cubic-bezier(0.4,0.0,0.2,1)',
        '& > .fuse-list-item-text-primary': {
            color: 'inherit',
        },
        '& > .fuse-list-item-icon': {
            // color: 'inherit'
            color: theme.palette.name === 'custom' ? theme.palette.sideNav.textColor : theme.palette.text.primary,
        },
        '& .fuse-list-item-text-primary': {
            fontWeight: '600 !important',
        },
    },
    '& >.fuse-list-item-icon': {
        marginRight: 16,
        color: 'inherit'
    },
    '& > .fuse-list-item-text': {},
    '&.disabled': {
        pointerEvents: 'none',
        cursor: 'default',
        opacity: 0.5,
        color: theme.palette.text.disabled,
    },
}));

/**
 * FuseNavVerticalItem is a React component used to render FuseNavItem as part of the Fuse navigational component.
 */
function FuseNavVerticalItem(props) {
    const { item, nestedLevel = 0, onItemClick, checkPermission } = props;
    const itempadding = nestedLevel > 0 ? 38 + nestedLevel * 16 : 16;
    const component = item.url ? NavLinkAdapter : 'li';
    let itemProps = {};

    if (typeof component !== 'string') {
        itemProps = {
            disabled: item.disabled,
            to: item.url || '',
            end: item.end,
            role: 'button'
        };
    }

    if (checkPermission && !item?.hasPermission) {
        return null;
    }

    return useMemo(
        () => (
            <Root
                component={component}
                className={clsx('fuse-list-item', item.active && 'active', item.disabled && 'disabled')}
                onClick={() => !item.disabled && onItemClick && onItemClick(item)}
                itempadding={itempadding}
                sx={item.sx}
                {...itemProps}
            >
                {item.icon && (
                    <FuseSvgIcon
                        className={clsx('fuse-list-item-icon shrink-0', item.iconClass)}
                        color="action"
                    >
                        {item.icon}
                    </FuseSvgIcon>
                )}

                <ListItemText
                    className="fuse-list-item-text"
                    primary={item.title}
                    secondary={item.subtitle}
                    classes={{
                        primary: 'text-13 font-medium fuse-list-item-text-primary truncate',
                        secondary: 'text-11 font-medium fuse-list-item-text-secondary leading-normal truncate'
                    }}
                />
                {item.badge && <FuseNavBadge badge={item.badge} />}
            </Root>
        ),
        [item, itempadding, onItemClick]
    );
}

const NavVerticalItem = FuseNavVerticalItem;
export default NavVerticalItem;
