import OnionCustomHeader from 'app/shared-components/components/OnionCustomHeader';
import { useTranslation } from 'react-i18next';

type Props = {
    setKeyword?: (data: string) => void;
    keyword?: string;
    rules?: any
}
function SchedulesHeader({ setKeyword, keyword, rules }: Props) {
    const { t } = useTranslation('schedules');
    return (
        <div className="">
            <OnionCustomHeader
                label={t('schedules_heading')}
                searchLabel={t('common_search')}
                searchKeyword={keyword}
                setSearchKeyword={setKeyword}
                buttonLabel={t('common_add')}
                button={rules?.addUser?.permission}
                buttonUrl='new'
            />
        </div>
    )
}

export default SchedulesHeader
