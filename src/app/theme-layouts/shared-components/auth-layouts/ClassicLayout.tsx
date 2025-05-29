import Paper from '@mui/material/Paper';
import _ from '@lodash';
import { chain } from 'lodash';
import { ReactNode } from 'react';

type Props = {
    children: ReactNode;
}

/**
 * The classic layout page.
 */
function ClassicLayout({children}:Props) {

    return (
        <div className="flex min-w-0 flex-auto flex-col items-center sm:justify-center">
            <Paper className="min-h-full w-full rounded-0 px-16 py-32 sm:min-h-auto sm:w-auto sm:rounded-2xl sm:p-48 sm:shadow   flex items-center justify-center">
              {children}
            </Paper>
        </div>
    );
}

export default ClassicLayout;
