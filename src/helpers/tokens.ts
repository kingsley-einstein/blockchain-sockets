import jwt from "jsonwebtoken";

export class Tokenizer {
 static sign(payload: any) {
  return jwt.sign(payload, "gobble");
 }

 static decode(t: string) {
  return jwt.decode(t);
 }
}
