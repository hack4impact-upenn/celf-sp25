import React, { useState } from 'react';
import {
  Box,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormLabel,
  MenuItem,
  Select,
  Checkbox,
  TextField,
  Typography,
  Slider,
  Chip,
  Button,
} from '@mui/material';

const gradeOptions = ['Elementary', 'Middle School', 'High School'];
const languageOptions = ['English', 'Spanish', 'Mandarin', 'French'];
const industryOptions = ['STEM', 'Arts', 'Environment', 'Business'];

export interface FilterState {
  industry: string[];
  grades: string[];
  city: string;
  state: string;
  radius: number;
  formats: {
    inperson: boolean;
    virtual: boolean;
  };
  languages: string[];
  userCoordinates?: {
    lat: number;
    lng: number;
  };
}

interface Props {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
}

export default function SpeakerFilterPanel({ filters, onChange }: Props) {
  const [localFilters, setLocalFilters] = useState<FilterState>(filters);

  const handleChange = (field: string, value: any) => {
    setLocalFilters({ ...localFilters, [field]: value });
  };

  const handleCheckboxGroup = (
    field: keyof Pick<FilterState, 'industry' | 'grades' | 'languages'>,
    value: string,
    checked: boolean
  ) => {
    const updated = checked
      ? [...localFilters[field], value]
      : localFilters[field].filter((v: string) => v !== value);
    handleChange(field, updated);
  };

  const handleApplyFilters = () => {
    onChange(localFilters);
  };

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* Industry */}
        <FormControl fullWidth>
          <FormLabel sx={{ mb: 1, fontWeight: 500, color: '#49454F' }}>Industry Focus</FormLabel>
          <Select
            multiple
            value={localFilters.industry}
            onChange={(e) => handleChange('industry', e.target.value)}
            renderValue={(selected) => (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {selected.map((val: string) => (
                  <Chip 
                    key={val} 
                    label={val} 
                    size="small"
                    sx={{ backgroundColor: '#fff' }}
                  />
                ))}
              </Box>
            )}
            sx={{ 
              backgroundColor: '#fff',
              borderRadius: '8px',
            }}
          >
            {industryOptions.map((option) => (
              <MenuItem key={option} value={option}>
                <Checkbox checked={localFilters.industry.includes(option)} />
                {option}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Grade Level */}
        <FormControl component="fieldset">
          <FormLabel sx={{ mb: 1, fontWeight: 500, color: '#49454F' }}>Grade Level</FormLabel>
          <FormGroup row sx={{ gap: 2 }}>
            {gradeOptions.map((grade) => (
              <FormControlLabel
                key={grade}
                control={
                  <Checkbox
                    checked={localFilters.grades.includes(grade)}
                    onChange={(e) =>
                      handleCheckboxGroup('grades', grade, e.target.checked)
                    }
                    size="small"
                  />
                }
                label={grade}
              />
            ))}
          </FormGroup>
        </FormControl>

        {/* Location */}
        <Box sx={{ display: 'flex', gap: 2 }}>
          <TextField
            label="City"
            value={localFilters.city}
            onChange={(e) => handleChange('city', e.target.value)}
            fullWidth
            size="small"
            sx={{ backgroundColor: '#fff' }}
          />
          <TextField
            label="State"
            value={localFilters.state}
            onChange={(e) => handleChange('state', e.target.value)}
            fullWidth
            size="small"
            sx={{ backgroundColor: '#fff' }}
          />
        </Box>

        {/* Radius */}
        <Box>
          <Typography gutterBottom>
            Search Radius: {localFilters.radius} miles
          </Typography>
          <Slider
            value={localFilters.radius}
            onChange={(e, value) => handleChange('radius', value)}
            step={10}
            min={10}
            max={100}
            marks
          />
        </Box>

        {/* Speaking Formats */}
        <FormControl component="fieldset">
          <FormLabel sx={{ mb: 1, fontWeight: 500, color: '#49454F' }}>Speaking Formats</FormLabel>
          <FormGroup row sx={{ gap: 2 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={localFilters.formats.inperson}
                  onChange={(e) =>
                    handleChange('formats', {
                      ...localFilters.formats,
                      inperson: e.target.checked,
                    })
                  }
                  size="small"
                />
              }
              label="In-person"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={localFilters.formats.virtual}
                  onChange={(e) =>
                    handleChange('formats', {
                      ...localFilters.formats,
                      virtual: e.target.checked,
                    })
                  }
                  size="small"
                />
              }
              label="Virtual"
            />
          </FormGroup>
        </FormControl>

        {/* Languages */}
        <FormControl fullWidth>
          <FormLabel sx={{ mb: 1, fontWeight: 500, color: '#49454F' }}>Languages</FormLabel>
          <Select
            multiple
            value={localFilters.languages}
            onChange={(e) => handleChange('languages', e.target.value)}
            renderValue={(selected) => (
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                {selected.map((val: string) => (
                  <Chip 
                    key={val} 
                    label={val} 
                    size="small"
                    sx={{ backgroundColor: '#fff' }}
                  />
                ))}
              </Box>
            )}
            sx={{ 
              backgroundColor: '#fff',
              borderRadius: '8px',
            }}
          >
            {languageOptions.map((option) => (
              <MenuItem key={option} value={option}>
                <Checkbox checked={localFilters.languages.includes(option)} />
                {option}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
          <Button
            variant="contained"
            onClick={handleApplyFilters}
            sx={{
              backgroundColor: '#E4E4E4',
              color: '#49454F',
              '&:hover': {
                backgroundColor: '#D0D0D0',
              },
            }}
          >
            Apply Filters
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
