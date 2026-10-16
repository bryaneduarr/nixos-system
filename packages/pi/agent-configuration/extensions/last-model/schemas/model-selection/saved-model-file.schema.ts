import { Type } from "typebox";

export const SavedModelFileSchema = Type.Object({
  provider: Type.String({ minLength: 1, description: "Provider identifier of the saved model." }),
  id: Type.String({ minLength: 1, description: "Model identifier within the provider." }),
});
