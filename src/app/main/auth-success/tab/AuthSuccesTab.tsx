import { Button, Card } from '@mui/material';
import { useAuth } from 'src/app/auth/AuthRouteProvider';

type AuthSuccessType = {
    roles: any;
    onRoleClick: (role: any) => void;
}
function AuthSuccesTab({ roles, onRoleClick }: AuthSuccessType) {
    const { signOut } = useAuth();
    return (
        <div className="mx-auto w-full max-w-320 sm:mx-0 sm:w-320 h-full">
            <div className='flex h-full flex-col justify-between'>
                {Object.keys(roles).length > 0 && <div>
                    {Object.entries(roles).map(([roleKey, role]: [string, any]) => (
                        <Card
                            className='min-h-5 flex items-center justify-center my-10'
                            key={"role_id_" + roleKey}
                            onClick={() => onRoleClick(role)}>
                            {role.name}
                        </Card>
                    ))}
                    {Object.keys(roles).length == 0 && <p>No Roles assigned to this user.</p>}
                </div>}
                <div>
                    <Button color='error' variant='outlined' onClick={() => signOut()} >Sign Out</Button>
                </div>
            </div>
        </div>
    )
}

export default AuthSuccesTab