const micromatch = require('micromatch');
const prettier = require('prettier');

const prettierSupportedExtensions = prettier
  .getSupportInfo()
  .languages.map(({ extensions }) => extensions)
  .flat();

const addQuotes = (a) => `"${a}"`;

module.exports = (allStagedFiles) => {
  const eslintFiles = micromatch(allStagedFiles, ['**/*.{js,jsx,ts,tsx'], {
    dot: true,
  });

  const prettierFiles = micromatch(
    allStagedFiles,
    prettierSupportedExtensions.map((extension) => `**/*${extension}`),
    { dot: true },
  );

  const linters = [];

  if (eslintFiles.length > 0)
    linters.push(`npx eslint --fix ${eslintFiles.join(' ')}`);

  if (prettierFiles.length > 0)
    linters.push(
      `npx prettier --write ${prettierFiles.map(addQuotes).join(' ')}`,
    );

  return linters;
};
