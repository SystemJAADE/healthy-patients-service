import micromatch from 'micromatch';
import prettier from 'prettier';

const prettierSupportInfo = await prettier.getSupportInfo();
const prettierSupportedExtensions = prettierSupportInfo.languages
  .map(({ extensions }) => extensions)
  .flat();

const addQuotes = (a) => `"${a}"`;

export default async (allStagedFiles) => {
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
