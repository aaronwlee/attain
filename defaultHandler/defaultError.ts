import { ErrorCallBackType } from "../types.ts";

export const defaultError: ErrorCallBackType = (error, req, res) => {
  res.status(500).send(`<!doctype html>
  <head>
    <link href="https://fonts.googleapis.com/css2?family=Roboto&display=swap" rel="stylesheet">
    <style>
    * {
      font-family: 'Roboto', sans-serif;
    }
    .danger {
      background-color: #ffdddd;
      border-left: 6px solid #f44336;
    }
    div {
      margin-bottom: 15px;
      padding: 4px 12px;
    }
    </style>
  </head>
  <html lang="en">
    <body>
      <div class="danger">
        <p><strong>Danger!</strong> ${error}</p>
      </div>
    </body>
  </html>`);
}