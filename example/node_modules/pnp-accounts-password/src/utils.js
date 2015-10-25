import bcrypt from 'bcrypt';

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
