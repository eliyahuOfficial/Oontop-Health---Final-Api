import { IJWTPayload, ILogin, IUserInput } from "../@types/@types";
import User from "../db/models/user-model";
import OonTopError from "../errors/OonTopError";
import { authService } from "./auth-service";

export const usersService = {


    createUser: async (data: IUserInput) => {
        const user = new User(data);
        const hash = await authService.hashPassword(user.password);
        user.password = hash;
        return user.save();
    },

    loginUser: async ({ email, password }: ILogin) => {
        const user = await User.findOne({ email });
        if (!user) {
            throw new OonTopError(401, "Invalid email or password");
        }
        const isValid = await authService.comparePassword(password, user.password);
        if (!isValid) {
            throw new OonTopError(401, "Invalid email or password");
        }
        const payload: IJWTPayload = {
            _id: user._id.toString(),
            isAdmin: user.isAdmin,
            isBusiness: user.isBusiness,
        };
        return authService.generateJWT(payload);
    },

    getAllUsers: async () => User.find({}, { password: 0 }),

    getUserById: async (id: string) => {
        const user = await User.findById(id, { password: 0 });
        if (!user) {
            throw new OonTopError(404, "User not found");
        }
        return user;
    },

    updateUser: async (data: IUserInput, id: string) => {
        data.password = await authService.hashPassword(data.password);


        return User.findOneAndUpdate({ _id: id }, data, { new: true });
    },

    deleteUser: async (id: string) => {
        const user = await User.findByIdAndDelete(id);
        if (!user) {
            throw new OonTopError(404, "User not found");
        }
        return user;
    },
};
