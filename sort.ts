import fs from 'fs';

// Read the phone numbers from 'blacklist.txt'
fs.readFile('blacklist.txt', 'utf8', (err, data) => {
  if (err) {
    console.error('Error reading the file:', err);
    return;
  }

  // Split the file content into an array of phone numbers
  const phoneNumbers: string[] = data.trim().split('\n');

  // Process each phone number
  const modifiedPhoneNumbers: string[] = phoneNumbers.map((phoneNumber) => {
    // Remove leading and trailing whitespace
    phoneNumber = phoneNumber.trim();

    if (phoneNumber.startsWith('800')) {
      // If the number starts with 800, add the digit 8 at the beginning
      return '8' + phoneNumber;
    } else if (phoneNumber.startsWith('7') && phoneNumber.length === 10) {
      // If the number starts with 7 and has a total length of 10, add + at the beginning
      return '+' + phoneNumber;
    } else if (phoneNumber.length === 10) {
      // If the length of the number is 10, add +7 at the beginning
      return '+7' + phoneNumber;
    }

    // No transformation needed for this number
    return phoneNumber;
  });

  // Sort and remove duplicates
  const uniqueModifiedPhoneNumbers = [...new Set(modifiedPhoneNumbers)].sort();

  // Join the modified phone numbers into a single string
  const modifiedData = uniqueModifiedPhoneNumbers.join('\n');

  // Write the sorted and modified data to 'blacklist_sorted.txt'
  fs.writeFile('blacklist_sorted.txt', modifiedData, 'utf8', (err) => {
    if (err) {
      console.error('Error writing to the file:', err);
      return;
    }
    console.log('Phone numbers have been modified, sorted, and duplicates removed, and saved to blacklist_sorted.txt');
  });
});
