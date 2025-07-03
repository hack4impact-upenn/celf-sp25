import mongoose from 'mongoose';
import { IndustryFocus } from '../models/industryFocus.model';

const initialIndustryFocuses = [
  'Clean Energy',
  'Conservation',
  'Sustainable Food Systems',
  'Waste Management',
  'Environmental Justice',
  'Climate Change Policy',
  'Green Building & Architecture',
  'Circular Economy',
  'Community Organizing',
  'Wildlife Protection',
  'Marine Conservation',
  'Urban Planning',
  'Sustainable Agriculture',
  'Water Resources',
  'Transportation & Mobility',
  'Public Health & Environment',
  'Forestry',
  'Environmental Education',
  'Carbon Capture & Storage',
  'Renewable Energy Finance',
  'Environmental Technology',
  'Ecotourism',
  'Environmental Law & Policy',
  'Government',
  'Nonprofit & Advocacy',
];

async function seedIndustryFocuses() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/celf';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    // Clear existing industry focuses
    await IndustryFocus.deleteMany({});
    console.log('Cleared existing industry focuses');

    // Insert new industry focuses
    const industryFocuses = initialIndustryFocuses.map(name => ({
      name,
      description: `Industry focus on ${name.toLowerCase()}`,
      isActive: true,
    }));

    await IndustryFocus.insertMany(industryFocuses);
    console.log(`Successfully seeded ${industryFocuses.length} industry focuses`);

    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Error seeding industry focuses:', error);
    process.exit(1);
  }
}

// Run the seed function if this file is executed directly
if (require.main === module) {
  seedIndustryFocuses();
}

export default seedIndustryFocuses; 