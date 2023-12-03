// Libraries required
const express = require('express');
const app = express();
const fs = require('fs');
const path = require('path');


// Generate JSON to HTML
function htmlFromJson(jsonData) {
  let html = '<!DOCTYPE html>\n<html lang="en">\n<head>\n';

  const processObject = (obj) => {
      Object.keys(obj).forEach(key => {
          if (typeof obj[key] === 'object') {
              if (key !== 'attributes') {
                  html += `\t<${key}`;
                  if (obj[key].attributes) {
                      Object.keys(obj[key].attributes).forEach(attr => {
                          html += ` ${attr}="${obj[key].attributes[attr]}"`;
                      });
                  }
                  html += '>\n';
                  delete obj[key].attributes;
                  processObject(obj[key]);
                  html += `\t</${key}>\n`;
              } else {
                  html += '\t<body';
                  if (obj[key].style) {
                      html += ' style="';
                      Object.keys(obj[key].style).forEach(styleKey => {
                          html += `${styleKey}: ${obj[key].style[styleKey]}; `;
                      });
                      html += '"';
                  }
                  html += '>\n';
                  delete obj[key].style;
              }
          } else {
              html += `\t<${key}>${obj[key]}</${key}>\n`;
          }
      });
  };

  if (jsonData.doctype === 'html') {
      html += '\t<meta charset="utf-8">\n';
      html += `\t<title>${jsonData.head.title}</title>\n`;

      jsonData.head.meta &&
          Object.keys(jsonData.head.meta).forEach(key => {
              html += `\t<meta name="${key}" content="${jsonData.head.meta[key]}">\n`;
          });
  } else {
      return null;
  }

  html += '</head>\n';
  processObject(jsonData.body);
  html += '</html>';

  return html;
}


// Convert JSON file to HTML
function jsonToHtml(inputFileName, outputFolder) {
  fs.readFile(inputFileName, 'utf8', (err, data) => {
      if (err) {
          console.error(`Error reading JSON file '${inputFileName}':`, err);
          return;
      }

      try {
          const jsonData = JSON.parse(data);
          const html = htmlFromJson(jsonData);

          if (html !== null) {
              // Get the filename without extension
              const fileNameWithoutExt = path.parse(inputFileName).name;

              // Define the output file path
              const outputFile = path.join(outputFolder, `${fileNameWithoutExt}.html`);

              fs.writeFile(outputFile, html, 'utf8', (err) => {
                  if (err) {
                      console.error(`Error writing HTML file '${outputFile}':`, err);
                      return;
                  }
                  console.log(`HTML file created '${outputFile}'`);
              });
          }
      } catch (error) {
          console.error(`Error parsing JSON '${inputFileName}':`, error);
      }
  });
}


// Function to convert all JSON files in a folder to HTML
function convertAllJsontoHtml(inputFolder, outputFolder) {
  fs.readdir(inputFolder, (err, files) => {
      if (err) {
          console.error('Error reading folder:', err);
          return;
      }

      files.forEach(file => {
          const inputFilePath = path.join(inputFolder, file);

          // Check if it's a JSON file
          if (file.endsWith('.json')) {
              jsonToHtml(inputFilePath, outputFolder);
          }
      });
  });
}

const inputFolder = 'json_files';
const outputFolder = 'html_files';

convertAllJsontoHtml(inputFolder, outputFolder);



// Listening port 
const PORT = 3000;


// Listening to port through Express
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
