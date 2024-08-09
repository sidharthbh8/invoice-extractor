const fs = require('fs');
const pdfParse = require('pdf-parse');
const tesseract  = require('tesseract.js')
const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require('dotenv');

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env['OPENAI_API_KEY']);

const schema = [
  'Customer Details',
  'Products',
  'Total Amount'
];

const extractpdf = async( filePath ) => {
  try {
    const pdfBuffer = fs.readFileSync(filePath);

    const pdfText = await pdfParse(pdfBuffer);
    return pdfText.text;
  } 
  catch (e) {
    console.error('Error in pdf: ', e)
  }
}

const extractimg = async(filePath) => {
  try {
    const ret = await tesseract.recognize(filePath)
    const extractedText = ret.data.text;
    return extractedText;
  } 
  catch (e) {
    console.error('Error in img: ', e)
  }
}

async function getDetails(filePath) {
  try {

    let extractedData = ''
    if(filePath.endsWith('.pdf')){
      extractedData = await extractpdf(filePath);
    }
    else{
      extractedData = await extractimg(filePath)
    }

    const prompt = `
      Extract the following details from the text:
      ${schema.map((field, index) => `${index + 1}. ${field}`).join('\n')}
      
      Text: ${extractedData}
    `;
    const model = genAI.getGenerativeModel({ model: "gemini-pro"});
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    console.log(text);

  } catch (error) {
    console.error('Error:', error);
  }
}

// const filePath = 'SampleInvoiceImage.png';
// const filePath = 'SampleInvoice.pdf';
const filePath = 'SampleInvoice2.pdf';

getDetails(filePath);
