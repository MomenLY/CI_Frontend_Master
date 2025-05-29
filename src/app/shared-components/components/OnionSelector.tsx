import React, { useEffect, useState } from 'react';
import { Select, OutlinedInput, Box, Chip, MenuItem, Checkbox, ListItemText, FormControl, InputLabel, TextField } from '@mui/material';
import { Onion } from 'src/utils/consoleLog';
import { OnionTruncate } from 'src/utils/common';
import { useTranslation } from 'react-i18next';

type SelectType = {
    data: any[],
    value: string[],
    onChangeComplete: (data: any[]) => void,
    label: string,
    isLoading?: boolean
    // onFieldSelectChange: (selected: boolean) => void, // Callback function prop
};

const OnionSelector = ({ data, value, onChangeComplete, label, isLoading = false }: SelectType) => {
    const [selectedItems, setSelectedItems] = useState(value || []);
    const [searchTerm, setSearchTerm] = useState('');
    const { t } = useTranslation();

    const filteredData = data?.filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()));

    // Synchronize state with props    
    useEffect(() => {
        setSelectedItems(value || []);
    }, [value]);

    const handleChange = (event:any) => {
        const {
            target: { value },
        } = event;
        const newValue = typeof value === 'string' ? value.split(',') : value;
        onChangeComplete(newValue);
        setSelectedItems(newValue);
        // onFieldSelectChange(true); // Notify parent about the change
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
                multiple
                value={selectedItems}
                fullWidth
                onChange={handleChange}
                input={<OutlinedInput id="selector-input" label={label} />}
                renderValue={(selected) => {
                    const validSelected = selected.filter(val => data.find(item => item._id === val));
                    return (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {validSelected.length > 0
                                ? validSelected.map((value) => {
                                    const role = data.find((item) => item._id === value);
                                    return (
                                        <Chip
                                            key={value}
                                            label={OnionTruncate(role?.name || '', 20)}
                                        />
                                    );
                                })
                                : <em>{t('onionSelector_no_items_selected')}</em>
                            }
                        </Box>
                    );
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
                                placeholder={t('search')+'...'}
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
                        <Checkbox checked={selectedItems.indexOf(data._id) > -1} />
                        <ListItemText primary={OnionTruncate(data.name, 35)} />
                    </MenuItem>
                ))}
            </Select>
        </FormControl>
    );
};

export default OnionSelector;
