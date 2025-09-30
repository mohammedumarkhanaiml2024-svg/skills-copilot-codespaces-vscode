const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const dataDir = path.join(__dirname, '..', 'data');
const logsFile = path.join(dataDir, 'logs.json');
const chatFile = path.join(dataDir, 'chat.json');

class FileDataManager {
  
  // Mood Logs Management
  static readLogs() {
    try {
      const data = fs.readFileSync(logsFile, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      return [];
    }
  }

  static writeLogs(logs) {
    fs.writeFileSync(logsFile, JSON.stringify(logs, null, 2));
  }

  static createLog(userId, logData) {
    const logs = this.readLogs();
    
    const newLog = {
      id: crypto.randomUUID(),
      userId,
      date: logData.date || new Date().toISOString().split('T')[0],
      mood: logData.mood,
      energy: logData.energy,
      stress: logData.stress,
      sleep: logData.sleep,
      notes: logData.notes || '',
      tags: logData.tags || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    logs.push(newLog);
    this.writeLogs(logs);
    return newLog;
  }

  static getUserLogs(userId, limit = 30) {
    const logs = this.readLogs();
    return logs
      .filter(log => log.userId === userId)
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, limit);
  }

  static updateLog(logId, userId, updates) {
    const logs = this.readLogs();
    const logIndex = logs.findIndex(log => log.id === logId && log.userId === userId);
    
    if (logIndex === -1) {
      throw new Error('Log not found');
    }

    logs[logIndex] = { 
      ...logs[logIndex], 
      ...updates, 
      updatedAt: new Date().toISOString() 
    };
    this.writeLogs(logs);
    return logs[logIndex];
  }

  static deleteLog(logId, userId) {
    const logs = this.readLogs();
    const filteredLogs = logs.filter(log => !(log.id === logId && log.userId === userId));
    
    if (logs.length === filteredLogs.length) {
      throw new Error('Log not found');
    }

    this.writeLogs(filteredLogs);
  }

  // Chat History Management
  static readChatHistory() {
    try {
      const data = fs.readFileSync(chatFile, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      return [];
    }
  }

  static writeChatHistory(chats) {
    fs.writeFileSync(chatFile, JSON.stringify(chats, null, 2));
  }

  static createChatMessage(userId, messageData) {
    const chats = this.readChatHistory();
    
    const newMessage = {
      id: crypto.randomUUID(),
      userId,
      message: messageData.message,
      response: messageData.response,
      sentiment: messageData.sentiment,
      timestamp: new Date().toISOString()
    };

    chats.push(newMessage);
    this.writeChatHistory(chats);
    return newMessage;
  }

  static getUserChatHistory(userId, limit = 50) {
    const chats = this.readChatHistory();
    return chats
      .filter(chat => chat.userId === userId)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, limit);
  }

  // Analytics
  static getUserAnalytics(userId) {
    const logs = this.getUserLogs(userId, 100); // Get more logs for analytics
    
    if (logs.length === 0) {
      return {
        totalLogs: 0,
        averageMood: 0,
        averageEnergy: 0,
        averageStress: 0,
        averageSleep: 0,
        moodTrend: [],
        recentLogs: []
      };
    }

    const totalLogs = logs.length;
    const averageMood = logs.reduce((sum, log) => sum + log.mood, 0) / totalLogs;
    const averageEnergy = logs.reduce((sum, log) => sum + log.energy, 0) / totalLogs;
    const averageStress = logs.reduce((sum, log) => sum + log.stress, 0) / totalLogs;
    const averageSleep = logs.reduce((sum, log) => sum + log.sleep, 0) / totalLogs;

    // Get recent 7 days for trend
    const moodTrend = logs.slice(0, 7).reverse().map(log => ({
      date: log.date,
      mood: log.mood,
      energy: log.energy,
      stress: log.stress
    }));

    return {
      totalLogs,
      averageMood: Math.round(averageMood * 10) / 10,
      averageEnergy: Math.round(averageEnergy * 10) / 10,
      averageStress: Math.round(averageStress * 10) / 10,
      averageSleep: Math.round(averageSleep * 10) / 10,
      moodTrend,
      recentLogs: logs.slice(0, 5)
    };
  }
}

module.exports = FileDataManager;