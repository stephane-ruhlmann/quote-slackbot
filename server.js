const url = require("url");
const parseXML = require("xml2js").parseString;
const express = require("express");
const bodyParser = require("body-parser");
const request = require("superagent");
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended : true}));

function getRandomQuoteUrl() {
  return url.format({
    pathname : "http://www.stands4.com/services/v2/quotes.php",
    query : {
      uid : process.env.STANDS4_UID,
      tokenid : process.env.STANDS4_TOKEN
    }
  });
}

function parseXMLQuote(xml, cb) {
  parseXML(xml, (err, parsed) => {
    if (err) return cb(err);
    cb(null, formatQuote(parsed));
  });
}

function formatQuote(parsedQuote) {
  const quote = parsedQuote.results.result[0].quote[0];
  const author = parsedQuote.results.result[0].author[0];
  return '"' + quote + '" ' + author;
}

function getRandomQuote(cb) {
  const quoteUrl = getRandomQuoteUrl();
  request
    .get(quoteUrl)
    .end((err, res) => {
      if (err) return cb(err);
      parseXMLQuote(res.text, cb);
    });
}

app.get("/", (req, res) => res.send("Hello, I'm a slack bot :)"));

app.get("/quote", (req, res) => {
  getRandomQuote((err, quote) => {
    if(err) return res.send(err);
    res.send(quote);
  });
});

app.listen(process.env.PORT || 1310);

