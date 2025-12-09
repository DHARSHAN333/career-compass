const mongoose = require('mongoose');
require('dotenv').config();

const sampleAnalyses = [
  {
    userId: 'demo-user-1',
    resumeText: 'Sample resume content...',
    jobDescription: 'Sample job description...',
    score: 85,
    gaps: ['AWS experience', 'GraphQL'],
    tips: ['Consider taking an AWS certification', 'Build a project using GraphQL'],
    extractedSkills: ['React', 'Node.js', 'MongoDB', 'TypeScript'],
    matchedSkills: ['React', 'Node.js', 'MongoDB'],
    createdAt: new Date()
  }
];

async function seedDatabase() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/career-compass';
    await mongoose.connect(mongoUri);
    
    console.log('Connected to MongoDB');
    
    const Analysis = mongoose.model('Analysis', new mongoose.Schema({
      userId: String,
      resumeText: String,
      jobDescription: String,
      score: Number,
      gaps: [String],
      tips: [String],
      extractedSkills: [String],
      matchedSkills: [String],
      createdAt: Date
    }));
    
    await Analysis.deleteMany({});
    await Analysis.insertMany(sampleAnalyses);
    
    console.log('Database seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
