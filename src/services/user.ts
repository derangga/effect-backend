import { Effect, Option } from "effect";
import { UserRepository } from "../repositories/users-repo";
import { UserId, UserPublic } from "../models/users";
import { UserNotFound } from "../errors";

export class User extends Effect.Service<User>()("services/User", {
  effect: Effect.gen(function* () {
    const userRepo = yield* UserRepository;
    const getProfile = (userId: UserId) =>
      Effect.gen(function* () {
        const result = yield* userRepo.findById(userId);
        const user = Option.getOrNull(result);

        if (!user) {
          return yield* new UserNotFound({ message: "User not found" });
        }

        return UserPublic.make({
          id: user.id,
          name: user.name,
          email: user.email,
          created_at: user.created_at,
          updated_at: user.updated_at,
        });
      });
    return {
      getProfile,
    };
  }),
  dependencies: [UserRepository.Default],
}) {}
