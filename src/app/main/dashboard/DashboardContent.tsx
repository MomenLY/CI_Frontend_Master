import { motion } from 'framer-motion';
import FusePageSimple from '@fuse/core/FusePageSimple';
import { styled } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import Widget from './Widget';
import Typography from '@mui/material/Typography';
import RegistrationWidget from './RegistrationWidget';
import VisitorsVsPageViewsWidget from './VisitorsVsPageViewsWidget';
import OnionDropdown from 'app/shared-components/components/OnionDropdown';
import { getAll, getSingle } from './api/GetAll';


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

type ExpoData = {
    allExpos: Expo[];
    total: number;
    ongoing: number;
    past: number;
    upcoming: number;
    online: number;
    hybrid: number;
    offline: number;
};

interface Expo {
    id: string;
    expName: string;
}
interface TransformedExpo {
    value: string;
    name: string;
    _id: string;
}

function DashboardContent() {
    const { t } = useTranslation('dashboard');
    const [expos, setExpos] = useState<ExpoData>({
        allExpos: [],
        total: 0,
        ongoing: 0,
        past: 0,
        upcoming: 0,
        online: 0,
        hybrid: 0,
        offline: 0,
    });
    const [data, setData] = useState<TransformedExpo[]>([]);
    const [seats, setSeats] = useState(0);
    const [registrations, setRegistrations] = useState(0);
    const [booth, setBooth] = useState([]);
    const [billboard, setBillboard] = useState([]);
    const [selectedExpo, setSelectedExpo] = useState<string>();


    const container = {
        show: {
            transition: {
                staggerChildren: 0.04
            }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };


    useEffect(() => {
        getInitialDetails();
    }, []);

    useEffect(() => {
        const transformedData: TransformedExpo[] = expos?.allExpos?.map((expo: Expo) => ({
            value: expo.id,
            name: expo.expName,
            _id: expo.id
        }));
        if(transformedData.length > 0) {
            setSelectedExpo(transformedData[0]._id)
            onExpoChange(transformedData[0]._id)
        }
        setData(transformedData)
    }, [expos]);


    const getInitialDetails = async () => {
        const allExpo = await getAll();
        if (allExpo ) {
            setExpos(allExpo)
        }
    }

    const onExpoChange = async (id) => {
        setSelectedExpo(id);
        const expo = await getSingle(id);
        if (expo ) {
            if(expo?.expo?.expIsSeatsUnlimited){
                setSeats(-1)
            } else{
                setSeats(expo?.expo?.expMaxSeats)
            }
            setRegistrations(Number(expo.registrationCount[0].count));
            setBooth(expo?.booth);
            setBillboard(expo?.billboard);
                
            //setExpos(allExpo)
            
        }
       
        // const isSeatsFull = await seatLimit(routeParams.id);
        // setIsSeatFull(isSeatsFull);
    }


    return (
        <div className='w-full p-12 pt-16 sm:pt-24 lg:ltr:pr-0 lg:rtl:pl-0'>
            <div className="">
                <motion.div
                    className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-24 w-full min-w-0 p-24"
                    variants={container}
                    initial="hidden"
                    animate="show"
                >
                    <motion.div variants={item}>
                        <Widget heading={t('dashboard_total_expo')} content={t('dashboard_total_expo')} count={expos.total} color="text-amber-500" />
                    </motion.div>

                    <motion.div variants={item}>
                        <Widget heading={t('dashboard_ongoing_expo')} content={t('dashboard_ongoing_expo')} count={expos.ongoing} color="text-green-500" />
                    </motion.div>

                    <motion.div variants={item}>
                        <Widget heading={t('dashboard_past_expo')} content={t('dashboard_past_expo')} count={expos.past} color="text-red-500" />
                    </motion.div>

                    <motion.div variants={item}>
                        <Widget heading={t('dashboard_future_expo')} content={t('dashboard_future_expo')} count={expos.upcoming} color="text-blue-500" />
                    </motion.div>

                    <motion.div variants={item}>
                        <Widget heading={t('dashboard_online_expo')} content={t('dashboard_online_expo')} count={expos.online} color="text-yellow-600" />
                    </motion.div>

                    <motion.div variants={item}>
                        <Widget heading={t('dashboard_on_site_expo')} content={t('dashboard_on_site_expo')} count={expos.offline} color="text-purple-500" />
                    </motion.div>

                    <motion.div variants={item}>
                        <Widget heading={t('dashboard_hybrid_expo')} content={t('dashboard_hybrid_expo')} count={expos.hybrid} color="text-teal-500" />
                    </motion.div>
                </motion.div>

            </div>
            <div className="grid grid-cols-1  gap-24 w-full min-w-0 p-24">
                <div className="w-full mt-16 sm:col-span-3">
                    <Typography className="text-2xl font-semibold tracking-tight leading-6 mb-8" >
                        {t('dashboard_expo_analitics_header')}
                    </Typography>
                    <Typography
                        className="font-medium tracking-tight"
                        color="text.secondary"
                    >
                        {t('dashboard_expo_analitics_discription')}
                    </Typography>
                </div>
            </div>

            <div className="grid grid-cols-1  gap-24 w-full min-w-0 p-24">
                <OnionDropdown
                    value={selectedExpo}
                    onChange={(value) => { onExpoChange(value) }}
                    data={data}
                    label={t('dashboard_select_expo')}
                />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-24 w-full min-w-0 p-24 h-full">
                <div>
                    <motion.div className='h-full' variants={item}>
                        <RegistrationWidget seats={seats} registrations={registrations} />
                    </motion.div>
                </div>
                <div className='md:col-span-2 h-full'>
                    <VisitorsVsPageViewsWidget booth={booth} billboard={billboard} />
                </div>
            </div>
        </div>
    );
}

export default DashboardContent;