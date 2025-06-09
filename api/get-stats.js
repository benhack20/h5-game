import { createClient } from 'redis';

const redis = createClient({
  url: process.env.REDIS_URL
});

// 统计键名
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
      totalPlayers
    ] = await Promise.all([
      redis.get(STATS.TOTAL_GAMES),
      redis.hGetAll(STATS.BUTTON_CLICKS),
      redis.hGetAll(STATS.MODEL_COUNTS),
      redis.sCard(STATS.PLAYER_SET)
    ]);

    // 步骤1: 获取所有玩家ID
    const rawPlayerIds = await redis.zRange(STATS.PLAYER_TIMELINE, 0, -1);
    
    // 步骤2: 遍历玩家ID，并获取每个玩家的时间戳
    const timelineData = [];
    for (const playerId of rawPlayerIds) {
        const timestamp = await redis.zScore(STATS.PLAYER_TIMELINE, playerId);
        if (timestamp !== null && !isNaN(parseInt(timestamp)) && parseInt(timestamp) > 0) {
            timelineData.push({
                playerId: playerId,
                timestamp: parseInt(timestamp)
            });
        } else {
            console.error('Invalid or missing timestamp for playerId:', playerId);
        }
    }

    res.status(200).json({
        success: true,
        data: {
            totalGames: parseInt(totalGames) || 0,
            buttonClicks,
            modelCounts,
            playerTimeline: timelineData,
            totalPlayers
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