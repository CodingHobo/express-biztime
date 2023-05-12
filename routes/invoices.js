"use strict";

/** Routes for /companies. */

const express = require("express");
const { NotFoundError, BadRequestError } = require("../expressError");

const router = new express.Router();
const db = require("../db");

/**GET all invoice returns {invoices: [{id, comp_code}, ...]}  */

router.get("/", async function (req, res) {
  const results = await db.query(`SELECT id, comp_code FROM invoices`);

  return res.json({ invoice: results.rows });
});

/**GET invoice and company returns
 * {invoice: {
 * id,
 * amt,
 * paid,
 * add_date,
 * paid_date,
 * company: {code, name, description}
 * } */

router.get("/:id", async function (req, res) {
  const id = req.params.id;

  const iResults = await db.query(
    `SELECT id, amt, paid, add_date, paid_date, comp_code
        FROM invoices
        WHERE id = $1`,
    [id]
  );

  const invoice = iResults.rows[0];

  if (!invoice) throw new NotFoundError(`No matching invoice: ${id}`);

  const cResults = await db.query(
    `SELECT code, name, description
        FROM companies
        WHERE code = $1`,
    [invoice.comp_code]
  );

  const company = cResults.rows;

  invoice.company = company;
  delete invoice.comp_code;

  return res.json({ invoice });
});
//TODO: format docstring
/**POST add invoice returns {invoice: {id, comp_code, amt, paid, add_date,
 * paid_date}} */

router.post("/", async function (req, res) {
  const { comp_code, amt } = req.body;

  const results = await db.query(
    `INSERT INTO invoices (comp_code, amt)
        VALUES ($1, $2)
        RETURNING id, comp_code, amt, paid, add_date, paid_date`,
    [comp_code, amt]
  );

  const invoice = results.rows[0];

  //TODO: add 201 status code
  return res.json({ invoice });
});

/**PUT update invoice returns {invoice: {id, comp_code, amt, paid, add_date,
 * paid_date}} */

router.put("/:id", async function (req, res) {
  if (req.body === undefined || "id" in req.body) {
    throw new BadRequestError("Not allowed");
  }

  const { amt } = req.body;

  const invoice_id = req.params.id;

  const results = await db.query(
    `UPDATE invoices
        SET amt = $1
        WHERE id = $2
        RETURNING id, comp_code, amt, paid, add_date, paid_date`,
    [amt, invoice_id]
  );
  const invoice = results.rows[0];

  if (!invoice) throw new NotFoundError(`No matching invoice: ${invoice_id}`);

  return res.json({ invoice });
});

/**Delete an invoice  returns {message: "invoice deleted" }*/

router.delete("/:id", async function (req, res) {
  const invoice_id = req.params.id;

  const results = await db.query(
    `DELETE FROM invoices WHERE id = $1
        RETURNING id`,
    [invoice_id]
  );
  const invoice = results.rows[0];

  if (!invoice) throw new NotFoundError(`No matching invoice: ${invoice_id}`);

  return res.json({ message: "Invoice deleted" });
});

module.exports = router;
