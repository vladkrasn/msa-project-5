import express from 'express';

const app = express();

app.get('/', async (_, res) => {
  const response = await (await fetch("http://batch-processing:8080")).text()
  res.send(`Got following response from batch service: '${response}'`);
});

app.listen(8000, () => {
  console.log(`Listening for requests on http://localhost:${8000}`);
});
