import * as dotenv from 'dotenv';

dotenv.config();


export const jwtSecrets = {
  secret: 'Postbet',
  expiresIn: '1h',
};

