import bcrypt from 'bcrypt';

export async function hash(password, {crypto: {rounds = 10}}) {
  return await (new Promise((resolve, reject) => {
    bcrypt.hash(password, rounds, (err, passwordHashed) => {
      if (err) {
        return reject(err);
      }
      resolve(passwordHashed);
    });
  }));
}

export async function compare(password, passwordHashed) {
  return await (new Promise((resolve, reject) => {
    bcrypt.compare(password, passwordHashed, (err, res) => {
      if (err) {
        return reject(err);
      }
      resolve(res);
    });
  }));
}
