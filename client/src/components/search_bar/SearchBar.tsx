import React from 'react';
import { styled } from '@mui/system';
import { Button } from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';

const Wrapper = styled('div')({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  padding: '16px', // Added padding around the search bar
});

const Container = styled('div')({
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  gap: '0px',
  width: '720px',
  minWidth: '360px',
  maxWidth: '720px',
  height: '56px',
  background: '#E4E4E4',
  boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.25)',
  borderRadius: '20px',
  padding: '8px', // Added internal padding inside the search bar
});

const LeadingIconWrapper = styled('div')({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  width: '48px',
  height: '48px',
  cursor: 'pointer',
});

const TrailingIconWrapper = styled('div')({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'flex-end',
  alignItems: 'center',
  width: 'auto',
  height: '48px',
  cursor: 'pointer',
});

const Input = styled('input')({
  flexGrow: 1,
  height: '100%',
  fontFamily: 'Roboto, sans-serif',
  fontSize: '16px',
  lineHeight: '24px',
  letterSpacing: '0.5px',
  color: '#49454F',
  background: 'transparent',
  border: 'none',
  outline: 'none',
  paddingLeft: '0.5rem',
});

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder: string;
  onFilterClick?: () => void;
}

function SearchBar({
  onSearch,
  placeholder,
  onFilterClick,
}: SearchBarProps) {
  const [searchQuery, setSearchQuery] = React.useState('');

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      onSearch(searchQuery);
    }
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  return (
    <Wrapper>
      <Container>
        <LeadingIconWrapper>{/* Icon */}</LeadingIconWrapper>
        <Input 
          type="text" 
          placeholder={placeholder} 
          value={searchQuery}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
        />
        <TrailingIconWrapper>
          {onFilterClick && (
            <Button
              variant="contained"
              startIcon={<FilterListIcon />}
              onClick={onFilterClick}
              sx={{
                height: '40px',
                backgroundColor: '#E4E4E4',
                border: 'none',
                boxShadow: 'none',
                borderRadius: '20px',
                padding: '8px 16px',
                textTransform: 'none',
                fontSize: '16px',
                fontWeight: 500,
                color: '#49454F',
                '&:hover': {
                  backgroundColor: '#D0D0D0',
                },
              }}
            >
              Filters
            </Button>
          )}
        </TrailingIconWrapper>
      </Container>
    </Wrapper>
  );
}

export default SearchBar;
