import React, { useEffect, useState } from 'react';
import { Select, OutlinedInput, Box, Chip, MenuItem, Checkbox, ListItemText, FormControl, InputLabel } from '@mui/material';
import { Onion } from 'src/utils/consoleLog';
import { OnionTruncate } from 'src/utils/common';

type SelectType = {
    data: any[],
    value: string[],
    onChangeComplete: (data: any[]) => void,
    label: string
}

const OnionSelector = ({ data, value, onChangeComplete, label }: SelectType) => {
    const [selectedItems, setSelectedItems] = useState(value || []);

    // Synchronize state with props
    useEffect(() => {
        setSelectedItems(value || []);
    }, [value]);

    const handleChange = (event) => {
        const {
            target: { value },
        } = event;
        const newValue = typeof value === 'string' ? value.split(',') : value;
        onChangeComplete(newValue);
        setSelectedItems(newValue);
    };

    return (
        <FormControl>
            <InputLabel id="selctorid">{label}</InputLabel>
            <Select
                id="selector"
                multiple
                value={selectedItems}
                onChange={handleChange}
                input={<OutlinedInput id="selector" label={label} />}
                renderValue={(selected) => (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((value) => {
                            const role = data.find((data) => data._id === value);
                            return <Chip
                                key={value} label={OnionTruncate(role ? role.name : value,20)} />;
                        })}
                    </Box>
                )}
                MenuProps={{ PaperProps: { sx: { maxHeight: '50%' } } }}
            >
                {data.map((data) => (
                    <MenuItem key={data._id} value={data._id} className="py-0">
                        <Checkbox checked={selectedItems.indexOf(data._id) > -1} />
                        <ListItemText
                            primary={OnionTruncate(data.name,35)} />
                    </MenuItem>
                ))}
            </Select>
        </FormControl>
    );
};

export default OnionSelector;
