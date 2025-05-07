import { Breadcrumbs, Typography } from '@mui/material';
import OnionHeader from 'app/shared-components/components/OnionHeader';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';


type Props = {
	title?: string;
	subTitle?: string;
};

function HallManagementHeader({ title, subTitle }: Props) {
	const { t } = useTranslation();
	return (<OnionHeader title={title} secondLabel={subTitle} titleLink='/settings' firstLabel={t('Settings')} />)
}
export default HallManagementHeader;
