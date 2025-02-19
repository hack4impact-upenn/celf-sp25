import React from 'react';
import CardTest from './CardTest/CardTest';
import FilterButton from './components/filter/filterbtn';

const speaker_test = { id: 1, name: 'Alice Johnson', bio: 'Expert in AI and ML' }

const requests = {
  upcoming: [
    { id: 1, speaker: speaker_test, status: 'Pending' },
    { id: 2, speaker: speaker_test, status: 'Declined' },
  ],
  archived: [
    { id: 3, speaker: speaker_test, status: 'Completed' },
    { id: 4, speaker: speaker_test, status: 'Completed' },
  ],
};

const filterOptions = [
  { id: '1', label: 'Option 1' },
  { id: '2', label: 'Option 2' },
  { id: '3', label: 'Option 3' },
];

const handleFilterChange = (selectedOptions: string[]) => {
  console.log('Selected options:', selectedOptions);
  // Implement your filter logic here
};

function RequestPage() {
    return (
    <div className="max-width-wrapper">
      <FilterButton options={filterOptions} onFilterChange={handleFilterChange} />
      <h1>Upcoming </h1>
      <CardTest requests={requests.upcoming} />
      <h1>Archived </h1>
      <CardTest requests={requests.archived} />
    </div>
  );
};

export default RequestPage;
