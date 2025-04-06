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
  IconButton,
  Collapse,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

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
}

interface Props {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
}

export default function SpeakerFilterPanel({ filters, onChange }: Props) {
  const [open, setOpen] = useState(false);

  const handleChange = (field: string, value: any) => {
    onChange({ ...filters, [field]: value });
  };

  const handleCheckboxGroup = (
    field: string,
    value: string,
    checked: boolean
  ) => {
    const updated = checked
      ? [...filters[field], value]
      : filters[field].filter((v: string) => v !== value);
    handleChange(field, updated);
  };

  return (
    <Box sx={{ mb: 3, border: '1px solid #ccc', borderRadius: 2 }}>
      <Box
        sx={{
          px: 2,
          py: 1,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: '#f5f5f5',
          borderTopLeftRadius: 8,
          borderTopRightRadius: 8,
        }}
      >
        <Typography variant="h6">Filter Speakers</Typography>
        <IconButton onClick={() => setOpen(!open)} size="small">
          {open ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </IconButton>
      </Box>

      <Collapse in={open}>
        <Box sx={{ p: 2 }}>
          {/* Industry */}
          <FormControl fullWidth sx={{ mb: 2 }}>
            <FormLabel>Industry Focus</FormLabel>
            <Select
              multiple
              value={filters.industry}
              onChange={(e) => handleChange('industry', e.target.value)}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((val: string) => (
                    <Chip key={val} label={val} />
                  ))}
                </Box>
              )}
            >
              {industryOptions.map((option) => (
                <MenuItem key={option} value={option}>
                  <Checkbox checked={filters.industry.includes(option)} />
                  {option}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Grade Level */}
          <FormGroup row sx={{ mb: 2 }}>
            <FormLabel component="legend">Grade Level</FormLabel>
            {gradeOptions.map((grade) => (
              <FormControlLabel
                key={grade}
                control={
                  <Checkbox
                    checked={filters.grades.includes(grade)}
                    onChange={(e) =>
                      handleCheckboxGroup('grades', grade, e.target.checked)
                    }
                  />
                }
                label={grade}
              />
            ))}
          </FormGroup>

          {/* Location */}
          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <TextField
              label="City"
              value={filters.city}
              onChange={(e) => handleChange('city', e.target.value)}
              fullWidth
            />
            <TextField
              label="State"
              value={filters.state}
              onChange={(e) => handleChange('state', e.target.value)}
              fullWidth
            />
          </Box>

          {/* Radius */}
          <Box sx={{ mb: 2 }}>
            <Typography gutterBottom>
              Search Radius: {filters.radius} miles
            </Typography>
            <Slider
              value={filters.radius}
              onChange={(e, value) => handleChange('radius', value)}
              step={10}
              min={10}
              max={100}
              marks
            />
          </Box>

          {/* Formats */}
          <FormGroup row sx={{ mb: 2 }}>
            <FormLabel component="legend">Speaking Formats</FormLabel>
            <FormControlLabel
              control={
                <Checkbox
                  checked={filters.formats.inperson}
                  onChange={(e) =>
                    handleChange('formats', {
                      ...filters.formats,
                      inperson: e.target.checked,
                    })
                  }
                />
              }
              label="In-person"
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={filters.formats.virtual}
                  onChange={(e) =>
                    handleChange('formats', {
                      ...filters.formats,
                      virtual: e.target.checked,
                    })
                  }
                />
              }
              label="Virtual"
            />
          </FormGroup>

          {/* Languages */}
          <FormControl fullWidth>
            <FormLabel>Languages</FormLabel>
            <Select
              multiple
              value={filters.languages}
              onChange={(e) => handleChange('languages', e.target.value)}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((val: string) => (
                    <Chip key={val} label={val} />
                  ))}
                </Box>
              )}
            >
              {languageOptions.map((option) => (
                <MenuItem key={option} value={option}>
                  <Checkbox checked={filters.languages.includes(option)} />
                  {option}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Collapse>
    </Box>
  );
}
