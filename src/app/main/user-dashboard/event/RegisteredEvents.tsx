import EventList from './EventList';
import { Box } from '@mui/material';

const RegisteredEvents = () => {
  return (
    <>
      <Box
        className='p-4'
        sx={{ padding: { xs: "60px 0", md: " 100px 0" } }}
      >
        <div className="max-w-[1160px] w-full px-20 lg:px-0 m-auto mt-0 ">
          <div>
            <EventList is_registered_event={true} />
          </div>
        </div>
      </Box>
    </>
  );
}

export default RegisteredEvents
