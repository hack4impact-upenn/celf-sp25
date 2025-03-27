import React from 'react';
import { styled } from '@mui/system';
import SearchBar from '../components/search_bar/SearchBar';
import SpeakerCard from '../components/cards/SpeakerCard';
import Sidebar from '../components/teacher_sidebar/Sidebar';
import TopBar from '../components/top_bar/TopBar';
import './TeacherPage.css';

interface Speaker {
  id: number;
  name: string;
  bio: string;
  organization: string;
  location: string;
  imageUrl: string;
}

const CardContainer = styled('div')({
  display: 'flex',
  flexWrap: 'wrap', // Corrected property name
  gap: '20px',
  justifyContent: 'space-around', // Changed from `justify-items`
});

// TODO: REMOVE THIS TEST DATA
const speakers = [
  {
    id: '1',
    name: 'David Vexler',
    bio: 'PER biggest fan',
    organization: 'Buffalo State University',
    location: 'Buffalo, NY',
    imageUrl:
      'https://t3.ftcdn.net/jpg/02/99/04/20/360_F_299042079_vGBD7wIlSeNl7vOevWHiL93G4koMM967.jpg',
  },
  {
    id: '2',
    name: 'Khoi',
    bio: 'hi pmtls',
    organization: 'Environmental Institute',
    location: 'Boston, MA',
    imageUrl:
      'https://img.freepik.com/free-photo/young-bearded-man-with-striped-shirt_273609-5677.jpg',
  },
  {
    id: '3',
    name: 'Edward',
    bio: 'hello pmtls',
    organization: 'Green Solutions',
    location: 'New York, NY',
    imageUrl:
      'https://media.istockphoto.com/id/1389348844/photo/studio-shot-of-a-beautiful-young-woman-smiling-while-standing-against-a-grey-background.jpg?s=612x612&w=0&k=20&c=anRTfD_CkOxRdyFtvsiPopOluzKbhBNEQdh4okZImQc=',
  },
];

function TeacherSearchSpeakerPage() {
  const handleSearch = (query: string) => {
    console.log('Searching for:', query);
  };

  return (
    <div className="flex-div">
      <TopBar />
      <Sidebar />
      <div className="main-window">
        <SearchBar onSearch={handleSearch} placeholder="Type your search..." />
        <div className="max-width-wrapper">
          <CardContainer>
            {speakers.length > 0 ? (
              speakers.map((speaker) => (
                <SpeakerCard
                  key={speaker.id}
                  id={speaker.id}
                  name={speaker.name}
                  bio={speaker.bio}
                  organization={speaker.organization}
                  location={speaker.location}
                  imageUrl={speaker.imageUrl}
                />
              ))
            ) : (
              <p>No speakers found</p>
            )}
          </CardContainer>
        </div>
      </div>
    </div>
  );
}

export default TeacherSearchSpeakerPage;
