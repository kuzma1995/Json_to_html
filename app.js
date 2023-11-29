// Libraries required
const express = require('express');
const app = express();
const fs = require('fs');
const path = require('path');

// Generating HTML from JSON files
function generateHTML(jsonData) {
    let htmlContent = '';
  
    function parseData(obj, indent = '') {
      for (const key in obj) {
        const value = obj[key];
        if (
          !key.startsWith('_') &&
          key !== 'style' &&
          key !== 'doctype' &&
          key !== 'language' &&
          key !== 'author' &&
          key !== 'keywords' &&
          key !== 'href' &&
          key !== 'rel' &&
          key !== 'type' &&
          key !== 'id' &&
          key !== 'charset' &&
          key !== 'width' &&
          key !== 'initial-scale'
          ) {
          if (typeof value === 'object') {
            parseData(value, `${indent}`);
          } else {
            htmlContent += `${indent}<${key}>${value}</${key}>\n`;
          }
        }
      }
    }
  
    parseData(jsonData);
    return htmlContent;
  }
  

 // Processing JSON files and Generating HTMLs
  function JSONFiles(inputDirectory, outputDirectory) {
    fs.readdir(inputDirectory, (err, files) => {
      if (err) {
        console.error(`Error reading directory: ${err}`);
        return;
      }
  
      files.forEach((file) => {
        if (file.endsWith('.json')) {
          const jsonFilePath = path.join(inputDirectory, file);
          fs.readFile(jsonFilePath, 'utf8', (err, data) => {
            if (err) {
              console.error(`Error reading JSON file ${file}: ${err}`);
              return;
            }
  
            const jsonData = JSON.parse(data);
            const htmlContent = generateHTML(jsonData);
  
            const fileNameWithoutExt = path.basename(file, '.json');
            const outputFilePath = path.join(outputDirectory, `${fileNameWithoutExt}.html`);
  
            fs.writeFile(outputFilePath, htmlContent, (err) => {
              if (err) {
                console.error(`${fileNameWithoutExt}.html: ${err}`);
              } else {
                console.log(`${fileNameWithoutExt}.html Created`);
              }
            });
          });
        }
      });
    });
  }
  

  const inputDir = path.join(__dirname, 'json_files');
  const outputDir = path.join(__dirname, 'html_files');
  
  JSONFiles(inputDir, outputDir);


// Listening port 
const PORT = 3000;


// Listening to port through Express
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
