declare module "js-interpreter" {
  export default class Interpreter {
    constructor(code: string, initFunc?: (interpreter: Interpreter, globalObject: any) => void);
    appendCode(code: string): void;
    step(): boolean;
    run(): void;
    createNativeFunction(func: Function): any;
    setProperty(globalObject: any, name: string, value: any): any;
    nativeToPseudo(object: any): any;
    value: any;
  }
}