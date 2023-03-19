import { compareSync, genSaltSync, hashSync } from 'bcrypt';

export const passwordToHash = (password: string) => {
  const salt = genSaltSync(10);

  return hashSync(password, salt);
};

export const checkPassword = (hash: string, password: string) => {
  return compareSync(password, hash);
};
