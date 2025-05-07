import { useTranslation } from 'react-i18next';
import OnionCustomHeader from 'app/shared-components/components/OnionCustomHeader';

type Props = {
    setKeyword?: (data: string) => void;
    keyword?: string;
    rules: any
}
function RoleHeader({ setKeyword, keyword, rules }: Props) {
    const { t } = useTranslation('roleManagement');

    return (
        <div className="p-16 md:p-24 mt-0">
            <OnionCustomHeader
                label={t('role_heading')}
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

export default RoleHeader
