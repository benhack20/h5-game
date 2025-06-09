import { createClient } from 'redis';

const redis = createClient({
  url: process.env.REDIS_URL
});

const STATS = {
  TOTAL_GAMES: 'stats:total_games',
  BUTTON_CLICKS: 'stats:button_clicks',
  MODEL_COUNTS: 'stats:model_counts',
  PLAYER_TIMELINE: 'stats:player_timeline',
  PLAYER_SET: 'stats:players'
};

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    if (!redis.isOpen) {
      await redis.connect();
    }

    // 获取所有统计数据
    const [
      totalGames,
      buttonClicks,
      modelCounts,
      totalPlayers,
      recentPlayers
    ] = await Promise.all([
      redis.get(STATS.TOTAL_GAMES),
      redis.hGetAll(STATS.BUTTON_CLICKS),
      redis.hGetAll(STATS.MODEL_COUNTS),
      redis.sCard(STATS.PLAYER_SET),
      redis.zRange(STATS.PLAYER_TIMELINE, -10, -1, { REV: true })
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalGames: parseInt(totalGames) || 0,
        buttonClicks,
        modelCounts,
        totalPlayers,
        recentPlayers
      }
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch stats',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 