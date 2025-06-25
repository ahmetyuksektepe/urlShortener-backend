const charset = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

function encode(num) {
  const offset = 100*100*100;
  num = num + offset;
  
  let str = '';
  while (num > 0) {
    str = charset[num % 62] + str;
    num = Math.floor(num / 62);
  }
  return str || '0';
}

function decode(str) {
  const offset = 100*100*100;
  let num = 0;
  for (let i = 0; i < str.length; i++) {
    num = num * 62 + charset.indexOf(str[i]);
  }
  return num - offset;
}

export default { encode, decode };
