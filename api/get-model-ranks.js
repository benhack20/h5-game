import { modelRanks } from '../public/models.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    res.status(200).json({
      success: true,
      data: modelRanks
    });
  } catch (error) {
    console.error('Error fetching model ranks:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch model ranks',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 