import { Autocomplete, TextField } from "@mui/material";
import { useState } from "react";

type Props = {
    data: any[];
    label?: string;
    value?: string;
    onChange?: (value: any) => void;
};
function OnionDropdown({ value, data, label, onChange }: Props) {
    const [inputValue, setInputValue] = useState('');

    return (
        <Autocomplete
            className="!w-full"
            value={data.find(option => option.value === value) || null}
            onChange={(event: any, newValue: { name: string; value: string } | null) => {
                onChange(newValue ? newValue.value : null);
            }}
            inputValue={inputValue}
            onInputChange={(event, newInputValue) => {
                setInputValue(newInputValue);
            }}
            options={data}
            getOptionLabel={(option) => option.name}
            sx={{ width: 300 }}
            renderInput={(params) => <TextField {...params} label={label} />}
        />
    )
}

export default OnionDropdown