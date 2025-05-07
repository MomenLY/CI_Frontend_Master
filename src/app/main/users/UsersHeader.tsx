import OnionCustomHeader from 'app/shared-components/components/OnionCustomHeader';
import { useTranslation } from 'react-i18next';

type Props = {
    setKeyword?: (data: string) => void;
    keyword?: string;
    rules?: any
}
function UsersHeader({ setKeyword, keyword, rules }: Props) {
    const { t } = useTranslation();
    return (
        <div className="p-16 md:p-24 mt-0">
            <OnionCustomHeader
                label={t('Users')}
                searchLabel={t('search')}
                searchKeyword={keyword}
                setSearchKeyword={setKeyword}
                buttonLabel={t('Add')}
                button={rules?.addUser?.permission}
                buttonUrl='new'
            />
        </div>
    )
}

export default UsersHeader
