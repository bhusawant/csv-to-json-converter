const CSVParser = require('../utils/csvParser');
const userService = require('../services/userService');
const fs = require('fs').promises;

class CSVController {
  async uploadAndProcessCSV(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No CSV file uploaded'
        });
      }

      const filePath = req.file.path;
      
      // Parse CSV file
      const csvParser = new CSVParser();
      const records = await csvParser.parseCSVFile(filePath);
      
      console.log(`Parsed ${records.length} records from CSV file`);
      
      // Save records to database
      const savedUsers = await userService.saveUsers(records);
      
      console.log(`Successfully saved ${savedUsers.length} users to database`);
      
      // Generate and print age distribution report
      const ageDistribution = await userService.printAgeDistributionReport();
      
      // Clean up uploaded file
      try {
        await fs.unlink(filePath);
      } catch (error) {
        console.warn('Could not delete uploaded file:', error.message);
      }
      
      res.status(200).json({
        success: true,
        message: 'CSV file processed successfully',
        data: {
          recordsProcessed: savedUsers.length,
          ageDistribution: ageDistribution,
          sampleRecords: savedUsers.slice(0, 5) // Show first 5 records as sample
        }
      });
      
    } catch (error) {
      console.error('Error processing CSV file:', error);
      
      // Clean up uploaded file in case of error
      if (req.file && req.file.path) {
        try {
          await fs.unlink(req.file.path);
        } catch (unlinkError) {
          console.warn('Could not delete uploaded file:', unlinkError.message);
        }
      }
      
      res.status(500).json({
        success: false,
        message: 'Error processing CSV file',
        error: error.message
      });
    }
  }

  async processCSVFromPath(req, res) {
    try {
      const { filePath } = req.body;
      
      if (!filePath) {
        return res.status(400).json({
          success: false,
          message: 'File path is required'
        });
      }

      // Parse CSV file
      const csvParser = new CSVParser();
      const records = await csvParser.parseCSVFile(filePath);
      
      console.log(`Parsed ${records.length} records from CSV file`);
      
      // Save records to database
      const savedUsers = await userService.saveUsers(records);
      
      console.log(`Successfully saved ${savedUsers.length} users to database`);
      
      // Generate and print age distribution report
      const ageDistribution = await userService.printAgeDistributionReport();
      
      res.status(200).json({
        success: true,
        message: 'CSV file processed successfully',
        data: {
          recordsProcessed: savedUsers.length,
          ageDistribution: ageDistribution,
          sampleRecords: savedUsers.slice(0, 5)
        }
      });
      
    } catch (error) {
      console.error('Error processing CSV file:', error);
      res.status(500).json({
        success: false,
        message: 'Error processing CSV file',
        error: error.message
      });
    }
  }

  async getAgeDistribution(req, res) {
    try {
      const ageDistribution = await userService.calculateAgeDistribution();
      
      res.status(200).json({
        success: true,
        data: {
          ageDistribution: ageDistribution
        }
      });
    } catch (error) {
      console.error('Error calculating age distribution:', error);
      res.status(500).json({
        success: false,
        message: 'Error calculating age distribution',
        error: error.message
      });
    }
  }

  async getAllUsers(req, res) {
    try {
      const users = await userService.getAllUsers();
      
      res.status(200).json({
        success: true,
        data: {
          users: users,
          count: users.length
        }
      });
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({
        success: false,
        message: 'Error fetching users',
        error: error.message
      });
    }
  }

  async clearAllUsers(req, res) {
    try {
      await userService.clearAllUsers();
      
      res.status(200).json({
        success: true,
        message: 'All users cleared successfully'
      });
    } catch (error) {
      console.error('Error clearing users:', error);
      res.status(500).json({
        success: false,
        message: 'Error clearing users',
        error: error.message
      });
    }
  }
}

module.exports = new CSVController();