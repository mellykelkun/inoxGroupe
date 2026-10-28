import assert from "node:assert/strict";
import test from "node:test";
import {
  hasInitializedPassword,
  updateActivationPassword,
} from "./activation-password.ts";

test("le mot de passe d’activation est modifié avec la session du membre", async () => {
  const calls = [];
  const result = await updateActivationPassword({
    async updateUser(attributes) {
      calls.push(attributes);
      return { error: null };
    },
  }, "Mot-de-passe-tres-solide-2026!");

  assert.deepEqual(calls, [{
    password: "Mot-de-passe-tres-solide-2026!",
    data: { inox_password_initialized: true },
  }]);
  assert.equal(result.error, null);
});

test("les anciennes activations administratives restent reconnues", () => {
  assert.equal(hasInitializedPassword({
    app_metadata: { inox_password_initialized: true },
  }), true);
  assert.equal(hasInitializedPassword({
    user_metadata: { inox_password_initialized: true },
  }), true);
  assert.equal(hasInitializedPassword({}), false);
});
