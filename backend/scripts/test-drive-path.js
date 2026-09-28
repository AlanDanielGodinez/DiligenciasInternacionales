const dotenv = require('dotenv');
const { resolveLegacyAppSheetPath } = require('../src/services/drive.service');

dotenv.config();

const testPath = 'FOTOS DE TRAMITES/Visa Canadiense/Citlalli Elizabeth Correa Pe±a.54998154/54998154.FOTO DE CREDENCIAL PARTE DELANTERA.234147.pdf';

const main = async () => {
  console.log('Original path:');
  console.log(testPath);

  const result = await resolveLegacyAppSheetPath(testPath);

  console.log('\nParsed:');
  console.log(JSON.stringify(result.parsed, null, 2));

  console.log('\nStatus:');
  console.log(result.status);

  console.log('\nNotes:');
  console.log(result.notes);

  if (result.file) {
    console.log('\nFile:');
    console.log(JSON.stringify(result.file, null, 2));
  }

  if (result.candidates) {
    console.log('\nCandidates:');
    console.log(JSON.stringify(result.candidates, null, 2));
  }
};

main().catch((err) => {
  console.error('Unexpected Drive path test error:');
  console.error(err);
  process.exitCode = 1;
});
