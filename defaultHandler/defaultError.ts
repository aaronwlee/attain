import { ErrorCallBackType } from "../types.ts";

export const defaultError: ErrorCallBackType = (error, req, res) => {
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
      <h3 style="color: red">Unhandled Critical Error!</h3>
      <p>${error}</p>
    </body>
  </html>`);
}