import React, { useState } from 'react';
import { 
  Button, 
  Menu, 
  MenuItem, 
  Checkbox, 
  ListItemText 
} from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';

interface FilterOption {
  id: string;
  label: string;
}

interface FilterButtonProps {
  options: FilterOption[];
  onFilterChange: (selectedOptions: string[]) => void;
}

const FilterButton: React.FC<FilterButtonProps> = ({ options, onFilterChange }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleOptionToggle = (optionId: string) => {
    const currentIndex = selectedOptions.indexOf(optionId);
    const newSelectedOptions = [...selectedOptions];

    if (currentIndex === -1) {
      newSelectedOptions.push(optionId);
    } else {
      newSelectedOptions.splice(currentIndex, 1);
    }

    setSelectedOptions(newSelectedOptions);
    onFilterChange(newSelectedOptions);
  };

  return (
    <>
      <Button
        variant="outlined"
        startIcon={<FilterListIcon />}
        onClick={handleClick}
      >
        Filter
      </Button>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        {options.map((option) => (
          <MenuItem key={option.id} onClick={() => handleOptionToggle(option.id)}>
            <Checkbox checked={selectedOptions.indexOf(option.id) > -1} />
            <ListItemText primary={option.label} />
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

export default FilterButton;
