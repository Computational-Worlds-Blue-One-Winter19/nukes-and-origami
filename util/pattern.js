// reads a pattern from the given filename and displays a formatted pattern object
// the '-m' flag will also mirror the given pattern
// the '-m 1' flag will mirror without the last column
// 
// usage:   node pattern.js example.txt
//          node pattern.js mirror.txt -m 1
//          node pattern.js mirror.txt -m

const DELAY_VALUE = 2;
const OFF_CHAR = '-';
const ON_CHAR = 'X';

const filename = process.argv[2];
const patternName = filename.split('.')[0];
const mirror = (process.argv[3] === '-m');
const mirrorOffset = ((Number) (process.argv[4] || 0)) + 1;

// header
console.log('\npattern.' + patternName + ' = {');
console.log('  sequence: [');

// array
const scanner = require('./scanner.js');
scanner.open(filename);

while (scanner.hasNext()) {
  let row = scanner.nextLine();
  let result = new Array();

  for (let i = 0; i < row.length; i++) {
    let char = row.charAt(i);

    if (char === OFF_CHAR) {
      result.push(0);
    } else if (char === ON_CHAR) {
      result.push(1);
    }
  }

  // if mirrored read backwards
  if (mirror) {
    const start = result.length - mirrorOffset;

    for (let i = start; i > -1; i--) {
      result.push(result[i]);
    }
  }

  console.log('    [' + result.toString() + '],');
}
scanner.close();

// footer
console.log('  ],');
console.log('  delay: ' + DELAY_VALUE + ',');
console.log('};\n');
