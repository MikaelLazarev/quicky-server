/*
 * Copyright (c) 2020. Mikhail Lazarev
 */

import {
  getModelForClass,
  modelOptions,
  pre,
  prop as Property,
  Ref
} from "@typegoose/typegoose";
import { Message } from "./message";
import { TimeStamps } from "@typegoose/typegoose/lib/defaultClasses";
import { EncryptHelper } from "../helpers/encrypt";
import { DialogFlowParams } from "./dialogFlow";

export interface UserID {
  id: string;
}

@modelOptions({
  schemaOptions: {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
})
@pre<User>("save", function() {
  if (!this.isModified("_qbToken")) return;
  this._qbToken =
    this._qbToken !== "" ? EncryptHelper.encrypt(this._qbToken) : null;
})
export class User extends TimeStamps {
  _id: string;

  @Property({ index: true })
  email: string;

  @Property()
  name: string;

  @Property()
  given_name: string;

  @Property()
  family_name: string;

  @Property({ default: "" })
  company: string;

  @Property()
  role: string;

  @Property()
  avatar_url: string;

  @Property()
  googleId: string;

  @Property()
  _qbToken: string | null;


  @Property({
    ref: "Message",
    required: true,
    foreignField: "user",
    localField: "_id"
  })
  messages: Ref<Message>[];

  get id(): string {
    //@ts-ignore
    return this._id;
  }

  toString() {
    return this._id;
  }

  getQBTokenElseThrow(): string {
    if (this._qbToken === null || this._qbToken === undefined)
      throw new Error("Invalid QB token");
    return EncryptHelper.decrypt(this._qbToken);
  }

  updateWithDFParams(params: DialogFlowParams) {
    this.company = params.company_name?.stringValue || this.company;
    if (params.user_token?.stringValue) {
      this._qbToken = params.user_token?.stringValue;
    }
  }
}

export const UserModel = getModelForClass(User);
