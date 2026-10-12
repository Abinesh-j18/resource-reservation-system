const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const target = process.argv[2]; // 'sqlite' or 'postgres'

const prismaDir = path.join(__dirname, '..', 'prisma');
const schemaPath = path.join(prismaDir, 'schema.prisma');
const sourceFile = target === 'sqlite' ? 'schema.sqlite.prisma' : 'schema.postgresql.prisma';
const sourcePath = path.join(prismaDir, sourceFile);

if (!fs.existsSync(sourcePath)) {
  console.error(`Source schema file not found: ${sourcePath}`);
  process.exit(1);
}

fs.copyFileSync(sourcePath, schemaPath);
console.log(`\n✔ Switched prisma/schema.prisma to: ${target.toUpperCase()}`);

console.log('✔ Generating Prisma Client...');
execSync('npx prisma generate', { stdio: 'inherit' });

console.log(`\n✅ Database mode successfully set to ${target.toUpperCase()}!\n`);
