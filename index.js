// useage node index.js [outputFile.xml] [inputFile.csv]
//test
const fs = require('fs')
const xml2js = require('xml2js');
const bluebird = require("bluebird");
const parser = new xml2js.Parser();
const builder = new xml2js.Builder({
  cdata: true
});
const readFile = bluebird.promisify(fs.readFile);
const parseString = bluebird.promisify(parser.parseString);
const writeFile = bluebird.promisify(fs.writeFile);
const parse = require('csv-parse')
const promiseparse = bluebird.promisify(parse)
const _ = require('lodash')



let fileNameToSave = process.argv[2]
let csvToRead = process.argv[3]

Promise.all([parseCSV(csvToRead), parseXMl()])
  .then(([csvdata, xmldata]) => {
    let question = _.cloneDeep(xmldata.quiz.question[0]);
    xmldata.quiz.question = []
    for (let line of csvdata) {
      let q = _.cloneDeep(question);
      console.log(line);
      xmldata.quiz.question.push(createNewQuestion(q, line))
      let xml1 = builder.buildObject(xmldata);
      console.log(xml1);
    }
    let xml = builder.buildObject(xmldata);
    return writeFile(__dirname + '/output/' + (fileNameToSave || 'questions.xml'), xml, 'utf8')
  })
  .then(() => {
    console.log('done');
  })
  .catch((error) => {
    console.log(error);
  })





function parseXMl() {
  return readFile(__dirname + '/onecorrectanswer.xml', 'utf8')
    .then((data) => {
      // console.log(data);
      return parseString(data)
    })
    .then((result) => {
      return result;
      // console.log(result);
    })
    .catch((error) => {
      console.log(error);
    })
}


function parseCSV(csvToRead) {
  return readFile(__dirname + '/' + csvToRead, 'utf8')
    .then((data) => {
      // console.log(data);
      return promiseparse(data, {
        from: 1,
        columns: true
      })
    })
    .then((result) => {
      return result;
      // console.log(result);
    })
    .catch((error) => {
      console.log(error);
    })
}


function createNewQuestion(question, line) {
  question.name[0].text[0] = line.name;
  question.questiontext[0].text[0] = `<p>${line.text}</p>`;
  question.defaultgrade[0] = line.grade;
  question.single[0] = line.onecorrectanswer;
  question.answer[0].$.fraction = line.fraction1;
  question.answer[0].text[0] = `<p>${line.answer1}</p>`
  question.answer[1].$.fraction = line.fraction2;
  question.answer[1].text[0] = `<p>${line.answer2}</p>`
  question.answer[2].$.fraction = line.fraction3;
  question.answer[2].text[0] = `<p>${line.answer3}</p>`
  question.answer[3].$.fraction = line.fraction4;
  question.answer[3].text[0] = `<p>${line.answer4}</p>`

  question.answer.splice(4, 1);

  // question.answer[4].$.fraction = line.fraction5;
  // question.answer[4].text[0] = `<p>${line.answer5}</p>`
  return question;
}
