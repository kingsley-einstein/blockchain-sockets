import fs from "fs";
import path from "path";
import { Tokenizer } from "./tokens";

export class FS {
 private static dir(dir: string) {
  if (!fs.existsSync(path.join(__dirname, dir)))
   fs.mkdirSync(path.join(__dirname, dir));

  return path.join(__dirname, dir);
 }

 static fileWrite(file: string, content: any) {
  fs.writeFileSync(FS.dir("../../storage") + "/" + file, Tokenizer.sign(content));
  return fs.readFileSync(FS.dir("../../storage") + "/" + file).toString();
 }

 static fileRead(file: string) {
  return Tokenizer.decode(fs.readFileSync(FS.dir("../../storage") + "/" + file).toString());
 }

 static fileExists(file: string) {
  return fs.existsSync(FS.dir("../../storage") + "/" + file);
 }
}
