// Libraries required
const fs = require('fs');
const path = require('path');


// Generate JSON to HTML
function htmlFromJson(jsonData) {
    const { doctype = 'html', lang = 'en' } = jsonData;

    let html = `<!DOCTYPE ${doctype}>\n<html lang="${lang}">\n<head>\n`;

    const processObject = (obj, indent = '\t') => {
        Object.keys(obj).forEach(key => {
            if (typeof obj[key] === 'object') {
                if (key !== 'attributes') {
                    html += `${indent}<${key}`;
                    const attributes = obj[key].attributes;
    
                    if (attributes) {
                        const attrKeys = Object.keys(attributes);
    
                        if (attrKeys.length > 0) {
                            html += ' ';
                            attrKeys.forEach(attr => {
                                if (attr === 'style' && typeof attributes[attr] === 'object') {
                                    const styles = Object.keys(attributes[attr])
                                        .map(styleKey => `${styleKey}: ${attributes[attr][styleKey]};`)
                                        .join(' ');
    
                                    if (styles !== '') {
                                        html += `style="${styles.trim()}"`;
                                    }
                                } else {
                                    html += `${attr}="${attributes[attr]}"`;
                                }
                            });
                        }
                    }
    
                    if (key !== 'style') {
                        html += '>\n';
                    }
    
                    delete obj[key].attributes;
                    delete obj[key].style;
    
                    if (key !== 'style') {
                        processObject(obj[key], `${indent}\t`);
                        html += `${indent}</${key}>\n`;
                    }
                } else if (key === 'link') {
                    obj[key].forEach(linkObj => {
                        html += `${indent}<link`;
                        Object.keys(linkObj).forEach(linkAttr => {
                            html += ` ${linkAttr}="${linkObj[linkAttr]}"`;
                        });
                        html += `>\n`;
                    });
                } else {
                    html += `${indent}<body`;
                    if (obj[key].style) {
                        const styles = Object.keys(obj[key].style)
                            .map(styleKey => `${styleKey}: ${obj[key].style[styleKey]};`)
                            .join(' ');
    
                        if (styles !== '') {
                            html += ` style="${styles.trim()}"`;
                        }
                    }
                    html += '>\n';
                    delete obj[key].style;
                }
            } else {
                html += `${indent}<${key}>${obj[key]}</${key}>\n`;
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

        if (jsonData.head.link) {
            jsonData.head.link.forEach(linkObj => {
                html += '\t<link';
                Object.keys(linkObj).forEach(linkAttr => {
                    html += ` ${linkAttr}="${linkObj[linkAttr]}"`;
                });
                html += `>\n`;
            });
        }
    } else {
        return null;
    }

    html += '</head>\n';
    processObject(jsonData.body, '\t');
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

              const fileNameWithoutExt = path.parse(inputFileName).name;


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


// convert all JSON files in a folder to HTML
function convertAllJsontoHtml(inputFolder, outputFolder) {
  fs.readdir(inputFolder, (err, files) => {
      if (err) {
          console.error('Error reading folder:', err);
          return;
      }

      files.forEach(file => {
          const inputFilePath = path.join(inputFolder, file);

          if (file.endsWith('.json')) {
              jsonToHtml(inputFilePath, outputFolder);
          }
      });
  });
}

const inputFolder = 'json_files';
const outputFolder = 'html_files';

convertAllJsontoHtml(inputFolder, outputFolder);
