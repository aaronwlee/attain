import { CallBackType } from "../types.ts";

export const defaultPageNotFound: CallBackType = (req, res) => {
  res.status(404).send(`<!doctype html>
  <head>
    <link href="https://fonts.googleapis.com/css2?family=Roboto&display=swap" rel="stylesheet">
    <style>
    * {
      font-family: 'Roboto', sans-serif;
    }
    .info {
      background-color: #e7f3fe;
      border-left: 6px solid #2196F3;
    }
    div {
      margin-bottom: 15px;
      padding: 4px 12px;
    }
    </style>
  </head>
  <html lang="en">
    <body>
      <div class="info">
        <p><strong>Sorry</strong>: '${req.url.pathname}' page not found</p>
      </div>
    </body>
  </html>`);
};
