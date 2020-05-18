"use strict";

const Persona = use("Persona");
const User = use("App/Models/User");

class UserController {
  async index() {
    return await User.all();
  }

  async getCurrentUser({ auth }) {
    const user = await auth.getUser();
    const token = await auth.getAuthHeader();
    return user;
  }

  async login({ request, auth, response }) {
    const payload = request.only(["uid", "password"]);
    const user = await Persona.verify(payload);
    return await auth.generate(user);
  }

  async logout({ auth }) {
    const user = await auth.getUser();
    const token = await auth.getAuthHeader();
    await user
      .tokens()
      .where("token", token)
      .update({ is_revoked: true });
    return user;
  }

  async register({ request, auth, response }) {
    const payload = request.only([
      "email",
      "first_name",
      "last_name",
      "password",
      "password_confirmation"
    ]);
    const { first_name, last_name } = request.all();
    payload.full_name = `${first_name} ${last_name}`;
    payload.profile_image_source = `https://ui-avatars.com/api/?name=${first_name}+${last_name}`;
    const user = await Persona.register(payload);
    return await auth.generate(user);
  }

  async show({ auth, params }) {
    const { id } = params;
    const user = await auth.getUser();
    if (user.id !== Number(id)) {
      return "You cannot see someone else's profile";
    }
    return user;
  }
}

module.exports = UserController;