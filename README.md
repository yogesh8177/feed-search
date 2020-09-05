# Feed-search
This is a `POC` for searching and sorting feed data along with pagination

# Architecture/Component diagram
![Architecture diagram](docs/diagrams/Feed-component-diagram.svg)

# Feed class diagram
![Feed class](docs/diagrams/Feed-class.svg)

Above figure represents our `Feed` class which we will be implementing.

# Database engine (Search engine)

We have our in memory database which we will use to store mock data. Following are the features for this database engine:
1. It creates inverted index by tokenizing fields.
    1. Tokens are cleaned and lowercased.
    1. We remove `[.:]` chars to clean our tokens.
    1. We also index phrases, however we only consider a phrase consisting of utmost 4 words
    1. This engine expects that the text contains single space between words, so make sure to sanitize input.

1. Our engine is located at `$PROJECT_ROOT/database` folder.
1. You can run tests for as follows:
    1. `cd database`
    1. `npm run test`

# Nodejs Webserver

We have our webserver that will host the in memory database mentioned earlier. It will auto initialize the `mock data` and necessary `data structures` given below necessary to start querying our data.

```json
Initialized in memory db [
  'documentId',
  'documentsMap',
  'invertedIndex',
  'maxPageSize',
  'dateLastEditedIndex',
  'titleIndex'
]
```

1. Project is located at: `$PROJECT_ROOT/server.js`
1. `git clone ...`
1. Run server: `npm start`
1. Run test: `npm test`