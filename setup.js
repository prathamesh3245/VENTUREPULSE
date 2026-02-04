// Simple setup script to verify environment
const fs = require('fs');
const path = require('path');

console.log('VenturePulse Setup Verification\n');

// Check if .env exists
const envPath = path.join(__dirname, '.env');
if (!fs.existsSync(envPath)) {
  console.log('⚠️  .env file not found!');
  console.log('Creating .env.example...');
  
  const envExample = `MONGODB_URI=mongodb://localhost:27017/venturepulse
JWT_SECRET=your-super-secret-jwt-key-change-in-production
PORT=3000
`;
  
  fs.writeFileSync(envPath, envExample);
  console.log('✅ Created .env file. Please update JWT_SECRET with a strong random string!');
} else {
  console.log('✅ .env file exists');
}

// Check if node_modules exists
const nodeModulesPath = path.join(__dirname, 'node_modules');
if (!fs.existsSync(nodeModulesPath)) {
  console.log('⚠️  node_modules not found. Run: npm install');
} else {
  console.log('✅ node_modules exists');
}

// Check if frontend node_modules exists
const frontendNodeModules = path.join(__dirname, 'frontend', 'node_modules');
if (!fs.existsSync(frontendNodeModules)) {
  console.log('⚠️  frontend/node_modules not found. Run: cd frontend && npm install');
} else {
  console.log('✅ frontend/node_modules exists');
}

console.log('\nSetup verification complete!');
console.log('\nNext steps:');
console.log('1. Update .env file with your MongoDB connection string and JWT secret');
console.log('2. Ensure MongoDB is running');
console.log('3. Start backend: npm start');
console.log('4. Start frontend: cd frontend && npm run dev');
