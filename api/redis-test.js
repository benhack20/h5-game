import { createClient } from 'redis';

// 初始化Redis客户端
const redis = createClient({
  url: process.env.REDIS_URL
});

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // 确保连接已建立
    if (!redis.isOpen) {
      await redis.connect();
    }
    
    // 测试写入数据
    await redis.set('test-key', 'Hello from Redis!');
    
    // 测试读取数据
    const result = await redis.get('test-key');
    
    res.status(200).json({ 
      success: true, 
      message: 'Redis connection successful',
      data: result 
    });
  } catch (error) {
    console.error('Redis connection error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Redis connection failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 