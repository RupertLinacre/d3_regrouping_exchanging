// Utility functions for text display

const digitWords = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];
const teens = ['ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
const tens = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

export function digitToWord(digit) {
  if (digit >= 0 && digit <= 9) {
    return digitWords[digit];
  } else if (digit >= 10 && digit <= 19) {
    return teens[digit - 10];
  } else if (digit >= 20 && digit <= 99) {
    const tensDigit = Math.floor(digit / 10);
    const onesDigit = digit % 10;
    return onesDigit === 0 ? tens[tensDigit] : `${tens[tensDigit]}-${digitWords[onesDigit]}`;
  }
  return digit.toString(); // fallback for larger numbers
}

export function expandedValue(count, place) {
  if (place === 'hundreds') {
    return count * 100;
  } else if (place === 'tens') {
    return count * 10;
  } else {
    return count; // ones
  }
}

export function digitPhrase(count, placeName) {
  const countWord = digitToWord(count);
  
  if (count === 0) {
    return `zero ${placeName}`;
  } else if (count === 1) {
    const singular = placeName === 'hundreds' ? 'hundred' : 
                    placeName === 'tens' ? 'ten' : 'one';
    return `${countWord} ${singular}`;
  } else {
    return `${countWord} ${placeName}`;
  }
}