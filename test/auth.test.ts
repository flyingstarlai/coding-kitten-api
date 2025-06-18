import { describe, it, expect} from "bun:test"
import app from "../src";
import {logger} from "../src/middleware/logger";

describe("POST /auth/register", () => {
    it('should reject register a new user if request is invalid', async () => {

        const response = await app.request("/auth/register", {
            method: 'POST',
            body: JSON.stringify({
                email: "",
                password: "",
                name: ""
            })
        })

        const body = await response.json()
         logger.debug(JSON.stringify(body, null, 2))

        expect(response.status).toBe(400)
        expect(body.error).toBeDefined()

    })

    it('should reject register new user if username already exists', async () => {

    })

    it("should register a new user", async () => {

    })
})