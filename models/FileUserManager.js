const fs = require('fs');
const path = require('path');
const argon2 = require('argon2');
const crypto = require('crypto');

const dataDir = path.join(__dirname, '..', 'data');
const usersFile = path.join(dataDir, 'users.json');

class FileUserManager {
  
  // Read users from file
  static readUsers() {
    try {
      const data = fs.readFileSync(usersFile, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      return [];
    }
  }

  // Write users to file
  static writeUsers(users) {
    fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
  }

  // Create a new user
  static async createUser(userData) {
    const users = this.readUsers();
    
    // Check if user already exists
    const existingUser = users.find(user => 
      user.email === userData.email || user.username === userData.username
    );
    
    if (existingUser) {
      throw new Error('User with this email or username already exists');
    }

    // Hash password
    const passwordHash = await argon2.hash(userData.password);
    
    // Generate encryption key for user data
    const encryptionKey = crypto.randomBytes(32).toString('hex');
    
    const newUser = {
      id: crypto.randomUUID(),
      username: userData.username,
      email: userData.email,
      passwordHash,
      encryptionKey,
      profile: {
        firstName: userData.firstName || '',
        lastName: userData.lastName || ''
      },
      preferences: {
        theme: 'light',
        notifications: true
      },
      isActive: true,
      createdAt: new Date().toISOString(),
      lastLogin: null
    };

    users.push(newUser);
    this.writeUsers(users);
    
    // Return user without sensitive data
    const { passwordHash: _, encryptionKey: __, ...userWithoutSensitiveData } = newUser;
    return userWithoutSensitiveData;
  }

  // Find user by email
  static findUserByEmail(email) {
    const users = this.readUsers();
    return users.find(user => user.email === email);
  }

  // Find user by ID
  static findUserById(id) {
    const users = this.readUsers();
    return users.find(user => user.id === id);
  }

  // Verify password
  static async verifyPassword(user, password) {
    return await argon2.verify(user.passwordHash, password);
  }

  // Update user
  static updateUser(userId, updates) {
    const users = this.readUsers();
    const userIndex = users.findIndex(user => user.id === userId);
    
    if (userIndex === -1) {
      throw new Error('User not found');
    }

    users[userIndex] = { ...users[userIndex], ...updates };
    this.writeUsers(users);
    
    const { passwordHash, encryptionKey, ...userWithoutSensitiveData } = users[userIndex];
    return userWithoutSensitiveData;
  }

  // Update last login
  static updateLastLogin(userId) {
    const users = this.readUsers();
    const userIndex = users.findIndex(user => user.id === userId);
    
    if (userIndex !== -1) {
      users[userIndex].lastLogin = new Date().toISOString();
      this.writeUsers(users);
    }
  }

  // Change password
  static async changePassword(userId, newPassword) {
    const users = this.readUsers();
    const userIndex = users.findIndex(user => user.id === userId);
    
    if (userIndex === -1) {
      throw new Error('User not found');
    }

    const passwordHash = await argon2.hash(newPassword);
    users[userIndex].passwordHash = passwordHash;
    this.writeUsers(users);
  }
}

module.exports = FileUserManager;