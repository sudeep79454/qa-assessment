import { enableFetchMocks } from 'jest-fetch-mock';
enableFetchMocks();
import { HELLO_RESPONSE } from "../constants";
import Server, { server } from "../server";
import * as supertest from "supertest";
import HomeController from "../server/controllers/home";
import ProtectedController from "../server/controllers/protected";
import AuthController from "../server/controllers/auth";

export const testServer = supertest(Server);

describe("Server", () => {
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
          }
          return Promise.resolve({})
      });
  });

  it("Homepage controller constructs", () => {
    expect(()=>new HomeController()).not.toThrow();
  })
  it("Auth controller constructs", () => {
    expect(()=>new AuthController()).not.toThrow();
  })
  it("Protected controller constructs", () => {
    expect(()=>new ProtectedController()).not.toThrow();
  })
  it("Serves homepage", async () => {
    const response = await testServer.get("/v3/hello").set('Authorization', 'Bearer a');
    expect(response.status).toBe(200);
    expect(response.text).toEqual(JSON.stringify(HELLO_RESPONSE));
  });
})

afterAll(() => {
  server.close();
})