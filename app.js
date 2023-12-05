// Libraries required
const fs = require('fs');
const path = require('path');


// Generate JSON to HTML
function htmlFromJson(jsonData) {
    const { doctype = 'html', lang = 'en' } = jsonData;

    let html = `<!DOCTYPE ${doctype}>\n<html lang="${lang}">\n<head>\n`;

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
                    if (obj[key].style) {
                        let styleAttr = ' style="';
                        Object.keys(obj[key].style).forEach(styleKey => {
                            styleAttr += `${styleKey}: ${obj[key].style[styleKey]}; `;
                        });
                        styleAttr += '"';
                        html += ` ${styleAttr}`;
                    }
                    html += '>\n';
                    delete obj[key].attributes;
                    delete obj[key].style;
                    processObject(obj[key]);
                    html += `\t</${key}>\n`;
                } else if (key === 'link') {
                    obj[key].forEach(linkObj => {
                        html += `\t<link`;
                        Object.keys(linkObj).forEach(linkAttr => {
                            html += ` ${linkAttr}="${linkObj[linkAttr]}"`;
                        });
                        html += `>\n`;
                    });
                } else {
                    html += `\t<body`;
                    if (obj[key].style) {
                        let styleAttr = ' style="';
                        Object.keys(obj[key].style).forEach(styleKey => {
                            styleAttr += `${styleKey}: ${obj[key].style[styleKey]}; `;
                        });
                        styleAttr += '"';
                        html += ` ${styleAttr}`;
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
    processObject(jsonData.body);
    html += '\t</body>\n</html>';

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
