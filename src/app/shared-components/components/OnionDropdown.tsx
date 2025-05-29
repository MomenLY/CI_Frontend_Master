import { Autocomplete, TextField } from "@mui/material";
import { useState } from "react";
import { useTranslation } from "react-i18next";

type Props = {
    data: any[];
    label?: string;
    value?: string;
    onChange?: (value: any) => void;
    error?: boolean;
    helperText?: string;
    required?: boolean;
    loading?: boolean; // New loading prop
};

function OnionDropdown({ value, data, label, required, onChange, error, helperText, loading = false }: Props) {
    const [inputValue, setInputValue] = useState('');
    const {t} = useTranslation('general');

    // Conditional options for loading state or empty data
    const options = loading ? [] : data;

    return (
        <Autocomplete
            className="!w-full"
            value={data?.find(option => option?.value === value) || null}
            onChange={(event: any, newValue: { name: string; value: string } | null) => {
                onChange(newValue ? newValue.value : null);
            }}
            inputValue={inputValue}
            onInputChange={(event, newInputValue) => {
                setInputValue(newInputValue);
            }}
            options={options}
            getOptionLabel={(option) => option?.name}
            sx={{ width: 300 }}
            noOptionsText={loading ? t('loading') : t('onionNoRecordFound')} // Show loading or no items
            renderInput={(params) => (
                <TextField 
                    {...params} 
                    label={label} 
                    required={required} 
                    error={error} 
                    helperText={helperText}
                />
            )}
        />
    );
}

export default OnionDropdown;
