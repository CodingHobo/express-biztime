const request = require("supertest");
const app = require("../app");
const db = require("../db");

let testInvoice;

beforeEach(async function () {
  await db.query("DELETE FROM invoices");
  const results = await db.query(
    `INSERT INTO invoices (comp_code, amt)
         VALUES ('apple', '800.00')
         RETURNING id, comp_code, amt, paid, add_date, paid_date`
  );
  testInvoice = results.rows[0];
});

afterAll(async function () {
  await db.end();
});
