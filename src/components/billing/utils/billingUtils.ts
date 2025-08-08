export const generateReceiptNumber = () => {
  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = String(currentDate.getMonth() + 1).padStart(2, '0');
  const randomDigits = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  
  return `RCP${year}${month}${randomDigits}`;
};
