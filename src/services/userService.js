const database = require('../config/database');

class UserService {
  async saveUsers(records) {
    const savedUsers = [];
    
    for (const record of records) {
      try {
        const userData = this.transformRecordToUser(record);
        const userId = await this.insertUser(userData);
        savedUsers.push({ id: userId, ...userData });
      } catch (error) {
        console.error('Error saving user:', error);
        throw error;
      }
    }
    
    return savedUsers;
  }

  transformRecordToUser(record) {
    // Extract mandatory fields
    const firstName = record.name?.firstName || '';
    const lastName = record.name?.lastName || '';
    const fullName = `${firstName} ${lastName}`.trim();
    const age = record.age || 0;

    // Extract address if it exists
    let address = null;
    if (record.address) {
      address = { ...record.address };
    }

    // Create additional_info with remaining properties
    const additionalInfo = { ...record };
    
    // Remove mandatory fields and address from additional_info
    delete additionalInfo.name;
    delete additionalInfo.age;
    delete additionalInfo.address;

    return {
      name: fullName,
      age: age,
      address: address,
      additional_info: Object.keys(additionalInfo).length > 0 ? additionalInfo : null
    };
  }

  async insertUser(userData) {
    const query = `
      INSERT INTO users (name, age, address, additional_info)
      VALUES (?, ?, ?, ?)
    `;
    
    const params = [
      userData.name,
      userData.age,
      userData.address ? JSON.stringify(userData.address) : null,
      userData.additional_info ? JSON.stringify(userData.additional_info) : null
    ];

    const result = await database.query(query, params);
    return result.insertId;
  }

  async calculateAgeDistribution() {
    const query = 'SELECT age FROM users';
    const users = await database.query(query);
    
    if (users.length === 0) {
      return {
        '< 20': 0,
        '20 to 40': 0,
        '40 to 60': 0,
        '> 60': 0
      };
    }

    const ageGroups = {
      'under20': 0,
      'between20and40': 0,
      'between40and60': 0,
      'over60': 0
    };

    users.forEach(user => {
      const age = user.age;
      if (age < 20) {
        ageGroups.under20++;
      } else if (age >= 20 && age <= 40) {
        ageGroups.between20and40++;
      } else if (age > 40 && age <= 60) {
        ageGroups.between40and60++;
      } else {
        ageGroups.over60++;
      }
    });

    const total = users.length;
    const distribution = {
      '< 20': Math.round((ageGroups.under20 / total) * 100),
      '20 to 40': Math.round((ageGroups.between20and40 / total) * 100),
      '40 to 60': Math.round((ageGroups.between40and60 / total) * 100),
      '> 60': Math.round((ageGroups.over60 / total) * 100)
    };

    return distribution;
  }

  async printAgeDistributionReport() {
    const distribution = await this.calculateAgeDistribution();
    
    console.log('\n=== Age Distribution Report ===');
    console.log('Age-Group\t% Distribution');
    console.log('--------------------------------');
    console.log(`< 20\t\t${distribution['< 20']}`);
    console.log(`20 to 40\t${distribution['20 to 40']}`);
    console.log(`40 to 60\t${distribution['40 to 60']}`);
    console.log(`> 60\t\t${distribution['> 60']}`);
    console.log('================================\n');
    
    return distribution;
  }

  async getAllUsers() {
    const query = 'SELECT * FROM users ORDER BY id';
    return await database.query(query);
  }

  async clearAllUsers() {
    const query = 'DELETE FROM users';
    return await database.query(query);
  }
}

module.exports = new UserService();