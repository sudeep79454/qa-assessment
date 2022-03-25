import { Get, JsonController } from "routing-controllers";
import fetch from "node-fetch";
import { V1_API_DOMAIN } from "../../constants";

@JsonController("/protected")
export default class ProtectedController {
  /**
   * This route should be accessible only by authorized users
   *
   * @returns a protected resource.
   */
  @Get()
  async getProtected() {
    const response = await fetch(`${V1_API_DOMAIN}/v1/protected`);
    return response.json();
  }
}