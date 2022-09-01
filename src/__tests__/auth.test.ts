import { enableFetchMocks } from 'jest-fetch-mock';
enableFetchMocks();
import Server, { server } from "../server";
import * as supertest from "supertest";
import { LoginRequest } from "../server/controllers/auth";
import fetch from 'node-fetch';

jest.mock('node-fetch', () => jest.fn());

export const testServer = supertest(Server);
const loginRequest: LoginRequest = {
    password: "",
    username: ""
}
export const successResponse = {
    status: 200,
    json: () => ({
        id: 123,
        name: "hello",
        token: "token"
    })
}
export const failResponse = {
    status: 500,
    json: () => ({
    })
}

describe("AuthController", () => {
    let spyFetch = (fetch as any)

    beforeAll(() => {
        spyFetch = (fetch as jest.MockedFunction<typeof fetch>);
    });

    afterEach(() => {
        spyFetch.mockClear();
    });

    it("should return true authorized with valid credentials", async () => {
        spyFetch.mockReset().mockImplementation(() => Promise.resolve(successResponse));
        const response = await (testServer.post("/v3/auth/login").send(loginRequest));
        expect(response.status).toBe(200);
        expect(JSON.parse(response.text).token).toEqual(successResponse.json().token);
        expect(JSON.parse(response.text).authorized).toBeTruthy();
    });

    it("should return false authorized with valid credentials", async () => {
        spyFetch.mockReset().mockImplementation(() => Promise.resolve(failResponse));
        const response = await (testServer.post("/v3/auth/login").send(loginRequest));
        expect(response.status).toBe(200);
        expect(JSON.parse(response.text).authorized).toBeFalsy();
    });
})

afterAll(() => {
    server.close();
})