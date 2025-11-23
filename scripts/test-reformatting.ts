import { getAllProvinces, getMunicipalitiesByProvince } from '../src';

// Test city name reformatting
console.log('=== Testing City Name Reformatting ===\n');

// Test 1: Cebu City
console.log('Test 1: Cebu City');
const cebuProvince = getAllProvinces().find(p => p.name === 'Cebu');
if (cebuProvince) {
  const municipalities = getMunicipalitiesByProvince(cebuProvince.psgcCode);
  const cebuCity = municipalities.find(m => m.psgcCode === '0730600000');
  console.log(`✓ Found: "${cebuCity?.name}"`);
  console.log(`✓ Expected format: "[Name] City" instead of "City of [Name]"`);
  console.log(`✓ Passes: ${cebuCity?.name === 'Cebu City'}\n`);
}

// Test 2: Check all NCR cities
console.log('Test 2: NCR Cities (should all end with "City")');
const ncrMunicipalities = getMunicipalitiesByProvince('1300000000');
const cities = ncrMunicipalities.filter(m => m.name.includes('City'));
console.log(`Found ${cities.length} cities in NCR:`);
cities.slice(0, 10).forEach(city => {
  const hasCorrectFormat = !city.name.startsWith('City of');
  console.log(`  ${hasCorrectFormat ? '✓' : '✗'} ${city.name}`);
});

// Test 3: Check for any remaining "City of" or "Municipality of" patterns
console.log('\nTest 3: Checking for remaining old patterns...');
const allProvinces = getAllProvinces();
let foundOldPattern = false;

for (const province of allProvinces) {
  const municipalities = getMunicipalitiesByProvince(province.psgcCode);
  const withOldPattern = municipalities.filter(m =>
    m.name.startsWith('City of ') || m.name.startsWith('Municipality of ')
  );

  if (withOldPattern.length > 0) {
    foundOldPattern = true;
    console.log(`  ✗ Found old patterns in ${province.name}:`);
    withOldPattern.forEach(m => console.log(`    - ${m.name}`));
  }
}

if (!foundOldPattern) {
  console.log('  ✓ No old patterns found! All names are properly formatted.');
}

console.log('\n=== Test Complete ===');
