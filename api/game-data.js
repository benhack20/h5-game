import { createClient } from 'redis';

const redis = createClient({
  url: process.env.REDIS_URL
});

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
      buttonClicked
    } = req.body;

    // 如果是按钮点击事件
    if (buttonClicked) {
      // 记录按钮点击
      await redis.lPush(`p:${playerId}`, buttonClicked);
      return res.status(200).json({ success: true });
    }
    
    // 游戏结束事件
    // 记录游戏数据，使用 t:timestamp,s:score 格式
    const timestamp = Date.now();
    await redis.lPush(`p:${playerId}`, `t:${timestamp},s:${score}`);

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