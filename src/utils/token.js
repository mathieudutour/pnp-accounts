import jwt from 'jwt-simple';
import moment from 'moment';
import Chance from 'chance';
const chance = new Chance();

export function JWTToken(iss, secret) {
  const expires = moment().add(365, 'days').valueOf();
  const token = jwt.encode({
    iss: iss,
    exp: expires,
  }, secret);
  return {token, expires};
}

export function Token() {
  return chance.string({
    length: 16,
    pool: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
  });
}
