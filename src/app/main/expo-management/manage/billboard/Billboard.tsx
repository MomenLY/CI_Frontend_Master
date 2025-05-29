import FusePageSimple from '@fuse/core/FusePageSimple';
import { styled } from '@mui/material/styles';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { useSearchParams } from 'react-router-dom';
import { getModuleAccessRules } from 'src/utils/aclLibrary';
import { useTranslation } from 'react-i18next';
import LocalCache from 'src/utils/localCache';
import { cacheIndex } from 'app/shared-components/cache/cacheIndex';
import { getSingleExpoAPI } from 'app/shared-components/cache/cacheCallbacks';
import BillboardSidebarContent from './BillboardSidebarContent';
import BillboardContent from './BillboardContent';
import BillboardHeader from './BillboardHeader';
import { getBillboardList } from './apis';
import FuseLoading from "@fuse/core/FuseLoading";
const Root = styled(FusePageSimple)(({ theme }) => ({
    '& .FusePageSimple-header': {
        backgroundColor: theme.palette.background.paper,
        borderBottomWidth: 0,
    },
    '& .FusePageSimple-content': {
        backgroundColor: theme.palette.background.paper,
    }
}));

function Billboard() {
    const [searchParams] = useSearchParams();
    const _keyword = searchParams?.get("keyword");
    const [keyword, setKeyword] = useState(_keyword || "");
    const routeParams = useParams();
    const [rightSidebarOpen, setRightSidebarOpen] = useState(false);
    const navigate = useNavigate();
    const [userRules, setUserRules] = useState({});
    const { t } = useTranslation('agenda');
    const [expoDetails, setExpoDetails] = useState(null);
    const [expoPublish, setExpoPublish] = useState<boolean | null>(true);
    const [billboardJsonDetails, setBillboardJsonDetails] = useState(null);
    const [loading, setLoading] = useState(true);  // Add loading state

    useEffect(() => {
        const fetchExpoDetails = async () => {
            let expoDetails = await LocalCache.getItem(
                cacheIndex.expoDetails + "_" + routeParams.id,
                getSingleExpoAPI.bind(this, routeParams.id)
            );
            setExpoDetails(expoDetails);
        };

        fetchExpoDetails();
    }, [routeParams]);

    useEffect(() => {
        if (expoDetails?.data?.expo?.expCode) {
            // getBillboardJson();
        }
    }, [expoDetails]);

    const getBillboardJson = async () => {
        try {
            let expoCode = expoDetails?.data?.expo?.expCode;
            if (!expoCode) {
                console.warn('Expo code is not available');
                return;
            }
            const billboardDetails = await getBillboardList(expoCode);
            setBillboardJsonDetails(billboardDetails);
            setLoading(false);  // Set loading to false after data is fetched
        } catch (error) {
            console.error('Error fetching billboard details:', error);
            setLoading(false);  // Handle loading in case of an error
        }
    };


    return (
        <Root
            content={
                <div className="flex flex-col w-full">
                    <div className="p-[26px] pb-[15px]">
                        <BillboardHeader heading='Billboard' rules={userRules} />
                    </div>

                    <div className="w-full h-full container flex flex-col pt-[10px] p-[26px]">
                        <BillboardContent getBillboardJson1={()=>getBillboardJson()}   billboardJsonDetails={billboardJsonDetails} />
                    </div>
                </div>
            }
            rightSidebarContent={<BillboardSidebarContent />}
            rightSidebarOpen={rightSidebarOpen}
            rightSidebarOnClose={() => {
                setRightSidebarOpen(false);
                navigate(-1);
            }}
            rightSidebarWidth={1536}
            rightSidebarVariant="persistent"
        />
    );
}

export default Billboard;
