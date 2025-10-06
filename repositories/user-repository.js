const BaseRepository = require('./base-repository');
const bcrypt = require('bcryptjs');

class UserRepository extends BaseRepository {
  constructor() {
    super('users');
  }

  async findByEmail(email) {
    return await this.findOne({ email });
  }

  async createUser(userData) {
    const { password, ...otherData } = userData;
    const hashedPassword = await bcrypt.hash(password, 10);
    
    return await this.create({
      ...otherData,
      password: hashedPassword
    });
  }

  async validatePassword(email, password) {
    const user = await this.findByEmail(email);
    if (!user) return null;
    
    const isValid = await bcrypt.compare(password, user.password);
    return isValid ? user : null;
  }

  async updatePassword(userId, newPassword) {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    return await this.update(userId, { password: hashedPassword });
  }

  async getEmployees() {
    return await this.findAll({ role: 'employee' }, 'name ASC');
  }

  async getAdmins() {
    return await this.findAll({ role: 'admin' }, 'name ASC');
  }
}

module.exports = new UserRepository();
