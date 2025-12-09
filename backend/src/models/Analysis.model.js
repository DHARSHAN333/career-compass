import mongoose from 'mongoose';

const analysisSchema = new mongoose.Schema({
  userId: {
    type: String,
    default: 'anonymous'
  },
  jobDescription: {
    type: String,
    required: true
  },
  resumeText: {
    type: String,
    required: true
  },
  matchScore: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  skills: {
    matched: [{
      name: String,
      relevance: Number
    }],
    missing: [{
      name: String,
      priority: String,
      suggestion: String
    }]
  },
  gaps: [{
    category: String,
    description: String,
    priority: String,
    actionable: String
  }],
  recommendations: [{
    text: String,
    priority: String,
    impact: String
  }],
  topTip: {
    type: String
  },
  chatHistory: [{
    role: {
      type: String,
      enum: ['user', 'assistant']
    },
    content: String,
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  },
  metadata: {
    processingTime: Number,
    aiModel: String,
    version: String
  }
}, {
  timestamps: true
});

const Analysis = mongoose.model('Analysis', analysisSchema);

export default Analysis;
