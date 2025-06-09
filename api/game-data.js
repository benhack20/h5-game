import { createClient } from 'redis';

const redis = createClient({
  url: process.env.REDIS_URL
});

// 统计键名
const STATS = {
  TOTAL_GAMES: 'stats:total_games',
  BUTTON_CLICKS: 'stats:button_clicks',
  MODEL_COUNTS: 'stats:model_counts',
  PLAYER_TIMELINE: 'stats:player_timeline',  // 用于记录新增玩家时间分布
  PLAYER_SET: 'stats:players'  // 用于存储所有玩家ID
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    if (!redis.isOpen) {
      await redis.connect();
    }

    const { 
      playerId,
      score, 
      buttonClicked,
      modelName
    } = req.body;

    // 检查是否是新玩家
    const isNewPlayer = !(await redis.sIsMember(STATS.PLAYER_SET, playerId));
    if (isNewPlayer) {
      // 记录新玩家
      await redis.sAdd(STATS.PLAYER_SET, playerId);
      // 记录到时间线
      const timestamp = Date.now();
      await redis.zAdd(STATS.PLAYER_TIMELINE, {
        score: timestamp,
        value: playerId
      });
    }

    // 如果是按钮点击事件
    if (buttonClicked) {
      // 增加按钮点击计数
      await redis.hIncrBy(STATS.BUTTON_CLICKS, buttonClicked, 1);
      return res.status(200).json({ success: true });
    }
    
    // 游戏结束事件
    // 增加总游戏局数
    await redis.incr(STATS.TOTAL_GAMES);
    
    // 如果指定了模型名称，增加该模型的计数
    if (modelName) {
      await redis.hIncrBy(STATS.MODEL_COUNTS, modelName, 1);
    }

    res.status(200).json({ 
      success: true, 
      message: 'Game data saved successfully'
    });
  } catch (error) {
    console.error('Error saving game data:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to save game data',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 