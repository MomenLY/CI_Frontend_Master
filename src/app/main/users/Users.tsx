import FusePageSimple from '@fuse/core/FusePageSimple';
import { styled } from '@mui/material/styles';
import UsersTable from './UsersTable';
import UsersHeader from './UsersHeader';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import UsersSidebarContent from './UsersSidebarContent';
import { useSearchParams } from 'react-router-dom';
import { GlobalStyles } from '@mui/material';
import { getModuleAccessRules } from 'src/utils/aclLibrary';

const Root = styled(FusePageSimple)(({ theme }) => ({
	'& .FusePageSimple-header': {
		backgroundColor: theme.palette.background.paper,
		borderBottomWidth: 0,
		borderStyle: 'solid',
		borderColor: theme.palette.divider
	},
	'& .FusePageSimple-content': {},
	'& .FusePageSimple-sidebarHeader': {},
	'& .FusePageSimple-sidebarContent': {}
}));

function Users() {
	const [searchParams, setSearchParams] = useSearchParams();
	const _keyword = searchParams?.get("keyword");
	const [keyword, setKeyword] = useState(_keyword || "");
	const routeParams = useParams();
	const [rightSidebarOpen, setRightSidebarOpen] = useState(false);
	const navigate = useNavigate();
	const [userRules, setUserRules] = useState({});

	useEffect(() => {
		const init = async () => {
			const userRules = await getModuleAccessRules('users');
			setUserRules(userRules.access);
		}
		init();
	}, []);

	useEffect(() => {
		setRightSidebarOpen(Boolean(routeParams.id));
	}, [routeParams]);


	return (
		<Root
			header={
				<UsersHeader keyword={keyword} setKeyword={setKeyword} rules={userRules} />
			}
			content={
				<div className="w-full h-full container flex flex-col p-16 md:p-24">
					<UsersTable keyword={keyword} setKeyword={setKeyword} />
				</div>
			}
			rightSidebarContent={<UsersSidebarContent />}
			rightSidebarOpen={rightSidebarOpen}
			rightSidebarOnClose={() => {
				setRightSidebarOpen(false);
				navigate('/admin/users')
			}
			}
			rightSidebarWidth={1536}
			rightSidebarVariant="persistent"
		/>
	);
}

export default Users;
