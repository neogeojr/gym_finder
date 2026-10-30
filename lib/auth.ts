import jwt from "jsonwebtoken";
import type { NextRequest } from "next/server";
import type { HydratedDocument } from "mongoose";
import User, { type IUser } from "@/models/User";
import type { Role } from "@/types";
import { errorMessage } from "@/lib/errors";

export const getDataFromToken = (request: NextRequest): string => {
  try {
    const token = request.cookies.get("token")?.value || "";
    const decodedToken = jwt.verify(
      token,
      process.env.JWT_SECRET as string,
    ) as jwt.JwtPayload;
    return decodedToken.id;
  } catch (error) {
    throw new Error(errorMessage(error));
  }
};

type UserDoc = HydratedDocument<IUser>;

export const getUser = async (
  request: NextRequest,
): Promise<UserDoc | null> => {
  try {
    const userId = getDataFromToken(request);
    return await User.findById(userId).select("-password");
  } catch {
    return null;
  }
};

type RoleCheck =
  | { ok: true; user: UserDoc; error?: undefined; status?: undefined }
  | { ok: false; user?: undefined; error: string; status: number };

export const requireRole = async (
  request: NextRequest,
  roles: Role[],
): Promise<RoleCheck> => {
  const user = await getUser(request);
  if (!user) return { ok: false, error: "Please log in.", status: 401 };
  if (!roles.includes(user.role))
    return { ok: false, error: "Not allowed.", status: 403 };
  return { ok: true, user };
};
