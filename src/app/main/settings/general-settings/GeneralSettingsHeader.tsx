import OnionHeader from 'app/shared-components/components/OnionHeader';
import { useTranslation } from 'react-i18next';

type Props = {
	title: string;
	subTitle?: string;
};

function GeneralSettingsHeader({ title, subTitle }: Props) {
	const { t } = useTranslation();
	return (
		<OnionHeader title={title} secondLabel={subTitle} titleLink='/settings' firstLabel={t('Settings')} />
	);
}

export default GeneralSettingsHeader;
