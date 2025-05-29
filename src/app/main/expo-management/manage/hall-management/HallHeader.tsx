import { useTranslation } from 'react-i18next';
import OnionCustomHeader from 'app/shared-components/components/OnionCustomHeader';

type Props = {
    setKeyword?: (data: string) => void;
    keyword?: string;
    rules?: any
}
function HallHeader({ setKeyword, keyword, rules }: Props) {
    const { t } = useTranslation('hallManagement');

    return (
        <div className="">
            <OnionCustomHeader
                label={t('hall_heading')}
                searchLabel={t('common_search')}
                searchKeyword={keyword}
                setSearchKeyword={setKeyword}
                buttonLabel={t('common_add')}
                button={rules?.addRole?.permission}
                buttonUrl='new'
            />
        </div>
    )
}

export default HallHeader