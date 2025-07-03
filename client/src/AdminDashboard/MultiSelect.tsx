import * as React from 'react';
import { Theme, useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Typography from '@mui/material/Typography';

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

function getStyles(name: string, options: readonly string[], theme: Theme) {
  return {
    fontWeight: options.includes(name)
      ? theme.typography.fontWeightMedium
      : theme.typography.fontWeightRegular,
  };
}

interface MultiSelectProps {
  label: string;
  selectOptions: string[];
  handleChange: (e: SelectChangeEvent<string[]>) => void;
  value: string[];
  loading?: boolean;
  error?: string | null;
}

export default function MultiSelect({
  label,
  selectOptions,
  handleChange,
  value,
  loading = false,
  error = null,
}: MultiSelectProps) {
  const theme = useTheme();

  return (
    <div>
      <FormControl sx={{ m: 1, width: 300 }}>
        <InputLabel id="demo-multiple-chip-label">{label}</InputLabel>
        <Select
          labelId="demo-multiple-chip-label"
          id="demo-multiple-chip"
          multiple
          value={value}
          onChange={handleChange}
          input={<OutlinedInput id="select-multiple-chip" label="Chip" />}
          renderValue={(selected: string[]) => (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {selected.map((value: string) => (
                <Chip key={value} label={value} />
              ))}
            </Box>
          )}
          MenuProps={MenuProps}
          disabled={loading || !!error}
        >
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
              <CircularProgress size={24} />
            </Box>
          ) : error ? (
            <Box sx={{ py: 2, px: 2 }}>
              <Alert severity="error" sx={{ mb: 1 }}>
                {error}
              </Alert>
              <Typography variant="body2" color="text.secondary">
                Please refresh the page or try again later.
              </Typography>
            </Box>
          ) : (
            selectOptions.map((name) => (
              <MenuItem
                key={name}
                value={name}
                style={getStyles(name, value, theme)}
              >
                {name}
              </MenuItem>
            ))
          )}
        </Select>
      </FormControl>
    </div>
  );
}
