import type { ErrorCallBackType } from "../mod.ts";

export const defaultError: ErrorCallBackType = (error: Error, req, res) => {
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
        <p><strong>${error.name ? error.name : "Danger"}:</strong> ${
    error.message ? error.message : error
  }</p>
        <p>${error.stack ? error.stack : ""}</p>
      </div>
    </body>
  </html>`);
};
