export class ErrorHandling {
  onSuccess: Function = (succ: any) => {
    console.log("onSuccess", succ);
    return succ;
  };
  onError: Function = (err: any) => {
    console.error("onError", err);
    return null;
  };
}
