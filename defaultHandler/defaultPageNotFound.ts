import { CallBackType } from "../types.ts";

export const defaultPageNotFound: CallBackType = (req, res) => {
  res.status(404).send(`<!doctype html>
  <head>
    <link href="https://fonts.googleapis.com/css2?family=Roboto&display=swap" rel="stylesheet">
    <style>
    * {
      font-family: 'Roboto', sans-serif;
    }
    .warning {
      background-color: #ffffcc;
      border-left: 6px solid #ffeb3b;
    }
    div {
      margin-bottom: 15px;
      padding: 4px 12px;
    }
    </style>
  </head>
  <html lang="en">
    <body>
      <div class="warning">
        <p><strong>Sorry!</strong>: '${req.url.pathname}' page not found</p>
      </div>
    </body>
  </html>`);
}