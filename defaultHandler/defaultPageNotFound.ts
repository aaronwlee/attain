import { CallBackType } from "../types.ts";

export const defaultPageNotFound: CallBackType = (req, res) => {
  res.status(404).send(`<!doctype html>
  <head>
    <link href="https://fonts.googleapis.com/css2?family=Roboto&display=swap" rel="stylesheet">
    <style>
    * {
      font-family: 'Roboto', sans-serif;
    }
    </style>
  </head>
  <html lang="en">
    <body>
      <p>Page '${req.url.pathname}' not found</p>
    </body>
  </html>`);
}