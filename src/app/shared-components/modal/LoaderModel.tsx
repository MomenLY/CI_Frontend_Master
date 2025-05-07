import { CircularProgress, LinearProgress, styled } from '@mui/material';
import { useTranslation } from 'react-i18next';

const Div = styled('div')(({ theme }) => ({
    ...theme.typography.body1,
    backgroundColor: theme.palette.secondary.main,
    padding: theme.spacing(1),
  }));

  const Span = styled('span')(({ theme }) => ({
    ...theme.typography.body1,
    color: '#fff'
  }));  

type LoaderType = {
    isLoading: boolean;
    label?: string;
}

const LoaderModal = ({ isLoading,label }: LoaderType) => {
    const { t } = useTranslation();
    return (
        <>
            {isLoading && (
                <div className="fixed inset-x-0 bottom-8 z-50 max-w-[300px] m-auto">
                    <Div className="p-4 rounded-lg shadow-lg">
                        <div className="flex items-center justify-center">
                            <Span>{label? label : t('loading')}</Span>
                        </div>
                    </Div>
                </div>
            )}
        </>
    );
};

export default LoaderModal;