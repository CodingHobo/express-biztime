"use strict";

/** Routes for /items. */

const express = require("express");
const { db } = require("./db");
const router = new express.Router();
const { NotFoundError, BadRequestError } = require("../expressError");

router.get("/", async function (req, res) {
    const result = await db.query(
        `SELECT code, name FROM companies`
    );

    return res.json({ companies: result.rows });
})

router.get("/:code", async function (req, res) {

    const result = await db.query(
        `SELECT code, name, description 
        FROM companies
        WHERE code = $1`, [req.params.code]);

    const company = result.rows[0];

    if (!company) throw new NotFoundError(`No matching company: ${id}`);
    return res.json({ company: company });
})

router.post("/", async function (req, res) {
    if (req.body === undefined) throw new BadRequestError();

    const result = await db.query(
        `INSERT INTO companies (code, name, description)
        VALUES ($1, $2, $3)
        RETURNING code, name, description`,
        [req.body.code, req.body.name, req.body.description]);

    const company = result.rows[0];

    return res.status(201).json({ company: company });
})

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

    return res.json({ company: company });
})