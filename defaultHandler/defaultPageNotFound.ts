import { CallBackType } from "../types.ts";

export const defaultPageNotFound: CallBackType = (req, res) => {
  res.status(500).send(`<!doctype html>
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
      <h3>Attain: Page '${req.url.pathname}' not found</h3>
    </body>
  </html>`);
}