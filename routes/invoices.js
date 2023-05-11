"use strict";

/** Routes for /companies. */

const express = require("express");
const { NotFoundError, BadRequestError } = require("../expressError");

const router = new express.Router();
const db = require("../db");

/**GET all invoice returns {invoices: [{id, comp_code}, ...]}  */

router.get("/", async function (req, res) {
    const results = await db.query(
        `SELECT id, comp_code FROM invoices`
    );

    return res.json({ invoice: results.rows });
});

/**GET a invoice and company returns {invoice: {id, amt, paid, add_date, 
 * paid_date, company: {code, name, description}} */

router.get("/:id", async function (req, res) {

    const id = req.params.id;
    const iResults = await db.query(
        `SELECT id, amt, paid, add_date, paid_date, comp_code 
        FROM invoices
        WHERE id = $1`, [id]);

    const invoice = iResults.rows[0];

    if (!invoice) throw new NotFoundError(`No matching invoice: ${id}`);

    const cResults = await db.query(
        `SELECT code, name, description 
        FROM companies
        WHERE code = $1`, [invoice.comp_code]
    );

    const company = cResults.rows;
    
    invoice.company = company;
    delete invoice.comp_code;

    return res.json({ invoice });
})

/**POST add invoice returns {invoice: {id, comp_code, amt, paid, add_date, 
 * paid_date}} */

router.post("/", async function (req, res) {

    const { comp_code, amt } = req.body;

    const results = await db.query(
        `INSERT INTO companies (comp_code, amt)
        VALUES ($1, $2)
        RETURNING id, comp_code, amt, paid, add_date, paid_date`, [comp_code, amt]);

    const invoice = results.rows[0]

    return res.json({ invoice });
})



module.exports = router;