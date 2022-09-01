import { enableFetchMocks } from 'jest-fetch-mock';
enableFetchMocks();
import Server, { server } from "../server";
import * as supertest from "supertest";
import fetch from 'node-fetch';
import { ProtectedResourceBody } from "../server/controllers/protected";

jest.mock('node-fetch', () => jest.fn());

export const testServer = supertest(Server);
const resourceBody: ProtectedResourceBody = {
    count: 1,
    operation: "REQUEST",
    text: "text"
}
export const successMsg = {
    status: 200,
    json: () => ({
        id: 123
    })
}
export const failResponse = {
    status: 500,
    json: () => ({
    })
}

describe("ProtectedController", () => {
    let spyFetch = (fetch as any)

    beforeAll(() => {
        spyFetch = (fetch as jest.MockedFunction<typeof fetch>);
        spyFetch.mockReset().mockImplementation((endpoint, req) => {
            if (endpoint.includes("/v1/auth/validate")) {
                if (req.headers?.includes('Bearer')) {
                    return Promise.resolve({
                        status: 200
                    })
                }
                else {
                    return Promise.resolve({
                        status: 401
                    })
                }
            }
            else if (endpoint.includes("/v1/protected")) {
                if (JSON.parse(req.body).text) {
                    return Promise.resolve(successMsg)
                }
            }
            return Promise.resolve(failResponse)
        });
    });

    afterEach(() => {
        spyFetch.mockClear();
    });

    it("should return valid status with valid user request", async () => {

        const response = await (testServer.post("/v3/protected").set('Authorization', 'Bearer token').send(resourceBody));
        expect(response.status).toBe(200);
        expect(JSON.parse(response.text).id).toEqual(successMsg.json().id);
        expect(spyFetch).toBeCalledTimes(2)
    });

    it("should return unauthorized with no authorization header", async () => {
        try{
        const response = await (testServer.post("/v3/protected").send(resourceBody));
        expect(response.status).toBe(401);
        expect(spyFetch).toBeCalledTimes(1)
        } catch(err) {
            console.log(err)
        }
    });

    it("should return empty text with no body", async () => {
        const response = await (testServer.post("/v3/protected").set('Authorization', 'Bearer token'));
        expect(response.status).toBe(200);
        expect(response.text).toEqual('{}')
        expect(spyFetch).toBeCalledTimes(2)
    });

    it("should return bad request with body length more than 4096 ", async () => {
        const longResourceBody = {
            count: 1,
            operation: "REQUEST",
            text: new Array(4098).join("a")
        }
        const response = await (testServer.post("/v3/protected").set('Authorization', 'Bearer token').send(longResourceBody));
        expect(response.status).toBe(400);
        expect(spyFetch).toBeCalledTimes(1)
    });
})

afterAll(() => {
    server.close();
})