import { useTranslation } from 'react-i18next';
import OnionCustomHeader from 'app/shared-components/components/OnionCustomHeader';

type Props = {
    setKeyword?: (data: string) => void;
    keyword?: string;
}
function AdminHeader({ setKeyword, keyword }: Props) {
    const { t } = useTranslation();

    return (
        <div className="p-16 md:p-24 mt-0">
            <OnionCustomHeader
                label={t('adminManagement')}
                searchLabel={t('search')}
                searchKeyword={keyword}
                setSearchKeyword={setKeyword}
                buttonLabel={t('Add')}
                // button={rules?.addRole?.permission}
                buttonUrl='new'
            />
        </div>
    );
}

export default AdminHeader
