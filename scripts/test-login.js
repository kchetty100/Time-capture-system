const userRepository = require('../repositories/user-repository');

async function testLogin() {
  console.log('🧪 Testing Login Process...');
  console.log('============================');
  
  try {
    // Test 1: Find user by email
    console.log('\n1️⃣ Testing findByEmail...');
    const user = await userRepository.findByEmail('admin@reverside.com');
    console.log('User found:', user ? '✅ YES' : '❌ NO');
    if (user) {
      console.log('User details:', {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        hasPassword: !!user.password
      });
    }
    
    // Test 2: Validate password
    console.log('\n2️⃣ Testing validatePassword...');
    const isValid = await userRepository.validatePassword('admin@reverside.com', 'admin123');
    console.log('Password valid:', isValid ? '✅ YES' : '❌ NO');
    if (isValid) {
      console.log('Validated user:', {
        id: isValid.id,
        name: isValid.name,
        email: isValid.email,
        role: isValid.role
      });
    }
    
    // Test 3: Test with wrong password
    console.log('\n3️⃣ Testing with wrong password...');
    const isInvalid = await userRepository.validatePassword('admin@reverside.com', 'wrongpassword');
    console.log('Wrong password rejected:', !isInvalid ? '✅ YES' : '❌ NO');
    
    // Test 4: Test with wrong email
    console.log('\n4️⃣ Testing with wrong email...');
    const wrongEmail = await userRepository.validatePassword('wrong@email.com', 'admin123');
    console.log('Wrong email rejected:', !wrongEmail ? '✅ YES' : '❌ NO');
    
  } catch (error) {
    console.error('❌ Error during testing:', error);
  }
}

testLogin();
