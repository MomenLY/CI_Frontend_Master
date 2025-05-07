import { Box, Input } from '@mui/material';
import { motion } from 'framer-motion';
import FuseSvgIcon from '@fuse/core/FuseSvgIcon';

type SearchType = {
    searchLabel: string;
    keyword: string;
    setKeyword: (data: any) => void;
    isHeader?: boolean;
}
function OnionSearch({
    searchLabel,
    keyword,
    setKeyword,
    isHeader = true
}: SearchType) {
    return (
        <div className={`flex w-full max-w-md flex-1 items-center ${isHeader && 'sm:max-w-256'} me-6 p-2 boder-0`}>
            <Box
                component={motion.div}
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1, transition: { delay: 0.2 } }}
                className="flex h-44 flex-1 w-full sm:w-auto items-center px-16 !m-0 border-none rounded-full"
                sx={{
                    backgroundColor: 'background.default'
                }}
            >
                <FuseSvgIcon
                    color="action"
                    size={20}
                >
                    heroicons-outline:search
                </FuseSvgIcon>

                <Input
                    placeholder={searchLabel}
                    className="flex flex-1 px-16"
                    disableUnderline
                    fullWidth
                    value={keyword}
                    inputProps={{
                        'aria-label': 'Search'
                    }}
                    onChange={(e) => {
                        setKeyword(e.target.value)
                    }}
                />
            </Box>
        </div>
    )
}

export default OnionSearch