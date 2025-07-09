const crypto = require('crypto');
const bcrypt = require('bcryptjs');

class OTPGenerator {
  static generateOTP() {
    return crypto.randomInt(100000, 999999).toString();
  }

  static async hashOTP(otp) {
    const saltRounds = 12;
    return await bcrypt.hash(otp, saltRounds);
  }

  static async verifyOTP(plainOTP, hashedOTP) {
    return await bcrypt.compare(plainOTP, hashedOTP);
  }

  static getOTPExpiry() {
    const now = new Date();
    return new Date(now.getTime() + 5 * 60 * 1000); // 5 minutes from now
  }

  static isOTPExpired(expiryDate) {
    return new Date() > expiryDate;
  }

  static validateOTPFormat(otp) {
    if (!otp || typeof otp !== 'string') {
      return false;
    }
    
    // Check if it's exactly 6 digits
    const otpRegex = /^[0-9]{6}$/;
    return otpRegex.test(otp);
  }
}

module.exports = OTPGenerator;