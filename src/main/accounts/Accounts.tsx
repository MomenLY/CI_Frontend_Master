import FusePageSimple from '@fuse/core/FusePageSimple';
import { styled } from '@mui/material/styles';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';


const Root = styled(FusePageSimple)(({ theme }) => ({
	'& .FusePageSimple-header': {
		// backgroundColor: theme.palette.background.paper,
		// borderBottomWidth: 1,
		// borderStyle: 'solid',
		// borderColor: theme.palette.divider
	},
	'& .FusePageSimple-content': {},
	'& .FusePageSimple-sidebarHeader': {},
	'& .FusePageSimple-sidebarContent': {}
}));

function Accounts() {
	useEffect(()=>{

	},[])
	const { t } = useTranslation('accounts');

	return (
		<Root
			header={
				<div className="p-24">
					<h4>{t('Accounts')}</h4>
				</div>
			}
		/>
	);
}

export default Accounts;
