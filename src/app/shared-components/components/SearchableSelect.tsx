import React, { useEffect, useState } from 'react';
import { Select, OutlinedInput, Box, MenuItem, FormControl, InputLabel, TextField, ListItemText } from '@mui/material';
import { Onion } from 'src/utils/consoleLog';
import { OnionTruncate } from 'src/utils/common';
import { useTranslation } from 'react-i18next';

type SelectType = {
    data: any[],
    value: string,
    onChangeComplete: (data: string) => void,
    label: string,
    isLoading?: boolean
};

const OnionSelector = ({ data, value, onChangeComplete, label, isLoading = false }: SelectType) => {
    const [selectedItem, setSelectedItem] = useState(value || '');
    const [searchTerm, setSearchTerm] = useState('');
    const { t } = useTranslation();

    const filteredData = data?.filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()));

    // Synchronize state with props
    useEffect(() => {
        setSelectedItem(value || '');
    }, [value]);

    const handleChange = (event: any) => {
        const {
            target: { value },
        } = event;
        onChangeComplete(value);
        setSelectedItem(value);
    };

    const handleSearchInputChange = (e: any) => {
        setSearchTerm(e.target.value);
    };

    const stopPropagation = (e: any) => {
        e.stopPropagation();
    };

    return (
        <FormControl>
            <InputLabel id="selector-label">{label}</InputLabel>
            <Select
                id="selector"
                value={selectedItem}
                fullWidth
                onChange={handleChange}
                input={<OutlinedInput id="selector-input" label={label} />}
                renderValue={(selected) => {
                    const selectedItemData = data.find(item => item._id === selected);
                    return selectedItemData ? (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {OnionTruncate(selectedItemData.name, 20)}
                        </Box>
                    ) : <em>{t('onionSelector_no_items_selected')}</em>;
                }}
                MenuProps={{ PaperProps: { sx: { maxHeight: '50%' } } }}
            >
                {data?.length > 0 && (
                    <Box
                        sx={{
                            position: 'sticky',
                            top: 0,
                            backgroundColor: 'white',
                            zIndex: 1,
                            '&:hover': {
                                backgroundColor: 'white',

                            },
                            '& .MuiMenuItem-root': {
                                textDecoration: 'none',
                                backgroundColor: 'white !important',
                            },
                            '& .MuiMenuItem-root:hover': {
                                textDecoration: 'none',
                                backgroundColor: 'white !important',
                            }
                        }}
                    >
                        <MenuItem>
                            <TextField
                                fullWidth
                                size="small"
                                placeholder={t('search') + '...'}
                                value={searchTerm}
                                onChange={handleSearchInputChange}
                                onKeyDown={stopPropagation}
                                onClick={stopPropagation}
                            />
                        </MenuItem>
                    </Box>
                )}
                {isLoading && <MenuItem disabled><em>{t('loading')}</em></MenuItem>}

                {filteredData?.length === 0 && (
                    <MenuItem disabled><em>{t('onionSelector_search_null_alert')}</em></MenuItem>
                )}

                {filteredData?.map((data) => (
                    <MenuItem key={data._id} value={data._id} className="py-0">
                        <ListItemText primary={OnionTruncate(data.name, 35)} />
                    </MenuItem>
                ))}
            </Select>
        </FormControl>
    );
};

export default OnionSelector;
