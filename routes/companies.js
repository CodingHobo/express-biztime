"use strict";

/** Routes for /companies. */

const express = require("express");
const { NotFoundError, BadRequestError } = require("../expressError");


const router = new express.Router();
const db = require("../db");


/**Get info for all companies returns {companies: [{code, name}, ...]}*/
router.get("/", async function (req, res) {
    const result = await db.query(
        `SELECT code, name FROM companies`
    );

    return res.json({ companies: result.rows });
})

/**Get info for single company returns {company: {code, name, description}} */
router.get("/:code", async function (req, res) {
    const company_code = req.params.code;

    const result = await db.query(
        `SELECT code, name, description
        FROM companies
        WHERE code = $1`, [company_code]);

    const company = result.rows[0];

    if (!company) throw new NotFoundError(`No matching company: ${company_code}`);

    return res.json({ company });
})

/**Create new company returns {company: {code, name, description}}*/
router.post("/", async function (req, res) {
    if (req.body === undefined) throw new BadRequestError();

    const result = await db.query(
        `INSERT INTO companies (code, name, description)
        VALUES ($1, $2, $3)
        RETURNING code, name, description`,
        [req.body.code, req.body.name, req.body.description]);

        const company = result.rows[0];

    return res.status(201).json({ company });
})

/**Edit existing company returns {company: {code, name, description}}*/
router.put("/:code", async function (req, res) {
    if (req.body === undefined || "code" in req.body) {
        throw new BadRequestError("Not allowed")
    };

    const { name, description } = req.body;
    const company_code = req.params.code;

    const result = await db.query(
        `UPDATE companies
        SET name= $1,
        description= $2
        WHERE code = $3
        RETURNING code, name, description`,
        [name, description, company_code]);

    const company = result.rows[0];

    if (!company) throw new NotFoundError(`No matching company: ${company_code}`);
    return res.json({ company });
});

/**Delete a  company returns {message: "company deleted" }*/
router.delete("/:code", async function (req, res) {
    const company_code = req.params.code;
    const results = await db.query(
        `DELETE FROM companies WHERE code = $1
        RETURNING name`, [company_code]);

    const company = results.rows[0];
    console.log(results)
    if (!company) throw new NotFoundError(`No matching company: ${company_code}`);

    return res.json({ message: 'Company deleted' });
});


module.exports = router;